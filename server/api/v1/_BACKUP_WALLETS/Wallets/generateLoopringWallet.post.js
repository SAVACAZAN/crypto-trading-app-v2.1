/**
 * Loopring (LRC) Wallet Generator
 * Loopring is an Ethereum Layer 2 zkRollup for DeFi
 * Uses Ethereum-compatible addresses
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
      accountIndex = 0
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Loopring Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Loopring'
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

    // Ethereum derivation path: m/44'/60'/{account}'/0/0
    const derivationPath = `m/44'/60'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Generate Ethereum-compatible address
    const pubKeyWithoutPrefix = publicKey.length === 65 ? publicKey.slice(1) : publicKey;
    const keccak256 = crypto.createHash('sha3-256').update(pubKeyWithoutPrefix).digest();
    const address = '0x' + keccak256.slice(-20).toString('hex');

    const walletData = {
      success: true,
      network: 'Loopring',
      type: 'Loopring',
      symbol: 'LRC',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Ethereum-compatible (0x...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Loopring is a zkRollup Layer 2 DEX.',

      chainInfo: {
        network: 'mainnet',
        l1ChainId: 1,
        l2Network: 'loopring',
        rpcUrl: 'https://api3.loopring.io',
        explorerUrl: `https://explorer.loopring.io/account/${address}`,
        features: [
          '💱 zkRollup DEX & payments',
          '⚡ High throughput (~2000 TPS)',
          '🔐 Ethereum L1 security',
          '💰 Low trading fees'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Loopring Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Loopring',
        networkSymbol: 'LRC',
        chainId: 1,
        walletType: 'L2',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 60 (Ethereum)`,
        tags: ['Loopring', 'LRC', 'L2', 'zkRollup', 'DEX'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Loopring Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Loopring (LRC) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Loopring (LRC) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Loopring Wallet] Error:', error);
    return {
      success: false,
      message: `Loopring wallet generation failed: ${error.message}`
    };
  }
});
