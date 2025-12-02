/**
 * 👩 INGRID - Complete Bitcoin Wallet
 * Wallet personal Ingrid
 * Generated: 2025-10-25T18:19:14.486Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "INGRID",
  emoji: "👩",
  description: "Wallet personal Ingrid",
  index: 3,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/3'/0/0",
      address: "1Mz85VWoS3fPfiHpefi7AC7mjwb8WjuoBk",
      privateKeyWIF: "KxJq1s7ZWHnQFh6mVrapoR6NZsXEeXBHoJZ1wMCkd3J9JhEZX5s6",
      privateKeyHex: "32,120,93,110,131,183,235,53,211,194,240,35,203,223,103,234,129,92,22,202,184,236,246,179,42,15,202,170,143,82,97,142",
      publicKey: "3,173,125,227,48,5,104,109,53,142,114,76,9,167,199,78,169,159,225,7,224,18,106,198,163,122,93,71,30,131,50,171,64"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/3'/0/0",
      address: "3HsLapQUNfskdizvrVWHuiuYBumGwhZ2N6",
      privateKeyWIF: "KydaKgg3VEhv8zNwCp5eo7XEbRgV311BhrmKKgFzHwZSN1BokmHm",
      privateKeyHex: "71,243,154,68,16,172,7,55,147,138,64,165,2,107,107,51,81,205,113,211,12,94,180,0,43,150,99,220,16,44,143,2",
      publicKey: "3,115,59,145,104,149,78,165,82,2,33,233,239,91,85,186,93,116,255,194,112,69,82,154,43,12,28,58,69,226,63,197,203"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/3'/0/0",
      address: "3FNb41tKMBY3hNHNmi2tqRNQDDwXUmxidE",
      privateKeyWIF: "KydaKgg3VEhv8zNwCp5eo7XEbRgV311BhrmKKgFzHwZSN1BokmHm",
      privateKeyHex: "71,243,154,68,16,172,7,55,147,138,64,165,2,107,107,51,81,205,113,211,12,94,180,0,43,150,99,220,16,44,143,2",
      publicKey: "3,115,59,145,104,149,78,165,82,2,33,233,239,91,85,186,93,116,255,194,112,69,82,154,43,12,28,58,69,226,63,197,203"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/3'/0/0",
      address: "bc1qt6vvzqcudu6n57at04ehhqkddw4q046mujn69m",
      privateKeyWIF: "KyGHUs131wtdpz4PVAxh1tBcYWp7ReA8fs1jRy9vVefEerHMHtot",
      privateKeyHex: "60,255,190,74,199,52,207,60,55,224,227,7,196,71,212,169,27,132,117,253,28,196,119,21,102,75,136,103,34,145,143,161",
      publicKey: "2,29,181,203,38,24,135,57,36,0,9,62,223,125,148,217,91,240,16,132,194,166,175,86,184,226,91,21,63,75,77,55,59"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/3'/0/0",
      address: "bc1plrzg2826nu03zg6hdn9v9y2edekxwx42xxq2wn7pllare25c53dss6gxm3",
      privateKeyWIF: "KzS6FsecE5jdJQvrkpCktRgB2sF96zmNAc2gYFZ8N1Mz4G5Xsf4j",
      privateKeyHex: "95,225,151,172,12,216,212,114,67,107,217,17,105,152,29,112,60,53,253,148,225,236,228,225,221,227,87,40,42,98,104,79",
      publicKey: "3,148,213,212,38,148,202,25,29,39,215,17,48,70,11,119,131,63,212,166,76,59,127,245,65,209,95,126,178,141,238,156,108",
      internalPubkey: "148,213,212,38,148,202,25,29,39,215,17,48,70,11,119,131,63,212,166,76,59,127,245,65,209,95,126,178,141,238,156,108"
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
// const wallet = require('./4-ingrid.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
