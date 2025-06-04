import { supabase } from '../services/SupabaseClient.js';
import { sendPush } from '../utils/apn.js';


export const grabPendingProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Profile') // your table name
      .select('*, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Subscriptions(*), Social(*), Survey(*), Tags(*)')
      .in('approved', ['review', 'resubmit']);
    
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const approveProfile = async (req, res) => {
  const { userId } = req.body;

  try {
    const { data, error } = await supabase
      .from('Profile')
      .update({ approved: 'approved' })
      .eq('userId', userId)
    
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const rejectProfile = async (req, res) => {
  const { userId, note, flaggedPhotos, flaggedPrompts } = req.body;

  try {
    const { data, error } = await supabase
      .from('Profile')
      .update({ approved: 'rejected' })
      .eq('userId', userId)
    
    if (error) throw error;

    const { data: reviewData, error: reviewError } = await supabase
      .from('Review')
      .insert({ userId, notes: note, flaggedPhotos, flaggedPrompts })
      .select();

    if (reviewError) throw reviewError;

    return res.status(200).json({ success: true, data, reviewData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const reviewInfo = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('Review')
      .select('*')
      .eq('userId', userId);

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
}

export const reSubmitProfile = async (req, res) => {
  const { userId, message } = req.body;

  try {
    const { data, error } = await supabase
      .from('Review')
      .update({ reviewerMessage: message, status: 'resubmit', flaggedPhotos: '' })
      .eq('userId', userId)
      .select();

    if (error) throw error;
    console.log('Review data:', data);

    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .update({ approved: 'resubmit' })
    .eq('userId', userId)
    .select();

    if (profileError) throw profileError;
    console.log('Profile data:', profileData);
    return res.status(200).json({ success: true, data, profileData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
}

export const blockUser = async (req, res) => {
  const { blocker_id, blocked_id } = req.body;
  try {
    // 1. Insert into Blocked table
    await supabase.from('Blocked').insert([{ blockerId: blocker_id, blockedId: blocked_id }]);

    // 2. Delete mutual conversations
    const { error: conversationError } = await supabase
      .from('Conversations')
      .delete()
      .or(`and(user1Id.eq.${blocker_id},user2Id.eq.${blocked_id}),and(user1Id.eq.${blocked_id},user2Id.eq.${blocker_id})`);

    if (conversationError) throw conversationError;

    // 3. Delete mutual interactions
    const { error: interactionError } = await supabase
      .from('Interactions')
      .delete()
      .or(`and(userId.eq.${blocker_id},targetUserId.eq.${blocked_id}),and(userId.eq.${blocked_id},targetUserId.eq.${blocker_id})`);

    if (interactionError) throw interactionError;

    res.status(200).send({ success: true, message: 'User blocked and related data removed.' });
  } catch (error) {
    console.error('❌ Block error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
};


export const unblockUser = async (req, res) => {
  const { blocker_id, blocked_id } = req.body;

  try {
    // 1. Remove block record
    const { data, error } = await supabase.from('Blocked').delete()
      .eq(`blockerId`, blocker_id)
      .eq(`blockedId`, blocked_id);

    if (error) throw error;

    res.status(200).send({ success: true, message: 'User unblocked.' });
  } catch (error) {
    console.error('❌ Unblock error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
}


export const reportUser = async (req, res) => {
  const { reporterId, reportedId, postId, reason } = req.body;

  try {
    // 1. Insert report into Reports table
    const { data, error } = await supabase
      .from('Reports')
      .insert([{ reporterId, reportedId, postId, reason }]);

    if (error) throw error;

    res.status(200).send({ success: true, message: 'Reported' });
  } catch (error) {
    console.error('❌ Unblock error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
}

export const getBlockedUsers = async (req, res) => {
  const { userId } = req.params;
  console.log('userId', userId);

  try {
    const { data, error } = await supabase
      .from('Blocked')
      .select(`
        *,
        blockedId:Profile (
          *,
          About(*),
          Core(*),
          Lifestyle(*),
          Notifications(*),
          Photos(*),
          Preferences(*)
        )
      `)
      .eq('blockerId', userId);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Error fetching blocked users:', error);
    return res.status(500).json({ error: 'Failed to get blocked users' });
  }
};


export const grabAllAdmins = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('admin', true)
      .not('passHash', 'is', null)
      .not('passHash', 'eq', '')
      .not('pinHash', 'is', null)
      .not('pinHash', 'eq', '');

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Error fetching admin profiles:', error);
    return res.status(500).json({ error: 'Failed to get admin profiles' });
  }
};

export const sendNotificationToAllAdmins = async (req, res) => {
  const { title, body } = req.body;

  try {
    // Step 1: Fetch all valid admin profiles
    const { data: admins, error } = await supabase
      .from('Profile')
      .select('userId, apnToken') // only grab the field you need for notifications
      .eq('admin', true)
      .not('passHash', 'is', null)
      .not('passHash', 'eq', '')
      .not('pinHash', 'is', null)
      .not('pinHash', 'eq', '');

    if (error) {
      console.error('❌ Failed to fetch admins:', error.message);
      return;
    }

    // Step 2: Send notification to each admin
    for (const admin of admins) {
      console.log('Sending notification to admin:', admin.userId);
      console.log('admin.apnToken', admin.apnToken);
      const result = await sendPush(admin.apnToken, title, body);
      console.log('📤 APNs result:', JSON.stringify(result, null, 2));
    }

    console.log('✅ Notifications sent to all admins');
    return res.status(200).json({ success: true, message: 'Notifications sent to all admins' });
  } catch (err) {
    console.error('❌ Error sending notifications:', err.message);
    return res.status(500).json({ error: 'Failed to send notifications to all admins' });
  }
};