const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');

// ── Public ──
router.get('/plans', subscriptionController.getPlans);

// ── Individual (auth required) ──
router.get('/my', authMiddleware, subscriptionController.getMySubscription);
router.post('/create-order', authMiddleware, subscriptionController.createSubscriptionOrder);
router.post('/subscribe', authMiddleware, subscriptionController.subscribe);
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.get('/check-discount/:userId', subscriptionController.checkDiscount);
router.post('/use-free-hour', authMiddleware, subscriptionController.useFreeHour);

// ── Team (auth required) ──
router.get('/team/my/:teamId', authMiddleware, subscriptionController.getTeamSubscription);
router.post('/team/create-order', authMiddleware, subscriptionController.createTeamSubscriptionOrder);
router.post('/team/subscribe', authMiddleware, subscriptionController.teamSubscribe);
router.post('/team/cancel', authMiddleware, subscriptionController.cancelTeamSubscription);
router.post('/team/slot-shield', authMiddleware, subscriptionController.useSlotShield);

// ── Super Admin ──
router.get('/admin/all', adminAuthMiddleware, subscriptionController.adminGetAll);
router.put('/admin/:id/manage', adminAuthMiddleware, subscriptionController.adminManage);

module.exports = router;
