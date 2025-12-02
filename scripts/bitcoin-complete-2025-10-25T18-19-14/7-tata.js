/**
 * 👴 TATA - Complete Bitcoin Wallet
 * Wallet pentru tată
 * Generated: 2025-10-25T18:19:14.488Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "TATA",
  emoji: "👴",
  description: "Wallet pentru tată",
  index: 6,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/6'/0/0",
      address: "1N2CFCKHYw1KB4Ca7SYV7bEUcZU5spUjio",
      privateKeyWIF: "L4uM8NzmSRtbkWV2cVDEWL46u6pEoXDaQ4p2mVVqucn2G44Ay9gD",
      privateKeyHex: "229,64,165,169,9,252,211,128,115,133,86,178,239,100,203,25,78,26,208,9,14,83,223,216,133,208,134,221,248,221,2,194",
      publicKey: "3,19,11,146,55,193,230,5,250,74,100,174,82,45,74,20,110,134,235,209,204,64,172,159,41,242,251,183,103,66,184,67,15"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/6'/0/0",
      address: "355LeCghyKHFFVg3TsKXCngnBmcSZgDCQJ",
      privateKeyWIF: "KzngdwMUjmYfER57ZbvkodP6fS482NcHj8Cc8UKqy8mxc5W26J4a",
      privateKeyHex: "106,121,148,77,98,66,159,60,220,157,207,197,237,51,215,199,174,21,175,26,76,139,52,146,103,136,111,30,144,178,178,90",
      publicKey: "2,141,111,214,38,18,122,38,255,229,55,213,228,191,11,162,79,222,108,238,65,232,226,83,211,51,232,228,61,13,94,26,102"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/6'/0/0",
      address: "3FRsvoVSFRjoqLSReu6Pas13sAVReACwxy",
      privateKeyWIF: "KzngdwMUjmYfER57ZbvkodP6fS482NcHj8Cc8UKqy8mxc5W26J4a",
      privateKeyHex: "106,121,148,77,98,66,159,60,220,157,207,197,237,51,215,199,174,21,175,26,76,139,52,146,103,136,111,30,144,178,178,90",
      publicKey: "2,141,111,214,38,18,122,38,255,229,55,213,228,191,11,162,79,222,108,238,65,232,226,83,211,51,232,228,61,13,94,26,102"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/6'/0/0",
      address: "bc1q4c7y58etpzdtahzfh68qrfck25y0cw30p62006",
      privateKeyWIF: "KzAzNhF8dTdduTZmNTGj3R9wQtaGfgoTwkpYWCfARguVMu9V1gkT",
      privateKeyHex: "88,28,203,88,191,145,202,190,124,2,144,49,100,66,38,193,150,18,5,25,197,207,87,81,35,10,251,3,231,101,248,37",
      publicKey: "3,78,220,209,144,54,149,254,150,175,187,51,75,16,184,101,7,226,72,51,154,198,150,88,64,239,70,255,72,48,185,211,191"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/6'/0/0",
      address: "bc1pytzzsg5j264ufa257mp90ppr2lxrf44xzxq36t42ls960u7jsayq53xk3g",
      privateKeyWIF: "L3ZrYNvJg4iysPuoaeCzVCvM9scGSNbfUeDyAgpCTWi1uCZvfFf9",
      privateKeyHex: "189,99,35,165,51,89,100,114,87,48,72,200,162,238,129,230,130,67,231,133,94,201,244,57,220,53,80,153,79,10,97,210",
      publicKey: "3,149,200,85,90,163,239,62,197,245,187,31,236,132,196,142,191,23,112,196,33,167,79,9,192,128,158,180,224,10,157,10,122",
      internalPubkey: "149,200,85,90,163,239,62,197,245,187,31,236,132,196,142,191,23,112,196,33,167,79,9,192,128,158,180,224,10,157,10,122"
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
// const wallet = require('./7-tata.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
