/**
 * 👨‍💼 ADI - Complete Bitcoin Wallet
 * Wallet personal Adi
 * Generated: 2025-10-25T19:24:59.021Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "ADI",
  emoji: "👨‍💼",
  description: "Wallet personal Adi",
  index: 4,

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
      path: "m/44'/0'/4'/0/0",
      address: "13hPCX2A6Gxa182ZMobzjV3BEtU2TxQJkD",
      privateKeyWIF: "L4MKPaHGNiJpUsEnb5FRZfA5CWPX1UYMv4fMsnkrDqWZJpLcADSM",
      privateKeyHex: "212,198,108,248,55,8,173,0,72,9,32,84,205,110,141,22,17,24,148,101,150,80,8,56,7,151,74,71,87,27,92,167",
      publicKey: "3,247,255,55,171,217,126,195,253,161,2,135,101,66,33,208,71,218,22,166,39,90,230,37,9,153,199,211,119,139,137,174,148"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/4'/0/0",
      address: "3BPMF9b7KKWTg7FQHZT7RVZyEhck2YPu94",
      privateKeyWIF: "L5ai3Zi4uH7BsxhbCiMoStM1x6C2nywtg7Pjnf8qzJWgJsSHtnvX",
      privateKeyHex: "249,128,74,21,18,38,217,128,14,171,168,193,213,159,73,61,157,56,214,27,215,139,82,125,181,90,178,227,111,215,86,4",
      publicKey: "2,96,20,50,19,161,73,35,124,3,139,173,194,58,139,234,238,181,137,125,89,194,148,215,224,118,191,32,140,239,55,109,172"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/4'/0/0",
      address: "35dxNVMDvBYKGRzqGuRNQLYuVPMBvSPjNN",
      privateKeyWIF: "L5ai3Zi4uH7BsxhbCiMoStM1x6C2nywtg7Pjnf8qzJWgJsSHtnvX",
      privateKeyHex: "249,128,74,21,18,38,217,128,14,171,168,193,213,159,73,61,157,56,214,27,215,139,82,125,181,90,178,227,111,215,86,4",
      publicKey: "2,96,20,50,19,161,73,35,124,3,139,173,194,58,139,234,238,181,137,125,89,194,148,215,224,118,191,32,140,239,55,109,172"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/4'/0/0",
      address: "bc1q2szxed5s0mjjn87mkgxgrhk5gy45fmjsldrqd8",
      privateKeyWIF: "L3Qh4xjjyTSSR3aZpbEg3dmPR1hCmKJZv7cFrmc3LHoMRDqdZdZW",
      privateKeyHex: "184,172,93,141,196,77,235,42,141,136,138,61,122,43,34,135,36,184,226,251,88,13,190,39,30,236,196,218,84,186,137,51",
      publicKey: "2,10,60,251,71,152,242,248,18,218,246,195,119,208,112,17,172,31,170,234,210,43,90,155,31,186,136,151,28,16,73,213,73"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/4'/0/0",
      address: "bc1p6zpge4her9x8wn0gjygwp9sv4t9jkdn4dw33xn9lyj7qp59r50gsgj3hq0",
      privateKeyWIF: "Kz7Qzw5xPEK1AHnXdyaYWDtA8F5Vopc3fBk7tcRpBq8JTK2vWJSg",
      privateKeyHex: "86,69,236,111,60,189,43,86,89,111,174,219,87,134,65,135,55,127,161,128,7,9,113,91,13,204,204,150,99,114,43,233",
      publicKey: "3,154,50,71,103,219,46,112,212,195,72,126,65,60,227,247,237,98,9,15,31,172,69,21,111,144,122,11,149,161,155,203,0",
      internalPubkey: "154,50,71,103,219,46,112,212,195,72,126,65,60,227,247,237,98,9,15,31,172,69,21,111,144,122,11,149,161,155,203,0"
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
// const wallet = require('./5-adi.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
