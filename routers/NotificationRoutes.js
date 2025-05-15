import { sendPush } from '../utils/apn.js';
import { supabase } from '../services/SupabaseClient.js';
import { Router } from 'express';

const router = Router();

// Store device token
router.post('/store-device-token', async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: 'Missing userId or token' });
  }

  const { error } = await supabase
    .from('Profile') // Replace with your actual table
    .update({ apnToken: token })
    .eq('userId', userId);

  if (error) {
    console.error('❌ Failed to store APNs token:', error.message);
    return res.status(500).json({ error: 'Error storing token' });
  }

  return res.status(200).json({ success: true });
});

// Trigger push
router.post('/send', async (req, res) => {
  const { token, title, body } = req.body;

  const result = await sendPush(token, title, body);

  console.log(result);
  if (result.failed.length > 0) {
    console.log(result.failed[0].response);
    return res.status(500).json({ error: 'Failed to send push' });
  }

  return res.status(200).json({ success: true, result });
});

export default router;