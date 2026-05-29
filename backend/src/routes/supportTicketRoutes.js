const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/supportTicketController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// User Routes
router.post('/', authMiddleware, supportTicketController.createTicket);
router.get('/', authMiddleware, supportTicketController.getUserTickets);

// Admin Routes
router.get('/admin', adminAuthMiddleware, supportTicketController.getAllTickets);
router.put('/admin/:id/resolve', adminAuthMiddleware, supportTicketController.resolveTicket);

module.exports = router;
