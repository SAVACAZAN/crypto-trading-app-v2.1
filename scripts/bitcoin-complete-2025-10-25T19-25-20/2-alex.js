/**
 * 👨 ALEX - Complete Bitcoin Wallet
 * Wallet personal Alex
 * Generated: 2025-10-25T19:25:20.483Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "ALEX",
  emoji: "👨",
  description: "Wallet personal Alex",
  index: 1,

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
      path: "m/44'/0'/1'/0/0",
      address: "1JkbDAUAx1UPNyXNJbQnWPEE4H4TAJQV38",
      privateKeyWIF: "KyMiXjD33LuQo66zqMZzBzsPzKCa7S4tpENasj2bLmTsEmfFLnNZ",
      privateKeyHex: "63,203,25,255,33,197,8,180,32,191,194,233,70,179,40,171,103,68,158,201,156,67,175,212,31,105,154,33,45,4,237,84",
      publicKey: "2,24,220,49,98,88,238,75,58,163,234,74,35,48,126,29,62,28,254,124,187,132,126,166,3,25,46,114,2,18,158,0,72"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/1'/0/0",
      address: "36H4rfW2LVcaR9vWsBhR8ZJwdxqGPG8tbf",
      privateKeyWIF: "KxxjyYBHvfxCkpLRKtEvkHzMHsfXnS69L5AGktYWLu8PmjfsxpMs",
      privateKeyHex: "51,249,95,85,146,54,143,55,34,217,87,55,126,82,86,32,252,65,203,82,184,45,45,143,223,221,59,233,143,9,190,158",
      publicKey: "2,153,125,97,231,11,110,78,165,250,43,210,153,42,75,170,87,76,13,20,183,181,30,189,29,16,182,186,106,56,60,42,254"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/1'/0/0",
      address: "3EriCLq8EB2N9WXcMqwngypnNoz3wUsLbC",
      privateKeyWIF: "KxxjyYBHvfxCkpLRKtEvkHzMHsfXnS69L5AGktYWLu8PmjfsxpMs",
      privateKeyHex: "51,249,95,85,146,54,143,55,34,217,87,55,126,82,86,32,252,65,203,82,184,45,45,143,223,221,59,233,143,9,190,158",
      publicKey: "2,153,125,97,231,11,110,78,165,250,43,210,153,42,75,170,87,76,13,20,183,181,30,189,29,16,182,186,106,56,60,42,254"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/1'/0/0",
      address: "bc1qhr0ugcuggf29v76vtp0qlksgh8sta5mnz9eyer",
      privateKeyWIF: "L5Ru25daJcrwAPzUE3mopxhpnM3JafTM7tR5Ddw4NMztcjmDzAKt",
      privateKeyHex: "244,247,241,122,62,56,54,117,197,115,159,77,147,150,32,98,184,119,156,155,143,104,141,185,119,197,198,131,31,54,145,238",
      publicKey: "3,241,238,107,32,87,251,78,203,247,176,180,155,19,211,106,246,115,1,105,121,151,255,86,31,35,154,221,86,24,61,255,96"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/1'/0/0",
      address: "bc1ppu6m7fwu5658glxs3j2hv8al7ktxx63j83cquhwunv4h2d8s2p0qp8zw4f",
      privateKeyWIF: "L1SuLdzRzQutLN3oZ1MhT9b8Uwpom5pGkzKPvFqpoxzndgZf8rEt",
      privateKeyHex: "126,34,223,44,104,57,98,203,122,99,45,226,147,22,165,161,84,37,224,60,9,106,89,20,92,6,153,142,227,119,137,20",
      publicKey: "2,32,236,254,169,250,4,197,180,189,249,165,233,48,116,196,147,195,226,214,11,213,57,64,154,241,95,202,232,128,147,206,239",
      internalPubkey: "32,236,254,169,250,4,197,180,189,249,165,233,48,116,196,147,195,226,214,11,213,57,64,154,241,95,202,232,128,147,206,239"
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
