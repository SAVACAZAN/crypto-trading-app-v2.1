import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import TelegramClientMessage from '~/server/models/TelegramClientMessage.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, chatId, chatType, chatName, accessHash, limit = 50, offsetId = 0 } = body;

    if (!userID || !chatId) {
      return {
        success: false,
        message: 'User ID and chat ID are required',
        messages: []
      };
    }

    console.log(`📨 Fetching messages for chat: ${chatId} (type: ${chatType}, accessHash: ${accessHash ? 'present' : 'missing'})`);

    // Get authenticated session
    const session = await TelegramClientSession.findOne({ userID });

    if (!session || !session.isAuthenticated) {
      return {
        success: false,
        message: 'User not authenticated',
        messages: []
      };
    }

    // Initialize MTProto client with storage options
    // MTProto automatically loads session from file
    const mtproto = new MTProto({
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      storageOptions: {
        path: `./.telegram-sessions/session-${userID}.json`,
      },
    });

    // Determine input peer based on chat type
    let inputPeer;

    if (chatType === 'private') {
      inputPeer = {
        _: 'inputPeerUser',
        user_id: parseInt(chatId),
        access_hash: accessHash || '0',
      };
    } else if (chatType === 'channel' || chatType === 'supergroup') {
      inputPeer = {
        _: 'inputPeerChannel',
        channel_id: parseInt(chatId),
        access_hash: accessHash || '0',
      };
    } else {
      // Regular group chats don't need access_hash
      inputPeer = {
        _: 'inputPeerChat',
        chat_id: parseInt(chatId),
      };
    }

    // Fetch messages
    const result = await mtproto.call('messages.getHistory', {
      peer: inputPeer,
      offset_id: offsetId,
      offset_date: 0,
      add_offset: 0,
      limit: limit,
      max_id: 0,
      min_id: 0,
      hash: 0,
    });

    // Map users for sender info
    const usersMap = new Map();
    if (result.users) {
      result.users.forEach(user => {
        usersMap.set(user.id, {
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || null,
        });
      });
    }

    // Process messages
    const messages = (result.messages || []).map(msg => {
      let senderInfo = null;

      if (msg.from_id) {
        if (msg.from_id._ === 'peerUser') {
          senderInfo = usersMap.get(msg.from_id.user_id) || null;
        }
      }

      return {
        id: msg.id,
        text: msg.message || '',
        date: msg.date,
        sender: senderInfo,
        isOutgoing: msg.out || false,
        mediaType: msg.media ? msg.media._ : null,
        replyToMsgId: msg.reply_to?.reply_to_msg_id || null,
      };
    });

    console.log(`✅ Fetched ${messages.length} messages`);

    // Use provided chat name or set default
    const finalChatName = chatName || `Chat ${chatId}`;

    // Save messages to database
    try {
      for (const msg of messages) {
        await TelegramClientMessage.findOneAndUpdate(
          {
            userID: userID,
            chatId: chatId,
            messageId: msg.id
          },
          {
            userID: userID,
            chatId: chatId,
            chatType: chatType || 'private',
            chatName: finalChatName,
            messageId: msg.id,
            text: msg.text,
            date: msg.date,
            isOutgoing: msg.isOutgoing,
            sender: msg.sender,
            mediaType: msg.mediaType,
            replyToMsgId: msg.replyToMsgId,
            updatedAt: new Date()
          },
          {
            upsert: true,
            new: true
          }
        );
      }

      console.log(`💾 Saved ${messages.length} messages to database`);
    } catch (dbError) {
      console.error('⚠️ Error saving messages to database:', dbError);
      // Continue even if saving fails
    }

    return {
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      totalCount: result.count || messages.length
    };

  } catch (error) {
    console.error('❌ Error fetching messages:', error);

    if (error.error_message && error.error_message.includes('AUTH_KEY')) {
      return {
        success: false,
        message: 'Session expired. Please login again.',
        sessionExpired: true,
        messages: []
      };
    }

    return {
      success: false,
      message: error.message || 'Failed to fetch messages',
      messages: []
    };
  }
});
