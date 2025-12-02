/**
 * 💰 SAVACAZAN - Complete Bitcoin Wallet
 * Pentru economii
 * Generated: 2025-10-25T18:19:14.482Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "SAVACAZAN",
  emoji: "💰",
  description: "Pentru economii",
  index: 0,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/0'/0/0",
      address: "12qfoiTVbNiWGib8wG6dUG5bSWXV6S2QX9",
      privateKeyWIF: "Ky6aNFLLTgKnzLZmEyJyaMfNtvxiTBQnJvV2yzUk9FKz2GuGnPUB",
      privateKeyHex: "56,1,31,189,181,224,13,84,152,60,45,242,180,23,103,71,221,23,66,211,187,192,145,88,104,56,187,24,63,140,67,137",
      publicKey: "2,95,113,15,72,36,5,58,0,127,0,183,98,72,2,97,154,137,26,85,177,49,55,53,45,64,113,238,108,221,219,70,233"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/0'/0/0",
      address: "3MgEvu5SNjWb9vibLZ6Kpzsjt58mgRjyax",
      privateKeyWIF: "L1hQ8hxwSNVAibcVrSBBwWw3wA6fMqHDHAiFbYAcjxzeu3kQ2keT",
      privateKeyHex: "133,151,255,128,86,189,137,221,14,27,65,26,147,124,44,37,67,117,253,92,127,61,247,186,83,0,253,93,124,235,95,202",
      publicKey: "3,113,228,152,184,169,10,142,29,111,204,86,30,227,91,24,222,3,132,39,254,106,112,112,118,196,53,202,50,225,29,213,92"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/0'/0/0",
      address: "37rWYPbAXhutfyDRsBVLbCRJ48qnYAorZZ",
      privateKeyWIF: "L1hQ8hxwSNVAibcVrSBBwWw3wA6fMqHDHAiFbYAcjxzeu3kQ2keT",
      privateKeyHex: "133,151,255,128,86,189,137,221,14,27,65,26,147,124,44,37,67,117,253,92,127,61,247,186,83,0,253,93,124,235,95,202",
      publicKey: "3,113,228,152,184,169,10,142,29,111,204,86,30,227,91,24,222,3,132,39,254,106,112,112,118,196,53,202,50,225,29,213,92"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/0'/0/0",
      address: "bc1qw9acesl3feqf2494zhtpxta38r7fel088pznlk",
      privateKeyWIF: "L5LV515HAMa57BbExZTi1YZqsaPrLfvEeKkgfrHVt4zjTo88ncnz",
      privateKeyHex: "242,47,21,12,248,230,3,113,201,62,59,142,223,204,19,247,55,93,45,42,173,29,246,245,111,131,148,74,175,195,51,26",
      publicKey: "2,86,226,135,165,164,1,26,36,218,234,210,214,60,64,102,157,214,117,105,92,208,80,113,51,147,94,113,122,212,228,51,237"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/0'/0/0",
      address: "bc1p4ajl5z5amzat0202hrz62wunyf8g9p0tv5yw9s2kxds6yk02qysqvs08ss",
      privateKeyWIF: "KyFbpFn1D3kHZhauagkYVrVdpsGtKDEZzs8Eb6zTDunn2ctQcryi",
      privateKeyHex: "60,165,173,121,84,33,32,200,38,41,185,50,57,220,178,72,47,61,194,158,170,122,33,123,131,63,76,78,121,121,7,255",
      publicKey: "3,239,47,146,210,135,187,255,70,160,1,191,202,203,51,46,0,193,209,199,105,68,98,192,140,235,110,254,220,181,150,129,67",
      internalPubkey: "239,47,146,210,135,187,255,70,160,1,191,202,203,51,46,0,193,209,199,105,68,98,192,140,235,110,254,220,181,150,129,67"
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
