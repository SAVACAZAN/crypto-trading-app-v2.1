/**
 * TOP Bitcoin Multi-Wallet Generator
 * Generează 10 adrese Bitcoin diferite pe același seed
 * Fiecare adresă are propriile chei private/publice dar derive din același mnemonic
 */

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

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
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// Labels pentru fiecare wallet
const WALLET_LABELS = [
  '💰 SAVACAZAN',
  '👨 ALEX',
  '👧 MIRUNA',
  '👩 INGRID',
  '👨‍💼 ADI',
  '👵 MAMA',
  '👴 TATA',
  '🏦 BANK',
  '🔐 VAULT',
  '🎯 EU'
];

// Emoji pentru tipuri de adrese
const ADDRESS_TYPES = {
  legacy: '🔑 Legacy (P2PKH)',
  segwit: '⚡ SegWit (P2SH)',
  native: '🚀 Native SegWit (P2WPKH)'
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

function printSeparator() {
  print('─'.repeat(80), 'dim');
}

function generateWalletAddress(root, accountIndex, addressType = 'native') {
  // BIP44 derivation path: m/purpose'/coin_type'/account'/change/address_index
  // purpose: 44 (legacy), 49 (segwit), 84 (native segwit)
  // coin_type: 0 (Bitcoin)
  // account: 0-9 (pentru fiecare wallet)
  // change: 0 (receiving addresses)
  // address_index: 0 (prima adresă)

  let purpose;
  switch (addressType) {
    case 'legacy':
      purpose = 44;
      break;
    case 'segwit':
      purpose = 49;
      break;
    case 'native':
      purpose = 84;
      break;
    default:
      purpose = 84;
  }

  const path = `m/${purpose}'/0'/${accountIndex}'/0/0`;
  const child = root.derivePath(path);

  let address;
  if (addressType === 'legacy') {
    const { address: addr } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin
    });
    address = addr;
  } else if (addressType === 'segwit') {
    const { address: addr } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.bitcoin
      }),
      network: bitcoin.networks.bitcoin
    });
    address = addr;
  } else {
    const { address: addr } = bitcoin.payments.p2wpkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin
    });
    address = addr;
  }

  return {
    path,
    privateKeyWIF: child.toWIF(),
    privateKeyHex: child.privateKey.toString('hex'),
    publicKey: child.publicKey.toString('hex'),
    address
  };
}

function displayWalletInfo(label, accountIndex, walletData, addressType) {
  const typeEmoji = ADDRESS_TYPES[addressType];

  print(`\n┌─ ${label} ${typeEmoji}`, 'yellow', 'bright');
  print(`│`, 'dim');
  print(`│  📍 Derivation Path:`, 'cyan');
  print(`│     ${walletData.path}`, 'white');
  print(`│`, 'dim');
  print(`│  💎 Bitcoin Address:`, 'green', 'bright');
  print(`│     ${walletData.address}`, 'green');
  print(`│`, 'dim');
  print(`│  🔐 Private Key (WIF):`, 'red');
  print(`│     ${walletData.privateKeyWIF}`, 'red', 'dim');
  print(`│`, 'dim');
  print(`│  🔑 Private Key (Hex):`, 'red');
  print(`│     ${walletData.privateKeyHex}`, 'red', 'dim');
  print(`│`, 'dim');
  print(`│  🌐 Public Key:`, 'blue');
  print(`│     ${walletData.publicKey}`, 'blue', 'dim');
  print(`└${'─'.repeat(78)}`, 'dim');
}

function generateMultiWallets(wordCount = 12, addressType = 'native') {
  console.clear();

  printBox('🔐 TOP BITCOIN MULTI-WALLET GENERATOR 🔐', 'magenta');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1: Generate Mnemonic
  // ═══════════════════════════════════════════════════════════════════════
  printBox('📝 STEP 1: MNEMONIC SEED GENERATION', 'cyan');

  const strength = wordCount === 24 ? 256 : 128;
  const mnemonic = bip39.generateMnemonic(strength);

  print(`\n🎲 Mnemonic Phrase (${wordCount} words):`, 'yellow', 'bright');
  print(`   ${mnemonic}`, 'green', 'bright');
  print(`\n⚠️  PĂSTREAZĂ ACEST MNEMONIC ÎN SIGURANȚĂ! Este CHEIA pentru toate wallet-urile!`, 'red', 'bright');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2: Generate Seed and Master Key
  // ═══════════════════════════════════════════════════════════════════════
  printBox('🌱 STEP 2: MASTER SEED & ROOT KEY', 'cyan');

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);

  print(`\n🌱 Master Seed:`, 'yellow');
  print(`   ${seed.toString('hex')}`, 'white', 'dim');
  print(`\n🔐 Master Private Key (xprv):`, 'red');
  print(`   ${root.toBase58()}`, 'red', 'dim');
  print(`\n🌐 Master Public Key (xpub):`, 'blue');
  print(`   ${root.neutered().toBase58()}`, 'blue', 'dim');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 3: Generate 10 Wallets
  // ═══════════════════════════════════════════════════════════════════════
  printBox(`🎯 STEP 3: GENERATING 10 WALLETS (${ADDRESS_TYPES[addressType]})`, 'cyan');

  const wallets = [];

  for (let i = 0; i < 10; i++) {
    const walletData = generateWalletAddress(root, i, addressType);
    wallets.push({
      label: WALLET_LABELS[i],
      accountIndex: i,
      ...walletData
    });

    displayWalletInfo(WALLET_LABELS[i], i, walletData, addressType);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 4: Summary Table
  // ═══════════════════════════════════════════════════════════════════════
  printBox('📊 SUMMARY - QUICK REFERENCE', 'cyan');

  print(`\n┌─────┬──────────────────┬────────────────────────────────────────────────┐`, 'white');
  print(`│ No. │ Wallet Label     │ Bitcoin Address                                │`, 'white', 'bright');
  print(`├─────┼──────────────────┼────────────────────────────────────────────────┤`, 'white');

  wallets.forEach((wallet, index) => {
    const labelPadded = wallet.label.padEnd(16);
    const num = String(index + 1).padStart(3);
    print(`│ ${num} │ ${labelPadded} │ ${wallet.address.padEnd(46)} │`, 'green');
  });

  print(`└─────┴──────────────────┴────────────────────────────────────────────────┘`, 'white');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 5: Security Warnings
  // ═══════════════════════════════════════════════════════════════════════
  printBox('🔒 SECURITY INFORMATION', 'red');

  print(`\n❌ NU ÎMPĂRTĂȘI NICIODATĂ:`, 'red', 'bright');
  print(`   • Mnemonic Phrase (cele ${wordCount} cuvinte)`, 'red');
  print(`   • Private Keys (WIF sau Hex)`, 'red');
  print(`   • Master Private Key (xprv)`, 'red');
  print(`   • Seed-ul`, 'red');

  print(`\n✅ POȚI ÎMPĂRTĂȘI:`, 'green', 'bright');
  print(`   • Bitcoin Addresses (adresele publice)`, 'green');
  print(`   • Public Keys (doar pentru verificare)`, 'green');

  print(`\n💡 INFORMAȚII IMPORTANTE:`, 'yellow', 'bright');
  print(`   • Toate cele 10 wallet-uri derivă din ACELAȘI mnemonic`, 'yellow');
  print(`   • Fiecare are chei private diferite`, 'yellow');
  print(`   • Poți restaura TOATE wallet-urile cu un singur mnemonic`, 'yellow');
  print(`   • Folosește derivation paths diferite pentru izolare maximă`, 'yellow');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 6: How to Use
  // ═══════════════════════════════════════════════════════════════════════
  printBox('📚 CUM SĂ FOLOSEȘTI WALLET-URILE', 'blue');

  print(`\n1. 💾 SALVARE MNEMONIC:`, 'cyan', 'bright');
  print(`   • Scrie pe hârtie cele ${wordCount} cuvinte`, 'white');
  print(`   • Păstrează în 2-3 locuri sigure (diferite)`, 'white');
  print(`   • NU stoca pe computer în text simplu!`, 'red');

  print(`\n2. 💰 PRIMIRE BITCOIN:`, 'cyan', 'bright');
  print(`   • Folosește adresele Bitcoin generate (cele verzi)`, 'white');
  print(`   • Fiecare wallet are adresa lui unică`, 'white');
  print(`   • Poți folosi aceeași adresă de mai multe ori`, 'white');

  print(`\n3. 💸 TRIMITERE BITCOIN:`, 'cyan', 'bright');
  print(`   • Importă Private Key (WIF) în wallet software`, 'white');
  print(`   • Sau restaurează din mnemonic`, 'white');
  print(`   • Fiecare wallet poate fi folosit independent`, 'white');

  print(`\n4. 🔄 RESTAURARE:`, 'cyan', 'bright');
  print(`   • Folosește mnemonic-ul în orice wallet BIP44/49/84`, 'white');
  print(`   • Specifică derivation paths pentru fiecare wallet`, 'white');
  print(`   • Exemple: Electrum, Ledger, Trezor, MetaMask`, 'white');

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 7: Derivation Paths Explanation
  // ═══════════════════════════════════════════════════════════════════════
  printBox('🛣️  DERIVATION PATHS EXPLAINED', 'magenta');

  print(`\n📍 Format: m/purpose'/coin_type'/account'/change/address_index`, 'yellow', 'bright');
  print(`\n   • purpose:`, 'cyan');
  print(`     - 44 = Legacy (P2PKH) - adrese "1..."`, 'white');
  print(`     - 49 = SegWit (P2SH) - adrese "3..."`, 'white');
  print(`     - 84 = Native SegWit (P2WPKH) - adrese "bc1..."`, 'white');
  print(`\n   • coin_type: 0 = Bitcoin`, 'cyan');
  print(`\n   • account: 0-9 = Cele 10 wallet-uri diferite`, 'cyan');
  print(`\n   • change: 0 = receiving addresses`, 'cyan');
  print(`\n   • address_index: 0 = prima adresă`, 'cyan');

  // ═══════════════════════════════════════════════════════════════════════
  // FINAL
  // ═══════════════════════════════════════════════════════════════════════
  printBox('✅ WALLET GENERATION COMPLETE!', 'green');

  print(`\n🎉 Ai generat cu succes 10 wallet-uri Bitcoin!`, 'green', 'bright');
  print(`📝 Tip adresă: ${ADDRESS_TYPES[addressType]}`, 'cyan');
  print(`🔐 Mnemonic: ${wordCount} cuvinte`, 'cyan');
  print(`\n⚠️  Următorul pas: SALVEAZĂ MNEMONIC-UL ÎN SIGURANȚĂ!\n`, 'yellow', 'bright');

  return {
    mnemonic,
    seed: seed.toString('hex'),
    masterPrivateKey: root.toBase58(),
    masterPublicKey: root.neutered().toBase58(),
    wallets
  };
}

// ═══════════════════════════════════════════════════════════════════════
// PROGRAM EXECUTION
// ═══════════════════════════════════════════════════════════════════════

// Citește argumentele din linia de comandă
const args = process.argv.slice(2);
let wordCount = 12; // Default: 12 words
let addressType = 'native'; // Default: Native SegWit

// Parse arguments
args.forEach(arg => {
  if (arg === '--24' || arg === '-24') {
    wordCount = 24;
  } else if (arg === '--legacy' || arg === '-l') {
    addressType = 'legacy';
  } else if (arg === '--segwit' || arg === '-s') {
    addressType = 'segwit';
  } else if (arg === '--native' || arg === '-n') {
    addressType = 'native';
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
🔐 TOP Bitcoin Multi-Wallet Generator

USAGE:
  node generatePRIVBTCwallet.js [options]

OPTIONS:
  --24, -24        Generate 24-word mnemonic (default: 12 words)
  --legacy, -l     Generate Legacy addresses (P2PKH, starts with "1")
  --segwit, -s     Generate SegWit addresses (P2SH, starts with "3")
  --native, -n     Generate Native SegWit addresses (P2WPKH, starts with "bc1") [DEFAULT]
  --help, -h       Show this help message

EXAMPLES:
  node generatePRIVBTCwallet.js
  node generatePRIVBTCwallet.js --24
  node generatePRIVBTCwallet.js --legacy
  node generatePRIVBTCwallet.js --24 --segwit

WALLETS GENERATED:
  1.  💰 SAVACAZAN
  2.  👨 ALEX
  3.  👧 MIRUNA
  4.  👩 INGRID
  5.  👨‍💼 ADI
  6.  👵 MAMA
  7.  👴 TATA
  8.  🏦 BANK
  9.  🔐 VAULT
  10. 🎯 EU
`);
    process.exit(0);
  }
});

// Generate the wallets
const result = generateMultiWallets(wordCount, addressType);

// Optional: Save to JSON file (UNCOMMENT IF NEEDED - BE CAREFUL!)
// const fs = require('fs');
// const outputFile = `bitcoin-wallets-${Date.now()}.json`;
// fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
// print(`\n💾 Wallet data saved to: ${outputFile}`, 'yellow');
// print(`⚠️  DELETE THIS FILE after you've saved the mnemonic securely!`, 'red', 'bright');

module.exports = { generateMultiWallets };
