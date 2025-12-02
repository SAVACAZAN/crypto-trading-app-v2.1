/**
 * Ultra.io (UOS) Wallet Generator
 * Ultra is an EOSIO-based blockchain for gaming
 * Uses EOSIO account name format
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
      accountIndex = 0,
      accountName = null // Ultra account names (12 chars, a-z, 1-5, .)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Ultra Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Ultra'
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

    // Ultra derivation path (EOSIO-based): m/44'/194'/{account}'/0/0
    const derivationPath = `m/44'/194'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Ultra public key format: EOS + base58(publicKey + checksum)
    const checksum = crypto.createHash('ripemd160')
      .update(Buffer.concat([publicKey, Buffer.from('K1')]))
      .digest()
      .slice(0, 4);

    const ultraPublicKey = 'EOS' + base58Encode(Buffer.concat([publicKey, checksum]));

    // Ultra private key WIF format
    const privateKeyWithVersion = Buffer.concat([Buffer.from([0x80]), privateKey]);
    const privateChecksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(privateKeyWithVersion).digest())
      .digest()
      .slice(0, 4);

    const privateKeyWIF = base58Encode(Buffer.concat([privateKeyWithVersion, privateChecksum]));

    // Generate a random Ultra account name if not provided
    const generatedAccountName = accountName || `ultra${Math.random().toString(36).substring(2, 9)}`.substring(0, 12);

    const walletData = {
      success: true,
      network: 'Ultra',
      type: 'Ultra.io',
      symbol: 'UOS',

      address: generatedAccountName,
      accountName: generatedAccountName,
      publicKey: ultraPublicKey,
      privateKey: privateKeyWIF,
      privateKeyHex: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'EOSIO account name (12 chars)',

      warning: '⚠️ NEVER share your private key or mnemonic! Ultra is a gaming and NFT blockchain.',

      note: '📝 This key pair is generated, but you need to create the account on-chain.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://ultra.api.eosnation.io',
        explorerUrl: `https://explorer.ultra.io/account/${generatedAccountName}`,
        features: [
          '🎮 Gaming platform & marketplace',
          '🎨 NFT infrastructure',
          '⚡ EOSIO technology',
          '💰 Digital distribution'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Ultra Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Ultra.io',
        networkSymbol: 'UOS',
        chainId: 0,
        walletType: 'Non-EVM',
        address: generatedAccountName,
        publicKey: ultraPublicKey,
        privateKey: privateKeyWIF,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n${walletData.note}\nCoin Type: 194 (EOSIO)`,
        tags: ['Ultra', 'UOS', 'Gaming', 'NFT', 'EOSIO'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Ultra Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          privateKeyHex: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Ultra.io (UOS) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Ultra.io (UOS) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Ultra Wallet] Error:', error);
    return {
      success: false,
      message: `Ultra wallet generation failed: ${error.message}`
    };
  }
});
