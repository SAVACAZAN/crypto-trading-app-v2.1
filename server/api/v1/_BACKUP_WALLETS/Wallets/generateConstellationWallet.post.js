/**
 * Constellation Network (DAG) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * Constellation uses DAG architecture with custom address format
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Base58 alphabet
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer) {
  let num = BigInt('0x' + buffer.toString('hex'));
  let encoded = '';

  const zero = BigInt(0);
  const fiftyEight = BigInt(58);

  while (num > zero) {
    const remainder = Number(num % fiftyEight);
    num = num / fiftyEight;
    encoded = BASE58_ALPHABET[remainder] + encoded;
  }

  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = '1' + encoded;
  }

  return encoded;
}

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

    console.log(`[Generate Constellation Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Constellation'
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

    // Constellation derivation path: m/44'/1137'/{account}'/0/0
    const derivationPath = `m/44'/1137'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Constellation address format: DAG + base58(hash(publicKey))
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest();
    const addressHash = publicKeyHash.slice(0, 25); // Take first 25 bytes

    const address = 'DAG' + base58Encode(addressHash);

    const walletData = {
      success: true,
      network: 'Constellation',
      type: 'Constellation Network',
      symbol: 'DAG',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'DAG + Base58',

      warning: '⚠️ NEVER share your private key or mnemonic! Constellation uses DAG architecture.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://l0-lb-mainnet.constellationnetwork.io',
        explorerUrl: `https://dagexplorer.io/address/${address}`,
        features: [
          '🔄 DAG (Directed Acyclic Graph)',
          '⚡ High throughput',
          '🌐 Microservices architecture',
          '📊 Real-time data validation'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Constellation Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Constellation',
        networkSymbol: 'DAG',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 1137`,
        tags: ['Constellation', 'DAG', 'Microservices'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Constellation Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Constellation Network (DAG) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Constellation Network (DAG) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Constellation Wallet] Error:', error);
    return {
      success: false,
      message: `Constellation wallet generation failed: ${error.message}`
    };
  }
});
