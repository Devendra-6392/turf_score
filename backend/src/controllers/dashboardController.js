const prisma = require('../config/db');

exports.getBusinessStats = async (req, res) => {
  try {
    const { role, turfId } = req.admin;
    const where = role === 'SUPER_ADMIN' ? {} : { turfId };

    if (role !== 'SUPER_ADMIN' && !turfId) {
      return res.status(403).json({ error: 'No turf is assigned to this staff account' });
    }

    // Revenue stats
    const bookings = await prisma.booking.findMany({
      where: {
        ...where,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalBookings = bookings.length;

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth();

      const monthBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return bDate.getMonth() === monthNum && bDate.getFullYear() === year;
      });

      monthlyStats.push({
        month,
        revenue: monthBookings.reduce((sum, b) => sum + b.amount, 0),
        bookings: monthBookings.length
      });
    }

    const totalTurfCount = role === 'SUPER_ADMIN' ? await prisma.turf.count() : await prisma.turf.count({ where: { id: turfId } });

    // Weekly stats (last 7 days)
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleString('default', { weekday: 'short' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.createdAt);
        return bDate >= dayStart && bDate <= dayEnd;
      });

      weeklyStats.push({
        day: dayName,
        revenue: dayBookings.reduce((sum, b) => sum + b.amount, 0),
        bookings: dayBookings.length
      });
    }

    // Turf-wise breakdown for Super Admin
    let turfBreakdown = [];
    if (role === 'SUPER_ADMIN') {
      const turfs = await prisma.turf.findMany({
        include: {
          bookings: {
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
            select: { amount: true, createdAt: true }
          }
        }
      });

      turfBreakdown = turfs.map(t => ({
        id: t.id,
        name: t.name,
        revenue: t.bookings.reduce((sum, b) => sum + b.amount, 0),
        bookings: t.bookings.length,
        location: t.location
      }));
    }

    // Recent Bookings (limit 5)
    const recentBookings = await prisma.booking.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        slot: { select: { date: true, startTime: true } },
        turf: { select: { name: true } }
      }
    });
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const checkedInToday = await prisma.booking.count({
      where: { ...where, checkInStatus: true, checkInTime: { gte: todayStart } }
    });

    const canViewRevenue = role !== 'EMPLOYEE';
    res.json({
      totalTurfCount,
      totalRevenue: canViewRevenue ? totalRevenue : null,
      totalBookings,
      checkedInToday,
      monthlyStats: canViewRevenue ? monthlyStats : monthlyStats.map((month) => ({ ...month, revenue: 0 })),
      weeklyStats: canViewRevenue ? weeklyStats : weeklyStats.map((day) => ({ ...day, revenue: 0 })),
      turfBreakdown,
      recentBookings: canViewRevenue ? recentBookings : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
