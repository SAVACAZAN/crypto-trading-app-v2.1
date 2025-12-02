/**
 * 👵 MAMA - Complete Bitcoin Wallet
 * Wallet pentru mamă
 * Generated: 2025-10-25T19:32:28.961Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "MAMA",
  emoji: "👵",
  description: "Wallet pentru mamă",
  index: 5,

  // Mnemonic (shared across all wallets)
  mnemonic: "perfect repair cat pause skull artist soap cruel lock educate warm school",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "SAVACAZAN",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/5'/0/0",
      address: "191mtWKTLbueVn9CkRtiBzHSnR1Cd2hqxo",
      privateKeyWIF: "L3DBrRsd9AQHM3Mt4uA2Z1Fs8YrGB4kkoJSr2ikHjQrXK83goi73",
      privateKeyHex: "178,193,94,166,190,141,116,151,135,120,28,93,101,12,143,76,135,103,238,143,226,119,177,234,136,19,5,220,185,24,203,36",
      publicKey: "2,125,173,3,158,209,175,52,211,9,52,22,116,2,26,45,177,49,195,241,143,146,46,56,40,159,184,120,247,67,187,195,98"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/5'/0/0",
      address: "32iLfjYjpbzoYvLuXTg5TRpieURMCeqQ6t",
      privateKeyWIF: "KyeSmUjKCeS3DE1H1dNTLF68QABnp5LYSXPieKDv7mrETq17Zy6u",
      privateKeyHex: "72,102,36,189,207,87,198,211,249,255,168,85,13,182,148,236,225,235,151,6,251,89,221,86,26,177,83,164,114,41,212,74",
      publicKey: "2,225,123,40,73,60,39,78,189,34,254,95,235,145,217,130,12,181,173,213,231,108,166,205,69,218,33,43,248,174,65,116,93"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/5'/0/0",
      address: "3QEj8Gpe9HPapcNL6KgreztCN8PNd1LwmY",
      privateKeyWIF: "KyeSmUjKCeS3DE1H1dNTLF68QABnp5LYSXPieKDv7mrETq17Zy6u",
      privateKeyHex: "72,102,36,189,207,87,198,211,249,255,168,85,13,182,148,236,225,235,151,6,251,89,221,86,26,177,83,164,114,41,212,74",
      publicKey: "2,225,123,40,73,60,39,78,189,34,254,95,235,145,217,130,12,181,173,213,231,108,166,205,69,218,33,43,248,174,65,116,93"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/5'/0/0",
      address: "bc1qwru9d6aumxyd9m90cphtht65yq6srn7v6s6qex",
      privateKeyWIF: "L1Tyn2vXteKuBFddYdjQ7QWEQTBVP3ff1DGycSuECtmtuT8VQQB3",
      privateKeyHex: "126,176,165,1,85,205,132,77,81,14,73,22,117,98,200,238,84,29,2,65,165,251,201,149,85,114,86,88,47,4,211,253",
      publicKey: "3,189,234,140,98,59,254,190,120,47,152,103,139,46,180,226,87,119,195,235,198,206,29,247,67,49,63,67,32,197,121,2,69"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/5'/0/0",
      address: "bc1pt5h9h8jq8tt6fhvz4zp24gh08pqshmkk0753j96snkcmz8pzv64qrn9l8r",
      privateKeyWIF: "KyiswdoXp7KS4wKxCFkfu7g1rgymHkCthqsYTyUDsEZ9erKseKcT",
      privateKeyHex: "74,174,23,80,115,150,182,50,20,98,153,97,120,249,172,251,60,4,159,28,191,108,172,228,137,54,33,66,12,167,18,21",
      publicKey: "2,250,225,15,82,0,192,42,90,227,224,148,18,251,251,242,173,139,141,180,198,15,54,65,34,199,51,163,149,156,5,237,165",
      internalPubkey: "250,225,15,82,0,192,42,90,227,224,148,18,251,251,242,173,139,141,180,198,15,54,65,34,199,51,163,149,156,5,237,165"
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
