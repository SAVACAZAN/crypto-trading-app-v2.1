/**
 * Tron (TRX) Wallet Generator
 * Uses tronweb for proper wallet generation
 * Supports both random generation and mnemonic-based derivation
 */

import TronWeb from 'tronweb';
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
      network = 'mainnet' // mainnet, shasta (testnet), nile (testnet)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Tron Wallet] User: ${userID}, Network: ${network}, Account Index: ${accountIndex}`);

    let mnemonic;
    let privateKey;

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Tron'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 12-word mnemonic
      mnemonic = bip39.generateMnemonic(128); // 12 words
    }

    // Derive Tron wallet from mnemonic using BIP44
    // Tron path: m/44'/195'/{account}'/0/0
    const derivationPath = `m/44'/195'/${accountIndex}'/0/0`;
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const node = bip32.fromSeed(seed).derivePath(derivationPath);

    // Get private key
    privateKey = node.privateKey.toString('hex');

    // Create Tron account from private key
    const account = TronWeb.address.fromPrivateKey(privateKey);

    // Get addresses
    const addressBase58 = account; // T... format (base58)
    const addressHex = TronWeb.address.toHex(account); // 41... format (hex)

    // Get public key (for display only)
    const publicKey = node.publicKey.toString('hex');

    const networkInfo = getNetworkInfo(network);

    const walletData = {
      success: true,
      network: 'Tron',
      type: 'Tron',
      symbol: 'TRX',

      // Wallet details
      address: addressBase58, // T... format (base58 - most common)
      addressHex: addressHex, // 41... format (hex)
      privateKey: privateKey,
      publicKey: publicKey,
      mnemonic: mnemonic,

      // Derivation info
      accountIndex: accountIndex,
      derivationPath: derivationPath,

      // Additional info
      addressFormats: {
        base58: 'T... (recommended - base58)',
        hex: '41... (hex format)'
      },

      warning: '⚠️ NEVER share your private key or mnemonic! Tron uses secp256k1 signatures.',

      // Network info
      chainInfo: networkInfo,

      // Tron-specific notes
      notes: [
        '📌 Tron uses Delegated Proof of Stake (DPoS) consensus',
        '📌 27 Super Representatives (SRs) produce blocks',
        '📌 Block time: 3 seconds',
        '📌 Accounts must be activated (min 1 TRX balance)',
        '📌 Bandwidth points regenerate daily (1000 free daily)',
        '📌 Energy for smart contract execution (can be obtained by staking)',
        '📌 TRC-10 tokens (native) and TRC-20 tokens (smart contract)',
        '📌 Freeze TRX to get bandwidth/energy and voting power',
        '📌 Transaction fees very low (~0.001 TRX for simple transfers)',
        '📌 Compatible with Ethereum tools (similar address derivation)'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Tron Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Tron',
        networkSymbol: 'TRX',
        chainId: 0, // Tron doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: addressBase58,
        publicKey: publicKey,
        privateKey: privateKey, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nHex Address: ${addressHex}\nNetwork: ${network}\n\n${walletData.notes.join('\n')}`,
        tags: ['Tron', 'TRX', 'DPoS', 'BIP44-195'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Tron Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Tron (TRX) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Tron (TRX) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Tron Wallet] Error:', error);
    return {
      success: false,
      message: `Tron wallet generation failed: ${error.message}`
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNetworkInfo(network) {
  const networks = {
    mainnet: {
      name: 'Mainnet',
      fullHost: 'https://api.trongrid.io',
      solidityNode: 'https://api.trongrid.io',
      eventServer: 'https://api.trongrid.io',
      explorerUrl: 'https://tronscan.org/#/address/',
      tronscanUrl: 'https://tronscan.org',
      chainId: '0x2b6653dc'
    },
    shasta: {
      name: 'Shasta Testnet',
      fullHost: 'https://api.shasta.trongrid.io',
      solidityNode: 'https://api.shasta.trongrid.io',
      eventServer: 'https://api.shasta.trongrid.io',
      explorerUrl: 'https://shasta.tronscan.org/#/address/',
      tronscanUrl: 'https://shasta.tronscan.org',
      chainId: '0x94a9059e',
      faucetUrl: 'https://www.trongrid.io/shasta'
    },
    nile: {
      name: 'Nile Testnet',
      fullHost: 'https://api.nileex.io',
      solidityNode: 'https://api.nileex.io',
      eventServer: 'https://api.nileex.io',
      explorerUrl: 'https://nile.tronscan.org/#/address/',
      tronscanUrl: 'https://nile.tronscan.org',
      chainId: '0xcd8690dc',
      faucetUrl: 'http://nileex.io/join/getJoinPage'
    }
  };

  return networks[network] || networks.mainnet;
}
