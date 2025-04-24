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


export const createUserProfile = async (req, res) => {
  try {
    const { userId,  email, name, dob, gender, height, fcmToken, approved, tier } = req.body;

    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
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
    .select();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    if (profileData) {
      return res.status(200).json({ success: true, data: profileData });
    } else {
      return res.status(500).json({ error: profileError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};


export const createUserAbout = async (req, res) => {
  try {
    const { userId, lookingFor,  background, religion, sect, views, smoke, drink } = req.body;

    const { data: aboutData, error: aboutError } = await supabase
    .from('About')
    .insert([{
      userId,
      lookingFor,
      background,
      religion, 
      sect,
      views,
      smoke,
      drink
    }])
    .select();

    if (aboutError) {
      return res.status(400).json({ error: aboutError.message });
    }

    if (aboutData) {
      return res.status(200).json({ success: true, data: aboutData });
    } else {
      return res.status(500).json({ error: aboutError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserCareer = async (req, res) => {
  try {
    const { userId, job,  company, site, location, education, fiveYear } = req.body;

    const { data: careerData, error: careerError } = await supabase
    .from('Career')
    .insert([{
      userId,
      job,
      company,
      site, 
      location,
      fiveYear,
      education
    }])
    .select();

    if (careerError) {
      return res.status(400).json({ error: aboutError.careerError });
    }

    if (careerData) {
      return res.status(200).json({ success: true, data: careerData });
    } else {
      return res.status(500).json({ error: careerError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserTraits = async (req, res) => {
  try {
    const { userId, traits } = req.body;
    const traitArray = typeof traits === 'string' ? traits.split(',') : traits;
    const insertData = traitArray.map(trait => ({
      userId,
      tag: trait, // optional: trim whitespace
    }));
    const { data: traitsData, error: traitsError } = await supabase
      .from('Tags') // ✅ Use correct table name (not 'Career')
      .insert(insertData)
      .select();
    if (traitsError) {
      console.error('❌ Supabase insert error:', traitsError.message);
      return res.status(400).json({ error: traitsError.message });
    }
    return res.status(200).json({ success: true, data: traitsData });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to create traits' });
  }
};
