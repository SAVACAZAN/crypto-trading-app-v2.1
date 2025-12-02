/**
 * 👩 INGRID - Complete Bitcoin Wallet
 * Wallet personal Ingrid
 * Generated: 2025-10-25T19:25:20.486Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "INGRID",
  emoji: "👩",
  description: "Wallet personal Ingrid",
  index: 3,

  // Mnemonic (shared across all wallets)
  mnemonic: "feed other poverty spin where rib almost load rough lab sick hurdle",

  // BIP39 Passphrase
  hasPassphrase: false,
  passphrase: "",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/3'/0/0",
      address: "1GJj1hQo7ZwQnsrTwEJpmTYSjTTjjeShgf",
      privateKeyWIF: "L4HgGYLUSvDyhkBF5oxXtPykpLf7fyd6WHUX82r3reW6Kn8JbQV7",
      privateKeyHex: "210,231,12,139,16,77,100,7,201,129,206,157,191,81,92,174,24,175,41,109,4,23,178,127,18,127,21,181,166,231,28,65",
      publicKey: "2,153,252,60,1,229,182,80,219,75,116,142,85,95,109,227,151,101,22,28,93,28,34,187,28,47,2,202,115,163,168,217,251"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/3'/0/0",
      address: "3JqmEgFK7BqdLbseYSGf65kTbadAzX88WR",
      privateKeyWIF: "L2qniBuQLULgbDyU4AeNW2H79U8eqiHuAB11MPr7AD7vhAmBofVa",
      privateKeyHex: "167,191,52,109,168,151,70,194,78,45,103,180,158,160,141,242,130,27,59,95,229,81,50,194,244,186,12,225,165,53,203,80",
      publicKey: "3,150,1,49,18,209,184,69,206,57,203,74,114,34,212,112,9,134,103,76,233,48,27,126,225,66,134,251,185,243,4,159,129"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/3'/0/0",
      address: "3LXqmV6XZYkos9dv9ugC1qgRKW445pLKd8",
      privateKeyWIF: "L2qniBuQLULgbDyU4AeNW2H79U8eqiHuAB11MPr7AD7vhAmBofVa",
      privateKeyHex: "167,191,52,109,168,151,70,194,78,45,103,180,158,160,141,242,130,27,59,95,229,81,50,194,244,186,12,225,165,53,203,80",
      publicKey: "3,150,1,49,18,209,184,69,206,57,203,74,114,34,212,112,9,134,103,76,233,48,27,126,225,66,134,251,185,243,4,159,129"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/3'/0/0",
      address: "bc1qz50n4u3wr5dqlm8590k7d5r6j80ry29gz3tcqe",
      privateKeyWIF: "Kyqvbz3VZH2tiB7YAxcbhLAR2WgGRRqWLcHu8LUsVYTG7AzZAy5R",
      privateKeyHex: "78,78,1,156,129,165,105,51,208,18,46,88,149,232,143,78,129,27,217,195,78,141,243,152,196,133,97,32,248,143,16,167",
      publicKey: "3,75,184,52,131,185,58,165,35,69,135,163,233,225,142,16,46,33,17,101,43,127,151,84,55,221,139,133,237,190,156,110,111"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/3'/0/0",
      address: "bc1p567m0nurr5turvtwtg4a8p36l40w94sajn4fueeah34jv0cdg22s787v0g",
      privateKeyWIF: "Kz3Ay9Mppo3aFKusWfcB1WzqybJbjbtqGSsr6inqamfWt8579N5p",
      privateKeyHex: "84,23,71,204,150,83,194,0,5,32,234,193,250,229,54,97,247,42,28,199,251,35,224,93,142,118,35,135,48,3,170,11",
      publicKey: "3,254,54,192,90,112,92,44,5,113,62,255,232,196,200,80,126,36,74,66,100,191,189,49,220,44,167,201,8,27,120,106,214",
      internalPubkey: "254,54,192,90,112,92,44,5,113,62,255,232,196,200,80,126,36,74,66,100,191,189,49,220,44,167,201,8,27,120,106,214"
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
