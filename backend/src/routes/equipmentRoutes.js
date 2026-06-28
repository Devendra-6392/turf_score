const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authorize = require('../middleware/permissionMiddleware');

// Using adminAuth for all routes since these are managed by admins
router.get('/', equipmentController.getEquipments);

// Only admins can modify inventory
router.post('/', adminAuth, authorize('inventory', 'edit'), equipmentController.createEquipment);
router.put('/:id', adminAuth, authorize('inventory', 'edit'), equipmentController.updateEquipment);
router.delete('/:id', adminAuth, authorize('inventory', 'delete'), equipmentController.deleteEquipment);

module.exports = router;
