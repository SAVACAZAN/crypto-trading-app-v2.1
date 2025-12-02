/**
 * EOS (EOS) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * EOS uses WIF (Wallet Import Format) for keys and custom account names
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
      accountName = null // EOS account names are 12 chars (a-z, 1-5)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate EOS Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for EOS'
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

    // EOS derivation path: m/44'/194'/{account}'/0/0
    const derivationPath = `m/44'/194'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // EOS public key format: EOS + base58(publicKey + checksum)
    const checksum = crypto.createHash('ripemd160')
      .update(Buffer.concat([publicKey, Buffer.from('K1')]))
      .digest()
      .slice(0, 4);

    const eosPublicKey = 'EOS' + base58Encode(Buffer.concat([publicKey, checksum]));

    // EOS private key WIF format
    const privateKeyWithVersion = Buffer.concat([Buffer.from([0x80]), privateKey]);
    const privateChecksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(privateKeyWithVersion).digest())
      .digest()
      .slice(0, 4);

    const privateKeyWIF = base58Encode(Buffer.concat([privateKeyWithVersion, privateChecksum]));

    // Generate a random EOS account name if not provided
    const generatedAccountName = accountName || `eosuser${Math.random().toString(36).substring(2, 8)}`.substring(0, 12);

    const walletData = {
      success: true,
      network: 'EOS',
      type: 'EOS',
      symbol: 'EOS',

      address: generatedAccountName, // EOS uses account names as addresses
      accountName: generatedAccountName,
      publicKey: eosPublicKey,
      privateKey: privateKeyWIF,
      privateKeyHex: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Account name (12 chars, a-z, 1-5)',

      warning: '⚠️ NEVER share your private key or mnemonic! EOS requires account creation on-chain.',

      note: '📝 This key pair is generated, but you need to create the account on-chain using a service or faucet.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://eos.greymass.com',
        explorerUrl: `https://bloks.io/account/${generatedAccountName}`,
        features: [
          '⚡ DPoS consensus',
          '🔧 Smart contracts (C++)',
          '💰 Resource model (RAM, CPU, NET)',
          '🎯 Human-readable accounts'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `EOS Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'EOS',
        networkSymbol: 'EOS',
        chainId: 0,
        walletType: 'Non-EVM',
        address: generatedAccountName,
        publicKey: eosPublicKey,
        privateKey: privateKeyWIF,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n${walletData.note}\nCoin Type: 194`,
        tags: ['EOS', 'DPoS', 'Smart Contracts'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate EOS Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          privateKeyHex: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `EOS (EOS) wallet generated and saved successfully! Remember to create account on-chain.`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `EOS (EOS) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate EOS Wallet] Error:', error);
    return {
      success: false,
      message: `EOS wallet generation failed: ${error.message}`
    };
  }
});
