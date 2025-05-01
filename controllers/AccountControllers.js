import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';
import multer from 'multer';

export const createUserAccount = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: signupUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This triggers Supabase to send a confirmation email
      user_metadata: {
        name,
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



export const createUserProfile = async (req, res) => {
  try {
    const { userId,  email, name, dob, gender, height, fcmToken, approved, tier, longitude, latitude, phone } = req.body;

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
      tier,
      longitude,
      latitude,
      phone
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
    const { userId, lookingFor,  background, religion, sect, views, smoke, drink, hasKids, wantsKids, timeline, travel } = req.body;

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
      drink,
      hasKids, 
      wantsKids,
      timeline,
      travel
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

export const createUserCore = async (req, res) => {
  try {
    const { userId, family, faith,  ambition, career, honest, transparent, trust, politics, social } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Core')
    .insert([{
      userId,
      family,
      faith,
      ambition,
      career,
      honest,
      transparent,
      trust,
      politics,
      social
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
    const { userId, marriage, children, career, finances, pace, live } = req.body;

    const { data: preferencesData, error: preferencesError } = await supabase
    .from('Future')
    .insert([{
      userId,
      marriage,
      children,
      career,
      finances,
      pace,
      live,
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
    const { userId, name, gender, height, smoke, drink, hasKid } = req.body;
    console.log(userId, name, gender, height, smoke, drink, hasKid);
    const { data, error } = await supabase
      .from('Profile')
      .update({ name, gender, height })
      .eq('userId', userId)
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: aboutData, error: aboutError } = await supabase
      .from('About')
      .update({ smoke, drink, hasKids: hasKid })
      .eq('userId', userId)
      .select();

    if (aboutError) {
      console.log(aboutError);
      return res.status(400).json({ error: aboutError.message });
    }

    return res.status(200).json({ success: true, data, aboutData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const updateUserAbout = async (req, res) => {
  try {
    const { userId, lookingFor, background, religion, sect, views, timeline, travel, wantsKids } = req.body;
     
    console.log(userId, lookingFor, background, religion, sect, views, timeline, travel, wantsKids);

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
    const { userId, family, faith,  ambition, career, honest, transparent, trust, politics, social } = req.body;
     
    console.log(userId, family, faith,  ambition, career, honest, transparent, trust, politics, social);
    
    const { data, error } = await supabase
      .from('Core')
      .update({ family, faith,  ambition, career, honest, transparent, trust, politics, social })
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

export const updateuserLifestyle = async (req, res) => {
  try {
    const { userId, travel, social, health, finances, living } = req.body;
     
    console.log(userId, travel, social, health, finances, living);
    
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
     
    console.log(userId, marriage, children, career, finances, pace, live);
    
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

export const updateUserCareer = async (req, res) => {
  try {
    const { userId, job,  company, site, location, education, fiveYear } = req.body;
     
    console.log(userId, job,  company, site, location, education, fiveYear);
    
    const { data, error } = await supabase
      .from('Career')
      .update({ job,  company, site, location, education, fiveYear })
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
    const { userId, traits } = req.body;

    if (!userId || !Array.isArray(traits)) {
      return res.status(400).json({ error: 'Invalid userId or traits' });
    }

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
    const insertData = traits.map((tag) => ({
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
