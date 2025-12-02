/**
 * 💰 SAVACAZAN - Complete Bitcoin Wallet
 * Pentru economii
 * Generated: 2025-10-25T19:25:20.480Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "SAVACAZAN",
  emoji: "💰",
  description: "Pentru economii",
  index: 0,

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
      path: "m/44'/0'/0'/0/0",
      address: "1PgbLWKSG7qJvR47YAc2LBb4wbf5wEAG3h",
      privateKeyWIF: "KxAHNhAxGe5q3rvybUdhjVCMggUhc8NcAFQgW3NZBpgsDNeG54bk",
      privateKeyHex: "28,18,243,162,189,135,191,239,251,205,226,100,201,255,85,139,192,65,204,183,54,105,183,22,208,28,211,68,202,107,146,198",
      publicKey: "2,57,13,46,50,179,194,60,94,30,249,216,107,9,254,251,102,214,162,185,203,3,210,36,87,160,227,222,105,52,160,179,169"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/0'/0/0",
      address: "3BgffuF2dyfmHtvae3TjJhLEWiN5SsBasy",
      privateKeyWIF: "Kxx278UwW2TS9fEpx2yck8aYpmQ3ALEskSMNeYbHPjraCjrxrQJi",
      privateKeyHex: "51,154,77,175,86,125,25,108,230,100,134,223,236,129,32,79,201,120,186,71,26,190,231,196,231,240,145,173,161,205,1,211",
      publicKey: "3,150,225,189,19,190,84,51,59,196,169,102,186,122,219,13,140,237,140,57,19,151,85,163,213,207,171,250,181,205,64,137,221"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/0'/0/0",
      address: "355CAS2RboRLGWNoNx911PyJdz1g4yZvVD",
      privateKeyWIF: "Kxx278UwW2TS9fEpx2yck8aYpmQ3ALEskSMNeYbHPjraCjrxrQJi",
      privateKeyHex: "51,154,77,175,86,125,25,108,230,100,134,223,236,129,32,79,201,120,186,71,26,190,231,196,231,240,145,173,161,205,1,211",
      publicKey: "3,150,225,189,19,190,84,51,59,196,169,102,186,122,219,13,140,237,140,57,19,151,85,163,213,207,171,250,181,205,64,137,221"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/0'/0/0",
      address: "bc1qjzkuevw0xek9m2ugjxypy9m45663w6fchme5wf",
      privateKeyWIF: "L2xBtnf4iVHnRZFUihKww2BFsUeiygS7nkcoLTVcgJvJgUK7mzF1",
      privateKeyHex: "171,10,5,71,220,69,97,119,48,213,112,228,14,79,14,2,64,64,254,31,244,87,58,42,41,30,25,67,8,108,180,51",
      publicKey: "3,250,126,128,213,41,54,51,3,228,222,162,188,195,116,136,154,159,229,81,182,62,210,23,207,18,178,246,249,188,76,68,39"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/0'/0/0",
      address: "bc1phhsx54q6cap6ew27aq9veqjlnlggpx8ulhc7juewy2x9g84sj86q623t0q",
      privateKeyWIF: "KxxswamhAuiYPo2fn7oQMminHbJEHf8QF4k1QkUEZuobipKLxRM8",
      privateKeyHex: "52,11,117,249,6,225,140,69,154,172,221,59,79,91,78,236,198,129,35,41,51,161,73,148,35,134,143,122,252,130,48,61",
      publicKey: "2,72,181,243,16,204,62,44,146,128,18,94,40,182,107,203,234,66,34,145,209,210,143,138,159,13,74,128,123,42,80,209,96",
      internalPubkey: "72,181,243,16,204,62,44,146,128,18,94,40,182,107,203,234,66,34,145,209,210,143,138,159,13,74,128,123,42,80,209,96"
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
