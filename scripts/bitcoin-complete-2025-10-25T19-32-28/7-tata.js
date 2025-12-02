/**
 * 👴 TATA - Complete Bitcoin Wallet
 * Wallet pentru tată
 * Generated: 2025-10-25T19:32:28.963Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "TATA",
  emoji: "👴",
  description: "Wallet pentru tată",
  index: 6,

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
      path: "m/44'/0'/6'/0/0",
      address: "1F49EFE9YcKPy2vAkpfWm9TuQmojrzGoeJ",
      privateKeyWIF: "Kxo4EzLbb3QqzVCX4uLHGemjYVK6kotTYgSxZ1fx1cateo2vsFNp",
      privateKeyHex: "46,253,227,53,141,81,49,85,101,31,21,83,61,199,110,233,163,130,20,241,239,145,232,39,51,117,2,246,157,238,147,80",
      publicKey: "2,185,223,203,103,226,49,120,145,126,170,148,161,51,8,124,56,78,71,18,205,174,18,138,249,224,17,94,104,100,208,60,40"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/6'/0/0",
      address: "31rPx3eLQQobf4C5GyM36eYfjNrXyKCJGi",
      privateKeyWIF: "KxYfdXW4dwZ7KQEZH1byt9NN8XLp17TckfBNvsyfyu64BRf1kdq4",
      privateKeyHex: "39,150,204,217,111,75,130,27,92,171,27,142,79,41,151,124,145,122,23,244,37,228,194,85,41,187,237,204,228,1,97,89",
      publicKey: "3,160,237,170,134,54,142,220,201,223,92,41,54,27,76,165,241,169,75,252,234,234,53,80,116,85,107,51,18,8,109,42,240"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/6'/0/0",
      address: "3AawCy25cNUCRckYSvPxLoPGZDo9RR4B5d",
      privateKeyWIF: "KxYfdXW4dwZ7KQEZH1byt9NN8XLp17TckfBNvsyfyu64BRf1kdq4",
      privateKeyHex: "39,150,204,217,111,75,130,27,92,171,27,142,79,41,151,124,145,122,23,244,37,228,194,85,41,187,237,204,228,1,97,89",
      publicKey: "3,160,237,170,134,54,142,220,201,223,92,41,54,27,76,165,241,169,75,252,234,234,53,80,116,85,107,51,18,8,109,42,240"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/6'/0/0",
      address: "bc1qt98l5mjllngwqq8luwvragnmnegly7uev7cn9x",
      privateKeyWIF: "L4fg1dUbTxmFnk957YtBBviViY3x1nHYbtJvR3z5XBZwCW2UuuVs",
      privateKeyHex: "222,55,199,130,100,118,175,37,145,159,126,242,216,198,205,187,18,177,168,133,155,194,104,101,209,149,55,3,109,49,59,137",
      publicKey: "2,24,72,71,233,99,114,126,108,116,227,117,20,159,253,13,92,100,136,33,215,148,72,214,186,110,121,140,156,9,46,246,184"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/6'/0/0",
      address: "bc1p6q8njjjq66e59ytz0lq0acv6qftt7tneslj7hxauslhfn2ck25mq34fagh",
      privateKeyWIF: "KzkhckAVhxLn26ohoVYC3zXE9awmPw4w1of5vKEAq2Bk9R4Z9rc5",
      privateKeyHex: "105,116,105,57,172,24,10,142,36,15,188,67,184,206,84,125,54,130,36,201,166,126,209,220,243,166,213,214,51,91,137,97",
      publicKey: "3,46,99,199,141,236,205,14,165,139,140,181,3,44,158,5,17,134,129,89,58,106,217,154,156,48,194,23,89,201,219,161,174",
      internalPubkey: "46,99,199,141,236,205,14,165,139,140,181,3,44,158,5,17,134,129,89,58,106,217,154,156,48,194,23,89,201,219,161,174"
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
