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
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating LFP request:', error);
    res.status(500).json({ error: 'Server error creating request' });
  }
};

// Join a request
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
    if (alreadyJoined) return res.status(400).json({ error: 'You have already joined this request' });

    // Add player to the request
    await prisma.playerRequestJoin.create({
      data: {
        playerRequestId: id,
        userId: userId
      }
    });

    // Check if full after joining
    const currentJoinedCount = request.joinedPlayers.length + 1;
    let newStatus = 'OPEN';
    
    if (currentJoinedCount >= request.playersNeeded) {
      newStatus = 'FULL';
      await prisma.playerRequest.update({
        where: { id },
        data: { status: 'FULL' }
      });
    }

    // Send push notification to creator
    if (request.creator.expoPushToken) {
      // Find joiner name
      const joiner = await prisma.user.findUnique({ where: { id: userId } });
      await sendPushNotification(
        request.creator.expoPushToken,
        'Someone joined your game! 🏃‍♂️',
        `${joiner ? joiner.name : 'A player'} has joined your ${request.sport} request at ${request.location}.`,
        { type: 'LFP_JOIN', requestId: id }
      );
    }

    res.json({ message: 'Successfully joined', status: newStatus });
  } catch (error) {
    console.error('Error joining LFP request:', error);
    res.status(500).json({ error: 'Server error joining request' });
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
    const request = await prisma.playerRequest.findUnique({ where: { id } });
    if (request.status === 'FULL') {
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
