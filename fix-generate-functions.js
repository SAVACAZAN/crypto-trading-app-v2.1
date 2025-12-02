const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { pattern: /await loadAllWallets\(\); \/\/ Refresh wallet counts/g, replace: 'await loadSecretWallets();', context: 'generateSecretWallet' },
];

const functions = [
  { generate: 'generateSecretWallet', load: 'loadSecretWallets' },
  { generate: 'generateKujiraWallet', load: 'loadKujiraWallets' },
  { generate: 'generateArchwayWallet', load: 'loadArchwayWallets' },
  { generate: 'generateThorchainWallet', load: 'loadThorchainWallets' },
  { generate: 'generateWavesWallet', load: 'loadWavesWallets' },
  { generate: 'generateZilliqaWallet', load: 'loadZilliqaWallets' },
  { generate: 'generateNeoWallet', load: 'loadNeoWallets' },
  { generate: 'generateKadenaWallet', load: 'loadKadenaWallets' },
  { generate: 'generateEosWallet', load: 'loadEosWallets' },
  { generate: 'generateWaxWallet', load: 'loadWaxWallets' },
  { generate: 'generateOntologyWallet', load: 'loadOntologyWallets' },
  { generate: 'generateThetaWallet', load: 'loadThetaWallets' },
  { generate: 'generateCasperWallet', load: 'loadCasperWallets' },
  { generate: 'generateIconWallet', load: 'loadIconWallets' },
  { generate: 'generateQtumWallet', load: 'loadQtumWallets' },
  { generate: 'generateErgoWallet', load: 'loadErgoWallets' },
  { generate: 'generateNemWallet', load: 'loadNemWallets' },
  { generate: 'generateSymbolWallet', load: 'loadSymbolWallets' },
  { generate: 'generateNervosCkbWallet', load: 'loadNervosCkbWallets' },
  { generate: 'generateAlephZeroWallet', load: 'loadAlephZeroWallets' },
  { generate: 'generateRadixWallet', load: 'loadRadixWallets' },
  { generate: 'generateNibiruWallet', load: 'loadNibiruWallets' },
  { generate: 'generateDymensionWallet', load: 'loadDymensionWallets' },
  { generate: 'generateImmutableXWallet', load: 'loadImmutableXWallets' },
  { generate: 'generateLoopringWallet', load: 'loadLoopringWallets' },
  { generate: 'generateUltraWallet', load: 'loadUltraWallets' },
  { generate: 'generateHyperliquidWallet', load: 'loadHyperliquidWallets' },
  { generate: 'generateConstellationWallet', load: 'loadConstellationWallets' },
  { generate: 'generateLcxWallet', load: 'loadLcxWallets' }
];

// Replace loadAllWallets() with specific load function in each generate function
functions.forEach(({ generate, load }) => {
  // Find the generate function and replace loadAllWallets with the specific load function
  const regex = new RegExp(`(async function ${generate}\\(\\)[\\s\\S]*?message\\.success\\([^)]+\\);\\s*)await loadAllWallets\\(\\);`, 'g');

  if (content.match(regex)) {
    content = content.replace(regex, `$1await ${load}();`);
    console.log(`✅ Updated ${generate} to call ${load}()`);
  } else {
    console.log(`⚠️  Could not find loadAllWallets in ${generate}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ All generate functions updated!');
