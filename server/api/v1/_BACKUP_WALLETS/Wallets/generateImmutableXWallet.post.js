/**
 * Immutable X (IMX) Wallet Generator
 * Immutable X is an Ethereum Layer 2 for NFTs
 * Uses Ethereum-compatible addresses (StarkEx keys internally)
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

    console.log(`[Generate Immutable X Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Immutable X'
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

    // Ethereum derivation path (IMX uses Ethereum addresses): m/44'/60'/{account}'/0/0
    const derivationPath = `m/44'/60'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Generate Ethereum-compatible address
    const pubKeyWithoutPrefix = publicKey.length === 65 ? publicKey.slice(1) : publicKey;
    const keccak256 = crypto.createHash('sha3-256').update(pubKeyWithoutPrefix).digest();
    const address = '0x' + keccak256.slice(-20).toString('hex');

    // IMX also uses StarkEx keys derived from Ethereum key
    // For simplicity, we'll note this but use the Ethereum address
    const starkKeyPath = `m/2645'/579218131'/0/0/${accountIndex}`;
    const starkChild = rootKey.derivePath(starkKeyPath);
    const starkPrivateKey = starkChild.privateKey;

    const walletData = {
      success: true,
      network: 'Immutable X',
      type: 'Immutable X',
      symbol: 'IMX',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      starkPrivateKey: starkPrivateKey ? starkPrivateKey.toString('hex') : '',
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      starkKeyPath: starkKeyPath,

      addressFormat: 'Ethereum-compatible (0x...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Immutable X is a Layer 2 for NFT trading.',

      note: '📝 This wallet uses Ethereum addresses but also derives StarkEx keys for Immutable X protocol.',

      chainInfo: {
        network: 'mainnet',
        l1ChainId: 1,
        l2Network: 'immutablex',
        rpcUrl: 'https://api.x.immutable.com/v1',
        explorerUrl: `https://immutascan.io/address/${address}`,
        features: [
          '🎨 NFT-focused Layer 2',
          '⚡ Zero gas fees for trading',
          '🔐 StarkEx zk-rollup security',
          '🎮 Gaming & collectibles'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Immutable X Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Immutable X',
        networkSymbol: 'IMX',
        chainId: 1,
        walletType: 'L2',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n${walletData.note}\nCoin Type: 60 (Ethereum)`,
        tags: ['Immutable X', 'IMX', 'L2', 'NFT', 'StarkEx'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Immutable X Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          starkPrivateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Immutable X (IMX) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Immutable X (IMX) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Immutable X Wallet] Error:', error);
    return {
      success: false,
      message: `Immutable X wallet generation failed: ${error.message}`
    };
  }
});
