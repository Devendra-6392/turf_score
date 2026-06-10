const prisma = require('../config/db');
const { sendChallengeAcceptedEmail } = require('../utils/emailService');
const { sendPushNotification } = require('../utils/pushHelper');

console.log('Prisma client loaded:', prisma ? 'YES' : 'NO');

// ─── CREATE CHALLENGE ─────────────────────────────────────────────
const createChallenge = async (req, res) => {
  try {
    if (!prisma || !prisma.challenge) {
      console.error('Prisma or prisma.challenge is not available');
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const { title, description, sportType, type, challengerTeamId, turfId, slotId,
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
        slotId: slotId || null,
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

    await prisma.notification.create({
      data: {
        userId: req.userId,
        title: 'Challenge Created! 🚀',
        body: `Your challenge "${title}" is now live! Share the link or wait for someone to accept it.`,
        type: 'CHALLENGE_CREATED',
        data: { challengeId: challenge.id, shareCode: challenge.shareCode },
        sentAt: new Date()
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
      OR: [
        { expiresAt: { gt: new Date() } },
        { expiresAt: null }
      ]
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
    const challenge = await prisma.challenge.findUnique({ 
      where: { id: req.params.id },
      include: { creator: true }
    });

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

    await prisma.notification.create({
      data: {
        userId: challenge.creatorId,
        title: 'Challenge Accepted! 🔥',
        body: `Someone accepted your challenge "${challenge.title}". Pay your advance to confirm the match!`,
        type: 'CHALLENGE_ACCEPTED',
        data: { challengeId: challenge.id },
        sentAt: new Date()
      }
    });

    // Send Push Notification to Creator
    if (challenge.creator && challenge.creator.expoPushToken) {
      sendPushNotification(
        challenge.creator.expoPushToken,
        'Challenge Accepted! 🔥',
        `Someone accepted your challenge "${challenge.title}". Pay your advance to confirm the match!`,
        { challengeId: challenge.id, type: 'CHALLENGE_ACCEPTED' }
      );
    }

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

// ─── LOCK SLOT ─────────────────────────────────────────────
const lockSlot = async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await prisma.turfSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.status !== 'AVAILABLE') return res.status(400).json({ error: 'Slot is not available' });

    const updatedSlot = await prisma.turfSlot.update({
      where: { id: slotId },
      data: { status: 'ON_HOLD' }
    });

    res.json(updatedSlot);
  } catch (err) {
    console.error('lockSlot:', err);
    res.status(500).json({ error: 'Failed to lock slot' });
  }
};

// ─── PAY ADVANCE ─────────────────────────────────────────────
const payAdvance = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, include: { slot: true } });
    
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    let dataToUpdate = {};
    if (req.userId === challenge.creatorId) dataToUpdate.creatorPaid = true;
    else if (req.userId === challenge.opponentId) dataToUpdate.opponentPaid = true;
    else return res.status(403).json({ error: 'Not part of this challenge' });

    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: dataToUpdate
    });

    // If both paid, confirm booking OR refund creator if booking already exists
    if (updatedChallenge.creatorPaid && updatedChallenge.opponentPaid && challenge.slotId) {
      const amount = challenge.slot ? challenge.slot.price : 1000;
      
      if (challenge.slot && challenge.slot.status === 'BOOKED') {
        // The slot is already booked (created via booking flow).
        // Refund half to creator.
        const halfAmount = amount / 2;
        const creator = await prisma.user.findUnique({ where: { id: challenge.creatorId } });
        const opponent = await prisma.user.findUnique({ where: { id: challenge.opponentId } });
        
        await prisma.wallet.upsert({
          where: { userId: challenge.creatorId },
          update: {
            balance: { increment: halfAmount },
            transactions: {
              create: {
                amount: halfAmount,
                type: 'CASHBACK',
                description: `Half payment received for challenge ${challenge.id}`,
                status: 'COMPLETED'
              }
            }
          },
          create: {
            userId: challenge.creatorId,
            balance: halfAmount,
            transactions: {
              create: {
                amount: halfAmount,
                type: 'CASHBACK',
                description: `Half payment received for challenge ${challenge.id}`,
                status: 'COMPLETED'
              }
            }
          }
        });

        if (creator && creator.email) {
          sendChallengeAcceptedEmail(creator.email, opponent?.name || 'An opponent', {
            title: challenge.title,
            turfName: challenge.turf?.name || 'Turf',
            cashbackAmount: halfAmount
          });
        }
      } else {
        // Create new booking if it wasn't booked before
        await prisma.booking.create({
          data: {
            userId: challenge.creatorId,
            turfId: challenge.turfId,
            slotId: challenge.slotId,
            challengeId: challenge.id,
            amount: amount,
            status: 'CONFIRMED'
          }
        });
        await prisma.turfSlot.update({
          where: { id: challenge.slotId },
          data: { status: 'BOOKED' }
        });
      }
    }

    res.json(updatedChallenge);
  } catch (err) {
    console.error('payAdvance:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// ─── SUBMIT RESULT ─────────────────────────────────────────────
const submitResult = async (req, res) => {
  try {
    const { challengeId, creatorScore, opponentScore } = req.body;
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    if (challenge.status === 'COMPLETED') return res.status(400).json({ error: 'Challenge already completed' });
    
    let winnerId = null;
    if (creatorScore > opponentScore) winnerId = challenge.creatorId;
    else if (opponentScore > creatorScore) winnerId = challenge.opponentId;

    const updated = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        creatorScore,
        opponentScore,
        winnerId,
        status: 'COMPLETED'
      }
    });

    await prisma.user.updateMany({
      where: { id: { in: [challenge.creatorId, challenge.opponentId].filter(Boolean) } },
      data: {
        matchesPlayed: { increment: 1 },
        xp: { increment: 50 }
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('submitResult:', err);
    res.status(500).json({ error: 'Failed to submit result' });
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
  lockSlot,
  payAdvance,
  submitResult,
};
