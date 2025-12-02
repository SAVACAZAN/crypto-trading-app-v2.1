/**
 * 👧 MIRUNA - Complete Bitcoin Wallet
 * Wallet personal Miruna
 * Generated: 2025-10-25T19:24:59.020Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "MIRUNA",
  emoji: "👧",
  description: "Wallet personal Miruna",
  index: 2,

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
      path: "m/44'/0'/2'/0/0",
      address: "1BCt6D4j1QZk9jUVzFRJfUZfbopn4bE6s7",
      privateKeyWIF: "L2zzsxDGYq5GQmzAjhfMwbJjy6xJ1phfKFYnD8pzMEZitrNefm3A",
      privateKeyHex: "172,124,25,112,62,66,72,173,92,37,3,84,47,87,33,28,189,138,55,225,197,183,58,174,246,24,54,221,178,98,11,129",
      publicKey: "2,54,95,243,140,245,76,186,199,61,253,255,157,147,110,197,203,124,71,76,32,170,86,84,191,91,133,133,221,134,113,44,189"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/2'/0/0",
      address: "3LhCFyFk5F8qN6rtWYUumvAUHzQ7ZFrsQM",
      privateKeyWIF: "Kx3AwkHfUAnf2pD5MwpbXY6aCANEAadgjZBfJFYDvt3Y1nCMo9gH",
      privateKeyHex: "24,106,122,139,63,134,76,120,70,98,37,205,154,166,242,56,203,62,27,225,213,53,5,114,170,18,119,37,15,145,118,178",
      publicKey: "3,114,58,210,201,251,34,91,226,13,77,5,211,156,254,120,234,40,138,97,148,82,138,145,124,63,10,93,212,47,226,177,247"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/2'/0/0",
      address: "3FrrJ37PphvjVsBMUzJXZuXCj6oYnyB4fA",
      privateKeyWIF: "Kx3AwkHfUAnf2pD5MwpbXY6aCANEAadgjZBfJFYDvt3Y1nCMo9gH",
      privateKeyHex: "24,106,122,139,63,134,76,120,70,98,37,205,154,166,242,56,203,62,27,225,213,53,5,114,170,18,119,37,15,145,118,178",
      publicKey: "3,114,58,210,201,251,34,91,226,13,77,5,211,156,254,120,234,40,138,97,148,82,138,145,124,63,10,93,212,47,226,177,247"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/2'/0/0",
      address: "bc1q8ncfspj52ja4ge4xt67et67gykg80c6k4c6lcf",
      privateKeyWIF: "L3oiJVZ9X58PFqB3bAEfqLgJNGajfC5sQcCMSqucQrWsg7t44dQK",
      privateKeyHex: "196,132,45,13,218,114,250,20,18,246,188,96,119,126,4,208,14,71,129,28,74,127,209,238,56,28,178,221,20,225,6,235",
      publicKey: "2,68,14,242,171,144,45,83,204,99,227,229,255,23,69,54,167,188,45,157,212,241,198,0,250,38,224,217,213,157,85,18,245"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/2'/0/0",
      address: "bc1pdm8kra4c5sdxs9jhlq90fxgm0ya6hnj326c47emd7sxukym7vymqt7gqy2",
      privateKeyWIF: "KyYdA82z6vPgbRdEkEpYaZRK3VTLEiBHFa3aaY2ao6i11AZp1Fw1",
      privateKeyHex: "69,103,143,67,116,123,215,140,167,38,183,44,167,0,48,53,71,103,69,12,137,1,40,154,25,69,193,189,40,164,180,99",
      publicKey: "2,158,233,139,215,189,16,43,70,182,11,188,42,206,9,146,167,54,148,45,11,124,166,231,234,163,58,73,152,202,22,72,127",
      internalPubkey: "158,233,139,215,189,16,43,70,182,11,188,42,206,9,146,167,54,148,45,11,124,166,231,234,163,58,73,152,202,22,72,127"
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
// const wallet = require('./3-miruna.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
