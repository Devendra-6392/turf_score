const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for dashboard...');

  // 1. Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'player1@example.com' },
    update: {},
    create: {
      email: 'player1@example.com',
      name: 'John Doe',
      phone: '1234567890'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'player2@example.com' },
    update: {},
    create: {
      email: 'player2@example.com',
      name: 'Jane Smith',
      phone: '0987654321'
    }
  });

  // 2. Create Turfs
  const turf1 = await prisma.turf.create({
    data: {
      name: 'Old Trafford Turf',
      location: 'Manchester Street',
      city: 'Manchester',
      state: 'Manc',
      description: 'The theater of dreams for local footballers.',
      category: 'Football'
    }
  });

  const turf2 = await prisma.turf.create({
    data: {
      name: 'Lords Cricket Ground',
      location: 'St Johns Wood',
      city: 'London',
      state: 'LDN',
      description: 'The home of cricket with premium nets.',
      category: 'Cricket'
    }
  });

  // 3. Create Admin Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.adminPanelUser.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  await prisma.adminPanelUser.upsert({
    where: { email: 'turfadmin1@example.com' },
    update: {},
    create: {
      email: 'turfadmin1@example.com',
      name: 'Turf Admin 1',
      password: hashedPassword,
      role: 'TURF_ADMIN',
      turfId: turf1.id
    }
  });

  // 4. Create Bookings (Spread across last 7 days)
  console.log('Creating historical bookings...');
  const users = [user1, user2];
  const turfs = [turf1, turf2];
  const statuses = ['CONFIRMED', 'COMPLETED'];

  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomTurf = turfs[Math.floor(Math.random() * turfs.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Spread bookings over last 7 days, 4-5 bookings per day at different times
    const dayOffset = Math.floor(i / 3);
    const hourOffset = (i % 3) + 10; // 10:00, 11:00, 12:00

    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0); // Date part only for the date field

    const price = randomTurf.category === 'Cricket' ? 1500 : 1200;

    // Create unique slot
    const slot = await prisma.turfSlot.upsert({
      where: {
        turfId_date_startTime: {
          turfId: randomTurf.id,
          date: date,
          startTime: `${hourOffset}:00`
        }
      },
      update: { status: 'BOOKED' },
      create: {
        turfId: randomTurf.id,
        date: date,
        startTime: `${hourOffset}:00`,
        endTime: `${hourOffset + 1}:00`,
        price: price,
        status: 'BOOKED'
      }
    });

    await prisma.booking.create({
      data: {
        userId: randomUser.id,
        turfId: randomTurf.id,
        slotId: slot.id,
        amount: price,
        status: randomStatus,
        createdAt: new Date(date.setHours(hourOffset))
      }
    });
  }

  console.log('Seeding complete! Check your dashboard now.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
