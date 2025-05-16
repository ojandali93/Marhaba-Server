import { supabase } from '../services/SupabaseClient.js';

export const createConversation = async (req, res) => {
  try {
    const { userId, userId2, lastMessage, updatedAt } = req.body;


    const { data: profileData, error: profileError } = await supabase
        .from('Conversations')
        .insert({
            user1Id: userId,
            user2Id: userId2,
            lastMessage: lastMessage,
            updated_at: updatedAt
        })
        .select()
        .single();

    if (profileError) {
      console.error('❌ Supabase error:', profileError);
      return res.status(400).json({ error: profileError.message || 'Failed to create conversation.' });
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

export const getUserConversations = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const { data: conversations, error } = await supabase
        .from('Conversations')
        .select(`
            *,
            profile1:Profile!Conversations_user1Id_fkey (
              *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Socials(*), Survey(*), Tags(*)
            ),
            profile2:Profile!Conversations_user2Id_fkey (
              *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Socials(*), Survey(*), Tags(*)
            )
          `)
        .or(`user1Id.eq.${userId},user2Id.eq.${userId}`)
        .order('updated_at', { ascending: false });
  
      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
  
      return res.status(200).json({ success: true, data: conversations });
    } catch (err) {
      console.error('❌ Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getConversationmessages = async (req, res) => {
    const { conversationId } = req.params;
  
    try {
      const { data: conversations, error } = await supabase
        .from('Messages')
        .select(`(*)`)
        .eq('conversationId', conversationId)
        .order('created_at', { ascending: true });
  
      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }
  
      return res.status(200).json({ success: true, data: conversations });
    } catch (err) {
      console.error('❌ Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


export const getUnreadMessages = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing userId.' });
  }

  try {
    const { data, error } = await supabase
      .from('Messages')
      .select('conversationId')
      .eq('receiver', userId)
      .eq('readStatus', 'unread');

    if (error) {
      console.error('❌ Error fetching unread messages:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch unread messages.' });
    }

    // Create a map of conversationId -> true
    const unreadMap = {};
    data.forEach(({ conversationId }) => {
      if (conversationId) unreadMap[conversationId] = true;
    });

    return res.status(200).json({ success: true, unreadMap });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { conversationId, userId } = req.body;
  try {
    const { error } = await supabase
      .from('Messages')
      .update({ readStatus: 'read' })
      .eq('conversationId', conversationId)
      .eq('receiver', userId); // Only mark messages meant for this user

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const updateConversationLastMessage = async (req, res) => {
  const { conversationId, message } = req.body;

  try {
    const { error } = await supabase
      .from('Conversations')
      .update({
        lastMessage: message,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId); // 🛠 Make sure your column is 'id' not 'conversationId'

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating last message:', err);
    return res.status(500).json({ error: 'Failed to update last message' });
  }
};


export const updateActive = async (req, res) => {
  const { userId, conversationId } = req.body;

  try {
    const { error } = await supabase
      .from('Profile')
      .update({
        activeChat: conversationId,
      })
      .eq('userId', userId); 

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating last message:', err);
    return res.status(500).json({ error: 'Failed to update last message' });
  }
};


export const updateInactvie = async (req, res) => {
  const { userId } = req.body;

  try {
    const { error } = await supabase
      .from('Profile')
      .update({
        activeChat: null
      })
      .eq('userId', userId); 

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating last message:', err);
    return res.status(500).json({ error: 'Failed to update last message' });
  }
};


export const updateShowBadge = async (req, res) => {
  const { userId, show } = req.body;

  try {
    const { error } = await supabase
      .from('Profile')
      .update({
        showPro: show
      })
      .eq('userId', userId); 

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error updating last message:', err);
    return res.status(500).json({ error: 'Failed to update last message' });
  }
};
