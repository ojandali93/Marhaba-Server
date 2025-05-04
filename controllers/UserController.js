import { supabase } from '../services/SupabaseClient.js';

export const grabSingleProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
    .eq('userId', userId)

    if (profileError) {
      console.error('❌ Supabase error:', profileError);
      return res.status(400).json({ error: profileError.message || 'Failed to fetch profile.' });
    }

    if (!profileData) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    return res.status(200).json({ success: true, data: profileData });

  }catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing profile.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const grabAllUsers = async (req, res) => {
  try {
    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
    .order('created_at', { ascending: false });


    if (profileError) {
      console.error('❌ Supabase error:', profileError);
      return res.status(400).json({ error: profileError.message || 'Failed to fetch profiles.' });
    }

    if (profileData === null) {
        console.warn('⚠️ Supabase query succeeded but returned null data.');
        return res.status(404).json({ error: 'Failed to retrieve profile data.' });
    }

    return res.status(200).json({ success: true, data: profileData });

  }catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing profiles.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const likeProfile = async (req, res) => {
  const {
    userId,
    targetUserId,
    userInteraction,
    targetInteraction,
    viewed,
    approved,
    viewed_at,
    approved_at, 
    message
  } = req.body;
  try {
    const { data: likeData, error: likeError } = await supabase
      .from('Interactions')
      .insert([{
        userId,
        userInteraction,
        targetUserId,
        targetInteraction,
        viewed,
        approved,
        approved_at,
        message,
        viewed_at
      }])
      .select();

    if (likeError) {
      console.error('❌ Supabase error:', likeError);
      return res.status(400).json({ error: likeError.message || 'Failed to insert interaction.' });
    }

    if (!likeData) {
      return res.status(404).json({ error: 'Interaction insert returned no data.' });
    }

    return res.status(200).json({ success: true, data: likeData });
  } catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while inserting interaction.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const getUserInteractions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const { data, error } = await supabase
      .from('Interactions')
      .select(`
        *, 
        likerProfile:userId ( 
          *,
          About(*),
          Anger(*),
          Attachment(*),
          Career(*),
          Communication(*),
          Core(*),
          Emotions(*),
          Future(*),
          Lifestyle(*),
          Love(*),
          Photos(*),
          Preferences(*),
          Prompts(*),
          Survey(*),
          Tags(*),
          Time(*),
          Values(*)
        )
      `)
      .eq('targetUserId', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: 'Failed to fetch interactions' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const approvedInteraction = async (req, res) => {
  try {
    const { id } = req.body;

    const { data, error } = await supabase
      .from('Interactions')
      .update({ viewed: true, approved: true })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const updateInteraction = async (req, res) => {
  try {
    const { 
      id,
      userId,
      targetUserId,
      userInteraction,
      targetInteraction,
      viewed,
      approved,
      viewed_at,
      approved_at, 
      message
     } = req.body;

    const { data, error } = await supabase
      .from('Interactions')
      .update({ 
        userId,
        targetUserId,
        userInteraction,
        targetInteraction,
        viewed,
        approved,
        viewed_at,
        approved_at, 
        message
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const CheckUserMatchStatus = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const { data, error } = await supabase
      .from('Interactions')
      .select()
      .eq('userId', userId2)
      .eq('targetUserId', userId1)

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const { userId, longitude, latitude } = req.body;
    const { data, error } = await supabase
      .from('Profile')
      .update({ longitude, latitude })
      .eq('userId', userId)

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const updateUserTutorial = async (req, res) => {
  try {
    const { userId, tutorial } = req.body;
    const { data, error } = await supabase
      .from('Profile')
      .update({ tutorial })
      .eq('userId', userId)

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const getWeeklyInteractionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all interactions where user is either sender or receiver
    const { data, error } = await supabase
      .from('Interactions')
      .select('userId, targetUserId, userInteraction, targetInteraction, created_at')
      .or(`userId.eq.${userId},targetUserId.eq.${userId}`)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching weekly stats:', error);
      return res.status(500).json({ error: 'Failed to fetch interactions' });
    }

    let likesSent = 0;
    let superLikesSent = 0;

    for (const interaction of data) {
      if (interaction.userId === userId) {
        if (interaction.userInteraction === 'liked') likesSent++;
        else if (interaction.userInteraction === 'super') superLikesSent++;
      }
      if (interaction.targetUserId === userId) {
        if (interaction.targetInteraction === 'liked') likesSent++;
        else if (interaction.targetInteraction === 'super') superLikesSent++;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        likesSentThisWeek: likesSent,
        superLikesSentThisWeek: superLikesSent,
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

export const filterProfiles = async (req, res) => {
  try {
    const {
      userId, // current user making the request
      ageRange,            // { min: number, max: number }
      distance,            // in kilometers
      gender,
      background,
      religion,
      sect,
      views,
      drink,
      smoke,
      hasKids,
      wantsKids,
      lookingFor,
      timeline,
      relocate,
      latitude,
      longitude
    } = req.body;

    console.log(req.body);

    // Step 1: Fetch all profiles excluding the current user
    const filters = [];
    if(gender) filters.push(`about.gender = ${gender}`);

    if (background && Array.isArray(background)){
      filters.push(`about.background IN (${background.map(b => `'${b}'`).join(',')})`);
    } else if (background) filters.push(`about.background = '${background}'`);

    if (religion && Array.isArray(religion)){
      filters.push(`about.religion IN (${religion.map(b => `'${b}'`).join(',')})`);
    } else if (religion) filters.push(`about.religion = '${religion}'`);

    if (sect && Array.isArray(sect)){
      filters.push(`about.sect IN (${sect.map(b => `'${b}'`).join(',')})`);
    } else if (sect) filters.push(`about.sect = '${sect}'`);

    if (views && Array.isArray(views)){
      filters.push(`about.views IN (${views.map(b => `'${b}'`).join(',')})`);
    } else if (views) filters.push(`about.views = '${views}'`);

    if (drink && Array.isArray(drink)){
      filters.push(`about.drink IN (${drink.map(b => `'${b}'`).join(',')})`);
    } else if (drink) filters.push(`about.drink = '${drink}'`);

    if (smoke && Array.isArray(smoke)){
      filters.push(`about.smoke IN (${smoke.map(b => `'${b}'`).join(',')})`);
    } else if (smoke) filters.push(`about.smoke = '${smoke}'`);

    if (hasKids && Array.isArray(hasKids)){
      filters.push(`about.hasKids IN (${hasKids.map(b => `'${b}'`).join(',')})`);
    } else if (hasKids) filters.push(`about.hasKids = '${hasKids}'`);

    if (wantsKids && Array.isArray(wantsKids)){
      filters.push(`about.wantsKids IN (${wantsKids.map(b => `'${b}'`).join(',')})`);
    } else if (wantsKids) filters.push(`about.wantsKids = '${wantsKids}'`);

    if (lookingFor && Array.isArray(lookingFor)){
      filters.push(`about.lookingFor IN (${lookingFor.map(b => `'${b}'`).join(',')})`);
    } else if (lookingFor) filters.push(`about.lookingFor = '${lookingFor}'`);

    if (timeline && Array.isArray(timeline)){
      filters.push(`about.timeline IN (${timeline.map(b => `'${b}'`).join(',')})`);
    } else if (timeline) filters.push(`about.timeline = '${timeline}'`);

    if (relocate && Array.isArray(relocate)){
      filters.push(`about.relocate IN (${relocate.map(b => `'${b}'`).join(',')})`);
    } else if (relocate) filters.push(`about.relocate = '${relocate}'`);
    
    if (ageRange && ageRange.min && ageRange.max) {
      filters.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, about.dob)) BETWEEN ${ageRange.min} AND ${ageRange.max}`);
    }

    const whereClause = filters.length ? `WHERE p.userId != '${userId}' AND ${filters.join(' AND ')}` : `WHERE p.userId != '${userId}'`;

    const sql = `
      SELECT p.*, about.*, anger.*, attachment.*, career.*, communication.*, core.*, emotions.*, future.*, lifestyle.*, love.*, photos.*, preferences.*, prompts.*, survey.*, tags.*, time.*, values.*
      FROM Profile p
      LEFT JOIN About a ON p.userId = a.userId
      LEFT JOIN Anger anger ON p.userId = anger.userId
      LEFT JOIN Attachment attachment ON p.userId = attachment.userId
      LEFT JOIN Career career ON p.userId = career.userId
      LEFT JOIN Communication communication ON p.userId = communication.userId
      LEFT JOIN Core core ON p.userId = core.userId
      LEFT JOIN Emotions emotions ON p.userId = emotions.userId
      LEFT JOIN Future future ON p.userId = future.userId
      LEFT JOIN Lifestyle lifestyle ON p.userId = lifestyle.userId
      LEFT JOIN Love love ON p.userId = love.userId
      LEFT JOIN Photos ph ON p.userId = ph.userId
      LEFT JOIN Preferences preferences ON p.userId = preferences.userId
      LEFT JOIN Prompts prompts ON p.userId = prompts.userId
      LEFT JOIN Survey survey ON p.userId = survey.userId
      LEFT JOIN Tags tags ON p.userId = tags.userId
      LEFT JOIN Time time ON p.userId = time.userId
      LEFT JOIN Values values ON p.userId = values.userId
      ${whereClause}
    `;

    const { data, error } = await supabase.rpc('execute_sql_query', { query_text: sql });

    if (error) {
      console.error('❌ Error executing raw SQL query:', error);
      return res.status(500).json({ error: 'Failed to filter profiles.' });
    }

    let filteredProfiles = data;
    if (distance && latitude && longitude) {
      const R = 6371;
      filteredProfiles = data.filter(profile => {
        if (!profile.latitude || !profile.longitude) return false;
        const dLat = (profile.latitude - latitude) * (Math.PI / 180);
        const dLon = (profile.longitude - longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(latitude * (Math.PI / 180)) *
            Math.cos(profile.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceToProfile = R * c;
        return distanceToProfile <= distance;
      });
    }

    return res.status(200).json({ success: true, data: filteredProfiles });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Server crashed while filtering.' });
  }
};