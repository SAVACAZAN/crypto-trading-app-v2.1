/**
 * 👨‍💼 ADI - Complete Bitcoin Wallet
 * Wallet personal Adi
 * Generated: 2025-10-25T19:25:20.487Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "ADI",
  emoji: "👨‍💼",
  description: "Wallet personal Adi",
  index: 4,

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
      path: "m/44'/0'/4'/0/0",
      address: "1G67g9Fj6JeqJ5HKJp6o9Hrgh8TUiAAn8w",
      privateKeyWIF: "L2ssXMJpP7Rx7aPkdqES4kK5kzJe9wcUVNaD9oLGVSupqao5P9xW",
      privateKeyHex: "168,209,134,155,166,248,231,191,69,111,60,12,106,236,162,178,155,174,193,110,43,110,123,17,88,142,188,43,35,127,141,175",
      publicKey: "2,220,217,76,91,182,18,41,155,200,225,56,187,3,132,42,63,0,49,249,95,25,48,163,13,156,142,207,169,145,215,39,249"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/4'/0/0",
      address: "38Ah2gzsdRrTd36VAypz3UX1ZHpsfpS56K",
      privateKeyWIF: "Kz1sDi42mYpK2ZW5m7BJKsWtZiARHV8U63bptF7MY79inUdk8V45",
      privateKeyHex: "83,107,72,135,111,220,195,155,244,93,119,253,74,105,54,237,74,188,22,149,99,150,114,188,157,99,68,177,125,154,90,14",
      publicKey: "2,150,233,145,200,219,234,29,92,49,162,247,107,119,149,145,67,236,127,220,17,175,71,207,74,243,215,14,132,227,106,239,48"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/4'/0/0",
      address: "3M3ehHDpzQbbuSG21kHYJmzsw3R7LnPhTw",
      privateKeyWIF: "Kz1sDi42mYpK2ZW5m7BJKsWtZiARHV8U63bptF7MY79inUdk8V45",
      privateKeyHex: "83,107,72,135,111,220,195,155,244,93,119,253,74,105,54,237,74,188,22,149,99,150,114,188,157,99,68,177,125,154,90,14",
      publicKey: "2,150,233,145,200,219,234,29,92,49,162,247,107,119,149,145,67,236,127,220,17,175,71,207,74,243,215,14,132,227,106,239,48"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/4'/0/0",
      address: "bc1qthpnw60e3ee6ftkj67mjmscj326zx9l5uemm8d",
      privateKeyWIF: "KyMcNHMXo3JbQd4HLexJTGn8t8YnJer9iueeSmsYp8sL8u54hQsr",
      privateKeyHex: "63,189,27,167,164,148,9,3,123,66,153,39,134,11,147,147,31,219,142,231,23,92,246,182,212,181,163,112,92,147,164,252",
      publicKey: "3,44,92,196,247,227,16,41,229,83,226,2,112,8,162,59,107,218,62,1,140,205,198,17,133,202,33,5,132,104,45,237,174"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/4'/0/0",
      address: "bc1prhg2z3skx0uv5ezkx38fl5whq56ez89jtsgd64hk5uqj82ehhtlsh5zr9l",
      privateKeyWIF: "KyT9kWpv9kM2174dBrRCY1wZun3ud99hjgyUGJQXY3MEkrrzTwgj",
      privateKeyHex: "66,150,217,32,253,47,74,203,139,209,27,69,43,100,156,0,107,55,253,144,60,205,31,213,150,3,200,65,6,36,125,92",
      publicKey: "3,21,205,27,172,39,137,167,138,249,15,136,199,131,170,197,129,200,211,157,144,107,86,105,35,236,176,49,149,255,203,70,23",
      internalPubkey: "21,205,27,172,39,137,167,138,249,15,136,199,131,170,197,129,200,211,157,144,107,86,105,35,236,176,49,149,255,203,70,23"
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
// const wallet = require('./5-adi.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
