import { userSchema } from "~/server/models/user.schema.js";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    // Validation
    if (!userID) {
      return {
        success: false,
        message: "Missing required field: userID"
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

    // Return hyperliquid keys (or empty array if not set)
    const hyperliquidKeys = user.hyperliquidKeys || [];

    console.log(`📋 Fetched ${hyperliquidKeys.length} Hyperliquid key(s) for user ${userID}`);

    return {
      success: true,
      data: hyperliquidKeys
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid keys:', error);
    return {
      success: false,
      message: error.message || "Internal server error",
      data: []
    };
  }
});
