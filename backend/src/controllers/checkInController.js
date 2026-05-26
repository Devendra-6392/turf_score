const crypto = require('crypto');
const prisma = require('../config/db');
const { canAccessTurf } = require('../utils/staffPermissions');

function createQrToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function ensureQrToken(turf) {
  if (turf.entryQrToken) return turf;
  return prisma.turf.update({
    where: { id: turf.id },
    data: { entryQrToken: createQrToken(), qrEnabled: true, qrUpdatedAt: new Date() }
  });
}

exports.getTurfQr = async (req, res) => {
  try {
    const turf = await prisma.turf.findUnique({ where: { id: req.params.turfId } });
    if (!turf || !canAccessTurf(req.admin, turf.id)) {
      return res.status(404).json({ error: 'Turf not found for your access scope' });
    }
    const activeTurf = await ensureQrToken(turf);
    res.json({
      turfId: activeTurf.id,
      turfName: activeTurf.name,
      qrEnabled: activeTurf.qrEnabled,
      qrValue: `TURFSCORE:${activeTurf.entryQrToken}`,
      qrUpdatedAt: activeTurf.qrUpdatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load turf QR pass' });
  }
};

exports.rotateTurfQr = async (req, res) => {
  try {
    const turf = await prisma.turf.findUnique({ where: { id: req.params.turfId } });
    if (!turf || !canAccessTurf(req.admin, turf.id)) {
      return res.status(404).json({ error: 'Turf not found for your access scope' });
    }
    const updated = await prisma.turf.update({
      where: { id: turf.id },
      data: { entryQrToken: createQrToken(), qrEnabled: true, qrUpdatedAt: new Date() }
    });
    res.json({ qrValue: `TURFSCORE:${updated.entryQrToken}`, qrUpdatedAt: updated.qrUpdatedAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rotate turf QR pass' });
  }
};

exports.listArrivals = async (req, res) => {
  try {
    const where = req.admin.role === 'SUPER_ADMIN' ? {} : { turfId: req.admin.turfId };
    const bookings = await prisma.booking.findMany({
      where: { ...where, checkInStatus: true },
      include: {
        turf: { select: { name: true } },
        user: { select: { name: true, email: true } },
        team: { select: { name: true, sportType: true } },
        slot: true
      },
      orderBy: { checkInTime: 'desc' },
      take: 50
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load check-ins' });
  }
};

exports.scanTurfQr = async (req, res) => {
  try {
    const rawValue = String(req.body.qrValue || '');
    const qrToken = rawValue.startsWith('TURFSCORE:') ? rawValue.slice(10) : rawValue;
    const turf = await prisma.turf.findUnique({ where: { entryQrToken: qrToken } });
    if (!turf || !turf.qrEnabled) return res.status(400).json({ error: 'This turf QR pass is invalid or inactive' });

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23, 59, 59, 999);
    const booking = await prisma.booking.findFirst({
      where: {
        turfId: turf.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        slot: { date: { gte: todayStart, lte: todayEnd } },
        OR: [
          { userId: req.userId },
          { team: { members: { some: { userId: req.userId } } } }
        ]
      },
      include: {
        turf: { select: { name: true, location: true } },
        team: { include: { members: true } },
        slot: true
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!booking) return res.status(403).json({ error: 'No booking for you or your team is scheduled at this turf today' });
    if (booking.checkInStatus) return res.json({ message: 'Your booking is already checked in', booking });

    const checkedIn = await prisma.booking.update({
      where: { id: booking.id },
      data: { checkInStatus: true, checkInTime: new Date(), checkedInById: req.userId },
      include: { turf: true, team: { include: { members: true } }, slot: true }
    });
    res.json({
      message: checkedIn.team ? `${checkedIn.team.name} checked in successfully for ${checkedIn.team.members.length} players` : 'Check-in successful',
      booking: checkedIn
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not complete check-in' });
  }
};
