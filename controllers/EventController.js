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
  .select(`*`)
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

export const grabFilteredEventPosts = async (req, res) => {
  try {
    const { userId: currentUserId, eventId: eventId } = req.body;

    if (!eventId || !currentUserId) {
      return res.status(400).json({ error: 'Missing eventId or userId' });
    }

    // Step 1: Get userIds who have blocked the current user
    const { data: blockedBy, error: blockedError } = await supabase
      .from('Blocked')
      .select('blockerId')
      .eq('blockedId', currentUserId);

    if (blockedError) {
      console.error('❌ Error fetching blocked users:', blockedError);
      return res.status(500).json({ error: 'Failed to fetch blocked users' });
    }

    const blockedIds = blockedBy.map(row => row.blockerId);

    // Step 2: Fetch posts with profile + about info
    const { data: posts, error: postsError } = await supabase
      .from('Event_Posts')
      .select(`
        *,
        userId (
          *,
          About(*),
          Photos(*)
        )
      `)
      .eq('eventId', eventId);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Step 3: Filter out posts from users who blocked the current user
    const visiblePosts = posts.filter(post => {
      return !blockedIds.includes(post.userId?.id);
    });

    return res.status(200).json({ success: true, posts: visiblePosts });
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Unexpected server error',
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

export const grabEventRsvp = async (req, res) => {
  const { eventId } = req.body;
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('Event_Rsvp')
      .select(`
        *,
        userId (
          *,
          About(*),
          Photos(*)
        )
      `)
      .eq('eventId', eventId);

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch RSVP.' });
    }

    return res.status(200).json({ success: true, data: eventData ?? [] });
  } catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing RSVP.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};


export const createEventAttend = async (req, res) => {
  const { eventId } = req.body;
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('Event_Attend')
      .select(`
        *,
        userId (
          *,
          About(*),
          Photos(*)
        )
      `)
      .eq('eventId', eventId);

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch attendance.' });
    }

    return res.status(200).json({ success: true, data: eventData ?? [] });
  } catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing attendance.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};

export const createEventCheckin = async (req, res) => {
  const { eventId } = req.body;
  try {
    const { data: eventData, error: eventError } = await supabase
      .from('Event_Attend')
      .insert({ eventId, userId, attend: 'attending' })
      .select()

    if (eventError) {
      console.error('❌ Supabase error:', eventError);
      return res.status(400).json({ error: eventError.message || 'Failed to fetch attendance.' });
    }

    return res.status(200).json({ success: true, data: eventData ?? [] });
  } catch (error) {
    console.error('❌ Server internal error:', error);
    return res.status(500).json({
      error: {
        message: error.message || 'Server crashed while grabbing attendance.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
};



