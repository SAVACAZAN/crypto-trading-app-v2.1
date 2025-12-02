#!/usr/bin/env node

/**
 * Install Wallet Packages Script
 * This script installs all necessary packages for non-EVM wallet generation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Log file setup
const logFile = path.join(__dirname, 'wallet-packages-install.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  if (isError) {
    console.error(message);
  }
}

// ANSI color codes and styles
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgMagenta: '\x1b[45m'
};

// Package groups
const phase1Packages = [
  'bitcoinjs-lib',
  'bip32',
  '@solana/web3.js',
  'bs58',
  '@polkadot/keyring',
  '@cosmjs/stargate',
  'stellar-sdk',
  'near-api-js'
];

const phase2Packages = [
  '@emurgo/cardano-serialization-lib-nodejs',
  'cardano-wallet-js',
  'ripple-lib',
  'ripple-keypairs',
  'ton',
  'ton-crypto',
  'ton-core'
];

const phase3Packages = [
  '@taquito/taquito',
  '@taquito/signer',
  // '@hashgraph/sdk', // REMOVED: Native build issues
  '@dfinity/agent',
  '@dfinity/identity',
  // '@iota/sdk', // REMOVED: Native build issues
  'eosjs',
  'eosjs-ecc'
];

const additionalPackages = [
  '@cityofzion/neon-js',
  '@waves/waves-crypto',
  '@stacks/transactions',
  '@stacks/wallet-sdk',
  // 'monero-javascript', // REMOVED: Deprecated, use monero-ts instead
  '@glif/filecoin-address',
  // '@zondax/filecoin-signing-tools', // REMOVED: Native build issues
  'thor-devkit',
  // '@zilliqa-js/zilliqa', // REMOVED: Native build issues
  // '@onflow/fcl', // REMOVED: Native build issues
  // '@onflow/types',
  '@multiversx/sdk-core',
  // '@multiversx/sdk-wallet', // REMOVED: Native build issues
  // 'casper-js-sdk', // REMOVED: Native build issues
  'mina-signer',
  'litecore-lib',
  'bitcore-lib-doge',
  '@psf/bitcoincashjs-lib',
  'bitcore-lib-zcash'
];

// Utility functions
function colorLog(message, color = 'reset', style = '') {
  const styleCode = style && colors[style] ? colors[style] : '';
  const colorCode = colors[color] || colors.reset;
  console.log(`${styleCode}${colorCode}${message}${colors.reset}`);
}

function banner(message, color = 'cyan') {
  console.log('');
  console.log(`${colors.bright}${colors[color]}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}║${colors.reset}  ${colors.bright}${colors[color]}${message.padEnd(56)}${colors.reset}  ${colors.bright}${colors[color]}║${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

function progressBar(current, total, label, color = 'cyan') {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 40);
  const empty = 40 - filled;

  const bar = `${colors[color]}${'█'.repeat(filled)}${colors.gray}${'░'.repeat(empty)}${colors.reset}`;
  const text = `${colors.bright}${colors[color]}${label.padEnd(20)}${colors.reset}`;
  const percent = `${colors.bright}${colors[color]}${percentage}%${colors.reset}`;

  process.stdout.write(`\r${text} [${bar}] ${percent}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearLine() {
  if (process.stdout.isTTY) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }
}

async function installPackages(phaseName, packages, color = 'green', phaseNum, totalPhases) {
  console.log('');
  console.log(`${colors.bright}${colors[color]}╭─────────────────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}│${colors.reset} ${colors.bright}Phase ${phaseNum}/${totalPhases}: ${phaseName.padEnd(45)}${colors.reset} ${colors.bright}${colors[color]}│${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}╰─────────────────────────────────────────────────────────────╯${colors.reset}`);
  console.log('');

  log(`\n========== PHASE ${phaseNum}/${totalPhases}: ${phaseName} ==========`);
  log(`Packages: ${packages.join(', ')}`);

  // Display package list
  console.log(`${colors.bright}${colors[color]}📦 Packages (${packages.length}):${colors.reset}`);
  packages.forEach((pkg, i) => {
    const icon = i % 4 === 0 ? '🔹' : i % 4 === 1 ? '🔸' : i % 4 === 2 ? '💠' : '⬡';
    const pkgColor = i % 4 === 0 ? colors.cyan : i % 4 === 1 ? colors.magenta : i % 4 === 2 ? colors.yellow : colors.green;
    console.log(`   ${colors.gray}${icon}${colors.reset} ${pkgColor}${pkg}${colors.reset}`);
  });
  console.log('');

  const packageString = packages.join(' ');
  const command = `npm install ${packageString} --legacy-peer-deps`;

  console.log(`${colors.gray}⚡ Running: ${command.substring(0, 80)}...${colors.reset}`);
  console.log('');
  log(`Command: ${command}`);

  // Simulate progress with animation
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 2, 95);
    progressBar(progress, 100, `Installing ${phaseName}`, color);
  }, 200);

  try {
    const output = execSync(command, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: __dirname,
      encoding: 'utf8'
    });

    clearInterval(progressInterval);
    progressBar(100, 100, `Installing ${phaseName}`, color);
    console.log('');
    console.log('');
    console.log(`${colors.bright}${colors.green}✅ ${phaseName} completed successfully!${colors.reset}`);

    log(`SUCCESS: ${phaseName} completed`);
    if (output) log(`Output: ${output}`);

    return { success: true, error: null };
  } catch (error) {
    clearInterval(progressInterval);
    console.log('');
    console.log('');
    console.log(`${colors.bright}${colors.yellow}⚠️  ${phaseName} had issues (continuing anyway)${colors.reset}`);
    console.log(`${colors.gray}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.gray}Check ${colors.bright}wallet-packages-install.log${colors.reset}${colors.gray} for details${colors.reset}`);

    log(`WARNING: ${phaseName} failed`, true);
    log(`Error: ${error.message}`, true);
    if (error.stderr) log(`Stderr: ${error.stderr.toString()}`, true);
    if (error.stdout) log(`Stdout: ${error.stdout.toString()}`, true);

    return { success: false, error: error.message };
  }
}

// Main installation process
async function main() {
  banner('🚀 Wallet Packages Installer', 'cyan');

  // Project info
  console.log(`${colors.bright}${colors.cyan}📋 Project Info:${colors.reset}`);
  console.log(`   ${colors.gray}• Name:${colors.reset} Crypto Trading Platform`);
  console.log(`   ${colors.gray}• Type:${colors.reset} Multi-Blockchain Wallet Generator`);
  console.log(`   ${colors.gray}• Blockchains:${colors.reset} 60+ Networks (EVM + Non-EVM)`);
  console.log('');

  console.log(`${colors.bright}${colors.yellow}🔧 Installation Strategy:${colors.reset}`);
  console.log(`${colors.cyan}   • Phase 1: Essential Networks (Bitcoin, Solana, Cosmos, Polkadot)${colors.reset}`);
  console.log(`${colors.magenta}   • Phase 2: Popular Alts (Cardano, Ripple, TON)${colors.reset}`);
  console.log(`${colors.yellow}   • Phase 3: Extended Support (Tezos, Hedera, IOTA, EOS)${colors.reset}`);
  console.log(`${colors.green}   • Phase 4: Additional Networks (20+ chains)${colors.reset}`);
  console.log('');

  const totalPackages = phase1Packages.length + phase2Packages.length +
                        phase3Packages.length + additionalPackages.length;

  console.log(`${colors.bright}${colors.white}📊 Total Packages: ${totalPackages}${colors.reset}`);
  console.log(`${colors.gray}⏱️  Estimated Time: 5-10 minutes${colors.reset}`);
  console.log('');

  await sleep(2000);

  const startTime = Date.now();
  const totalPhases = 4;
  const results = [];

  log('\n' + '='.repeat(70));
  log('WALLET PACKAGES INSTALLATION STARTED');
  log('='.repeat(70));

  // Phase 1: Essential Networks (Bitcoin, Solana, Cosmos, Polkadot, Stellar, Near)
  const result1 = await installPackages('Essential Networks (BTC, SOL, ATOM, DOT)', phase1Packages, 'cyan', 1, totalPhases);
  results.push({ phase: 1, name: 'Essential Networks', ...result1 });

  await sleep(1500);

  // Phase 2: Popular Alts (Cardano, Ripple, TON)
  const result2 = await installPackages('Popular Alternatives (ADA, XRP, TON)', phase2Packages, 'magenta', 2, totalPhases);
  results.push({ phase: 2, name: 'Popular Alternatives', ...result2 });

  await sleep(1500);

  // Phase 3: Extended Support (Tezos, Hedera, ICP, IOTA, EOS)
  const result3 = await installPackages('Extended Support (XTZ, HBAR, ICP, IOTA)', phase3Packages, 'yellow', 3, totalPhases);
  results.push({ phase: 3, name: 'Extended Support', ...result3 });

  await sleep(1500);

  // Phase 4: Additional Networks
  const result4 = await installPackages('Additional Networks (20+ Chains)', additionalPackages, 'green', 4, totalPhases);
  results.push({ phase: 4, name: 'Additional Networks', ...result4 });

  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Count successes and failures
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('');
  banner('✨ Installation Complete!', 'green');

  console.log(`${colors.bright}${colors.green}📊 Summary:${colors.reset}`);
  console.log(`   ${colors.gray}• Total Packages:${colors.reset} ${colors.bright}${colors.green}${totalPackages}${colors.reset}`);
  console.log(`   ${colors.gray}• Time Taken:${colors.reset} ${colors.bright}${colors.yellow}${minutes}m ${seconds}s${colors.reset}`);
  console.log(`   ${colors.gray}• Successful Phases:${colors.reset} ${colors.bright}${colors.green}${successful}/${totalPhases}${colors.reset}`);
  if (failed > 0) {
    console.log(`   ${colors.gray}• Failed Phases:${colors.reset} ${colors.bright}${colors.yellow}${failed}/${totalPhases}${colors.reset}`);
  }
  console.log('');

  // Show phase results
  console.log(`${colors.bright}${colors.cyan}📋 Phase Results:${colors.reset}`);
  results.forEach(result => {
    const status = result.success ? `${colors.green}✅ SUCCESS${colors.reset}` : `${colors.yellow}⚠️  WARNING${colors.reset}`;
    console.log(`   ${status} - Phase ${result.phase}: ${result.name}`);
    if (result.error) {
      console.log(`      ${colors.gray}${result.error}${colors.reset}`);
    }
  });
  console.log('');

  console.log(`${colors.bright}${colors.cyan}🎯 Next Steps:${colors.reset}`);
  console.log(`   ${colors.cyan}1.${colors.reset} Update ${colors.yellow}nuxt.config.ts${colors.reset} with new package configurations`);
  console.log(`   ${colors.cyan}2.${colors.reset} Create API endpoints for non-EVM wallet generation`);
  console.log(`   ${colors.cyan}3.${colors.reset} Add UI buttons for wallet generation in Networks page`);
  console.log(`   ${colors.cyan}4.${colors.reset} Test wallet generation for each blockchain`);
  console.log('');

  console.log(`${colors.gray}📚 Log file: ${colors.bright}wallet-packages-install.log${colors.reset}`);
  console.log(`${colors.gray}📚 Documentation: ${colors.bright}WALLET_PACKAGES.md${colors.reset}`);
  console.log('');

  log('\n' + '='.repeat(70));
  log('INSTALLATION COMPLETED');
  log(`Total Time: ${minutes}m ${seconds}s`);
  log(`Successful: ${successful}/${totalPhases} | Failed: ${failed}/${totalPhases}`);
  log('='.repeat(70));

  logStream.end();
}

// Run the script
main().catch(error => {
  console.error('');
  console.error(`${colors.bright}${colors.red}Fatal error during installation:${colors.reset}`);
  console.error(error);
  process.exit(1);
});
