#!/usr/bin/env node

/**
 * Install Native Build Packages Script
 * Special handling for packages that require node-gyp and native compilation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log file setup
const logFile = path.join(__dirname, 'native-packages-install.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

// Native build packages with special requirements
const nativePackages = [
  {
    name: '@hashgraph/sdk',
    blockchain: 'Hedera (HBAR)',
    requirements: ['node-gyp', 'Python 3.x', 'Visual Studio Build Tools'],
    optional: true,
    reason: 'Native cryptographic operations'
  },
  {
    name: '@iota/sdk',
    blockchain: 'IOTA',
    requirements: ['Rust', 'node-gyp'],
    optional: true,
    reason: 'Rust-based WASM bindings'
  },
  {
    name: '@zondax/filecoin-signing-tools',
    blockchain: 'Filecoin (FIL)',
    requirements: ['node-gyp', 'C++ compiler'],
    optional: true,
    reason: 'Native signing operations'
  },
  {
    name: '@zilliqa-js/zilliqa',
    blockchain: 'Zilliqa (ZIL)',
    requirements: ['node-gyp', 'Python'],
    optional: true,
    reason: 'Native cryptographic bindings'
  },
  {
    name: '@onflow/fcl',
    blockchain: 'Flow (FLOW)',
    requirements: ['node-gyp'],
    optional: true,
    reason: 'WebSocket native dependencies'
  },
  {
    name: '@onflow/types',
    blockchain: 'Flow (FLOW)',
    requirements: ['node-gyp'],
    optional: true,
    reason: 'Native type serialization'
  },
  {
    name: '@multiversx/sdk-wallet',
    blockchain: 'MultiversX (EGLD)',
    requirements: ['node-gyp', 'C++ compiler'],
    optional: true,
    reason: 'Native wallet operations'
  },
  {
    name: 'casper-js-sdk',
    blockchain: 'Casper (CSPR)',
    requirements: ['node-gyp', 'Rust'],
    optional: true,
    reason: 'Rust-based cryptographic operations'
  },
  {
    name: 'monero-ts',
    blockchain: 'Monero (XMR)',
    requirements: ['node-gyp', 'C++ compiler', 'Boost libraries'],
    optional: true,
    reason: 'Native Monero cryptography (replaces deprecated monero-javascript)',
    note: 'Use monero-ts instead of monero-javascript'
  }
];

function banner(message, color = 'cyan') {
  console.log('');
  console.log(`${colors.bright}${colors[color]}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}║${colors.reset}  ${colors.bright}${colors[color]}${message.padEnd(56)}${colors.reset}  ${colors.bright}${colors[color]}║${colors.reset}`);
  console.log(`${colors.bright}${colors[color]}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
}

function checkNodeGyp() {
  try {
    execSync('node-gyp --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkPython() {
  try {
    const output = execSync('python --version', { stdio: 'pipe', encoding: 'utf8' });
    return output.includes('Python 3');
  } catch (error) {
    try {
      const output = execSync('python3 --version', { stdio: 'pipe', encoding: 'utf8' });
      return output.includes('Python 3');
    } catch (error2) {
      return false;
    }
  }
}

function checkVSBuildTools() {
  try {
    // Check for Visual Studio or Build Tools
    execSync('where cl.exe', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

async function installPackageIndividually(pkg, index, total) {
  console.log('');
  console.log(`${colors.bright}${colors.cyan}╭─────────────────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}│${colors.reset} ${colors.bright}Package ${index + 1}/${total}: ${pkg.name.padEnd(43)}${colors.reset} ${colors.bright}${colors.cyan}│${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╰─────────────────────────────────────────────────────────────╯${colors.reset}`);
  console.log('');

  console.log(`${colors.bright}${colors.magenta}🔗 Blockchain:${colors.reset} ${pkg.blockchain}`);
  console.log(`${colors.bright}${colors.yellow}📋 Requirements:${colors.reset}`);
  pkg.requirements.forEach(req => {
    console.log(`   ${colors.gray}• ${req}${colors.reset}`);
  });
  console.log(`${colors.gray}⚙️  Reason: ${pkg.reason}${colors.reset}`);
  if (pkg.note) {
    console.log(`${colors.yellow}📌 Note: ${pkg.note}${colors.reset}`);
  }
  console.log('');

  log(`\n========== Installing: ${pkg.name} (${pkg.blockchain}) ==========`);

  const command = `npm install ${pkg.name} --legacy-peer-deps --build-from-source`;

  console.log(`${colors.gray}⚡ Command: ${command}${colors.reset}`);
  console.log(`${colors.gray}⏳ This may take a few minutes...${colors.reset}`);
  console.log('');

  try {
    const output = execSync(command, {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    console.log(`${colors.bright}${colors.green}✅ ${pkg.name} installed successfully!${colors.reset}`);
    log(`SUCCESS: ${pkg.name} installed`);
    if (output) log(`Output: ${output}`);

    return { success: true, package: pkg.name, error: null };
  } catch (error) {
    console.log(`${colors.bright}${colors.red}❌ ${pkg.name} installation failed${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}💡 Tip: Check if all requirements are installed${colors.reset}`);

    log(`FAILED: ${pkg.name}`);
    log(`Error: ${error.message}`);
    if (error.stderr) log(`Stderr: ${error.stderr.toString()}`);

    return { success: false, package: pkg.name, error: error.message };
  }
}

async function main() {
  banner('🔧 Native Build Packages Installer', 'cyan');

  console.log(`${colors.bright}${colors.yellow}⚠️  WARNING: These packages require native compilation${colors.reset}`);
  console.log(`${colors.gray}They need node-gyp, Python, C++/Rust compilers, and build tools.${colors.reset}`);
  console.log('');

  // Check prerequisites
  console.log(`${colors.bright}${colors.cyan}🔍 Checking Prerequisites:${colors.reset}`);

  const hasNodeGyp = checkNodeGyp();
  const hasPython = checkPython();
  const hasVSBuildTools = checkVSBuildTools();

  console.log(`   ${hasNodeGyp ? colors.green + '✅' : colors.red + '❌'} node-gyp: ${hasNodeGyp ? 'Installed' : 'Not found'}${colors.reset}`);
  console.log(`   ${hasPython ? colors.green + '✅' : colors.red + '❌'} Python 3.x: ${hasPython ? 'Installed' : 'Not found'}${colors.reset}`);
  console.log(`   ${hasVSBuildTools ? colors.green + '✅' : colors.red + '❌'} Visual Studio Build Tools: ${hasVSBuildTools ? 'Installed' : 'Not found'}${colors.reset}`);
  console.log('');

  if (!hasNodeGyp || !hasPython) {
    console.log(`${colors.bright}${colors.red}⚠️  Missing Prerequisites!${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}To install missing tools:${colors.reset}`);
    if (!hasNodeGyp) {
      console.log(`   ${colors.cyan}node-gyp:${colors.reset} npm install -g node-gyp`);
    }
    if (!hasPython) {
      console.log(`   ${colors.cyan}Python 3:${colors.reset} Download from https://www.python.org/downloads/`);
    }
    if (!hasVSBuildTools) {
      console.log(`   ${colors.cyan}VS Build Tools:${colors.reset} npm install -g windows-build-tools`);
      console.log(`   ${colors.gray}or download from: https://visualstudio.microsoft.com/downloads/${colors.reset}`);
    }
    console.log('');
    console.log(`${colors.yellow}Continue anyway? These packages are OPTIONAL.${colors.reset}`);
    console.log('');
  }

  console.log(`${colors.bright}${colors.cyan}📦 Packages to Install: ${nativePackages.length}${colors.reset}`);
  console.log(`${colors.gray}Each package will be installed individually to isolate errors.${colors.reset}`);
  console.log('');

  await new Promise(resolve => setTimeout(resolve, 3000));

  const startTime = Date.now();
  const results = [];

  log('\n' + '='.repeat(70));
  log('NATIVE PACKAGES INSTALLATION STARTED');
  log('='.repeat(70));

  // Install each package individually
  for (let i = 0; i < nativePackages.length; i++) {
    const result = await installPackageIndividually(nativePackages[i], i, nativePackages.length);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('');
  banner('✨ Installation Complete!', 'green');

  console.log(`${colors.bright}${colors.green}📊 Summary:${colors.reset}`);
  console.log(`   ${colors.gray}• Total Packages:${colors.reset} ${colors.bright}${colors.white}${nativePackages.length}${colors.reset}`);
  console.log(`   ${colors.gray}• Time Taken:${colors.reset} ${colors.bright}${colors.yellow}${minutes}m ${seconds}s${colors.reset}`);
  console.log(`   ${colors.gray}• Successful:${colors.reset} ${colors.bright}${colors.green}${successful}${colors.reset}`);
  console.log(`   ${colors.gray}• Failed:${colors.reset} ${colors.bright}${failed > 0 ? colors.red : colors.green}${failed}${colors.reset}`);
  console.log('');

  // Show results
  console.log(`${colors.bright}${colors.cyan}📋 Installation Results:${colors.reset}`);
  results.forEach(result => {
    const status = result.success ? `${colors.green}✅ SUCCESS${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
    console.log(`   ${status} - ${result.package}`);
    if (result.error && result.error.length < 80) {
      console.log(`      ${colors.gray}${result.error}${colors.reset}`);
    }
  });
  console.log('');

  if (failed > 0) {
    console.log(`${colors.bright}${colors.yellow}💡 Note: Failed packages are OPTIONAL${colors.reset}`);
    console.log(`${colors.gray}You can still use the application without them.${colors.reset}`);
    console.log(`${colors.gray}Install prerequisites and run this script again to retry.${colors.reset}`);
    console.log('');
  }

  console.log(`${colors.gray}📚 Log file: ${colors.bright}native-packages-install.log${colors.reset}`);
  console.log('');

  log('\n' + '='.repeat(70));
  log('INSTALLATION COMPLETED');
  log(`Total Time: ${minutes}m ${seconds}s`);
  log(`Successful: ${successful}/${nativePackages.length} | Failed: ${failed}/${nativePackages.length}`);
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
