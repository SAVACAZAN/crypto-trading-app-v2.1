/**
 * Thorchain (RUNE) Wallet Generator
 * Uses Cosmos SDK infrastructure (CosmJS)
 * Thorchain is a cross-chain liquidity protocol
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

    console.log(`[Generate Thorchain Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Thorchain'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Thorchain uses coin type 931
    const coinType = 931;
    const hdPath = stringToPath(`m/44'/${coinType}'/${accountIndex}'/0/0`);

    // Create wallet with Thorchain prefix 'thor'
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'thor',
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
      network: 'Thorchain',
      type: 'Cosmos',
      symbol: 'RUNE',

      address: address, // thor1... format
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: `m/44'/${coinType}'/${accountIndex}'/0/0`,
      addressPrefix: 'thor',
      coinType: coinType,

      addressFormat: 'bech32 (thor1...)',

      warning: '⚠️ NEVER share your mnemonic! Thorchain enables cross-chain swaps.',

      chainInfo: {
        chainId: 'thorchain-mainnet-v1',
        rpcUrl: 'https://rpc.thorchain.info',
        restUrl: 'https://thornode.ninerealms.com',
        explorerUrl: `https://viewblock.io/thorchain/address/${address}`,
        features: [
          '🔄 Cross-chain liquidity protocol',
          '💱 Native asset swaps (BTC, ETH, etc.)',
          '🏦 Decentralized liquidity pools',
          '⚡ No wrapped tokens needed'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Thorchain Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Thorchain',
        networkSymbol: 'RUNE',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain: thorchain-mainnet-v1\nCoin Type: ${coinType}`,
        tags: ['Thorchain', 'RUNE', 'Cosmos SDK', 'Cross-chain', 'DEX'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Thorchain Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Thorchain (RUNE) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Thorchain (RUNE) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Thorchain Wallet] Error:', error);
    return {
      success: false,
      message: `Thorchain wallet generation failed: ${error.message}`
    };
  }
});
