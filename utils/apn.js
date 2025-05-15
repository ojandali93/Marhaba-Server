import apn from 'apn';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const apnProvider = new apn.Provider({
  token: {
    key: path.resolve('../AuthKey_96AY4FV874.p8'), // Put your actual key filename
    keyId: process.env.APN_KEY_ID,
    teamId: process.env.APN_TEAM_ID,
  },
  production: true, // true if you're in production (App Store)
});

export const sendPush = async (deviceToken, title, body) => {
  const notification = new apn.Notification();
  notification.alert = { title, body };
  notification.sound = 'default';
  notification.topic = process.env.APN_BUNDLE_ID;

  try {
    const result = await apnProvider.send(notification, deviceToken);
    console.log('📤 Push result:', result);
  } catch (err) {
    console.error('❌ APNs push error:', err);
  }
};