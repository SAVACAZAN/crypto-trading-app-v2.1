/**
 * 🎯 EU - Complete Bitcoin Wallet
 * Wallet principal
 * Generated: 2025-10-25T19:25:20.517Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "EU",
  emoji: "🎯",
  description: "Wallet principal",
  index: 9,

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
      path: "m/44'/0'/9'/0/0",
      address: "12wwk3DXVp3mWP6GrDRFNs4p6DvgkJJjYZ",
      privateKeyWIF: "KzUHwYVgunMLpd7T4NayNbBZ9E9Et2F6HfNWLTt78WCaaPUARUb4",
      privateKeyHex: "97,3,131,183,206,59,138,30,10,142,104,153,178,207,166,246,199,63,155,42,224,225,233,103,65,29,10,48,209,88,23,34",
      publicKey: "2,208,222,98,211,30,176,161,133,224,45,11,64,103,108,245,201,69,49,153,26,141,53,68,61,67,231,38,94,95,199,73,171"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/9'/0/0",
      address: "3CeyFdt5sbrQ49joRxUUs93DjgUtbrMv82",
      privateKeyWIF: "L2myNvtBdLqY9mbpk5aqxGiu6pZFKFvkNdciG4pztp5wdo4WhNd6",
      privateKeyHex: "165,200,164,175,66,148,51,150,75,151,178,50,100,9,183,69,157,222,10,181,198,166,232,178,152,63,165,172,214,3,70,62",
      publicKey: "2,15,108,80,161,211,212,126,145,205,111,210,34,171,230,246,106,206,104,82,192,30,224,144,190,51,52,140,59,181,190,153,7"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/9'/0/0",
      address: "37xDyukCs1f3pe9s7N2PaA8Gj9hXD8UgQ3",
      privateKeyWIF: "L2myNvtBdLqY9mbpk5aqxGiu6pZFKFvkNdciG4pztp5wdo4WhNd6",
      privateKeyHex: "165,200,164,175,66,148,51,150,75,151,178,50,100,9,183,69,157,222,10,181,198,166,232,178,152,63,165,172,214,3,70,62",
      publicKey: "2,15,108,80,161,211,212,126,145,205,111,210,34,171,230,246,106,206,104,82,192,30,224,144,190,51,52,140,59,181,190,153,7"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/9'/0/0",
      address: "bc1qe8j54cen9l9gva9s8phfdkzg9y7e9flzesjgpp",
      privateKeyWIF: "L1hHo8yapRi8xjxGTsMhC6yN6LRAuFRC4JYP6613wtYMfgTbb9JT",
      privateKeyHex: "133,137,155,180,191,150,234,131,61,117,152,35,86,124,16,130,182,175,135,163,70,166,186,206,236,16,220,245,220,171,40,1",
      publicKey: "3,1,95,54,236,57,121,142,112,1,64,208,99,27,191,150,239,32,63,7,122,16,171,103,208,40,179,77,28,182,60,166,138"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/9'/0/0",
      address: "bc1p3tfkvrpt4uh99ht94pk2hxw8ydmr52y9h23jaw3dc6prxhy5cfdqstfrrn",
      privateKeyWIF: "KzKJPYJ6oL1GfXp8Z5W7R9FoSuSuNLY6MAnNU8ujsEFuneJSg44e",
      privateKeyHex: "92,99,68,116,14,115,168,28,218,59,10,119,190,150,154,128,210,191,247,16,97,195,169,17,35,95,4,74,195,222,121,134",
      publicKey: "2,43,208,44,2,17,232,3,152,85,228,61,196,225,223,38,154,241,12,212,167,31,0,138,64,244,190,161,33,77,168,151,106",
      internalPubkey: "43,208,44,2,17,232,3,152,85,228,61,196,225,223,38,154,241,12,212,167,31,0,138,64,244,190,161,33,77,168,151,106"
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
// const wallet = require('./10-eu.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
