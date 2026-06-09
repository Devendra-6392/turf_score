const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authorize = require('../middleware/permissionMiddleware');

// Admin routes
router.get('/', adminAuth, authorize('bookings', 'view'), bookingController.getAllBookings);
router.post('/create-order', bookingController.createRazorpayOrder);

// Get other users' bookings for a turf on a specific date (for challenge suggestions)
router.get('/turf/:turfId/date/:date/users', bookingController.getOtherUsersBookingsForTurfDate);

// User booking routes
router.post('/', bookingController.createBooking);
router.post('/:bookingId/approve-cancellation', adminAuth, authorize('bookings', 'edit'), bookingController.cancelBooking);
router.post('/:bookingId/cancel', adminAuth, authorize('bookings', 'delete'), bookingController.cancelBooking);
router.post('/:bookingId/request-cancellation', bookingController.requestCancellation);

// Require a basic user authentication for my-bookings
const authMiddleware = require('../middleware/authMiddleware');
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);

router.get('/user/:userId', bookingController.getUserBookings);

module.exports = router;
