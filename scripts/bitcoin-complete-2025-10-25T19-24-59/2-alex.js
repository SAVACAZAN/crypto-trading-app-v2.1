/**
 * 👨 ALEX - Complete Bitcoin Wallet
 * Wallet personal Alex
 * Generated: 2025-10-25T19:24:59.017Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "ALEX",
  emoji: "👨",
  description: "Wallet personal Alex",
  index: 1,

  // Mnemonic (shared across all wallets)
  mnemonic: "seminar float bitter normal come oppose syrup planet rule dad dilemma push",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "TestSecret123",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/1'/0/0",
      address: "1DE4fg4rMqSQk6orXpJnVAGddp7sXQZy3r",
      privateKeyWIF: "L2Me85UD7ernXiezxPuDgGfgtGnmG9wSLCKJFNgxk3tCbHcB3MbW",
      privateKeyHex: "153,68,54,184,135,217,108,111,127,106,174,132,40,223,59,139,40,139,144,0,98,52,17,108,33,188,79,221,221,43,191,132",
      publicKey: "2,54,231,109,17,158,7,149,17,83,49,226,10,213,55,172,67,41,50,180,15,42,219,252,85,19,181,168,59,250,17,161,231"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/1'/0/0",
      address: "37P6X9qRWh6Vcn1Q4AhDyn6s5uWh3RHFmf",
      privateKeyWIF: "Ky8MDFycxoA7iakQjr3vTVXYfMRn7gqmxQQa9NVSupCtaaKjW8Rr",
      privateKeyHex: "56,234,165,108,93,59,183,197,9,216,68,178,17,228,61,63,161,28,146,5,184,47,176,253,234,94,210,153,235,214,206,58",
      publicKey: "2,9,121,233,77,89,127,222,96,201,130,22,103,70,150,96,223,212,47,255,228,93,169,27,14,22,213,98,53,57,182,130,152"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/1'/0/0",
      address: "3M8NNRu8mik27YVKGCJsoaAhndn38to7gM",
      privateKeyWIF: "Ky8MDFycxoA7iakQjr3vTVXYfMRn7gqmxQQa9NVSupCtaaKjW8Rr",
      privateKeyHex: "56,234,165,108,93,59,183,197,9,216,68,178,17,228,61,63,161,28,146,5,184,47,176,253,234,94,210,153,235,214,206,58",
      publicKey: "2,9,121,233,77,89,127,222,96,201,130,22,103,70,150,96,223,212,47,255,228,93,169,27,14,22,213,98,53,57,182,130,152"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/1'/0/0",
      address: "bc1qcdg74z5xpj7zfvxjpcuxl9c9rekx0e7d0u4z64",
      privateKeyWIF: "L182EN9kviLBNu5xbScinj38QQWhmxk77auPExqojvo4dp66PeD1",
      privateKeyHex: "116,108,75,115,169,121,130,181,121,210,87,209,23,186,33,9,71,130,168,147,138,222,241,60,217,229,205,207,179,11,241,222",
      publicKey: "2,82,140,2,186,39,162,107,105,150,98,208,206,57,54,75,189,225,24,237,20,46,36,128,235,180,221,107,172,168,182,236,137"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/1'/0/0",
      address: "bc1pk8tej8ckzs9jq0jzmqhsc59vqep3ve0vk04p0790jhf72et73cvskm8sed",
      privateKeyWIF: "L2tewRS9cgyc6WXoT4veTWTFesCzCY8tgkk27g5U9GNhbhmv52hS",
      privateKeyHex: "169,56,165,107,112,115,70,205,14,170,241,187,182,186,96,189,0,135,233,55,98,12,255,204,219,113,102,138,139,184,2,15",
      publicKey: "2,136,153,227,75,43,227,81,84,204,174,156,249,70,214,151,213,91,20,70,21,244,62,109,247,75,251,222,173,4,48,76,39",
      internalPubkey: "136,153,227,75,43,227,81,84,204,174,156,249,70,214,151,213,91,20,70,21,244,62,109,247,75,251,222,173,4,48,76,39"
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
