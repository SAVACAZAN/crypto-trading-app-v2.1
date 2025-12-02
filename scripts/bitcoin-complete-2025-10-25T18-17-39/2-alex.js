/**
 * 👨 ALEX - Complete Bitcoin Wallet
 * Wallet personal Alex
 * Generated: 2025-10-25T18:17:39.245Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "ALEX",
  emoji: "👨",
  description: "Wallet personal Alex",
  index: 1,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/1'/0/0",
      address: "1LgCrAjfjXZV2xpa3TJSm472hRZQaXP3tG",
      privateKeyWIF: "KywUhQXZtH7jxnpX3KCHFeSVEqRoAGhwtm1civYfvUKaiUMEYPyM",
      privateKeyHex: "81,41,91,228,122,134,86,74,151,249,1,45,210,82,34,88,135,155,234,0,234,20,203,130,246,88,63,252,147,252,59,199",
      publicKey: "2,221,57,203,183,178,108,64,80,25,12,59,237,35,42,220,53,49,223,12,15,18,51,35,255,88,243,54,50,242,97,4,153"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/1'/0/0",
      address: "3Ky97WVrwt272EBrZTz7hTtoQfBXptGiNd",
      privateKeyWIF: "L5BCb5S2f69HaMjcb2Kujm5ahtBnJV67eQ5S91zeFrRfdWo7vAwH",
      privateKeyHex: "237,104,100,233,211,91,202,221,97,235,169,116,6,170,22,139,218,18,208,165,0,161,156,95,104,108,245,120,233,130,248,87",
      publicKey: "2,129,62,8,148,203,221,94,175,58,65,37,210,109,73,110,162,217,75,124,23,84,19,184,246,255,222,164,44,35,72,223,89"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/1'/0/0",
      address: "3Gxz9dvWk95qyT4kL6WPCkNmCMPqe4J3fz",
      privateKeyWIF: "L5BCb5S2f69HaMjcb2Kujm5ahtBnJV67eQ5S91zeFrRfdWo7vAwH",
      privateKeyHex: "237,104,100,233,211,91,202,221,97,235,169,116,6,170,22,139,218,18,208,165,0,161,156,95,104,108,245,120,233,130,248,87",
      publicKey: "2,129,62,8,148,203,221,94,175,58,65,37,210,109,73,110,162,217,75,124,23,84,19,184,246,255,222,164,44,35,72,223,89"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/1'/0/0",
      address: "bc1q7uxayprrj9uqtcj45c40g8vp5eaawcrz8486ss",
      privateKeyWIF: "L1w3QbrGfuG8vdXuxLJ5spSRAEHuJTBZatWMbvqEdinAKGEqv5pw",
      privateKeyHex: "140,156,174,188,208,165,178,19,90,127,191,208,68,33,225,128,239,200,180,214,67,29,26,246,67,93,119,109,94,212,45,206",
      publicKey: "3,142,50,33,150,178,217,76,247,3,236,19,28,205,245,15,69,89,121,42,174,244,87,63,169,236,8,95,232,172,244,72,116"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/1'/0/0",
      address: "bc1p3eltl67p9l800xf8pp2kun9s7aw7rjrhyrnteltwsd2hscfltwvqs3yup9",
      privateKeyWIF: "L1UZ8yG9CMd7Rayn4S2dE7Goj2H26o7MvMySzArALHxURtdQb4B9",
      privateKeyHex: "126,252,101,13,153,206,221,46,189,166,109,239,100,57,10,74,226,9,129,131,7,48,179,221,88,248,139,13,239,177,15,239",
      publicKey: "2,137,147,153,110,76,141,89,195,3,153,111,87,7,25,53,177,217,239,216,156,157,68,40,135,243,43,32,206,227,80,2,249",
      internalPubkey: "137,147,153,110,76,141,89,195,3,153,111,87,7,25,53,177,217,239,216,156,157,68,40,135,243,43,32,206,227,80,2,249"
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
// const wallet = require('./2-alex.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
