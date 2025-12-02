/**
 * Dymension (DYM) Wallet Generator
 * Dymension is a Cosmos SDK modular blockchain
 * Uses bech32 encoding with 'dym' prefix
 */

import * as bip39 from 'bip39';
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

    console.log(`[Generate Dymension Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Dymension'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Use CosmJS for Cosmos SDK wallet generation
    const { DirectSecp256k1HdWallet } = await import('@cosmjs/proto-signing');
    const { stringToPath } = await import('@cosmjs/crypto');

    // Dymension derivation path: m/44'/118'/{account}'/0/0 (standard Cosmos)
    const hdPath = stringToPath(`m/44'/118'/${accountIndex}'/0/0`);

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'dym',
      hdPaths: [hdPath]
    });

    const [account] = await wallet.getAccounts();
    const address = account.address;
    const publicKey = Buffer.from(account.pubkey).toString('hex');

    // Extract private key using BIP32
    const { BIP32Factory } = await import('bip32');
    const ecc = await import('tiny-secp256k1');
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc.default || ecc);
    const master = bip32.fromSeed(seed);
    const child = master.derivePath(`m/44'/118'/${accountIndex}'/0/0`);
    const privateKeyHex = child.privateKey ? child.privateKey.toString('hex') : '';

    const walletData = {
      success: true,
      network: 'Dymension',
      type: 'Dymension',
      symbol: 'DYM',

      address: address,
      publicKey: publicKey,
      privateKey: privateKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: `m/44'/118'/${accountIndex}'/0/0`,

      addressFormat: 'Bech32 (dym...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Dymension is a modular blockchain network.',

      chainInfo: {
        network: 'mainnet',
        chainId: 'dymension_1100-1',
        rpcUrl: 'https://dymension-rpc.polkachu.com',
        explorerUrl: `https://www.mintscan.io/dymension/account/${address}`,
        features: [
          '🔄 Modular blockchain hub',
          '🚀 RollApp deployment platform',
          '⚡ Cosmos SDK & IBC',
          '🔧 EVM compatibility'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Dymension Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Dymension',
        networkSymbol: 'DYM',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain ID: dymension_1100-1\nCoin Type: 118`,
        tags: ['Dymension', 'DYM', 'Cosmos', 'Modular', 'RollApps'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Dymension Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Dymension (DYM) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Dymension (DYM) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Dymension Wallet] Error:', error);
    return {
      success: false,
      message: `Dymension wallet generation failed: ${error.message}`
    };
  }
});
