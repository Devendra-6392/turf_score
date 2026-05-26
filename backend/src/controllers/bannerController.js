const prisma = require('../config/db');

// Get all active banners (public - for mobile app)
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    console.error('Fetch Banners Error:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Get all banners (admin - includes inactive)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// Create banner (admin only)
exports.createBanner = async (req, res) => {
  try {
    const { title, imageUrl, linkUrl, isActive, sortOrder } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image URL are required.' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0
      }
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error('Create Banner Error:', error);
    res.status(500).json({ error: 'Failed to create banner', details: error.message });
  }
};

// Update banner (admin only)
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, linkUrl, isActive, sortOrder } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive,
        sortOrder
      }
    });

    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner', details: error.message });
  }
};

// Delete banner (admin only)
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner', details: error.message });
  }
};
