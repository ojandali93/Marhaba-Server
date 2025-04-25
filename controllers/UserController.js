import { supabase } from '../services/SupabaseClient.js';

export const grabSingleProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*, About(*), Career(*), Communication(*), Love(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
    .eq('userId', userId)

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