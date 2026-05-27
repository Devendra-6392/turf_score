const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
  console.log('✅ Prisma Client initialized successfully');
} catch (err) {
  console.error('❌ Failed to initialize Prisma Client:', err);
  process.exit(1);
}

module.exports = prisma;
