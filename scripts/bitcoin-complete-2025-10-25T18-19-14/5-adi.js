/**
 * 👨‍💼 ADI - Complete Bitcoin Wallet
 * Wallet personal Adi
 * Generated: 2025-10-25T18:19:14.487Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "ADI",
  emoji: "👨‍💼",
  description: "Wallet personal Adi",
  index: 4,

  // Mnemonic (shared across all wallets)
  mnemonic: "tomato rate decade retire tip couch feed inflict kick curtain opera rookie",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/4'/0/0",
      address: "12mVeuE7mi1poPNBT3Ruki5zawxVxHdZ2g",
      privateKeyWIF: "KzpbaqFi5P5b986XNPkB8pa5P7FMXLCpDkTSSnmRri4zpQxsVASP",
      privateKeyHex: "107,117,127,47,181,241,94,166,192,221,30,241,195,149,126,223,93,123,245,226,8,35,181,90,211,103,93,165,214,99,35,238",
      publicKey: "2,230,139,197,66,247,16,171,206,139,4,59,45,54,212,123,111,114,211,166,229,5,29,246,36,68,114,63,159,87,71,109,111"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/4'/0/0",
      address: "3NAMBrvhu1DvxwEqVqyGsQqpVr4hdam2CT",
      privateKeyWIF: "L5ZaWA6XfmoSSJEWBKyxbkUgdWPDhG3x1q5KaqTk1KzaqKX8j4Z7",
      privateKeyHex: "248,235,120,41,171,122,34,73,171,130,238,121,22,127,84,126,189,49,225,43,126,198,243,83,26,106,31,93,70,27,16,98",
      publicKey: "3,20,12,253,181,94,13,12,42,234,24,253,250,95,233,135,51,78,144,155,41,66,133,17,11,97,214,100,112,45,91,23,86"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/4'/0/0",
      address: "3HjaDk4yWZhJFSnkCsTMJEZNQatkXZPeck",
      privateKeyWIF: "L5ZaWA6XfmoSSJEWBKyxbkUgdWPDhG3x1q5KaqTk1KzaqKX8j4Z7",
      privateKeyHex: "248,235,120,41,171,122,34,73,171,130,238,121,22,127,84,126,189,49,225,43,126,198,243,83,26,106,31,93,70,27,16,98",
      publicKey: "3,20,12,253,181,94,13,12,42,234,24,253,250,95,233,135,51,78,144,155,41,66,133,17,11,97,214,100,112,45,91,23,86"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/4'/0/0",
      address: "bc1qfwty0txzx30hrcrmdzrr62xtl7cgvk85dljutx",
      privateKeyWIF: "L5bu4gY5HPN7x56ch42CLYnHWecA71MhP8kGNgAGjSSWyidLddhR",
      privateKeyHex: "250,29,1,142,154,83,187,149,164,95,24,209,167,9,126,21,39,193,55,15,223,255,217,55,145,207,58,203,41,106,203,234",
      publicKey: "2,136,82,125,102,221,48,225,84,65,245,188,70,20,33,243,11,221,91,104,222,137,35,155,216,72,202,204,254,22,47,182,31"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/4'/0/0",
      address: "bc1pre2xcwwmjd5f6prwzh53ty2mwphx8gktaverxcx0pnwtwenpzd8sa7gsl5",
      privateKeyWIF: "KweNrXPEyDWBUCgX7nAChLw6ihTVT2mTSAL6DGeRGz6R8nRWoyft",
      privateKeyHex: "12,176,130,242,79,212,192,251,148,197,67,137,208,196,174,235,187,55,255,133,158,43,95,176,11,222,55,39,153,145,208,160",
      publicKey: "3,245,212,21,152,183,186,50,98,72,21,232,49,229,164,7,222,191,171,207,78,125,194,25,82,172,15,184,253,182,119,144,209",
      internalPubkey: "245,212,21,152,183,186,50,98,72,21,232,49,229,164,7,222,191,171,207,78,125,194,25,82,172,15,184,253,182,119,144,209"
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
