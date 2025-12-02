import { userSchema } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'Missing userID parameter'
      };
    }

    // Fetch user and get Asterdex keys from specializedPlatforms.asterdex
    const user = await userSchema.findById(userID).select('specializedPlatforms.asterdex').lean();

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: []
      };
    }

    // Get Asterdex keys array (with index for deletion)
    const keys = (user.specializedPlatforms?.asterdex || []).map((key, index) => ({
      ...key,
      arrayIndex: index // Add index for deletion
    }));

    return {
      success: true,
      data: keys
    };
  } catch (error) {
    console.error('Error fetching Asterdex keys:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch Asterdex keys',
      data: []
    };
  }
});
