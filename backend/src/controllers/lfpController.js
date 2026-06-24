const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendPushNotification } = require('../utils/pushHelper');

// Get all open LFP requests
exports.getLfpRequests = async (req, res) => {
  try {
    const { status = 'OPEN' } = req.query;
    
    // Fetch the current user to know their gender
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { gender: true }
    });
    
    const userGender = currentUser?.gender || 'UNKNOWN';

    const requests = await prisma.playerRequest.findMany({
      where: {
        status,
        date: {
          gte: new Date() // Only show future/today requests
        },
        OR: [
          { preferredGender: 'ANY' },
          { preferredGender: userGender }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, rating: true, expoPushToken: true }
        },
        joinedPlayers: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching LFP requests:', error);
    res.status(500).json({ error: 'Server error fetching requests' });
  }
};

// Create a new LFP request
exports.createLfpRequest = async (req, res) => {
  try {
    const { sport, playersNeeded, date, location, description, preferredGender = 'ANY' } = req.body;
    
    const newRequest = await prisma.playerRequest.create({
      data: {
        creatorId: req.userId,
        sport,
        playersNeeded: parseInt(playersNeeded),
        date: new Date(date),
        location,
        description,
        preferredGender
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true, rating: true } },
        joinedPlayers: true
      }
    });

    // Handle Gender-specific Push Notifications
    let targetUsers = [];
    if (preferredGender === 'Female' || preferredGender === 'Girls') {
      targetUsers = await prisma.user.findMany({
        where: {
          gender: { in: ['Female', 'female', 'Girls', 'girls', 'Girl', 'girl'] },
          expoPushToken: { not: null },
          id: { not: req.userId } // Don't notify creator
        },
        select: { expoPushToken: true }
      });
    } else if (preferredGender === 'Male' || preferredGender === 'Boys') {
      targetUsers = await prisma.user.findMany({
        where: {
          gender: { in: ['Male', 'male', 'Boys', 'boys', 'Boy', 'boy'] },
          expoPushToken: { not: null },
          id: { not: req.userId }
        },
        select: { expoPushToken: true }
      });
    } else {
      // ANY gender
      targetUsers = await prisma.user.findMany({
        where: {
          expoPushToken: { not: null },
          id: { not: req.userId }
        },
        select: { expoPushToken: true }
      });
    }

    if (targetUsers.length > 0) {
      const tokens = targetUsers.map(u => u.expoPushToken);
      // Send notifications
      for (const token of tokens) {
         sendPushNotification(
          token,
          'New Game Alert! ⚽',
          `A new ${sport} game is looking for players at ${location}.`,
          { type: 'LFP_NEW', requestId: newRequest.id }
        ).catch(err => console.error("Push Error", err));
      }
    }
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating LFP request:', error);
    res.status(500).json({ error: 'Server error creating request' });
  }
};

// Join a request (Express Interest)
exports.joinLfpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const request = await prisma.playerRequest.findUnique({
      where: { id },
      include: { 
        joinedPlayers: true,
        creator: true 
      }
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'OPEN') return res.status(400).json({ error: 'This request is no longer open' });
    if (request.creatorId === userId) return res.status(400).json({ error: 'You cannot join your own request' });

    // Check if already joined
    const alreadyJoined = request.joinedPlayers.some(jp => jp.userId === userId);
    if (alreadyJoined) return res.status(400).json({ error: 'You have already expressed interest' });

    // Add player to the request as PENDING
    await prisma.playerRequestJoin.create({
      data: {
        playerRequestId: id,
        userId: userId,
        status: 'PENDING'
      }
    });

    // Send push notification to creator
    if (request.creator.expoPushToken) {
      // Find joiner name
      const joiner = await prisma.user.findUnique({ where: { id: userId } });
      await sendPushNotification(
        request.creator.expoPushToken,
        'Someone is interested! 👀',
        `${joiner ? joiner.name : 'A player'} wants to join your ${request.sport} game.`,
        { type: 'LFP_INTEREST', requestId: id }
      );
    }

    res.json({ message: 'Interest expressed successfully', status: request.status });
  } catch (error) {
    console.error('Error expressing interest in LFP:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Leave a request
exports.leaveLfpRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const joinRecord = await prisma.playerRequestJoin.findUnique({
      where: {
        playerRequestId_userId: {
          playerRequestId: id,
          userId: userId
        }
      }
    });

    if (!joinRecord) return res.status(400).json({ error: 'You have not joined this request' });

    await prisma.playerRequestJoin.delete({
      where: { id: joinRecord.id }
    });

    // Mark as open again if it was full
    const request = await prisma.playerRequest.findUnique({ where: { id }, include: { joinedPlayers: true } });
    const acceptedCount = request.joinedPlayers.filter(jp => jp.status === 'ACCEPTED').length;
    
    if (request.status === 'FULL' && acceptedCount < request.playersNeeded) {
      await prisma.playerRequest.update({
        where: { id },
        data: { status: 'OPEN' }
      });
    }

    res.json({ message: 'Successfully left the request' });
  } catch (error) {
    console.error('Error leaving LFP request:', error);
    res.status(500).json({ error: 'Server error leaving request' });
  }
};

// Get interested players for a specific LFP
exports.getInterestedPlayers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the current user is the creator
    const request = await prisma.playerRequest.findUnique({
      where: { id }
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.creatorId !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    const interestedPlayers = await prisma.playerRequestJoin.findMany({
      where: { playerRequestId: id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, gender: true }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    res.json(interestedPlayers);
  } catch (error) {
    console.error('Error fetching interested players:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept a player
exports.acceptPlayer = async (req, res) => {
  try {
    const { id, userId } = req.params; // id = LFP id, userId = player to accept

    const request = await prisma.playerRequest.findUnique({
      where: { id },
      include: { joinedPlayers: true }
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.creatorId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    if (request.status === 'FULL') return res.status(400).json({ error: 'Request is already full' });

    // Update join status
    const joinRecord = await prisma.playerRequestJoin.update({
      where: {
        playerRequestId_userId: {
          playerRequestId: id,
          userId: userId
        }
      },
      data: { status: 'ACCEPTED' },
      include: { user: true }
    });

    // Check if full after accepting
    const acceptedCount = request.joinedPlayers.filter(jp => jp.status === 'ACCEPTED').length + 1; // +1 for the newly accepted
    
    if (acceptedCount >= request.playersNeeded) {
      await prisma.playerRequest.update({
        where: { id },
        data: { status: 'FULL' }
      });
    }

    // Send push notification to the accepted player
    if (joinRecord.user.expoPushToken) {
      await sendPushNotification(
        joinRecord.user.expoPushToken,
        'You are selected! 🎉',
        `You have been accepted to join the ${request.sport} game at ${request.location}.`,
        { type: 'LFP_ACCEPTED', requestId: id }
      );
    }

    res.json({ message: 'Player accepted successfully', joinRecord });
  } catch (error) {
    console.error('Error accepting player:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
