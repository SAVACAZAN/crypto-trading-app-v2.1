import { getWhatsAppClient } from './init.post.js';

export default defineEventHandler(async (event) => {
  try {
    const { client, isReady } = getWhatsAppClient();

    if (!client || !isReady) {
      return {
        success: false,
        message: 'WhatsApp client not ready'
      };
    }

    const body = await readBody(event);
    const { chatId, message } = body;

    if (!chatId || !message) {
      return {
        success: false,
        message: 'chatId and message are required'
      };
    }

    console.log(`📤 [WHATSAPP-SEND] Sending message to ${chatId}`);

    // Send message
    const sentMessage = await client.sendMessage(chatId, message);

    console.log(`✅ [WHATSAPP-SEND] Message sent successfully`);

    return {
      success: true,
      message: 'Message sent successfully',
      messageId: sentMessage.id._serialized,
      timestamp: sentMessage.timestamp
    };

  } catch (error) {
    console.error('❌ [WHATSAPP-SEND] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send message',
      error: error.toString()
    };
  }
});
