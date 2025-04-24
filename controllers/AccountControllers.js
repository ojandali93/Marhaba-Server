import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';

export const createUserAccount = async (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const {email, password, name, dob, gender, height, fcmToken, approved, tier} = profile

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

    if(!userId){
      return res.status(500).json({ error: 'User ID not returned' });
    }

    const { data: profileData, error: profileError } = await supabase
    .from('Profiles')
    .insert([{
      userId,
      email,
      name, 
      dob,
      gender,
      height,
      fcmToken,
      approved,
      tier
    }])

    if(profileError){
      console.error('❌ Profile creating error:', signUpError.message);
      return res.status(400).json({ error: signUpError.message });
    }

    return res.status(200).json({ success: true, data: profileData });

  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};
