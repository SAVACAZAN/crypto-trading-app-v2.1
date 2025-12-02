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

    // Fetch user and get Omni keys from specializedPlatforms.omni
    const user = await userSchema.findById(userID).select('specializedPlatforms.omni').lean();

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: []
      };
    }

    // Get Omni keys array (with index for deletion)
    const keys = (user.specializedPlatforms?.omni || []).map((key, index) => ({
      ...key,
      arrayIndex: index // Add index for deletion
    }));

    return {
      success: true,
      data: keys
    };
  } catch (error) {
    console.error('Error fetching Omni keys:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch Omni keys',
      data: []
    };
  }
});
