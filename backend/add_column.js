const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding challengeId column to Booking table...');
    await prisma.$executeRawUnsafe(`ALTER TABLE Booking ADD COLUMN challengeId VARCHAR(36) NULL;`);
    console.log('Successfully added challengeId to Booking.');
    
    console.log('Adding foreign key constraint...');
    await prisma.$executeRawUnsafe(`ALTER TABLE Booking ADD CONSTRAINT Booking_challengeId_fkey FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE SET NULL ON UPDATE CASCADE;`);
    console.log('Successfully added foreign key constraint.');

  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('Column challengeId already exists.');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
