const { PrismaClient } = require('@prisma/client');
const { sendPushNotification } = require('./src/utils/pushHelper');
const prisma = new PrismaClient();

async function sendTestPush() {
  // Find any user that has an expoPushToken
  const user = await prisma.user.findFirst({
    where: {
      expoPushToken: { not: null }
    }
  });

  if (!user) {
    console.log('No user found with an Expo Push Token! Please reload your Expo app or log out and log back in to sync the token.');
    return;
  }

  console.log(`Found token for ${user.name}: ${user.expoPushToken}`);
  console.log('Sending test push notification...');

  await sendPushNotification(
    user.expoPushToken,
    'Manual Test Notification 🚀',
    'Hey there! If you see this, your push notifications are working perfectly end-to-end!',
    { type: 'TEST_NOTIFICATION' }
  );

  console.log('Notification sent to Expo server successfully!');
}

sendTestPush()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
