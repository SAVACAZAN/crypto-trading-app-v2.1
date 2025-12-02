/**
 * 🔐 VAULT - Complete Bitcoin Wallet
 * Seif securizat
 * Generated: 2025-10-25T18:17:39.252Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "VAULT",
  emoji: "🔐",
  description: "Seif securizat",
  index: 8,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/8'/0/0",
      address: "1DwQdACwNo56Aa3r1VNNPafYEMKLDLo2kG",
      privateKeyWIF: "Kwk8q9crHjuj697FCbKUktJnyTU3NNcjENi8WWp5EyNtQTkVs7Fr",
      privateKeyHex: "15,166,216,116,156,103,215,100,182,30,142,36,203,110,7,18,17,180,21,203,79,153,67,154,10,51,56,90,73,65,43,49",
      publicKey: "3,220,223,177,39,145,107,119,211,16,89,95,33,58,71,169,93,180,170,81,150,44,17,182,250,156,225,175,24,28,99,14,53"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/8'/0/0",
      address: "32CzMJJfDJND72j7rvihS7sW6H1utLDwH9",
      privateKeyWIF: "L16iNawWshFcshrm4fq3vMDCBUSYUkza3t1JH9CmXXzWgFZPpwid",
      privateKeyHex: "115,192,12,156,41,15,152,87,104,242,215,179,246,229,20,235,73,172,154,221,240,115,4,61,99,238,32,156,167,109,16,48",
      publicKey: "2,248,120,198,60,207,152,88,33,247,217,58,139,102,182,176,59,9,104,105,107,108,8,199,88,192,15,87,43,218,36,172,60"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/8'/0/0",
      address: "3CKYAcmKKoJQWnLh8VurYPaFyaHtY56jFu",
      privateKeyWIF: "L16iNawWshFcshrm4fq3vMDCBUSYUkza3t1JH9CmXXzWgFZPpwid",
      privateKeyHex: "115,192,12,156,41,15,152,87,104,242,215,179,246,229,20,235,73,172,154,221,240,115,4,61,99,238,32,156,167,109,16,48",
      publicKey: "2,248,120,198,60,207,152,88,33,247,217,58,139,102,182,176,59,9,104,105,107,108,8,199,88,192,15,87,43,218,36,172,60"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/8'/0/0",
      address: "bc1qjyn4fyur3h5py9vn5ngzvxt9ne5hahjxlc60kw",
      privateKeyWIF: "L4c43sv9JgS6yPZ6ypg6widmbHWGhWLHLUmPYe7b1yF74aC2gY4u",
      privateKeyHex: "220,91,9,100,94,155,144,62,83,254,118,181,52,71,252,53,145,18,120,1,110,71,136,41,218,130,154,78,179,120,246,247",
      publicKey: "3,9,231,179,125,101,214,39,197,124,104,228,33,23,159,167,97,104,123,0,15,190,148,3,121,237,60,117,181,120,96,51,109"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/8'/0/0",
      address: "bc1pz8drmcvuvgumpw89jesempeg97tq3ypasypdd8ukr5q8esm6075qzwfdq0",
      privateKeyWIF: "KyHwGtD5pT4PDLZ42mpSigGwVsxyYRAqtSgucx96bBpHAXD22vWc",
      privateKeyHex: "61,217,65,12,241,146,106,236,187,97,130,122,140,192,211,87,201,68,104,215,188,176,21,80,3,19,236,46,216,82,96,201",
      publicKey: "2,105,215,131,109,44,48,2,208,108,39,32,194,207,154,166,252,132,80,98,51,107,7,2,98,66,139,147,11,236,52,45,25",
      internalPubkey: "105,215,131,109,44,48,2,208,108,39,32,194,207,154,166,252,132,80,98,51,107,7,2,98,66,139,147,11,236,52,45,25"
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
// const wallet = require('./9-vault.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
