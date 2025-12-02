/**
 * 🎯 EU - Complete Bitcoin Wallet
 * Wallet principal
 * Generated: 2025-10-25T19:32:28.974Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "EU",
  emoji: "🎯",
  description: "Wallet principal",
  index: 9,

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
      path: "m/44'/0'/9'/0/0",
      address: "1HLgN73kRGGu3EGeNtDsjz1zzU4Yh7z9Jt",
      privateKeyWIF: "L5nwJkYMsUqNYKJKb5ac51RSfoxPUybbrkLdWRo65RyWxuxtdoAr",
      privateKeyHex: "255,202,193,82,39,151,81,145,77,13,232,87,160,225,106,138,25,178,83,174,43,167,24,41,168,145,75,10,73,229,56,249",
      publicKey: "2,5,151,199,246,140,135,247,28,195,17,102,122,176,228,148,215,61,67,110,154,236,124,234,209,242,222,190,41,245,177,24,190"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/9'/0/0",
      address: "34YFrHkr6eKCzmwoD7iSiDUALTzXNQqGjh",
      privateKeyWIF: "Kyp5P52svMMjiDpacFqASofke4CJUCvQh7kc6efH1S8CNkmsRAXS",
      privateKeyHex: "77,90,139,76,191,228,165,60,127,45,157,135,132,9,118,164,136,17,154,228,17,185,219,170,201,244,165,17,213,128,244,18",
      publicKey: "2,60,138,210,226,122,134,39,113,190,119,30,36,174,123,109,41,57,162,5,89,231,73,77,104,249,124,163,219,231,15,95,165"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/9'/0/0",
      address: "35ZrKERnzeEw7f91CU73nGSRr59sAHjvPU",
      privateKeyWIF: "Kyp5P52svMMjiDpacFqASofke4CJUCvQh7kc6efH1S8CNkmsRAXS",
      privateKeyHex: "77,90,139,76,191,228,165,60,127,45,157,135,132,9,118,164,136,17,154,228,17,185,219,170,201,244,165,17,213,128,244,18",
      publicKey: "2,60,138,210,226,122,134,39,113,190,119,30,36,174,123,109,41,57,162,5,89,231,73,77,104,249,124,163,219,231,15,95,165"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/9'/0/0",
      address: "bc1qgtx09ey8k4su4aj8ruqtgu7r2smjxfp7sn542e",
      privateKeyWIF: "L1188juRPmWUQxmQNBgzLrPGJNge6heNB975vajScTkL8FAe6h18",
      privateKeyHex: "112,223,211,89,239,217,45,62,146,135,9,143,69,167,19,23,39,99,171,100,54,115,208,98,50,179,190,216,171,220,149,148",
      publicKey: "3,27,150,104,143,196,88,3,48,119,244,197,229,67,104,250,124,48,102,54,229,132,202,200,124,57,160,164,170,115,92,188,187"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/9'/0/0",
      address: "bc1p4sfxgvf9p4yqrkdqev0h6zyemh4s8ymcxd0rzc4rjenr4lj39qgqh2dfgp",
      privateKeyWIF: "L4S2jz6nPJP3VPExjbm49quw9C4bWn4kFK7zRsmugsMZbJeKVhVf",
      privateKeyHex: "215,51,26,199,185,114,16,72,152,26,182,164,89,73,162,197,150,238,8,192,217,32,214,84,79,117,157,99,95,220,236,124",
      publicKey: "2,99,160,145,191,103,165,242,145,189,213,40,104,89,189,242,185,189,239,64,201,161,17,100,252,215,116,40,85,206,159,75,95",
      internalPubkey: "99,160,145,191,103,165,242,145,189,213,40,104,89,189,242,185,189,239,64,201,161,17,100,252,215,116,40,85,206,159,75,95"
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
// const wallet = require('./10-eu.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
