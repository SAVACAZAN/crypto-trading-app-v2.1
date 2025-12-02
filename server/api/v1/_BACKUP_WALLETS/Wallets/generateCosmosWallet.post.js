/**
 * Cosmos (ATOM) Wallet Generator
 * Uses @cosmjs/stargate for proper Cosmos SDK wallet generation
 * Supports all Cosmos-based chains (ATOM, OSMO, JUNO, INJ, etc.)
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
      accountIndex = 0,
      addressPrefix = 'cosmos', // cosmos, osmo, juno, inj, celestia, etc.
      chainName = 'Cosmos Hub' // For display purposes
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Cosmos Wallet] User: ${userID}, Prefix: ${addressPrefix}, Chain: ${chainName}`);

    let mnemonic;

    // Generate or use custom mnemonic
    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Cosmos'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 24-word mnemonic (Cosmos standard)
      mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words
    }

    // Cosmos derivation path: m/44'/118'/{account}'/0/0 (ATOM)
    // Different coins use different coin types:
    // ATOM: 118, OSMO: 118, JUNO: 118, INJ: 60 (Ethereum-compatible), etc.
    const coinType = getCoinType(addressPrefix);
    const hdPath = stringToPath(`m/44'/${coinType}'/${accountIndex}'/0/0`);

    // Create wallet with specific prefix
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: addressPrefix,
      hdPaths: [hdPath]
    });

    // Get accounts
    const accounts = await wallet.getAccounts();
    const account = accounts[0];

    const address = account.address;
    const publicKeyBytes = account.pubkey;
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    // Extract private key from wallet
    // Cosmos wallets store keys internally, we need to derive it from mnemonic
    const { BIP32Factory } = await import('bip32');
    const ecc = await import('tiny-secp256k1');

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc.default || ecc);
    const master = bip32.fromSeed(seed);
    const child = master.derivePath(`m/44'/${coinType}'/${accountIndex}'/0/0`);
    const privateKeyHex = child.privateKey ? child.privateKey.toString('hex') : '';

    // Get symbol based on prefix
    const symbol = getSymbolFromPrefix(addressPrefix);

    const walletData = {
      success: true,
      network: chainName,
      type: 'Cosmos',
      symbol: symbol,

      // Wallet details
      address: address, // cosmos1... or osmo1... or juno1... format
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      // Derivation info
      accountIndex: accountIndex,
      derivationPath: `m/44'/${coinType}'/${accountIndex}'/0/0`,
      addressPrefix: addressPrefix,
      coinType: coinType,

      // Additional info
      addressFormat: `bech32 (${addressPrefix}1...)`,

      warning: '⚠️ NEVER share your mnemonic! Cosmos uses 24-word mnemonics for all Cosmos SDK chains.',

      // Chain info
      chainInfo: getChainInfo(addressPrefix, address)
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `${chainName} Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: chainName,
        networkSymbol: symbol,
        chainId: 0, // Cosmos uses string chain IDs (cosmoshub-4, osmosis-1, etc.)
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex, // Now we extract the private key from mnemonic
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nPrefix: ${addressPrefix}`,
        tags: ['Cosmos', symbol, 'Cosmos SDK', addressPrefix],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Cosmos Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `${chainName} (${symbol}) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `${chainName} (${symbol}) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Cosmos Wallet] Error:', error);
    return {
      success: false,
      message: `Cosmos wallet generation failed: ${error.message}`
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCoinType(prefix) {
  const coinTypes = {
    'cosmos': 118,  // Cosmos Hub (ATOM)
    'osmo': 118,    // Osmosis
    'juno': 118,    // Juno
    'stars': 118,   // Stargaze
    'akash': 118,   // Akash
    'regen': 118,   // Regen
    'sent': 118,    // Sentinel
    'inj': 60,      // Injective (Ethereum-compatible)
    'evmos': 60,    // Evmos (Ethereum-compatible)
    'celestia': 118,// Celestia
    'dydx': 118,    // dYdX v4
    'noble': 118,   // Noble
    'terra': 330,   // Terra
    'secret': 529,  // Secret Network
    'kava': 459,    // Kava
    'band': 494     // Band Protocol
  };

  return coinTypes[prefix] || 118; // Default to 118 (Cosmos standard)
}

function getSymbolFromPrefix(prefix) {
  const symbols = {
    'cosmos': 'ATOM',
    'osmo': 'OSMO',
    'juno': 'JUNO',
    'stars': 'STARS',
    'akash': 'AKT',
    'regen': 'REGEN',
    'sent': 'DVPN',
    'inj': 'INJ',
    'evmos': 'EVMOS',
    'celestia': 'TIA',
    'dydx': 'DYDX',
    'noble': 'USDC',
    'terra': 'LUNA',
    'secret': 'SCRT',
    'kava': 'KAVA',
    'band': 'BAND'
  };

  return symbols[prefix] || prefix.toUpperCase();
}

function getChainInfo(prefix, address) {
  const chains = {
    'cosmos': {
      chainId: 'cosmoshub-4',
      rpcUrl: 'https://rpc.cosmos.network',
      restUrl: 'https://rest.cosmos.network',
      explorerUrl: `https://www.mintscan.io/cosmos/account/${address}`
    },
    'osmo': {
      chainId: 'osmosis-1',
      rpcUrl: 'https://rpc.osmosis.zone',
      restUrl: 'https://rest.osmosis.zone',
      explorerUrl: `https://www.mintscan.io/osmosis/account/${address}`
    },
    'juno': {
      chainId: 'juno-1',
      rpcUrl: 'https://rpc.juno.strange.love',
      restUrl: 'https://rest.juno.strange.love',
      explorerUrl: `https://www.mintscan.io/juno/account/${address}`
    },
    'inj': {
      chainId: 'injective-1',
      rpcUrl: 'https://sentry.tm.injective.network:443',
      restUrl: 'https://sentry.lcd.injective.network:443',
      explorerUrl: `https://explorer.injective.network/account/${address}`
    },
    'celestia': {
      chainId: 'celestia',
      rpcUrl: 'https://rpc.celestia.pops.one',
      restUrl: 'https://api.celestia.pops.one',
      explorerUrl: `https://www.mintscan.io/celestia/account/${address}`
    },
    'noble': {
      chainId: 'noble-1',
      rpcUrl: 'https://rpc.noble.strange.love',
      restUrl: 'https://api.noble.strange.love',
      explorerUrl: `https://www.mintscan.io/noble/account/${address}`
    }
  };

  return chains[prefix] || {
    chainId: `${prefix}-1`,
    rpcUrl: '',
    restUrl: '',
    explorerUrl: `https://www.mintscan.io/${prefix}/account/${address}`
  };
}
