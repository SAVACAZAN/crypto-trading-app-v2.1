/**
 * 👩 INGRID - Complete Bitcoin Wallet
 * Wallet personal Ingrid
 * Generated: 2025-10-25T18:17:39.247Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "INGRID",
  emoji: "👩",
  description: "Wallet personal Ingrid",
  index: 3,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/3'/0/0",
      address: "1C7pWcwwpkHhoH3JjZVESGoCZA4FshhLUA",
      privateKeyWIF: "L35MsYZGQVkKVYfRTfiw7CNv4URi6gt9Y7xTrzQH7YaeMWnU5BJo",
      privateKeyHex: "174,186,141,4,171,11,48,182,208,191,213,135,102,179,29,240,134,112,52,166,39,122,41,198,23,202,60,211,67,97,97,114",
      publicKey: "2,18,51,118,22,48,193,0,190,129,88,96,57,75,166,212,181,215,164,157,247,62,212,170,175,165,134,135,135,153,204,183,82"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/3'/0/0",
      address: "38izD3Ce61BVDViUKVvNRZDLyX4EUoC7c2",
      privateKeyWIF: "KyuGRwiWrRpdqjoxN4S2eVzs32gMDDDuqzeJPLJGPJD3VDeykeej",
      privateKeyHex: "80,6,29,45,27,160,17,18,1,113,198,4,6,190,58,30,248,162,213,58,126,48,35,13,244,216,30,199,255,203,214,96",
      publicKey: "2,122,44,229,250,166,201,70,121,10,37,133,146,161,154,81,153,247,19,126,155,57,169,173,40,204,30,36,165,19,246,141,177"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/3'/0/0",
      address: "3QfubGF1bABwsiuEVUtD6wJLByq9TnjoCR",
      privateKeyWIF: "KyuGRwiWrRpdqjoxN4S2eVzs32gMDDDuqzeJPLJGPJD3VDeykeej",
      privateKeyHex: "80,6,29,45,27,160,17,18,1,113,198,4,6,190,58,30,248,162,213,58,126,48,35,13,244,216,30,199,255,203,214,96",
      publicKey: "2,122,44,229,250,166,201,70,121,10,37,133,146,161,154,81,153,247,19,126,155,57,169,173,40,204,30,36,165,19,246,141,177"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/3'/0/0",
      address: "bc1qc5dfxc2geynrg33rt20q723rxp3nwdfgndjj63",
      privateKeyWIF: "L1xEZjRH4BvRRN6THTmy9eVf5HGsBBSLfJDY35262vqQag7YDyiW",
      privateKeyHex: "141,57,182,132,80,181,34,49,218,155,47,150,221,113,169,165,117,108,232,131,185,245,157,220,187,4,166,189,102,136,103,194",
      publicKey: "2,253,108,102,35,57,177,123,60,16,205,34,171,124,170,184,180,216,123,14,113,198,236,237,186,133,60,170,163,75,166,158,164"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/3'/0/0",
      address: "bc1p39zkjfs3ralndn4js4j2lv5gx0rs6we6vazqaxzazyf4up3rxduqzanqvw",
      privateKeyWIF: "L297tvxhTwTMZRn4wmRSLcbLHgrpNJhCwAhSv4ubM9PvCcWLZiZq",
      privateKeyHex: "146,211,58,45,242,56,231,35,54,193,45,191,142,10,254,25,180,146,204,138,91,86,29,243,94,68,84,119,38,16,169,80",
      publicKey: "3,12,83,19,124,108,227,6,25,159,136,62,119,93,136,226,139,250,167,125,251,237,212,78,119,208,9,246,217,179,225,157,193",
      internalPubkey: "12,83,19,124,108,227,6,25,159,136,62,119,93,136,226,139,250,167,125,251,237,212,78,119,208,9,246,217,179,225,157,193"
    }
  },

  // Helper methods
  getAddress(type = 'nativeSegwit') {
    return this.addresses[type]?.address;
  },

  getAllAddresses() {
    return Object.keys(this.addresses).map(type => ({
      type,
      address: this.addresses[type].address
    }));
  },

  getPrivateKey(type = 'nativeSegwit', format = 'wif') {
    const addr = this.addresses[type];
    if (!addr) return null;
    return format === 'hex' ? addr.privateKeyHex : addr.privateKeyWIF;
  },

  getExplorerURL(type = 'nativeSegwit') {
    const address = this.getAddress(type);
    return `https://mempool.space/address/${address}`;
  }
};

// Example usage:
// const wallet = require('./4-ingrid.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
