const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// User Routes
router.get('/active', authMiddleware, couponController.getActiveCoupons);

// Admin Routes (using adminAuthMiddleware logic)
router.get('/admin', adminAuthMiddleware, couponController.getAllCoupons);
router.post('/admin', adminAuthMiddleware, couponController.createCoupon);

module.exports = router;
