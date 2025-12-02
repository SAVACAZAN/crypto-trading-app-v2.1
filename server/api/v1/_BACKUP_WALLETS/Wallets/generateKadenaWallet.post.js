/**
 * Kadena (KDA) Wallet Generator
 * Uses ED25519 key pairs for Chainweb
 * Kadena uses k: prefix for addresses
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
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
      chainId = 0 // Kadena has 20 chains (0-19)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Kadena Wallet] User: ${userID}, Account: ${accountIndex}, Chain: ${chainId}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Kadena'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Derive keys using BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);

    // Kadena derivation path: m/44'/626'/{account}'/0/0
    const derivationPath = `m/44'/626'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Kadena address format: k:{publicKeyHex}
    const publicKeyHex = publicKey.toString('hex');
    const address = `k:${publicKeyHex}`;

    const walletData = {
      success: true,
      network: 'Kadena',
      type: 'Kadena',
      symbol: 'KDA',

      address: address,
      publicKey: publicKeyHex,
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      chainId: chainId, // Which of the 20 chains

      addressFormat: 'k:{publicKey}',

      warning: '⚠️ NEVER share your private key or mnemonic! Kadena uses 20-chain Proof of Work.',

      chainInfo: {
        network: 'mainnet',
        totalChains: 20,
        currentChain: chainId,
        rpcUrl: `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`,
        explorerUrl: `https://explorer.chainweb.com/mainnet/account/${address}`,
        features: [
          '⛏️ Scalable Proof of Work',
          '🔗 20 braided chains',
          '📝 Pact smart contract language',
          '⚡ High throughput (480k TPS theoretical)'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Kadena Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Kadena',
        networkSymbol: 'KDA',
        chainId: chainId,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain: ${chainId}/20\nCoin Type: 626`,
        tags: ['Kadena', 'KDA', 'PoW', 'Pact', 'Braided Chains'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Kadena Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Kadena (KDA) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Kadena (KDA) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Kadena Wallet] Error:', error);
    return {
      success: false,
      message: `Kadena wallet generation failed: ${error.message}`
    };
  }
});
