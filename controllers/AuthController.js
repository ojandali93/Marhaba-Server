import { supabase } from '../services/SupabaseClient.js';
import jwt from 'jsonwebtoken';

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
    const jtoken = jwt.sign(user, process.env.JWT_SECRET);

    // ✅ Store the token in the Profiles table
    console.log('id for storing token:', user.id);
    console.log('✅ Storing token in Profiles table:', jtoken);
    const { error: updateError } = await supabase
      .from('Profile')
      .update({ jwtToken: jtoken }) // use the correct column name
      .eq('userId', user.id);

    if (updateError) {
      console.error('❌ Error saving token to profile:', updateError.message);
      // Don’t block login if this fails — continue
    }

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

// Logout endpoint
export const logoutUser = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token missing.' });
    }

    const { error } = await supabase.auth.admin.signOut(refresh_token);

    if (error) {
      console.error('Logout error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('❌ Server logout error:', error.message);
    return res.status(500).json({ error: 'Server error during logout' });
  }
};
