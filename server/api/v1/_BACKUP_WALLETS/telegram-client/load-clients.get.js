import TelegramClientSession from '~/server/models/TelegramClientSession.schema';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required',
        clients: []
      };
    }

    console.log(`📥 Loading saved Telegram clients for user: ${userID}`);

    // Find all client sessions for this user
    // Note: In current implementation, there's only one session per user
    // But this endpoint returns an array for future multi-client support
    const sessions = await TelegramClientSession.find({}).sort({ createdAt: -1 });

    // Filter sessions that belong to this user or have userID matching
    const userSessions = sessions.filter(session => {
      return session.userID === userID;
    });

    console.log(`✅ Loaded ${userSessions.length} client sessions`);

    // Format response
    const clients = userSessions.map(session => ({
      _id: session._id,
      userID: session.userID,
      phoneNumber: session.phoneNumber,
      isAuthenticated: session.isAuthenticated,
      loginType: session.loginType || 'sms', // Include login type
      userInfo: session.userInfo,
      lastActive: session.lastActive,
      createdAt: session.createdAt
    }));

    return {
      success: true,
      clients: clients
    };

  } catch (error) {
    console.error('❌ Error loading clients:', error);
    return {
      success: false,
      message: error.message || 'Failed to load clients',
      clients: []
    };
  }
});
