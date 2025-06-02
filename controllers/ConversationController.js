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
              *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Survey(*), Tags(*)
            ),
            profile2:Profile!Conversations_user2Id_fkey (
              *, About(*), Career(*), Core(*), Future(*), Habits(*), Intent(*), Notifications(*),  Photos(*), Preferences(*), Prompts(*), Relationships(*), Religion(*), Social(*), Survey(*), Tags(*)
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

export const updateLayeredQuestion = async (req, res) => {
  const { questionId, userId, answer, conversationId, currentQuestionLevel } = req.body;
  console.log('the question id is', questionId);
  console.log('the conversation id is', conversationId);
  console.log('the current question level is', currentQuestionLevel);
  console.log('the answer is', answer);
  console.log('the user id is', userId);

  try {
    // 1️⃣ Update this question (set user1Answer or user2Answer)
    const { data: questionData, error: fetchError } = await supabase
      .from('LayeredQuestions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError) throw fetchError;

    const isUser1 = questionData.user1Id === userId;
    const isUser2 = questionData.user2Id === userId;

    if (!isUser1 && !isUser2) {
      return res.status(400).json({ error: 'User does not belong to this question.' });
    }

    const updateFields = isUser1
      ? { user1Answer: answer, user1AnsweredAt: new Date().toISOString() }
      : { user2Answer: answer, user2AnsweredAt: new Date().toISOString() };

    const { error: updateError } = await supabase
      .from('LayeredQuestions')
      .update(updateFields)
      .eq('id', questionId);

    if (updateError) throw updateError;

    // 2️⃣ Fetch again to check if BOTH users answered
    const { data: updatedQuestion, error: refetchError } = await supabase
      .from('LayeredQuestions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (refetchError) throw refetchError;

    const bothAnswered = updatedQuestion.user1Answer && updatedQuestion.user2Answer;

    if (bothAnswered) {
      // 3️⃣ Unlock NEXT question if it exists
      const nextLevel = currentQuestionLevel + 1;

      const { data: nextQuestion, error: nextError } = await supabase
        .from('LayeredQuestions')
        .select('*')
        .eq('conversationId', conversationId)
        .eq('questionLevel', nextLevel)
        .single();

      if (nextError && nextError.code !== 'PGRST116') {
        // PGRST116 = not found, ignore if no next question
        throw nextError;
      }

      if (nextQuestion) {
        const { error: unlockError } = await supabase
          .from('LayeredQuestions')
          .update({ locked: false })
          .eq('id', nextQuestion.id);

        if (unlockError) throw unlockError;
      }
    }

    return res.status(200).json({ success: true, bothAnswered });
  } catch (err) {
    console.error('❌ Error updating layered question:', err);
    return res.status(500).json({ error: 'Failed to update layered question' });
  }
};

export const closeLayeredQuestions = async (req, res) => {
  const { conversationId, userId } = req.body;

  try {
    // 1️⃣ Update all layered questions for this conversation
    const { error: questionsError } = await supabase
      .from('LayeredQuestions')
      .update({
        closedAt: new Date().toISOString(),
        closedBy: userId
      })
      .eq('conversationId', conversationId);

    if (questionsError) throw questionsError;

    // 2️⃣ Update conversation status
    const { error: convoError } = await supabase
      .from('Conversations')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (convoError) throw convoError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error closing layered questions:', err);
    return res.status(500).json({ error: 'Failed to close layered questions' });
  }
};

export const getLayeredQuestions = async (req, res) => {
  const { conversationId } = req.params;
  console.log('the id is', conversationId);
  try {
    const { data: questions, error } = await supabase
      .from('LayeredQuestions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('question_number', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ success: true, data: questions });
  } catch (err) {
    console.error('❌ Error fetching layered questions:', err);
    return res.status(500).json({ error: 'Failed to fetch layered questions' });
  }
};
