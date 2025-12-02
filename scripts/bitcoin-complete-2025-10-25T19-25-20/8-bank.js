/**
 * 🏦 BANK - Complete Bitcoin Wallet
 * Rezervă bancară
 * Generated: 2025-10-25T19:25:20.493Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "BANK",
  emoji: "🏦",
  description: "Rezervă bancară",
  index: 7,

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
      path: "m/44'/0'/7'/0/0",
      address: "1Hn2RJWuhJEHA9g3mZ8y7qT1scYHCydepq",
      privateKeyWIF: "L2kp3vMPgfjokszXJNekyaUTx2Acos7mdcwEaZDue5YmpKZMeprc",
      privateKeyHex: "165,47,196,117,163,203,112,89,131,136,208,73,219,216,126,224,205,18,51,202,217,39,200,232,55,35,111,72,57,199,103,117",
      publicKey: "3,104,127,16,52,226,60,98,101,32,2,209,155,52,145,37,230,60,232,172,155,46,115,81,72,255,128,190,81,253,191,169,101"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/7'/0/0",
      address: "3KPaneQysu4myodZRisqpucmjXvvFws5qt",
      privateKeyWIF: "KzcaH1PXDuRHjNAHANqAhHGaBjiVXcX5TfbrKrRiHapmx9YviAth",
      privateKeyHex: "101,70,44,219,62,233,148,0,102,124,214,112,10,58,235,44,226,215,152,61,229,167,3,47,182,70,9,73,53,23,233,158",
      publicKey: "3,13,16,161,20,158,97,141,35,69,129,198,25,65,67,117,232,105,24,102,219,15,138,52,201,91,12,183,163,87,227,3,80"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/7'/0/0",
      address: "3PsMW868nHynSc7nxA2jCKPrZnTbsP9eKt",
      privateKeyWIF: "KzcaH1PXDuRHjNAHANqAhHGaBjiVXcX5TfbrKrRiHapmx9YviAth",
      privateKeyHex: "101,70,44,219,62,233,148,0,102,124,214,112,10,58,235,44,226,215,152,61,229,167,3,47,182,70,9,73,53,23,233,158",
      publicKey: "3,13,16,161,20,158,97,141,35,69,129,198,25,65,67,117,232,105,24,102,219,15,138,52,201,91,12,183,163,87,227,3,80"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/7'/0/0",
      address: "bc1qf39704m6sprryp879l2cpaazmx5k9nfykqq9uv",
      privateKeyWIF: "L1mKT1D4M4BGftbj4eyN37DtL3VnEJgE4Mm5RZixuVouYtHqShZm",
      privateKeyHex: "135,156,37,72,110,91,105,1,177,76,37,8,84,57,120,166,242,189,9,39,219,61,156,39,87,155,34,144,187,223,83,191",
      publicKey: "2,253,111,20,177,161,191,75,146,165,28,19,196,247,7,49,58,218,40,173,103,28,235,41,230,210,206,63,231,72,176,103,25"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/7'/0/0",
      address: "bc1p9cj56menclyg40g338eg8upp8mu2d6c2ajxtdxzwt7hdjac5v39qptyp5t",
      privateKeyWIF: "KzQVbq5ou8Jr54PhhtoNep6eBWb2F51jHMkHcx6AWd6NtfM39cv2",
      privateKeyHex: "95,15,52,177,131,38,172,237,136,138,223,33,206,116,59,81,214,163,184,136,27,203,121,222,31,249,113,75,159,178,168,252",
      publicKey: "3,180,223,99,144,4,197,38,201,116,114,61,129,137,107,52,175,44,43,167,141,48,51,158,164,40,118,103,103,64,161,122,201",
      internalPubkey: "180,223,99,144,4,197,38,201,116,114,61,129,137,107,52,175,44,43,167,141,48,51,158,164,40,118,103,103,64,161,122,201"
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
// const wallet = require('./8-bank.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
