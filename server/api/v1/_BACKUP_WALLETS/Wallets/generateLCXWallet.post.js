/**
 * LCX (LCX) Wallet Generator
 * LCX is EVM-compatible, uses Ethereum address format
 * Uses BIP39/BIP32 with Ethereum derivation path
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

    console.log(`[Generate LCX Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for LCX'
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

    // LCX uses Ethereum's derivation path: m/44'/60'/{account}'/0/0
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
      network: 'LCX',
      type: 'LCX',
      symbol: 'LCX',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Ethereum-compatible (0x...)',

      warning: '⚠️ NEVER share your private key or mnemonic! LCX is a regulated crypto exchange token.',

      chainInfo: {
        network: 'mainnet',
        chainId: 1, // Ethereum mainnet
        rpcUrl: 'https://eth.llamarpc.com',
        explorerUrl: `https://etherscan.io/address/${address}`,
        features: [
          '🏦 Regulated exchange token',
          '💱 Trading & DeFi',
          '⚡ EVM-compatible',
          '🔐 Security token'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `LCX Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'LCX',
        networkSymbol: 'LCX',
        chainId: 1,
        walletType: 'EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 60 (Ethereum)`,
        tags: ['LCX', 'Exchange', 'EVM', 'Ethereum'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate LCX Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `LCX wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `LCX wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate LCX Wallet] Error:', error);
    return {
      success: false,
      message: `LCX wallet generation failed: ${error.message}`
    };
  }
});
