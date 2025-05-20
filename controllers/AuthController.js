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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Login error:', error.message);
      return res.status(401).json({ error: error.message });
    }

    const { session, user } = data;

    const jtoken = jwt.sign(user, process.env.JWT_SECRET);
    console.log('✅ Storing token in Profiles table:', jtoken);

    const { error: updateError } = await supabase
      .from('Profile')
      .update({ jwtToken: jtoken })
      .eq('userId', user.id);

    if (updateError) {
      console.error('❌ Error saving token to profile:', updateError.message);
    }

    return res.status(200).json({
      session,
      userId: user.id,
      user: user,
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


export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: 'Missing token or email' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      console.error('❌ Email verification failed:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Email verified' });
  } catch (err) {
    console.error('❌ Server error during verification:', err.message);
    return res.status(500).json({ error: 'Server error verifying email' });
  }
};

export const confirmPasswordReset = async (req, res) => {
  try {
    const { hash, newPassword } = req.body;

    if (!hash || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(hash);
    if (sessionError) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Password reset error:', err.message);
    return res.status(500).json({ error: 'Server error during password reset' });
  }
};

export const verifyAndUpdatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

console.log(email, currentPassword, newPassword);
  
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Step 1: Re-authenticate user with current password
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError || !authData.user) {
      console.error('❌ Invalid credentials:', signInError?.message);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = authData.user.id;

    // Step 2: Update password using admin privileges
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('❌ Password update failed:', updateError.message);
      return res.status(500).json({ error: 'Failed to update password.' });
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
