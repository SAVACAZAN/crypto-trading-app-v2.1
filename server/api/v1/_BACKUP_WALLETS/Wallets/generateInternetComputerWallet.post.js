/**
 * Internet Computer (ICP) Wallet Generator
 * Uses Ed25519 keypairs with Principal ID derivation
 * ICP uses unique Principal ID system
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import nacl from 'tweetnacl';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Simple Principal ID encoding (basic implementation)
function derivePrincipalId(publicKey) {
  // ICP uses a custom encoding, this is a simplified version
  // In production, use @dfinity/principal library
  const hash = Buffer.from(publicKey).toString('hex').substring(0, 40);
  return hash;
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

    console.log(`[Generate ICP Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Internet Computer'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive ICP keys using BIP44
    // ICP path: m/44'/223'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/223'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    // Convert to Ed25519 keypair
    const privateKeySeed = child.privateKey.slice(0, 32);
    const keypair = nacl.sign.keyPair.fromSeed(privateKeySeed);

    const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');
    const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

    // Generate Principal ID (simplified)
    const principalId = derivePrincipalId(keypair.publicKey);
    const address = principalId;

    const walletData = {
      success: true,
      network: 'Internet Computer',
      type: 'Internet Computer',
      symbol: 'ICP',

      address: address,
      principalId: principalId,
      publicKey: publicKeyHex,
      privateKey: privateKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Principal ID',

      warning: '⚠️ NEVER share your private key or mnemonic! Internet Computer uses unique Principal IDs.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~2 seconds',
        explorerUrl: `https://dashboard.internetcomputer.org/account/${address}`,
        icpUrl: `https://www.dfinityexplorer.org/#/account/${address}`,
        consensus: 'Threshold Relay'
      },

      notes: [
        '📌 World\'s first blockchain running at web speed',
        '📌 Uses Chain Key Technology for instant finality',
        '📌 Reverse gas model - developers pay for computation',
        '📌 Smart contracts called "canisters"',
        '📌 Supports full web applications on-chain',
        '📌 Built by DFINITY Foundation',
        '📌 Native token: ICP'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Internet Computer Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Internet Computer',
        networkSymbol: 'ICP',
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
        tags: ['ICP', 'Internet Computer', 'Ed25519', 'Layer1', 'Smart Contracts'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate ICP Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Internet Computer wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Internet Computer wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate ICP Wallet] Error:', error);
    return {
      success: false,
      message: `Internet Computer wallet generation failed: ${error.message}`
    };
  }
});
