/**
 * 🏦 BANK - Complete Bitcoin Wallet
 * Rezervă bancară
 * Generated: 2025-10-25T19:32:28.964Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "BANK",
  emoji: "🏦",
  description: "Rezervă bancară",
  index: 7,

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
      path: "m/44'/0'/7'/0/0",
      address: "1KdxGM49Mw8UhxkREFftWgAKvWYo91G4BW",
      privateKeyWIF: "KxRV4YiH77uLzP3xZEsYntbgceh4KhB82QmQZJuSvkLW1Yvnja7P",
      privateKeyHex: "35,228,238,34,121,234,54,139,52,25,119,207,26,109,65,103,123,5,251,31,89,122,252,90,214,204,220,210,194,136,64,232",
      publicKey: "3,91,56,118,14,16,190,245,102,239,175,55,160,77,56,52,157,81,157,70,161,101,252,207,13,131,174,223,150,199,55,221,119"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/7'/0/0",
      address: "3Af3N4TBTcUrqUSrqVPZSfujizjoVXmanz",
      privateKeyWIF: "Kyw7GAZ8X5KreYaG8rRVqSvL9xq3GyYZx6XiszfytWgf4gKqPwGS",
      privateKeyHex: "80,248,176,15,153,204,203,175,182,167,5,161,176,177,170,0,110,119,58,16,69,109,251,158,39,28,3,113,177,91,246,135",
      publicKey: "3,29,234,189,164,214,252,23,52,248,217,60,172,87,68,131,159,98,239,178,23,176,56,63,125,98,18,143,86,174,112,146,8"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/7'/0/0",
      address: "33kqbvTkHp7B94i9jPgWSqA9EssttPvw4E",
      privateKeyWIF: "Kyw7GAZ8X5KreYaG8rRVqSvL9xq3GyYZx6XiszfytWgf4gKqPwGS",
      privateKeyHex: "80,248,176,15,153,204,203,175,182,167,5,161,176,177,170,0,110,119,58,16,69,109,251,158,39,28,3,113,177,91,246,135",
      publicKey: "3,29,234,189,164,214,252,23,52,248,217,60,172,87,68,131,159,98,239,178,23,176,56,63,125,98,18,143,86,174,112,146,8"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/7'/0/0",
      address: "bc1qlacgzc5x20nah9ch5ahy32pnwmj0e5mvquq6ql",
      privateKeyWIF: "Ky7ejU2UoVFcBQJzuWDyMDVqjnRpLcGEK4gpKSgnqQDYjJrhq25a",
      privateKeyHex: "56,142,187,183,13,189,92,13,9,173,115,24,161,61,81,85,190,5,193,81,102,255,48,47,174,32,185,235,194,230,46,42",
      publicKey: "2,148,17,20,26,254,118,22,147,140,111,162,180,206,170,134,57,34,34,19,139,104,193,141,214,252,97,33,247,175,70,196,171"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/7'/0/0",
      address: "bc1px4lvfjgt09496s65fahchhsr4kyf5lvvgsmg9y3keunrgmhuf8hsexe2d8",
      privateKeyWIF: "KxjxvGXWv19JN7zvo7QEQTLtBJvkCYUrxQckoYN3x2xdTN2wvd5k",
      privateKeyHex: "45,102,182,150,236,164,177,46,120,213,168,167,160,131,96,80,28,146,162,252,55,102,94,228,94,19,252,56,98,53,29,108",
      publicKey: "2,66,244,98,42,33,232,235,253,134,230,111,248,121,25,48,249,151,138,125,63,182,96,34,116,3,237,192,236,126,219,171,196",
      internalPubkey: "66,244,98,42,33,232,235,253,134,230,111,248,121,25,48,249,151,138,125,63,182,96,34,116,3,237,192,236,126,219,171,196"
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
