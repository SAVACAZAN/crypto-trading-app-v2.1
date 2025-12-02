/**
 * 👴 TATA - Complete Bitcoin Wallet
 * Wallet pentru tată
 * Generated: 2025-10-25T19:25:20.490Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "TATA",
  emoji: "👴",
  description: "Wallet pentru tată",
  index: 6,

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
      path: "m/44'/0'/6'/0/0",
      address: "1J8bhNJAA1zZMerPGGNhG8qusvdst5Ursx",
      privateKeyWIF: "L1nY2bjhZS1hQu1hXPmi81zQvgieQJHkvFDPBw4zHGh5ackBkkwd",
      privateKeyHex: "136,60,103,135,129,67,191,249,254,217,192,89,68,177,49,164,99,207,227,112,250,88,53,21,203,44,59,39,178,6,231,254",
      publicKey: "3,53,211,42,54,26,25,36,86,111,50,212,37,245,21,124,21,174,172,196,169,145,128,118,216,165,224,249,94,146,108,155,108"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/6'/0/0",
      address: "37hiUXM7VruHTXytTj6daLrz4v6QK3BiT8",
      privateKeyWIF: "KzK6UGf2kBp6kJLk8dCGPk2ZjUB5LYTd3Nmc5Xw7q2ZH2Shy7Bjp",
      privateKeyHex: "92,72,52,130,108,228,221,10,196,22,197,190,123,155,198,15,127,75,25,117,0,27,163,2,221,231,96,152,243,138,38,79",
      publicKey: "3,216,96,185,243,124,255,77,24,170,114,8,141,225,255,110,126,225,34,189,138,55,151,237,29,244,92,163,56,99,29,210,90"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/6'/0/0",
      address: "3347PnF4cyJVBW8f71A54px5ovatdwc2Je",
      privateKeyWIF: "KzK6UGf2kBp6kJLk8dCGPk2ZjUB5LYTd3Nmc5Xw7q2ZH2Shy7Bjp",
      privateKeyHex: "92,72,52,130,108,228,221,10,196,22,197,190,123,155,198,15,127,75,25,117,0,27,163,2,221,231,96,152,243,138,38,79",
      publicKey: "3,216,96,185,243,124,255,77,24,170,114,8,141,225,255,110,126,225,34,189,138,55,151,237,29,244,92,163,56,99,29,210,90"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/6'/0/0",
      address: "bc1qvmxmgf3r5k53nutvyv420cpnmgvl4qgxwgl77j",
      privateKeyWIF: "KzPURXWzgLYrAx9mcgtR3hFXT8V2qGAi34uoCqn4JayWVYsTxkp1",
      privateKeyHex: "94,136,213,245,54,39,159,144,114,225,116,213,73,141,113,237,30,26,37,249,112,197,40,47,155,114,97,121,61,217,26,154",
      publicKey: "2,164,233,105,209,21,62,53,25,133,49,246,161,234,209,85,6,49,148,208,61,160,228,86,67,136,57,115,252,210,164,253,228"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/6'/0/0",
      address: "bc1pwxggw3g88j9x0yun5z4m2ttluwcqs0gqj6v74s9zqw2cypax6zfqcwx88p",
      privateKeyWIF: "L5GVt2phYsWTNNn2hrq7VknGaW8EssEqYV7zhVZJtvq4ZEV4GztC",
      privateKeyHex: "240,34,35,150,129,67,165,11,215,167,14,184,21,30,255,99,39,31,225,68,18,53,255,51,129,94,125,201,183,61,12,25",
      publicKey: "3,229,183,138,93,86,65,34,75,90,202,103,212,219,13,144,58,107,114,130,255,173,116,181,67,242,85,76,221,244,151,63,178",
      internalPubkey: "229,183,138,93,86,65,34,75,90,202,103,212,219,13,144,58,107,114,130,255,173,116,181,67,242,85,76,221,244,151,63,178"
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
