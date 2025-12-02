import { userSchema } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, arrayIndex } = body;

    if (!userID || arrayIndex === undefined) {
      return {
        success: false,
        message: 'Missing required fields: userID, arrayIndex'
      };
    }

    // Get user to find the key at the specified index
    const user = await userSchema.findById(userID).select('specializedPlatforms.asterdex');

    if (!user || !user.specializedPlatforms?.asterdex?.[arrayIndex]) {
      return {
        success: false,
        message: 'Asterdex key not found'
      };
    }

    // Remove the key at the specified index
    user.specializedPlatforms.asterdex.splice(arrayIndex, 1);
    await user.save();

    return {
      success: true,
      message: 'Asterdex key deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting Asterdex key:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete Asterdex key'
    };
  }
});
