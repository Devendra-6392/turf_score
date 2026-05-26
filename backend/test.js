// test.js
const prisma = require('./src/config/db'); // path to your prisma client file

async function test() {
  try {
    console.log('Attempting to connect to database...');
    const user = await prisma.user.create({
      data: {
        email: "test_" + Date.now() + "@gmail.com",
        name: "Devendra"
      }
    });

    console.log('Success! Created user:');
    console.log(user);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
