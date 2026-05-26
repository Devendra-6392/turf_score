const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authorize = require('../middleware/permissionMiddleware');

router.get('/', turfController.getAllTurfs);
router.post('/', adminAuth, authorize('turfs', 'create'), turfController.createTurf);
router.get('/:id', turfController.getTurfById);
router.get('/:id/slots', turfController.getTurfSlots);
router.put('/:id', adminAuth, authorize('turfs', 'edit'), turfController.updateTurf);
router.delete('/:id', adminAuth, authorize('turfs', 'delete'), turfController.deleteTurf);
router.post('/:id/slots', adminAuth, authorize('slots', 'create'), turfController.createTurfSlot);
router.put('/slots/:slotId', adminAuth, authorize('slots', 'edit'), turfController.updateTurfSlot);
router.delete('/slots/:slotId', adminAuth, authorize('slots', 'delete'), turfController.deleteTurfSlot);

// Dev only
router.post('/seed', turfController.seedTurfs);

module.exports = router;
