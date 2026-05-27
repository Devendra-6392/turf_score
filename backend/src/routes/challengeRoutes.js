const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createChallenge,
  listChallenges,
  myChallenges,
  getChallengeById,
  getChallengeByShareCode,
  acceptChallenge,
  cancelChallenge,
} = require('../controllers/challengeController');

// Public
router.get('/', listChallenges);
router.get('/share/:shareCode', getChallengeByShareCode);

// Protected
router.use(auth);
router.post('/', createChallenge);
router.get('/me', myChallenges);
router.get('/:id', getChallengeById);
router.post('/:id/accept', acceptChallenge);
router.post('/:id/cancel', cancelChallenge);

module.exports = router;
