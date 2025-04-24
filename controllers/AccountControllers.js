import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';

export const createUserAccount = async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const {email, password, name, dob, gender, height, fcmToken, approved, tier} = profile

    console.log('email: ', email)
    console.log('password: ', password)
    console.log('name: ', name)
    console.log('dob: ', dob)
    console.log('gender: ', gender)
    console.log('height: ', height)
    console.log('fcmToken: ', fcmToken)
    console.log('approved: ', approved)
    console.log('tier: ', tier)

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

    console.log('userId: ', userId)

    if(!userId){
      return res.status(500).json({ error: 'User ID not returned' });
    }

    const {data: profileData, error: profileError} = await supabase
      .from('Profile')
      .insert([{
        userId: userId,
        email,
        name, 
        dob,
        gender,
        height,
        fcmToken,
        approved,
        tier
      }])
      .select();

    if (profileData) {
      return res.status(200).json({ success: true, data: profileData });
    } else {
      console.error('❌ Profile creating error:', profileError.message);
      return res.status(401).json({ error: profileError.message });
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};
