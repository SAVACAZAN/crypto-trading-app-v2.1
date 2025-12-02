const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

const functions = [
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

let count = 0;

functions.forEach(({ generate, load }) => {
  // Pattern to find: message.success('XXX wallet generated successfully!');
  // Add after it: await loadXXXWallets();

  const regex = new RegExp(`(async function ${generate}\\(\\)[\\s\\S]*?message\\.success\\([^)]+\\);)(\\s*})`, 'g');

  const newContent = content.replace(regex, (match, p1, p2) => {
    if (!match.includes(`await ${load}()`)) {
      count++;
      return `${p1}\n      await ${load}();${p2}`;
    }
    return match;
  });

  if (newContent !== content) {
    content = newContent;
    console.log(`✅ Added ${load}() to ${generate}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Added load calls to ${count} generate functions!`);
