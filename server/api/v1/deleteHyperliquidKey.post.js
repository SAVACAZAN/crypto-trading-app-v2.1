import { userSchema } from "~/server/models/user.schema.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, id } = body;

    // Validation
    if (!userID || !id) {
      return {
        success: false,
        message: "Missing required fields: userID, id"
      };
    }

    // Find user
    const user = await userSchema.findById(userID);
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    // Check if hyperliquidKeys array exists
    if (!user.hyperliquidKeys || user.hyperliquidKeys.length === 0) {
      return {
        success: false,
        message: "No Hyperliquid keys found"
      };
    }

    // Find the key to delete
    const keyIndex = user.hyperliquidKeys.findIndex(key => key._id === id);
    if (keyIndex === -1) {
      return {
        success: false,
        message: "Hyperliquid key not found"
      };
    }

    const deletedKey = user.hyperliquidKeys[keyIndex];

    // Remove the key from array
    user.hyperliquidKeys.splice(keyIndex, 1);

    // Save user
    await user.save();

    console.log(`🗑️  Deleted Hyperliquid key "${deletedKey.name}" for user ${userID}`);

    return {
      success: true,
      message: "Hyperliquid key deleted successfully"
    };

  } catch (error) {
    console.error('❌ Error deleting Hyperliquid key:', error);
    return {
      success: false,
      message: error.message || "Internal server error"
    };
  }
});
