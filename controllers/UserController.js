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
      userId,
      ageRange,
      distance,
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
      longitude,
    } = req.body;

    const now = new Date();

    // Step 1: Fetch profiles with joined tables
    const { data, error } = await supabase
      .from('Profile')
      .select(`
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
      `)
      .neq('userId', userId);

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles.' });
    }

    let filtered = data.filter((profile) => {
      const about = profile.About;
      if (!about) return false;

      // Age from DOB
      if (ageRange) {
        const age = now.getFullYear() - new Date(about.dob).getFullYear();
        if (age < ageRange.min || age > ageRange.max) return false;
      }

      if (gender && about.gender !== gender) return false;
      if (background?.length && !background.includes(about.background)) return false;
      if (religion?.length && !religion.includes(about.religion)) return false;
      if (sect?.length && !sect.includes(about.sect)) return false;
      if (views?.length && !views.includes(about.views)) return false;
      if (drink?.length && !drink.includes(about.drink)) return false;
      if (smoke?.length && !smoke.includes(about.smoke)) return false;
      if (hasKids?.length && !hasKids.includes(about.hasKids)) return false;
      if (wantsKids?.length && !wantsKids.includes(about.wantsKids)) return false;
      if (lookingFor?.length && !lookingFor.includes(about.lookingFor)) return false;
      if (timeline?.length && !timeline.includes(about.timeline)) return false;
      if (relocate?.length && !relocate.includes(about.relocate)) return false;

      return true;
    });

    // Optional: Distance filter
    if (distance && latitude && longitude) {
      const R = 6371;
      filtered = filtered.filter((profile) => {
        if (!profile.latitude || !profile.longitude) return false;
        const dLat = (profile.latitude - latitude) * (Math.PI / 180);
        const dLon = (profile.longitude - longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(latitude * (Math.PI / 180)) *
            Math.cos(profile.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d <= distance;
      });
    }

    return res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Server crashed while filtering.' });
  }
};
