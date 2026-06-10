const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, expoPushToken: true, fcmToken: true }
  });
  console.log(users);
}
check().finally(() => prisma.$disconnect());
