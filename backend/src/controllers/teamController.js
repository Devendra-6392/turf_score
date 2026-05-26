const prisma = require('../config/db');

const ALLOWED_TEAM_SPORTS = ['CRICKET', 'TENNIS', 'BASKETBALL'];
const MAX_TEAM_MEMBERS = 8;

const teamInclude = {
  captain: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' }
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: teamInclude,
      orderBy: { updatedAt: 'desc' }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load teams' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, sportType, memberEmails = [] } = req.body;
    const normalizedSport = String(sportType || '').toUpperCase();
    if (!name?.trim() || !ALLOWED_TEAM_SPORTS.includes(normalizedSport)) {
      return res.status(400).json({ error: 'Team name and a supported sport are required' });
    }

    const captain = await prisma.user.findUnique({ where: { id: req.userId } });
    const emails = [...new Set(memberEmails.map((email) => String(email).trim().toLowerCase()).filter(Boolean))]
      .filter((email) => email !== captain.email.toLowerCase());
    if (emails.length + 1 > MAX_TEAM_MEMBERS) {
      return res.status(400).json({ error: 'A team can contain a maximum of 8 players including the captain' });
    }

    const invitedUsers = await prisma.user.findMany({ where: { email: { in: emails } } });
    const foundEmails = new Set(invitedUsers.map((user) => user.email.toLowerCase()));
    const missingEmails = emails.filter((email) => !foundEmails.has(email));
    if (missingEmails.length) {
      return res.status(400).json({ error: `These players must register first: ${missingEmails.join(', ')}` });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        sportType: normalizedSport,
        captainId: req.userId,
        members: {
          create: [
            { userId: req.userId, role: 'CAPTAIN' },
            ...invitedUsers.map((user) => ({ userId: user.id, role: 'PLAYER' }))
          ]
        }
      },
      include: teamInclude
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const email = String(req.body.email || '').trim().toLowerCase();
    const team = await prisma.team.findFirst({
      where: { id: teamId, captainId: req.userId },
      include: { members: true }
    });
    if (!team) return res.status(404).json({ error: 'Only the team captain can add players' });
    if (team.members.length >= MAX_TEAM_MEMBERS) return res.status(400).json({ error: 'This team already has 8 players' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Player must register before being added to a team' });
    await prisma.teamMember.create({ data: { teamId, userId: user.id } });
    const updatedTeam = await prisma.team.findUnique({ where: { id: teamId }, include: teamInclude });
    res.json(updatedTeam);
  } catch (error) {
    res.status(error.code === 'P2002' ? 400 : 500).json({ error: error.code === 'P2002' ? 'This player is already in the team' : 'Failed to add player' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const team = await prisma.team.findFirst({ where: { id: teamId, captainId: req.userId } });
    if (!team) return res.status(404).json({ error: 'Only the team captain can remove players' });
    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.teamId !== teamId || member.userId === req.userId) {
      return res.status(400).json({ error: 'The captain cannot be removed from their team' });
    }
    await prisma.teamMember.delete({ where: { id: memberId } });
    res.json({ message: 'Player removed from team' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove player' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await prisma.team.findFirst({ where: { id: req.params.teamId, captainId: req.userId } });
    if (!team) return res.status(404).json({ error: 'Only the team captain can delete this team' });
    await prisma.team.delete({ where: { id: team.id } });
    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};
