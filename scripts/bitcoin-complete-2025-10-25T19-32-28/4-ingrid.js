/**
 * 👩 INGRID - Complete Bitcoin Wallet
 * Wallet personal Ingrid
 * Generated: 2025-10-25T19:32:28.957Z
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
  mnemonic: "perfect repair cat pause skull artist soap cruel lock educate warm school",

  // BIP39 Passphrase
  hasPassphrase: true,
  passphrase: "SAVACAZAN",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "Legacy (P2PKH)",
      path: "m/44'/0'/3'/0/0",
      address: "1GvzMVV4KH8fAsDx6EdmyHx8sUu15qP8je",
      privateKeyWIF: "L2j7AiqdLx4GaLY9JS4rPjGoCQiwJ77bjdhwFYVgEqHNWD2BW6EG",
      privateKeyHex: "164,79,61,248,220,98,60,107,100,49,159,160,170,255,69,94,222,180,98,41,165,73,123,187,93,80,205,31,158,94,87,94",
      publicKey: "2,166,83,186,108,79,71,6,79,217,157,160,166,85,115,15,246,33,201,228,153,12,70,19,75,27,230,152,123,214,97,239,237"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/3'/0/0",
      address: "3GYwyrai1QaPvDFMKTUQ2or5ffpd8UdELA",
      privateKeyWIF: "L4azTycihsjRKMEnjSqim1mGowq2Rmon6hWdxYX7h71hbBJHEGgy",
      privateKeyHex: "219,207,51,150,176,43,182,40,25,112,219,142,141,245,51,22,126,77,73,239,92,50,239,239,119,167,43,54,179,142,182,84",
      publicKey: "3,104,227,193,53,84,247,233,159,13,178,114,76,38,220,95,195,40,89,152,189,220,138,65,181,149,6,213,65,180,192,36,189"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/3'/0/0",
      address: "34EpRZJ4Ja17SveUjn9wzhtmFa4rieTgKb",
      privateKeyWIF: "L4azTycihsjRKMEnjSqim1mGowq2Rmon6hWdxYX7h71hbBJHEGgy",
      privateKeyHex: "219,207,51,150,176,43,182,40,25,112,219,142,141,245,51,22,126,77,73,239,92,50,239,239,119,167,43,54,179,142,182,84",
      publicKey: "3,104,227,193,53,84,247,233,159,13,178,114,76,38,220,95,195,40,89,152,189,220,138,65,181,149,6,213,65,180,192,36,189"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/3'/0/0",
      address: "bc1q4qjx89zwy9ceuapvj6r9ptuusky6l0y3ua5t6c",
      privateKeyWIF: "Kwu6HRjZCP5tiJR45BJ81UPMnTZZij63r7xtXWeakpG6DtdytPFi",
      privateKeyHex: "20,66,83,199,130,168,234,105,180,252,99,156,240,193,55,67,122,214,220,155,57,177,183,154,129,78,46,59,142,91,211,57",
      publicKey: "2,91,218,64,25,152,114,213,67,219,147,118,138,31,56,162,57,78,203,154,30,115,22,2,238,28,219,133,178,70,54,234,75"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/3'/0/0",
      address: "bc1pxc36lvn6lk4lkxwjjhg4vremzgv56hh4nsrzq9yzs2lx45cg7v3qnrlys0",
      privateKeyWIF: "L54fmuAhxVBbznBq5RYLy6BEbwhC4hMTbTsRH3JfZQq8YgE736nE",
      privateKeyHex: "234,12,64,133,108,15,30,173,207,222,28,242,133,64,225,54,247,31,40,175,186,242,6,44,45,174,35,9,89,87,101,196",
      publicKey: "2,194,205,20,46,128,158,98,109,94,172,237,8,144,18,85,206,165,12,194,111,179,106,98,34,44,107,84,224,93,144,95,89",
      internalPubkey: "194,205,20,46,128,158,98,109,94,172,237,8,144,18,85,206,165,12,194,111,179,106,98,34,44,107,84,224,93,144,95,89"
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
