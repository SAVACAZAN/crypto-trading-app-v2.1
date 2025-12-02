import { EthereumWalletsSchema } from '~/server/models/EthereumWallets.schema.js';
import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID } = body;

    if (!userID) {
      return {
        success: false,
        message: 'Missing userID parameter',
      };
    }

    console.log(`[Import Sepolia Wallets] User: ${userID}`);

    let importedCount = 0;
    let skippedCount = 0;
    let allWallets = [];

    // 1. Fetch Ethereum mainnet wallets from EthereumWallets collection
    const ethereumWallets = await EthereumWalletsSchema.find({
      userID: userID,
      isActive: true
    });

    if (ethereumWallets && ethereumWallets.length > 0) {
      console.log(`[Import Sepolia Wallets] Found ${ethereumWallets.length} EthereumWallets`);
      allWallets.push(...ethereumWallets.map(w => ({
        address: w.address,
        privateKey: w.privateKey,
        mnemonic: w.mnemonic,
        walletName: w.walletName,
        source: 'Ethereum'
      })));
    }

    // 2. Fetch Ethereum wallets from userWallets collection (generated wallets)
    const userEthWallets = await userWalletsSchema.find({
      userID: userID,
      walletType: 'EVM',
      network: 'Ethereum',
      isActive: true
    });

    if (userEthWallets && userEthWallets.length > 0) {
      console.log(`[Import Sepolia Wallets] Found ${userEthWallets.length} userWallets (Ethereum)`);
      allWallets.push(...userEthWallets.map(w => ({
        address: w.address,
        privateKey: w.privateKey,
        mnemonic: w.mnemonic,
        walletName: w.walletName,
        source: 'Ethereum (Generated)'
      })));
    }

    // 3. Fetch Monad testnet wallets
    const monadWallets = await testNetworksSchema.find({
      userID: userID,
      network: 'Monad',
      isActive: true
    });

    if (monadWallets && monadWallets.length > 0) {
      console.log(`[Import Sepolia Wallets] Found ${monadWallets.length} Monad wallets`);
      allWallets.push(...monadWallets.map(w => ({
        address: w.address,
        privateKey: w.privateKey,
        mnemonic: w.mnemonic,
        walletName: w.walletName,
        source: 'Monad'
      })));
    }

    // 4. Fetch MegaETH testnet wallets
    const megaethWallets = await testNetworksSchema.find({
      userID: userID,
      network: 'MegaETH',
      isActive: true
    });

    if (megaethWallets && megaethWallets.length > 0) {
      console.log(`[Import Sepolia Wallets] Found ${megaethWallets.length} MegaETH wallets`);
      allWallets.push(...megaethWallets.map(w => ({
        address: w.address,
        privateKey: w.privateKey,
        mnemonic: w.mnemonic,
        walletName: w.walletName,
        source: 'MegaETH'
      })));
    }

    if (allWallets.length === 0) {
      return {
        success: false,
        message: 'No compatible wallets found to import',
      };
    }

    console.log(`[Import Sepolia Wallets] Total compatible wallets: ${allWallets.length}`);

    // Import each compatible wallet as a Sepolia testnet wallet
    for (const wallet of allWallets) {
      try {
        // Check if this address already exists in Sepolia testnet
        const existing = await testNetworksSchema.findOne({
          userID: userID,
          address: wallet.address,
          network: 'Sepolia'
        });

        if (existing) {
          console.log(`[Import Sepolia Wallets] Skipping ${wallet.address} - already exists`);
          skippedCount++;
          continue;
        }

        // Import as Sepolia wallet
        await testNetworksSchema.create({
          userID: userID,
          walletName: `${wallet.walletName} (from ${wallet.source})`,
          network: 'Sepolia',
          networkSymbol: 'ETH',
          networkType: 'EVM', // Sepolia is EVM-compatible
          walletType: 'generated',
          address: wallet.address,
          publicKey: wallet.address, // Ethereum uses address as public key
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic,
          chainId: 11155111, // Sepolia Chain ID
          rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
          explorerUrl: 'https://sepolia.etherscan.io',
          balance: '0',
          isActive: true
        });

        importedCount++;
        console.log(`[Import Sepolia Wallets] ✅ Imported ${wallet.address} from ${wallet.source}`);

      } catch (error) {
        console.error(`[Import Sepolia Wallets] Error importing ${wallet.address}:`, error);
      }
    }

    console.log(`[Import Sepolia Wallets] Completed: ${importedCount} imported, ${skippedCount} skipped`);

    return {
      success: true,
      message: `Successfully imported ${importedCount} wallet${importedCount !== 1 ? 's' : ''} from Ethereum & testnets`,
      data: {
        imported: importedCount,
        skipped: skippedCount,
        total: allWallets.length
      },
    };

  } catch (error) {
    console.error('[Import Sepolia Wallets] Error:', error);
    return {
      success: false,
      message: 'Failed to import wallets',
      error: error.message,
    };
  }
});
