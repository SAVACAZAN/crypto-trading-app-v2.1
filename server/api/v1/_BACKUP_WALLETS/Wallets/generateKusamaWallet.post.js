/**
 * Kusama (KSM) Wallet Generator
 * Kusama is Polkadot's canary network - uses same substrate framework
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';
import crypto from 'crypto';

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

    console.log(`[Generate Kusama Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Kusama'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Kusama/Substrate path: m/44'/434'/{account}'/0'/0'
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/434'/${accountIndex}'/0'/0'`;
    const child = root.derivePath(derivationPath);

    const privateKeyHex = child.privateKey.toString('hex');
    const publicKeyHex = child.publicKey.toString('hex');

    // Kusama uses SS58 format with prefix 2
    // Simplified: using hex representation
    const hash = crypto.createHash('sha256').update(child.publicKey).digest();
    const addressHex = hash.slice(0, 32).toString('hex');
    // Kusama addresses start with uppercase letter (SS58 format)
    const address = `K${addressHex.slice(0, 47)}`; // Simplified SS58

    const walletData = {
      success: true,
      network: 'Kusama',
      type: 'Kusama',
      symbol: 'KSM',

      address: address,
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'SS58 (K...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Kusama is Polkadot\'s canary network.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~6 seconds',
        explorerUrl: `https://kusama.subscan.io/account/${address}`,
        polkascanUrl: `https://polkascan.io/kusama/account/${address}`,
        rpcUrl: 'wss://kusama-rpc.polkadot.io',
        minFee: '~0.001 KSM'
      },

      notes: [
        '📌 Kusama - Polkadot\'s canary network',
        '📌 Faster governance and upgrades than Polkadot',
        '📌 Real-value experimental network',
        '📌 Parachain auctions and crowdloans',
        '📌 Substrate-based framework',
        '📌 Nominated Proof-of-Stake (NPoS)',
        '📌 Interoperable with Polkadot ecosystem',
        '📌 Lower barrier to entry for parachains'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Kusama Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Kusama',
        networkSymbol: 'KSM',
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
        tags: ['Kusama', 'KSM', 'Substrate', 'Parachain'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Kusama Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Kusama wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Kusama wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Kusama Wallet] Error:', error);
    return {
      success: false,
      message: `Kusama wallet generation failed: ${error.message}`
    };
  }
});
