import { supabase } from '../services/SupabaseClient.js';

export const grabEvents = async (req, res) => {
  try {
    const { data: eventData, error: eventError } = await supabase
    .from('Events')
    .select('*, Event_Attend(*), Event_Posts(*), Event_Rsvp(*)')
    .order('created_at', { ascending: false });

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch events.' });
    }

    if (!eventData) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    return res.status(200).json({ success: true, data: eventData });

  }catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing events.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const grabSingleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const { data: eventData, error: eventError } = await supabase
      .from('Events')
      .select(`
        *,
        Event_Attend(*),
        Event_Posts(*),
        Event_Rsvp(
          userId(
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
            Survey(*),
            Tags(*)
          )
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch events.' });
    }

    if (!eventData) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    return res.status(200).json({ success: true, data: eventData });

  } catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing events.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const createEventPost = async (req, res) => {
  const { eventId, userId, caption, image } = req.body;
  try {
    const { data: eventData, error: eventError } = await supabase
    .from('Event_Posts')
    .insert({ eventId, userId, caption, image })
    .select()

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch events.' });
    }

    return res.status(200).json({ success: true, data: eventData });

  }catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing events.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};