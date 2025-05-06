import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/SupabaseClient.js';
import multer from 'multer';

export const grabPendingProfiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Profiles') // your table name
      .select('*, About(*), Anger(*), Attachment(*), Career(*), Communication(*), Core(*), Emotions(*), Future(*), Lifestyle(*), Love(*), Notifications(*), Photos(*), Preferences(*), Prompts(*), Survey(*), Tags(*), Time(*), Values(*)')
      .eq('approved', 'pending');
    
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};