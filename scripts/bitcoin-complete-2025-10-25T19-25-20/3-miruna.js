/**
 * 👧 MIRUNA - Complete Bitcoin Wallet
 * Wallet personal Miruna
 * Generated: 2025-10-25T19:25:20.485Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "MIRUNA",
  emoji: "👧",
  description: "Wallet personal Miruna",
  index: 2,

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
      path: "m/44'/0'/2'/0/0",
      address: "1Ks6ZWZnBgkdSHdQi9jXt178UAZvFVPQ4s",
      privateKeyWIF: "KzLZamJLmNPKRb6tr5CNo2Hd8TEUwjmMHHkxsaGVEY9y4jkv2N4Q",
      privateKeyHex: "93,9,118,85,74,245,146,13,205,131,164,133,163,161,214,38,253,170,69,231,184,60,19,122,18,192,180,177,5,153,64,165",
      publicKey: "3,242,85,175,237,62,139,93,173,165,9,64,29,87,165,52,99,220,17,28,168,71,27,88,40,15,254,65,89,109,172,143,152"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/2'/0/0",
      address: "3GkzfMozn3PwqW6s1mPHu76FMoed6aaQB6",
      privateKeyWIF: "Kyi3p1TFgxdktZkcuM1FEVGQQJq5qvBTcvZ6poNsX6GQevUVRwa1",
      privateKeyHex: "74,64,205,120,189,25,97,30,15,220,215,171,88,146,134,215,28,187,62,137,220,139,227,107,219,239,100,142,187,240,238,131",
      publicKey: "3,72,5,250,229,92,242,136,91,94,129,205,214,171,180,93,41,67,4,61,188,244,240,25,43,109,228,38,221,171,15,167,21"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/2'/0/0",
      address: "36SVjkNawXqUun1auJvAgKbGBPnvhydCAu",
      privateKeyWIF: "Kyi3p1TFgxdktZkcuM1FEVGQQJq5qvBTcvZ6poNsX6GQevUVRwa1",
      privateKeyHex: "74,64,205,120,189,25,97,30,15,220,215,171,88,146,134,215,28,187,62,137,220,139,227,107,219,239,100,142,187,240,238,131",
      publicKey: "3,72,5,250,229,92,242,136,91,94,129,205,214,171,180,93,41,67,4,61,188,244,240,25,43,109,228,38,221,171,15,167,21"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/2'/0/0",
      address: "bc1qtp8e0ztxyt7dlf4ajhyjpjxqrcerwa6p20e9gz",
      privateKeyWIF: "L4QaANVYF3FLyDfdiq3AzeuSx8E2AUEjyUwCYkbL6qZVoQynK3h7",
      privateKeyHex: "214,115,14,111,213,10,45,73,219,106,44,92,65,32,129,38,116,45,136,59,5,32,210,166,224,21,178,209,203,93,86,79",
      publicKey: "3,239,71,21,210,13,159,182,103,44,21,45,46,157,14,248,184,166,95,226,197,107,33,187,231,0,238,226,18,227,70,2,95"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/2'/0/0",
      address: "bc1pxvyr4c4gps7nh5rzjmtl6hhsjt65pf34t883vxlk0396chjft6aqcuxl5v",
      privateKeyWIF: "L1eQqu95hwfBSS7enZ3s1QaDXVoQkTGVvQpxwA7VHccHjWVG2sE4",
      privateKeyHex: "132,14,133,188,68,80,136,19,56,193,240,214,183,137,143,82,163,10,240,41,253,6,67,20,2,29,82,234,99,163,95,84",
      publicKey: "2,14,165,209,178,33,218,34,121,76,0,170,232,96,112,129,13,174,106,141,14,21,107,250,195,220,150,123,177,58,106,105,13",
      internalPubkey: "14,165,209,178,33,218,34,121,76,0,170,232,96,112,129,13,174,106,141,14,21,107,250,195,220,150,123,177,58,106,105,13"
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
