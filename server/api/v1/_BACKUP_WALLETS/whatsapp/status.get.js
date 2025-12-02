// Import the shared client getter
import { getWhatsAppClient } from './init.post.js';

export default defineEventHandler(async (event) => {
  try {
    const { client, isReady, clientInfo } = getWhatsAppClient();

    if (!client) {
      return {
        success: true,
        status: 'disconnected',
        isReady: false,
        clientInfo: null,
        message: 'WhatsApp client not initialized. Call /api/v1/whatsapp/init first.'
      };
    }

    return {
      success: true,
      status: isReady ? 'ready' : 'connecting',
      isReady: isReady,
      clientInfo: clientInfo,
      message: isReady ? 'WhatsApp client is connected and ready' : 'WhatsApp client is connecting...'
    };

  } catch (error) {
    console.error('❌ [WHATSAPP-STATUS] Error:', error);
    return {
      success: false,
      status: 'error',
      message: error.message || 'Failed to get WhatsApp status',
      error: error.toString()
    };
  }
});
