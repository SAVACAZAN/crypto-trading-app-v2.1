// Script to generate load functions for all 28 new networks

const networks = [
  { varName: 'secretWallets', networkName: 'Secret Network' },
  { varName: 'kujiraWallets', networkName: 'Kujira' },
  { varName: 'archwayWallets', networkName: 'Archway' },
  { varName: 'thorchainWallets', networkName: 'Thorchain' },
  { varName: 'wavesWallets', networkName: 'Waves' },
  { varName: 'zilliqaWallets', networkName: 'Zilliqa' },
  { varName: 'neoWallets', networkName: 'NEO' },
  { varName: 'kadenaWallets', networkName: 'Kadena' },
  { varName: 'eosWallets', networkName: 'EOS' },
  { varName: 'waxWallets', networkName: 'WAX' },
  { varName: 'ontologyWallets', networkName: 'Ontology' },
  { varName: 'thetaWallets', networkName: 'Theta Network' },
  { varName: 'casperWallets', networkName: 'Casper Network' },
  { varName: 'iconWallets', networkName: 'ICON' },
  { varName: 'qtumWallets', networkName: 'Qtum' },
  { varName: 'ergoWallets', networkName: 'Ergo' },
  { varName: 'nemWallets', networkName: 'NEM' },
  { varName: 'symbolWallets', networkName: 'Symbol' },
  { varName: 'nervosCkbWallets', networkName: 'Nervos CKB' },
  { varName: 'alephZeroWallets', networkName: 'Aleph Zero' },
  { varName: 'radixWallets', networkName: 'Radix DLT' },
  { varName: 'nibiruWallets', networkName: 'Nibiru Chain' },
  { varName: 'dymensionWallets', networkName: 'Dymension' },
  { varName: 'immutableXWallets', networkName: 'Immutable X' },
  { varName: 'loopringWallets', networkName: 'Loopring' },
  { varName: 'ultraWallets', networkName: 'Ultra.io' },
  { varName: 'hyperliquidWallets', networkName: 'Hyperliquid' },
  { varName: 'constellationWallets', networkName: 'Constellation' },
  { varName: 'lcxWallets', networkName: 'LCX' }
];

const functions = networks.map(({ varName, networkName }) => `
async function load${varName.charAt(0).toUpperCase() + varName.slice(1, -7)}Wallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: '${networkName}'
      }
    });

    if (response.success) {
      ${varName}.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading ${networkName} wallets:', error);
  }
}`).join('\n');

console.log(functions);
console.log('\n\n// onMounted calls:');
const onMountedCalls = networks.map(({ varName }) =>
  `  load${varName.charAt(0).toUpperCase() + varName.slice(1, -7)}Wallets(),`
).join('\n');
console.log(onMountedCalls);
