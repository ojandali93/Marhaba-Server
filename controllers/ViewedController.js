import { supabase } from "../services/SupabaseClient.js";

  export const createViewed = async (req, res) => {
    const { viewer, viewed } = req.body;
  
    try {
      const { data, error } = await supabase
        .from('Viewed')
        .insert([{ viewer, viewed }])
        .select()
  
      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
  
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('❌ Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getViewed = async (req, res) => {
    const { viewer } = req.params;
  
    try {
      const { data, error } = await supabase
        .from('Viewed')
        .select(`
          *, 
          viewerProfile:viewer ( 
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
          ),
          ViewedProfile:viewed ( 
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
        .eq('viewer', viewer)
      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
  
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('❌ Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };