/**
 * 👴 TATA - Complete Bitcoin Wallet
 * Wallet pentru tată
 * Generated: 2025-10-25T18:17:39.250Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 */

module.exports = {
  // Wallet Info
  name: "TATA",
  emoji: "👴",
  description: "Wallet pentru tată",
  index: 6,

  // Mnemonic (shared across all wallets)
  mnemonic: "impulse shaft lounge popular salad fashion conduct shoe predict sugar young ladder",

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/6'/0/0",
      address: "113oZxZntHBeiRwiGkf3rNkdSAit8gQ8PQ",
      privateKeyWIF: "L5fo7hhBNF32qpD7iPTV75FtaHaS6TaqZkJRDcmTAqt1peuxte2r",
      privateKeyHex: "252,30,72,242,230,196,2,163,241,143,241,168,158,22,201,190,191,8,143,31,226,147,246,161,3,239,13,29,45,123,246,116",
      publicKey: "2,136,115,54,146,168,89,119,129,186,239,171,132,132,81,92,154,168,113,78,44,102,108,14,48,62,32,114,244,177,185,155,108"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/6'/0/0",
      address: "32SnTdQNhVjprUXA9UFTauUaPza8Md9Emu",
      privateKeyWIF: "L3FMQNWRhbWMVf2nGR3hnBQCvScrNBviieLHhhsFLvNxVy15nXGk",
      privateKeyHex: "179,222,114,176,183,115,189,141,175,140,166,90,4,18,243,159,135,114,196,219,205,46,109,68,143,187,187,51,216,9,37,176",
      publicKey: "2,26,196,4,155,185,3,45,194,151,63,203,142,173,205,17,223,9,166,241,245,248,4,255,246,125,81,157,133,92,68,171,21"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/6'/0/0",
      address: "36fvtFYkWguGgjxWbjaKt5WahHHAtCPQTi",
      privateKeyWIF: "L3FMQNWRhbWMVf2nGR3hnBQCvScrNBviieLHhhsFLvNxVy15nXGk",
      privateKeyHex: "179,222,114,176,183,115,189,141,175,140,166,90,4,18,243,159,135,114,196,219,205,46,109,68,143,187,187,51,216,9,37,176",
      publicKey: "2,26,196,4,155,185,3,45,194,151,63,203,142,173,205,17,223,9,166,241,245,248,4,255,246,125,81,157,133,92,68,171,21"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/6'/0/0",
      address: "bc1qhalavu935guw6luahlf6gd9dnnw9q86k4gdf7k",
      privateKeyWIF: "L4XWVoiPPZKPXWEyx5djW1aFPFCvJtXdE9bofYgExHsm6dA7DFaf",
      privateKeyHex: "218,4,155,127,229,135,180,22,187,129,140,34,47,215,44,197,138,64,1,244,247,181,155,182,40,66,214,37,199,206,111,46",
      publicKey: "2,228,242,143,2,58,106,108,146,238,49,77,8,216,118,29,61,239,16,126,79,184,96,117,33,251,27,130,185,88,129,250,195"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/6'/0/0",
      address: "bc1pzwn6sfckjp8echj6u4wmfqwrmrlcawx2lqqvnp9daxqwmsffhd7sj2k5lz",
      privateKeyWIF: "L1GEsBYBvTuJGSWqoUntScmaU7Hj3aALcGNtPydcjEex93zmq6nH",
      privateKeyHex: "120,166,141,99,151,74,93,198,209,11,134,234,58,140,124,180,87,36,141,209,40,184,103,182,201,162,196,151,162,6,211,107",
      publicKey: "2,51,89,214,98,90,39,254,8,150,212,204,162,149,164,241,243,80,117,141,44,81,72,253,246,104,60,0,52,34,109,248,78",
      internalPubkey: "51,89,214,98,90,39,254,8,150,212,204,162,149,164,241,243,80,117,141,44,81,72,253,246,104,60,0,52,34,109,248,78"
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
// const wallet = require('./7-tata.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
