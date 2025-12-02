/**
 * 👧 MIRUNA - Complete Bitcoin Wallet
 * Wallet personal Miruna
 * Generated: 2025-10-25T18:19:14.485Z
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
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/2'/0/0",
      address: "1JCHWQUS4TbB4M5hqVdLS4r4LpUGvW4AWq",
      privateKeyWIF: "KxYkmotCAcdNvmUwpRdYhsCK8a3NYojd97ndPTp2CxTeWmjSpwyc",
      privateKeyHex: "39,162,122,64,198,198,88,95,28,29,250,225,226,175,154,101,72,35,8,225,119,2,210,119,236,202,131,185,165,221,150,156",
      publicKey: "2,136,51,181,207,206,141,155,85,179,79,140,187,124,109,74,86,68,40,162,20,142,118,217,7,148,201,62,196,128,10,55,120"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/2'/0/0",
      address: "3JF5tZ9CcUCdYy69su2sdAP14jQMyvVeN4",
      privateKeyWIF: "L2KnQEnAWbMKNBxha1qYXB6vzCdHn4QU7o5iGSgSrNfVUGM3pV8p",
      privateKeyHex: "152,79,158,132,31,249,195,189,72,113,195,243,90,57,125,112,141,39,174,199,72,5,57,71,31,84,129,45,138,39,63,33",
      publicKey: "3,178,150,204,248,177,9,107,173,12,189,204,116,115,35,115,24,97,194,42,171,193,159,63,232,67,2,221,99,237,169,251,184"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/2'/0/0",
      address: "3C1qXA4ANRfgXfWcaRpQvFT1wjaxwY8yP8",
      privateKeyWIF: "L2KnQEnAWbMKNBxha1qYXB6vzCdHn4QU7o5iGSgSrNfVUGM3pV8p",
      privateKeyHex: "152,79,158,132,31,249,195,189,72,113,195,243,90,57,125,112,141,39,174,199,72,5,57,71,31,84,129,45,138,39,63,33",
      publicKey: "3,178,150,204,248,177,9,107,173,12,189,204,116,115,35,115,24,97,194,42,171,193,159,63,232,67,2,221,99,237,169,251,184"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/2'/0/0",
      address: "bc1qzvtxeu4y4763c0yrvdfrws88lcaujrgqglq7u2",
      privateKeyWIF: "L2gzyJpsS1vbZ9kqFsvWzv35NhFFrF9jN582dipEFNJJ8fUVwTTc",
      privateKeyHex: "163,57,199,128,227,11,88,59,46,2,48,53,216,94,207,93,149,217,123,164,106,22,72,164,14,247,9,78,87,191,112,201",
      publicKey: "3,138,175,73,239,7,94,255,254,103,254,147,221,251,20,24,135,185,24,126,206,151,196,33,80,142,3,29,71,179,204,112,137"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/2'/0/0",
      address: "bc1pctttadxqr4zh68nmq67f9kmrtejaxdy4s0ac3w5u783jlwnlld7scakqzw",
      privateKeyWIF: "L1yGuAtqLWoSyhW9VuZjD9iSRsraH7xJFd7zyBjgnxaUrUE2touH",
      privateKeyHex: "141,194,182,24,208,64,228,207,101,56,34,26,99,239,95,245,213,12,111,216,131,191,38,214,235,168,255,246,31,158,139,43",
      publicKey: "3,74,22,59,171,67,181,97,215,116,167,233,76,19,116,55,161,25,212,170,199,110,44,174,14,72,59,105,241,229,223,207,29",
      internalPubkey: "74,22,59,171,67,181,97,215,116,167,233,76,19,116,55,161,25,212,170,199,110,44,174,14,72,59,105,241,229,223,207,29"
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
