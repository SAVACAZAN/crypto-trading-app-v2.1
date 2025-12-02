/**
 * Secret Network (SCRT) Wallet Generator
 * Uses Cosmos SDK infrastructure (CosmJS)
 * Secret is a privacy-focused Cosmos chain with encrypted smart contracts
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

    console.log(`[Generate Secret Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    // Generate or use custom mnemonic
    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Secret Network'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 24-word mnemonic (Cosmos standard)
      mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words
    }

    // Secret Network uses coin type 529
    const coinType = 529;
    const hdPath = stringToPath(`m/44'/${coinType}'/${accountIndex}'/0/0`);

    // Create wallet with Secret prefix 'secret'
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'secret',
      hdPaths: [hdPath]
    });

    // Get accounts
    const accounts = await wallet.getAccounts();
    const account = accounts[0];

    const address = account.address;
    const publicKeyBytes = account.pubkey;
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    // Extract private key from wallet
    const { BIP32Factory } = await import('bip32');
    const ecc = await import('tiny-secp256k1');

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc.default || ecc);
    const master = bip32.fromSeed(seed);
    const child = master.derivePath(`m/44'/${coinType}'/${accountIndex}'/0/0`);
    const privateKeyHex = child.privateKey ? child.privateKey.toString('hex') : '';

    const walletData = {
      success: true,
      network: 'Secret Network',
      type: 'Cosmos',
      symbol: 'SCRT',

      // Wallet details
      address: address, // secret1... format
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      // Derivation info
      accountIndex: accountIndex,
      derivationPath: `m/44'/${coinType}'/${accountIndex}'/0/0`,
      addressPrefix: 'secret',
      coinType: coinType,

      // Additional info
      addressFormat: 'bech32 (secret1...)',

      warning: '⚠️ NEVER share your mnemonic! Secret Network provides privacy for smart contracts.',

      // Chain info
      chainInfo: {
        chainId: 'secret-4',
        rpcUrl: 'https://lcd.mainnet.secretsaturn.net',
        restUrl: 'https://lcd.mainnet.secretsaturn.net',
        explorerUrl: `https://www.mintscan.io/secret/account/${address}`,
        features: [
          '🔒 Privacy-preserving smart contracts',
          '🌐 Cosmos IBC enabled',
          '⚡ Fast finality (~6 seconds)',
          '🛡️ Encrypted state and computation'
        ]
      }
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Secret Network Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Secret Network',
        networkSymbol: 'SCRT',
        chainId: 0, // Cosmos uses string chain IDs
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nChain: secret-4\nCoin Type: ${coinType}`,
        tags: ['Secret', 'SCRT', 'Cosmos SDK', 'Privacy'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Secret Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Secret Network (SCRT) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Secret Network (SCRT) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Secret Wallet] Error:', error);
    return {
      success: false,
      message: `Secret Network wallet generation failed: ${error.message}`
    };
  }
});
