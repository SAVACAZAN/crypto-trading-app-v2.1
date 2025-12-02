/**
 * Mina Protocol (MINA) Wallet Generator
 * Uses Ed25519 keypairs
 * Mina is a lightweight blockchain with constant 22KB size using zk-SNARKs
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
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

    console.log(`[Generate Mina Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Mina'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive Mina keys using BIP44
    // Mina path: m/44'/12586'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/12586'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    // Convert to Ed25519 keypair
    const privateKeySeed = child.privateKey.slice(0, 32);
    const keypair = nacl.sign.keyPair.fromSeed(privateKeySeed);

    const publicKeyHex = Buffer.from(keypair.publicKey).toString('hex');
    const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

    // Mina uses Base58 encoding with specific prefix
    const address = 'B62' + bs58.encode(keypair.publicKey).substring(0, 52);

    const walletData = {
      success: true,
      network: 'Mina Protocol',
      type: 'Mina Protocol',
      symbol: 'MINA',

      address: address,
      publicKey: publicKeyHex,
      privateKey: privateKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Base58 (Ed25519)',

      warning: '⚠️ NEVER share your private key or mnemonic! Mina Protocol uses zk-SNARKs.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~3 minutes',
        explorerUrl: `https://minascan.io/mainnet/account/${address}`,
        minaExplorer: `https://minaexplorer.com/wallet/${address}`,
        rpcUrl: 'https://proxy.berkeley.minaexplorer.com'
      },

      notes: [
        '📌 World\'s lightest blockchain - constant 22KB size',
        '📌 Uses zk-SNARKs (zero-knowledge proofs)',
        '📌 Succinct blockchain enables full node on mobile devices',
        '📌 Privacy-preserving smart contracts (zkApps)',
        '📌 Proof of Stake consensus mechanism',
        '📌 Native token: MINA',
        '📌 Developed by O(1) Labs'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Mina Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Mina Protocol',
        networkSymbol: 'MINA',
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
        tags: ['Mina', 'MINA', 'Ed25519', 'zk-SNARKs', 'Layer1'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Mina Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Mina Protocol wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Mina Protocol wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Mina Wallet] Error:', error);
    return {
      success: false,
      message: `Mina Protocol wallet generation failed: ${error.message}`
    };
  }
});
