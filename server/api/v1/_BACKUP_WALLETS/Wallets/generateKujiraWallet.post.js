/**
 * Kujira (KUJI) Wallet Generator
 * Uses Cosmos SDK infrastructure (CosmJS)
 * Kujira is a Cosmos-based DeFi protocol for liquidations and trading
 */

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { stringToPath } from '@cosmjs/crypto';
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

    console.log(`[Generate Kujira Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Kujira'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Kujira uses standard Cosmos coin type 118
    const coinType = 118;
    const hdPath = stringToPath(`m/44'/${coinType}'/${accountIndex}'/0/0`);

    // Create wallet with Kujira prefix 'kujira'
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'kujira',
      hdPaths: [hdPath]
    });

    const accounts = await wallet.getAccounts();
    const account = accounts[0];

    const address = account.address;
    const publicKeyBytes = account.pubkey;
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    // Extract private key
    const { BIP32Factory } = await import('bip32');
    const ecc = await import('tiny-secp256k1');

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc.default || ecc);
    const master = bip32.fromSeed(seed);
    const child = master.derivePath(`m/44'/${coinType}'/${accountIndex}'/0/0`);
    const privateKeyHex = child.privateKey ? child.privateKey.toString('hex') : '';

    const walletData = {
      success: true,
      network: 'Kujira',
      type: 'Cosmos',
      symbol: 'KUJI',

      address: address, // kujira1... format
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: `m/44'/${coinType}'/${accountIndex}'/0/0`,
      addressPrefix: 'kujira',
      coinType: coinType,

      addressFormat: 'bech32 (kujira1...)',

      warning: '⚠️ NEVER share your mnemonic! Kujira is a Cosmos-based DeFi platform.',

      chainInfo: {
        chainId: 'kaiyo-1',
        rpcUrl: 'https://rpc.kujira.app',
        restUrl: 'https://lcd.kujira.app',
        explorerUrl: `https://finder.kujira.app/kaiyo-1/account/${address}`,
        features: [
          '💰 DeFi liquidation marketplace',
          '📊 Advanced trading protocols',
          '🌐 Cosmos IBC enabled',
          '⚡ Fast transactions'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Kujira Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Kujira',
        networkSymbol: 'KUJI',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain: kaiyo-1\nCoin Type: ${coinType}`,
        tags: ['Kujira', 'KUJI', 'Cosmos SDK', 'DeFi'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Kujira Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Kujira (KUJI) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Kujira (KUJI) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Kujira Wallet] Error:', error);
    return {
      success: false,
      message: `Kujira wallet generation failed: ${error.message}`
    };
  }
});
