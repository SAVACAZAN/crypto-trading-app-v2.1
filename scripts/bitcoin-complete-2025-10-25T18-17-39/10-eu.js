/**
 * 🎯 EU - Complete Bitcoin Wallet
 * Wallet principal
 * Generated: 2025-10-25T18:17:39.253Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "EU",
  emoji: "🎯",
  description: "Wallet principal",
  index: 9,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/9'/0/0",
      address: "1MQc5VJDZyTX6FobXSRSSjiz3t1SaHWNmZ",
      privateKeyWIF: "KyZnKHoqN7LD4hsk4AtNnHhGXPhQ38wtqPwmUebNe9pfqJUry4HZ",
      privateKeyHex: "70,0,12,221,114,147,82,40,2,249,31,91,39,90,11,159,62,229,217,15,183,77,163,165,64,15,224,34,203,190,100,218",
      publicKey: "3,188,104,3,52,188,28,84,208,57,120,101,225,35,14,126,123,177,21,150,67,249,43,145,73,104,188,7,234,234,36,249,159"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/9'/0/0",
      address: "35bMXLh1KgRNHewZkQbCP29wkKQ1tLdmhV",
      privateKeyWIF: "L3wei1eLDz9MrbxgpQB8C19vwdhS9bKamh6RftHAroW1r1FkAguB",
      privateKeyHex: "200,153,149,63,35,159,76,76,180,74,172,219,238,222,62,214,58,165,114,227,235,126,173,16,237,148,112,144,6,52,42,94",
      publicKey: "2,178,157,2,96,119,58,4,98,139,28,243,239,245,22,220,32,171,80,22,160,83,61,39,58,14,227,162,4,241,234,0,90"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/9'/0/0",
      address: "3Mb76xiex5YbpLNqXWCrkvqPfyyEqFxZjk",
      privateKeyWIF: "L3wei1eLDz9MrbxgpQB8C19vwdhS9bKamh6RftHAroW1r1FkAguB",
      privateKeyHex: "200,153,149,63,35,159,76,76,180,74,172,219,238,222,62,214,58,165,114,227,235,126,173,16,237,148,112,144,6,52,42,94",
      publicKey: "2,178,157,2,96,119,58,4,98,139,28,243,239,245,22,220,32,171,80,22,160,83,61,39,58,14,227,162,4,241,234,0,90"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/9'/0/0",
      address: "bc1qgd6jntx9r3trz0anxxgmz7aznkamvse55z9tsc",
      privateKeyWIF: "Ky4xcprqw7N8trbXUmz3DHP58ah5efwVHQ5qexXvd9okP2vTn755",
      privateKeyHex: "55,44,65,150,78,39,14,136,220,101,240,80,85,171,136,238,67,182,49,100,74,135,146,116,205,208,51,134,46,153,29,173",
      publicKey: "3,13,246,216,122,127,71,194,214,234,240,37,60,202,234,24,77,37,151,188,169,222,121,43,30,182,251,90,232,21,42,178,145"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/9'/0/0",
      address: "bc1pp4jweky64wxmedf6m3r00m502r8l3sut4elvywyhtvxl6lpgg23sdyng7d",
      privateKeyWIF: "L1nj3eHm46LPn979LcTzx6Jir9bVbdgh9vz8jXPKvhXpRN6TAfjE",
      privateKeyHex: "136,85,108,16,161,148,200,40,7,155,205,152,224,55,243,127,240,232,87,141,38,191,244,202,237,224,121,24,239,34,206,114",
      publicKey: "3,154,245,171,7,71,198,248,7,76,173,225,93,156,141,166,178,245,214,125,204,176,31,178,90,69,145,166,228,194,56,22,213",
      internalPubkey: "154,245,171,7,71,198,248,7,76,173,225,93,156,141,166,178,245,214,125,204,176,31,178,90,69,145,166,228,194,56,22,213"
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
