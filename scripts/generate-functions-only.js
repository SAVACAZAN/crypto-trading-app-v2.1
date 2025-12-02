// ========== PHASE 3+ GENERATE WALLET FUNCTIONS ==========

async function generateRoninWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRonin.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Ronin',
        walletName: `Ronin Wallet ${roninWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Ronin wallet generated successfully!');
      await loadRoninWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Ronin] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Ronin wallet');
  } finally {
    generatingRonin.value = false;
  }
}

async function generateImmutableZkEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingImmutableZkEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ImmutableZkEVM',
        walletName: `Immutable zkEVM Wallet ${immutableZkEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Immutable zkEVM wallet generated successfully!');
      await loadImmutableZkEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Immutable zkEVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Immutable zkEVM wallet');
  } finally {
    generatingImmutableZkEVM.value = false;
  }
}

async function generateBeamWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBeam.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Beam',
        walletName: `Beam Wallet ${beamWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Beam wallet generated successfully!');
      await loadBeamWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Beam] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Beam wallet');
  } finally {
    generatingBeam.value = false;
  }
}

async function generateOasysWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOasys.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Oasys',
        walletName: `Oasys Wallet ${oasysWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Oasys wallet generated successfully!');
      await loadOasysWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Oasys] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Oasys wallet');
  } finally {
    generatingOasys.value = false;
  }
}

async function generatePolygonZkEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingPolygonZkEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'PolygonZkEVM',
        walletName: `Polygon zkEVM Wallet ${polygonZkEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Polygon zkEVM wallet generated successfully!');
      await loadPolygonZkEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Polygon zkEVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Polygon zkEVM wallet');
  } finally {
    generatingPolygonZkEVM.value = false;
  }
}

async function generateBobaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBoba.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Boba',
        walletName: `Boba Wallet ${bobaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Boba wallet generated successfully!');
      await loadBobaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Boba] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Boba wallet');
  } finally {
    generatingBoba.value = false;
  }
}

async function generateMetisWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMetis.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Metis',
        walletName: `Metis Wallet ${metisWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Metis wallet generated successfully!');
      await loadMetisWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Metis] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Metis wallet');
  } finally {
    generatingMetis.value = false;
  }
}

async function generateAuroraWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAurora.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Aurora',
        walletName: `Aurora Wallet ${auroraWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Aurora wallet generated successfully!');
      await loadAuroraWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Aurora] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Aurora wallet');
  } finally {
    generatingAurora.value = false;
  }
}

async function generateRedstoneWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRedstone.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Redstone',
        walletName: `Redstone Wallet ${redstoneWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Redstone wallet generated successfully!');
      await loadRedstoneWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Redstone] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Redstone wallet');
  } finally {
    generatingRedstone.value = false;
  }
}

async function generateOpBNBWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOpBNB.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'OpBNB',
        walletName: `opBNB Wallet ${opBNBWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('opBNB wallet generated successfully!');
      await loadOpBNBWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[opBNB] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate opBNB wallet');
  } finally {
    generatingOpBNB.value = false;
  }
}

async function generateArbitrumNovaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingArbitrumNova.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ArbitrumNova',
        walletName: `Arbitrum Nova Wallet ${arbitrumNovaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Arbitrum Nova wallet generated successfully!');
      await loadArbitrumNovaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Arbitrum Nova] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Arbitrum Nova wallet');
  } finally {
    generatingArbitrumNova.value = false;
  }
}

async function generateZoraWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingZora.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Zora',
        walletName: `Zora Wallet ${zoraWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Zora wallet generated successfully!');
      await loadZoraWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Zora] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Zora wallet');
  } finally {
    generatingZora.value = false;
  }
}

async function generateMantaPacificWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMantaPacific.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'MantaPacific',
        walletName: `Manta Pacific Wallet ${mantaPacificWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Manta Pacific wallet generated successfully!');
      await loadMantaPacificWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Manta Pacific] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Manta Pacific wallet');
  } finally {
    generatingMantaPacific.value = false;
  }
}

async function generateMorphL2Wallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMorphL2.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'MorphL2',
        walletName: `Morph L2 Wallet ${morphL2Wallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Morph L2 wallet generated successfully!');
      await loadMorphL2Wallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Morph L2] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Morph L2 wallet');
  } finally {
    generatingMorphL2.value = false;
  }
}

async function generateXaiWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXai.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Xai',
        walletName: `Xai Wallet ${xaiWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Xai wallet generated successfully!');
      await loadXaiWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Xai] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Xai wallet');
  } finally {
    generatingXai.value = false;
  }
}

async function generateFraxtalWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFraxtal.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fraxtal',
        walletName: `Fraxtal Wallet ${fraxtalWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Fraxtal wallet generated successfully!');
      await loadFraxtalWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fraxtal] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Fraxtal wallet');
  } finally {
    generatingFraxtal.value = false;
  }
}

async function generateTaikoWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingTaiko.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Taiko',
        walletName: `Taiko Wallet ${taikoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Taiko wallet generated successfully!');
      await loadTaikoWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Taiko] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Taiko wallet');
  } finally {
    generatingTaiko.value = false;
  }
}

async function generateModeNetworkWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingModeNetwork.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ModeNetwork',
        walletName: `Mode Network Wallet ${modeNetworkWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Mode Network wallet generated successfully!');
      await loadModeNetworkWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Mode Network] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Mode Network wallet');
  } finally {
    generatingModeNetwork.value = false;
  }
}

async function generateCeloWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingCelo.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Celo',
        walletName: `Celo Wallet ${celoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Celo wallet generated successfully!');
      await loadCeloWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Celo] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Celo wallet');
  } finally {
    generatingCelo.value = false;
  }
}

async function generateHederaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingHedera.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Hedera',
        walletName: `Hedera Wallet ${hederaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Hedera wallet generated successfully!');
      await loadHederaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Hedera] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Hedera wallet');
  } finally {
    generatingHedera.value = false;
  }
}

async function generateSeiWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSei.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Sei',
        walletName: `Sei Wallet ${seiWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Sei wallet generated successfully!');
      await loadSeiWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Sei] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Sei wallet');
  } finally {
    generatingSei.value = false;
  }
}

async function generateKavaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingKava.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Kava',
        walletName: `Kava Wallet ${kavaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Kava wallet generated successfully!');
      await loadKavaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Kava] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Kava wallet');
  } finally {
    generatingKava.value = false;
  }
}

async function generateShimmerEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingShimmerEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ShimmerEVM',
        walletName: `Shimmer EVM Wallet ${shimmerEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Shimmer EVM wallet generated successfully!');
      await loadShimmerEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Shimmer EVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Shimmer EVM wallet');
  } finally {
    generatingShimmerEVM.value = false;
  }
}

async function generateConfluxESpaceWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingConfluxESpace.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ConfluxESpace',
        walletName: `Conflux eSpace Wallet ${confluxESpaceWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Conflux eSpace wallet generated successfully!');
      await loadConfluxESpaceWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Conflux eSpace] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Conflux eSpace wallet');
  } finally {
    generatingConfluxESpace.value = false;
  }
}

async function generateOasisEmeraldWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOasisEmerald.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'OasisEmerald',
        walletName: `Oasis Emerald Wallet ${oasisEmeraldWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Oasis Emerald wallet generated successfully!');
      await loadOasisEmeraldWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Oasis Emerald] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Oasis Emerald wallet');
  } finally {
    generatingOasisEmerald.value = false;
  }
}

async function generateEnergyWebWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingEnergyWeb.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'EnergyWeb',
        walletName: `Energy Web Wallet ${energyWebWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Energy Web wallet generated successfully!');
      await loadEnergyWebWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Energy Web] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Energy Web wallet');
  } finally {
    generatingEnergyWeb.value = false;
  }
}

async function generateTelosEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingTelosEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'TelosEVM',
        walletName: `Telos EVM Wallet ${telosEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Telos EVM wallet generated successfully!');
      await loadTelosEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Telos EVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Telos EVM wallet');
  } finally {
    generatingTelosEVM.value = false;
  }
}

async function generateHorizenEONWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingHorizenEON.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'HorizenEON',
        walletName: `Horizen EON Wallet ${horizenEONWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Horizen EON wallet generated successfully!');
      await loadHorizenEONWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Horizen EON] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Horizen EON wallet');
  } finally {
    generatingHorizenEON.value = false;
  }
}

async function generateVictionWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingViction.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Viction',
        walletName: `Viction Wallet ${victionWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Viction wallet generated successfully!');
      await loadVictionWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Viction] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Viction wallet');
  } finally {
    generatingViction.value = false;
  }
}

async function generateFuseWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFuse.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fuse',
        walletName: `Fuse Wallet ${fuseWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Fuse wallet generated successfully!');
      await loadFuseWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fuse] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Fuse wallet');
  } finally {
    generatingFuse.value = false;
  }
}

async function generateSyscoinWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSyscoin.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Syscoin',
        walletName: `Syscoin Wallet ${syscoinWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Syscoin wallet generated successfully!');
      await loadSyscoinWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Syscoin] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Syscoin wallet');
  } finally {
    generatingSyscoin.value = false;
  }
}

async function generateThunderCoreWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingThunderCore.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ThunderCore',
        walletName: `ThunderCore Wallet ${thunderCoreWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('ThunderCore wallet generated successfully!');
      await loadThunderCoreWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[ThunderCore] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate ThunderCore wallet');
  } finally {
    generatingThunderCore.value = false;
  }
}

async function generateAstarWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAstar.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Astar',
        walletName: `Astar Wallet ${astarWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Astar wallet generated successfully!');
      await loadAstarWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Astar] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Astar wallet');
  } finally {
    generatingAstar.value = false;
  }
}

async function generateShidenWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingShiden.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Shiden',
        walletName: `Shiden Wallet ${shidenWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Shiden wallet generated successfully!');
      await loadShidenWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Shiden] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Shiden wallet');
  } finally {
    generatingShiden.value = false;
  }
}

async function generateEfinityWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingEfinity.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Efinity',
        walletName: `Efinity Wallet ${efinityWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Efinity wallet generated successfully!');
      await loadEfinityWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Efinity] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Efinity wallet');
  } finally {
    generatingEfinity.value = false;
  }
}

async function generateWorldChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingWorldChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'WorldChain',
        walletName: `World Chain Wallet ${worldChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('World Chain wallet generated successfully!');
      await loadWorldChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[World Chain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate World Chain wallet');
  } finally {
    generatingWorldChain.value = false;
  }
}

async function generateSonicWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSonic.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Sonic',
        walletName: `Sonic Wallet ${sonicWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Sonic wallet generated successfully!');
      await loadSonicWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Sonic] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Sonic wallet');
  } finally {
    generatingSonic.value = false;
  }
}

async function generateFlareWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFlare.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Flare',
        walletName: `Flare Wallet ${flareWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Flare wallet generated successfully!');
      await loadFlareWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Flare] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Flare wallet');
  } finally {
    generatingFlare.value = false;
  }
}

async function generateSongbirdWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSongbird.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Songbird',
        walletName: `Songbird Wallet ${songbirdWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Songbird wallet generated successfully!');
      await loadSongbirdWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Songbird] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Songbird wallet');
  } finally {
    generatingSongbird.value = false;
  }
}

async function generateZetaChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingZetaChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ZetaChain',
        walletName: `ZetaChain Wallet ${zetaChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('ZetaChain wallet generated successfully!');
      await loadZetaChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[ZetaChain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate ZetaChain wallet');
  } finally {
    generatingZetaChain.value = false;
  }
}

async function generateSmartBCHWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSmartBCH.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'SmartBCH',
        walletName: `SmartBCH Wallet ${smartBCHWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('SmartBCH wallet generated successfully!');
      await loadSmartBCHWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[SmartBCH] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate SmartBCH wallet');
  } finally {
    generatingSmartBCH.value = false;
  }
}

async function generateRSKWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRSK.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'RSK',
        walletName: `RSK Wallet ${rSKWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('RSK wallet generated successfully!');
      await loadRSKWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[RSK] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate RSK wallet');
  } finally {
    generatingRSK.value = false;
  }
}

async function generateWanchainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingWanchain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Wanchain',
        walletName: `Wanchain Wallet ${wanchainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Wanchain wallet generated successfully!');
      await loadWanchainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Wanchain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Wanchain wallet');
  } finally {
    generatingWanchain.value = false;
  }
}

async function generateGoChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingGoChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'GoChain',
        walletName: `GoChain Wallet ${goChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('GoChain wallet generated successfully!');
      await loadGoChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[GoChain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate GoChain wallet');
  } finally {
    generatingGoChain.value = false;
  }
}

async function generateCantoWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingCanto.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Canto',
        walletName: `Canto Wallet ${cantoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Canto wallet generated successfully!');
      await loadCantoWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Canto] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Canto wallet');
  } finally {
    generatingCanto.value = false;
  }
}


