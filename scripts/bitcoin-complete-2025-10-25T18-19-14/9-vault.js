/**
 * 🔐 VAULT - Complete Bitcoin Wallet
 * Seif securizat
 * Generated: 2025-10-25T18:19:14.490Z
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
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/8'/0/0",
      address: "1LiSVzp1J8i3yfCdyGmjpX5JqkexxPRajR",
      privateKeyWIF: "L5CvkivW6WSfY8G2oejwmnk8qaXRGt5bah99rKXgQeffj3m9cjo1",
      privateKeyHex: "238,75,213,133,150,173,133,101,147,58,140,106,160,23,16,233,67,113,229,154,95,22,196,132,73,102,61,125,63,108,174,196",
      publicKey: "3,25,243,134,202,97,8,206,7,119,197,24,108,40,133,198,104,220,11,147,155,53,214,240,15,73,49,212,215,243,207,8,86"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/8'/0/0",
      address: "3DaxJfS87jYLbsyFDBam1px3kMSk2zXdvL",
      privateKeyWIF: "L13SRJErGA3cdcLsoMANVTCWcfWrtvyShgYTmtRVVFshqCoPDcmQ",
      privateKeyHex: "114,16,188,184,84,87,135,201,41,126,154,65,36,79,209,35,203,132,240,144,98,127,65,92,127,145,168,52,235,178,35,146",
      publicKey: "3,89,40,16,14,149,206,104,195,12,150,26,240,46,28,21,22,42,138,171,223,44,144,184,192,87,223,67,231,15,242,208,84"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/8'/0/0",
      address: "379yM4beXtKW78R89WDHx5pG6X6d65Wmiv",
      privateKeyWIF: "L13SRJErGA3cdcLsoMANVTCWcfWrtvyShgYTmtRVVFshqCoPDcmQ",
      privateKeyHex: "114,16,188,184,84,87,135,201,41,126,154,65,36,79,209,35,203,132,240,144,98,127,65,92,127,145,168,52,235,178,35,146",
      publicKey: "3,89,40,16,14,149,206,104,195,12,150,26,240,46,28,21,22,42,138,171,223,44,144,184,192,87,223,67,231,15,242,208,84"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/8'/0/0",
      address: "bc1qsqezkd9xzp5r2aw3nyjwnd6fczzpyweaje34fg",
      privateKeyWIF: "L514sw5wUH4HVmS8Xkm9Jn5FzXk32nanDiXhBfVzwAv2KjnRjLN6",
      privateKeyHex: "232,49,237,155,139,216,50,140,212,156,112,57,29,167,213,216,84,105,117,13,218,146,198,51,246,233,226,173,208,47,76,43",
      publicKey: "2,90,87,39,149,34,213,81,249,96,65,184,191,241,129,134,240,72,152,13,155,34,91,13,35,7,248,149,120,182,21,114,108"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/8'/0/0",
      address: "bc1p04k6skky39jvgsrv29l0fyu2e6ker7jjrg97ap67hshemz0wuvcsq5p24a",
      privateKeyWIF: "L4gUH5tpMorMDM8pgRZc22xG1RRgjesWus3Jjz2QK6AuNZ5a56ND",
      privateKeyHex: "222,160,213,64,236,97,57,226,12,194,183,110,233,16,135,76,255,231,120,40,165,115,95,19,50,180,75,158,141,136,46,149",
      publicKey: "2,108,162,89,27,160,205,205,159,2,146,85,93,47,219,199,82,195,151,147,145,175,44,167,17,104,17,188,17,155,242,225,189",
      internalPubkey: "108,162,89,27,160,205,205,159,2,146,85,93,47,219,199,82,195,151,147,145,175,44,167,17,104,17,188,17,155,242,225,189"
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
