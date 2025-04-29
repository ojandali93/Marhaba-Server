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
    const { id } = req.params;

    console.log('💬 Getting conversations for user:', id);
  
    try {
      // ✅ First query: user is user1Id
      const { data: conversations1, error: error1 } = await supabase
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
        .eq('user1Id', id);
  
    //   if (error1) {
    //     console.error('❌ Supabase error (user1Id):', error1);
    //     return res.status(400).json({ error: error1.message });
    //   }
  
    //   // ✅ Second query: user is user2Id
    //   const { data: conversations2, error: error2 } = await supabase
    //     .from('Conversations')
    //     .select(`
    //       *,
    //       profile1:Profile!Conversations_user1Id_fkey (
    //         *,
    //         Photos (*)
    //       ),
    //       profile2:Profile!Conversations_user2Id_fkey (
    //         *,
    //         Photos (*)
    //       )
    //     `)
    //     .eq('user2Id', id);
  
    //   if (error2) {
    //     console.error('❌ Supabase error (user2Id):', error2);
    //     return res.status(400).json({ error: error2.message });
    //   }
  
    //   // ✅ Combine and sort by updated_at (most recent first)
    //   const allConversations = [...(conversations1 || []), ...(conversations2 || [])];
    //   const sortedConversations = allConversations.sort((a, b) =>
    //     new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    //   );

    console.log('💬 Conversations:', conversations1);
  
      return res.status(200).json({ success: true, data: conversations1 });
    } catch (err) {
      console.error('❌ Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };