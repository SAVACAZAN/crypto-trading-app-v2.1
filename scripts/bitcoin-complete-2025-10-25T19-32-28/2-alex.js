/**
 * 👨 ALEX - Complete Bitcoin Wallet
 * Wallet personal Alex
 * Generated: 2025-10-25T19:32:28.953Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "ALEX",
  emoji: "👨",
  description: "Wallet personal Alex",
  index: 1,

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
      path: "m/44'/0'/1'/0/0",
      address: "1DUweXbKYVJc8xC9LaoKyzzUhkVM5tr5eq",
      privateKeyWIF: "L5jSFD6AFQQhsE7wXMjnNcW8a6e9JoKZBBnvjhqgu8zw9b5ogoAt",
      privateKeyHex: "253,253,174,30,97,14,182,224,10,99,33,254,95,21,217,185,193,117,8,190,26,180,109,2,96,252,36,75,4,168,114,132",
      publicKey: "2,25,210,20,148,93,41,221,27,154,212,76,184,160,178,98,84,151,153,131,126,228,88,23,239,154,226,83,178,251,209,200,43"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/1'/0/0",
      address: "3QT5dXfPEnsf9xWZmiHJ7K4R6A2CFQMR8P",
      privateKeyWIF: "L4fVCGVfkNwcQQQYVrp66a4RQMRTQGaCh4X2BAj6HbKKXvYDhGfi",
      privateKeyHex: "222,31,56,13,211,121,53,236,97,6,239,137,0,65,207,57,195,222,246,149,41,23,199,250,100,54,22,209,189,60,87,13",
      publicKey: "3,213,12,214,226,25,15,73,140,38,2,142,16,170,233,56,71,232,25,200,228,47,145,245,79,108,220,146,124,48,212,251,104"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/1'/0/0",
      address: "39q8HbV3hWBeTikSLsuXYgtMqMFGfXqsyH",
      privateKeyWIF: "L4fVCGVfkNwcQQQYVrp66a4RQMRTQGaCh4X2BAj6HbKKXvYDhGfi",
      privateKeyHex: "222,31,56,13,211,121,53,236,97,6,239,137,0,65,207,57,195,222,246,149,41,23,199,250,100,54,22,209,189,60,87,13",
      publicKey: "3,213,12,214,226,25,15,73,140,38,2,142,16,170,233,56,71,232,25,200,228,47,145,245,79,108,220,146,124,48,212,251,104"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/1'/0/0",
      address: "bc1qzl9sjtuj4mgxl9n7q7hsfvtpw8nj70fkyzj0xt",
      privateKeyWIF: "L3NtAqF8kbhJ8rTZxYVJPUqp9wxpZMLEDhPyERDPSUSsSMZLSP79",
      privateKeyHex: "183,190,46,16,34,54,91,179,15,88,200,101,149,214,195,97,141,166,138,6,195,151,63,93,176,120,3,204,100,103,194,208",
      publicKey: "3,224,54,52,83,108,107,3,100,191,155,42,97,100,88,166,204,74,163,114,158,174,132,235,244,121,252,127,95,128,70,58,97"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/1'/0/0",
      address: "bc1pnws96txq9tgqvmumqjlutv0r2tcty2c9scxzqsklsk3yqn6g2xpqvdx4ya",
      privateKeyWIF: "L3cH4jWhMiV4fzikjxVs3ipwdSEjHCfZdUw4eGjeqxdpaLBBW7TJ",
      privateKeyHex: "190,162,54,248,67,242,1,247,51,127,174,121,180,155,82,144,181,228,177,51,186,29,202,9,47,253,160,196,60,18,103,70",
      publicKey: "2,209,255,147,148,63,17,20,152,40,27,62,18,152,149,161,204,229,19,134,131,210,8,187,196,213,180,0,122,35,112,165,110",
      internalPubkey: "209,255,147,148,63,17,20,152,40,27,62,18,152,149,161,204,229,19,134,131,210,8,187,196,213,180,0,122,35,112,165,110"
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
// const wallet = require('./2-alex.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
