const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

const router = express.Router();
router.use(authMiddleware);
router.get('/', teamController.getMyTeams);
router.post('/', teamController.createTeam);
router.post('/:teamId/members', teamController.addMember);
router.delete('/:teamId/members/:memberId', teamController.removeMember);
router.delete('/:teamId', teamController.deleteTeam);
router.put('/:teamId', teamController.editTeam);

module.exports = router;
