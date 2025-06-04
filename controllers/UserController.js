import { supabase } from '../services/SupabaseClient.js';

export const grabSingleProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Subscriptions(*), Survey(*), Tags(*)')
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
    .select('*, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Subscriptions(*), Survey(*), Tags(*)')
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

  const userSet = new Set(userValues.map(v => v.trim()));
  return filterValues.some(v => userSet.has(v.trim()));
};

export const getMatches = async (req, res) => {
  const {
    userId,
    distance,
    latitude,
    longitude,
    ageMin,
    ageMax,
  } = req.body;

  console.log('🔍 Incoming request:', JSON.stringify(req.body, null, 2));

  try {
    // STEP 1: Blocked users
    const { data: blockedBy, error: blockError } = await supabase
      .from('Blocked')
      .select('blockerId')
      .eq('blockedId', userId);

    if (blockError) throw blockError;
    const blockedByIds = blockedBy.map(row => row.blockerId);
    console.log(`🛑 Blocked by users (${blockedByIds.length}):`, blockedByIds);

    // STEP 2: Interactions
    const { data: interactions, error: interactionError } = await supabase
      .from('Interactions')
      .select('userId, targetUserId')
      .or(`userId.eq.${userId},targetUserId.eq.${userId}`);

    if (interactionError) throw interactionError;

    const interactedUserIds = new Set();
    interactions.forEach(i => {
      if (i.userId !== userId) interactedUserIds.add(i.userId);
      if (i.targetUserId !== userId) interactedUserIds.add(i.targetUserId);
    });

    console.log(`🔁 Interacted with users (${interactedUserIds.size}):`, [
      ...interactedUserIds,
    ]);

    // STEP 3: Fetch all profiles
    const { data: compatibilityWithProfiles, error } = await supabase
      .from('CompatibilityScores')
      .select(`
        score,
        user2,
        user2Profile: user2 ( 
          *, 
          About(*), 
          Career(*), 
          Core(*), 
          Future(*), 
          Habits(*), 
          Intent(*), 
          Notifications(*), 
          Photos(*), 
          Preferences(*), 
          Prompts(*), 
          Relationships(*), 
          Religion(*), 
          Social(*), 
          Subscriptions(*),
          Survey(*), 
          Tags(*) 
        )
      `)
      .eq('user1', userId)
      .not('user2', 'in', `(${[...blockedByIds, ...interactedUserIds].join(',') || 'NULL'})`)
      .order('score', { ascending: false })

    if (error) throw error;

    console.log(`📦 Fetched ${compatibilityWithProfiles.length} total profiles`);

    // STEP 4: Distance Filter
    let afterDistance = compatibilityWithProfiles;
    if (latitude != null && longitude != null && distance) {
      afterDistance = compatibilityWithProfiles.filter(profile => {
        const user = profile.user2Profile;
        if (user?.latitude && user?.longitude) {
          const miles = getDistanceMiles(
            latitude,
            longitude,
            user.latitude,
            user.longitude
          );
          return miles <= distance;
        }
        return false;
      });

      console.log(
        `📍 After distance filter (${distance} mi): ${afterDistance.length} profiles`
      );
    }

    // STEP 5: Age Filter
    let afterAge = [];
    if (ageMin != null && ageMax != null) {
      afterAge = afterDistance.filter(profile => {
        const user = profile.user2Profile;
        const dob = user?.About?.[0]?.dob;
        if (!dob) return false;
        const age = getAgeFromDOB(dob);
        return age >= ageMin && age <= ageMax;
      });

      console.log(
        `🎂 After age filter (${ageMin}–${ageMax}): ${afterAge.length} profiles`
      );
    } else {
      afterAge = afterDistance;
    }

    return res.status(200).json({
      success: true,
      breakdown: {
        totalFetched: compatibilityWithProfiles.length,
        afterDistance: afterDistance.length,
        afterAge: afterAge.length,
      },
      matches: afterAge,
    });
  } catch (err) {
    console.error('❌ Match debug error:', err);
    return res.status(500).json({ error: 'Failed to fetch match debug data' });
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
    viewed,
    approved,
    viewed_at,
    approved_at,
    userInteraction,
    targetInteraction,
    userReason,
    targetReason
  } = req.body;
  try {
    const { data: likeData, error: likeError } = await supabase
      .from('Interactions')
      .insert([{
        userId,
        targetUserId,
        viewed,
        approved,
        viewed_at,
        approved_at,
        userInteraction,
        targetInteraction,
        userReason,
        targetReason
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
          *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Subscriptions(*), Survey(*), Tags(*)
        )
      `)
      .eq('targetUserId', userId)
      .neq('userInteraction', 'disliked')
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
      .update({ viewed: true, approved: true, targetInteraction: 'liked', approved_at: new Date() })
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

// updateTier.js

export const updateUserTier = async (req, res) => {
  const { userId, tier } = req.body;

  console.log('➡️ Update Tier Request:', { userId, tier });

  if (!userId || !tier) {
    return res.status(400).json({ success: false, error: 'Missing userId or tier' });
  }

  try {
    // Update the Profile table
    const { error: updateError } = await supabase
      .from('Profile')
      .update({ tier: tier })
      .eq('userId', userId);

    if (updateError) {
      console.error('❌ Failed to update tier:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update tier' });
    }

    console.log(`✅ Tier updated for user ${userId} → ${tier}`);
    return res.status(200).json({ success: true, message: 'Tier updated successfully' });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Unexpected server error' });
  }
};


// Controller
export const deleteUserAccount = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // 1. Delete the user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('❌ Failed to delete from auth:', authError.message);
      return res.status(500).json({ error: 'Failed to delete from authentication' });
    }

    // 2. Delete profile and associated data (optional cascade)
    const { error: profileError } = await supabase
      .from('Profile')
      .delete()
      .eq('userId', userId);

    if (profileError) {
      console.error('❌ Failed to delete profile:', profileError.message);
      return res.status(500).json({ error: 'Failed to delete user profile' });
    }

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Server error while deleting account' });
  }
};


export const removeInteraction = async (req, res) => {
  try {
    const { id } = req.body;

    const { data, error } = await supabase
      .from('Interactions')
      .delete()
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
      userReason,
      targetReason
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
        userReason,
        targetReason
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

    console.log('📥 Incoming Filter Request:', JSON.stringify(req.body, null, 2));

    const now = new Date();

    // Step 1: Fetch all other profiles
    console.log('📡 Fetching profiles from Supabase...');
    let { data: allProfiles, error } = await supabase
      .from('Profile')
      .select(`
        *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Subscriptions(*), Survey(*), Tags(*)
      `)
      .neq('userId', userId);

    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch profiles.' });
    }

    if (!allProfiles) {
      console.log('⚠️ No profiles found.');
      return res.status(200).json({ success: true, data: [] });
    }

    let remaining = allProfiles;

    const applyFilter = (label, fn) => {
      try {
        const before = remaining.length;
        remaining = remaining.filter(fn);
        const after = remaining.length;
        console.log(`🔎 Filter [${label}]: ${before} → ${after}`);
      } catch (e) {
        console.error(`❌ Error during filter [${label}]:`, e.message);
        throw new Error(`Filter failed: ${label}`);
      }
    };

    const match = (val, arr) => {
      const arrSafe = Array.isArray(arr) ? arr : [arr];
      if (!arrSafe.length) return true;
      if (val === null || val === undefined) return false;

      if (Array.isArray(val)) {
        return val.some(v =>
          arrSafe.some(a =>
            typeof a === 'string' && typeof v === 'string' &&
            a.trim() === v.trim()
          )
        );
      }

      return arrSafe.some(
        a =>
          typeof a === 'string' &&
          typeof val === 'string' &&
          a.trim() === val.trim()
      );
    };

    applyFilter('Valid About Section', (p) => Array.isArray(p.About) && p.About[0]);

    applyFilter('Valid Age Range', (p) => {
      const about = p.About[0];
      if (!about?.dob || !ageMin || !ageMax) return true;
      const age = now.getFullYear() - new Date(about.dob).getFullYear();
      return age >= ageMin && age <= ageMax;
    });

    applyFilter('Gender', (p) => match(p.About[0]?.gender, gender));

    applyFilter('Background', (p) => {
      try {
        const raw = p.About[0]?.background;
        const val = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return match(val, background);
      } catch (err) {
        console.error('❌ Failed to parse background JSON:', p.About[0]?.background);
        return false;
      }
    });

    applyFilter('Religion', (p) => match(p.Religion[0]?.religion, religion));
    applyFilter('Sect', (p) => match(p.Religion[0]?.sect, sect));
    applyFilter('Practicing Views', (p) => match(p.Religion[0]?.practicing, views));
    applyFilter('Drinking', (p) => match(p.Habits[0]?.drink, drink));
    applyFilter('Smoking', (p) => match(p.Habits[0]?.smoke, smoke));
    applyFilter('Has Kids', (p) => match(p.Habits[0]?.hasKids, hasKids));
    applyFilter('Wants Kids', (p) => match(p.Habits[0]?.wantsKids, wantsKids));
    applyFilter('Looking For', (p) => match(p.Intent[0]?.lookingFor, lookingFor));
    applyFilter('Timeline', (p) => match(p.Intent[0]?.timeline, timeline));
    applyFilter('Relocate', (p) => match(p.Intent[0]?.relocate, relocate));

    // ✅ Distance filter (Haversine formula)
    if (distance && latitude && longitude) {
      const R = 3958.8; // Earth radius in miles
      const before = remaining.length;

      remaining = remaining.filter((p) => {
        if (!p.latitude || !p.longitude) return false;
        const dLat = (p.latitude - latitude) * (Math.PI / 180);
        const dLon = (p.longitude - longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(latitude * (Math.PI / 180)) *
            Math.cos(p.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return dist <= distance;
      });

      console.log(`📍 Distance Filter: ${before} → ${remaining.length}`);
    }

    console.log('✅ Final result count:', remaining.length);
    return res.status(200).json({ success: true, data: remaining });
  } catch (err) {
    console.error('❌ Server Error:', err.message);
    console.error(err.stack);
    return res.status(500).json({ error: err.message || 'Server crashed.' });
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

export const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://marhabahapp.github.io/ResetPassword/',
    })

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('❌ Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSocials = async (req, res) => {
  const { userId, instagram, twitter, facebook, linkedin, tiktok } = req.body;

  try {
    const { error } = await supabase
      .from('Social')
      .upsert(
        [
          {
            userId,
            instagram,
            twitter,
            facebook,
            linkedin,
            tiktok,
          },
        ],
        {
          onConflict: 'userId', // ensures uniqueness on userId
        }
      );

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating socials:', err);
    return res.status(500).json({ error: 'Failed to update socials' });
  }
};

export const cancelSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const { error } = await supabase
      .from('About')
      .update({
        tier: 1,
      })
      .eq('userId', userId)

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating socials:', err);
    return res.status(500).json({ error: 'Failed to update socials' });
  }
};
