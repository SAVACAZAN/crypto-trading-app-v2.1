const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

const cards = [
  { name: 'Kujira', symbol: 'KUJI', varName: 'kujiraWallets', totalWallets: 'totalKujiWallets', totalAddresses: 'totalKujiAddresses', className: 'kuji-card' },
  { name: 'Archway', symbol: 'ARCH', varName: 'archwayWallets', totalWallets: 'totalArchWallets', totalAddresses: 'totalArchAddresses', className: 'arch-card' },
  { name: 'Thorchain', symbol: 'RUNE', varName: 'thorchainWallets', totalWallets: 'totalRuneWallets', totalAddresses: 'totalRuneAddresses', className: 'rune-card' },
  { name: 'Waves', symbol: 'WAVES', varName: 'wavesWallets', totalWallets: 'totalWavesWallets', totalAddresses: 'totalWavesAddresses', className: 'waves-card' },
  { name: 'Zilliqa', symbol: 'ZIL', varName: 'zilliqaWallets', totalWallets: 'totalZilWallets', totalAddresses: 'totalZilAddresses', className: 'zil-card' },
  { name: 'NEO', symbol: 'NEO', varName: 'neoWallets', totalWallets: 'totalNeoWallets', totalAddresses: 'totalNeoAddresses', className: 'neo-card' },
  { name: 'Kadena', symbol: 'KDA', varName: 'kadenaWallets', totalWallets: 'totalKdaWallets', totalAddresses: 'totalKdaAddresses', className: 'kda-card' },
  { name: 'EOS', symbol: 'EOS', varName: 'eosWallets', totalWallets: 'totalEosWallets', totalAddresses: 'totalEosAddresses', className: 'eos-card' },
  { name: 'WAX', symbol: 'WAXP', varName: 'waxWallets', totalWallets: 'totalWaxpWallets', totalAddresses: 'totalWaxpAddresses', className: 'waxp-card' },
  { name: 'Ontology', symbol: 'ONT', varName: 'ontologyWallets', totalWallets: 'totalOntWallets', totalAddresses: 'totalOntAddresses', className: 'ont-card' },
  { name: 'Theta Network', symbol: 'THETA', varName: 'thetaWallets', totalWallets: 'totalThetaWallets', totalAddresses: 'totalThetaAddresses', className: 'theta-card' },
  { name: 'Casper Network', symbol: 'CSPR', varName: 'casperWallets', totalWallets: 'totalCsprWallets', totalAddresses: 'totalCsprAddresses', className: 'cspr-card' },
  { name: 'ICON', symbol: 'ICX', varName: 'iconWallets', totalWallets: 'totalIcxWallets', totalAddresses: 'totalIcxAddresses', className: 'icx-card' },
  { name: 'Qtum', symbol: 'QTUM', varName: 'qtumWallets', totalWallets: 'totalQtumWallets', totalAddresses: 'totalQtumAddresses', className: 'qtum-card' },
  { name: 'Ergo', symbol: 'ERG', varName: 'ergoWallets', totalWallets: 'totalErgWallets', totalAddresses: 'totalErgAddresses', className: 'erg-card' },
  { name: 'NEM', symbol: 'XEM', varName: 'nemWallets', totalWallets: 'totalXemWallets', totalAddresses: 'totalXemAddresses', className: 'xem-card' },
  { name: 'Symbol', symbol: 'XYM', varName: 'symbolWallets', totalWallets: 'totalXymWallets', totalAddresses: 'totalXymAddresses', className: 'xym-card' },
  { name: 'Nervos CKB', symbol: 'CKB', varName: 'nervosCkbWallets', totalWallets: 'totalCkbWallets', totalAddresses: 'totalCkbAddresses', className: 'ckb-card' },
  { name: 'Aleph Zero', symbol: 'AZERO', varName: 'alephZeroWallets', totalWallets: 'totalAzeroWallets', totalAddresses: 'totalAzeroAddresses', className: 'azero-card' },
  { name: 'Radix DLT', symbol: 'XRD', varName: 'radixWallets', totalWallets: 'totalXrdWallets', totalAddresses: 'totalXrdAddresses', className: 'xrd-card' },
  { name: 'Nibiru Chain', symbol: 'NIBI', varName: 'nibiruWallets', totalWallets: 'totalNibiWallets', totalAddresses: 'totalNibiAddresses', className: 'nibi-card' },
  { name: 'Dymension', symbol: 'DYM', varName: 'dymensionWallets', totalWallets: 'totalDymWallets', totalAddresses: 'totalDymAddresses', className: 'dym-card' },
  { name: 'Immutable X', symbol: 'IMX', varName: 'immutableXWallets', totalWallets: 'totalImxWallets', totalAddresses: 'totalImxAddresses', className: 'imx-card' },
  { name: 'Loopring', symbol: 'LRC', varName: 'loopringWallets', totalWallets: 'totalLrcWallets', totalAddresses: 'totalLrcAddresses', className: 'lrc-card' },
  { name: 'Ultra.io', symbol: 'UOS', varName: 'ultraWallets', totalWallets: 'totalUosWallets', totalAddresses: 'totalUosAddresses', className: 'uos-card' },
  { name: 'Hyperliquid', symbol: 'HYPE', varName: 'hyperliquidWallets', totalWallets: 'totalHypeWallets', totalAddresses: 'totalHypeAddresses', className: 'hype-card' },
  { name: 'Constellation', symbol: 'DAG', varName: 'constellationWallets', totalWallets: 'totalDagWallets', totalAddresses: 'totalDagAddresses', className: 'dag-card' },
  { name: 'LCX', symbol: 'LCX', varName: 'lcxWallets', totalWallets: 'totalLcxWallets', totalAddresses: 'totalLcxAddresses', className: 'lcx-card' }
];

let updatedCount = 0;

cards.forEach(card => {
  // Find the card comment and structure
  const cardCommentPattern = new RegExp(`<!-- ${card.name} Card -->\\s*<div class="crypto-card ${card.className}"[^>]*>\\s*<div class="card-header">([\\s\\S]*?)</div>\\s*</div>\\s*<div class="card-footer">`, 'g');

  const replacement = `<!-- ${card.name} Card -->
      <div class="crypto-card ${card.className}" @click="$router.push('/${card.name.replace(/\s+/g, '')}')">
        <div class="card-header">$1</div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ ${card.totalWallets} }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ ${card.totalAddresses} }}</span>
          </div>
        </div>

        <div v-if="${card.varName}.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ${card.varName}.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="${card.varName}.length > 2" class="more-indicator">
            +{{ ${card.varName}.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">`;

  if (content.match(cardCommentPattern)) {
    content = content.replace(cardCommentPattern, replacement);
    updatedCount++;
    console.log(`✅ Updated ${card.name} card`);
  } else {
    console.log(`⚠️  Could not find pattern for ${card.name} card`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✅ Updated ${updatedCount} cards successfully!`);
