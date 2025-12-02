/**
 * 👧 MIRUNA - Complete Bitcoin Wallet
 * Wallet personal Miruna
 * Generated: 2025-10-25T19:32:28.955Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "MIRUNA",
  emoji: "👧",
  description: "Wallet personal Miruna",
  index: 2,

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
      path: "m/44'/0'/2'/0/0",
      address: "1GuVHRBAjS4Lh843q5cPh3jkGbsUBv4KVQ",
      privateKeyWIF: "KygUhdtCgy63GryFo1boWGjTPUNdCkAobajUSmyZsbz2h5gXrzKA",
      privateKeyHex: "73,113,237,49,188,50,195,207,81,161,2,185,253,89,10,77,1,152,158,32,233,62,136,241,11,15,32,148,55,240,1,191",
      publicKey: "3,195,237,66,199,248,208,153,120,65,52,241,248,54,140,191,49,228,139,232,70,120,6,63,27,19,232,28,208,16,137,137,194"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/2'/0/0",
      address: "34mxXgCDFjnqugEfJgEaUnJ6RsY1ucxVZo",
      privateKeyWIF: "L3Bg6VqWmUM56wu9hof5LoJabZds2zoR8tHPC6F7vYz8eHYGZg2Y",
      privateKeyHex: "177,250,27,16,171,140,220,107,120,167,46,210,98,2,221,155,210,134,233,35,7,24,245,253,3,241,230,194,159,49,72,134",
      publicKey: "3,71,48,211,49,140,153,227,47,110,63,183,31,184,7,16,255,244,175,43,11,132,165,163,105,183,102,167,21,243,66,68,216"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/2'/0/0",
      address: "3KecCsyoCsevtcgtXiANm5BytcTURf3EuP",
      privateKeyWIF: "L3Bg6VqWmUM56wu9hof5LoJabZds2zoR8tHPC6F7vYz8eHYGZg2Y",
      privateKeyHex: "177,250,27,16,171,140,220,107,120,167,46,210,98,2,221,155,210,134,233,35,7,24,245,253,3,241,230,194,159,49,72,134",
      publicKey: "3,71,48,211,49,140,153,227,47,110,63,183,31,184,7,16,255,244,175,43,11,132,165,163,105,183,102,167,21,243,66,68,216"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/2'/0/0",
      address: "bc1q0k7g4jwaevzx7q9a85dptqsleuyvydydhz4zhx",
      privateKeyWIF: "KwFkvY6PnLvRaHFZsQmSFaymVgjn7M6nVTSWhR5LMwhrLXDFwabd",
      privateKeyHex: "1,13,156,177,112,30,157,11,29,8,79,80,207,171,246,69,101,169,124,25,144,243,14,27,121,144,181,204,7,69,168,208",
      publicKey: "3,52,224,70,76,136,212,252,227,142,217,146,169,121,185,2,83,102,73,202,43,124,66,255,54,172,172,100,44,134,175,187,92"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/2'/0/0",
      address: "bc1phava0slzs4xenqthjycl2q8vxwu5lwl4x9k2mnzn7lx2m07w36pssprylk",
      privateKeyWIF: "L51C2mGyu84WqSksrbqdpbMFsQvs8kMpJbV6cXdg3xkWHDH6UzkP",
      privateKeyHex: "232,66,43,16,248,152,229,21,174,215,55,214,157,183,70,14,179,137,156,46,252,135,163,249,122,130,177,63,44,223,117,77",
      publicKey: "3,255,250,180,99,83,217,9,110,48,130,250,162,62,122,134,28,28,114,235,63,61,97,194,181,79,15,255,86,29,133,88,170",
      internalPubkey: "255,250,180,99,83,217,9,110,48,130,250,162,62,122,134,28,28,114,235,63,61,97,194,181,79,15,255,86,29,133,88,170"
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
