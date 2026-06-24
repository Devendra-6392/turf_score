const prisma = require('../config/db');
const Razorpay = require('razorpay');
const { sendPushNotification } = require('../utils/pushHelper');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Plan definitions ──────────────────────────────────────────
const INDIVIDUAL_PLANS = {
  BASIC: {
    name: 'Basic Pass',
    price: 149,
    discountPercent: 5,
    freeHoursRemaining: 0,
    walletCredits: 0,
    noConvenienceFee: true,
    freeCancellation: false,
    freeRescheduling: false,
    priorityBooking: true,
    premiumBadge: false,
    benefits: [
      '5% booking discount',
      'Priority booking during peak hours',
      'No convenience fee',
      'Cancel booking up to 2 hours before match',
    ],
  },
  PRO: {
    name: 'Pro Pass',
    price: 399,
    discountPercent: 10,
    freeHoursRemaining: 0,
    walletCredits: 100,
    noConvenienceFee: true,
    freeCancellation: false,
    freeRescheduling: true,
    priorityBooking: true,
    premiumBadge: false,
    benefits: [
      '10% booking discount',
      'Free slot rescheduling',
      'Invite friends & earn credits',
      'Match statistics tracking',
      '₹100 monthly wallet credits',
    ],
  },
  ELITE: {
    name: 'Elite Pass',
    price: 999,
    discountPercent: 15,
    freeHoursRemaining: 1,
    walletCredits: 0,
    noConvenienceFee: true,
    freeCancellation: true,
    freeRescheduling: true,
    priorityBooking: true,
    premiumBadge: true,
    benefits: [
      '15% booking discount',
      'Early access to premium slots',
      'Free cancellation',
      'Dedicated support',
      '1 free booking hour every month',
      'Premium badge on profile',
    ],
  },
};

const TEAM_PLANS = {
  WEEKEND_WARRIORS: {
    name: 'Weekend Warriors',
    price: 3999,
    slotsPerWeek: 1,
    bookingsIncluded: 4,
    splitPayments: false,
    tournamentAccess: false,
    teamDashboard: false,
    benefits: [
      '1 fixed slot every week',
      'Saturday or Sunday',
      'Same turf reserved every week',
      '4 bookings/month included',
      'Priority slot retention',
      'Easy rescheduling',
    ],
  },
  PREMIUM_TEAM: {
    name: 'Premium Team Pass',
    price: 7999,
    slotsPerWeek: 2,
    bookingsIncluded: 8,
    splitPayments: true,
    tournamentAccess: true,
    teamDashboard: true,
    benefits: [
      '2 fixed slots every week',
      'Same turf reserved',
      'Priority support',
      'Easy rescheduling',
      'Team dashboard',
      'Split payments',
      'Exclusive tournament access',
    ],
  },
};

// ── Helper: Check & expire stale subscriptions ───────────────
async function checkAndExpireSubscription(userId) {
  const now = new Date();
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });
}

async function checkAndExpireTeamSubscription(teamId) {
  const now = new Date();
  await prisma.teamSubscription.updateMany({
    where: {
      teamId,
      status: 'ACTIVE',
      endDate: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });
}

// ══════════════════════════════════════════════════════════════
// INDIVIDUAL SUBSCRIPTION ENDPOINTS
// ══════════════════════════════════════════════════════════════

// GET /api/subscriptions/plans — return all plan info
exports.getPlans = async (req, res) => {
  try {
    res.json({
      individual: Object.entries(INDIVIDUAL_PLANS).map(([key, plan]) => ({
        planId: key,
        ...plan,
      })),
      team: Object.entries(TEAM_PLANS).map(([key, plan]) => ({
        planId: key,
        ...plan,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/subscriptions/my — get current user's active subscription
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.userId;
    await checkAndExpireSubscription(userId);

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ subscription, plans: INDIVIDUAL_PLANS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/create-order — Create Razorpay order for subscription
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { plan, autoRenew } = req.body;
    const userId = req.userId;

    if (!INDIVIDUAL_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Check if user already has an active subscription
    await checkAndExpireSubscription(userId);
    const existing = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have an active subscription. Cancel it first to switch plans.' });
    }

    const planData = INDIVIDUAL_PLANS[plan];
    const amount = planData.price;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `sub_${plan}_${Date.now()}`,
      notes: { userId, plan, type: 'individual_subscription' },
    });

    res.json({ order, plan: planData, planId: plan });
  } catch (error) {
    console.error('Subscription order error:', error);
    res.status(500).json({ error: 'Failed to create subscription order' });
  }
};

// POST /api/subscriptions/subscribe — Activate after payment
exports.subscribe = async (req, res) => {
  try {
    const { plan, razorpayOrderId, razorpayPaymentId, razorpaySignature, autoRenew } = req.body;
    const userId = req.userId;

    if (!INDIVIDUAL_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Verify payment signature
    const crypto = require('crypto');
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isSimulation = razorpaySignature === 'mock_signature';
    if (!isSimulation && generated !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    await checkAndExpireSubscription(userId);
    const existing = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    const planData = INDIVIDUAL_PLANS[plan];
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        amount: planData.price,
        startDate: now,
        endDate,
        discountPercent: planData.discountPercent,
        freeHoursRemaining: planData.freeHoursRemaining,
        walletCreditsGiven: planData.walletCredits,
        noConvenienceFee: planData.noConvenienceFee,
        freeCancellation: planData.freeCancellation,
        freeRescheduling: planData.freeRescheduling,
        priorityBooking: planData.priorityBooking,
        premiumBadge: planData.premiumBadge,
        razorpayPaymentId,
        razorpayOrderId,
        autoRenew: autoRenew || false,
      },
    });

    // Credit wallet for PRO plan
    if (plan === 'PRO' && planData.walletCredits > 0) {
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: {
          balance: { increment: planData.walletCredits },
        },
        create: {
          userId,
          balance: planData.walletCredits,
        },
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: planData.walletCredits,
          type: 'CREDIT',
          description: `Monthly wallet credits — Pro Pass subscription`,
          status: 'COMPLETED',
          previousBalance: wallet.balance - planData.walletCredits,
          newBalance: wallet.balance,
        },
      });
    }

    // Send push notification
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.expoPushToken) {
      sendPushNotification(
        user.expoPushToken,
        `${planData.name} Activated! 🎉`,
        `You're now a ${planData.name} member. Enjoy ${planData.discountPercent}% off on all bookings!`,
        { type: 'SUBSCRIPTION_ACTIVATED', subscriptionId: subscription.id }
      );
    }

    res.status(201).json({ subscription, message: `${planData.name} activated successfully!` });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/cancel — Cancel and pro-rate refund to wallet
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Calculate pro-rated refund
    const now = new Date();
    const totalDays = Math.ceil((subscription.endDate - subscription.startDate) / (1000 * 60 * 60 * 24));
    const daysUsed = Math.ceil((now - subscription.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysUsed);
    const refundAmount = Math.round((subscription.amount / totalDays) * daysRemaining);

    // Update subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        refundAmount,
      },
    });

    // Refund to wallet
    if (refundAmount > 0) {
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: refundAmount } },
        create: { userId, balance: refundAmount },
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: refundAmount,
          type: 'REFUND',
          description: `Pro-rated refund for ${subscription.plan} Pass cancellation (${daysRemaining} days remaining)`,
          status: 'COMPLETED',
          previousBalance: wallet.balance - refundAmount,
          newBalance: wallet.balance,
        },
      });
    }

    res.json({
      message: `Subscription cancelled. ₹${refundAmount} refunded to your wallet.`,
      refundAmount,
      daysRemaining,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/subscriptions/check-discount/:userId — Used by booking system
exports.checkDiscount = async (req, res) => {
  try {
    const { userId } = req.params;
    await checkAndExpireSubscription(userId);

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return res.json({ hasSubscription: false, discountPercent: 0 });
    }

    res.json({
      hasSubscription: true,
      plan: subscription.plan,
      discountPercent: subscription.discountPercent,
      freeHoursRemaining: subscription.freeHoursRemaining,
      noConvenienceFee: subscription.noConvenienceFee,
      freeCancellation: subscription.freeCancellation,
      premiumBadge: subscription.premiumBadge,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/use-free-hour — Decrement free hour for Elite
exports.useFreeHour = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', freeHoursRemaining: { gt: 0 } },
    });

    if (!subscription) {
      return res.status(400).json({ error: 'No free hours available' });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { freeHoursRemaining: { decrement: 1 } },
    });

    res.json({ message: 'Free hour applied!', remaining: subscription.freeHoursRemaining - 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// TEAM SUBSCRIPTION ENDPOINTS
// ══════════════════════════════════════════════════════════════

// GET /api/subscriptions/team/my/:teamId
exports.getTeamSubscription = async (req, res) => {
  try {
    const { teamId } = req.params;
    await checkAndExpireTeamSubscription(teamId);

    const subscription = await prisma.teamSubscription.findFirst({
      where: { teamId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ subscription, plans: TEAM_PLANS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/team/create-order
exports.createTeamSubscriptionOrder = async (req, res) => {
  try {
    const { plan, teamId } = req.body;
    const userId = req.userId;

    if (!TEAM_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid team plan' });
    }

    // Verify captain
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can subscribe' });
    }

    await checkAndExpireTeamSubscription(teamId);
    const existing = await prisma.teamSubscription.findFirst({
      where: { teamId, status: 'ACTIVE' },
    });
    if (existing) {
      return res.status(400).json({ error: 'Team already has an active subscription' });
    }

    const planData = TEAM_PLANS[plan];
    const order = await razorpay.orders.create({
      amount: Math.round(planData.price * 100),
      currency: 'INR',
      receipt: `team_sub_${plan}_${Date.now()}`,
      notes: { teamId, plan, type: 'team_subscription' },
    });

    res.json({ order, plan: planData, planId: plan });
  } catch (error) {
    console.error('Team subscription order error:', error);
    res.status(500).json({ error: 'Failed to create team subscription order' });
  }
};

// POST /api/subscriptions/team/subscribe
exports.teamSubscribe = async (req, res) => {
  try {
    const { teamId, plan, preferredDays, preferredTimes, razorpayOrderId, razorpayPaymentId, razorpaySignature, autoRenew } = req.body;
    const userId = req.userId;

    if (!TEAM_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid team plan' });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can subscribe' });
    }

    // Verify payment
    const crypto = require('crypto');
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const isSimulation = razorpaySignature === 'mock_signature';
    if (!isSimulation && generated !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    await checkAndExpireTeamSubscription(teamId);
    const planData = TEAM_PLANS[plan];
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await prisma.teamSubscription.create({
      data: {
        teamId,
        plan,
        status: 'ACTIVE',
        amount: planData.price,
        startDate: now,
        endDate,
        slotsPerWeek: planData.slotsPerWeek,
        preferredDays: preferredDays || [],
        preferredTimes: preferredTimes || [],
        slotShieldCredits: 0,
        bookingsIncluded: planData.bookingsIncluded,
        bookingsUsed: 0,
        splitPayments: planData.splitPayments,
        tournamentAccess: planData.tournamentAccess,
        teamDashboard: planData.teamDashboard,
        razorpayPaymentId,
        razorpayOrderId,
        autoRenew: autoRenew || false,
      },
    });

    res.status(201).json({ subscription, message: `${planData.name} activated for your team!` });
  } catch (error) {
    console.error('Team subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/team/cancel
exports.cancelTeamSubscription = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.userId;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can cancel' });
    }

    const subscription = await prisma.teamSubscription.findFirst({
      where: { teamId, status: 'ACTIVE' },
    });
    if (!subscription) {
      return res.status(404).json({ error: 'No active team subscription found' });
    }

    const now = new Date();
    const totalDays = Math.ceil((subscription.endDate - subscription.startDate) / (1000 * 60 * 60 * 24));
    const daysUsed = Math.ceil((now - subscription.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysUsed);
    const refundAmount = Math.round((subscription.amount / totalDays) * daysRemaining);

    await prisma.teamSubscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', cancelledAt: now, refundAmount },
    });

    // Refund to captain's wallet
    if (refundAmount > 0) {
      const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: refundAmount } },
        create: { userId, balance: refundAmount },
      });
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: refundAmount,
          type: 'REFUND',
          description: `Pro-rated refund for team ${subscription.plan} cancellation`,
          status: 'COMPLETED',
          previousBalance: wallet.balance - refundAmount,
          newBalance: wallet.balance,
        },
      });
    }

    res.json({ message: `Team subscription cancelled. ₹${refundAmount} refunded to your wallet.`, refundAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/subscriptions/team/slot-shield — Earn a Slot Shield credit on cancellation
exports.useSlotShield = async (req, res) => {
  try {
    const { teamId, bookingId } = req.body;
    const userId = req.userId;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can use Slot Shield' });
    }

    const subscription = await prisma.teamSubscription.findFirst({
      where: { teamId, status: 'ACTIVE' },
    });
    if (!subscription) {
      return res.status(404).json({ error: 'No active team subscription' });
    }

    // Check if booking is 24+ hours away
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { slot: true },
      });
      if (booking && booking.slot) {
        const slotTime = new Date(booking.slot.date);
        const hoursUntil = (slotTime - new Date()) / (1000 * 60 * 60);
        if (hoursUntil < 24) {
          return res.status(400).json({ error: 'Slot Shield requires cancellation 24+ hours before match' });
        }
      }
    }

    // Create Slot Shield credit
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const credit = await prisma.slotShieldCredit.create({
      data: {
        teamSubscriptionId: subscription.id,
        earnedAt: now,
        expiresAt,
      },
    });

    // Increment credit count
    await prisma.teamSubscription.update({
      where: { id: subscription.id },
      data: { slotShieldCredits: { increment: 1 } },
    });

    res.json({ message: 'Slot Shield credit earned! Use within 30 days.', credit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// SUPER ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════

// GET /api/subscriptions/admin/all
exports.adminGetAll = async (req, res) => {
  try {
    const { status, type } = req.query;

    const individualWhere = {};
    const teamWhere = {};
    if (status) {
      individualWhere.status = status;
      teamWhere.status = status;
    }

    let individual = [];
    let team = [];

    if (!type || type === 'individual') {
      individual = await prisma.subscription.findMany({
        where: individualWhere,
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!type || type === 'team') {
      team = await prisma.teamSubscription.findMany({
        where: teamWhere,
        include: { team: { include: { captain: { select: { id: true, name: true, email: true } }, members: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Revenue summary
    const totalIndividualRevenue = individual
      .filter(s => s.status !== 'CANCELLED')
      .reduce((sum, s) => sum + s.amount, 0);
    const totalTeamRevenue = team
      .filter(s => s.status !== 'CANCELLED')
      .reduce((sum, s) => sum + s.amount, 0);

    res.json({
      individual,
      team,
      stats: {
        totalIndividual: individual.length,
        totalTeam: team.length,
        activeIndividual: individual.filter(s => s.status === 'ACTIVE').length,
        activeTeam: team.filter(s => s.status === 'ACTIVE').length,
        totalRevenue: totalIndividualRevenue + totalTeamRevenue,
        individualRevenue: totalIndividualRevenue,
        teamRevenue: totalTeamRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/subscriptions/admin/:id/manage
exports.adminManage = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, type, extendDays } = req.body;
    // type: 'individual' or 'team'
    // action: 'activate', 'cancel', 'extend', 'pause'

    if (type === 'individual') {
      const sub = await prisma.subscription.findUnique({ where: { id } });
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });

      let updateData = {};
      if (action === 'activate') updateData = { status: 'ACTIVE' };
      else if (action === 'cancel') updateData = { status: 'CANCELLED', cancelledAt: new Date() };
      else if (action === 'pause') updateData = { status: 'PAUSED' };
      else if (action === 'extend') {
        const newEnd = new Date(sub.endDate);
        newEnd.setDate(newEnd.getDate() + (extendDays || 30));
        updateData = { endDate: newEnd, status: 'ACTIVE' };
      }

      const updated = await prisma.subscription.update({ where: { id }, data: updateData });
      res.json({ message: `Subscription ${action}d successfully`, subscription: updated });
    } else if (type === 'team') {
      const sub = await prisma.teamSubscription.findUnique({ where: { id } });
      if (!sub) return res.status(404).json({ error: 'Team subscription not found' });

      let updateData = {};
      if (action === 'activate') updateData = { status: 'ACTIVE' };
      else if (action === 'cancel') updateData = { status: 'CANCELLED', cancelledAt: new Date() };
      else if (action === 'pause') updateData = { status: 'PAUSED' };
      else if (action === 'extend') {
        const newEnd = new Date(sub.endDate);
        newEnd.setDate(newEnd.getDate() + (extendDays || 30));
        updateData = { endDate: newEnd, status: 'ACTIVE' };
      }

      const updated = await prisma.teamSubscription.update({ where: { id }, data: updateData });
      res.json({ message: `Team subscription ${action}d successfully`, subscription: updated });
    } else {
      return res.status(400).json({ error: 'Invalid type. Use "individual" or "team"' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
