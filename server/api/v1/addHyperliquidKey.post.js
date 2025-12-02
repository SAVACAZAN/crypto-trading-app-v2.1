import { userSchema } from "~/server/models/user.schema.js";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, name, walletAddress, privateKey } = body;

    // Validation
    if (!userID || !name || !walletAddress || !privateKey) {
      return {
        success: false,
        message: "Missing required fields: userID, name, walletAddress, privateKey"
      };
    }

    // Validate wallet address format (basic Ethereum address validation)
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        success: false,
        message: "Invalid wallet address format. Must be a valid Ethereum address (0x...)"
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

    // Create new Hyperliquid key object
    const newKey = {
      _id: new Date().getTime().toString(), // Simple ID generation
      name: name.trim(),
      walletAddress: walletAddress.trim(),
      privateKey: privateKey.trim(),
      createdAt: new Date()
    };

    // Initialize hyperliquidKeys array if it doesn't exist
    if (!user.hyperliquidKeys) {
      user.hyperliquidKeys = [];
    }

    // Check if a key with this name already exists
    const existingKey = user.hyperliquidKeys.find(key => key.name === name.trim());
    if (existingKey) {
      return {
        success: false,
        message: `A Hyperliquid key with the name "${name}" already exists`
      };
    }

    // Check if this wallet address is already added
    const existingWallet = user.hyperliquidKeys.find(key => key.walletAddress === walletAddress.trim());
    if (existingWallet) {
      return {
        success: false,
        message: "This wallet address is already configured"
      };
    }

    // Add new key to array
    user.hyperliquidKeys.push(newKey);

    // Save user
    await user.save();

    console.log(`✅ Added Hyperliquid key "${name}" for user ${userID}`);

    return {
      success: true,
      message: "Hyperliquid key added successfully",
      data: newKey
    };

  } catch (error) {
    console.error('❌ Error adding Hyperliquid key:', error);
    return {
      success: false,
      message: error.message || "Internal server error"
    };
  }
});
