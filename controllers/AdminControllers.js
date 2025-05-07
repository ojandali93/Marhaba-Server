import { supabase } from '../services/SupabaseClient.js';

export const grabPendingProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Profile') // your table name
      .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
      .eq('approved', 'review');
    
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