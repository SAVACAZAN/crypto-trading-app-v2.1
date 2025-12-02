/**
 * 🔐 VAULT - Complete Bitcoin Wallet
 * Seif securizat
 * Generated: 2025-10-25T19:24:59.024Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "VAULT",
  emoji: "🔐",
  description: "Seif securizat",
  index: 8,

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
      path: "m/44'/0'/8'/0/0",
      address: "17argqvmseVRGWYSHX6B3sLEcc5zKpTYSp",
      privateKeyWIF: "L3tKgRPzZRdtjy4aSBb5BUERCCxwYUwhMS7z7CyoA42dLw4r61t2",
      privateKeyHex: "198,227,74,102,12,178,132,143,170,222,154,246,136,42,24,245,131,29,11,18,37,99,3,172,53,194,187,85,14,17,38,158",
      publicKey: "2,179,169,150,57,29,133,109,201,59,18,4,246,197,40,8,105,115,115,42,166,65,35,64,101,109,150,146,26,117,137,167,201"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/8'/0/0",
      address: "35TBoBYgA1m3S6PNeudGebfBsPvpT8Sx95",
      privateKeyWIF: "Kz6Gf5QpCdoSBySBPh5QqM4jEfZpDTqnaKZhNeSy4wbmJ6yVq6a5",
      privateKeyHex: "85,175,72,255,57,193,15,99,79,247,84,84,39,180,64,212,160,48,35,112,107,141,55,182,5,131,44,146,123,234,113,0",
      publicKey: "3,19,253,67,32,118,63,146,56,187,193,152,1,92,214,52,8,200,249,128,247,168,155,94,179,90,228,22,120,109,118,109,212"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/8'/0/0",
      address: "345g8HQE74xksyEV1SS3pz7yYXq1MBvTeF",
      privateKeyWIF: "Kz6Gf5QpCdoSBySBPh5QqM4jEfZpDTqnaKZhNeSy4wbmJ6yVq6a5",
      privateKeyHex: "85,175,72,255,57,193,15,99,79,247,84,84,39,180,64,212,160,48,35,112,107,141,55,182,5,131,44,146,123,234,113,0",
      publicKey: "3,19,253,67,32,118,63,146,56,187,193,152,1,92,214,52,8,200,249,128,247,168,155,94,179,90,228,22,120,109,118,109,212"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/8'/0/0",
      address: "bc1q76tetlf5kwwwmm55geydxdy2e2tj8egt7whylr",
      privateKeyWIF: "L1dzVgAVWBMsDeEPACpPnXKTcyv4LeesMBLu1Hwhnr9ezZXH7WLy",
      privateKeyHex: "131,215,60,89,57,196,176,146,157,49,33,169,105,225,96,217,5,54,30,217,99,219,71,138,26,61,34,108,18,159,7,40",
      publicKey: "2,103,107,72,255,134,114,91,103,242,168,141,44,8,3,60,156,40,246,143,141,117,213,12,8,48,187,184,57,189,103,126,209"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/8'/0/0",
      address: "bc1p2uka5kku5dyjcnzugksq0969sn62v4l4c7dwptumdr3ut2264shspw0w5j",
      privateKeyWIF: "Kxx7N6Vpq2h15FkASz2kC8oyJYtAvGAceo3VNSwPu8aaG8Dd7S4G",
      privateKeyHex: "51,166,62,17,196,150,217,225,9,209,222,222,54,175,180,140,56,58,234,92,31,116,40,111,96,35,192,131,11,71,80,49",
      publicKey: "2,200,154,192,160,19,243,88,83,2,121,212,58,158,11,159,168,199,227,6,86,153,116,39,231,145,197,58,13,248,244,118,98",
      internalPubkey: "200,154,192,160,19,243,88,83,2,121,212,58,158,11,159,168,199,227,6,86,153,116,39,231,145,197,58,13,248,244,118,98"
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
// const wallet = require('./9-vault.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
