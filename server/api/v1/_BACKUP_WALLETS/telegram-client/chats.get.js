import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required',
        chats: []
      };
    }

    console.log(`💬 Fetching chats for user: ${userID}`);

    // Get authenticated session
    const session = await TelegramClientSession.findOne({ userID });

    if (!session || !session.isAuthenticated || !session.sessionString) {
      return {
        success: false,
        message: 'User not authenticated. Please login first.',
        chats: []
      };
    }

    // Initialize MTProto client with saved session and storage options
    const mtproto = new MTProto({
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      storageOptions: {
        path: `./.telegram-sessions/session-${userID}.json`,
      },
    });

    // Restore session - MTProto needs the storage object to be properly initialized
    // The storage is handled internally by MTProto with the file path we provided
    // We don't need to manually restore it from sessionString

    // Fetch dialogs (chats)
    const dialogs = await mtproto.call('messages.getDialogs', {
      offset_date: 0,
      offset_id: 0,
      offset_peer: {
        _: 'inputPeerEmpty',
      },
      limit: 100,
      hash: 0,
    });

    // Process dialogs to extract chat information
    const chatsMap = new Map();
    const usersMap = new Map();

    // Map users for quick lookup
    if (dialogs.users) {
      dialogs.users.forEach(user => {
        usersMap.set(user.id, user);
      });
    }

    // Process chats
    if (dialogs.chats) {
      dialogs.chats.forEach(chat => {
        let chatType = 'group';
        let chatName = chat.title || 'Unknown';
        let memberCount = 0;

        if (chat._ === 'channel') {
          chatType = chat.broadcast ? 'channel' : 'supergroup';
          memberCount = chat.participants_count || 0;
        } else if (chat._ === 'chat') {
          chatType = 'group';
          memberCount = chat.participants_count || 0;
        }

        chatsMap.set(chat.id, {
          id: chat.id,
          name: chatName,
          type: chatType,
          username: chat.username || null,
          memberCount: memberCount,
          isAdmin: chat.creator || chat.admin_rights ? true : false,
          photoUrl: null, // Can be fetched separately if needed
          lastMessage: null,
          unreadCount: 0,
          accessHash: chat.access_hash ? chat.access_hash.toString() : null // Save access_hash for API calls
        });
      });
    }

    // Process dialogs to get last messages and unread counts
    if (dialogs.dialogs) {
      dialogs.dialogs.forEach(dialog => {
        let chatId = null;
        let chatType = 'private';

        if (dialog.peer._ === 'peerUser') {
          chatId = dialog.peer.user_id;
          chatType = 'private';

          const user = usersMap.get(chatId);
          if (user && !chatsMap.has(chatId)) {
            chatsMap.set(chatId, {
              id: chatId,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
              type: 'private',
              username: user.username || null,
              memberCount: 0,
              isAdmin: false,
              photoUrl: null,
              lastMessage: null,
              unreadCount: dialog.unread_count || 0,
              accessHash: user.access_hash ? user.access_hash.toString() : null // Save access_hash for private chats
            });
          }
        } else if (dialog.peer._ === 'peerChat') {
          chatId = dialog.peer.chat_id;
        } else if (dialog.peer._ === 'peerChannel') {
          chatId = dialog.peer.channel_id;
        }

        // Update unread count
        if (chatId && chatsMap.has(chatId)) {
          const chat = chatsMap.get(chatId);
          chat.unreadCount = dialog.unread_count || 0;
        }
      });
    }

    // Process messages to get last message preview
    if (dialogs.messages) {
      dialogs.messages.forEach(message => {
        let chatId = null;

        if (message.peer_id) {
          if (message.peer_id._ === 'peerUser') {
            chatId = message.peer_id.user_id;
          } else if (message.peer_id._ === 'peerChat') {
            chatId = message.peer_id.chat_id;
          } else if (message.peer_id._ === 'peerChannel') {
            chatId = message.peer_id.channel_id;
          }
        }

        if (chatId && chatsMap.has(chatId)) {
          const chat = chatsMap.get(chatId);
          if (!chat.lastMessage || message.date > (chat.lastMessage.date || 0)) {
            chat.lastMessage = {
              text: message.message || '[Media]',
              date: message.date,
              fromId: message.from_id?.user_id || null
            };
          }
        }
      });
    }

    const chatsArray = Array.from(chatsMap.values());

    console.log(`✅ Found ${chatsArray.length} chats`);

    // Log chat types breakdown for debugging
    const chatTypes = chatsArray.reduce((acc, chat) => {
      acc[chat.type] = (acc[chat.type] || 0) + 1;
      return acc;
    }, {});
    console.log(`📊 Chat types breakdown:`, chatTypes);
    console.log(`📋 All chats:`, chatsArray.map(c => ({ id: c.id, name: c.name, type: c.type })));

    // Update last active
    session.lastActive = new Date();
    await session.save();

    return {
      success: true,
      chats: chatsArray
    };

  } catch (error) {
    console.error('❌ Error fetching chats:', error);

    // Check if session expired
    if (error.error_message && error.error_message.includes('AUTH_KEY')) {
      return {
        success: false,
        message: 'Session expired. Please login again.',
        sessionExpired: true,
        chats: []
      };
    }

    return {
      success: false,
      message: error.message || 'Failed to fetch chats',
      chats: []
    };
  }
});
