/**
 * 🔐 VAULT - Complete Bitcoin Wallet
 * Seif securizat
 * Generated: 2025-10-25T19:32:28.972Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "VAULT",
  emoji: "🔐",
  description: "Seif securizat",
  index: 8,

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
      path: "m/44'/0'/8'/0/0",
      address: "1PaX677jwSMQK6WESEs7t6N7ZAsQYbTNsL",
      privateKeyWIF: "KxMPhz1xvQfvdLWKbRgHTkExJyjoAdgWbmHkdceYUn8tewUZxsfx",
      privateKeyHex: "33,201,252,216,136,4,132,149,59,239,237,11,239,216,192,214,134,105,255,11,77,150,133,134,94,55,196,103,36,71,240,78",
      publicKey: "3,54,222,209,15,13,131,162,61,0,140,114,211,140,162,234,164,196,127,16,12,195,71,175,55,67,98,124,132,115,111,248,231"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/8'/0/0",
      address: "3QUKnH8JVPq8rtoQzdvfvPvwiLovhcV6vj",
      privateKeyWIF: "Kwjao9RcdrwJmiQzWEkKudKWCBDtCoWzXGmPkdkx24f5HjgnKWmN",
      privateKeyHex: "15,94,27,112,148,235,62,142,93,194,160,107,160,34,4,54,7,63,190,138,235,54,81,209,251,209,37,61,170,106,81,69",
      publicKey: "3,230,168,208,79,57,249,41,39,68,49,235,73,151,122,48,22,59,106,172,142,193,131,226,169,23,196,126,156,202,218,40,119"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/8'/0/0",
      address: "38vp6qUnMQ6RtngsqjFPKWxrbJSDgceWBy",
      privateKeyWIF: "Kwjao9RcdrwJmiQzWEkKudKWCBDtCoWzXGmPkdkx24f5HjgnKWmN",
      privateKeyHex: "15,94,27,112,148,235,62,142,93,194,160,107,160,34,4,54,7,63,190,138,235,54,81,209,251,209,37,61,170,106,81,69",
      publicKey: "3,230,168,208,79,57,249,41,39,68,49,235,73,151,122,48,22,59,106,172,142,193,131,226,169,23,196,126,156,202,218,40,119"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/8'/0/0",
      address: "bc1qznwgfqkxp7yqx3j79q7w0p4j2jxz5k2vegrf35",
      privateKeyWIF: "L1LyBMRCY8WVNPCRHBpPQS1DtyXccaxuMtg3zs2eDeu5R7MPtt5Z",
      privateKeyHex: "123,21,106,6,174,183,183,73,161,215,203,182,198,192,105,80,96,202,1,214,206,46,1,178,104,119,222,192,254,4,220,230",
      publicKey: "2,109,1,215,169,112,163,156,161,147,110,49,180,178,10,199,78,143,51,94,203,242,156,230,219,182,89,73,0,215,93,244,82"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/8'/0/0",
      address: "bc1p7226yzqwkehs9wdwcvdf88z8m37an2r88pgzp4d3cf2a8zcz2y8q25j05v",
      privateKeyWIF: "KxSDVB1Rm5dx1ts39ZEwQcMHYikRUHmJf6ZRbtRw5F9VZ9kZcX1F",
      privateKeyHex: "36,69,66,170,195,178,34,17,211,33,119,48,26,59,189,99,70,129,20,95,51,92,92,167,176,166,230,3,102,172,89,196",
      publicKey: "2,88,183,181,181,101,139,231,13,166,13,244,244,8,212,252,243,250,68,108,192,159,201,180,136,29,89,142,164,31,240,35,163",
      internalPubkey: "88,183,181,181,101,139,231,13,166,13,244,244,8,212,252,243,250,68,108,192,159,201,180,136,29,89,142,164,31,240,35,163"
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
// const wallet = require('./9-vault.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
