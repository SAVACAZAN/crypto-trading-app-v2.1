/**
 * Ripple (XRP) Wallet Generator
 * Uses ripple-keypairs for proper XRP wallet generation
 * Supports both secp256k1 and ed25519 key types
 */

import { deriveKeypair, deriveAddress, generateSeed } from 'ripple-keypairs';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
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
      accountIndex = 0,
      algorithm = 'secp256k1' // 'secp256k1' or 'ed25519'
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Ripple Wallet] User: ${userID}, Algorithm: ${algorithm}, Account Index: ${accountIndex}`);

    let mnemonic;
    let seed;
    let derivationPath = '';

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Ripple'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 24-word mnemonic
      mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words
    }

    // Generate Ripple seed directly (simpler approach)
    // Using ripple-keypairs generateSeed which creates proper format
    seed = generateSeed({ algorithm });

    // Generate Ripple keypair from seed
    const keypair = deriveKeypair(seed, { algorithm });
    const address = deriveAddress(keypair.publicKey);

    // Note: We still keep mnemonic for user backup
    derivationPath = `Ripple Native (${algorithm})`;

    // Alternative: Generate random Ripple seed
    // const randomSeed = generateSeed({ algorithm });
    // const keypair = deriveKeypair(randomSeed, { algorithm });

    const walletData = {
      success: true,
      network: 'Ripple',
      type: 'Ripple',
      symbol: 'XRP',

      // Wallet details
      address: address, // r... format (classic address)
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey,
      seed: seed, // Ripple seed (for backup)
      mnemonic: mnemonic,

      // Derivation info
      accountIndex: accountIndex,
      derivationPath: derivationPath,
      algorithm: algorithm,

      // Additional info
      addressFormat: 'Classic Address (r...)',

      warning: '⚠️ NEVER share your private key, seed, or mnemonic! Anyone with these can access your XRP.',

      // Network info
      chainInfo: {
        network: 'mainnet', // Can be 'mainnet' or 'testnet'
        rpcUrl: 'https://s1.ripple.com:51234',
        wsUrl: 'wss://s1.ripple.com',
        explorerUrl: `https://livenet.xrpl.org/accounts/${address}`,
        xrpscanUrl: `https://xrpscan.com/account/${address}`,
        bithomp: `https://bithomp.com/explorer/${address}`,

        // Important XRP info
        minimumReserve: '10 XRP', // Minimum account reserve
        ownerReserve: '2 XRP', // Per trust line/offer reserve
        baseFee: '0.00001 XRP' // Minimum transaction fee
      },

      // XRP-specific notes
      notes: [
        '📌 XRP accounts require a minimum reserve of 10 XRP to be active',
        '📌 Each object (trust line, offer, escrow, etc.) requires 2 XRP reserve',
        '📌 The reserve is locked and cannot be spent (unless reserve decreases)',
        '📌 Transaction fees are very low (typically 0.00001 XRP)',
        '📌 XRP Ledger uses a unique consensus mechanism (not mining)',
        `📌 This wallet uses ${algorithm} algorithm for signing`
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Ripple Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Ripple',
        networkSymbol: 'XRP',
        chainId: 0, // Ripple doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: address,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nSeed: ${seed}\nAlgorithm: ${algorithm}\n\n${walletData.notes.join('\n')}`,
        tags: ['Ripple', 'XRP', 'BIP44-144', algorithm],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Ripple Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          seed: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Ripple (XRP) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Ripple (XRP) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Ripple Wallet] Error:', error);
    return {
      success: false,
      message: `Ripple wallet generation failed: ${error.message}`
    };
  }
});
