const prisma = require('../config/db');

console.log('Prisma client loaded:', prisma ? 'YES' : 'NO');

// ─── CREATE CHALLENGE ─────────────────────────────────────────────
const createChallenge = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { title, description, sportType, type, challengerTeamId, turfId,
      scheduledDate, scheduledTime, skillLevel, maxPlayers, message, isPublic } = req.body;

    if (!title || !sportType || !type) {
      return res.status(400).json({ error: 'title, sportType and type are required' });
    }

    // If team challenge, verify team belongs to creator
    if (type === 'TEAM' && challengerTeamId) {
      const team = await prisma.team.findFirst({ where: { id: challengerTeamId, captainId: req.userId } });
      if (!team) return res.status(403).json({ error: 'You are not the captain of this team' });
    }

    // Set expiry 7 days from now
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const challenge = await prisma.challenge.create({
      data: {
        title, description, sportType, type,
        creatorId: req.userId,
        challengerTeamId: type === 'TEAM' ? challengerTeamId : null,
        turfId: turfId || null,
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        skillLevel: skillLevel || 'ALL',
        maxPlayers: maxPlayers || 10,
        message: message || null,
        isPublic: isPublic !== false,
        expiresAt,
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true, rating: true } },
        challengerTeam: { select: { id: true, name: true, sportType: true } },
        turf: { select: { id: true, name: true, location: true, city: true, imageUrl: true } },
      }
    });

    res.status(201).json(challenge);
  } catch (err) {
    console.error('createChallenge:', err);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

// ─── LIST OPEN CHALLENGES (Public Feed) ──────────────────────────
const listChallenges = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { sport, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'OPEN',
      isPublic: true,
      expiresAt: { gt: new Date() },
    };
    if (sport) where.sportType = sport;
    if (type) where.type = type;

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, avatar: true, rating: true } },
          challengerTeam: { select: { id: true, name: true } },
          turf: { select: { id: true, name: true, city: true, imageUrl: true } },
        }
      }),
      prisma.challenge.count({ where }),
    ]);

    res.json({ challenges, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('listChallenges:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

// ─── MY CHALLENGES ────────────────────────────────────────────────
const myChallenges = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [{ creatorId: req.userId }, { opponentId: req.userId }]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        opponent: { select: { id: true, name: true, avatar: true } },
        challengerTeam: { select: { id: true, name: true } },
        opponentTeam: { select: { id: true, name: true } },
        turf: { select: { id: true, name: true, city: true, imageUrl: true } },
      }
    });
    res.json(challenges);
  } catch (err) {
    console.error('myChallenges:', err);
    res.status(500).json({ error: 'Failed to fetch your challenges' });
  }
};

// ─── GET CHALLENGE BY ID ──────────────────────────────────────────
const getChallengeById = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, name: true, avatar: true, rating: true, matchesPlayed: true } },
        opponent: { select: { id: true, name: true, avatar: true, rating: true } },
        challengerTeam: { include: { members: { include: { user: { select: { id: true, name: true, avatar: true } } } } } },
        opponentTeam: { include: { members: { include: { user: { select: { id: true, name: true, avatar: true } } } } } },
        turf: true,
      }
    });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json(challenge);
  } catch (err) {
    console.error('getChallengeById:', err);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

// ─── GET CHALLENGE BY SHARE CODE ─────────────────────────────────
const getChallengeByShareCode = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { shareCode: req.params.shareCode },
      include: {
        creator: { select: { id: true, name: true, avatar: true, rating: true, matchesPlayed: true } },
        challengerTeam: { select: { id: true, name: true, sportType: true } },
        turf: { select: { id: true, name: true, location: true, city: true, imageUrl: true } },
      }
    });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found or link is invalid' });
    res.json(challenge);
  } catch (err) {
    console.error('getChallengeByShareCode:', err);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

// ─── ACCEPT CHALLENGE ─────────────────────────────────────────────
const acceptChallenge = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { opponentTeamId } = req.body;
    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (challenge.status !== 'OPEN') return res.status(400).json({ error: 'Challenge is no longer open' });
    if (challenge.creatorId === req.userId) return res.status(400).json({ error: 'You cannot accept your own challenge' });

    // If team challenge, verify opponent team
    if (challenge.type === 'TEAM' && opponentTeamId) {
      const team = await prisma.team.findFirst({ where: { id: opponentTeamId, captainId: req.userId } });
      if (!team) return res.status(403).json({ error: 'You are not the captain of this team' });
    }

    const updated = await prisma.challenge.update({
      where: { id: req.params.id },
      data: {
        status: 'ACCEPTED',
        opponentId: req.userId,
        opponentTeamId: challenge.type === 'TEAM' ? (opponentTeamId || null) : null,
        acceptedAt: new Date(),
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        opponent: { select: { id: true, name: true, avatar: true } },
        turf: { select: { id: true, name: true, city: true, imageUrl: true } },
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('acceptChallenge:', err);
    res.status(500).json({ error: 'Failed to accept challenge' });
  }
};

// ─── CANCEL CHALLENGE ─────────────────────────────────────────────
const cancelChallenge = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (challenge.creatorId !== req.userId) return res.status(403).json({ error: 'Only creator can cancel' });
    if (['COMPLETED', 'CANCELLED'].includes(challenge.status)) {
      return res.status(400).json({ error: 'Challenge already ended' });
    }

    const updated = await prisma.challenge.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json(updated);
  } catch (err) {
    console.error('cancelChallenge:', err);
    res.status(500).json({ error: 'Failed to cancel challenge' });
  }
};

module.exports = {
  createChallenge,
  listChallenges,
  myChallenges,
  getChallengeById,
  getChallengeByShareCode,
  acceptChallenge,
  cancelChallenge,
};
