/**
 * Bitcoin Vanity Address Generator (FIXED VERSION)
 * Generează adrese Bitcoin cu prefixe VALIDE pentru Bech32
 *
 * Bech32 permite doar: qpzry9x8gf2tvdw0s3jn54khce6mua7l
 * NU permite: b, i, o, 1 (pentru a evita confuzii)
 */

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const crypto = require('crypto');
const fs = require('fs');

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

// Vanity prefixes VALIDE pentru Bech32
// Adaptate pentru a folosi doar caracterele permise
const VANITY_WALLETS = [
  {
    label: '💰 SAVACAZAN',
    originalName: 'SAVACAZAN',
    prefix: 'bc1sava',  // "sava" din "savacazan"
    emoji: '💰',
    difficulty: 'LOW'
  },
  {
    label: '👨 ALEX',
    originalName: 'ALEX',
    prefix: 'bc1alex',  // "alex" complet
    emoji: '👨',
    difficulty: 'MEDIUM'
  },
  {
    label: '👧 MIRUNA',
    originalName: 'MIRUNA',
    prefix: 'bc1mr',    // "mr" din "miruna" (i și u nu sunt permise)
    emoji: '👧',
    difficulty: 'VERY_LOW'
  },
  {
    label: '👩 INGRID',
    originalName: 'INGRID',
    prefix: 'bc1ngr',   // "ngr" din "ingrid" (i și d nu sunt permise)
    emoji: '👩',
    difficulty: 'LOW'
  },
  {
    label: '👨‍💼 ADI',
    originalName: 'ADI',
    prefix: 'bc1ad',    // "ad" din "adi" (i nu este permis)
    emoji: '👨‍💼',
    difficulty: 'VERY_LOW'
  },
  {
    label: '👵 MAMA',
    originalName: 'MAMA',
    prefix: 'bc1mama',  // "mama" complet
    emoji: '👵',
    difficulty: 'MEDIUM'
  },
  {
    label: '👴 TATA',
    originalName: 'TATA',
    prefix: 'bc1tata',  // "tata" complet
    emoji: '👴',
    difficulty: 'MEDIUM'
  },
  {
    label: '🏦 BANK',
    originalName: 'BANK',
    prefix: 'bc1bank',   // "ank" din "bank" (b nu este permis)
    emoji: '🏦',
    difficulty: 'MEDIUM'
  },
  {
    label: '🔐 VAULT',
    originalName: 'VAULT',
    prefix: 'bc1vault',  // "vault" complet
    emoji: '🔐',
    difficulty: 'HIGH'
  },
  {
    label: '🎯 EU',
    originalName: 'EU',
    prefix: 'bc1eu',     // "eu" complet
    emoji: '🎯',
    difficulty: 'VERY_LOW'
  }
];

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

function isValidBech32Char(char) {
  const bech32Charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  return bech32Charset.includes(char.toLowerCase());
}

function validatePrefix(prefix) {
  if (!prefix.startsWith('bc1')) {
    return { valid: false, error: 'Prefix must start with bc1' };
  }

  const chars = prefix.substring(3).toLowerCase();
  for (let char of chars) {
    if (!isValidBech32Char(char)) {
      return { valid: false, error: `Invalid character: '${char}'. Valid: qpzry9x8gf2tvdw0s3jn54khce6mua7l` };
    }
  }

  return { valid: true };
}

function estimateAttempts(prefix) {
  const validChars = prefix.substring(3);
  return Math.pow(32, validChars.length);
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

function generateVanityAddress(prefix, maxAttempts = 10000000) {
  const validation = validatePrefix(prefix);
  if (!validation.valid) {
    print(`❌ ${validation.error}`, 'red');
    return null;
  }

  const estimatedAttempts = estimateAttempts(prefix);
  print(`📊 Estimated: ~${formatNumber(estimatedAttempts)} attempts`, 'yellow');

  let attempts = 0;
  let found = false;
  let result = null;
  const startTime = Date.now();
  let lastUpdate = startTime;

  while (!found && attempts < maxAttempts) {
    attempts++;

    const privateKey = crypto.randomBytes(32);
    const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey, { network: bitcoin.networks.bitcoin });

    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin
    });

    const now = Date.now();
    if (now - lastUpdate > 500) {
      const elapsed = (now - startTime) / 1000;
      const rate = attempts / elapsed;
      process.stdout.write(`\r🔎 ${formatNumber(attempts)} attempts | ${formatNumber(rate)}/s | ${formatTime(elapsed)}`);
      lastUpdate = now;
    }

    if (address.toLowerCase().startsWith(prefix.toLowerCase())) {
      found = true;
      result = {
        address,
        privateKeyWIF: keyPair.toWIF(),
        privateKeyHex: privateKey.toString('hex'),
        publicKey: keyPair.publicKey.toString('hex'),
        attempts,
        timeSeconds: (Date.now() - startTime) / 1000
      };
    }
  }

  if (found) {
    print(`\n✅ FOUND! ${formatNumber(attempts)} attempts in ${formatTime(result.timeSeconds)}`, 'green', 'bright');
  } else {
    print(`\n⚠️  Not found after ${formatNumber(maxAttempts)} attempts`, 'yellow');
  }

  return result;
}

function displayWalletInfo(wallet, walletData) {
  print(`\n┌─ ${wallet.emoji} ${wallet.originalName} (${wallet.prefix})`, 'yellow', 'bright');
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
  print(`│`, 'dim');
  print(`│  📊 Stats: ${formatNumber(walletData.attempts)} attempts in ${formatTime(walletData.timeSeconds)}`, 'cyan');
  print(`└${'─'.repeat(78)}`, 'dim');
}

async function generateAllVanityWallets(maxAttemptsPerWallet = 10000000) {
  console.clear();

  printBox('🎯 BITCOIN VANITY ADDRESS GENERATOR (FIXED)', 'magenta');

  print(`\n📋 Wallet Prefixes (adapted for Bech32 compatibility):`, 'cyan', 'bright');
  VANITY_WALLETS.forEach(w => {
    print(`   ${w.emoji} ${w.originalName.padEnd(12)} → ${w.prefix}`, 'white');
  });

  print(`\n⚠️  IMPORTANT:`, 'yellow', 'bright');
  print(`   • Bech32 only allows: qpzry9x8gf2tvdw0s3jn54khce6mua7l`, 'yellow');
  print(`   • Letters b, i, o, 1 are NOT allowed (to avoid confusion)`, 'yellow');
  print(`   • Some names were adapted to fit these constraints`, 'yellow');

  printBox('🚀 STARTING GENERATION', 'cyan');

  const generatedWallets = [];

  for (let i = 0; i < VANITY_WALLETS.length; i++) {
    const wallet = VANITY_WALLETS[i];

    print(`\n[${i + 1}/10] ${wallet.emoji} ${wallet.originalName} (prefix: ${wallet.prefix})`, 'blue', 'bright');

    const result = generateVanityAddress(wallet.prefix, maxAttemptsPerWallet);

    if (result) {
      generatedWallets.push({
        ...wallet,
        ...result
      });
      displayWalletInfo(wallet, result);
    } else {
      print(`❌ Failed to generate for ${wallet.originalName}`, 'red');
    }
  }

  // Summary
  printBox('📊 GENERATION SUMMARY', 'cyan');

  if (generatedWallets.length > 0) {
    print(`\n✅ Successfully generated ${generatedWallets.length}/${VANITY_WALLETS.length} wallets\n`, 'green', 'bright');

    print(`┌─────┬──────────────┬────────────────────────────────────────────────┐`, 'white');
    print(`│ No. │ Name         │ Bitcoin Address                                │`, 'white', 'bright');
    print(`├─────┼──────────────┼────────────────────────────────────────────────┤`, 'white');

    generatedWallets.forEach((wallet, index) => {
      const name = `${wallet.emoji} ${wallet.originalName}`.padEnd(12);
      const num = String(index + 1).padStart(3);
      print(`│ ${num} │ ${name} │ ${wallet.address.padEnd(46)} │`, 'green');
    });

    print(`└─────┴──────────────┴────────────────────────────────────────────────┘`, 'white');

    const totalAttempts = generatedWallets.reduce((sum, w) => sum + w.attempts, 0);
    const totalTime = generatedWallets.reduce((sum, w) => sum + w.timeSeconds, 0);

    print(`\n📊 Total Statistics:`, 'cyan', 'bright');
    print(`   Wallets Generated: ${generatedWallets.length}`, 'white');
    print(`   Total Attempts: ${formatNumber(totalAttempts)}`, 'white');
    print(`   Total Time: ${formatTime(totalTime)}`, 'white');
    print(`   Average Rate: ${formatNumber(totalAttempts / totalTime)}/s`, 'white');

    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `bitcoin-vanity-wallets-${timestamp}.json`;
    const scriptPath = 'C:\\WORK\\react\\TOP BOTZ\\WorkCloude\\crypto-app-github v2.2 - updated COINBASE\\scripts';
    const filepath = `${scriptPath}\\${filename}`;

    const walletData = {
      generatedAt: new Date().toISOString(),
      version: 'vanity-fixed-v1.0',
      totalWallets: generatedWallets.length,
      totalAttempts,
      totalTimeSeconds: totalTime,
      note: 'Vanity addresses with Bech32-compatible prefixes',
      wallets: generatedWallets.map(w => ({
        label: w.label,
        originalName: w.originalName,
        emoji: w.emoji,
        prefix: w.prefix,
        address: w.address,
        privateKeyWIF: w.privateKeyWIF,
        privateKeyHex: w.privateKeyHex,
        publicKey: w.publicKey,
        attempts: w.attempts,
        timeSeconds: w.timeSeconds,
        difficulty: w.difficulty
      }))
    };

    try {
      fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2), 'utf8');
      print(`\n💾 SAVED TO FILE:`, 'green', 'bright');
      print(`   ${filename}`, 'cyan');
      print(`   Location: scripts/${filename}`, 'yellow');
      print(`\n🔒 KEEP THIS FILE SECURE! Contains all private keys!`, 'red', 'bright');
    } catch (err) {
      print(`\n❌ Error saving file: ${err.message}`, 'red');
    }

  } else {
    print(`\n❌ No wallets were generated.`, 'red');
  }

  // Security Info
  printBox('🔒 SECURITY INFORMATION', 'red');

  print(`\n⚠️  CRITICAL: Vanity Address Limitations:`, 'red', 'bright');
  print(`   • Each wallet has a SEPARATE private key`, 'red');
  print(`   • NO single mnemonic to restore all wallets`, 'red');
  print(`   • Must backup EACH private key individually`, 'red');

  print(`\n💾 Backup Strategy:`, 'yellow', 'bright');
  print(`   1. Save the generated JSON file in a SECURE location`, 'yellow');
  print(`   2. Print a paper backup of all private keys`, 'yellow');
  print(`   3. Store backups in multiple safe locations`, 'yellow');
  print(`   4. Never share private keys with anyone`, 'yellow');

  print(`\n✅ Advantages of Vanity Addresses:`, 'green');
  print(`   • Easy to recognize and verify`, 'green');
  print(`   • Reduces errors when sending/receiving`, 'green');
  print(`   • Professional appearance`, 'green');

  printBox('✅ GENERATION COMPLETE!', 'green');

  return generatedWallets;
}

// CLI
const args = process.argv.slice(2);
let maxAttempts = 10000000;

args.forEach(arg => {
  if (arg === '--help' || arg === '-h') {
    console.log(`
🎯 Bitcoin Vanity Address Generator (FIXED VERSION)

USAGE:
  node generateVanityBTCwallet-FIXED.js [options]

OPTIONS:
  --attempts=N     Max attempts per wallet (default: 10,000,000)
  --help, -h       Show this help

EXAMPLES:
  node generateVanityBTCwallet-FIXED.js
  node generateVanityBTCwallet-FIXED.js --attempts=50000000

WALLET PREFIXES (Bech32-compatible):
  💰 SAVACAZAN → bc1sava    (~32M attempts, ~minutes)
  👨 ALEX      → bc1alex    (~1M attempts, ~seconds-minutes)
  👧 MIRUNA    → bc1mr      (~1K attempts, ~instant)
  👩 INGRID    → bc1ngr     (~32K attempts, ~seconds)
  👨‍💼 ADI       → bc1ad      (~1K attempts, ~instant)
  👵 MAMA      → bc1mama    (~1M attempts, ~seconds-minutes)
  👴 TATA      → bc1tata    (~1M attempts, ~seconds-minutes)
  🏦 BANK      → bc1bank    (~1M attempts, ~seconds-minutes)
  🔐 VAULT     → bc1vault   (~32M attempts, ~minutes-hours)
  🎯 EU        → bc1eu      (~1K attempts, ~instant)

NOTE:
  • Bech32 only allows: qpzry9x8gf2tvdw0s3jn54khce6mua7l
  • Some names were shortened to fit constraints
  • All private keys are saved to a JSON file
`);
    process.exit(0);
  } else if (arg.startsWith('--attempts=')) {
    maxAttempts = parseInt(arg.split('=')[1]);
  }
});

generateAllVanityWallets(maxAttempts).catch(console.error);
