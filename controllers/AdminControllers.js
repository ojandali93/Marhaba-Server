import { supabase } from '../services/SupabaseClient.js';

export const grabPendingProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Profile') // your table name
      .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
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
  console.log('blocker_id', blocker_id);
  console.log('blocked_id', blocked_id);
  try {
    // 1. Add block record
    await supabase.from('Blocked').insert([{ blockerId: 
      blocker_id, blockedId: blocked_id }]);

    // 2. Remove conversations between users
    const { data: conversationData, error: conversationError } = await supabase
      .from('Conversations')
      .delete()
      .or(`user1Id.eq.${blocker_id},user2Id.eq.${blocked_id}`)
      .or(`user1Id.eq.${blocked_id},user2Id.eq.${blocker_id}`);

    if (conversationError) throw conversationError;
    // 3. Remove interactions both ways
    const { data: interactionData, error: interactionError } =  await supabase
      .from('Interactions')
      .delete()
      .or(`userId.eq.${blocker_id},targetUserId.eq.${blocked_id}`)
      .or(`userId.eq.${blocked_id},targetUserId.eq.${blocker_id}`);

    if (interactionError) throw interactionError;

    res.status(200).send({ success: true, message: 'User blocked and related data removed.' });
  } catch (error) {
    console.error('❌ Block error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
}

export const unblockUser = async (req, res) => {
  const { blocker_id, blocked_id } = req.body;

  try {
    // 1. Remove block record
    const { data, error } = await supabase.from('Blocks').delete()
      .eq(`blockerId`, blocker_id)
      .eq(`blockedId`, blocked_id);

    if (error) throw error;

    res.status(200).send({ success: true, message: 'User unblocked.' });
  } catch (error) {
    console.error('❌ Unblock error:', error);
    res.status(500).send({ success: false, error: error.message });
  }
}

