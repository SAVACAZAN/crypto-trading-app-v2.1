const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add load functions before "onMounted(() =>"
const loadFunctionsCode = fs.readFileSync(path.join(__dirname, 'load-functions-output.txt'), 'utf8');
const functionsOnly = loadFunctionsCode.split('// onMounted calls:')[0].trim();

// Find where to insert (before onMounted)
const onMountedMarker = 'onMounted(() => {';
const onMountedIndex = content.indexOf(onMountedMarker);

if (onMountedIndex !== -1) {
  content = content.slice(0, onMountedIndex) + functionsOnly + '\n\n' + content.slice(onMountedIndex);
  console.log('✅ Added 28 load functions');
} else {
  console.log('❌ Could not find onMounted marker');
}

// 2. Update onMounted to call all load functions
const onMountedCalls = `  loadSecretWallets(),
  loadKujiraWallets(),
  loadArchwayWallets(),
  loadThorchainWallets(),
  loadWavesWallets(),
  loadZilliqaWallets(),
  loadNeoWallets(),
  loadKadenaWallets(),
  loadEosWallets(),
  loadWaxWallets(),
  loadOntologyWallets(),
  loadThetaWallets(),
  loadCasperWallets(),
  loadIconWallets(),
  loadQtumWallets(),
  loadErgoWallets(),
  loadNemWallets(),
  loadSymbolWallets(),
  loadNervosCkbWallets(),
  loadAlephZeroWallets(),
  loadRadixWallets(),
  loadNibiruWallets(),
  loadDymensionWallets(),
  loadImmutableXWallets(),
  loadLoopringWallets(),
  loadUltraWallets(),
  loadHyperliquidWallets(),
  loadConstellationWallets(),
  loadLcxWallets(),`;

// Find the end of await Promise.all in onMounted
const promiseAllPattern = /await Promise\.all\(\[([\s\S]*?)\]\);/;
const match = content.match(promiseAllPattern);

if (match) {
  const existingCalls = match[1];
  const updatedCalls = existingCalls.trim() + ',\n' + onMountedCalls;
  content = content.replace(promiseAllPattern, `await Promise.all([\n${updatedCalls}\n  ]);`);
  console.log('✅ Updated onMounted with new load calls');
} else {
  console.log('❌ Could not find Promise.all in onMounted');
}

// Save the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n📝 File updated successfully!');
console.log('Now need to update card templates manually...');
