import { supabase } from '../services/SupabaseClient.js';

export const createConversation = async (req, res) => {
  try {
    const { userId, userId2, lastMessage, updatedAt } = req.body;

    const { data: profileData, error: profileError } = await supabase
        .from('Conversations')
        .insert({
            userId: userId,
            userId2: userId2,
            lastMessage: lastMessage,
            updatedAt: updatedAt
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