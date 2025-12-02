import { FronRunSchema } from '~/server/models/FronRun.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'Missing userID parameter',
      };
    }

    console.log('[Fetch FrontRun Bots] UserID:', userID);

    // Fetch all FrontRun bots for this user
    const bots = await FronRunSchema.find({ userID }).sort({ createdAt: -1 });

    return {
      success: true,
      message: `Found ${bots.length} FrontRun bots`,
      data: bots,
    };

  } catch (error) {
    console.error('[Fetch FrontRun Bots] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch FrontRun bots',
      error: error.message,
      data: [],
    };
  }
});