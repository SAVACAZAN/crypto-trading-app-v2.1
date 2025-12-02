/**
 * 👵 MAMA - Complete Bitcoin Wallet
 * Wallet pentru mamă
 * Generated: 2025-10-25T18:17:39.249Z
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
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/5'/0/0",
      address: "14f3yTQvKgEuFfNrYDFf3y92VU1VYwksdq",
      privateKeyWIF: "KyFJ5wbtrAQnazMsU6ewxtmKac3C9nBiz6TsJLTu3TbZXBr3fKEG",
      privateKeyHex: "60,125,107,168,162,169,172,228,146,100,65,17,87,134,28,88,148,210,139,35,231,78,137,223,141,142,6,57,229,218,41,181",
      publicKey: "3,249,104,176,228,77,21,19,142,29,222,203,116,225,223,155,15,184,216,1,161,218,235,116,143,238,148,240,59,231,207,29,21"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/5'/0/0",
      address: "3DnCgCunUmHcPgJMa5SkMgG69ppju7vP84",
      privateKeyWIF: "KxRtKXscpygWBJ9RkZR2q2JHKiG2dC76GjBtyovfwWgqNwpxyuBG",
      privateKeyHex: "36,25,189,190,175,27,116,77,54,193,135,100,110,132,191,180,10,35,73,52,121,244,216,18,64,44,247,200,37,160,74,187",
      publicKey: "2,129,177,82,176,172,200,198,87,53,30,131,167,98,197,92,13,106,167,152,124,183,27,46,60,84,5,87,186,88,77,190,35"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/5'/0/0",
      address: "3CDLskCKz4a2aSw2puS5ypb4crpJ7yjB3P",
      privateKeyWIF: "KxRtKXscpygWBJ9RkZR2q2JHKiG2dC76GjBtyovfwWgqNwpxyuBG",
      privateKeyHex: "36,25,189,190,175,27,116,77,54,193,135,100,110,132,191,180,10,35,73,52,121,244,216,18,64,44,247,200,37,160,74,187",
      publicKey: "2,129,177,82,176,172,200,198,87,53,30,131,167,98,197,92,13,106,167,152,124,183,27,46,60,84,5,87,186,88,77,190,35"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/5'/0/0",
      address: "bc1qhhhzwj6zg4tf38wdeyyapjkvgstgv7z5g7vgxv",
      privateKeyWIF: "L3hk1cBx8RVeHVS2wb8rb4mnuuCWvPMp3Y8sYhrhxHbAgEnWfqkf",
      privateKeyHex: "193,113,225,46,137,52,225,56,163,48,58,233,100,96,51,32,52,4,183,127,181,164,252,173,33,33,123,150,119,198,24,159",
      publicKey: "3,143,77,6,210,105,254,147,49,152,61,101,52,113,116,166,70,201,220,149,184,185,44,200,200,41,21,202,252,246,28,160,122"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/5'/0/0",
      address: "bc1pue95kmgfaucgskdc78s9ms6grczg9y650cvp9gagt5n2ns6yzq3szrwc4c",
      privateKeyWIF: "KxrMtm41FDEYcENGoDWLT81N694kyuHvHwuH9rov7f4Xb4ZW4deK",
      privateKeyHex: "48,177,14,25,232,108,87,18,46,59,136,173,56,42,172,187,41,189,182,186,86,173,152,217,2,68,126,74,9,49,106,17",
      publicKey: "2,61,34,155,136,114,76,188,208,136,226,193,154,246,218,219,127,144,33,209,128,154,138,131,174,51,36,249,153,195,159,13,10",
      internalPubkey: "61,34,155,136,114,76,188,208,136,226,193,154,246,218,219,127,144,33,209,128,154,138,131,174,51,36,249,153,195,159,13,10"
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
