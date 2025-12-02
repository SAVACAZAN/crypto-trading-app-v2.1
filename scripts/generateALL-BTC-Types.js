/**
 * Complete Bitcoin Address Generator - ALL TYPES
 * Generează TOATE tipurile de adrese Bitcoin pentru fiecare wallet:
 * 1. Legacy (P2PKH) - începe cu "1"
 * 2. Script Hash (P2SH) - începe cu "3"
 * 3. SegWit (P2SH-P2WPKH) - wrapped SegWit, începe cu "3"
 * 4. Native SegWit (P2WPKH) - începe cu "bc1q"
 * 5. Taproot (P2TR) - începe cu "bc1p"
 */

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const fs = require('fs');

// Initialize ECC library for Taproot support
bitcoin.initEccLib(ecc);

// Culori pentru consolă
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Labels pentru wallet-uri
const WALLET_LABELS = [
  { name: 'SAVACAZAN', emoji: '💰', description: 'Pentru economii' },
  { name: 'ALEX', emoji: '👨', description: 'Wallet personal Alex' },
  { name: 'MIRUNA', emoji: '👧', description: 'Wallet personal Miruna' },
  { name: 'INGRID', emoji: '👩', description: 'Wallet personal Ingrid' },
  { name: 'ADI', emoji: '👨‍💼', description: 'Wallet personal Adi' },
  { name: 'MAMA', emoji: '👵', description: 'Wallet pentru mamă' },
  { name: 'TATA', emoji: '👴', description: 'Wallet pentru tată' },
  { name: 'BANK', emoji: '🏦', description: 'Rezervă bancară' },
  { name: 'VAULT', emoji: '🔐', description: 'Seif securizat' },
  { name: 'EU', emoji: '🎯', description: 'Wallet principal' }
];

// Tipuri de adrese Bitcoin
const ADDRESS_TYPES = {
  legacy: {
    name: 'Legacy (P2PKH)',
    icon: '🔑',
    prefix: '1...',
    purpose: 44,
    description: 'Original Bitcoin, compatibilitate maximă, taxe mari'
  },
  scriptHash: {
    name: 'Script Hash (P2SH)',
    icon: '📜',
    prefix: '3...',
    purpose: 49,
    description: 'Multi-signature și scripturi complexe'
  },
  segwit: {
    name: 'SegWit (P2SH-P2WPKH)',
    icon: '⚡',
    prefix: '3...',
    purpose: 49,
    description: 'Wrapped SegWit, compatibilitate bună, taxe moderate'
  },
  nativeSegwit: {
    name: 'Native SegWit (P2WPKH)',
    icon: '🚀',
    prefix: 'bc1q...',
    purpose: 84,
    description: 'SegWit nativ, taxe minime, modern'
  },
  taproot: {
    name: 'Taproot (P2TR)',
    icon: '🌳',
    prefix: 'bc1p...',
    purpose: 86,
    description: 'Cea mai nouă tehnologie, privacy îmbunătățit, smart contracts'
  }
};

function print(text, color = 'white', style = '') {
  const colorCode = colors[color] || colors.white;
  const styleCode = style ? colors[style] : '';
  console.log(`${styleCode}${colorCode}%s${colors.reset}`, text);
}

function printBox(text, color = 'cyan') {
  const width = 80;
  const line = '═'.repeat(width);
  console.log('');
  print('╔' + line + '╗', color);
  print('║' + text.padEnd(width) + '║', color, 'bright');
  print('╚' + line + '╝', color);
}

function generateAllAddressTypes(root, accountIndex) {
  const addresses = {};

  // 1. Legacy (P2PKH) - m/44'/0'/account'/0/0
  const legacyPath = `m/44'/0'/${accountIndex}'/0/0`;
  const legacyChild = root.derivePath(legacyPath);
  const legacyPayment = bitcoin.payments.p2pkh({
    pubkey: legacyChild.publicKey,
    network: bitcoin.networks.bitcoin
  });
  addresses.legacy = {
    type: 'Legacy (P2PKH)',
    path: legacyPath,
    address: legacyPayment.address,
    privateKeyWIF: legacyChild.toWIF(),
    privateKeyHex: legacyChild.privateKey.toString('hex'),
    publicKey: legacyChild.publicKey.toString('hex'),
    icon: ADDRESS_TYPES.legacy.icon,
    prefix: ADDRESS_TYPES.legacy.prefix
  };

  // 2. Script Hash (P2SH) - pentru multi-sig
  const p2shPath = `m/49'/0'/${accountIndex}'/0/0`;
  const p2shChild = root.derivePath(p2shPath);
  // Creăm un script simplu pentru demonstrație
  const p2shPayment = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2pkh({
      pubkey: p2shChild.publicKey,
      network: bitcoin.networks.bitcoin
    }),
    network: bitcoin.networks.bitcoin
  });
  addresses.scriptHash = {
    type: 'Script Hash (P2SH)',
    path: p2shPath,
    address: p2shPayment.address,
    privateKeyWIF: p2shChild.toWIF(),
    privateKeyHex: p2shChild.privateKey.toString('hex'),
    publicKey: p2shChild.publicKey.toString('hex'),
    icon: ADDRESS_TYPES.scriptHash.icon,
    prefix: ADDRESS_TYPES.scriptHash.prefix
  };

  // 3. SegWit (P2SH-P2WPKH) - m/49'/0'/account'/0/0
  const segwitPath = `m/49'/0'/${accountIndex}'/0/0`;
  const segwitChild = root.derivePath(segwitPath);
  const segwitPayment = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: segwitChild.publicKey,
      network: bitcoin.networks.bitcoin
    }),
    network: bitcoin.networks.bitcoin
  });
  addresses.segwit = {
    type: 'SegWit (P2SH-P2WPKH)',
    path: segwitPath,
    address: segwitPayment.address,
    privateKeyWIF: segwitChild.toWIF(),
    privateKeyHex: segwitChild.privateKey.toString('hex'),
    publicKey: segwitChild.publicKey.toString('hex'),
    icon: ADDRESS_TYPES.segwit.icon,
    prefix: ADDRESS_TYPES.segwit.prefix
  };

  // 4. Native SegWit (P2WPKH) - m/84'/0'/account'/0/0
  const nativeSegwitPath = `m/84'/0'/${accountIndex}'/0/0`;
  const nativeSegwitChild = root.derivePath(nativeSegwitPath);
  const nativeSegwitPayment = bitcoin.payments.p2wpkh({
    pubkey: nativeSegwitChild.publicKey,
    network: bitcoin.networks.bitcoin
  });
  addresses.nativeSegwit = {
    type: 'Native SegWit (P2WPKH)',
    path: nativeSegwitPath,
    address: nativeSegwitPayment.address,
    privateKeyWIF: nativeSegwitChild.toWIF(),
    privateKeyHex: nativeSegwitChild.privateKey.toString('hex'),
    publicKey: nativeSegwitChild.publicKey.toString('hex'),
    icon: ADDRESS_TYPES.nativeSegwit.icon,
    prefix: ADDRESS_TYPES.nativeSegwit.prefix
  };

  // 5. Taproot (P2TR) - m/86'/0'/account'/0/0
  const taprootPath = `m/86'/0'/${accountIndex}'/0/0`;
  const taprootChild = root.derivePath(taprootPath);

  // Pentru Taproot, trebuie să folosim doar x-coordinate din public key
  const internalPubkey = taprootChild.publicKey.slice(1, 33); // Remove the prefix byte

  const taprootPayment = bitcoin.payments.p2tr({
    internalPubkey: internalPubkey,
    network: bitcoin.networks.bitcoin
  });

  addresses.taproot = {
    type: 'Taproot (P2TR)',
    path: taprootPath,
    address: taprootPayment.address,
    privateKeyWIF: taprootChild.toWIF(),
    privateKeyHex: taprootChild.privateKey.toString('hex'),
    publicKey: taprootChild.publicKey.toString('hex'),
    internalPubkey: internalPubkey.toString('hex'),
    icon: ADDRESS_TYPES.taproot.icon,
    prefix: ADDRESS_TYPES.taproot.prefix
  };

  return addresses;
}

function displayWalletInfo(wallet, accountIndex, addresses) {
  print(`\n${'═'.repeat(80)}`, 'cyan');
  print(`${wallet.emoji} ${wallet.name} - Wallet #${accountIndex + 1}`, 'yellow', 'bright');
  print(`${wallet.description}`, 'dim');
  print(`${'═'.repeat(80)}`, 'cyan');

  Object.keys(addresses).forEach(type => {
    const addr = addresses[type];
    print(`\n${addr.icon} ${addr.type}`, 'magenta', 'bright');
    print(`├─ 📍 Path: ${addr.path}`, 'cyan');
    print(`├─ 💎 Address: ${addr.address}`, 'green');
    print(`├─ 🔐 Private Key (WIF): ${addr.privateKeyWIF}`, 'red', 'dim');
    print(`├─ 🔑 Private Key (Hex): ${addr.privateKeyHex}`, 'red', 'dim');
    print(`└─ 🌐 Public Key: ${addr.publicKey}`, 'blue', 'dim');
  });
}

function generateCompleteWallets(wordCount = 12, passphrase = '') {
  console.clear();

  printBox('🎯 COMPLETE BITCOIN WALLET GENERATOR - ALL TYPES 🎯', 'magenta');

  // Generate Mnemonic
  printBox('📝 STEP 1: MNEMONIC GENERATION', 'cyan');
  const strength = wordCount === 24 ? 256 : 128;
  const mnemonic = bip39.generateMnemonic(strength);

  print(`\n🎲 Mnemonic Phrase (${wordCount} words):`, 'yellow', 'bright');
  print(`   ${mnemonic}`, 'green', 'bright');
  print(`\n⚠️  PĂSTREAZĂ ACEST MNEMONIC ÎN SIGURANȚĂ!`, 'red', 'bright');
  print(`   Este singura modalitate de a recupera TOATE wallet-urile!`, 'red');

  // Passphrase info
  if (passphrase) {
    printBox('🔐 PASSPHRASE (BIP39 Extension)', 'magenta');
    print(`\n🔑 Passphrase: ${passphrase}`, 'yellow', 'bright');
    print(`\n💡 IMPORTANT:`, 'cyan', 'bright');
    print(`   • Passphrase-ul creează un wallet COMPLET DIFERIT`, 'cyan');
    print(`   • Fără passphrase = wallet diferit cu aceleași 12 cuvinte`, 'cyan');
    print(`   • PĂSTREAZĂ passphrase-ul la fel de sigur ca mnemonic-ul!`, 'red', 'bright');
  } else {
    print(`\n💡 Fără passphrase (implicit = string gol)`, 'dim');
    print(`   Poți adăuga un passphrase pentru securitate extra`, 'dim');
  }

  // Generate Seed with passphrase
  printBox('🌱 STEP 2: MASTER SEED', 'cyan');
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
  const root = bip32.fromSeed(seed);

  if (passphrase) {
    print(`\n🔐 Seed generat cu passphrase: "${passphrase}"`, 'magenta');
  }

  print(`\n🌱 Master Seed:`, 'yellow');
  print(`   ${seed.toString('hex')}`, 'white', 'dim');
  print(`\n🔐 Master Private Key (xprv):`, 'red');
  print(`   ${root.toBase58()}`, 'red', 'dim');
  print(`\n🌐 Master Public Key (xpub):`, 'blue');
  print(`   ${root.neutered().toBase58()}`, 'blue', 'dim');

  // Generate All Wallets with All Address Types
  printBox('💼 STEP 3: GENERATING ALL WALLETS', 'cyan');

  const allWallets = [];

  WALLET_LABELS.forEach((wallet, index) => {
    const addresses = generateAllAddressTypes(root, index);

    allWallets.push({
      index,
      ...wallet,
      addresses
    });

    displayWalletInfo(wallet, index, addresses);
  });

  // Summary Table
  printBox('📊 QUICK REFERENCE - ALL ADDRESS TYPES', 'cyan');

  print(`\n${'─'.repeat(120)}`, 'white');
  print(`WALLET        | LEGACY (1...)          | SEGWIT (3...)          | NATIVE SEGWIT (bc1q...)      | TAPROOT (bc1p...)`, 'white', 'bright');
  print(`${'─'.repeat(120)}`, 'white');

  allWallets.forEach(w => {
    const name = `${w.emoji} ${w.name}`.padEnd(12);
    const legacy = w.addresses.legacy.address.substring(0, 20) + '...';
    const segwit = w.addresses.segwit.address.substring(0, 20) + '...';
    const native = w.addresses.nativeSegwit.address.substring(0, 27) + '...';
    const taproot = w.addresses.taproot.address.substring(0, 20) + '...';
    print(`${name} | ${legacy} | ${segwit} | ${native} | ${taproot}`, 'green');
  });

  print(`${'─'.repeat(120)}`, 'white');

  // Save to files
  printBox('💾 SAVING TO FILES', 'cyan');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const scriptPath = 'C:\\WORK\\react\\TOP BOTZ\\WorkCloude\\crypto-app-github v2.2 - updated COINBASE\\scripts';

  // Create main directory
  const mainDir = `${scriptPath}\\bitcoin-complete-${timestamp}`;
  if (!fs.existsSync(mainDir)) {
    fs.mkdirSync(mainDir, { recursive: true });
  }

  // Save master file with all data
  const masterData = {
    generatedAt: new Date().toISOString(),
    version: 'complete-v1.1-passphrase',
    mnemonic: mnemonic,
    passphrase: passphrase,
    hasPassphrase: !!passphrase,
    wordCount: wordCount,
    masterSeed: seed.toString('hex'),
    masterPrivateKey: root.toBase58(),
    masterPublicKey: root.neutered().toBase58(),
    totalWallets: allWallets.length,
    wallets: allWallets.map(w => ({
      index: w.index,
      name: w.name,
      emoji: w.emoji,
      description: w.description,
      addresses: w.addresses
    }))
  };

  const masterFile = `${mainDir}\\MASTER-all-wallets.json`;
  fs.writeFileSync(masterFile, JSON.stringify(masterData, null, 2), 'utf8');
  print(`\n✅ Master file: MASTER-all-wallets.json`, 'green');

  // Save each wallet to separate JS file
  allWallets.forEach(w => {
    const walletFile = `${mainDir}\\${w.index + 1}-${w.name.toLowerCase()}.js`;

    const content = `/**
 * ${w.emoji} ${w.name} - Complete Bitcoin Wallet
 * ${w.description}
 * Generated: ${new Date().toISOString()}
 *
 * ⚠️  KEEP THIS FILE SECURE! Contains private keys!
 * ${passphrase ? '⚠️  This wallet uses a BIP39 PASSPHRASE! Both mnemonic + passphrase are required!' : ''}
 */

module.exports = {
  // Wallet Info
  name: "${w.name}",
  emoji: "${w.emoji}",
  description: "${w.description}",
  index: ${w.index},

  // Mnemonic (shared across all wallets)
  mnemonic: "${mnemonic}",

  // BIP39 Passphrase
  hasPassphrase: ${!!passphrase},
  passphrase: "${passphrase}",  // ⚠️  Required for wallet recovery!

  // ALL ADDRESS TYPES
  addresses: {
    // 🔑 Legacy (P2PKH) - starts with "1"
    legacy: {
      type: "${w.addresses.legacy.type}",
      path: "${w.addresses.legacy.path}",
      address: "${w.addresses.legacy.address}",
      privateKeyWIF: "${w.addresses.legacy.privateKeyWIF}",
      privateKeyHex: "${w.addresses.legacy.privateKeyHex}",
      publicKey: "${w.addresses.legacy.publicKey}"
    },

    // 📜 Script Hash (P2SH) - starts with "3"
    scriptHash: {
      type: "${w.addresses.scriptHash.type}",
      path: "${w.addresses.scriptHash.path}",
      address: "${w.addresses.scriptHash.address}",
      privateKeyWIF: "${w.addresses.scriptHash.privateKeyWIF}",
      privateKeyHex: "${w.addresses.scriptHash.privateKeyHex}",
      publicKey: "${w.addresses.scriptHash.publicKey}"
    },

    // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
    segwit: {
      type: "${w.addresses.segwit.type}",
      path: "${w.addresses.segwit.path}",
      address: "${w.addresses.segwit.address}",
      privateKeyWIF: "${w.addresses.segwit.privateKeyWIF}",
      privateKeyHex: "${w.addresses.segwit.privateKeyHex}",
      publicKey: "${w.addresses.segwit.publicKey}"
    },

    // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
    nativeSegwit: {
      type: "${w.addresses.nativeSegwit.type}",
      path: "${w.addresses.nativeSegwit.path}",
      address: "${w.addresses.nativeSegwit.address}",
      privateKeyWIF: "${w.addresses.nativeSegwit.privateKeyWIF}",
      privateKeyHex: "${w.addresses.nativeSegwit.privateKeyHex}",
      publicKey: "${w.addresses.nativeSegwit.publicKey}"
    },

    // 🌳 Taproot (P2TR) - starts with "bc1p"
    taproot: {
      type: "${w.addresses.taproot.type}",
      path: "${w.addresses.taproot.path}",
      address: "${w.addresses.taproot.address}",
      privateKeyWIF: "${w.addresses.taproot.privateKeyWIF}",
      privateKeyHex: "${w.addresses.taproot.privateKeyHex}",
      publicKey: "${w.addresses.taproot.publicKey}",
      internalPubkey: "${w.addresses.taproot.internalPubkey}"
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
    return \`https://mempool.space/address/\${address}\`;
  }
};

// Example usage:
// const wallet = require('./${w.index + 1}-${w.name.toLowerCase()}.js');
// console.log('Native SegWit:', wallet.getAddress('nativeSegwit'));
// console.log('Taproot:', wallet.getAddress('taproot'));
// console.log('All addresses:', wallet.getAllAddresses());
`;

    fs.writeFileSync(walletFile, content, 'utf8');
    print(`✅ ${w.index + 1}-${w.name.toLowerCase()}.js`, 'green');
  });

  print(`\n📁 All files saved in: bitcoin-complete-${timestamp}/`, 'cyan');
  print(`\n🔒 KEEP ALL FILES SECURE!`, 'red', 'bright');

  // Documentation
  printBox('📚 ADDRESS TYPES EXPLAINED', 'blue');

  Object.keys(ADDRESS_TYPES).forEach(key => {
    const type = ADDRESS_TYPES[key];
    print(`\n${type.icon} ${type.name}`, 'cyan', 'bright');
    print(`   Prefix: ${type.prefix}`, 'yellow');
    print(`   ${type.description}`, 'white');
  });

  printBox('✅ GENERATION COMPLETE!', 'green');

  print(`\n🎉 Successfully generated ${allWallets.length} complete wallets!`, 'green', 'bright');
  print(`📊 Each wallet has ${Object.keys(ADDRESS_TYPES).length} different address types`, 'cyan');
  print(`💾 All data saved with full backup`, 'cyan');
  print(`\n⚠️  IMPORTANT: Keep the mnemonic safe - it restores ALL wallets!\n`, 'yellow', 'bright');

  return { mnemonic, allWallets, masterData };
}

// CLI
const args = process.argv.slice(2);
let wordCount = 12;
let passphrase = '';

args.forEach(arg => {
  if (arg === '--help' || arg === '-h') {
    console.log(`
🎯 Complete Bitcoin Wallet Generator - ALL TYPES

USAGE:
  node generateALL-BTC-Types.js [options]

OPTIONS:
  --24                     Generate 24-word mnemonic (default: 12)
  --passphrase="text"      BIP39 passphrase (13th word) - OPTIONAL
  --help, -h               Show this help

GENERATES ALL ADDRESS TYPES:
  🔑 Legacy (P2PKH)         - starts with "1"     - Original Bitcoin
  📜 Script Hash (P2SH)     - starts with "3"     - Multi-signature
  ⚡ SegWit (P2SH-P2WPKH)   - starts with "3"     - Wrapped SegWit
  🚀 Native SegWit (P2WPKH) - starts with "bc1q"  - Modern, low fees
  🌳 Taproot (P2TR)         - starts with "bc1p"  - Newest, privacy

PASSPHRASE SECURITY:
  • Adds extra layer of security (acts as 13th/25th word)
  • Same mnemonic + different passphrase = COMPLETELY DIFFERENT wallets
  • If you lose the passphrase, you CANNOT recover the wallets
  • Empty passphrase (default) is valid and standard
  • Must remember BOTH mnemonic AND passphrase

EXAMPLES:
  node generateALL-BTC-Types.js
  node generateALL-BTC-Types.js --24
  node generateALL-BTC-Types.js --passphrase="MySecretWord123"
  node generateALL-BTC-Types.js --24 --passphrase="MySecretWord123"

OUTPUT:
  • Master JSON file with all data (includes passphrase info)
  • Individual JS files for each wallet
  • All files include ALL 5 address types
  • Complete backup and recovery information

⚠️  WARNING:
  • Passphrase is NOT saved in plain text for security
  • You MUST remember your passphrase separately
  • Without passphrase, different wallets are generated
`);
    process.exit(0);
  } else if (arg === '--24') {
    wordCount = 24;
  } else if (arg.startsWith('--passphrase=')) {
    passphrase = arg.split('=')[1].replace(/^["']|["']$/g, ''); // Remove quotes if present
  }
});

generateCompleteWallets(wordCount, passphrase);
