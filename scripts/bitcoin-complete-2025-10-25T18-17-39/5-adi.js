/**
 * 👨‍💼 ADI - Complete Bitcoin Wallet
 * Wallet personal Adi
 * Generated: 2025-10-25T18:17:39.248Z
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
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/4'/0/0",
      address: "1DMcSBFkq8n3GrVK8NU9C9sPMRMHpToDSG",
      privateKeyWIF: "L5D8x1ZPr84KFSQZPyp9o4A64g2SCsf6CUDVUYndp5jucyR1aiM1",
      privateKeyHex: "238,103,133,253,170,110,226,185,76,173,254,95,77,227,21,121,75,48,165,7,219,216,255,181,76,34,107,170,171,129,161,154",
      publicKey: "3,100,144,239,56,12,238,198,37,34,231,182,153,103,193,179,75,26,148,54,180,249,153,229,43,159,118,210,250,186,230,206,201"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/4'/0/0",
      address: "3Bq1dks8RHeWH3q6BUKXbaqHVoDPTjcSrC",
      privateKeyWIF: "L143zYfMZbs68daG3Vh6KPzToVuPoEfofmmwJgjTr2zNcNsPxGgx",
      privateKeyHex: "114,97,130,183,85,183,205,207,65,206,52,245,110,165,216,164,174,234,254,118,7,223,30,201,112,116,201,151,125,48,112,99",
      publicKey: "2,85,219,222,132,213,188,33,47,142,172,170,52,75,24,192,250,32,103,112,80,239,164,217,214,0,147,96,174,157,215,117,45"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/4'/0/0",
      address: "36yEPEhc7cHTkLgJyARHW1HQmHQf8teRrd",
      privateKeyWIF: "L143zYfMZbs68daG3Vh6KPzToVuPoEfofmmwJgjTr2zNcNsPxGgx",
      privateKeyHex: "114,97,130,183,85,183,205,207,65,206,52,245,110,165,216,164,174,234,254,118,7,223,30,201,112,116,201,151,125,48,112,99",
      publicKey: "2,85,219,222,132,213,188,33,47,142,172,170,52,75,24,192,250,32,103,112,80,239,164,217,214,0,147,96,174,157,215,117,45"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/4'/0/0",
      address: "bc1qqfp8x5j5q8p32fvpfazpx6tc4k4j9v9s7mmzds",
      privateKeyWIF: "KweZykVrFbycWrFSxsc5To1FTtoRg3gKYFX8wVqnjrXE9DuXEXEg",
      privateKeyHex: "12,201,197,112,126,150,2,88,136,197,29,245,33,112,241,128,71,185,55,86,182,210,249,85,162,8,101,152,171,69,111,132",
      publicKey: "3,229,166,216,245,235,61,132,137,98,178,237,47,20,0,157,204,173,24,255,71,172,222,118,39,134,249,56,11,5,87,45,167"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/4'/0/0",
      address: "bc1px4zx69lf9txpylap2qxn7egm93tsg8erz4jpysefxkyyu73pl2ms9vxktl",
      privateKeyWIF: "KwPQfABcXSasdMh4WoGWH9RwPj2XfkLar9Lcok9eqGpUFZX5xqgc",
      privateKeyHex: "4,253,42,151,220,27,228,132,73,223,197,99,170,144,36,195,130,243,192,156,179,74,63,12,163,151,225,216,172,238,138,143",
      publicKey: "3,254,162,47,228,136,16,6,189,48,83,233,30,165,173,149,69,166,46,21,60,181,226,150,196,156,75,4,111,86,110,107,42",
      internalPubkey: "254,162,47,228,136,16,6,189,48,83,233,30,165,173,149,69,166,46,21,60,181,226,150,196,156,75,4,111,86,110,107,42"
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
