import { supabase } from '../services/SupabaseClient.js';

export const createConversation = async (req, res) => {
  try {
    const { userId, userId2, lastMessage, updatedAt } = req.body;
    console.log('💬 Creating conversation with:', { userId, userId2, lastMessage, updatedAt });


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
              *,
              Photos (*)
            ),
            profile2:Profile!Conversations_user2Id_fkey (
              *,
              Photos (*)
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
        .order('created_at', { ascending: false });
  
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