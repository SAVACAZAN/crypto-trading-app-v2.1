/**
 * 🎯 EU - Complete Bitcoin Wallet
 * Wallet principal
 * Generated: 2025-10-25T18:19:14.491Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "EU",
  emoji: "🎯",
  description: "Wallet principal",
  index: 9,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/9'/0/0",
      address: "1KMaYkiKTznxdZSk43qmyA83JskWbYfJ5Y",
      privateKeyWIF: "L1GtnNms76dtpxEAXAMpe58D1Zu94C4bbwrv1BqG7xeR9mhASiQ2",
      privateKeyHex: "120,252,165,213,147,2,241,234,12,111,240,59,243,202,153,201,105,228,60,225,88,195,189,37,142,37,213,165,218,199,154,156",
      publicKey: "2,165,59,219,67,26,45,237,86,192,103,114,233,81,240,160,111,86,33,79,123,170,236,231,117,71,251,191,201,182,219,60,83"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/9'/0/0",
      address: "3Nokg6YdD2z64JXgNXEMvSaUHBGzyzBu4q",
      privateKeyWIF: "KyNGAE6Edv8XBXvHGQe4hGxSyhjpzqHEMNGQidYjGZGBXZSs3dzv",
      privateKeyHex: "64,18,235,112,181,183,220,49,113,35,120,181,59,132,70,96,172,220,217,137,23,241,16,5,96,253,231,132,117,168,159,220",
      publicKey: "2,242,146,159,159,112,160,60,56,12,108,98,254,161,79,25,164,130,194,116,94,155,79,250,86,89,94,177,245,145,78,192,147"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/9'/0/0",
      address: "32Tii9t7TJosoMU7JqHrDyiFv5gCrYXwxQ",
      privateKeyWIF: "KyNGAE6Edv8XBXvHGQe4hGxSyhjpzqHEMNGQidYjGZGBXZSs3dzv",
      privateKeyHex: "64,18,235,112,181,183,220,49,113,35,120,181,59,132,70,96,172,220,217,137,23,241,16,5,96,253,231,132,117,168,159,220",
      publicKey: "2,242,146,159,159,112,160,60,56,12,108,98,254,161,79,25,164,130,194,116,94,155,79,250,86,89,94,177,245,145,78,192,147"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/9'/0/0",
      address: "bc1qducgyaecekstnyn55k6ncvhers6akfmddnse7j",
      privateKeyWIF: "KwkhmBS9dcFYxAt4PA1nCYnkKX5DVMLY76meDkMmxM67q2DdM3nF",
      privateKeyHex: "15,241,158,230,1,121,113,139,139,197,90,32,142,203,29,100,85,238,33,177,110,7,139,244,232,179,114,133,199,4,0,141",
      publicKey: "3,170,23,233,168,40,171,218,5,45,202,84,6,195,233,93,213,63,163,4,190,60,252,65,246,13,50,71,149,125,9,237,250"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/9'/0/0",
      address: "bc1p5g9px3qs9l28rwzflqzvsvlzpk4hc95vmpd77f4vux0ftvdcqu2qymx3g2",
      privateKeyWIF: "L223u71JXoyKWHEL4JRui3ac5bpxnKt2K2KL796AbZKURq6F5uuG",
      privateKeyHex: "143,48,71,101,37,103,196,43,200,172,184,10,118,147,222,166,109,65,83,197,172,25,69,56,244,120,172,77,183,46,118,161",
      publicKey: "2,52,191,170,60,93,108,75,63,235,139,57,113,27,30,93,57,26,18,31,42,56,208,152,203,72,205,73,223,2,93,55,170",
      internalPubkey: "52,191,170,60,93,108,75,63,235,139,57,113,27,30,93,57,26,18,31,42,56,208,152,203,72,205,73,223,2,93,55,170"
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
// const wallet = require('./10-eu.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
