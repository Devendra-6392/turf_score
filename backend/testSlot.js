const prisma = require('./src/config/db');

async function testSlot() {
  try {
    const turf = await prisma.turf.findFirst();
    if (!turf) {
      console.log('No turfs found in database. Run seeding first.');
      return;
    }
    console.log(`Found turf: ${turf.name} (ID: ${turf.id})`);

    // Let's mimic what turfController.createTurfSlot does:
    const date = '2026-05-27';
    const startTime = '06:00';
    const endTime = '07:00';
    const price = '800';

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    console.log(`Parsed date:`, d);

    const slot = await prisma.turfSlot.create({
      data: {
        turfId: turf.id,
        date: d,
        startTime,
        endTime,
        price: parseFloat(price),
        status: 'AVAILABLE'
      }
    });

    console.log('Successfully created slot:', slot);
  } catch (error) {
    console.error('Failed to create slot. Error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testSlot();
