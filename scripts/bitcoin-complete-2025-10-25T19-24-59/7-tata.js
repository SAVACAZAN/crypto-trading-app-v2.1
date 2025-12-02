/**
 * 👴 TATA - Complete Bitcoin Wallet
 * Wallet pentru tată
 * Generated: 2025-10-25T19:24:59.022Z
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!
 */

module.exports = {
  // Wallet Info
  name: "TATA",
  emoji: "👴",
  description: "Wallet pentru tată",
  index: 6,

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
      path: "m/44'/0'/6'/0/0",
      address: "12RKi1PWu3vCdkP7WVUFrxLVMAW3C7et1x",
      privateKeyWIF: "Kwx9aX7MVYPFe2PFT2gboTkpSvoUxPHHKW2Gcp8kZHYr6jrE884o",
      privateKeyHex: "21,212,229,133,186,115,161,153,53,25,165,94,151,78,78,201,52,113,208,125,29,6,185,196,114,10,210,109,219,175,174,14",
      publicKey: "3,211,72,243,117,72,213,64,238,12,123,96,174,146,30,140,218,99,48,15,96,121,254,61,141,241,236,61,137,175,51,102,143"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "Script Hash (P2SH)",
      path: "m/49'/0'/6'/0/0",
      address: "36ay1DJPbJu6BFPXyD4UY2uqr67Aws7XqW",
      privateKeyWIF: "L316eBhFpzREy4SwEjpnAZ4UhkiarQHLyEiChNqDWrruZUmuDgt8",
      privateKeyHex: "172,137,47,34,160,48,28,155,42,116,69,210,58,178,179,97,176,150,208,134,21,8,144,234,56,83,224,199,114,57,254,160",
      publicKey: "2,55,157,216,168,132,160,220,119,165,181,168,4,239,231,200,49,47,77,145,165,242,54,12,37,69,5,0,12,27,68,57,17"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "SegWit (P2SH-P2WPKH)",
      path: "m/49'/0'/6'/0/0",
      address: "3EjvsfapbBi1fuvQ7LncyvP1VjYDDZa3im",
      privateKeyWIF: "L316eBhFpzREy4SwEjpnAZ4UhkiarQHLyEiChNqDWrruZUmuDgt8",
      privateKeyHex: "172,137,47,34,160,48,28,155,42,116,69,210,58,178,179,97,176,150,208,134,21,8,144,234,56,83,224,199,114,57,254,160",
      publicKey: "2,55,157,216,168,132,160,220,119,165,181,168,4,239,231,200,49,47,77,145,165,242,54,12,37,69,5,0,12,27,68,57,17"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "Native SegWit (P2WPKH)",
      path: "m/84'/0'/6'/0/0",
      address: "bc1qntn5nmgks30nnmjlnc2wyjedpxnla273wwwfzj",
      privateKeyWIF: "KxsAWnnjBj9hZWZP2D9ugFZqbvCbc5n6DDHn1Ayrk9RBbSL5HpXC",
      privateKeyHex: "49,26,234,11,63,11,48,27,3,202,216,63,134,228,222,95,1,19,105,119,65,86,115,249,7,195,246,175,86,207,155,179",
      publicKey: "3,95,206,183,255,17,248,135,113,224,56,33,124,185,88,85,249,106,178,128,74,42,14,157,247,210,189,199,6,103,158,47,161"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "Taproot (P2TR)",
      path: "m/86'/0'/6'/0/0",
      address: "bc1p9vr37xgysjgergcwp5j2jtv6tsucnm79h979p0aw235f88u2qu5s3dteyn",
      privateKeyWIF: "Kzn25QhnWxEh4ux7kuptLbCLjNZLYRp6djEKtaLStM4vVhPg5tXj",
      privateKeyHex: "106,34,5,175,175,187,25,240,154,29,167,32,253,226,191,228,203,135,223,157,27,94,86,21,61,64,52,65,217,89,200,196",
      publicKey: "2,124,249,4,206,70,190,69,27,162,33,147,26,244,130,46,86,116,212,152,209,111,151,124,233,219,138,128,252,190,35,36,57",
      internalPubkey: "124,249,4,206,70,190,69,27,162,33,147,26,244,130,46,86,116,212,152,209,111,151,124,233,219,138,128,252,190,35,36,57"
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
