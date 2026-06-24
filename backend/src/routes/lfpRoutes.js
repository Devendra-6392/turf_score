const express = require('express');
const router = express.Router();
const lfpController = require('../controllers/lfpController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, lfpController.getLfpRequests);
router.post('/', authMiddleware, lfpController.createLfpRequest);
router.post('/:id/join', authMiddleware, lfpController.joinLfpRequest);
router.post('/:id/leave', authMiddleware, lfpController.leaveLfpRequest);
router.get('/:id/interested', authMiddleware, lfpController.getInterestedPlayers);
router.post('/:id/accept/:userId', authMiddleware, lfpController.acceptPlayer);

module.exports = router;
