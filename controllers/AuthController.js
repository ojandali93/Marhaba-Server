import { supabase } from '../services/SupabaseClient.js';

export const checkSession = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  return res.status(200).json({ session: data });
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error.message);
      return res.status(401).json({ error: error.message });
    }

    const { session, user } = data;
    return res.status(200).json({
      message: 'Login successful',
      session,
      userId: user.id,
    });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

// controllers/AuthController.js

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('❌ Logout error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
