const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  sendToUser, 
  broadcastToAll,
  getNotificationHistory 
} = require('../controllers/notificationController');

// ── User routes (mobile app) ──
router.get('/', authMiddleware, getNotifications);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);

// ── Admin routes (admin panel) ──
router.post('/send', adminAuth, sendToUser);
router.post('/broadcast', adminAuth, broadcastToAll);
router.get('/history', adminAuth, getNotificationHistory);

module.exports = router;
