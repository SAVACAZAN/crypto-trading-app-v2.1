/**
 * WAX (WAXP) Wallet Generator
 * WAX is an EOSIO-based blockchain for NFTs and gaming
 * Uses same WIF format as EOS with different derivation
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
      accountName = null // WAX account names (12 chars, a-z, 1-5, .)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate WAX Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for WAX'
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

    // WAX uses same coin type as EOS: m/44'/194'/{account}'/0/0
    const derivationPath = `m/44'/194'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // WAX public key format: EOS + base58(publicKey + checksum)
    const checksum = crypto.createHash('ripemd160')
      .update(Buffer.concat([publicKey, Buffer.from('K1')]))
      .digest()
      .slice(0, 4);

    const waxPublicKey = 'EOS' + base58Encode(Buffer.concat([publicKey, checksum]));

    // WAX private key WIF format
    const privateKeyWithVersion = Buffer.concat([Buffer.from([0x80]), privateKey]);
    const privateChecksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(privateKeyWithVersion).digest())
      .digest()
      .slice(0, 4);

    const privateKeyWIF = base58Encode(Buffer.concat([privateKeyWithVersion, privateChecksum]));

    // Generate a random WAX account name if not provided
    const generatedAccountName = accountName || `wax${Math.random().toString(36).substring(2, 10)}`.substring(0, 12);

    const walletData = {
      success: true,
      network: 'WAX',
      type: 'WAX',
      symbol: 'WAXP',

      address: generatedAccountName, // WAX uses account names as addresses
      accountName: generatedAccountName,
      publicKey: waxPublicKey,
      privateKey: privateKeyWIF,
      privateKeyHex: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Account name (12 chars, EOSIO format)',

      warning: '⚠️ NEVER share your private key or mnemonic! WAX is the king of NFT blockchains.',

      note: '📝 This key pair is generated, but you need to create the account on-chain using WAX Cloud Wallet or similar service.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://wax.greymass.com',
        explorerUrl: `https://wax.bloks.io/account/${generatedAccountName}`,
        features: [
          '🎮 NFT and Gaming focused',
          '⚡ DPoS consensus (EOSIO)',
          '💰 Free transactions with staking',
          '🎯 WAX Cloud Wallet integration'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `WAX Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'WAX',
        networkSymbol: 'WAXP',
        chainId: 0,
        walletType: 'Non-EVM',
        address: generatedAccountName,
        publicKey: waxPublicKey,
        privateKey: privateKeyWIF,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n${walletData.note}\nCoin Type: 194 (EOSIO)`,
        tags: ['WAX', 'WAXP', 'NFT', 'Gaming', 'EOSIO'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate WAX Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          privateKeyHex: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `WAX (WAXP) wallet generated and saved successfully! Remember to create account on-chain.`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `WAX (WAXP) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate WAX Wallet] Error:', error);
    return {
      success: false,
      message: `WAX wallet generation failed: ${error.message}`
    };
  }
});
