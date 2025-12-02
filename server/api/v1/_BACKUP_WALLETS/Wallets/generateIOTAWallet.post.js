/**
 * IOTA (MIOTA) Wallet Generator
 * Uses Ed25519 keypairs
 * IOTA is a distributed ledger using Directed Acyclic Graph (DAG) - The Tangle
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import nacl from 'tweetnacl';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// IOTA Bech32 address encoding (simplified)
function bech32Encode(publicKey) {
  // IOTA uses Bech32 with 'iota' prefix
  // This is a simplified implementation
  const hex = Buffer.from(publicKey).toString('hex');
  return `iota1${hex.substring(0, 52)}`;
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

    console.log(`[Generate IOTA Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for IOTA'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive IOTA keys using BIP44
    // IOTA path: m/44'/4218'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/4218'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    // Convert to Ed25519 keypair
    const privateKeySeed = child.privateKey.slice(0, 32);
    const keypair = nacl.sign.keyPair.fromSeed(privateKeySeed);

    const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');
    const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

    // IOTA uses Bech32 address format
    const address = bech32Encode(keypair.publicKey);

    const walletData = {
      success: true,
      network: 'IOTA',
      type: 'IOTA',
      symbol: 'MIOTA',

      address: address,
      publicKey: publicKeyHex,
      privateKey: privateKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Bech32 (Ed25519)',

      warning: '⚠️ NEVER share your private key or mnemonic! IOTA uses the Tangle (DAG).',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~10 seconds',
        explorerUrl: `https://explorer.iota.org/mainnet/addr/${address}`,
        iotaFoundation: 'https://www.iota.org',
        consensus: 'Tangle (DAG)'
      },

      notes: [
        '📌 Uses Directed Acyclic Graph (DAG) - The Tangle',
        '📌 Feeless transactions (no mining fees)',
        '📌 Scalable and lightweight for IoT devices',
        '📌 Coordicide upgrade for full decentralization',
        '📌 Smart contracts via IOTA Smart Contract Protocol (ISCP)',
        '📌 Native token: MIOTA (1 MIOTA = 1,000,000 IOTA)',
        '📌 Focus on Machine-to-Machine (M2M) economy'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `IOTA Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'IOTA',
        networkSymbol: 'MIOTA',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['IOTA', 'MIOTA', 'Ed25519', 'DAG', 'Tangle', 'IoT'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate IOTA Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'IOTA wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'IOTA wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate IOTA Wallet] Error:', error);
    return {
      success: false,
      message: `IOTA wallet generation failed: ${error.message}`
    };
  }
});
