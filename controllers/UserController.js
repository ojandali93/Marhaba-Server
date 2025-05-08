import { supabase } from '../services/SupabaseClient.js';

export const grabSingleProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
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
    .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
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

const getAgeFromDOB = dob => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const arrayIntersects = (userValues, filterValues) => {
  if (!Array.isArray(filterValues) || !Array.isArray(userValues)) return false;

  const userSet = new Set(userValues.map(v => v.toLowerCase().trim()));
  return filterValues.some(v => userSet.has(v.toLowerCase().trim()));
};

export const getMatches = async (req, res) => {
  const {
    userId,
    distance,
    latitude,
    longitude,
    ageMin,
    ageMax,
    gender,
    background,
  } = req.body;

  console.log('req.body', req.body);
  console.log('✅ Match Query for userId:', userId, 'with distance:', distance);

  try {
    // Step 1: Get users who blocked the current user
    const { data: blockedBy, error: blockError } = await supabase
      .from('Blocked')
      .select('blockerId')
      .eq('blockedId', userId);

    if (blockError) throw blockError;
    const blockedByIds = blockedBy.map(row => row.blockerId);

    // Step 2: Get all other users
    const { data: allProfiles, error } = await supabase
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
        Notifications(*),
        Photos(*),
        Preferences(*),
        Prompts(*),
        Survey(*),
        Tags(*),
        Time(*),
        Values(*)
      `)
      .neq('userId', userId)
      .not('userId', 'in', `(${blockedByIds.join(',') || 'NULL'})`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let filtered = allProfiles;

    // ✅ Filter by distance
    if (latitude != null && longitude != null && distance) {
      filtered = filtered.filter(profile => {
        if (
          profile.latitude != null &&
          profile.longitude != null
        ) {
          const miles = getDistanceMiles(
            latitude,
            longitude,
            profile.latitude,
            profile.longitude
          );
          return miles <= distance;
        }
        return false;
      });
    }

    // ✅ Filter by age
    if (ageMin != null && ageMax != null) {
      filtered = filtered.filter(profile => {
        if (!profile.dob) return false;
        const age = getAgeFromDOB(profile.dob);
        return age >= ageMin && age <= ageMax;
      });
    }

    // ✅ Filter by gender
    if (gender) {
      filtered = filtered.filter(profile => profile.gender === gender);
    }

    // ✅ Filter by background
    if (background?.length) {
      filtered = filtered.filter(profile => {
        const about = Array.isArray(profile.About) ? profile.About[0] : profile.About;
        if (!about || !about.background) return false;

        let userBackground = about.background;
        if (typeof userBackground === 'string') {
          try {
            userBackground = JSON.parse(userBackground);
          } catch (err) {
            console.warn('Invalid user background JSON:', userBackground);
            return false;
          }
        }

        return arrayIntersects(userBackground, background);
      });
    }

    return res.status(200).json({ success: true, matches: filtered });
  } catch (err) {
    console.error('❌ Match query error:', err);
    return res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export function getDistanceMiles(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;

  const R = 3958.8; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Utility functions
const getAge = dob => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
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
          Notifications(*),
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

// Node.js + Supabase (using Supabase JS client)

export const filterProfiles = async (req, res) => {
  try {
    const {
      userId,
      ageMin,
      ageMax,
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
      distance,
    } = req.body;

    const now = new Date();

    let { data, error } = await supabase
      .from('Profile')
      .select(`
        *,
        About(*),
        Photos(*),
        Anger(*),
        Attachment(*),
        Career(*),
        Communication(*),
        Core(*),
        Emotions(*),
        Future(*),
        Lifestyle(*),
        Love(*),
        Notifications(*),
        Preferences(*),
        Prompts(*),
        Survey(*),
        Tags(*),
        Time(*),
        Values(*)
      `)
      .neq('userId', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch profiles.' });
    }

    if (!data) {
      return res.status(200).json({ success: true, data: [] });
    }

    const filtered = data.filter((profile) => {
      const about = Array.isArray(profile.About) ? profile.About[0] : profile.About;
      if (!about) return false;

      // Age check using DOB
      if (profile.dob && ageMin && ageMax) {
        const age = now.getFullYear() - new Date(profile.dob).getFullYear();
        if (age < ageMin || age > ageMax) return false;
      }

      const match = (val, arr) => {
        if (!arr?.length) return true;
        if (val === null || val === undefined) return false;
        return arr.some(
          item => item.toLowerCase().trim() === val.toLowerCase().trim()
        );
      };

      return (
        match(profile.gender, gender?.length ? [gender] : []) &&
        match(about.background, background) &&
        match(about.religion, religion) &&
        match(about.sect, sect) &&
        match(about.views, views) &&
        match(about.drink, drink) &&
        match(about.smoke, smoke) &&
        match(about.hasKids, hasKids) &&
        match(about.wantsKids, wantsKids) &&
        match(about.lookingFor, lookingFor) &&
        match(about.timeline, timeline) &&
        match(about.relocate, relocate)
      );
    });

    // Distance filter
    const R = 6371;
    const final = distance && latitude && longitude
      ? filtered.filter((p) => {
          if (!p.latitude || !p.longitude) return false;
          const dLat = (p.latitude - latitude) * (Math.PI / 180);
          const dLon = (p.longitude - longitude) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(latitude * (Math.PI / 180)) *
              Math.cos(p.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c <= distance;
        })
      : filtered;

    return res.status(200).json({ success: true, data: final });
  } catch (err) {
    return res.status(500).json({ error: 'Server crashed.' });
  }
};

export const updateNotifications = async (req, res) => {
  try {
    const { userId, messages, matches, likes, weeklyViews, miscellanious } = req.body;
    const { data, error } = await supabase
      .from('Notifications')
      .update({ messages, matches, likes, weeklyViews, miscellanious })
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

export const updateVisibility = async (req, res) => {
  try {
    const { userId, visibility } = req.body;
    const { data, error } = await supabase
      .from('Profile')
      .update({ visibility })
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

export const updateViewed = async (req, res) => {
  const { userId } = req.body;
  try {
    const { data, error } = await supabase
      .from('Interactions')
      .update({ viewed: true, viewed_at: new Date() })
      .eq('targetUserId', userId)

    if (error) {
      console.error('Error fetching interactions:', error);
      return res.status(500).json({ error: error });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error updating viewed:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};