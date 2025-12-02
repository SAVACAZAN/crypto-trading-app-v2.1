/**
 * 👵 MAMA - Complete Bitcoin Wallet
 * Wallet pentru mamă
 * Generated: 2025-10-25T18:19:14.487Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "MAMA",
  emoji: "👵",
  description: "Wallet pentru mamă",
  index: 5,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/5'/0/0",
      address: "198J2nouLcYrBFCBQQybWyNzaUbQFLPPAe",
      privateKeyWIF: "L1jDV7wDbCJF4mreMr67HMSLcpjABjv4kM7vGQWK88emN1UVWLw8",
      privateKeyHex: "134,135,54,105,167,74,211,83,88,212,42,105,27,213,59,56,76,52,2,22,230,68,221,42,106,133,239,116,145,240,16,39",
      publicKey: "3,84,76,228,16,84,241,44,215,64,236,105,175,121,183,117,143,72,200,148,241,46,81,22,128,160,217,149,198,76,240,243,221"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/5'/0/0",
      address: "39tgteLg1DxdKQRxKzmPkBJyyqr8xSb5Vz",
      privateKeyWIF: "KzW5zNAzGfUSQYghHuNAhhD5AFYyTB5yUofNWB9cDMdCTFM2hN8Q",
      privateKeyHex: "97,239,197,12,172,56,136,98,187,86,107,79,38,139,204,99,229,126,169,188,135,199,74,233,50,148,80,74,250,178,55,220",
      publicKey: "2,114,142,206,29,8,45,25,8,40,120,249,102,192,30,95,149,10,233,202,173,150,210,189,118,36,141,73,50,178,11,125,3"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/5'/0/0",
      address: "3PjCJ9ZLgaLWTAeL8vJ719jf3XSiyjaL25",
      privateKeyWIF: "KzW5zNAzGfUSQYghHuNAhhD5AFYyTB5yUofNWB9cDMdCTFM2hN8Q",
      privateKeyHex: "97,239,197,12,172,56,136,98,187,86,107,79,38,139,204,99,229,126,169,188,135,199,74,233,50,148,80,74,250,178,55,220",
      publicKey: "2,114,142,206,29,8,45,25,8,40,120,249,102,192,30,95,149,10,233,202,173,150,210,189,118,36,141,73,50,178,11,125,3"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/5'/0/0",
      address: "bc1qtrn2jac3neypcqxym53m2wm49hygry7m0z36g6",
      privateKeyWIF: "L3m5uAssrD56YYJ7FvHFgiBAJCGXe4ofA2yz7nbcpsRE5CsisRbF",
      privateKeyHex: "195,42,32,221,0,116,105,0,67,49,233,4,228,189,59,44,64,162,216,107,0,97,248,155,172,203,198,215,121,106,134,197",
      publicKey: "3,16,43,28,168,177,79,39,153,73,205,135,206,233,65,129,227,188,180,24,117,252,15,137,214,28,198,191,174,139,49,215,207"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/5'/0/0",
      address: "bc1pdwgwyyn8zcn8r7e4s74fvm54tcsnxcl60ynnz86fjx48vewh6x9qdm55a9",
      privateKeyWIF: "Kzdf7txQ8qxyUcL3AEvJ8xkNGGVDmdKDVVMPrD5h5aFLcjJS8ERL",
      privateKeyHex: "101,212,222,36,174,208,47,210,177,210,134,141,116,100,155,91,40,76,235,167,96,176,225,174,203,125,83,194,115,2,126,123",
      publicKey: "2,121,159,150,229,224,48,20,126,110,200,189,155,94,143,220,239,198,72,107,188,68,211,194,141,35,151,168,14,176,197,84,155",
      internalPubkey: "121,159,150,229,224,48,20,126,110,200,189,155,94,143,220,239,198,72,107,188,68,211,194,141,35,151,168,14,176,197,84,155"
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
// const wallet = require('./6-mama.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
