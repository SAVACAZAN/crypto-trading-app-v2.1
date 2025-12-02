import { getWhatsAppClient } from './init.post.js';

export default defineEventHandler(async (event) => {
  try {
    const { client, isReady } = getWhatsAppClient();

    if (!client || !isReady) {
      return {
        success: false,
        message: 'WhatsApp client not ready',
        messages: []
      };
    }

    const body = await readBody(event);
    const { chatId, limit = 50 } = body;

    if (!chatId) {
      return {
        success: false,
        message: 'chatId is required',
        messages: []
      };
    }

    console.log(`📱 [WHATSAPP-MESSAGES] Fetching messages for chat: ${chatId}`);

    // Get chat by ID
    const chat = await client.getChatById(chatId);

    // Fetch messages
    const messages = await chat.fetchMessages({ limit: parseInt(limit) });

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id._serialized,
      body: msg.body,
      timestamp: msg.timestamp,
      fromMe: msg.fromMe,
      author: msg.author || msg.from,
      type: msg.type,
      hasMedia: msg.hasMedia
    }));

    console.log(`✅ [WHATSAPP-MESSAGES] Fetched ${formattedMessages.length} messages`);

    return {
      success: true,
      messages: formattedMessages,
      chatName: chat.name,
      message: `Fetched ${formattedMessages.length} messages`
    };

  } catch (error) {
    console.error('❌ [WHATSAPP-MESSAGES] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch messages',
      messages: [],
      error: error.toString()
    };
  }
});
