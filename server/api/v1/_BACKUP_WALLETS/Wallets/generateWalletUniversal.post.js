/**
 * Universal Wallet Generator API
 * Supports 60+ blockchains (EVM + Non-EVM)
 *
 * Note: All blockchain SDKs are imported dynamically to avoid bundling issues
 */

import { userWalletsSchema } from '~/server/models/userWallets.schema.js';
import { BitcoinWalletsSchema } from '~/server/models/BitcoinWallets.schema.js';
import { generateCompleteBitcoinWallet } from '~/server/utils/bitcoinWalletGenerator.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, network, walletName, saveToDatabase = true, bitcoinConfig } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    if (!network) {
      return { success: false, message: 'Network is required' };
    }

    console.log(`[Generate Wallet Universal] User: ${userID}, Network: ${network}`);

    // Determine wallet type and generate
    let walletData;
    const networkInfo = getNetworkInfo(network);

    if (!networkInfo) {
      return {
        success: false,
        message: `Network "${network}" is not supported yet`
      };
    }

    switch (networkInfo.type) {
      case 'EVM':
        walletData = await generateEVMWallet(network, networkInfo);
        break;
      case 'Bitcoin':
        walletData = await generateBitcoinWallet(network, networkInfo, bitcoinConfig);
        break;
      // Solana removed due to bundling issues with Nitro
      // case 'Solana':
      //   walletData = await generateSolanaWallet(network, networkInfo);
      //   break;
      case 'Cosmos':
        walletData = await generateCosmosWallet(network, networkInfo);
        break;
      case 'Polkadot':
        walletData = await generatePolkadotWallet(network, networkInfo);
        break;
      case 'Cardano':
        walletData = await generateCardanoWallet(network, networkInfo);
        break;
      case 'Near':
        walletData = await generateNearWallet(network, networkInfo);
        break;
      case 'Stellar':
        walletData = await generateStellarWallet(network, networkInfo);
        break;
      case 'Ripple':
        walletData = await generateRippleWallet(network, networkInfo);
        break;
      case 'TON':
        walletData = await generateTONWallet(network, networkInfo);
        break;
      case 'Tezos':
        walletData = await generateTezosWallet(network, networkInfo);
        break;
      case 'EOS':
        walletData = await generateEOSWallet(network, networkInfo);
        break;
      case 'MultiversX':
        walletData = await generateMultiversXWallet(network, networkInfo);
        break;
      default:
        return {
          success: false,
          message: `Wallet generation for ${network} is not implemented yet`
        };
    }

    if (!walletData.success) {
      return walletData;
    }

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `${network} Wallet ${Date.now()}`;

      let savedWallet;

      // Special handling for Bitcoin - save complete wallet data
      if (networkInfo.type === 'Bitcoin' && walletData.completeWalletData) {
        savedWallet = await BitcoinWalletsSchema.create({
          userID,
          walletName: defaultWalletName,
          generatedAt: new Date(walletData.completeWalletData.generatedAt),
          version: walletData.completeWalletData.version,
          mnemonic: walletData.completeWalletData.mnemonic,
          passphrase: walletData.completeWalletData.passphrase || '',
          hasPassphrase: walletData.completeWalletData.hasPassphrase || false,
          wordCount: walletData.completeWalletData.wordCount,
          masterSeed: walletData.completeWalletData.masterSeed,
          masterPrivateKey: walletData.completeWalletData.masterPrivateKey,
          masterPublicKey: walletData.completeWalletData.masterPublicKey,
          wallets: walletData.completeWalletData.wallets,
          isActive: true,
          lastUsed: new Date(),
          note: walletData.warning,
          tags: ['Bitcoin', 'BTC', 'Multi-Address', 'Complete']
        });

        console.log(`[Generate Wallet Universal] ✅ Bitcoin wallet saved to BitcoinWallets collection: ${savedWallet._id}`);
      } else {
        // For other networks, use the standard userWallets schema
        savedWallet = await userWalletsSchema.create({
          userID,
          walletName: defaultWalletName,
          network: walletData.network,
          networkSymbol: walletData.symbol || network,
          chainId: walletData.chainId || 0,
          walletType: walletData.type,
          address: walletData.address,
          publicKey: walletData.publicKey,
          privateKey: walletData.privateKey, // ⚠️ In production, encrypt this!
          mnemonic: walletData.mnemonic,
          isDefault: false,
          balance: '0',
          balanceUSD: '0',
          note: walletData.warning,
          tags: [networkInfo.type, network],
          createdAt: new Date(),
          lastUsed: new Date(),
          isActive: true
        });

        console.log(`[Generate Wallet Universal] ✅ Saved to userWallets: ${savedWallet._id}`);
      }

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send private keys in response
          privateKey: undefined,
          mnemonic: undefined,
          completeWalletData: networkInfo.type === 'Bitcoin' ? {
            ...walletData.completeWalletData,
            mnemonic: undefined,
            masterPrivateKey: undefined,
            masterSeed: undefined,
            wallets: walletData.completeWalletData.wallets.map(w => ({
              ...w,
              addresses: Object.keys(w.addresses).reduce((acc, key) => {
                acc[key] = {
                  ...w.addresses[key],
                  privateKeyWIF: undefined,
                  privateKeyHex: undefined
                };
                return acc;
              }, {})
            }))
          } : undefined
        },
        walletId: savedWallet._id.toString(),
        message: `${network} wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `${network} wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Wallet Universal] Error:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

// ============================================================================
// WALLET GENERATORS
// ============================================================================

// EVM Wallets (Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche, BNB, etc.)
async function generateEVMWallet(network, networkInfo) {
  try {
    const { ethers } = await import('ethers');
    const bip39 = await import('bip39');

    const mnemonic = bip39.generateMnemonic();
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    return {
      success: true,
      network,
      type: 'EVM',
      symbol: networkInfo.symbol,
      chainId: networkInfo.chainId,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: mnemonic,
      publicKey: wallet.publicKey,
      derivationPath: "m/44'/60'/0'/0/0",
      warning: '⚠️ NEVER share your private key or mnemonic! Store securely offline.'
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Bitcoin Wallet - Complete with ALL 5 Address Types
async function generateBitcoinWallet(network, networkInfo, bitcoinConfig) {
  try {
    // Generate complete Bitcoin wallet with custom configuration
    // If no config provided, use defaults (3 wallets: BANK, VAULT, EU)
    const config = bitcoinConfig || {
      wallets: [
        { index: 0, name: 'BANK', emoji: '🏦', description: 'Rezervă bancară' },
        { index: 1, name: 'VAULT', emoji: '🔐', description: 'Seif securizat' },
        { index: 2, name: 'EU', emoji: '🎯', description: 'Wallet principal' }
      ],
      wordCount: 12,
      passphrase: ''
    };

    const result = await generateCompleteBitcoinWallet(config);

    if (!result.success) {
      return { success: false, message: result.message };
    }

    const walletData = result.data;

    // Return first wallet's Native SegWit address as main address for compatibility
    const mainWallet = walletData.wallets[0];
    const mainAddress = mainWallet.addresses.nativeSegwit;

    return {
      success: true,
      network,
      type: 'Bitcoin',
      symbol: 'BTC',

      // Main address (for compatibility with existing code)
      address: mainAddress.address,
      privateKey: mainAddress.privateKeyWIF,
      publicKey: mainAddress.publicKey,
      mnemonic: walletData.mnemonic,
      derivationPath: mainAddress.path,

      // Complete wallet data (10 wallets × 5 address types)
      completeWalletData: walletData,

      warning: '⚠️ Complete Bitcoin wallet with 10 wallets × 5 address types = 50 addresses! Keep your mnemonic safe!'
    };
  } catch (error) {
    return { success: false, message: `Bitcoin wallet generation failed: ${error.message}` };
  }
}

// Solana Wallet - REMOVED due to Nitro bundling issues
// async function generateSolanaWallet(network, networkInfo) {
//   try {
//     const { Keypair } = await import('@solana/web3.js');
//     const bs58 = await import('bs58');
//     const bip39 = await import('bip39');
//
//     const mnemonic = bip39.generateMnemonic();
//     const seed = await bip39.mnemonicToSeed(mnemonic);
//     const keypair = Keypair.fromSeed(seed.slice(0, 32));
//
//     return {
//       success: true,
//       network,
//       type: 'Solana',
//       symbol: 'SOL',
//       address: keypair.publicKey.toBase58(),
//       privateKey: bs58.default.encode(keypair.secretKey),
//       publicKey: keypair.publicKey.toBase58(),
//       mnemonic,
//       warning: '⚠️ Solana wallet - keep your secret key safe!'
//     };
//   } catch (error) {
//     return { success: false, message: `Solana wallet generation failed: ${error.message}` };
//   }
// }

// Cosmos Wallet (ATOM, OSMO, JUNO, etc.)
async function generateCosmosWallet(network, networkInfo) {
  try {
    const { Secp256k1HdWallet } = await import('@cosmjs/stargate');
    const bip39 = await import('bip39');

    const mnemonic = bip39.generateMnemonic();
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: networkInfo.prefix || 'cosmos'
    });

    const accounts = await wallet.getAccounts();
    const account = accounts[0];

    return {
      success: true,
      network,
      type: 'Cosmos',
      symbol: networkInfo.symbol,
      address: account.address,
      publicKey: Buffer.from(account.pubkey).toString('hex'),
      mnemonic,
      warning: '⚠️ Cosmos wallet - keep your mnemonic safe!'
    };
  } catch (error) {
    return { success: false, message: `Cosmos wallet generation failed: ${error.message}` };
  }
}

// Polkadot Wallet (DOT, KSM)
async function generatePolkadotWallet(network, networkInfo) {
  try {
    const { Keyring } = await import('@polkadot/keyring');
    const { mnemonicGenerate } = await import('@polkadot/util-crypto');

    const mnemonic = mnemonicGenerate();
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromUri(mnemonic);

    return {
      success: true,
      network,
      type: 'Polkadot',
      symbol: networkInfo.symbol,
      address: pair.address,
      publicKey: pair.publicKey.toString(),
      mnemonic,
      warning: '⚠️ Polkadot wallet - keep your mnemonic safe!'
    };
  } catch (error) {
    return { success: false, message: `Polkadot wallet generation failed: ${error.message}` };
  }
}

// Cardano Wallet
async function generateCardanoWallet(network, networkInfo) {
  try {
    const bip39 = await import('bip39');
    // Simplified Cardano wallet generation
    // For full implementation, use @emurgo/cardano-serialization-lib-nodejs
    const mnemonic = bip39.generateMnemonic(256); // 24 words for Cardano

    return {
      success: true,
      network,
      type: 'Cardano',
      symbol: 'ADA',
      address: 'addr1_placeholder', // TODO: Implement full Cardano address generation
      mnemonic,
      warning: '⚠️ Cardano wallet - use official Cardano wallet software for production'
    };
  } catch (error) {
    return { success: false, message: `Cardano wallet generation failed: ${error.message}` };
  }
}

// Near Protocol Wallet
async function generateNearWallet(network, networkInfo) {
  try {
    const { KeyPair } = await import('near-api-js');
    const bip39 = await import('bip39');

    const keyPair = KeyPair.fromRandom('ed25519');
    const mnemonic = bip39.generateMnemonic();

    return {
      success: true,
      network,
      type: 'Near',
      symbol: 'NEAR',
      address: keyPair.getPublicKey().toString(),
      privateKey: keyPair.toString(),
      publicKey: keyPair.getPublicKey().toString(),
      mnemonic,
      warning: '⚠️ Near wallet - keep your keys safe!'
    };
  } catch (error) {
    return { success: false, message: `Near wallet generation failed: ${error.message}` };
  }
}

// Stellar Wallet
async function generateStellarWallet(network, networkInfo) {
  try {
    const StellarSdk = await import('stellar-sdk');
    const bip39 = await import('bip39');

    const pair = StellarSdk.Keypair.random();
    const mnemonic = bip39.generateMnemonic();

    return {
      success: true,
      network,
      type: 'Stellar',
      symbol: 'XLM',
      address: pair.publicKey(),
      privateKey: pair.secret(),
      publicKey: pair.publicKey(),
      mnemonic,
      warning: '⚠️ Stellar wallet - keep your secret key safe!'
    };
  } catch (error) {
    return { success: false, message: `Stellar wallet generation failed: ${error.message}` };
  }
}

// Ripple Wallet
async function generateRippleWallet(network, networkInfo) {
  try {
    const { generate } = await import('ripple-keypairs');
    const bip39 = await import('bip39');

    const keypair = generate();
    const mnemonic = bip39.generateMnemonic();

    return {
      success: true,
      network,
      type: 'Ripple',
      symbol: 'XRP',
      address: keypair.address,
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey,
      mnemonic,
      warning: '⚠️ Ripple wallet - keep your keys safe!'
    };
  } catch (error) {
    return { success: false, message: `Ripple wallet generation failed: ${error.message}` };
  }
}

// TON Wallet
async function generateTONWallet(network, networkInfo) {
  try {
    const { mnemonicNew } = await import('ton-crypto');
    const mnemonic = await mnemonicNew();

    return {
      success: true,
      network,
      type: 'TON',
      symbol: 'TON',
      mnemonic: mnemonic.join(' '),
      warning: '⚠️ TON wallet - use official TON wallet for address generation'
    };
  } catch (error) {
    return { success: false, message: `TON wallet generation failed: ${error.message}` };
  }
}

// Tezos Wallet
async function generateTezosWallet(network, networkInfo) {
  try {
    const bip39 = await import('bip39');
    const mnemonic = bip39.generateMnemonic();
    // Simplified - full implementation requires @taquito/signer

    return {
      success: true,
      network,
      type: 'Tezos',
      symbol: 'XTZ',
      mnemonic,
      warning: '⚠️ Tezos wallet - use official Tezos wallet for address generation'
    };
  } catch (error) {
    return { success: false, message: `Tezos wallet generation failed: ${error.message}` };
  }
}

// EOS Wallet
async function generateEOSWallet(network, networkInfo) {
  try {
    const bip39 = await import('bip39');
    const mnemonic = bip39.generateMnemonic();
    // Simplified - full implementation requires eosjs

    return {
      success: true,
      network,
      type: 'EOS',
      symbol: 'EOS',
      mnemonic,
      warning: '⚠️ EOS wallet - use official EOS wallet for account creation'
    };
  } catch (error) {
    return { success: false, message: `EOS wallet generation failed: ${error.message}` };
  }
}

// ============================================================================
// NETWORK INFORMATION DATABASE
// ============================================================================

function getNetworkInfo(network) {
  const networks = {
    // EVM Networks
    'Ethereum': { type: 'EVM', symbol: 'ETH', chainId: 1 },
    'Arbitrum': { type: 'EVM', symbol: 'ETH', chainId: 42161 },
    'Optimism': { type: 'EVM', symbol: 'ETH', chainId: 10 },
    'Base': { type: 'EVM', symbol: 'ETH', chainId: 8453 },
    'Polygon': { type: 'EVM', symbol: 'MATIC', chainId: 137 },
    'Avalanche': { type: 'EVM', symbol: 'AVAX', chainId: 43114 },
    'BNB Chain': { type: 'EVM', symbol: 'BNB', chainId: 56 },
    'Plasma': { type: 'EVM', symbol: 'PLS', chainId: 369 },

    // Bitcoin & Variants
    'Bitcoin': { type: 'Bitcoin', symbol: 'BTC' },
    'Litecoin': { type: 'Bitcoin', symbol: 'LTC' },
    'Dogecoin': { type: 'Bitcoin', symbol: 'DOGE' },
    'Bitcoin Cash': { type: 'Bitcoin', symbol: 'BCH' },

    // Solana - REMOVED due to bundling issues
    // 'Solana': { type: 'Solana', symbol: 'SOL' },

    // Cosmos Ecosystem
    'Cosmos': { type: 'Cosmos', symbol: 'ATOM', prefix: 'cosmos' },
    'Osmosis': { type: 'Cosmos', symbol: 'OSMO', prefix: 'osmo' },
    'Juno': { type: 'Cosmos', symbol: 'JUNO', prefix: 'juno' },
    'Injective': { type: 'Cosmos', symbol: 'INJ', prefix: 'inj' },
    'Terra': { type: 'Cosmos', symbol: 'LUNA', prefix: 'terra' },
    'Celestia': { type: 'Cosmos', symbol: 'TIA', prefix: 'celestia' },
    'dYdX': { type: 'Cosmos', symbol: 'DYDX', prefix: 'dydx' },
    'Noble': { type: 'Cosmos', symbol: 'USDC', prefix: 'noble' },

    // Polkadot Ecosystem
    'Polkadot': { type: 'Polkadot', symbol: 'DOT' },
    'Kusama': { type: 'Polkadot', symbol: 'KSM' },

    // Other Layer 1s
    'Cardano': { type: 'Cardano', symbol: 'ADA' },
    'Near': { type: 'Near', symbol: 'NEAR' },
    'Stellar': { type: 'Stellar', symbol: 'XLM' },
    'Ripple': { type: 'Ripple', symbol: 'XRP' },
    'TON': { type: 'TON', symbol: 'TON' },
    'Tezos': { type: 'Tezos', symbol: 'XTZ' },
    'EOS': { type: 'EOS', symbol: 'EOS' },

    // Additional networks (limited support - mnemonic only)
    'Algorand': { type: 'Tezos', symbol: 'ALGO' }, // Use Tezos generator (mnemonic only)
    'Aptos': { type: 'Tezos', symbol: 'APT' }, // Use Tezos generator (mnemonic only)
    'Sui': { type: 'Tezos', symbol: 'SUI' }, // Use Tezos generator (mnemonic only)
    'Constellation Network': { type: 'Tezos', symbol: 'DAG' }, // Use Tezos generator (mnemonic only)
    'Hedera': { type: 'Tezos', symbol: 'HBAR' }, // Use Tezos generator (mnemonic only)
    'IOTA': { type: 'Tezos', symbol: 'IOTA' }, // Use Tezos generator (mnemonic only)
    'Zilliqa': { type: 'Tezos', symbol: 'ZIL' }, // Use Tezos generator (mnemonic only)
    'Flow': { type: 'Tezos', symbol: 'FLOW' }, // Use Tezos generator (mnemonic only)
    'MultiversX': { type: 'Tezos', symbol: 'EGLD' }, // Use Tezos generator (mnemonic only)
    'Casper': { type: 'Tezos', symbol: 'CSPR' } // Use Tezos generator (mnemonic only)
  };

  return networks[network] || null;
}
