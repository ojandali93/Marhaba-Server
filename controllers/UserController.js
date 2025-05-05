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

    console.log('--- Filter Request Body ---');
    console.log(req.body);

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
        Preferences(*),
        Prompts(*),
        Survey(*),
        Tags(*),
        Time(*),
        Values(*)
      `)
      .neq('userId', userId);

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles.' });
    }

    if (!data) {
        console.warn('⚠️ No profiles found to filter (excluding self).');
        return res.status(200).json({ success: true, data: [] });
    }

    console.log(`--- Starting Filter Logic for ${data.length} Profiles ---`);
    let initialPassCount = 0; // Counter for profiles passing the initial filters

    const filtered = data.filter((profile) => {
      const about = Array.isArray(profile.About) ? profile.About[0] : profile.About;
      const profileId = profile.userId || 'UnknownID'; // Get profile ID for logging
      console.log(`\n--- Checking Profile: ${profileId} ---`);

      if (!about) {
          console.log(`Profile ${profileId}: FAIL - Missing 'About' data.`);
          return false;
      }

      // Age check using DOB
      let agePassed = true; // Assume true unless proven otherwise
      if (profile.dob && ageMin && ageMax) {
        const age = now.getFullYear() - new Date(profile.dob).getFullYear();
        // Simple check, could be refined for more precise age calculation
        if (age < ageMin || age > ageMax) {
            agePassed = false;
        }
      }
      console.log(`Profile ${profileId}: Age Check (${profile.dob ? (now.getFullYear() - new Date(profile.dob).getFullYear()) : 'N/A'} vs [${ageMin}-${ageMax}]): ${agePassed ? 'PASS' : 'FAIL'}`);
      if (!agePassed) {
           console.log(`Profile ${profileId}: FAIL - Overall (due to Age)`);
           return false;
      }


      const match = (val, arr, fieldName) => {
        const filterIsEmpty = !arr?.length;
        const valueIsMissing = val === null || val === undefined;
        let result = false;

        if (filterIsEmpty) {
          result = true; // Skip filter if array is empty
          console.log(`Profile ${profileId}: ${fieldName} Check (Filter: Empty): SKIP (PASS)`);
        } else if (valueIsMissing) {
          result = false; // Fail if value is missing and filter is not empty
          console.log(`Profile ${profileId}: ${fieldName} Check (Profile Value: Missing, Filter: [${arr.join(', ')}]): FAIL`);
        } else {
          result = arr.some(
            item => item.toLowerCase().trim() === val.toLowerCase().trim()
          );
          console.log(`Profile ${profileId}: ${fieldName} Check (Profile Value: ${val}, Filter: [${arr.join(', ')}]): ${result ? 'PASS' : 'FAIL'}`);
        }
        return result;
      };

      // Perform all checks and store results
      const genderPassed = match(profile.gender, gender?.length ? [gender] : [], 'Gender'); // Handle gender potentially being single string or empty/null
      const backgroundPassed = match(about.background, background, 'Background');
      const religionPassed = match(about.religion, religion, 'Religion');
      const sectPassed = match(about.sect, sect, 'Sect');
      const viewsPassed = match(about.views, views, 'Views');
      const drinkPassed = match(about.drink, drink, 'Drink');
      const smokePassed = match(about.smoke, smoke, 'Smoke');
      const hasKidsPassed = match(about.hasKids, hasKids, 'Has Kids');
      const wantsKidsPassed = match(about.wantsKids, wantsKids, 'Wants Kids');
      const lookingForPassed = match(about.lookingFor, lookingFor, 'Looking For');
      const timelinePassed = match(about.timeline, timeline, 'Timeline');
      const relocatePassed = match(about.relocate, relocate, 'Relocate');

      // Determine overall pass status for this profile based on ALL criteria
      const overallPassed =
        genderPassed &&
        backgroundPassed &&
        religionPassed &&
        sectPassed &&
        viewsPassed &&
        drinkPassed &&
        smokePassed &&
        hasKidsPassed &&
        wantsKidsPassed &&
        lookingForPassed &&
        timelinePassed &&
        relocatePassed;

      console.log(`Profile ${profileId}: Overall non-distance filters: ${overallPassed ? 'PASS' : 'FAIL'}`);

      if (overallPassed) {
          initialPassCount++; // Increment count if passed initial filters
      }

      return overallPassed; // Return result for the .filter() method
    });

    console.log(`\n--- Initial Filter Complete: ${initialPassCount} profiles passed ---`);

    // Distance filter
    const R = 6371; // Earth radius in kilometers
    let finalPassCount = 0; // Counter for profiles passing distance filter

    console.log(`--- Applying Distance Filter (Max: ${distance} km) ---`);
    const final = distance && latitude && longitude
      ? filtered.filter((p) => {
          const profileId = p.userId || 'UnknownID';
          if (!p.latitude || !p.longitude) {
              console.log(`Profile ${profileId}: Distance Check - FAIL (Missing Lat/Lon)`);
              return false;
          }
          const dLat = (p.latitude - latitude) * (Math.PI / 180);
          const dLon = (p.longitude - longitude) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(latitude * (Math.PI / 180)) *
              Math.cos(p.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const calculatedDistance = R * c;
          const passedDistance = calculatedDistance <= distance;
          console.log(`Profile ${profileId}: Distance Check (${calculatedDistance.toFixed(2)} km vs ${distance} km): ${passedDistance ? 'PASS' : 'FAIL'}`);
          if(passedDistance) {
              finalPassCount++;
          }
          return passedDistance;
        })
      : filtered; // If no distance filter applied, final is the same as filtered

      if (!(distance && latitude && longitude)) {
          finalPassCount = initialPassCount; // If distance wasn't applied, the count remains the same
          console.log("--- Distance Filter Not Applied (Missing distance/lat/lon in request) ---")
      }


    console.log(`--- Filtering Complete: ${finalPassCount} profiles passed all filters ---`);

    return res.status(200).json({ success: true, data: final });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server crashed.' });
  }
};
