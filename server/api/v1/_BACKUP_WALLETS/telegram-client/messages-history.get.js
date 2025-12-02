import TelegramClientMessage from '~/server/models/TelegramClientMessage.schema';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID, chatId, limit = 100, skip = 0 } = query;

    if (!userID || !chatId) {
      return {
        success: false,
        message: 'User ID and chat ID are required',
        messages: []
      };
    }

    console.log(`📚 Loading message history for chat ${chatId} (limit: ${limit}, skip: ${skip})`);

    // Fetch messages from database sorted by date (oldest first)
    const messages = await TelegramClientMessage.find({
      userID: userID,
      chatId: parseInt(chatId)
    })
      .sort({ date: 1 }) // Ascending order (oldest first)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean(); // Convert to plain JavaScript objects

    // Transform to match frontend format
    const formattedMessages = messages.map(msg => ({
      id: msg.messageId,
      text: msg.text,
      date: msg.date,
      isOutgoing: msg.isOutgoing,
      sender: msg.sender,
      mediaType: msg.mediaType,
      replyToMsgId: msg.replyToMsgId
    }));

    console.log(`✅ Loaded ${formattedMessages.length} messages from database`);

    return {
      success: true,
      messages: formattedMessages,
      totalCount: formattedMessages.length,
      fromDatabase: true
    };

  } catch (error) {
    console.error('❌ Error loading message history:', error);
    return {
      success: false,
      message: error.message || 'Failed to load message history',
      messages: []
    };
  }
});
