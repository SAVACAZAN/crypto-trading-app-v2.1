/**
 * 👧 MIRUNA - Complete Bitcoin Wallet
 * Wallet personal Miruna
 * Generated: 2025-10-25T18:17:39.247Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "MIRUNA",
  emoji: "👧",
  description: "Wallet personal Miruna",
  index: 2,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/2'/0/0",
      address: "12QByPWjvPwcRaJTnZW1B97isAATLJLhwi",
      privateKeyWIF: "L2FajXbqYzyUUjjZMJRMDjQXxUiTDZAvhBjDme1kBycXqpswkc6d",
      privateKeyHex: "150,38,87,176,66,254,163,27,159,126,169,119,200,105,166,31,146,29,111,155,194,183,145,237,239,211,173,207,112,199,238,48",
      publicKey: "3,17,169,45,236,78,5,177,100,231,52,155,27,137,160,193,53,102,170,253,55,79,193,176,28,190,61,211,184,196,3,129,187"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/2'/0/0",
      address: "32LwSi9AwmJoSGLX9Ey7X9zAtRCAXsyGVg",
      privateKeyWIF: "KxbiVhCoayRmfV32TvbpxMvQRWhcKFW3NEMRqXsimckz3xg6Fyfk",
      privateKeyHex: "41,40,100,201,223,232,203,241,153,15,197,36,38,204,97,81,148,217,5,47,212,108,216,146,123,0,76,216,108,174,64,119",
      publicKey: "3,173,72,147,108,152,243,59,187,20,114,12,143,249,28,67,221,45,95,211,111,34,48,130,39,191,12,106,6,29,40,117,82"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/2'/0/0",
      address: "38jL3LN1ejeUvPvtX13W2ShSVkqYRyuiKH",
      privateKeyWIF: "KxbiVhCoayRmfV32TvbpxMvQRWhcKFW3NEMRqXsimckz3xg6Fyfk",
      privateKeyHex: "41,40,100,201,223,232,203,241,153,15,197,36,38,204,97,81,148,217,5,47,212,108,216,146,123,0,76,216,108,174,64,119",
      publicKey: "3,173,72,147,108,152,243,59,187,20,114,12,143,249,28,67,221,45,95,211,111,34,48,130,39,191,12,106,6,29,40,117,82"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/2'/0/0",
      address: "bc1q38jdsj3vlm2eq9vh6ln3djj455cuy2lc2td2vg",
      privateKeyWIF: "L1HPcA8jhohnbJQNTYBvJ6Mm26BoTj2eHDkE6Xde8c1BFmdLfpPW",
      privateKeyHex: "121,62,24,135,158,140,223,205,174,17,143,212,180,219,246,244,106,97,232,158,156,111,159,126,11,46,115,5,228,79,190,141",
      publicKey: "3,83,223,94,154,101,243,252,213,36,217,251,195,235,60,214,115,47,228,227,215,41,219,250,19,79,120,184,62,158,54,130,224"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/2'/0/0",
      address: "bc1pxv0x98sl0aalcfcnxnrfvkz2ucfxfmdw25vmjmv05rpla2xp36zqs25r0d",
      privateKeyWIF: "L2Wze7U45BAEuTVkKwYyVRWiyfwYVqNwnqsjdeV3ukpYsSQnBMGW",
      privateKeyHex: "158,20,17,30,28,25,153,103,208,215,89,187,210,196,146,103,13,127,89,118,59,100,126,219,123,192,203,18,159,229,146,194",
      publicKey: "2,103,8,96,13,196,225,40,238,199,243,70,163,231,12,90,1,1,92,32,228,234,43,74,129,175,248,85,149,192,52,76,230",
      internalPubkey: "103,8,96,13,196,225,40,238,199,243,70,163,231,12,90,1,1,92,32,228,234,43,74,129,175,248,85,149,192,52,76,230"
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
// const wallet = require('./3-miruna.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
