const prisma = require('../config/db');
const { canAccessTurf } = require('../utils/staffPermissions');

function parseCalendarDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Get all turfs with optional filters
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await prisma.turf.findMany();
    const mapped = turfs.map(t => ({
      ...t,
      imageUrl: t.imageUrl || (t.images && t.images.length > 0 ? t.images[0] : null),
      pricePerHour: t.pricePerHour
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
};

// Create a new turf (Admin only)
exports.createTurf = async (req, res) => {
  try {
    if (req.admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only super admins can create new turfs' });
    }
    const { 
      name, location, city, state, description, category, latitude, longitude,
      pricePerHour, imageUrl, groundSize, groundType, cancellationPolicyText,
      openingTime, closingTime, contactPhone, contactEmail, safetyGuidelines,
      amenities, images
    } = req.body;

    let parsedAmenities = [];
    if (amenities) {
      if (Array.isArray(amenities)) parsedAmenities = amenities;
      else {
        try { parsedAmenities = JSON.parse(amenities); } catch (e) { parsedAmenities = []; }
      }
    }
    let parsedImages = [];
    if (images) {
      if (Array.isArray(images)) parsedImages = images;
      else {
        try { parsedImages = JSON.parse(images); } catch (e) { parsedImages = []; }
      }
    }
    
    const turf = await prisma.turf.create({
      data: {
        name,
        location,
        city,
        state,
        description,
        category: category || 'Football',
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        pricePerHour: pricePerHour !== undefined ? parseFloat(pricePerHour) : 1000.0,
        imageUrl: imageUrl || null,
        groundSize: groundSize || null,
        groundType: groundType || null,
        cancellationPolicyText: cancellationPolicyText || null,
        openingTime: openingTime || "06:00",
        closingTime: closingTime || "23:00",
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        safetyGuidelines: safetyGuidelines || null,
        amenities: parsedAmenities,
        images: parsedImages
      }
    });

    res.status(201).json(turf);
  } catch (error) {
    console.error('Create Turf Error:', error);
    res.status(500).json({ error: 'Failed to create turf', details: error.message });
  }
};

// Update a turf managed by the authenticated staff member.
exports.updateTurf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!canAccessTurf(req.admin, id)) {
      return res.status(403).json({ error: 'You can only manage your assigned turf' });
    }

    const { 
      name, location, city, state, description, category, latitude, longitude,
      pricePerHour, imageUrl, groundSize, groundType, cancellationPolicyText,
      openingTime, closingTime, contactPhone, contactEmail, safetyGuidelines,
      amenities, images
    } = req.body;

    let dataUpdate = {
      name,
      location,
      city,
      state,
      description,
      category,
      latitude: latitude === undefined ? undefined : (parseFloat(latitude) || null),
      longitude: longitude === undefined ? undefined : (parseFloat(longitude) || null)
    };

    if (pricePerHour !== undefined) dataUpdate.pricePerHour = parseFloat(pricePerHour);
    if (imageUrl !== undefined) dataUpdate.imageUrl = imageUrl;
    if (groundSize !== undefined) dataUpdate.groundSize = groundSize;
    if (groundType !== undefined) dataUpdate.groundType = groundType;
    if (cancellationPolicyText !== undefined) dataUpdate.cancellationPolicyText = cancellationPolicyText;
    if (openingTime !== undefined) dataUpdate.openingTime = openingTime;
    if (closingTime !== undefined) dataUpdate.closingTime = closingTime;
    if (contactPhone !== undefined) dataUpdate.contactPhone = contactPhone;
    if (contactEmail !== undefined) dataUpdate.contactEmail = contactEmail;
    if (safetyGuidelines !== undefined) dataUpdate.safetyGuidelines = safetyGuidelines;

    if (amenities !== undefined) {
      dataUpdate.amenities = Array.isArray(amenities) ? amenities : (typeof amenities === 'string' ? JSON.parse(amenities) : []);
    }
    if (images !== undefined) {
      dataUpdate.images = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images) : []);
    }

    const turf = await prisma.turf.update({
      where: { id },
      data: dataUpdate
    });
    res.json(turf);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update turf', details: error.message });
  }
};

exports.deleteTurf = async (req, res) => {
  try {
    const { id } = req.params;
    if (!canAccessTurf(req.admin, id)) {
      return res.status(403).json({ error: 'You can only manage your assigned turf' });
    }
    await prisma.turf.delete({ where: { id } });
    res.json({ message: 'Turf deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete turf', details: error.message });
  }
};

// Get single turf details
exports.getTurfById = async (req, res) => {
  try {
    const { id } = req.params;
    const turf = await prisma.turf.findUnique({
      where: { id },
      include: {
        pricing: true,
        cancellationPolicy: true
      }
    });
    if (!turf) return res.status(404).json({ error: 'Turf not found' });
    
    const mapped = {
      ...turf,
      imageUrl: turf.imageUrl || (turf.images && turf.images.length > 0 ? turf.images[0] : null),
      pricePerHour: turf.pricePerHour
    };
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch turf details' });
  }
};

// Get slots for a turf
exports.getTurfSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // optional date filter
    
    const where = { turfId: id };
    if (date) {
      const d = parseCalendarDate(date);
      if (!d) return res.status(400).json({ error: 'Invalid date format.' });
      where.date = d;
    }

    const slots = await prisma.turfSlot.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });
    res.json(slots);
  } catch (error) {
    console.error('Fetch Slots Error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

// Create a new slot
exports.createTurfSlot = async (req, res) => {
  try {
    const { id: turfId } = req.params;
    if (!canAccessTurf(req.admin, turfId)) {
      return res.status(403).json({ error: 'You can only manage slots for your assigned turf' });
    }
    let { date, startTime, endTime, price, sportType, discount, isPeakHour, maxPlayers, notes } = req.body;

    // Validate required fields
    if (!date || !startTime || !endTime || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: date, startTime, endTime, and price are required.' });
    }

    // Verify date is valid
    const d = parseCalendarDate(date);
    if (!d) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    // Verify price is a valid positive number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number.' });
    }

    const existingSlot = await prisma.turfSlot.findUnique({
      where: { turfId_date_startTime: { turfId, date: d, startTime } }
    });
    if (existingSlot?.status === 'BOOKED') {
      return res.status(409).json({ error: 'This time is already booked and cannot be overwritten.' });
    }

    const slotData = {
      endTime,
      price: parsedPrice,
      status: 'AVAILABLE',
      sportType: sportType || 'FOOTBALL',
      discount: discount ? parseFloat(discount) : 0.0,
      isPeakHour: isPeakHour === true || isPeakHour === 'true',
      maxPlayers: maxPlayers ? parseInt(maxPlayers) : 10,
      notes: notes || null
    };
    const slot = existingSlot
      ? await prisma.turfSlot.update({ where: { id: existingSlot.id }, data: slotData })
      : await prisma.turfSlot.create({ data: { turfId, date: d, startTime, ...slotData } });

    res.status(existingSlot ? 200 : 201).json({
      ...slot,
      message: existingSlot ? 'Existing available slot updated successfully.' : 'Slot created successfully.'
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A slot for this turf on this date and start time already exists.' });
    }
    res.status(500).json({ error: 'Failed to create slot', details: error.message });
  }
};

// Update a slot
exports.updateTurfSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime, price, status } = req.body;
    const existingSlot = await prisma.turfSlot.findUnique({ where: { id: slotId }, select: { turfId: true } });
    if (!existingSlot || !canAccessTurf(req.admin, existingSlot.turfId)) {
      return res.status(403).json({ error: 'You can only manage slots for your assigned turf' });
    }

    const slot = await prisma.turfSlot.update({
      where: { id: slotId },
      data: {
        startTime,
        endTime,
        price: price ? parseFloat(price) : undefined,
        status
      }
    });

    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
};

// Delete a slot
exports.deleteTurfSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await prisma.turfSlot.findUnique({ where: { id: slotId }, select: { turfId: true } });
    if (!slot || !canAccessTurf(req.admin, slot.turfId)) {
      return res.status(403).json({ error: 'You can only manage slots for your assigned turf' });
    }
    await prisma.turfSlot.delete({
      where: { id: slotId }
    });
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
};

// Seed initial mock data (Dev tool)
exports.seedTurfs = async (req, res) => {
  try {
    const mockTurfs = [
      {
        name: 'Emerald Arena',
        location: 'Downtown District',
        city: 'Metropolis',
        state: 'Central',
        description: 'FIFA-pro synthetic grass with advanced LED lighting.',
        category: 'Football'
      }
    ];

    await prisma.turf.createMany({ data: mockTurfs });
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed' });
  }
};
