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


export const createUserPreferences = async (req, res) => {
  try {
    const { userId, gender,  distance, religion, sect, views, ageMin, ageMax } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Preferences')
    .insert([{
      userId,
      gender,
      distance,
      religion, 
      sect,
      views,
      ageMax,
      ageMin
    }])
    .select();

    if (preferencesError) {
      return res.status(400).json({ error: aboutError.preferencesError });
    }

    if (preferencesData) {
      return res.status(200).json({ success: true, data: preferencesData });
    } else {
      return res.status(500).json({ error: preferencesError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserEitherOr = async (req, res) => {
  try {
    const { userId, friday,  energy, planning, 
      morningEnergy, social, verted, pineapple, 
      giveUp, communication,  firstSight, morning, 
      travel, spicy, decisions, arrive, partner, 
      move, opposites, ghost, longDistance  } = req.body;

    const { data: surveyData, error: surveyError } = await supabase
    .from('Survey')
    .insert([{
      userId,
      friday,
      energy,
      planning, 
      morningEnergy,
      social,
      verted,
      pineapple,
      giveUp,
      communication,
      firstSight,
      morning, 
      travel,
      spicy,
      decisions,
      arrive,
      partner, 
      move,
      opposites,
      ghost,
      longDistance,
    }])
    .select();

    if (surveyError) {
      return res.status(400).json({ error: surveyError });
    }

    if (surveyData) {
      return res.status(200).json({ success: true, data: surveyData });
    } else {
      return res.status(500).json({ error: surveyError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserPrompts = async (req, res) => {
  try {
    const { userId, prompts } = req.body;
    let parsedPrompts;
    try {
      parsedPrompts = typeof prompts === 'string' ? JSON.parse(prompts) : prompts;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid prompts format. Must be an array.' });
    }
    if (!Array.isArray(parsedPrompts)) {
      return res.status(400).json({ error: 'Prompts must be an array of { prompt, response }' });
    }
    const insertData = parsedPrompts.map(item => ({
      userId,
      prompt: item.prompt,
      response: item.response,
    }));
    const { data: insertedPrompts, error: insertError } = await supabase
      .from('Prompts')
      .insert(insertData)
      .select();
    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      return res.status(400).json({ error: insertError.message });
    }
    return res.status(200).json({ success: true, data: insertedPrompts });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to save prompts' });
  }
};

export const createUserPhotos = async (req, res) => {
  try {
    const { userId, photos } = req.body;
    const photoArray = typeof photos === 'string' ? JSON.parse(photos) : photos;
    const insertData = photoArray
      .filter(photo => photo && photo !== 'null' && photo !== '')
      .map((photoUrl, index) => ({
        userId,
        photoUrl,
        order: index + 1,
      }));
    const { data, error } = await supabase
      .from('Photos')
      .insert(insertData)
      .select();
    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to upload photos' });
  }
};
