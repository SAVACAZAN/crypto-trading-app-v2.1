/**
 * Nibiru Chain (NIBI) Wallet Generator
 * Nibiru is a Cosmos SDK blockchain
 * Uses bech32 encoding with 'nibi' prefix
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

    console.log(`[Generate Nibiru Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Nibiru'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Use CosmJS for Cosmos SDK wallet generation
    const { DirectSecp256k1HdWallet } = await import('@cosmjs/proto-signing');
    const { stringToPath } = await import('@cosmjs/crypto');

    // Nibiru derivation path: m/44'/118'/{account}'/0/0 (standard Cosmos)
    const hdPath = stringToPath(`m/44'/118'/${accountIndex}'/0/0`);

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'nibi',
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
      network: 'Nibiru Chain',
      type: 'Nibiru',
      symbol: 'NIBI',

      address: address,
      publicKey: publicKey,
      privateKey: privateKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: `m/44'/118'/${accountIndex}'/0/0`,

      addressFormat: 'Bech32 (nibi...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Nibiru is a DeFi-focused Cosmos chain.',

      chainInfo: {
        network: 'mainnet',
        chainId: 'nibiru-1',
        rpcUrl: 'https://rpc.nibiru.fi',
        explorerUrl: `https://explorer.nibiru.fi/nibiru-1/account/${address}`,
        features: [
          '💱 Perpetuals & spot trading',
          '⚡ Cosmos SDK & IBC',
          '🔧 CosmWasm smart contracts',
          '💰 Native DeFi protocols'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Nibiru Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Nibiru Chain',
        networkSymbol: 'NIBI',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain ID: nibiru-1\nCoin Type: 118`,
        tags: ['Nibiru', 'NIBI', 'Cosmos', 'DeFi', 'Perpetuals'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Nibiru Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Nibiru Chain (NIBI) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Nibiru Chain (NIBI) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Nibiru Wallet] Error:', error);
    return {
      success: false,
      message: `Nibiru wallet generation failed: ${error.message}`
    };
  }
});
