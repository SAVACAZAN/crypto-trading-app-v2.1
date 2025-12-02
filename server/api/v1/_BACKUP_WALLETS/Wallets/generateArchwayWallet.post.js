/**
 * Archway (ARCH) Wallet Generator
 * Uses Cosmos SDK infrastructure (CosmJS)
 * Archway is a Cosmos chain for incentivized smart contracts
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

    console.log(`[Generate Archway Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Archway'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Archway uses standard Cosmos coin type 118
    const coinType = 118;
    const hdPath = stringToPath(`m/44'/${coinType}'/${accountIndex}'/0/0`);

    // Create wallet with Archway prefix 'archway'
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'archway',
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
      network: 'Archway',
      type: 'Cosmos',
      symbol: 'ARCH',

      address: address, // archway1... format
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: `m/44'/${coinType}'/${accountIndex}'/0/0`,
      addressPrefix: 'archway',
      coinType: coinType,

      addressFormat: 'bech32 (archway1...)',

      warning: '⚠️ NEVER share your mnemonic! Archway enables developer rewards for smart contracts.',

      chainInfo: {
        chainId: 'archway-1',
        rpcUrl: 'https://rpc.mainnet.archway.io',
        restUrl: 'https://api.mainnet.archway.io',
        explorerUrl: `https://www.mintscan.io/archway/account/${address}`,
        features: [
          '💰 Developer rewards on gas fees',
          '🔧 CosmWasm smart contracts',
          '🌐 Cosmos IBC enabled',
          '⚡ Incentivized development'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Archway Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Archway',
        networkSymbol: 'ARCH',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain: archway-1\nCoin Type: ${coinType}`,
        tags: ['Archway', 'ARCH', 'Cosmos SDK', 'Smart Contracts'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Archway Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Archway (ARCH) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Archway (ARCH) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Archway Wallet] Error:', error);
    return {
      success: false,
      message: `Archway wallet generation failed: ${error.message}`
    };
  }
});
