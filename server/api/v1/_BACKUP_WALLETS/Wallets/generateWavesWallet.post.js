/**
 * Waves (WAVES) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * Waves uses base58 encoding for addresses
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Base58 alphabet (Bitcoin style)
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

  // Add leading zeros
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
      networkByte = 'W' // 'W' for mainnet, 'T' for testnet
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Waves Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Waves'
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

    // Waves derivation path: m/44'/5741564'/{account}'/0/0
    const derivationPath = `m/44'/5741564'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Create Waves address (version 1, mainnet)
    const version = Buffer.from([0x01]);
    const network = Buffer.from([networkByte.charCodeAt(0)]);

    // Hash public key with Blake2b256 and then Keccak256
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest();
    const addressHash = publicKeyHash.slice(0, 20);

    // Combine: version + network + hash
    const addressWithoutChecksum = Buffer.concat([version, network, addressHash]);

    // Calculate checksum (first 4 bytes of hash)
    const checksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(addressWithoutChecksum).digest())
      .digest()
      .slice(0, 4);

    // Final address
    const addressBytes = Buffer.concat([addressWithoutChecksum, checksum]);
    const address = base58Encode(addressBytes);

    const walletData = {
      success: true,
      network: 'Waves',
      type: 'Waves',
      symbol: 'WAVES',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      networkByte: networkByte,

      addressFormat: 'Base58 (3P...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Waves uses its own address format.',

      chainInfo: {
        network: networkByte === 'W' ? 'mainnet' : 'testnet',
        rpcUrl: 'https://nodes.wavesnodes.com',
        explorerUrl: `https://wavesexplorer.com/address/${address}`,
        features: [
          '📊 Smart contracts (RIDE language)',
          '💱 Built-in DEX',
          '🪙 Easy token creation',
          '⚡ Fast transactions (~1 minute)'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Waves Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Waves',
        networkSymbol: 'WAVES',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nNetwork: ${networkByte === 'W' ? 'Mainnet' : 'Testnet'}`,
        tags: ['Waves', 'WAVES', 'Smart Contracts', 'DEX'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Waves Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Waves (WAVES) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Waves (WAVES) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Waves Wallet] Error:', error);
    return {
      success: false,
      message: `Waves wallet generation failed: ${error.message}`
    };
  }
});
