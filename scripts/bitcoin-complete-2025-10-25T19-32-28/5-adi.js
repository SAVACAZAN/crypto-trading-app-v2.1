/**
 * 👨‍💼 ADI - Complete Bitcoin Wallet
 * Wallet personal Adi
 * Generated: 2025-10-25T19:32:28.959Z
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
  mnemonic: "perfect repair cat pause skull artist soap cruel lock educate warm school",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "SAVACAZAN",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/4'/0/0",
      address: "1PUvn3fzMA6488Nd4Hf8AnDXsxo8Jc7CCN",
      privateKeyWIF: "L1AfEs7AHFPvMhfu2Kmo9sT37VDDdTGeCtvKC1vTXyNrrgso2LEk",
      privateKeyHex: "117,199,184,48,205,129,155,170,13,145,222,17,54,212,144,239,222,94,19,161,172,55,170,59,54,134,35,19,177,87,231,79",
      publicKey: "2,78,136,25,156,205,0,170,166,203,174,221,129,209,3,1,181,161,172,170,144,126,55,55,178,83,250,84,31,47,112,255,125"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/4'/0/0",
      address: "3H6r4W4gDqknaERqTqC1aSb85gHosabjZn",
      privateKeyWIF: "L3dXBgTXfb1qJZ4P5Qut9RzNVfh1F5vM8wZQrpuZKiXze2cydoMw",
      privateKeyHex: "191,69,248,181,11,216,28,17,247,54,182,234,107,28,196,74,176,5,98,151,140,77,86,82,156,75,88,104,53,105,62,199",
      publicKey: "2,98,138,135,216,182,64,24,75,92,87,97,120,110,219,118,55,184,141,202,70,1,251,181,163,25,63,49,66,212,47,201,45"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/4'/0/0",
      address: "3NdiQ9kuJSxCFDxFBjq7XrVyQh9kj55RzY",
      privateKeyWIF: "L3dXBgTXfb1qJZ4P5Qut9RzNVfh1F5vM8wZQrpuZKiXze2cydoMw",
      privateKeyHex: "191,69,248,181,11,216,28,17,247,54,182,234,107,28,196,74,176,5,98,151,140,77,86,82,156,75,88,104,53,105,62,199",
      publicKey: "2,98,138,135,216,182,64,24,75,92,87,97,120,110,219,118,55,184,141,202,70,1,251,181,163,25,63,49,66,212,47,201,45"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/4'/0/0",
      address: "bc1q2mdk35lkxhktpzh3lqx38syq2em8ya4kpp7nvj",
      privateKeyWIF: "L1L2ws8PXK5Ma4Gvcqqmxh7tsLm3V1dtgL7NS7CUh3pHfW88HcJD",
      privateKeyHex: "122,154,69,196,149,213,58,174,44,106,27,213,123,118,52,0,110,253,135,128,206,134,244,196,157,13,76,215,217,219,83,228",
      publicKey: "3,82,206,188,175,225,48,145,152,48,52,213,230,229,174,155,185,205,161,177,229,67,91,17,19,114,83,229,234,10,211,233,215"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/4'/0/0",
      address: "bc1pjwwzhrlat7gcjpwj8vpwrz992skeuv0gmvlvnhg3puznlsnpae8qzhjzgp",
      privateKeyWIF: "Ky3fGBzWunQTgFcXbM4fgRDwRErXH5VeYzS4tiQqBXg6KKZiA2jb",
      privateKeyHex: "54,129,38,211,160,114,250,233,141,3,155,51,247,152,251,241,151,82,192,77,98,32,216,40,172,194,149,193,3,52,211,61",
      publicKey: "2,209,218,77,135,70,239,107,200,27,55,138,111,166,65,110,201,221,109,18,159,109,243,235,83,118,61,57,211,196,184,250,184",
      internalPubkey: "209,218,77,135,70,239,107,200,27,55,138,111,166,65,110,201,221,109,18,159,109,243,235,83,118,61,57,211,196,184,250,184"
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
