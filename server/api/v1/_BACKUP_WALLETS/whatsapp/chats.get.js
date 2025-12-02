import { getWhatsAppClient } from './init.post.js';

export default defineEventHandler(async (event) => {
  try {
    const { client, isReady } = getWhatsAppClient();

    if (!client || !isReady) {
      return {
        success: false,
        message: 'WhatsApp client not ready. Please scan QR code first.',
        chats: []
      };
    }

    console.log('📱 [WHATSAPP-CHATS] Fetching chats...');

    // Get all chats
    const chats = await client.getChats();

    // Format chats for frontend
    const formattedChats = chats.slice(0, 50).map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp,
      lastMessage: chat.lastMessage ? {
        body: chat.lastMessage.body,
        timestamp: chat.lastMessage.timestamp,
        fromMe: chat.lastMessage.fromMe
      } : null
    }));

    console.log(`✅ [WHATSAPP-CHATS] Fetched ${formattedChats.length} chats`);

    return {
      success: true,
      chats: formattedChats,
      message: `Fetched ${formattedChats.length} chats`
    };

  } catch (error) {
    console.error('❌ [WHATSAPP-CHATS] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch chats',
      chats: [],
      error: error.toString()
    };
  }
});
