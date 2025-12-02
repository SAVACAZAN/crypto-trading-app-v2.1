/**
 * 👵 MAMA - Complete Bitcoin Wallet
 * Wallet pentru mamă
 * Generated: 2025-10-25T19:24:59.022Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "MAMA",
  emoji: "👵",
  description: "Wallet pentru mamă",
  index: 5,

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
      path: "m/44'/0'/5'/0/0",
      address: "1Dn2qXDGMCdxbpzzv851x2WCnvHS1pLqV4",
      privateKeyWIF: "L4tRX623apnzDEG2TSbyijWT8zR6QM5SwbR3V3qFuSjY8TFHmMtT",
      privateKeyHex: "228,198,236,38,154,231,119,228,254,189,171,98,73,75,1,182,46,163,253,94,158,11,103,206,60,61,122,234,169,219,56,49",
      publicKey: "3,210,98,68,95,26,57,69,79,97,54,45,143,83,241,57,183,18,236,211,190,53,42,70,6,15,179,169,188,233,85,254,55"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/5'/0/0",
      address: "386QjaGZ8tessUDs2jjSugjtj2AuB9hpcb",
      privateKeyWIF: "KwyfneZhPtpubP5vQyodf9NJt5UYFQDiycCD2pHXsg4ibQpuKxVT",
      privateKeyHex: "22,157,47,167,175,128,19,16,247,19,95,192,147,173,204,255,152,37,229,246,161,141,56,114,245,60,183,86,69,229,250,254",
      publicKey: "3,156,127,33,98,121,168,169,133,190,245,124,205,79,117,159,123,40,223,113,210,6,159,212,255,187,146,164,204,160,218,169,121"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/5'/0/0",
      address: "3LauFMt9JKuT8po5GHsW2BXRqC9RukXsmX",
      privateKeyWIF: "KwyfneZhPtpubP5vQyodf9NJt5UYFQDiycCD2pHXsg4ibQpuKxVT",
      privateKeyHex: "22,157,47,167,175,128,19,16,247,19,95,192,147,173,204,255,152,37,229,246,161,141,56,114,245,60,183,86,69,229,250,254",
      publicKey: "3,156,127,33,98,121,168,169,133,190,245,124,205,79,117,159,123,40,223,113,210,6,159,212,255,187,146,164,204,160,218,169,121"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/5'/0/0",
      address: "bc1q95260vz9hl2fxlsfnrx796gnv9huyhs4fq97de",
      privateKeyWIF: "L3go4tUSvq8KT5MAnJcLEaWDM7zii3GjqXfMPvW6awa6ZK3dntVc",
      privateKeyHex: "192,245,31,179,8,247,253,3,253,0,130,137,32,248,187,211,49,73,40,143,236,28,88,54,157,8,176,41,95,243,203,168",
      publicKey: "3,226,176,127,238,225,191,131,248,207,27,128,158,238,145,235,196,25,59,236,218,134,208,178,161,87,227,167,20,195,36,206,242"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/5'/0/0",
      address: "bc1pt9tmfjx0h3ccxyeqdwtjesytdrnrqvr9j2du3kwlwe6jxz4j390qxqfdem",
      privateKeyWIF: "L2o5Khm7PLYGMa1TPqDZSUvgWTi8xhUYqAFukV8AwsTCE6xfcjYQ",
      privateKeyHex: "166,89,214,58,51,107,132,223,226,164,167,29,248,181,28,119,240,157,103,16,164,205,179,117,212,148,93,107,144,54,131,34",
      publicKey: "2,158,177,204,41,8,45,51,233,11,6,14,177,64,198,63,203,11,219,229,190,124,125,20,10,16,50,1,15,30,203,45,159",
      internalPubkey: "158,177,204,41,8,45,51,233,11,6,14,177,64,198,63,203,11,219,229,190,124,125,20,10,16,50,1,15,30,203,45,159"
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
// const wallet = require('./6-mama.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
