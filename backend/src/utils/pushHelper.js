const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

/**
 * Sends a push notification to a user using their Expo Push Token.
 * 
 * @param {string} pushToken The user's Expo Push Token
 * @param {string} title The title of the notification
 * @param {string} body The body/message of the notification
 * @param {object} data Any extra data to send with the notification
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  // Create the messages that you want to send to clients
  let messages = [];
  messages.push({
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  });

  // The Expo push notification service accepts batches of notifications
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  // Send the chunks to the Expo push notification service
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Push notification sent successfully:', ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
};

module.exports = {
  sendPushNotification,
};
