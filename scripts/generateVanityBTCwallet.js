/**
 * Bitcoin Vanity Address Generator
 * Generează adrese Bitcoin care încep cu text personalizat
 *
 * NOTĂ: Generarea de vanity addresses este FOARTE intensivă computațional!
 * Cu cât prefixul este mai lung, cu atât durează mai mult.
 */

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const crypto = require('crypto');

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

// Vanity prefixes pentru fiecare wallet
const VANITY_WALLETS = [
  { label: '💰 SAVACAZAN', prefix: 'bc1savacazan', emoji: '💰' },
  { label: '👨 ALEX', prefix: 'bc1alex', emoji: '👨' },
  { label: '👧 MIRUNA', prefix: 'bc1miruna', emoji: '👧' },
  { label: '👩 INGRID', prefix: 'bc1ingrid', emoji: '👩' },
  { label: '👨‍💼 ADI', prefix: 'bc1adi', emoji: '👨‍💼' },
  { label: '👵 MAMA', prefix: 'bc1mama', emoji: '👵' },
  { label: '👴 TATA', prefix: 'bc1tata', emoji: '👴' },
  { label: '🏦 BANK', prefix: 'bc1bank', emoji: '🏦' },
  { label: '🔐 VAULT', prefix: 'bc1vault', emoji: '🔐' },
  { label: '🎯 EU', prefix: 'bc1eu', emoji: '🎯' }
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
  // Bech32 character set: qpzry9x8gf2tvdw0s3jn54khce6mua7l
  const bech32Charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  return bech32Charset.includes(char.toLowerCase());
}

function validatePrefix(prefix) {
  // Native SegWit addresses start with bc1 (mainnet)
  if (!prefix.startsWith('bc1')) {
    return false;
  }

  // Check if all characters after bc1 are valid bech32 characters
  const chars = prefix.substring(3).toLowerCase();
  for (let char of chars) {
    if (!isValidBech32Char(char)) {
      return false;
    }
  }

  return true;
}

function estimateAttempts(prefix) {
  // Calculate approximate number of attempts needed
  // For bech32, there are 32 possible characters
  const validChars = prefix.substring(3); // Remove 'bc1'
  const attempts = Math.pow(32, validChars.length);
  return attempts;
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}

function generateVanityAddress(prefix, maxAttempts = 10000000) {
  print(`\n🔍 Searching for address starting with: ${prefix}`, 'cyan', 'bright');

  if (!validatePrefix(prefix)) {
    print(`❌ Invalid prefix! Characters after 'bc1' must be valid bech32 characters.`, 'red');
    print(`   Valid characters: qpzry9x8gf2tvdw0s3jn54khce6mua7l`, 'yellow');
    return null;
  }

  const estimatedAttempts = estimateAttempts(prefix);
  print(`📊 Estimated attempts needed: ~${formatNumber(estimatedAttempts)}`, 'yellow');
  print(`⏱️  This may take a while... Press Ctrl+C to stop.`, 'dim');

  let attempts = 0;
  let found = false;
  let result = null;
  const startTime = Date.now();
  let lastUpdate = startTime;

  while (!found && attempts < maxAttempts) {
    attempts++;

    // Generate random private key
    const privateKey = crypto.randomBytes(32);
    const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey, { network: bitcoin.networks.bitcoin });

    // Generate Native SegWit address (bc1...)
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.bitcoin
    });

    // Show progress every 10000 attempts
    const now = Date.now();
    if (now - lastUpdate > 1000) {
      const elapsed = (now - startTime) / 1000;
      const rate = attempts / elapsed;
      process.stdout.write(`\r🔎 Attempts: ${formatNumber(attempts)} | Rate: ${formatNumber(rate)}/s | Time: ${elapsed.toFixed(1)}s`);
      lastUpdate = now;
    }

    // Check if address starts with desired prefix
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
    const elapsed = (Date.now() - startTime) / 1000;
    print(`\n✅ FOUND after ${formatNumber(attempts)} attempts in ${elapsed.toFixed(2)}s!`, 'green', 'bright');
    print(`   Address: ${result.address}`, 'green');
  } else {
    print(`\n⚠️  Not found after ${formatNumber(maxAttempts)} attempts. Try a shorter prefix.`, 'yellow');
  }

  return result;
}

function displayWalletInfo(wallet, walletData) {
  print(`\n┌─ ${wallet.label}`, 'yellow', 'bright');
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
  print(`│  📊 Stats:`, 'cyan');
  print(`│     Attempts: ${formatNumber(walletData.attempts)}`, 'white');
  print(`│     Time: ${walletData.timeSeconds.toFixed(2)}s`, 'white');
  print(`└${'─'.repeat(78)}`, 'dim');
}

async function generateAllVanityWallets(maxAttemptsPerWallet = 10000000) {
  console.clear();

  printBox('🎯 BITCOIN VANITY ADDRESS GENERATOR 🎯', 'magenta');

  print(`\n⚠️  IMPORTANT NOTES:`, 'yellow', 'bright');
  print(`   • Vanity address generation is computationally intensive`, 'yellow');
  print(`   • Shorter prefixes are MUCH faster to generate`, 'yellow');
  print(`   • Each additional character increases difficulty by ~32x`, 'yellow');
  print(`   • This process generates RANDOM private keys (not from a seed)`, 'yellow');
  print(`   • You will NOT be able to restore all wallets from one mnemonic`, 'yellow');

  printBox('📝 GENERATING VANITY WALLETS', 'cyan');

  const generatedWallets = [];

  for (let i = 0; i < VANITY_WALLETS.length; i++) {
    const wallet = VANITY_WALLETS[i];

    printBox(`${i + 1}/10: ${wallet.label}`, 'blue');

    const result = generateVanityAddress(wallet.prefix, maxAttemptsPerWallet);

    if (result) {
      generatedWallets.push({
        ...wallet,
        ...result
      });
      displayWalletInfo(wallet, result);
    } else {
      print(`\n❌ Could not generate vanity address for ${wallet.label}`, 'red');
      print(`   Prefix "${wallet.prefix}" might be too long or contain invalid characters.`, 'yellow');
      print(`   Skipping this wallet...`, 'yellow');
    }
  }

  // Summary
  printBox('📊 GENERATION SUMMARY', 'cyan');

  if (generatedWallets.length > 0) {
    print(`\n✅ Successfully generated ${generatedWallets.length}/${VANITY_WALLETS.length} wallets\n`, 'green', 'bright');

    print(`┌─────┬──────────────────┬────────────────────────────────────────────────┐`, 'white');
    print(`│ No. │ Wallet Label     │ Bitcoin Address                                │`, 'white', 'bright');
    print(`├─────┼──────────────────┼────────────────────────────────────────────────┤`, 'white');

    generatedWallets.forEach((wallet, index) => {
      const labelPadded = wallet.label.padEnd(16);
      const num = String(index + 1).padStart(3);
      print(`│ ${num} │ ${labelPadded} │ ${wallet.address.padEnd(46)} │`, 'green');
    });

    print(`└─────┴──────────────────┴────────────────────────────────────────────────┘`, 'white');

    const totalAttempts = generatedWallets.reduce((sum, w) => sum + w.attempts, 0);
    const totalTime = generatedWallets.reduce((sum, w) => sum + w.timeSeconds, 0);

    print(`\n📊 Total Statistics:`, 'cyan', 'bright');
    print(`   Total Attempts: ${formatNumber(totalAttempts)}`, 'white');
    print(`   Total Time: ${totalTime.toFixed(2)}s`, 'white');
    print(`   Average Rate: ${formatNumber(totalAttempts / totalTime)}/s`, 'white');
  } else {
    print(`\n❌ No wallets were generated successfully.`, 'red');
    print(`   Try using shorter prefixes or increase max attempts.`, 'yellow');
  }

  // Security Warning
  printBox('🔒 SECURITY WARNING', 'red');

  print(`\n⚠️  CRITICAL DIFFERENCES from standard wallets:`, 'red', 'bright');
  print(`\n❌ DISADVANTAGES:`, 'red');
  print(`   • Each wallet has a DIFFERENT private key`, 'red');
  print(`   • You CANNOT restore all wallets from one mnemonic`, 'red');
  print(`   • You must backup EACH private key separately`, 'red');
  print(`   • More complex backup and recovery process`, 'red');

  print(`\n💾 BACKUP REQUIREMENTS:`, 'yellow', 'bright');
  print(`   • Save EACH private key (WIF) separately`, 'yellow');
  print(`   • Label each backup with wallet name`, 'yellow');
  print(`   • Store in secure, offline locations`, 'yellow');
  print(`   • Consider using encrypted storage`, 'yellow');

  print(`\n✅ ADVANTAGES:`, 'green');
  print(`   • Custom addresses are easier to recognize`, 'green');
  print(`   • Reduces risk of sending to wrong address`, 'green');
  print(`   • Professional/branded appearance`, 'green');
  print(`   • Each wallet is independently secure`, 'green');

  printBox('✅ GENERATION COMPLETE!', 'green');

  print(`\n🎉 Vanity address generation finished!`, 'green', 'bright');
  print(`⚠️  Remember to backup ALL private keys securely!\n`, 'yellow', 'bright');

  // Save to JSON file
  if (generatedWallets.length > 0) {
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `bitcoin-vanity-wallets-${timestamp}.json`;
    const filepath = `C:\\WORK\\react\\TOP BOTZ\\WorkCloude\\crypto-app-github v2.2 - updated COINBASE\\scripts\\${filename}`;

    const walletData = {
      generatedAt: new Date().toISOString(),
      totalWallets: generatedWallets.length,
      totalAttempts: generatedWallets.reduce((sum, w) => sum + w.attempts, 0),
      totalTimeSeconds: generatedWallets.reduce((sum, w) => sum + w.timeSeconds, 0),
      wallets: generatedWallets.map(w => ({
        label: w.label,
        emoji: w.emoji,
        prefix: w.prefix,
        address: w.address,
        privateKeyWIF: w.privateKeyWIF,
        privateKeyHex: w.privateKeyHex,
        publicKey: w.publicKey,
        attempts: w.attempts,
        timeSeconds: w.timeSeconds
      }))
    };

    fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2), 'utf8');

    print(`\n💾 Wallet data saved to:`, 'green', 'bright');
    print(`   ${filename}`, 'cyan');
    print(`\n⚠️  KEEP THIS FILE SECURE! It contains all private keys!`, 'red', 'bright');
    print(`   Location: scripts/${filename}`, 'yellow');
  }

  return generatedWallets;
}

// Program execution
const args = process.argv.slice(2);
let maxAttempts = 10000000; // 10 million by default

args.forEach(arg => {
  if (arg === '--help' || arg === '-h') {
    console.log(`
🎯 Bitcoin Vanity Address Generator

USAGE:
  node generateVanityBTCwallet.js [options]

OPTIONS:
  --attempts=N     Set max attempts per wallet (default: 10,000,000)
  --help, -h       Show this help message

EXAMPLES:
  node generateVanityBTCwallet.js
  node generateVanityBTCwallet.js --attempts=50000000

DIFFICULTY GUIDE:
  bc1eu         ~1,000 attempts (very fast - seconds)
  bc1adi        ~32,000 attempts (fast - seconds)
  bc1alex       ~1M attempts (moderate - minutes)
  bc1mama       ~1M attempts (moderate - minutes)
  bc1tata       ~1M attempts (moderate - minutes)
  bc1bank       ~1M attempts (moderate - minutes)
  bc1vault      ~32M attempts (slow - may take hours)
  bc1ingrid     ~32M attempts (slow - may take hours)
  bc1miruna     ~1B attempts (very slow - may take days!)
  bc1savacazan  ~1T+ attempts (extremely slow - impractical!)

NOTE:
  • Each additional character increases difficulty by ~32x
  • Shorter prefixes are MUCH faster
  • You may want to use abbreviated versions for longer names
  • For example: bc1sava instead of bc1savacazan

VALID CHARACTERS after 'bc1':
  qpzry9x8gf2tvdw0s3jn54khce6mua7l

WARNING:
  • Vanity addresses do NOT use a mnemonic seed
  • Each wallet has a separate private key that must be backed up
  • You cannot restore all wallets from one seed phrase
`);
    process.exit(0);
  } else if (arg.startsWith('--attempts=')) {
    maxAttempts = parseInt(arg.split('=')[1]);
    print(`Setting max attempts to: ${formatNumber(maxAttempts)}`, 'cyan');
  }
});

// Run the generator
generateAllVanityWallets(maxAttempts).catch(console.error);
