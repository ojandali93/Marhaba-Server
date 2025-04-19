import {supabase} from '../services/SupabaseClient.js'

export const createUser = async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ email }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, user: data });
};
