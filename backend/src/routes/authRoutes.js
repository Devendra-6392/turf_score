const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Traditional Native Registration & Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Synchronize SSO user session with backend DB & get JWT
router.post('/sync', authController.syncUser);

// Protected profile routes (require JWT)
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
