import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import TelegramClientMessage from '~/server/models/TelegramClientMessage.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, chatId, chatType, chatName, message } = body;

    if (!userID || !chatId || !message) {
      return {
        success: false,
        message: 'User ID, chat ID, and message are required'
      };
    }

    console.log(`✉️ Sending message to chat: ${chatId}`);

    // Get authenticated session
    const session = await TelegramClientSession.findOne({ userID });

    if (!session || !session.isAuthenticated || !session.sessionString) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    // Initialize MTProto client with storage options
    const mtproto = new MTProto({
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      storageOptions: {
        path: `./.telegram-sessions/session-${userID}.json`,
      },
    });

    // Restore session
    if (session.sessionString) {
      try {
        mtproto.storage = JSON.parse(session.sessionString);
      } catch (e) {
        console.error('Failed to parse session string:', e);
      }
    }

    // Determine input peer based on chat type
    let inputPeer;

    if (chatType === 'private') {
      inputPeer = {
        _: 'inputPeerUser',
        user_id: chatId,
        access_hash: 0,
      };
    } else if (chatType === 'channel' || chatType === 'supergroup') {
      inputPeer = {
        _: 'inputPeerChannel',
        channel_id: chatId,
        access_hash: 0,
      };
    } else {
      inputPeer = {
        _: 'inputPeerChat',
        chat_id: chatId,
      };
    }

    // Send message
    const result = await mtproto.call('messages.sendMessage', {
      peer: inputPeer,
      message: message,
      random_id: BigInt(Math.floor(Math.random() * 1e16)),
    });

    console.log(`✅ Message sent successfully`);

    // Update last active
    session.lastActive = new Date();
    await session.save();

    // Extract message ID from result
    let messageId = null;
    let messageDate = Math.floor(Date.now() / 1000);

    if (result._ === 'updates') {
      const update = result.updates?.find(u => u._ === 'updateMessageID');
      messageId = update?.id || null;

      // Try to get the actual message from updates
      const msgUpdate = result.updates?.find(u => u._ === 'updateNewMessage' || u._ === 'updateNewChannelMessage');
      if (msgUpdate && msgUpdate.message) {
        messageId = msgUpdate.message.id;
        messageDate = msgUpdate.message.date;
      }
    } else if (result.id) {
      messageId = result.id;
      messageDate = result.date || messageDate;
    }

    // Save sent message to database
    if (messageId) {
      try {
        await TelegramClientMessage.create({
          userID: userID,
          chatId: chatId,
          chatType: chatType || 'private',
          chatName: chatName || `Chat ${chatId}`,
          messageId: messageId,
          text: message,
          date: messageDate,
          isOutgoing: true,
          sender: null,
          mediaType: null,
          replyToMsgId: null
        });

        console.log(`💾 Saved sent message to database (ID: ${messageId})`);
      } catch (dbError) {
        console.error('⚠️ Error saving sent message to database:', dbError);
        // Continue even if saving fails
      }
    }

    return {
      success: true,
      messageId: messageId,
      timestamp: messageDate
    };

  } catch (error) {
    console.error('❌ Error sending message:', error);

    let errorMessage = 'Failed to send message';

    if (error.error_message) {
      if (error.error_message.includes('AUTH_KEY')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.error_message.includes('CHAT_WRITE_FORBIDDEN')) {
        errorMessage = 'You do not have permission to write in this chat';
      } else if (error.error_message.includes('USER_BANNED')) {
        errorMessage = 'You are banned from sending messages';
      } else if (error.error_message.includes('FLOOD_WAIT')) {
        const waitTime = error.error_message.match(/\d+/);
        errorMessage = `Too many messages. Please wait ${waitTime ? waitTime[0] : 'a few'} seconds`;
      } else {
        errorMessage = error.error_message;
      }
    }

    return {
      success: false,
      message: errorMessage
    };
  }
});
