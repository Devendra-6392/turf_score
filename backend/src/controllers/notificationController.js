const prisma = require('../config/db');
const { sendPushNotification } = require('../utils/pushHelper');

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id, userId: req.userId }, // Ensure it belongs to user
      data: { isRead: true, readAt: new Date() },
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// ─── Admin: Send notification to a specific user ─────────────
const sendToUser = async (req, res) => {
  try {
    const { userId, title, body, type } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title and body are required' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, expoPushToken: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification record in DB
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        body,
        type: type || 'PROMOTION',
        sentAt: new Date(),
        isPushSent: !!user.expoPushToken,
      },
    });

    // Send push notification if user has a push token
    if (user.expoPushToken) {
      await sendPushNotification(
        user.expoPushToken,
        title,
        body,
        { notificationId: notification.id, type: type || 'PROMOTION' }
      );
    }

    res.status(201).json({
      message: `Notification sent to ${user.name || 'user'}`,
      notification,
      pushSent: !!user.expoPushToken,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// ─── Admin: Broadcast notification to ALL users (SUPER_ADMIN only) ───
const broadcastToAll = async (req, res) => {
  try {
    // Check role - only SUPER_ADMIN can broadcast
    if (req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Super Admins can broadcast notifications to all users' });
    }

    const { title, body, type } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    // Get all active users
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, expoPushToken: true },
    });

    if (users.length === 0) {
      return res.status(404).json({ error: 'No active users found' });
    }

    // Create notification records for all users
    const notificationData = users.map((user) => ({
      userId: user.id,
      title,
      body,
      type: type || 'PROMOTION',
      sentAt: new Date(),
      isPushSent: !!user.expoPushToken,
    }));

    await prisma.notification.createMany({ data: notificationData });

    // Send push notifications to users who have tokens
    let pushCount = 0;
    const usersWithTokens = users.filter((u) => u.expoPushToken);

    for (const user of usersWithTokens) {
      try {
        await sendPushNotification(
          user.expoPushToken,
          title,
          body,
          { type: type || 'PROMOTION', broadcast: true }
        );
        pushCount++;
      } catch (e) {
        console.error(`Failed to push to ${user.id}:`, e.message);
      }
    }

    res.status(201).json({
      message: `Broadcast sent to ${users.length} users`,
      totalUsers: users.length,
      pushNotificationsSent: pushCount,
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};

// ─── Admin: Get sent notification history ────────────────────
const getNotificationHistory = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendToUser,
  broadcastToAll,
  getNotificationHistory,
};
