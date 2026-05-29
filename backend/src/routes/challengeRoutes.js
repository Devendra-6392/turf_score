const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createChallenge, listChallenges, myChallenges,
  getChallengeById, getChallengeByShareCode,
  acceptChallenge, cancelChallenge, lockSlot, payAdvance, submitResult
} = require('../controllers/challengeController');

router.post('/', authMiddleware, createChallenge);
router.get('/', listChallenges);
router.get('/my-challenges', authMiddleware, myChallenges);
router.post('/lock-slot', authMiddleware, lockSlot);
router.post('/pay-advance', authMiddleware, payAdvance);
router.post('/submit-result', authMiddleware, submitResult);
router.get('/share/:shareCode', getChallengeByShareCode);
router.get('/:id', getChallengeById);
router.post('/:id/accept', authMiddleware, acceptChallenge);
router.post('/:id/cancel', authMiddleware, cancelChallenge);

module.exports = router;
