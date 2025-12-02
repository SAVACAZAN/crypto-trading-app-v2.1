/**
 * 🏦 BANK - Complete Bitcoin Wallet
 * Rezervă bancară
 * Generated: 2025-10-25T19:24:59.023Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "BANK",
  emoji: "🏦",
  description: "Rezervă bancară",
  index: 7,

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
      path: "m/44'/0'/7'/0/0",
      address: "1Dhr3VmzUADaqsXutSGFECC39hKai3pUpE",
      privateKeyWIF: "L1GGw2p3VKRr1nu3DXjoCLDJMuAhsJHFdLNAhtDNu8Hb2jfkn4DK",
      privateKeyHex: "120,171,62,135,41,143,10,105,56,28,7,118,148,215,110,178,198,159,175,238,203,138,125,96,199,35,218,157,39,212,75,128",
      publicKey: "2,209,134,138,57,11,162,113,80,144,212,229,9,136,155,23,208,66,111,44,130,135,60,167,190,133,156,227,7,84,41,144,244"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/7'/0/0",
      address: "3FZeFA52nZPn4E6CMkwZoW6DtAGANmEbC9",
      privateKeyWIF: "KxkhaahdceY4dMgKpPAoVaqonJxYteRGWhsogfxRtXc8SoArqVbJ",
      privateKeyHex: "45,199,148,76,170,125,195,148,85,182,186,168,4,183,39,223,59,141,64,204,134,250,79,188,33,59,113,92,225,158,64,156",
      publicKey: "3,57,92,52,18,64,230,177,223,170,25,193,89,53,203,147,136,157,112,59,224,99,123,113,105,216,60,142,241,246,169,226,172"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/7'/0/0",
      address: "3AtcnLE36SvJryNQCPwFRmwkMVXUPCuv9m",
      privateKeyWIF: "KxkhaahdceY4dMgKpPAoVaqonJxYteRGWhsogfxRtXc8SoArqVbJ",
      privateKeyHex: "45,199,148,76,170,125,195,148,85,182,186,168,4,183,39,223,59,141,64,204,134,250,79,188,33,59,113,92,225,158,64,156",
      publicKey: "3,57,92,52,18,64,230,177,223,170,25,193,89,53,203,147,136,157,112,59,224,99,123,113,105,216,60,142,241,246,169,226,172"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/7'/0/0",
      address: "bc1qwzve4mlrcgwx0l6hucaujrzxcuzyudvqmx5fdu",
      privateKeyWIF: "L4CqFbnRd4wrocH1xe2AQSfroVcrcF4rgPPuQLWwHW25UicxQVNy",
      privateKeyHex: "208,104,247,160,242,247,131,191,113,36,52,214,239,84,104,92,142,99,189,180,49,160,126,45,59,74,211,105,99,244,248,157",
      publicKey: "2,37,91,212,143,55,70,55,79,153,150,182,196,213,102,117,1,109,41,240,34,23,247,243,193,245,116,44,226,134,162,144,57"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/7'/0/0",
      address: "bc1p9xwu6v5kduusv23w3d9f54vcf9crutcggdspk7fyuhx73jetry9qmv7hev",
      privateKeyWIF: "Kz2LEm1g1okXCe3yPmKGC2gEYk47tB3o6GkpY3eANKmoFvTznigs",
      privateKeyHex: "83,168,161,154,161,208,137,221,101,193,26,10,233,121,54,101,137,182,26,184,154,122,237,41,109,44,194,189,97,88,221,37",
      publicKey: "2,33,17,184,25,21,162,25,44,213,242,118,195,47,181,119,53,150,81,188,163,152,233,120,49,219,52,176,188,121,24,172,245",
      internalPubkey: "33,17,184,25,21,162,25,44,213,242,118,195,47,181,119,53,150,81,188,163,152,233,120,49,219,52,176,188,121,24,172,245"
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
