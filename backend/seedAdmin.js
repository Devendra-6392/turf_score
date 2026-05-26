const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdminUsers() {
  const superPassword = await bcrypt.hash('superpassword123', 10);
  const turfPassword = await bcrypt.hash('turfpassword123', 10);
  const empPassword = await bcrypt.hash('emppassword123', 10);

  try {
    // 1. Create Super Admin
    await prisma.adminPanelUser.upsert({
      where: { email: 'superadmin@turf.com' },
      update: {},
      create: {
        email: 'superadmin@turf.com',
        password: superPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN'
      }
    });
    console.log('✅ Super Admin created (superadmin@turf.com / superpassword123)');

    // Get a turf to assign admins to
    const turf = await prisma.turf.findFirst();

    if (turf) {
      // 2. Create Turf Admin
      await prisma.adminPanelUser.upsert({
        where: { email: 'turfadmin@turf.com' },
        update: {},
        create: {
          email: 'turfadmin@turf.com',
          password: turfPassword,
          name: 'Turf Manager',
          role: 'TURF_ADMIN',
          turfId: turf.id
        }
      });
      console.log('✅ Turf Admin created (turfadmin@turf.com / turfpassword123)');

      // 3. Create Employee
      await prisma.adminPanelUser.upsert({
        where: { email: 'employee@turf.com' },
        update: {},
        create: {
          email: 'employee@turf.com',
          password: empPassword,
          name: 'Turf Employee',
          role: 'EMPLOYEE',
          turfId: turf.id
        }
      });
      console.log('✅ Employee created (employee@turf.com / emppassword123)');
    } else {
      console.log('⚠️ No turfs found. Could not create TURF_ADMIN or EMPLOYEE. Please run seed.js first.');
    }

  } catch (e) {
    console.error('Error seeding Admin Users:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUsers();
