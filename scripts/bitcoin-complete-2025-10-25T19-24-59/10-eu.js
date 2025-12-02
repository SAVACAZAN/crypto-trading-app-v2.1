/**
 * 🎯 EU - Complete Bitcoin Wallet
 * Wallet principal
 * Generated: 2025-10-25T19:24:59.025Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "EU",
  emoji: "🎯",
  description: "Wallet principal",
  index: 9,

  // Mnemonic (shared across all wallets)
  mnemonic: "seminar float bitter normal come oppose syrup planet rule dad dilemma push",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "TestSecret123",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/9'/0/0",
      address: "18ZMf7KZVKPiN8oMUBq7nW6G4KGKrEuSdf",
      privateKeyWIF: "L3PWLhCSALL2cFNecL9eL4fgJoZsdcMEXudbJprXn4KSz9Z5u5Ab",
      privateKeyHex: "184,16,78,242,216,180,157,217,186,120,253,135,120,9,138,125,201,114,242,232,116,226,237,194,55,183,196,44,180,188,20,232",
      publicKey: "3,113,139,162,92,109,176,119,186,171,252,62,184,209,22,59,21,84,119,115,118,241,52,155,177,52,153,53,45,231,47,166,197"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/9'/0/0",
      address: "3PgQEp1b6CaX4TY9uUM2WxM5DG1JWiKKtp",
      privateKeyWIF: "L4qLj51t6h6ZnCRXMmJqV2AcyUHhn8TM5SNUA4NrY1wYSRmS5ReQ",
      privateKeyHex: "227,48,243,62,146,28,182,40,93,76,207,121,85,145,236,85,14,231,245,74,5,88,208,6,10,18,203,210,12,254,230,27",
      publicKey: "3,104,251,200,151,161,96,145,170,223,25,231,23,157,178,63,183,112,69,32,166,77,5,124,252,229,64,192,245,144,156,97,7"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/9'/0/0",
      address: "3FtXr75Uu28BwkBshN4ixdULt2XVKXBU5v",
      privateKeyWIF: "L4qLj51t6h6ZnCRXMmJqV2AcyUHhn8TM5SNUA4NrY1wYSRmS5ReQ",
      privateKeyHex: "227,48,243,62,146,28,182,40,93,76,207,121,85,145,236,85,14,231,245,74,5,88,208,6,10,18,203,210,12,254,230,27",
      publicKey: "3,104,251,200,151,161,96,145,170,223,25,231,23,157,178,63,183,112,69,32,166,77,5,124,252,229,64,192,245,144,156,97,7"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/9'/0/0",
      address: "bc1qrwaprqvjukqmrjh0qnhl0daq9tp8588vmlc0uv",
      privateKeyWIF: "L4Vcy3RBBYQMYCuBnDoKd92eEief1bJiw1BQR7ULE1ZmB9p1jwgF",
      privateKeyHex: "217,11,231,188,243,46,46,139,77,4,95,16,165,192,202,165,203,150,246,193,36,206,120,163,38,194,26,24,165,59,51,80",
      publicKey: "2,190,5,237,40,190,22,189,116,84,175,213,122,28,69,81,10,89,132,31,63,78,8,90,98,178,255,244,235,46,35,129,154"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/9'/0/0",
      address: "bc1p5l8tm9w44mru7drfu9vtwe6pujtue02m2p3d5c4p022ek54dv2ms3955lf",
      privateKeyWIF: "KxicymjDTHGJXHeaLN4YswMbUh6W5gq3GKLyjDp4LsdjEr4wVPj4",
      privateKeyHex: "44,181,189,234,52,1,196,8,215,31,177,6,228,79,185,218,245,209,248,98,149,57,225,109,51,91,133,157,151,234,95,208",
      publicKey: "2,50,45,217,60,176,117,101,54,80,213,57,193,91,90,122,148,28,206,249,209,8,50,236,30,96,179,130,24,248,187,64,229",
      internalPubkey: "50,45,217,60,176,117,101,54,80,213,57,193,91,90,122,148,28,206,249,209,8,50,236,30,96,179,130,24,248,187,64,229"
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
