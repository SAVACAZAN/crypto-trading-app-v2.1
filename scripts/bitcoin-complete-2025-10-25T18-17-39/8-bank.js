/**
 * 🏦 BANK - Complete Bitcoin Wallet
 * Rezervă bancară
 * Generated: 2025-10-25T18:17:39.251Z
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
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/7'/0/0",
      address: "1Pyr1xcGjL3ZwTP7GiSvMjuXVh5RCZELgp",
      privateKeyWIF: "KxZAb9kUe4tBwwZu8j7Yui5NHKjs1nvFw6t8modz2f8UUL7f9zYF",
      privateKeyHex: "39,216,142,37,156,13,47,163,246,12,9,91,72,226,221,167,85,242,203,96,159,221,51,15,5,129,159,197,72,13,245,25",
      publicKey: "2,226,152,137,175,89,98,56,75,66,71,203,106,140,175,83,109,69,73,117,18,82,48,96,68,157,107,119,13,192,255,170,177"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/7'/0/0",
      address: "34bwpyHieQg9yFYCPh59HpvRzeM199XcnJ",
      privateKeyWIF: "KwLRvbHNGHYXLh5HtMD2eSYqSt3DqKCHpSRpPMxMQqduDe68PuH7",
      privateKeyHex: "3,116,243,240,109,106,164,50,219,227,15,111,250,176,190,137,37,5,128,152,30,147,175,119,16,235,233,40,233,25,79,215",
      publicKey: "2,234,16,191,168,179,83,177,27,166,174,227,201,222,26,21,189,228,169,158,194,107,79,91,83,216,4,40,42,17,251,71,30"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/7'/0/0",
      address: "38URiLjpAMENy7g2qQuuE5qewD39zyfSgC",
      privateKeyWIF: "KwLRvbHNGHYXLh5HtMD2eSYqSt3DqKCHpSRpPMxMQqduDe68PuH7",
      privateKeyHex: "3,116,243,240,109,106,164,50,219,227,15,111,250,176,190,137,37,5,128,152,30,147,175,119,16,235,233,40,233,25,79,215",
      publicKey: "2,234,16,191,168,179,83,177,27,166,174,227,201,222,26,21,189,228,169,158,194,107,79,91,83,216,4,40,42,17,251,71,30"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/7'/0/0",
      address: "bc1q8ugfwhgw2xmjul8zt50fy6v75z3q4x94yh0uqf",
      privateKeyWIF: "KyQLcHfdQqu3V2gd7Sn4cyuqvdqGitQ5vcXcDWUQ7AKEL1QjzVfL",
      privateKeyHex: "65,36,106,38,82,135,103,21,183,94,225,142,27,129,163,170,212,255,8,54,246,247,158,7,131,251,167,211,48,78,98,34",
      publicKey: "2,227,55,98,133,118,199,58,120,188,250,7,187,88,163,232,233,221,143,134,192,224,73,160,62,168,255,137,16,140,8,232,241"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/7'/0/0",
      address: "bc1pw7ww8uzxp7tdfh7s7pez3fcmqvr8fquvy8h7srpnp5a5twy4q8gsp8yptg",
      privateKeyWIF: "L3kogtxjq9FZodTsNAvmpxRrdj6tfaCcYpGxezzy7vhHsiCki9Gb",
      privateKeyHex: "195,5,81,97,26,25,9,47,148,35,227,189,126,31,223,116,60,152,40,0,237,118,46,168,174,130,34,84,191,55,154,221",
      publicKey: "3,80,104,67,214,252,69,83,200,138,188,80,99,73,154,178,127,173,14,143,145,178,179,126,21,152,253,20,65,53,60,187,222",
      internalPubkey: "80,104,67,214,252,69,83,200,138,188,80,99,73,154,178,127,173,14,143,145,178,179,126,21,152,253,20,65,53,60,187,222"
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
