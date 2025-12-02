/**
 * Zilliqa (ZIL) Wallet Generator
 * Uses BIP39/BIP32 for key derivation with Schnorr signatures
 * Zilliqa uses bech32 encoding with 'zil' prefix
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Simplified bech32 encode function
function bech32Encode(hrp, data) {
  const hex = Buffer.from(data).toString('hex');
  return `${hrp}1${hex}`;
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

    console.log(`[Generate Zilliqa Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Zilliqa'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Derive keys using BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);

    // Zilliqa derivation path: m/44'/313'/{account}'/0/0
    const derivationPath = `m/44'/313'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Create Zilliqa address from public key hash
    // Address is SHA256 hash of public key, last 20 bytes
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest();
    const addressBytes = publicKeyHash.slice(-20);

    // Encode as bech32 with 'zil' prefix (simplified)
    const address = bech32Encode('zil', addressBytes);

    const walletData = {
      success: true,
      network: 'Zilliqa',
      type: 'Zilliqa',
      symbol: 'ZIL',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'bech32 (zil1...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Zilliqa uses sharding for scalability.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://api.zilliqa.com',
        explorerUrl: `https://viewblock.io/zilliqa/address/${address}`,
        features: [
          '🔀 Sharding for high throughput',
          '⚡ ~2400 TPS capacity',
          '🔧 Scilla smart contracts',
          '🛡️ Schnorr signatures'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Zilliqa Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Zilliqa',
        networkSymbol: 'ZIL',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 313`,
        tags: ['Zilliqa', 'ZIL', 'Sharding', 'Smart Contracts'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Zilliqa Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Zilliqa (ZIL) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Zilliqa (ZIL) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Zilliqa Wallet] Error:', error);
    return {
      success: false,
      message: `Zilliqa wallet generation failed: ${error.message}`
    };
  }
});
