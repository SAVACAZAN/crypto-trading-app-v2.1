/**
 * 🔐 VAULT - Complete Bitcoin Wallet
 * Seif securizat
 * Generated: 2025-10-25T19:25:20.512Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * 
 */

module.exports = {
  // Wallet Info
  name: "VAULT",
  emoji: "🔐",
  description: "Seif securizat",
  index: 8,

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
      path: "m/44'/0'/8'/0/0",
      address: "1E9BLJjtQJs1mMKczKh5YStD5V1AWnPiKF",
      privateKeyWIF: "Kyvf24JzJeAGjk4hGQgpnpBn88NM4EQSgHE6eQcdfwNVu5r3icPe",
      privateKeyHex: "80,189,25,105,55,4,45,248,26,166,109,255,17,183,252,79,60,77,110,34,116,231,114,34,6,9,19,126,207,103,102,218",
      publicKey: "3,244,118,16,36,120,245,198,223,193,234,46,217,55,223,231,226,97,204,106,167,187,66,11,48,59,65,62,34,204,8,207,40"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/8'/0/0",
      address: "3EooGH7HvePVCnVzJpvrZyQN2CcUjqxgSZ",
      privateKeyWIF: "L1Qo3b7Vx9ZJPjm4GvAD2DmWGoBZS2EDrdtEKp4WxzUfBnFhZhAa",
      privateKeyHex: "125,13,48,57,118,107,155,117,13,219,3,69,209,111,87,7,106,233,71,121,96,87,230,60,199,89,61,96,127,223,134,188",
      publicKey: "2,21,144,124,72,36,241,158,77,138,71,68,101,5,22,106,197,26,102,148,103,189,225,27,12,20,15,210,15,220,17,64,115"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/8'/0/0",
      address: "3NTyBAS93XcjSDuufKxkhkGo7KdGDDLP8v",
      privateKeyWIF: "L1Qo3b7Vx9ZJPjm4GvAD2DmWGoBZS2EDrdtEKp4WxzUfBnFhZhAa",
      privateKeyHex: "125,13,48,57,118,107,155,117,13,219,3,69,209,111,87,7,106,233,71,121,96,87,230,60,199,89,61,96,127,223,134,188",
      publicKey: "2,21,144,124,72,36,241,158,77,138,71,68,101,5,22,106,197,26,102,148,103,189,225,27,12,20,15,210,15,220,17,64,115"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/8'/0/0",
      address: "bc1q2ua56lmuxn2mq8e3a57n6c8h9gmv9954ns8vaa",
      privateKeyWIF: "KwDyRRMiPZsX6Sc2TeFEVfgakQsnyQzR5XVxxS7Xxf6yKk38f1KX",
      privateKeyHex: "0,34,153,30,175,139,234,22,91,225,130,214,49,114,148,179,153,7,78,227,65,176,47,16,75,181,150,196,95,15,115,106",
      publicKey: "2,230,74,145,97,223,17,30,118,177,158,12,40,123,216,90,45,127,164,146,237,83,128,236,213,65,58,52,42,179,133,60,9"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/8'/0/0",
      address: "bc1psv644yj3804kf8wezjr5hagcxw7lt4xuruvhxhe68h3xkfux3f9qc2ylgj",
      privateKeyWIF: "KygBf13iUBDZBNHcLnC9ERMV1ncyafWSQdASBpGHFGEFegjyieB2",
      privateKeyHex: "73,75,57,9,103,57,236,152,209,23,87,77,26,173,89,93,159,85,36,25,104,213,26,182,82,186,148,61,107,30,97,164",
      publicKey: "2,27,135,2,176,131,162,67,70,96,199,69,91,96,114,34,65,23,172,243,29,105,164,181,160,211,17,217,147,18,159,72,11",
      internalPubkey: "27,135,2,176,131,162,67,70,96,199,69,91,96,114,34,65,23,172,243,29,105,164,181,160,211,17,217,147,18,159,72,11"
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
