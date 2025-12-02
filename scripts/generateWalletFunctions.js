/**
 * Generate wallet functions for Phase 3+ networks
 * This generates JavaScript functions for generating and loading wallets
 */

const networks = [
  { key: 'Ronin', name: 'Ronin' },
  { key: 'ImmutableZkEVM', name: 'Immutable zkEVM' },
  { key: 'Beam', name: 'Beam' },
  { key: 'Oasys', name: 'Oasys' },
  { key: 'PolygonZkEVM', name: 'Polygon zkEVM' },
  { key: 'Boba', name: 'Boba' },
  { key: 'Metis', name: 'Metis' },
  { key: 'Aurora', name: 'Aurora' },
  { key: 'Redstone', name: 'Redstone' },
  { key: 'OpBNB', name: 'opBNB' },
  { key: 'ArbitrumNova', name: 'Arbitrum Nova' },
  { key: 'Zora', name: 'Zora' },
  { key: 'MantaPacific', name: 'Manta Pacific' },
  { key: 'MorphL2', name: 'Morph L2' },
  { key: 'Xai', name: 'Xai' },
  { key: 'Fraxtal', name: 'Fraxtal' },
  { key: 'Taiko', name: 'Taiko' },
  { key: 'ModeNetwork', name: 'Mode Network' },
  { key: 'Celo', name: 'Celo' },
  { key: 'Hedera', name: 'Hedera' },
  { key: 'Sei', name: 'Sei' },
  { key: 'Kava', name: 'Kava' },
  { key: 'ShimmerEVM', name: 'Shimmer EVM' },
  { key: 'ConfluxESpace', name: 'Conflux eSpace' },
  { key: 'OasisEmerald', name: 'Oasis Emerald' },
  { key: 'EnergyWeb', name: 'Energy Web' },
  { key: 'TelosEVM', name: 'Telos EVM' },
  { key: 'HorizenEON', name: 'Horizen EON' },
  { key: 'Viction', name: 'Viction' },
  { key: 'Fuse', name: 'Fuse' },
  { key: 'Syscoin', name: 'Syscoin' },
  { key: 'ThunderCore', name: 'ThunderCore' },
  { key: 'Astar', name: 'Astar' },
  { key: 'Shiden', name: 'Shiden' },
  { key: 'Efinity', name: 'Efinity' },
  { key: 'WorldChain', name: 'World Chain' },
  { key: 'Sonic', name: 'Sonic' },
  { key: 'Flare', name: 'Flare' },
  { key: 'Songbird', name: 'Songbird' },
  { key: 'ZetaChain', name: 'ZetaChain' },
  { key: 'SmartBCH', name: 'SmartBCH' },
  { key: 'RSK', name: 'RSK' },
  { key: 'Wanchain', name: 'Wanchain' },
  { key: 'GoChain', name: 'GoChain' },
  { key: 'Canto', name: 'Canto' },
];

console.log('// ========== PHASE 3+ GENERATE WALLET FUNCTIONS ==========\n');

networks.forEach(network => {
  const keyLower = network.key.charAt(0).toLowerCase() + network.key.slice(1);

  console.log(`async function generate${network.key}Wallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generating${network.key}.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: '${network.key}',
        walletName: \`${network.name} Wallet \${${keyLower}Wallets.value.length + 1}\`
      }
    });
    if (response.success) {
      window.$message?.success('${network.name} wallet generated successfully!');
      await load${network.key}Wallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[${network.name}] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate ${network.name} wallet');
  } finally {
    generating${network.key}.value = false;
  }
}
`);
});

console.log('\n// ========== PHASE 3+ LOAD WALLET FUNCTIONS ==========\n');

networks.forEach(network => {
  const keyLower = network.key.charAt(0).toLowerCase() + network.key.slice(1);

  console.log(`async function load${network.key}Wallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: '${network.key}'
      }
    });
    if (response.success) {
      ${keyLower}Wallets.value = response.data || [];
    } else {
      console.error('[${network.name}] Load error:', response.message);
    }
  } catch (error) {
    console.error('[${network.name}] Load error:', error);
  }
}
`);
});

console.log('\n// ========== ONMOUNTED CALLS ==========');
console.log('// Add these to the existing onMounted() function:\n');

networks.forEach(network => {
  console.log(`  load${network.key}Wallets();`);
});
