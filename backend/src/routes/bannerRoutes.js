const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const adminAuth = require('../middleware/adminAuthMiddleware');

// Public: active banners for mobile app
router.get('/', bannerController.getActiveBanners);

// Admin: all banners (including inactive)
router.get('/admin', adminAuth, bannerController.getAllBanners);

// Admin: CRUD
router.post('/', adminAuth, bannerController.createBanner);
router.put('/:id', adminAuth, bannerController.updateBanner);
router.delete('/:id', adminAuth, bannerController.deleteBanner);

module.exports = router;
