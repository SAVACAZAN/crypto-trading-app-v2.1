/**
 * Aptos (APT) Wallet Generator
 * Uses aptos SDK for proper wallet generation
 * Supports Ed25519 key scheme
 */

import { AptosAccount } from 'aptos';
import * as bip39 from 'bip39';
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
      network = 'mainnet' // mainnet, testnet, devnet
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Aptos Wallet] User: ${userID}, Network: ${network}`);

    let account;
    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Aptos'
        };
      }
      mnemonic = customMnemonic;

      // Derive Aptos account from mnemonic
      const seed = await bip39.mnemonicToSeed(mnemonic);
      account = new AptosAccount(seed.slice(0, 32)); // Use first 32 bytes
    } else {
      // Generate new account
      mnemonic = bip39.generateMnemonic(128); // 12 words
      const seed = await bip39.mnemonicToSeed(mnemonic);
      account = new AptosAccount(seed.slice(0, 32));
    }

    // Get address and keys
    const address = account.address().hex(); // 0x... format
    const privateKeyHex = account.toPrivateKeyObject().privateKeyHex;
    const publicKeyHex = account.pubKey().hex();

    // Get authentication key
    const authKey = account.authKey().hex();

    const networkInfo = getNetworkInfo(network);

    const walletData = {
      success: true,
      network: 'Aptos',
      type: 'Aptos',
      symbol: 'APT',

      // Wallet details
      address: address, // 0x... format (64 hex chars)
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      authKey: authKey, // Authentication key
      mnemonic: mnemonic,

      // Additional info
      addressFormat: 'Hex Address (0x... 64 characters)',
      keyScheme: 'Ed25519',

      warning: '⚠️ NEVER share your private key or mnemonic! Aptos uses Ed25519 signatures.',

      // Network info
      chainInfo: networkInfo,

      // Aptos-specific notes
      notes: [
        '📌 Aptos is a Move-based Layer 1 blockchain (from ex-Meta Diem team)',
        '📌 Uses Block-STM for parallel transaction execution',
        '📌 Transaction finality: ~1 second',
        '📌 Theoretical TPS: 160,000+',
        '📌 Smart contracts written in Move language',
        '📌 Account model (not UTXO like Bitcoin)',
        '📌 Gas fees paid in APT',
        '📌 Supports multi-sig and resource accounts',
        '📌 NFTs and fungible assets natively supported'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Aptos Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Aptos',
        networkSymbol: 'APT',
        chainId: networkInfo.chainId,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nAuth Key: ${authKey}\nNetwork: ${network}\n\n${walletData.notes.join('\n')}`,
        tags: ['Aptos', 'APT', 'Move', 'Layer-1'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Aptos Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Aptos (APT) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Aptos (APT) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Aptos Wallet] Error:', error);
    return {
      success: false,
      message: `Aptos wallet generation failed: ${error.message}`
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNetworkInfo(network) {
  const networks = {
    mainnet: {
      chainId: 1,
      name: 'Mainnet',
      nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
      faucetUrl: null,
      explorerUrl: 'https://explorer.aptoslabs.com',
      aptoscanUrl: 'https://aptoscan.com'
    },
    testnet: {
      chainId: 2,
      name: 'Testnet',
      nodeUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
      faucetUrl: 'https://faucet.testnet.aptoslabs.com',
      explorerUrl: 'https://explorer.aptoslabs.com/?network=testnet',
      aptoscanUrl: 'https://testnet.aptoscan.com'
    },
    devnet: {
      chainId: 3,
      name: 'Devnet',
      nodeUrl: 'https://fullnode.devnet.aptoslabs.com/v1',
      faucetUrl: 'https://faucet.devnet.aptoslabs.com',
      explorerUrl: 'https://explorer.aptoslabs.com/?network=devnet',
      aptoscanUrl: 'https://devnet.aptoscan.com'
    }
  };

  return networks[network] || networks.mainnet;
}
