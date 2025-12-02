/**
 * 💰 SAVACAZAN - Complete Bitcoin Wallet
 * Pentru economii
 * Generated: 2025-10-25T18:17:39.244Z
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
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/0'/0/0",
      address: "1CJxVouY6WwbGLgeqLFNyJuqZZBrg861rH",
      privateKeyWIF: "L4CSF6wN2F4fZ4UTCGoaiTUpm6H1TDg3aniR1SVYhq5ytFXNPv8s",
      privateKeyHex: "208,52,185,56,82,143,174,235,14,148,49,41,242,170,15,107,192,65,216,106,74,148,119,142,34,236,18,50,151,236,86,155",
      publicKey: "2,140,133,231,154,18,232,40,62,228,13,245,2,51,91,218,153,106,142,204,83,28,95,210,193,63,167,184,100,43,176,148,150"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/0'/0/0",
      address: "3BEkivqWmd67dVeD6Bt2hXt4e12ibRsnCe",
      privateKeyWIF: "L2jG5Qvsgy1UtWwNAneVH8Hdd2HbZa8NyKHvvvfXfq3ZXDcXzY1p",
      privateKeyHex: "164,99,120,71,241,5,4,8,85,132,124,174,61,253,61,169,245,126,215,6,227,119,58,163,17,190,97,75,171,193,114,164",
      publicKey: "3,240,247,117,64,10,174,87,143,234,217,190,25,220,232,151,232,198,15,100,64,193,116,38,87,75,172,175,32,106,64,12,178"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/0'/0/0",
      address: "3B6DFFoXJcRxDqH4dXAduuKBQrMR9W6Lhf",
      privateKeyWIF: "L2jG5Qvsgy1UtWwNAneVH8Hdd2HbZa8NyKHvvvfXfq3ZXDcXzY1p",
      privateKeyHex: "164,99,120,71,241,5,4,8,85,132,124,174,61,253,61,169,245,126,215,6,227,119,58,163,17,190,97,75,171,193,114,164",
      publicKey: "3,240,247,117,64,10,174,87,143,234,217,190,25,220,232,151,232,198,15,100,64,193,116,38,87,75,172,175,32,106,64,12,178"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/0'/0/0",
      address: "bc1q8da6l6kwqdyyxzvkp5wxmsv93gkz2smrl5372l",
      privateKeyWIF: "KyJRUtur9pb6jxhbM8aZNREF41jAt4ZJHNfqZDUpsWe4bqtsgnoK",
      privateKeyHex: "62,25,77,65,240,132,20,144,64,219,13,243,198,242,182,163,50,116,158,46,12,13,35,227,111,250,170,232,214,193,123,155",
      publicKey: "2,68,150,115,236,105,199,80,225,244,211,39,94,182,66,218,156,249,110,86,8,17,8,107,138,71,29,31,168,28,250,189,118"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/0'/0/0",
      address: "bc1ptdvl25ep3a0p0ncsgzej8wf8jp9mvhujhe8gcpdm8s9y8q799k5qszttvm",
      privateKeyWIF: "KwG32EB2NRm59mkUUzdH57ytszfAmiXD67P7KdyQiHWv7NLTqihD",
      privateKeyHex: "1,50,42,50,178,173,200,224,135,10,162,19,12,131,85,143,158,231,239,85,52,39,208,14,44,184,192,17,145,250,124,168",
      publicKey: "3,25,113,6,167,179,13,82,184,180,166,141,126,71,126,141,61,33,96,123,159,159,109,51,156,233,245,15,170,117,165,33,9",
      internalPubkey: "25,113,6,167,179,13,82,184,180,166,141,126,71,126,141,61,33,96,123,159,159,109,51,156,233,245,15,170,117,165,33,9"
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
