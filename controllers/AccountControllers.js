import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';

export const createUserAccount = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: signupUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (signUpError) {
      console.error('❌ Supabase signup error:', signUpError.message);
      return res.status(400).json({ error: signUpError.message });
    }

    const userId = signupUser?.user?.id;

    if (userId) {
      return res.status(200).json({ success: true, data: userId });
    } else {
      return res.status(500).json({ error: 'User ID not returned' });
    }

  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};
