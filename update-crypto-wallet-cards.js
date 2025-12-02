const fs = require('fs');
const path = require('path');

const cardMappings = [
  { oldClick: '@click="generateKujiraWallet"', newClick: '@click="$router.push(\'/Kujira\')"' },
  { oldClick: '@click="generateArchwayWallet"', newClick: '@click="$router.push(\'/Archway\')"' },
  { oldClick: '@click="generateThorchainWallet"', newClick: '@click="$router.push(\'/Thorchain\')"' },
  { oldClick: '@click="generateWavesWallet"', newClick: '@click="$router.push(\'/Waves\')"' },
  { oldClick: '@click="generateZilliqaWallet"', newClick: '@click="$router.push(\'/Zilliqa\')"' },
  { oldClick: '@click="generateNeoWallet"', newClick: '@click="$router.push(\'/NEO\')"' },
  { oldClick: '@click="generateKadenaWallet"', newClick: '@click="$router.push(\'/Kadena\')"' },
  { oldClick: '@click="generateEosWallet"', newClick: '@click="$router.push(\'/EOS\')"' },
  { oldClick: '@click="generateWaxWallet"', newClick: '@click="$router.push(\'/WAX\')"' },
  { oldClick: '@click="generateOntologyWallet"', newClick: '@click="$router.push(\'/Ontology\')"' },
  { oldClick: '@click="generateThetaWallet"', newClick: '@click="$router.push(\'/Theta\')"' },
  { oldClick: '@click="generateCasperWallet"', newClick: '@click="$router.push(\'/Casper\')"' },
  { oldClick: '@click="generateIconWallet"', newClick: '@click="$router.push(\'/ICON\')"' },
  { oldClick: '@click="generateQtumWallet"', newClick: '@click="$router.push(\'/Qtum\')"' },
  { oldClick: '@click="generateErgoWallet"', newClick: '@click="$router.push(\'/Ergo\')"' },
  { oldClick: '@click="generateNemWallet"', newClick: '@click="$router.push(\'/NEM\')"' },
  { oldClick: '@click="generateSymbolWallet"', newClick: '@click="$router.push(\'/Symbol\')"' },
  { oldClick: '@click="generateNervosCkbWallet"', newClick: '@click="$router.push(\'/NervosCKB\')"' },
  { oldClick: '@click="generateAlephZeroWallet"', newClick: '@click="$router.push(\'/AlephZero\')"' },
  { oldClick: '@click="generateRadixWallet"', newClick: '@click="$router.push(\'/Radix\')"' },
  { oldClick: '@click="generateNibiruWallet"', newClick: '@click="$router.push(\'/Nibiru\')"' },
  { oldClick: '@click="generateDymensionWallet"', newClick: '@click="$router.push(\'/Dymension\')"' },
  { oldClick: '@click="generateImmutableXWallet"', newClick: '@click="$router.push(\'/ImmutableX\')"' },
  { oldClick: '@click="generateLoopringWallet"', newClick: '@click="$router.push(\'/Loopring\')"' },
  { oldClick: '@click="generateUltraWallet"', newClick: '@click="$router.push(\'/Ultra\')"' },
  { oldClick: '@click="generateHyperliquidWallet"', newClick: '@click="$router.push(\'/Hyperliquid\')"' },
  { oldClick: '@click="generateConstellationWallet"', newClick: '@click="$router.push(\'/Constellation\')"' },
  { oldClick: '@click="generateLcxWallet"', newClick: '@click="$router.push(\'/LCX\')"' }
];

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

let replacements = 0;
cardMappings.forEach(({ oldClick, newClick }) => {
  if (content.includes(oldClick)) {
    content = content.replace(new RegExp(oldClick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newClick);
    replacements++;
    console.log(`✅ Replaced: ${oldClick} -> ${newClick}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n📊 Total replacements: ${replacements}`);
console.log(`✅ Updated CryptoWallet.vue successfully!`);
