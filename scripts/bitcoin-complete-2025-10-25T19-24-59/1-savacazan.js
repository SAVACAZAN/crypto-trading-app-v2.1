/**
 * 💰 SAVACAZAN - Complete Bitcoin Wallet
 * Pentru economii
 * Generated: 2025-10-25T19:24:59.015Z
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
  mnemonic: "seminar float bitter normal come oppose syrup planet rule dad dilemma push",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "TestSecret123",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/0'/0/0",
      address: "1G3BH5zJRCPxLbqefpaiuzqKJgJJSpC9uZ",
      privateKeyWIF: "Kz39eDi86DN2Eq9Vus4bnYfyc7PmgVHrv3t9tA4bLrGqoLjjduV8",
      privateKeyHex: "84,20,68,218,55,176,170,142,40,166,113,197,49,213,177,221,20,202,255,101,6,254,171,1,44,245,97,80,12,10,153,105",
      publicKey: "2,109,156,142,220,194,85,248,237,82,6,111,145,97,230,176,251,204,14,75,201,214,248,167,187,195,162,188,25,225,52,73,8"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/0'/0/0",
      address: "3QueAaLrHvSdxj6SWzNUtEnpLLz8bgvH4W",
      privateKeyWIF: "L1oRgjEcLaGPkgi7njtvZxVWkQc1HUNThnwJtawYs3U8TU1VRM3V",
      privateKeyHex: "136,177,178,232,138,24,90,129,0,55,231,61,252,166,17,9,94,230,82,142,12,35,254,16,160,94,213,133,126,41,175,118",
      publicKey: "3,95,122,127,152,89,127,245,146,26,133,75,63,77,232,117,93,8,88,39,141,174,201,193,188,0,172,3,93,132,13,209,94"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/0'/0/0",
      address: "3LPsVjJg2LWfBthBkjtP3vup2fxsUSTKje",
      privateKeyWIF: "L1oRgjEcLaGPkgi7njtvZxVWkQc1HUNThnwJtawYs3U8TU1VRM3V",
      privateKeyHex: "136,177,178,232,138,24,90,129,0,55,231,61,252,166,17,9,94,230,82,142,12,35,254,16,160,94,213,133,126,41,175,118",
      publicKey: "3,95,122,127,152,89,127,245,146,26,133,75,63,77,232,117,93,8,88,39,141,174,201,193,188,0,172,3,93,132,13,209,94"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/0'/0/0",
      address: "bc1qjxm4ega96r4r9n0vk57qxngecg5wg87nlajq47",
      privateKeyWIF: "L22ZyY3x2XChkZmBKzPdcaPPPPtjnm45sY3VAnmVEwNGtmVi8EtZ",
      privateKeyHex: "143,116,146,48,202,48,14,194,1,119,8,87,252,245,20,41,16,154,41,77,126,159,181,171,33,252,88,10,209,116,99,125",
      publicKey: "2,84,114,18,171,213,55,152,232,230,164,228,11,113,215,35,101,159,36,153,6,250,116,99,194,76,48,211,18,180,159,144,211"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/0'/0/0",
      address: "bc1p0gf5pkrmueuhlvusdunywe6tkyuundr42wghejdvhzzea764p9fqdwrd8w",
      privateKeyWIF: "KwJxa4TY37csBT4BBuRRM4DjNck1BZjsVUUe1GhjgUXAcRb3WLFf",
      privateKeyHex: "2,179,37,110,3,46,132,88,80,246,25,106,233,207,176,203,218,91,83,175,92,252,249,231,160,61,94,20,36,30,81,179",
      publicKey: "3,75,145,254,32,188,38,234,141,179,255,157,118,181,0,167,168,230,70,30,37,75,159,134,193,14,121,208,157,208,18,132,65",
      internalPubkey: "75,145,254,32,188,38,234,141,179,255,157,118,181,0,167,168,230,70,30,37,75,159,134,193,14,121,208,157,208,18,132,65"
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
