/**
 * 💰 SAVACAZAN - Complete Bitcoin Wallet
 * Pentru economii
 * Generated: 2025-10-25T19:32:28.950Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "SAVACAZAN",
  emoji: "💰",
  description: "Pentru economii",
  index: 0,

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
      path: "m/44'/0'/0'/0/0",
      address: "122ZbQgMrKeVRDxWuDe4YvpZ3AZuZ7Sh5x",
      privateKeyWIF: "Kx4yR4jwVVEX7QdtFBVZyrE5yUkUMUP9zzQc91E1g1E3Axpympid",
      privateKeyHex: "25,87,177,96,134,142,186,140,165,49,148,173,47,152,148,38,10,230,42,214,196,254,5,18,111,141,110,25,212,248,94,170",
      publicKey: "3,159,73,143,10,30,121,205,131,135,0,5,235,92,100,59,61,198,36,162,95,100,149,209,109,173,34,207,152,102,95,72,10"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/0'/0/0",
      address: "3NeYs9B2RaQo5w9fyvzhJN5icHtLF2yz2o",
      privateKeyWIF: "L4PMD4uzM7b1n2fmkgM5kddarjEaBgHYZ1ksgnuNCR4YJEBTnP1z",
      privateKeyHex: "213,209,242,162,80,97,141,178,60,34,113,27,117,205,98,190,228,161,65,200,239,67,28,192,147,183,18,203,173,188,236,115",
      publicKey: "3,199,222,246,1,103,195,235,160,115,148,141,52,233,148,64,222,144,95,121,98,25,254,16,105,90,156,233,114,98,133,196,234"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/0'/0/0",
      address: "3Q5JHjARb8eGx7XaeygscHfcpspTrF3hgW",
      privateKeyWIF: "L4PMD4uzM7b1n2fmkgM5kddarjEaBgHYZ1ksgnuNCR4YJEBTnP1z",
      privateKeyHex: "213,209,242,162,80,97,141,178,60,34,113,27,117,205,98,190,228,161,65,200,239,67,28,192,147,183,18,203,173,188,236,115",
      publicKey: "3,199,222,246,1,103,195,235,160,115,148,141,52,233,148,64,222,144,95,121,98,25,254,16,105,90,156,233,114,98,133,196,234"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/0'/0/0",
      address: "bc1qx28v9rm074c4x9suffnrw0xk8d4g89ny3h5zvn",
      privateKeyWIF: "L1RRUX27qTgzu9n86tCPx8yS1rHoxAvucMttvFeVsY7Ziws1n2S6",
      privateKeyHex: "125,95,232,31,197,104,194,216,191,120,185,131,151,225,207,2,182,16,15,25,170,47,179,24,102,184,139,134,77,31,213,38",
      publicKey: "2,51,33,34,134,87,174,243,246,108,254,18,167,166,85,43,252,2,5,188,80,204,121,16,83,49,202,166,46,62,47,151,46"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/0'/0/0",
      address: "bc1p6sysamvncy9qc6krhlzz4sxg0fvd85mfnujmda5tsqaae82r0f7s794kd6",
      privateKeyWIF: "KzB7myy3K6uMvnuYPSphLQ1mjuRNN7uWXjYwtr6tZK1JLdrFaoPR",
      privateKeyHex: "88,45,153,178,226,125,231,58,92,61,242,141,41,31,228,43,26,213,167,235,134,182,234,175,244,31,126,228,146,167,10,55",
      publicKey: "2,37,131,4,151,128,160,214,97,28,140,174,253,224,21,97,4,40,191,132,33,30,49,197,47,7,96,175,39,210,250,27,10",
      internalPubkey: "37,131,4,151,128,160,214,97,28,140,174,253,224,21,97,4,40,191,132,33,30,49,197,47,7,96,175,39,210,250,27,10"
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
// const wallet = require('./1-savacazan.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
