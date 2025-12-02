/**
 * 👵 MAMA - Complete Bitcoin Wallet
 * Wallet pentru mamă
 * Generated: 2025-10-25T19:25:20.489Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "MAMA",
  emoji: "👵",
  description: "Wallet pentru mamă",
  index: 5,

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
      path: "m/44'/0'/5'/0/0",
      address: "1Pq4EuyHTAmuRtCjgHoQ5vGUS99rHLuWrZ",
      privateKeyWIF: "L4duewxfBXLySSNympqSxggJqqFRxbMEjSQ96RgRozUVQTuoKZiv",
      privateKeyHex: "221,79,93,191,235,114,211,53,22,181,32,217,214,253,249,210,135,39,250,15,146,136,159,101,163,99,13,199,95,31,177,122",
      publicKey: "3,125,151,81,154,5,251,54,121,19,40,238,126,90,230,24,163,58,250,214,189,46,248,200,23,74,130,47,157,186,195,227,138"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/5'/0/0",
      address: "3CV6UCZHJnjf4rfd91k6L76okubZ8ZT8KZ",
      privateKeyWIF: "L2Rs3adPbooVftB3u6bUmq1BGTSfLBsqDMRVP2V9nfADvJzdV1jV",
      privateKeyHex: "155,112,87,20,230,179,79,106,217,58,48,110,197,28,67,244,38,38,206,225,250,64,56,97,235,63,193,173,59,196,91,138",
      publicKey: "3,238,237,80,141,22,220,255,62,112,121,173,6,67,157,154,36,209,182,144,66,21,157,22,88,118,12,100,25,22,11,162,149"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/5'/0/0",
      address: "3LybTu8RDSfbfnAfKCyRECQxgjQULDjGeQ",
      privateKeyWIF: "L2Rs3adPbooVftB3u6bUmq1BGTSfLBsqDMRVP2V9nfADvJzdV1jV",
      privateKeyHex: "155,112,87,20,230,179,79,106,217,58,48,110,197,28,67,244,38,38,206,225,250,64,56,97,235,63,193,173,59,196,91,138",
      publicKey: "3,238,237,80,141,22,220,255,62,112,121,173,6,67,157,154,36,209,182,144,66,21,157,22,88,118,12,100,25,22,11,162,149"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/5'/0/0",
      address: "bc1qhxwwumayuz97flwf023shmadn2cn2qmufd0a7k",
      privateKeyWIF: "Kx48naFzidkEU7uwDbUtzxyM2WsnXk1YWtoDwKycBYhi6Ars4eeZ",
      privateKeyHex: "24,233,70,65,24,113,47,188,196,105,173,108,48,83,72,124,222,239,251,116,81,107,113,10,97,145,65,52,76,238,239,35",
      publicKey: "3,179,192,56,1,28,59,73,91,25,177,31,93,67,17,30,210,110,46,235,85,18,46,104,147,47,102,150,41,102,38,101,146"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/5'/0/0",
      address: "bc1pysxcuu3wc3dvcu6npyjd4046mrprwl5c5z6834jeyzvtxn0njfrsxhqepu",
      privateKeyWIF: "KxQuhRaddi1GUGZjmzGrRiqRQjdUfy2VfbnB84pxgJFjrwwpLEyR",
      privateKeyHex: "35,153,44,56,190,253,172,170,58,95,83,24,155,57,91,68,153,50,95,24,57,56,13,0,205,30,49,109,190,215,125,106",
      publicKey: "2,192,29,16,190,81,170,68,23,222,14,14,251,244,232,104,118,167,28,168,68,187,231,82,108,108,173,226,95,242,133,238,171",
      internalPubkey: "192,29,16,190,81,170,68,23,222,14,14,251,244,232,104,118,167,28,168,68,187,231,82,108,108,173,226,95,242,133,238,171"
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
// const wallet = require('./6-mama.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
