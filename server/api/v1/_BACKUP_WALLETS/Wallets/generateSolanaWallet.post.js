/**
 * Solana (SOL) Wallet Generator
 * Uses Ed25519 keypairs for Solana blockchain
 * Supports BIP39 mnemonic derivation
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
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

    console.log(`[Generate Solana Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Solana'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive Solana keys using BIP44
    // Solana path: m/44'/501'/{account}'/0'
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/501'/${accountIndex}'/0'`;
    const child = root.derivePath(derivationPath);

    // Convert to Ed25519 keypair for Solana
    // Note: This derives from the BIP32 private key
    const privateKeySeed = child.privateKey.slice(0, 32);
    const keypair = nacl.sign.keyPair.fromSeed(privateKeySeed);

    // Solana address is base58 encoded public key
    const address = bs58.encode(keypair.publicKey);
    const privateKey = bs58.encode(keypair.secretKey);
    const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');

    const walletData = {
      success: true,
      network: 'Solana',
      type: 'Solana',
      symbol: 'SOL',

      address: address,
      publicKey: publicKeyHex,
      privateKey: privateKey,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Base58 (Ed25519)',

      warning: '⚠️ NEVER share your private key or mnemonic! Solana uses Ed25519 cryptography.',

      chainInfo: {
        network: 'mainnet-beta',
        blockTime: '~400ms',
        explorerUrl: `https://explorer.solana.com/address/${address}`,
        solscanUrl: `https://solscan.io/account/${address}`,
        rpcUrl: 'https://api.mainnet-beta.solana.com'
      },

      notes: [
        '📌 High-performance blockchain with sub-second finality',
        '📌 Uses Proof of History (PoH) + Proof of Stake (PoS)',
        '📌 Extremely low transaction fees (~$0.00025)',
        '📌 Over 65,000 TPS capacity',
        '📌 Popular for DeFi, NFTs, and Web3 gaming',
        '📌 Native token: SOL',
        '📌 SPL tokens (similar to ERC-20) supported'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Solana Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Solana',
        networkSymbol: 'SOL',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKey,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['Solana', 'SOL', 'Ed25519', 'PoH', 'Layer1'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Solana Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Solana wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Solana wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Solana Wallet] Error:', error);
    return {
      success: false,
      message: `Solana wallet generation failed: ${error.message}`
    };
  }
});
