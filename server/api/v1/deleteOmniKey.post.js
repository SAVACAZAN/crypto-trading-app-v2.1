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
    const user = await userSchema.findById(userID).select('specializedPlatforms.omni');

    if (!user || !user.specializedPlatforms?.omni?.[arrayIndex]) {
      return {
        success: false,
        message: 'Omni key not found'
      };
    }

    // Remove the key at the specified index
    user.specializedPlatforms.omni.splice(arrayIndex, 1);
    await user.save();

    return {
      success: true,
      message: 'Omni key deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting Omni key:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete Omni key'
    };
  }
});
