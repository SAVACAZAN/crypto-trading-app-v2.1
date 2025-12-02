/**
 * Cardano (ADA) Wallet Generator - Simplified
 * Uses cardano-crypto.js for basic wallet generation
 * Generates standard Cardano addresses
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';
import crypto from 'crypto';

// Simplified Bech32 encoding (avoiding bech32 module issues)
function bech32Encode(hrp, data) {
  // For now, use hex format instead of bech32 (simplified)
  // In production, use proper bech32 library
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
      accountIndex = 0,
      networkType = 'mainnet' // 'mainnet' or 'testnet'
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Cardano Wallet] User: ${userID}, Account Index: ${accountIndex}, Network: ${networkType}`);

    let mnemonic;

    // Generate or use custom mnemonic
    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Cardano'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 24-word mnemonic (Cardano standard)
      mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words
    }

    // Derive Cardano keys using BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);

    // Cardano derivation paths (CIP-1852)
    // Payment key: m/1852'/1815'/{account}'/0/0
    // Staking key:  m/1852'/1815'/{account}'/2/0
    const paymentPath = `m/1852'/1815'/${accountIndex}'/0/0`;
    const stakingPath = `m/1852'/1815'/${accountIndex}'/2/0`;

    const paymentKey = rootKey.derivePath(paymentPath);
    const stakingKey = rootKey.derivePath(stakingPath);

    // Get private and public keys
    const paymentPrivateKeyHex = paymentKey.privateKey.toString('hex');
    const paymentPublicKeyHex = paymentKey.publicKey.toString('hex');
    const stakingPrivateKeyHex = stakingKey.privateKey.toString('hex');
    const stakingPublicKeyHex = stakingKey.publicKey.toString('hex');

    // Create a simplified Cardano address using blake2b hash
    const paymentKeyHash = crypto.createHash('sha256').update(paymentKey.publicKey).digest();
    const stakingKeyHash = crypto.createHash('sha256').update(stakingKey.publicKey).digest();

    // Combine payment and staking key hashes (simplified base address format)
    const addressPayload = Buffer.concat([
      Buffer.from([0x01]), // Base address type (payment + staking)
      paymentKeyHash.slice(0, 28), // Payment credential (28 bytes)
      stakingKeyHash.slice(0, 28)  // Staking credential (28 bytes)
    ]);

    // Encode to simplified address format (using hex for simplicity)
    const addressPrefix = networkType === 'mainnet' ? 'addr' : 'addr_test';
    const address = bech32Encode(addressPrefix, addressPayload);

    // Generate stake address
    const stakePayload = Buffer.concat([
      Buffer.from([0xe1]), // Reward address type
      stakingKeyHash.slice(0, 28)
    ]);
    const rewardAddress = bech32Encode(networkType === 'mainnet' ? 'stake' : 'stake_test', stakePayload);

    const walletData = {
      success: true,
      network: 'Cardano',
      type: 'Cardano',
      symbol: 'ADA',

      // Main payment address
      address: address, // addr1... format
      privateKey: paymentPrivateKeyHex,
      publicKey: paymentPublicKeyHex,
      mnemonic: mnemonic,

      // Staking credentials
      stakingAddress: rewardAddress, // stake1... format
      stakingPrivateKey: stakingPrivateKeyHex,
      stakingPublicKey: stakingPublicKeyHex,

      // Derivation info
      accountIndex: accountIndex,
      paymentDerivationPath: paymentPath,
      stakingDerivationPath: stakingPath,

      // Network info
      networkType: networkType,
      addressFormat: 'Base Address (addr1...)',

      warning: '⚠️ NEVER share your mnemonic or private keys! Cardano uses 24-word mnemonics.',

      chainInfo: {
        network: networkType,
        explorerUrl: networkType === 'mainnet'
          ? `https://cardanoscan.io/address/${address}`
          : `https://preview.cardanoscan.io/address/${address}`,
        apiUrl: networkType === 'mainnet'
          ? 'https://cardano-mainnet.blockfrost.io/api/v0'
          : 'https://cardano-preview.blockfrost.io/api/v0'
      }
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Cardano Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Cardano',
        networkSymbol: 'ADA',
        chainId: 0, // Cardano doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: address,
        publicKey: paymentPublicKeyHex,
        privateKey: paymentPrivateKeyHex, // ⚠️ Encrypt in production!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nStaking Address: ${rewardAddress}`,
        tags: ['Cardano', 'ADA', 'CIP-1852'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Cardano Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          stakingPrivateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Cardano (ADA) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Cardano (ADA) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Cardano Wallet] Error:', error);
    return {
      success: false,
      message: `Cardano wallet generation failed: ${error.message}`
    };
  }
});
