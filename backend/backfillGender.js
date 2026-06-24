const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Backfilling null genders to Male...');
  const result = await prisma.user.updateMany({
    where: {
      gender: null,
    },
    data: {
      gender: 'Male',
    },
  });
  console.log(`Updated ${result.count} users with default gender 'Male'.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
