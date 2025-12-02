// Main Wallet Generator - Routes to appropriate generator based on network type
// TODO: Create individual generator files for each blockchain type
// import { generateEVMWallet } from './evm.js';
// import { generateBitcoinWallet } from './bitcoin.js';
// import { generateSolanaWallet } from './solana.js';
// import { generateCosmosWallet } from './cosmos.js';
// import { generatePolkadotWallet } from './polkadot.js';
// import { generateAlgorandWallet } from './algorand.js';
// import { generateTronWallet } from './tron.js';
// import { generateAptosWallet } from './aptos.js';
// import { generateSuiWallet } from './sui.js';
// import { generateStarknetWallet } from './starknet.js';

// Network to generator mapping (TODO: Uncomment when generator files are created)
const generatorMap = {
  // EVM Chains (commented out until evm.js is created)
  // 'Ethereum': generateEVMWallet,
  // 'BNB Chain': generateEVMWallet,
  // ... other mappings will be added when generators are implemented
};

export async function generateWallet(networkName) {
  const generator = generatorMap[networkName];

  if (!generator) {
    // Default to generic generator for unknown networks
    return generateGenericWallet(networkName);
  }

  return await generator(networkName);
}

// Generic wallet generator for unsupported chains
function generateGenericWallet(networkName) {
  const bip39 = require('bip39');
  const crypto = require('crypto');

  const mnemonic = bip39.generateMnemonic();
  const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
  const publicKey = '0x' + crypto.randomBytes(32).toString('hex');

  return {
    type: 'Generic',
    network: networkName,
    publicKey,
    privateKey,
    mnemonic,
    note: 'Generic keypair - Use official wallet software for production use'
  };
}
