const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const dashboardController = require('../controllers/dashboardController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authorize = require('../middleware/permissionMiddleware');
const checkInController = require('../controllers/checkInController');

router.post('/login', adminAuthController.adminLogin);
router.post('/register', adminAuthController.adminRegister);
router.get('/me', adminAuth, adminAuthController.getCurrentAdmin);
router.post('/create-turf-admin', adminAuth, adminAuthController.createTurfAdmin);

// Dashboard / Business Stats
router.get('/dashboard/stats', adminAuth, authorize('dashboard', 'view'), dashboardController.getBusinessStats);

// Employee Management
router.post('/employees', adminAuth, adminAuthController.createEmployee);
router.get('/employees', adminAuth, adminAuthController.getEmployees);
router.put('/employees/:id', adminAuth, adminAuthController.updateEmployee);
router.delete('/employees/:id', adminAuth, adminAuthController.deleteEmployee);

// User Wallet Management (Super Admin only)
router.get('/users', adminAuth, adminAuthController.getUsers);
router.post('/users/:userId/wallet/credit', adminAuth, adminAuthController.creditUserWallet);

// Turf gate QR and arrival tracking
router.get('/turfs/:turfId/entry-qr', adminAuth, authorize('checkins', 'view'), checkInController.getTurfQr);
router.post('/turfs/:turfId/entry-qr/rotate', adminAuth, authorize('checkins', 'edit'), checkInController.rotateTurfQr);
router.get('/check-ins', adminAuth, authorize('checkins', 'view'), checkInController.listArrivals);

module.exports = router;
