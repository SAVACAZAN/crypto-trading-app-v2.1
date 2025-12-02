/**
 * 🏦 BANK - Complete Bitcoin Wallet
 * Rezervă bancară
 * Generated: 2025-10-25T18:19:14.489Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "BANK",
  emoji: "🏦",
  description: "Rezervă bancară",
  index: 7,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/7'/0/0",
      address: "1LBMkUKxvRpnuMo3tCr7AvSieNixXoK5pP",
      privateKeyWIF: "KzZgBASH5P2AsBkAe8SmQ4GZhwYcVryLfuQtRA24XkHhzMNVHzeV",
      privateKeyHex: "99,200,123,92,181,119,131,245,133,254,156,243,96,254,174,242,90,23,142,31,14,34,227,130,196,13,208,199,162,92,239,96",
      publicKey: "3,230,216,241,142,173,151,52,9,106,13,99,19,217,197,33,86,197,128,146,225,231,131,11,124,112,247,135,43,191,93,65,94"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/7'/0/0",
      address: "3GnWHVu3aU399nLyTyGDXCoaBmve1rBNFV",
      privateKeyWIF: "KyFHWQ64mGyNDpDUYRB5HbFpBQF6JT3hFeiGMcG9YSaWGyvjZhPS",
      privateKeyHex: "60,124,27,124,64,157,46,65,210,217,62,198,40,182,234,187,86,126,40,196,167,218,147,166,249,37,221,197,151,162,249,65",
      publicKey: "2,160,15,72,131,203,203,48,53,10,174,22,157,47,154,1,139,165,140,114,226,118,254,207,206,249,169,136,211,152,182,83,203"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/7'/0/0",
      address: "35iu5Xhs65iZY1M4fnMG9fGihTLoVTvTzx",
      privateKeyWIF: "KyFHWQ64mGyNDpDUYRB5HbFpBQF6JT3hFeiGMcG9YSaWGyvjZhPS",
      privateKeyHex: "60,124,27,124,64,157,46,65,210,217,62,198,40,182,234,187,86,126,40,196,167,218,147,166,249,37,221,197,151,162,249,65",
      publicKey: "2,160,15,72,131,203,203,48,53,10,174,22,157,47,154,1,139,165,140,114,226,118,254,207,206,249,169,136,211,152,182,83,203"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/7'/0/0",
      address: "bc1qhtmq755ahfp2y4hfgndqtwpgjwaa552cnq2hdm",
      privateKeyWIF: "L4zmSmruJrsF22T5284M69fPjjDJVEirMUfXRDEVuKhfo3GsgN3n",
      privateKeyHex: "232,10,87,182,187,14,230,245,196,120,66,175,101,43,23,3,23,7,11,39,119,250,187,82,94,30,230,197,222,239,196,225",
      publicKey: "2,214,84,111,241,131,165,96,240,215,212,221,143,204,165,64,109,35,81,120,118,37,61,241,160,152,235,106,36,122,141,219,93"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/7'/0/0",
      address: "bc1pl5wpsspfz2rjh4w8jvwjucqwvc8l38j22eyva5hygzrjh7ea2tasc745mn",
      privateKeyWIF: "L5TSESsmRckkKg2sBuew8p8Y9pMGeN2GV2rP51CpQ4XPdKK6CtLE",
      privateKeyHex: "245,194,131,69,187,93,96,92,179,73,194,192,111,117,59,160,210,37,225,36,162,62,88,12,180,125,209,186,20,194,130,57",
      publicKey: "3,233,106,101,100,51,215,246,110,10,31,206,94,10,150,68,104,139,21,2,134,111,154,81,14,242,209,176,215,25,168,71,183",
      internalPubkey: "233,106,101,100,51,215,246,110,10,31,206,94,10,150,68,104,139,21,2,134,111,154,81,14,242,209,176,215,25,168,71,183"
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
// const wallet = require('./8-bank.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
