const fetch = require('node-fetch');

async function send() {
  const message = {
    to: 'ExponentPushToken[YpUCPxPfitJXc_5vJ7XUTv]',
    sound: 'default',
    title: 'Hello from Skipers! 🏟️',
    body: 'Notifications are working! Your test was successful.',
    data: { someData: 'goes here' },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const data = await response.json();
    console.log('Expo Push Response:', data);
  } catch (error) {
    console.error('Error sending push:', error);
  }
}

send();
