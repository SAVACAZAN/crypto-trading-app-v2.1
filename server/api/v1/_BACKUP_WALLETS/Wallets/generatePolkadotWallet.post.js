/**
 * Polkadot (DOT) / Kusama (KSM) Wallet Generator
 * Uses @polkadot/keyring and @polkadot/util-crypto
 * Supports sr25519, ed25519, and ecdsa key types
 */

import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate, mnemonicValidate, cryptoWaitReady } from '@polkadot/util-crypto';
import { encodeAddress } from '@polkadot/util-crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null,
      keyType = 'sr25519', // sr25519, ed25519, ecdsa
      network = 'polkadot', // polkadot, kusama, westend
      addressFormat = 0 // 0=Polkadot, 2=Kusama, 42=generic substrate
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Polkadot Wallet] User: ${userID}, Network: ${network}, KeyType: ${keyType}`);

    // Wait for crypto to be ready
    await cryptoWaitReady();

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      // Validate custom mnemonic
      const isValid = mnemonicValidate(customMnemonic);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Polkadot'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 12-word mnemonic (Polkadot standard)
      mnemonic = mnemonicGenerate(12);
    }

    // Create keyring with specified key type
    const keyring = new Keyring({
      type: keyType,
      ss58Format: addressFormat
    });

    // Add account from mnemonic
    const pair = keyring.addFromUri(mnemonic);

    // Get addresses in different formats
    const polkadotAddress = pair.address; // Current format based on ss58Format

    // Get public key for encoding in different formats
    const publicKey = pair.publicKey;

    // Encode addresses in all common formats using encodeAddress
    const polkadotFormatAddress = encodeAddress(publicKey, 0);  // Polkadot format
    const kusamaFormatAddress = encodeAddress(publicKey, 2);    // Kusama format
    const genericFormatAddress = encodeAddress(publicKey, 42);  // Generic Substrate format

    const networkInfo = getNetworkInfo(network);

    const walletData = {
      success: true,
      network: networkInfo.name,
      type: 'Polkadot',
      symbol: networkInfo.symbol,

      // Wallet details
      address: polkadotAddress, // Main address in selected format
      publicKey: pair.publicKey.toString(),
      mnemonic: mnemonic,

      // Different address formats (same keys, different encoding)
      addresses: {
        polkadot: polkadotFormatAddress, // Format 0
        kusama: kusamaFormatAddress,     // Format 2
        generic: genericFormatAddress     // Format 42
      },

      // Wallet info
      keyType: keyType,
      ss58Format: addressFormat,
      derivationPath: '//0', // Polkadot uses // for hard derivation

      // Additional info
      addressFormat: `SS58 Format ${addressFormat}`,

      warning: '⚠️ NEVER share your mnemonic! Polkadot uses 12-word mnemonics by default.',

      // Network info
      chainInfo: networkInfo.chainInfo,

      // Polkadot-specific notes
      notes: [
        '📌 Same mnemonic can be used for DOT, KSM, and other Substrate chains',
        '📌 Address format changes but keys remain the same',
        `📌 Using ${keyType} signature scheme (recommended: sr25519)`,
        '📌 Polkadot uses Nominated Proof of Stake (NPoS)',
        '📌 Minimum existential deposit: 1 DOT (balance must be > 1 DOT)',
        '📌 You can stake DOT to earn rewards (~15% APY)',
        '📌 Use // for hard derivation, / for soft derivation'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `${networkInfo.name} Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: networkInfo.name,
        networkSymbol: networkInfo.symbol,
        chainId: 0, // Polkadot doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: polkadotAddress,
        publicKey: pair.publicKey.toString(),
        privateKey: '', // Polkadot uses mnemonic-based access
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nKey Type: ${keyType}\nSS58 Format: ${addressFormat}\n\nPolkadot: ${polkadotFormatAddress}\nKusama: ${kusamaFormatAddress}\n\n${walletData.notes.join('\n')}`,
        tags: ['Polkadot', networkInfo.symbol, 'Substrate', keyType],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Polkadot Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `${networkInfo.name} (${networkInfo.symbol}) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `${networkInfo.name} (${networkInfo.symbol}) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Polkadot Wallet] Error:', error);
    return {
      success: false,
      message: `Polkadot wallet generation failed: ${error.message}`
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNetworkInfo(network) {
  const networks = {
    polkadot: {
      name: 'Polkadot',
      symbol: 'DOT',
      ss58Format: 0,
      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'wss://rpc.polkadot.io',
        explorerUrl: 'https://polkadot.subscan.io',
        stakingUrl: 'https://staking.polkadot.network',
        existentialDeposit: '1 DOT',
        decimals: 10
      }
    },
    kusama: {
      name: 'Kusama',
      symbol: 'KSM',
      ss58Format: 2,
      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'wss://kusama-rpc.polkadot.io',
        explorerUrl: 'https://kusama.subscan.io',
        stakingUrl: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama-rpc.polkadot.io#/staking',
        existentialDeposit: '0.0000333333 KSM',
        decimals: 12
      }
    },
    westend: {
      name: 'Westend',
      symbol: 'WND',
      ss58Format: 42,
      chainInfo: {
        network: 'testnet',
        rpcUrl: 'wss://westend-rpc.polkadot.io',
        explorerUrl: 'https://westend.subscan.io',
        stakingUrl: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/staking',
        existentialDeposit: '0.01 WND',
        decimals: 12
      }
    }
  };

  return networks[network] || networks.polkadot;
}
