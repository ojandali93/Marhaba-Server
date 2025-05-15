import { sendPush } from '../utils/apn.js';
import { supabase } from '../services/SupabaseClient.js';

const router = express.Router();

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
  const { userId, title, body } = req.body;

  const { data, error } = await supabase
    .from('Profile')
    .select('apnToken')
    .eq('userId', userId)
    .single();

  if (error || !data?.apnToken) {
    return res.status(404).json({ error: 'APNs token not found' });
  }

  await sendPush(data.apnToken, title, body);
  return res.status(200).json({ success: true });
});

export default router;