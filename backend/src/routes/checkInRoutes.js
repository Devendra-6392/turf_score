const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkInController = require('../controllers/checkInController');

const router = express.Router();
router.post('/scan', authMiddleware, checkInController.scanTurfQr);

module.exports = router;
