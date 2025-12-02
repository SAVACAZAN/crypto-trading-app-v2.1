/**
 * 👩 INGRID - Complete Bitcoin Wallet
 * Wallet personal Ingrid
 * Generated: 2025-10-25T19:24:59.021Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "INGRID",
  emoji: "👩",
  description: "Wallet personal Ingrid",
  index: 3,

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
      path: "m/44'/0'/3'/0/0",
      address: "1VtahhEaTaboJZmGx2tGa5XEyykQNfN4z",
      privateKeyWIF: "L3dYJsLiQQAZVWQ125LAa6waH477mqXKkHB4qwq3ngQ8QnWd3pcF",
      privateKeyHex: "191,72,134,5,119,245,188,208,101,245,182,32,86,113,0,193,115,78,50,186,168,176,82,90,41,58,11,96,240,224,88,93",
      publicKey: "2,107,225,23,63,146,245,44,126,60,210,192,122,44,114,52,237,229,135,30,84,110,174,185,72,73,164,99,11,97,127,115,80"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/3'/0/0",
      address: "39hahf5LHDyz1xQvrpoMa32Qdyk3FTWHwU",
      privateKeyWIF: "L3zxe2yA58aGEnW8CQXFff2uHreFi9DppvGZ6r5nqruBmTLFNiip",
      privateKeyHex: "202,77,99,4,37,168,141,74,171,67,52,229,145,227,213,145,190,179,235,174,33,225,49,96,210,177,44,111,24,169,44,102",
      publicKey: "3,226,47,176,169,6,163,199,226,37,181,110,182,159,229,62,170,91,140,247,244,145,245,225,34,232,21,142,72,70,127,97,38"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/3'/0/0",
      address: "3LgL1gacwqPsEaTYQ8eJfcXYDecmNCi9hg",
      privateKeyWIF: "L3zxe2yA58aGEnW8CQXFff2uHreFi9DppvGZ6r5nqruBmTLFNiip",
      privateKeyHex: "202,77,99,4,37,168,141,74,171,67,52,229,145,227,213,145,190,179,235,174,33,225,49,96,210,177,44,111,24,169,44,102",
      publicKey: "3,226,47,176,169,6,163,199,226,37,181,110,182,159,229,62,170,91,140,247,244,145,245,225,34,232,21,142,72,70,127,97,38"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/3'/0/0",
      address: "bc1qhfneramreytvcqc0rdjmjvykr3xe9l46h09a2z",
      privateKeyWIF: "L2HhsRW467FqF6erhTUQioaiPoydZ62kE8rWDGX1487u3SHnopHz",
      privateKeyHex: "151,61,240,42,192,243,121,27,34,17,0,3,218,219,48,92,55,22,51,162,27,160,25,241,234,230,53,226,188,204,8,136",
      publicKey: "3,227,138,184,29,48,146,64,54,135,43,10,203,13,119,226,116,80,188,20,211,188,192,192,62,161,35,225,19,251,215,253,11"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/3'/0/0",
      address: "bc1p277h4vqkwzw9e0r8gvpx540pa95swvqjdtgzn78uyp359e5max9qeuysnw",
      privateKeyWIF: "L5jdQkaoRfNAeSXrYdW7jKssw3RvXyjWeLtU7f8D7UKDyD2qSeTb",
      privateKeyHex: "254,23,7,212,228,222,237,222,246,186,34,173,2,109,72,134,109,115,144,0,100,154,4,101,86,229,59,87,6,250,45,211",
      publicKey: "2,69,155,105,145,136,121,67,117,102,63,54,185,213,187,220,215,60,10,188,78,150,63,184,237,8,37,90,81,62,215,129,142",
      internalPubkey: "69,155,105,145,136,121,67,117,102,63,54,185,213,187,220,215,60,10,188,78,150,63,184,237,8,37,90,81,62,215,129,142"
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
// const wallet = require('./4-ingrid.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
