/**
 * Aleph Zero (AZERO) Wallet Generator
 * Aleph Zero is a Substrate-based blockchain (similar to Polkadot/Kusama)
 * Uses SR25519 or ED25519 for key pairs
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

// SS58 address encoding (Substrate)
function encodeAddress(publicKey, ss58Format = 42) {
  const prefix = ss58Format < 64 ? Buffer.from([ss58Format]) : Buffer.from([
    ((ss58Format >> 8) & 0xFF) | 0x40,
    ss58Format & 0xFF
  ]);

  const data = Buffer.concat([prefix, publicKey]);
  const hash = crypto.createHash('blake2b512').update(Buffer.concat([Buffer.from('SS58PRE'), data])).digest();
  const checksum = hash.slice(0, 2);

  return base58Encode(Buffer.concat([data, checksum]));
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

    console.log(`[Generate Aleph Zero Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Aleph Zero'
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

    // Aleph Zero derivation path: m/44'/643'/{account}'/0/0
    const derivationPath = `m/44'/643'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Aleph Zero uses SS58 format with prefix 42 (like Substrate generic)
    const address = encodeAddress(publicKey, 42);

    const walletData = {
      success: true,
      network: 'Aleph Zero',
      type: 'Aleph Zero',
      symbol: 'AZERO',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'SS58 (Substrate format)',

      warning: '⚠️ NEVER share your private key or mnemonic! Aleph Zero is a privacy-focused blockchain.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://rpc.azero.dev',
        explorerUrl: `https://azero.dev/#/explorer/query/${address}`,
        features: [
          '🔐 Privacy-focused (ZK proofs)',
          '⚡ High performance (100k+ TPS)',
          '🔗 Substrate-based',
          '📝 ink! smart contracts (Rust)'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Aleph Zero Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Aleph Zero',
        networkSymbol: 'AZERO',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 643`,
        tags: ['Aleph Zero', 'AZERO', 'Privacy', 'Substrate'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Aleph Zero Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Aleph Zero (AZERO) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Aleph Zero (AZERO) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Aleph Zero Wallet] Error:', error);
    return {
      success: false,
      message: `Aleph Zero wallet generation failed: ${error.message}`
    };
  }
});
