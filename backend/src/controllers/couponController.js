const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, value, minBookingAmt, maxDiscountAmt, startDate, endDate, usageLimit } = req.body;
    
    // Determine turfId context
    let turfId = req.body.turfId || null;
    if (req.admin && req.admin.turfId) {
      turfId = req.admin.turfId;
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        value: parseFloat(value),
        minBookingAmt: parseFloat(minBookingAmt || 0),
        maxDiscountAmt: parseFloat(maxDiscountAmt || 1000),
        startDate: new Date(startDate || new Date()),
        endDate: new Date(endDate),
        usageLimit: parseInt(usageLimit || 100),
        turfId: turfId
      }
    });

    // Custom customized notifications
    let notificationTitle = 'New Offer Unlocked! 🎉';
    let notificationBody = `Use code ${coupon.code} to get exciting discounts on your next turf booking.`;

    if (turfId) {
      const turf = await prisma.turf.findUnique({ where: { id: turfId }, select: { name: true } });
      if (turf) {
        notificationTitle = `Special Offer at ${turf.name}! 🏟️`;
        notificationBody = `Use code ${coupon.code} to get a discount on your booking at ${turf.name}. Book now!`;
      }
    }

    // Notify all users about the new promotion
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length > 0) {
      const notifications = users.map(user => ({
        userId: user.id,
        title: notificationTitle,
        body: notificationBody,
        type: 'PROMOTION',
        sentAt: new Date()
      }));
      await prisma.notification.createMany({ data: notifications });
    }

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    let whereClause = {};
    if (req.admin && req.admin.turfId) {
      whereClause.turfId = req.admin.turfId;
    } else if (req.query.turfId) {
      whereClause.turfId = req.query.turfId;
    }

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      include: {
        turf: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

// ==========================================
// USER CONTROLLERS
// ==========================================

exports.getActiveCoupons = async (req, res) => {
  try {
    const { turfId } = req.query;
    const now = new Date();
    
    let whereClause = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    };

    if (turfId) {
      whereClause.OR = [
        { turfId: null },
        { turfId: turfId }
      ];
    }

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Fetch turf details separately if turfId exists
    const enrichedCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        if (coupon.turfId) {
          const turf = await prisma.turf.findUnique({
            where: { id: coupon.turfId },
            select: { name: true }
          });
          return { ...coupon, turf };
        }
        return { ...coupon, turf: null };
      })
    );

    res.json(enrichedCoupons);
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    res.status(500).json({ error: 'Failed to fetch active coupons' });
  }
};
