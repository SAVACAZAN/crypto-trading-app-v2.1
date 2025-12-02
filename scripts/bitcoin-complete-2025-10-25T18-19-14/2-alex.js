/**
 * 👨 ALEX - Complete Bitcoin Wallet
 * Wallet personal Alex
 * Generated: 2025-10-25T18:19:14.483Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "ALEX",
  emoji: "👨",
  description: "Wallet personal Alex",
  index: 1,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/1'/0/0",
      address: "16UEduRuy4sHkHfQtGpuCP8Yi1T1fgunv",
      privateKeyWIF: "KyyVUp7MoodmumWcuaBfRyYGGc4UsBxEARYwqJLkkhPVbB8sbjgp",
      privateKeyHex: "82,50,135,92,93,217,180,137,18,117,142,42,127,224,39,205,77,44,164,170,140,15,109,74,223,112,166,90,192,219,107,198",
      publicKey: "3,176,38,89,34,237,127,27,135,44,151,60,219,127,98,142,69,208,223,36,192,253,197,70,166,158,224,199,224,159,181,115,199"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/1'/0/0",
      address: "3LYyuPUcSpfLJsaZfWS1XhZaSTBzD5HG8L",
      privateKeyWIF: "KxTZdabW8Uq3Zxgmr1oST3NfMWiEZJ7nwuP5WBryGJP2xkmDgKMg",
      privateKeyHex: "36,246,178,180,190,161,243,97,92,115,2,207,13,60,130,150,200,49,71,130,188,128,226,43,225,135,132,152,216,62,184,217",
      publicKey: "3,114,190,152,93,15,198,147,168,194,27,48,62,250,4,12,63,204,88,83,66,194,14,69,5,60,99,40,27,218,100,162,169"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/1'/0/0",
      address: "33zVPAZe9frUv9zdwBa4JXQozujcZgKieE",
      privateKeyWIF: "KxTZdabW8Uq3Zxgmr1oST3NfMWiEZJ7nwuP5WBryGJP2xkmDgKMg",
      privateKeyHex: "36,246,178,180,190,161,243,97,92,115,2,207,13,60,130,150,200,49,71,130,188,128,226,43,225,135,132,152,216,62,184,217",
      publicKey: "3,114,190,152,93,15,198,147,168,194,27,48,62,250,4,12,63,204,88,83,66,194,14,69,5,60,99,40,27,218,100,162,169"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/1'/0/0",
      address: "bc1qh465jrgu6apu9d086u2p2ayutx02e2s0nvdkhm",
      privateKeyWIF: "KzkfGbinjRRajdVQDr6V47RkpUeZ6WBTaYNjUPq256JeqXVNt7JA",
      privateKeyHex: "105,111,20,196,61,174,80,93,217,16,84,246,125,243,95,123,68,123,251,47,45,67,201,34,240,106,79,58,219,122,98,191",
      publicKey: "3,7,193,174,91,41,134,207,198,114,255,153,207,208,45,191,221,3,29,124,141,94,140,15,68,153,69,65,112,12,15,70,39"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/1'/0/0",
      address: "bc1phwruvu5jdaex9gfjfrza7as3xxt5adfj4agj49tfskecm9cvkkgsymq7hp",
      privateKeyWIF: "L2pPboe1t1kpaicGg5td9Fc9qtrAHdSsnXVp2uPUy7zygC1NL8ow",
      privateKeyHex: "167,7,8,210,241,188,129,173,55,73,22,85,200,117,91,17,140,93,127,76,178,190,27,251,235,140,27,86,255,36,197,11",
      publicKey: "3,126,244,232,139,198,110,236,69,105,254,216,69,243,125,135,222,183,123,41,200,26,114,3,147,253,208,87,117,197,95,210,62",
      internalPubkey: "126,244,232,139,198,110,236,69,105,254,216,69,243,125,135,222,183,123,41,200,26,114,3,147,253,208,87,117,197,95,210,62"
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
