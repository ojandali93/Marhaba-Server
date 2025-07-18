import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';
import multer from 'multer';

export const createUserAccount = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: signupUser, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      email_confirm: false, // ✅ Let Supabase trigger email verification
      options: {
        emailRedirectTo: 'https://marhabahapp.github.io/VerifyEmailPage/', // ✅ GitHub Page
      },
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

export const checkUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { data: signupUser, error: signUpError } = await await supabase
    .from('Profile')
    .select('email')
    .eq('email', email)

    if (signupUser) {
      return res.status(200).json({ success: true, data: signupUser });
    } else {
      return res.status(200).json({ error: 'User ID not returned' });
    }
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserProfile = async (req, res) => {
  try {
    const { userId, name,  email, fcmToken, approved, tier, longitude, latitude, visibility, agreements } = req.body;
    console.log('userId:', userId);

    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .insert([{
      userId,
      name,
      email,
      fcmToken,
      approved,
      tier,
      longitude,
      latitude,
      tutorial: true,
      visibility,
      jwtToken: null,
      admin: false,
      passHash: '',
      pinHash: '',
      agreements,
    }])
    .select();

    if (profileError) {
      console.log('profileError:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    if (profileData) {
      console.log('profileData:', profileData);
      return res.status(200).json({ success: true, data: profileData });
    } else {
      return res.status(500).json({ error: profileError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createNotifications = async (req, res) => {
  try {
    const { userId, messages, matches, likes, weeklyViews, miscellanious } = req.body;

    const { data: profileData, error: profileError } = await supabase
    .from('Notifications')
    .insert([{
      userId,
      messages,
      matches, 
      likes,
      weeklyViews,
      miscellanious,
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
    const { userId, name, email, phone, dob, gender, height, background, videoIntro } = req.body;

    const { data: aboutData, error: aboutError } = await supabase
    .from('About')
    .insert([{
      userId,
      name,
      email,
      phone,
      dob,
      gender,
      height,
      background,
      videoIntro
    }])
    .select();

    if (aboutError) {
      return res.status(400).json({ error: aboutError });
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

export const createIntent = async (req, res) => {
  try {
    const { userId, intentions, timeline, marriage, marriageStatus, longDistance, relocate, firstStep } = req.body;

    const { data: intentData, error: intentError } = await supabase
    .from('Intent')
    .insert([{
      userId,
      intentions,
      timeline,
      marriage,
      marriageStatus,
      longDistance,
      relocate,
      firstStep,
    }])
    .select();

    if (intentError) {
      return res.status(400).json({ error: intentError });
    }

    if (intentData) {
      return res.status(200).json({ success: true, data: intentData });
    } else {
      return res.status(500).json({ error: intentError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createHabits = async (req, res) => {
  try {
    const { userId, smoking, drinking, hasKids, wantsKids, sleep, excersize, diet, updated_at } = req.body;

    const { data: habitsData, error: habitsError } = await supabase
    .from('Habits')
    .insert([{
      userId,
      smoking,
      drinking,
      hasKids,
      wantsKids,
      sleep,
      excersize,
      diet,
      updated_at,
    }])
    .select();

    if (habitsError) {
      return res.status(400).json({ error: habitsError });
    }

    if (habitsData) {
      return res.status(200).json({ success: true, data: habitsData });
    } else {
      return res.status(500).json({ error: habitsError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createReligion = async (req, res) => {
  try {
    const { userId, religion, sect, practicing, openness, updated_at } = req.body;

    const { data: religionData, error: religionError } = await supabase
    .from('Religion')
    .insert([{
      userId,
      religion,
      sect,
      practicing,
      openness,
      updated_at,
    }])
    .select();

    if (religionError) {
      return res.status(400).json({ error: religionError });
    }

    if (religionData) {
      return res.status(200).json({ success: true, data: religionData });
    } else {
      return res.status(500).json({ error: religionError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserCore = async (req, res) => {
  try {
    const { userId, family, faith, ambition, career, conflicts, independence, decisions, politics, updated_at } = req.body;

    const { data: coreData, error: coreError } = await supabase
    .from('Core')
    .insert([{
      userId,
      family,
      faith,
      ambition,
      career,
      conflicts,
      independence,
      decisions,
      politics,
      updated_at
    }])
    .select();

    console.log('coreData:', coreData); 
    console.log('coreError:', coreError);

    if (coreError) {
      return res.status(400).json({ error: coreError });
    }

    if (coreData) {
      return res.status(200).json({ success: true, data: coreData });
    } else {
      return res.status(500).json({ error: coreError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserRelationships = async (req, res) => {
  try {
    const { userId, commStyle, loveLanguages, values, time, updated_at } = req.body;

    console.log('userId:', userId);

    const { data: relationshipsData, error: relationshipsError } = await supabase
    .from('Relationships')
    .insert([{
      userId,
      communication: commStyle,
      loveLanguages,
      values,
      time,
      updated_at
    }])
    .select();

    console.log('relationshipsData:', relationshipsData); 
    console.log('relationshipsError:', relationshipsError);

    if (relationshipsError) {
      return res.status(400).json({ error: relationshipsError });
    }

    if (relationshipsData) {
      return res.status(200).json({ success: true, data: relationshipsData });
    } else {
      return res.status(500).json({ error: relationshipsError });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const createUserCareer = async (req, res) => {
  try {
    const { userId, job,  company, industry, relocate, site, education, updated_at } = req.body;

    const { data: careerData, error: careerError } = await supabase
    .from('Career')
    .insert([{
      userId,
      job,
      company,
      site, 
      industry,
      relocate,
      education,
      updated_at
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

export const createUserSocial = async (req, res) => {
  try {
    const { userId } = req.body;

    const { data: socialData, error: socialError } = await supabase
    .from('Social')
    .insert([{
      userId,
      instagram: null,
      facebook: null,
      twitter: null,
      tiktok: null,
      linkedin: null
    }])
    .select();

    if (socialError) {
      return res.status(400).json({ error: aboutError.socialError });
    }

    if (socialData) {
      return res.status(200).json({ success: true, data: socialData });
    } else {
      return res.status(500).json({ error: socialError });
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
    const { userId, gender,  distance, religion, sect, views, ageMin, ageMax, background } = req.body;
    console.log('userId:', userId); 
    console.log('gender:', gender);

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
      ageMin,
      background
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
  const { userId, prompts } = req.body;

  try {
    if (!userId || typeof prompts !== 'object') {
      return res.status(400).json({ error: 'Invalid request' });
    } else {
      const { data, error } = await supabase
        .from('Prompts')
        .insert([
          { 
            userId,  
            t_who: prompts.t_who,
            t_makes_me: prompts.t_makes_me,
            t_weekends: prompts.t_weekends,
            t_friends: prompts.t_friends,
            t_master: prompts.t_master,
            t_make_time: prompts.t_make_time,
            t_daily: prompts.t_daily,
            t_love: prompts.t_love,
            t_faith: prompts.t_faith,
            t_appreciate: prompts.t_appreciate,
            t_lifestyle: prompts.t_lifestyle,
            t_refuse: prompts.t_refuse,
            t_show: prompts.t_show,
            t_grow: prompts.t_grow,
            t_life: prompts.t_life,
            t_moment: prompts.t_moment,
            t_deep: prompts.t_deep,
            t_partner: prompts.t_partner,
            t_lifelong: prompts.t_lifelong
          }
        ])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error.message);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ success: true, data });
    }
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

export const editUserPhotos = async (req, res) => {
  try {
    const { userId, photos } = req.body;

    // Parse photo array from JSON if passed as a string
    const photoArray = typeof photos === 'string' ? JSON.parse(photos) : photos;

    if (!Array.isArray(photoArray) || photoArray.length === 0) {
      return res.status(400).json({ error: 'No photos provided.' });
    }

    // 1. Delete existing photos for this user
    const { error: deleteError } = await supabase
      .from('Photos')
      .delete()
      .eq('userId', userId);

    if (deleteError) {
      console.error('❌ Supabase delete error:', deleteError.message);
      return res.status(400).json({ error: 'Failed to delete existing photos' });
    }

    // 2. Prepare new insert data
    const insertData = photoArray
      .filter(photo => photo && photo !== 'null' && photo !== '')
      .map((photoUrl, index) => ({
        userId,
        photoUrl,
        order: index + 1,
      }));

    // 3. Insert new photos
    const { data, error: insertError } = await supabase
      .from('Photos')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Server error:', error.message);
    return res.status(500).json({ error: 'Failed to update photos' });
  }
};


// Communication Style Endpoint
export const createCommunicationStyles = async (req, res) => {
  try {
    const { userId, commStyle } = req.body;
    const commArray = typeof commStyle === 'string' ? commStyle.split(',') : commStyle;

    const insertData = commArray.map(style => ({
      userId,
      style: style.trim(),
    }));

    const { data, error } = await supabase
      .from('Communication')
      .insert(insertData);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create communication styles' });
  }
};

// Love Language Endpoint
export const createLoveLanguage = async (req, res) => {
  try {
    const { userId, loveLanguage } = req.body;
    const langArray = typeof loveLanguage === 'string' ? loveLanguage.split(',') : loveLanguage;

    const insertData = langArray.map(language => ({
      userId,
      language: language.trim(),
    }));

    const { data, error } = await supabase
      .from('Love')
      .insert(insertData);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create love languages' });
  }
};

// Core Values Endpoint
export const createCoreValues = async (req, res) => {
  try {
    const { userId, coreValues } = req.body;
    const valueArray = typeof coreValues === 'string' ? coreValues.split(',') : coreValues;

    const insertData = valueArray.map(values => ({
      userId,
      value: values.trim(),
    }));

    const { data, error } = await supabase
      .from('Values')
      .insert(insertData);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create core values' });
  }
};

// Time Priorities Endpoint
export const createTimePriorities = async (req, res) => {
  try {
    const { userId, timePriority } = req.body;
    const timeArray = typeof timePriority === 'string' ? timePriority.split(',') : timePriority;

    const insertData = timeArray.map(priority => ({
      userId,
      priority: priority.trim(),
    }));

    const { data, error } = await supabase
      .from('Time')
      .insert(insertData);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create time priorities' });
  }
};

const upload = multer({ storage: multer.memoryStorage() }); // ⬅️ multer is LOCAL here!

export const uploadImage = [
  upload.single('file'), // ⬅️ multer handles the incoming file

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided.' });
      }

      const fileBuffer = req.file.buffer;
      const originalName = req.file.originalname;
      const uniqueName = `${uuidv4()}_${originalName}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(uniqueName, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload to storage' });
      }

      const publicUrl = `https://mxwqscooobwlsdgmxjsa.supabase.co/storage/v1/object/public/profile-images/${uniqueName}`;

      return res.status(200).json({ success: true, url: publicUrl });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
];

const uploadVideoSignle = multer({
  storage: multer.memoryStorage(), // or diskStorage if you want
  limits: {
    fileSize: 75 * 1024 * 1024, // 50 MB → good for 30–60 sec videos
  },
});

export const uploadVideo = [
  uploadVideoSignle.single('file'), // ⬅️ multer handles the incoming file

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided.' });
      }

      const fileBuffer = req.file.buffer;
      const originalName = req.file.originalname;
      const uniqueName = `${uuidv4()}_${originalName}`;

      const { data, error } = await supabase.storage
        .from('profile-videos')
        .upload(uniqueName, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload to storage' });
      }

      const publicUrl = `https://mxwqscooobwlsdgmxjsa.supabase.co/storage/v1/object/public/profile-videos/${uniqueName}`;

      return res.status(200).json({ success: true, url: publicUrl });
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
];

export const createUserEmotions = async (req, res) => {
  try {
    const { userId, conflict, apology, stress, emotion } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Emotions')
    .insert([{
      userId,
      conflict,
      apology,
      stress,
      emotion,
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

export const createUserAttachment = async (req, res) => {
  try {
    const { userId, close, partner, fear, independent, response } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Attachment')
    .insert([{
      userId,
      close,
      partner,
      fear,
      independent,
      response,
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

export const createUserLifestyle = async (req, res) => {
  try {
    const { userId, travel, social, health, finances, living } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Lifestyle')
    .insert([{
      userId,
      travel,
      social,
      health,
      finances,
      living,
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

export const createUserFuture = async (req, res) => {
  try {
    const { userId, career, finances, pace, live, fiveYears, updated_at } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Future')
    .insert([{
      userId,
      career,
      finances,
      pace,
      live,
      fiveYears,
      updated_at
    }])
    .select();

    if (preferencesError) {
      console.log('future error:', preferencesError);
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

export const createUserAnger = async (req, res) => {
  try {
    const { userId, triggers } = req.body; // ✅ triggers (plural)

    if (!Array.isArray(triggers)) {
      return res.status(400).json({ error: 'Triggers must be an array' });
    }

    const records = triggers.map(trigger => ({
      userId,
      trigger, // ✅ Make a record for each trigger
    }));

    const { data, error } = await supabase
      .from('Anger') // ✅ Correct your table name here
      .insert(records)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Failed to create anger triggers' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, name, phone, height } = req.body;
    const { data, error } = await supabase
      .from('About')
      .update({ name, phone, height })
      .eq('userId', userId)
      .select();

    console.log('data:', data);
    console.log('error:', error);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserBackground = async (req, res) => {
  try {
    const { userId, background } = req.body;
    const { data, error } = await supabase
      .from('About')
      .update({ background })
      .eq('userId', userId)
      .select();

    console.log('data:', data);
    console.log('error:', error);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserIntent = async (req, res) => {
  try {
    const { userId, intentions, marriage, marriageStatus, longDistance, relocate, firstStep, timeline } = req.body;
    const { data, error } = await supabase
      .from('Intent')
      .update({ intentions, marriage, marriageStatus, longDistance, relocate, firstStep, timeline })
      .eq('userId', userId)
      .select();

    console.log('data:', data);
    console.log('error:', error);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserReligion = async (req, res) => {
  try {
    const { userId, religion, sect, practicing, openness } = req.body;
    const { data, error } = await supabase
      .from('Religion')
      .update({ religion, sect, practicing, openness })
      .eq('userId', userId)
      .select();

    console.log('data:', data);
    console.log('error:', error);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserAbout = async (req, res) => {
  try {
    const { userId, lookingFor, background, religion, sect, views, timeline, travel, wantsKids } = req.body;
     

    const { data, error } = await supabase
      .from('About')
      .update({ lookingFor, background,religion, sect, views, timeline, travel, wantsKids })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserCore = async (req, res) => {
  try {
    const { userId, family, faith,  ambition, careerVsFamily, conflicts, independence, decisions, politics } = req.body;
    
    const { data, error } = await supabase
      .from('Core')
      .update({ family, faith,  ambition, career: careerVsFamily, conflicts, independence, decisions, politics })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserRelationships = async (req, res) => {
  try {
    const { userId, communication, loveLanguages, values, time } = req.body;
    
    const { data, error } = await supabase
      .from('Relationships')
      .update({ communication, loveLanguages, values, time })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserCareer = async (req, res) => {
  try {
    const { userId, job,  company, site, relocate, education, industry } = req.body;
     
    console.log(req.body);
    console.log('industry:', industry);
    
    const { data, error } = await supabase
      .from('Career')
      .update({ job,  company, site, relocate, education, industry })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log('data:', data);  
    console.log('error:', error);

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateuserLifestyle = async (req, res) => {
  try {
    const { userId, travel, social, health, finances, living } = req.body;
     
    
    const { data, error } = await supabase
      .from('Lifestyle')
      .update({ travel, social, health, finances, living })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserFuture = async (req, res) => {
  try {
    const { userId, marriage, children, career, finances, pace, live } = req.body;
     
    
    const { data, error } = await supabase
      .from('Future')
      .update({ marriage, children, career, finances, pace, live })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserPrompts = async (req, res) => {
  try {
    const { userId, prompts } = req.body;

    if (!userId || !Array.isArray(prompts)) {
      return res.status(400).json({ error: 'Missing userId or prompts array' });
    }

    // 1. Delete existing prompts for this user
    const { error: deleteError } = await supabase
      .from('Prompts')
      .delete()
      .eq('userId', userId);

    if (deleteError) {
      console.error('❌ Failed to delete existing prompts:', deleteError.message);
      return res.status(400).json({ error: deleteError.message });
    }

    // 2. Insert new prompts
    const insertData = prompts.map(p => ({
      userId,
      prompt: p.prompt,
      response: p.response,
    }));

    const { data, error: insertError } = await supabase
      .from('Prompts')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('❌ Failed to insert new prompts:', insertError.message);
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Server error:', error.message || error);
    return res.status(500).json({ error: 'Failed to update user prompts' });
  }
};

export const updateUserTags = async (req, res) => {
  try {
    const { userId, tags } = req.body;

    // Step 1: Delete all existing tags
    const { error: deleteError } = await supabase
      .from('Tags')
      .delete()
      .eq('userId', userId);

    if (deleteError) {
      console.error('❌ Error deleting tags:', deleteError.message);
      return res.status(400).json({ error: 'Failed to clear existing tags' });
    }

    // Step 2: Create new tag records
    const insertData = tags.map((tag) => ({
      userId,
      tag,
    }));

    const { data, error: insertError } = await supabase
      .from('Tags')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('❌ Error inserting tags:', insertError.message);
      return res.status(400).json({ error: 'Failed to insert new tags' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Server error updating tags:', error.message);
    return res.status(500).json({ error: 'Server error updating tags' });
  }
};

export const updateSurvey = async (req, res) => {
  try {
    const { userId, eitherOr } = req.body;
     
    
    const { data, error } = await supabase
      .from('Survey')
      .update(eitherOr)
      .eq('userId', userId)
      .select();
    
    if (error) {
      console.log(error);
      console.log(error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateViews = async (req, res) => {
  try {
    const { userId, view } = req.body;
    console.log(userId);
    console.log(view);
    const { data, error } = await supabase
      .from('Profile')
      .update({ mainView: view })
      .eq('userId', userId)
      .select();

    console.log(data);
    
    if (error) {
      console.log(error);
      console.log(error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

