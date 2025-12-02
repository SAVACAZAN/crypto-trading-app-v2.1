import { sepoliaNetworkBalance } from '~/server/models/sepoliaNetworkBalance.schema.js';
import { ethers } from 'ethers';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, address, balance, walletName, walletSource } = body;

    if (!userID || !address) {
      return {
        success: false,
        message: 'Missing required parameters: userID and address',
      };
    }

    console.log(`[Update Sepolia Balance] User: ${userID}, Address: ${address}`);

    // Convert balance to wei for storage
    let balanceInWei = '0';
    let balanceInETH = balance || '0';

    if (balance && parseFloat(balance) > 0) {
      try {
        balanceInWei = ethers.parseEther(balance).toString();
      } catch (error) {
        console.error('[Update Sepolia Balance] Error parsing balance:', error);
      }
    }

    // Upsert (update or insert) the balance
    const updated = await sepoliaNetworkBalance.findOneAndUpdate(
      {
        userID: userID,
        address: address
      },
      {
        $set: {
          balance: balanceInETH,
          balanceInWei: balanceInWei,
          network: 'Sepolia',
          chainId: 11155111,
          lastScanned: new Date(),
          walletName: walletName || '',
          walletSource: walletSource || 'testNetworks',
          isActive: true
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    console.log(`[Update Sepolia Balance] ✅ Saved: ${address} = ${balanceInETH} ETH`);

    return {
      success: true,
      message: 'Balance updated successfully',
      data: updated,
    };

  } catch (error) {
    console.error('[Update Sepolia Balance] Error:', error);
    return {
      success: false,
      message: 'Failed to update balance',
      error: error.message,
    };
  }
});
