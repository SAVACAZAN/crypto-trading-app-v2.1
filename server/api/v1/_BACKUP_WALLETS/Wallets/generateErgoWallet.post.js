/**
 * Ergo (ERG) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * Ergo uses base58 encoding with specific address format
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { blake2b } from 'blakejs';
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

    console.log(`[Generate Ergo Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Ergo'
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

    // Ergo derivation path: m/44'/429'/{account}'/0/0
    const derivationPath = `m/44'/429'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Ergo P2PK address: network prefix (0x00 mainnet) + address type + public key hash + checksum
    const networkPrefix = Buffer.from([0x00]); // Mainnet
    const addressType = Buffer.from([0x01]); // P2PK

    // Blake2b256 hash of public key
    const publicKeyHash = Buffer.from(blake2b(publicKey, null, 32)); // 32 bytes = 256 bits

    // Combine prefix, type, and hash
    const addressContent = Buffer.concat([networkPrefix, addressType, publicKeyHash]);

    // Blake2b256 checksum (first 4 bytes)
    const checksum = Buffer.from(blake2b(addressContent, null, 32)).slice(0, 4);

    // Final address
    const addressBytes = Buffer.concat([addressContent, checksum]);
    const address = base58Encode(addressBytes);

    const walletData = {
      success: true,
      network: 'Ergo',
      type: 'Ergo',
      symbol: 'ERG',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Base58 (9...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Ergo is a UTXO-based smart contract platform.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://api.ergoplatform.com',
        explorerUrl: `https://explorer.ergoplatform.com/en/addresses/${address}`,
        features: [
          '💎 UTXO-based smart contracts',
          '⚡ Proof of Work',
          '🔧 ErgoScript language',
          '🛡️ Sigma protocols (zero-knowledge)'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Ergo Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Ergo',
        networkSymbol: 'ERG',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 429`,
        tags: ['Ergo', 'ERG', 'UTXO', 'Smart Contracts', 'PoW'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Ergo Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Ergo (ERG) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Ergo (ERG) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Ergo Wallet] Error:', error);
    return {
      success: false,
      message: `Ergo wallet generation failed: ${error.message}`
    };
  }
});
