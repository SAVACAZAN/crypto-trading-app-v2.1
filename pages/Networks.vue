<script setup>
import { ref, computed, onMounted } from 'vue';
// import { ethers } from 'ethers';

let userID = useCookie('userID');

// Native Wallet Extensions Info
const walletExtensions = {
  'Solana': {
    name: 'Phantom',
    windowKey: 'solana',
    checkInstalled: () => typeof window.solana !== 'undefined' && window.solana.isPhantom,
    connect: async () => {
      const resp = await window.solana.connect();
      return { address: resp.publicKey.toString(), type: 'Solana' };
    },
    downloadUrl: 'https://phantom.app',
    icon: '👻'
  },
  'Polkadot': {
    name: 'Talisman / Polkadot.js',
    windowKey: 'injectedWeb3',
    checkInstalled: () => typeof window.injectedWeb3 !== 'undefined',
    connect: async () => {
      try {
        const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
        const extensions = await web3Enable('Networks DApp');
        if (extensions.length === 0) throw new Error('No Polkadot extension found');
        const accounts = await web3Accounts();
        return { address: accounts[0].address, type: 'Polkadot' };
      } catch (error) {
        console.error('Polkadot connection error:', error);
        throw new Error('Please install @polkadot/extension-dapp package or use browser extension');
      }
    },
    downloadUrl: 'https://polkadot.js.org/extension/',
    icon: '🔴'
  },
  'Cosmos': {
    name: 'Keplr Wallet',
    windowKey: 'keplr',
    checkInstalled: () => typeof window.keplr !== 'undefined',
    connect: async () => {
      await window.keplr.enable('cosmoshub-4');
      const offlineSigner = window.keplr.getOfflineSigner('cosmoshub-4');
      const accounts = await offlineSigner.getAccounts();
      return { address: accounts[0].address, type: 'Cosmos' };
    },
    downloadUrl: 'https://www.keplr.app',
    icon: '⚛️'
  },
  'Aptos': {
    name: 'Petra Wallet',
    windowKey: 'aptos',
    checkInstalled: () => typeof window.aptos !== 'undefined',
    connect: async () => {
      const response = await window.aptos.connect();
      return { address: response.address, type: 'Aptos' };
    },
    downloadUrl: 'https://petra.app',
    icon: '🪨'
  },
  'Sui': {
    name: 'Sui Wallet',
    windowKey: 'suiWallet',
    checkInstalled: () => typeof window.suiWallet !== 'undefined',
    connect: async () => {
      const accounts = await window.suiWallet.requestPermissions();
      return { address: accounts[0], type: 'Sui' };
    },
    downloadUrl: 'https://sui.io/wallet',
    icon: '💧'
  },
  'Cardano': {
    name: 'Nami / Eternl',
    windowKey: 'cardano',
    checkInstalled: () => typeof window.cardano !== 'undefined',
    connect: async () => {
      const api = await window.cardano.nami.enable();
      const addresses = await api.getUsedAddresses();
      return { address: addresses[0], type: 'Cardano' };
    },
    downloadUrl: 'https://namiwallet.io',
    icon: '🔵'
  },
  'Near Protocol': {
    name: 'NEAR Wallet',
    windowKey: 'near',
    checkInstalled: () => typeof window.selector !== 'undefined',
    connect: async () => {
      // NEAR uses redirect-based auth, not extension
      window.open('https://wallet.near.org', '_blank');
      return { address: 'Use NEAR Wallet website', type: 'Near' };
    },
    downloadUrl: 'https://wallet.near.org',
    icon: '🔺'
  },
  'Tron': {
    name: 'TronLink',
    windowKey: 'tronWeb',
    checkInstalled: () => typeof window.tronWeb !== 'undefined',
    connect: async () => {
      const address = window.tronWeb.defaultAddress.base58;
      return { address, type: 'Tron' };
    },
    downloadUrl: 'https://www.tronlink.org',
    icon: '🔶'
  },
  'Algorand': {
    name: 'Pera Wallet',
    windowKey: 'PeraWallet',
    checkInstalled: () => typeof window.PeraWallet !== 'undefined',
    connect: async () => {
      const peraWallet = new window.PeraWallet.PeraWalletConnect();
      const accounts = await peraWallet.connect();
      return { address: accounts[0], type: 'Algorand' };
    },
    downloadUrl: 'https://perawallet.app',
    icon: '◼️'
  },
  'Starknet': {
    name: 'Argent X / Braavos',
    windowKey: 'starknet',
    checkInstalled: () => typeof window.starknet !== 'undefined',
    connect: async () => {
      await window.starknet.enable();
      const [address] = await window.starknet.account.address;
      return { address, type: 'Starknet' };
    },
    downloadUrl: 'https://www.argent.xyz/argent-x/',
    icon: '🏛️'
  },
  'Flow': {
    name: 'Blocto',
    windowKey: 'fcl',
    checkInstalled: () => typeof window.fcl !== 'undefined',
    connect: async () => {
      window.open('https://blocto.app', '_blank');
      return { address: 'Use Blocto website', type: 'Flow' };
    },
    downloadUrl: 'https://blocto.app',
    icon: '🌊'
  }
};

// Networks Data - 200+ Chains
const networksData = ref({
  layer0: [
    { id: 1, name: 'Polkadot', symbol: 'DOT', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.polkadot.io' },
    { id: 2, name: 'Cosmos', symbol: 'ATOM', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.cosmos.network' },
    { id: 3, name: 'Avalanche Subnets', symbol: 'AVAX', icon: '⚙️', evmCompatible: true, chainId: 43114, rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
    { id: 4, name: 'Celestia', symbol: 'TIA', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.celestia.org' },
    { id: 5, name: 'LayerZero', symbol: 'ZRO', icon: '⚙️', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 6, name: 'Kusama', symbol: 'KSM', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://kusama-rpc.polkadot.io' },
    { id: 7, name: 'Substrate', symbol: 'SUB', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 8, name: 'Saga', symbol: 'SAGA', icon: '⚙️', evmCompatible: true, chainId: null, rpcUrl: 'https://rpc.saga.network' },
    { id: 9, name: 'EigenLayer', symbol: 'EIGEN', icon: '⚙️', evmCompatible: true, chainId: 1, rpcUrl: 'https://eth.llamarpc.com' },
    { id: 10, name: 'Axelar', symbol: 'AXL', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.axelar.network' },
    { id: 11, name: 'Nibiru Chain', symbol: 'NIBI', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.nibiru.fi' },
    { id: 12, name: 'Dymension RollApp Hub', symbol: 'DYM', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.dymension.xyz' },
    { id: 13, name: 'Hyperlane', symbol: 'HYP', icon: '⚙️', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 14, name: 'Constellation Network', symbol: 'DAG', icon: '⚙️', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 15, name: 'ZetaChain', symbol: 'ZETA', icon: '⚙️', evmCompatible: true, chainId: 7000, rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public' }
  ],
  layer1: [
    { id: 101, name: 'Bitcoin', symbol: 'BTC', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 102, name: 'Ethereum', symbol: 'ETH', icon: '🧱', evmCompatible: true, chainId: 1, rpcUrl: 'https://eth.llamarpc.com' },
    { id: 103, name: 'BNB Chain', symbol: 'BNB', icon: '🧱', evmCompatible: true, chainId: 56, rpcUrl: 'https://bsc-dataseed.binance.org' },
    { id: 104, name: 'Solana', symbol: 'SOL', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://api.mainnet-beta.solana.com' },
    { id: 105, name: 'Cardano', symbol: 'ADA', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 106, name: 'Avalanche C-Chain', symbol: 'AVAX', icon: '🧱', evmCompatible: true, chainId: 43114, rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
    { id: 107, name: 'Polygon PoS', symbol: 'POL', icon: '🧱', evmCompatible: true, chainId: 137, rpcUrl: 'https://polygon-rpc.com' },
    { id: 108, name: 'Near Protocol', symbol: 'NEAR', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.mainnet.near.org' },
    { id: 109, name: 'Fantom', symbol: 'FTM', icon: '🧱', evmCompatible: true, chainId: 250, rpcUrl: 'https://rpc.ftm.tools' },
    { id: 110, name: 'Algorand', symbol: 'ALGO', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://mainnet-api.algonode.cloud' },
    { id: 111, name: 'Tron', symbol: 'TRX', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://api.trongrid.io' },
    { id: 112, name: 'Harmony', symbol: 'ONE', icon: '🧱', evmCompatible: true, chainId: 1666600000, rpcUrl: 'https://api.harmony.one' },
    { id: 113, name: 'Hedera', symbol: 'HBAR', icon: '🧱', evmCompatible: true, chainId: 295, rpcUrl: 'https://mainnet.hashio.io/api' },
    { id: 114, name: 'VeChain', symbol: 'VET', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://mainnet.veblocks.net' },
    { id: 115, name: 'Internet Computer', symbol: 'ICP', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 116, name: 'Flow', symbol: 'FLOW', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://rest-mainnet.onflow.org' },
    { id: 117, name: 'MultiversX', symbol: 'EGLD', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://gateway.multiversx.com' },
    { id: 118, name: 'Aptos', symbol: 'APT', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1' },
    { id: 119, name: 'Sui', symbol: 'SUI', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://fullnode.mainnet.sui.io' },
    { id: 120, name: 'Sei Network', symbol: 'SEI', icon: '🧱', evmCompatible: true, chainId: 1329, rpcUrl: 'https://evm-rpc.sei-apis.com' },
    { id: 121, name: 'Celo', symbol: 'CELO', icon: '🧱', evmCompatible: true, chainId: 42220, rpcUrl: 'https://forno.celo.org' },
    { id: 122, name: 'Tezos', symbol: 'XTZ', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://mainnet.api.tez.ie' },
    { id: 123, name: 'Thorchain', symbol: 'RUNE', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 124, name: 'Kava', symbol: 'KAVA', icon: '🧱', evmCompatible: true, chainId: 2222, rpcUrl: 'https://evm.kava.io' },
    { id: 125, name: 'Mina Protocol', symbol: 'MINA', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 126, name: 'Stellar', symbol: 'XLM', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://horizon.stellar.org' },
    { id: 127, name: 'IOTA', symbol: 'IOTA', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 128, name: 'Shimmer EVM', symbol: 'SMR', icon: '🧱', evmCompatible: true, chainId: 148, rpcUrl: 'https://json-rpc.evm.shimmer.network' },
    { id: 129, name: 'Chia', symbol: 'XCH', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 130, name: 'Conflux eSpace', symbol: 'CFX', icon: '🧱', evmCompatible: true, chainId: 1030, rpcUrl: 'https://evm.confluxrpc.com' },
    { id: 131, name: 'Nervos CKB', symbol: 'CKB', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://mainnet.ckb.dev' },
    { id: 132, name: 'Waves', symbol: 'WAVES', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://nodes.wavesnodes.com' },
    { id: 133, name: 'WAX', symbol: 'WAXP', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://wax.greymass.com' },
    { id: 134, name: 'Zilliqa', symbol: 'ZIL', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://api.zilliqa.com' },
    { id: 135, name: 'NEO', symbol: 'NEO', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://mainnet1.neo.coz.io:443' },
    { id: 136, name: 'EOS', symbol: 'EOS', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://eos.greymass.com' },
    { id: 137, name: 'Ontology', symbol: 'ONT', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://dappnode1.ont.io:20339' },
    { id: 138, name: 'Theta Network', symbol: 'THETA', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 139, name: 'Casper Network', symbol: 'CSPR', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://rpc.mainnet.casperlabs.io' },
    { id: 140, name: 'Oasis Emerald', symbol: 'ROSE', icon: '🧱', evmCompatible: true, chainId: 42262, rpcUrl: 'https://emerald.oasis.dev' },
    { id: 141, name: 'Energy Web Chain', symbol: 'EWT', icon: '🧱', evmCompatible: true, chainId: 246, rpcUrl: 'https://rpc.energyweb.org' },
    { id: 142, name: 'Telos EVM', symbol: 'TLOS', icon: '🧱', evmCompatible: true, chainId: 40, rpcUrl: 'https://mainnet.telos.net/evm' },
    { id: 143, name: 'Horizen EON', symbol: 'ZEN', icon: '🧱', evmCompatible: true, chainId: 7332, rpcUrl: 'https://eon-rpc.horizenlabs.io/ethv1' },
    { id: 144, name: 'ICON', symbol: 'ICX', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://ctz.solidwallet.io/api/v3' },
    { id: 145, name: 'Viction', symbol: 'VIC', icon: '🧱', evmCompatible: true, chainId: 88, rpcUrl: 'https://rpc.viction.xyz' },
    { id: 146, name: 'Qtum', symbol: 'QTUM', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 147, name: 'Ergo', symbol: 'ERG', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 148, name: 'Kadena', symbol: 'KDA', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://api.chainweb.com' },
    { id: 149, name: 'Secret Network', symbol: 'SCRT', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://lcd.mainnet.secretsaturn.net' },
    { id: 150, name: 'NEM', symbol: 'XEM', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 151, name: 'Symbol', symbol: 'XYM', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: 'https://symbol.fyi/nodes' },
    { id: 152, name: 'BitTorrent Chain', symbol: 'BTT', icon: '🧱', evmCompatible: true, chainId: 199, rpcUrl: 'https://rpc.bittorrentchain.io' },
    { id: 153, name: 'PulseChain', symbol: 'PLS', icon: '🧱', evmCompatible: true, chainId: 369, rpcUrl: 'https://rpc.pulsechain.com' },
    { id: 154, name: 'Core DAO', symbol: 'CORE', icon: '🧱', evmCompatible: true, chainId: 1116, rpcUrl: 'https://rpc.coredao.org' },
    { id: 155, name: 'Shardeum', symbol: 'SHM', icon: '🧱', evmCompatible: true, chainId: 8082, rpcUrl: 'https://sphinx.shardeum.org' },
    { id: 156, name: 'Taraxa', symbol: 'TARA', icon: '🧱', evmCompatible: true, chainId: 841, rpcUrl: 'https://rpc.mainnet.taraxa.io' },
    { id: 157, name: 'Fusion Network', symbol: 'FSN', icon: '🧱', evmCompatible: true, chainId: 32659, rpcUrl: 'https://mainnet.fusionnetwork.io' },
    { id: 158, name: 'Astar Network', symbol: 'ASTR', icon: '🧱', evmCompatible: true, chainId: 592, rpcUrl: 'https://evm.astar.network' },
    { id: 159, name: 'Clover Finance', symbol: 'CLV', icon: '🧱', evmCompatible: true, chainId: 1023, rpcUrl: 'https://rpc-ivy.clover.finance' },
    { id: 160, name: 'Reef Chain', symbol: 'REEF', icon: '🧱', evmCompatible: true, chainId: 13939, rpcUrl: 'https://rpc.reefscan.com' },
    { id: 161, name: 'Moonbeam', symbol: 'GLMR', icon: '🧱', evmCompatible: true, chainId: 1284, rpcUrl: 'https://rpc.api.moonbeam.network' },
    { id: 162, name: 'Moonriver', symbol: 'MOVR', icon: '🧱', evmCompatible: true, chainId: 1285, rpcUrl: 'https://rpc.api.moonriver.moonbeam.network' },
    { id: 163, name: 'Aurora', symbol: 'ETH', icon: '🧱', evmCompatible: true, chainId: 1313161554, rpcUrl: 'https://mainnet.aurora.dev' },
    { id: 164, name: 'Meter.io', symbol: 'MTRG', icon: '🧱', evmCompatible: true, chainId: 82, rpcUrl: 'https://rpc.meter.io' },
    { id: 165, name: 'Cronos', symbol: 'CRO', icon: '🧱', evmCompatible: true, chainId: 25, rpcUrl: 'https://evm.cronos.org' },
    { id: 166, name: 'Klaytn', symbol: 'KLAY', icon: '🧱', evmCompatible: true, chainId: 8217, rpcUrl: 'https://public-node-api.klaytnapi.com/v1/cypress' },
    { id: 167, name: 'HECO Chain', symbol: 'HT', icon: '🧱', evmCompatible: true, chainId: 128, rpcUrl: 'https://http-mainnet.hecochain.com' },
    { id: 168, name: 'OKX Chain', symbol: 'OKT', icon: '🧱', evmCompatible: true, chainId: 66, rpcUrl: 'https://exchainrpc.okex.org' },
    { id: 169, name: 'GateChain', symbol: 'GT', icon: '🧱', evmCompatible: true, chainId: 86, rpcUrl: 'https://evm.gatenode.cc' },
    { id: 170, name: 'Oasys', symbol: 'OAS', icon: '🧱', evmCompatible: true, chainId: 248, rpcUrl: 'https://rpc.mainnet.oasys.games' },
    { id: 171, name: 'Ronin', symbol: 'RON', icon: '🧱', evmCompatible: true, chainId: 2020, rpcUrl: 'https://api.roninchain.com/rpc' },
    { id: 172, name: 'Bitgert', symbol: 'BRISE', icon: '🧱', evmCompatible: true, chainId: 32520, rpcUrl: 'https://rpc.icecreamswap.com' },
    { id: 173, name: 'Dogechain', symbol: 'DC', icon: '🧱', evmCompatible: true, chainId: 2000, rpcUrl: 'https://rpc.dogechain.dog' },
    { id: 174, name: 'Velas', symbol: 'VLX', icon: '🧱', evmCompatible: true, chainId: 106, rpcUrl: 'https://evmexplorer.velas.com/rpc' },
    { id: 175, name: 'Syscoin NEVM', symbol: 'SYS', icon: '🧱', evmCompatible: true, chainId: 57, rpcUrl: 'https://rpc.syscoin.org' },
    { id: 176, name: 'Gnosis Chain', symbol: 'xDAI', icon: '🧱', evmCompatible: true, chainId: 100, rpcUrl: 'https://rpc.gnosischain.com' },
    { id: 177, name: 'Fuse Network', symbol: 'FUSE', icon: '🧱', evmCompatible: true, chainId: 122, rpcUrl: 'https://rpc.fuse.io' },
    { id: 178, name: 'Aleph Zero', symbol: 'AZERO', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 179, name: 'Radix DLT', symbol: 'XRD', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 180, name: 'EOS EVM', symbol: 'EOS', icon: '🧱', evmCompatible: true, chainId: 17777, rpcUrl: 'https://api.evm.eosnetwork.com' },
    { id: 181, name: 'KardiaChain', symbol: 'KAI', icon: '🧱', evmCompatible: true, chainId: 0, rpcUrl: 'https://rpc.kardiachain.io' },
    { id: 182, name: 'Ultra.io', symbol: 'UOS', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 183, name: 'Ethernity Chain', symbol: 'ERN', icon: '🧱', evmCompatible: true, chainId: 183, rpcUrl: 'https://rpc.ethernity.io' },
    { id: 184, name: 'Evmos', symbol: 'EVMOS', icon: '🧱', evmCompatible: true, chainId: 9001, rpcUrl: 'https://evmos-evm.publicnode.com' },
    { id: 185, name: 'Canto', symbol: 'CANTO', icon: '🧱', evmCompatible: true, chainId: 7700, rpcUrl: 'https://canto.gravitychain.io' },
    { id: 186, name: 'Neon EVM', symbol: 'NEON', icon: '🧱', evmCompatible: true, chainId: 245022934, rpcUrl: 'https://neon-proxy-mainnet.solana.p2p.org' },
    { id: 187, name: 'IoTeX', symbol: 'IOTX', icon: '🧱', evmCompatible: true, chainId: 4689, rpcUrl: 'https://babel-api.mainnet.iotex.io' },
    { id: 188, name: 'Thundercore', symbol: 'TT', icon: '🧱', evmCompatible: true, chainId: 108, rpcUrl: 'https://mainnet-rpc.thundercore.com' },
    { id: 189, name: 'Efinity', symbol: 'EFI', icon: '🧱', evmCompatible: true, chainId: 1110, rpcUrl: 'https://rpc.efinity.io' },
    { id: 190, name: 'Kujira', symbol: 'KUJI', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 191, name: 'Archway', symbol: 'ARCH', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 192, name: 'Hyperliquid', symbol: 'HYPE', icon: '🧱', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 193, name: 'World Chain', symbol: 'WLD', icon: '🧱', evmCompatible: true, chainId: 480, rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public' },
    { id: 194, name: 'Sonic', symbol: 'S', icon: '🧱', evmCompatible: true, chainId: 146, rpcUrl: 'https://rpc.soniclabs.com' },
    { id: 195, name: 'Flare Network', symbol: 'FLR', icon: '🧱', evmCompatible: true, chainId: 14, rpcUrl: 'https://flare-api.flare.network/ext/C/rpc' },
    { id: 196, name: 'Songbird', symbol: 'SGB', icon: '🧱', evmCompatible: true, chainId: 19, rpcUrl: 'https://songbird-api.flare.network/ext/C/rpc' },
    { id: 197, name: 'SmartBCH', symbol: 'BCH', icon: '🧱', evmCompatible: true, chainId: 10000, rpcUrl: 'https://smartbch.fountainhead.cash/mainnet' },
    { id: 198, name: 'RSK', symbol: 'RBTC', icon: '🧱', evmCompatible: true, chainId: 30, rpcUrl: 'https://public-node.rsk.co' },
    { id: 199, name: 'Wanchain', symbol: 'WAN', icon: '🧱', evmCompatible: true, chainId: 888, rpcUrl: 'https://gwan-ssl.wandevs.org:56891' },
    { id: 200, name: 'GoChain', symbol: 'GO', icon: '🧱', evmCompatible: true, chainId: 60, rpcUrl: 'https://rpc.gochain.io' }
  ],
  layer2: [
    { id: 201, name: 'Arbitrum One', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 42161, rpcUrl: 'https://arb1.arbitrum.io/rpc' },
    { id: 202, name: 'Optimism', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 10, rpcUrl: 'https://mainnet.optimism.io' },
    { id: 203, name: 'Base', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 8453, rpcUrl: 'https://mainnet.base.org' },
    { id: 204, name: 'zkSync Era', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 324, rpcUrl: 'https://mainnet.era.zksync.io' },
    { id: 205, name: 'Linea', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 59144, rpcUrl: 'https://rpc.linea.build' },
    { id: 206, name: 'Scroll', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 534352, rpcUrl: 'https://rpc.scroll.io' },
    { id: 207, name: 'Starknet', symbol: 'ETH', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: 'https://starknet-mainnet.public.blastapi.io' },
    { id: 208, name: 'Blast', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 81457, rpcUrl: 'https://rpc.blast.io' },
    { id: 209, name: 'Mantle', symbol: 'MNT', icon: '🚀', evmCompatible: true, chainId: 5000, rpcUrl: 'https://rpc.mantle.xyz' },
    { id: 210, name: 'Loopring', symbol: 'LRC', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 211, name: 'Immutable X', symbol: 'IMX', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: 'https://api.x.immutable.com' },
    { id: 212, name: 'Metis', symbol: 'METIS', icon: '🚀', evmCompatible: true, chainId: 1088, rpcUrl: 'https://andromeda.metis.io/?owner=1088' },
    { id: 213, name: 'Polygon zkEVM', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 1101, rpcUrl: 'https://zkevm-rpc.com' },
    { id: 214, name: 'Boba Network', symbol: 'BOBA', icon: '🚀', evmCompatible: true, chainId: 288, rpcUrl: 'https://mainnet.boba.network' },
    { id: 215, name: 'OMG Network', symbol: 'OMG', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 216, name: 'Aztec Network', symbol: 'AZTEC', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 217, name: 'Manta Network', symbol: 'MANTA', icon: '🚀', evmCompatible: true, chainId: 169, rpcUrl: 'https://pacific-rpc.manta.network/http' },
    { id: 218, name: 'ZKSpace', symbol: 'ZKS', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 219, name: 'Taiko', symbol: 'TAIKO', icon: '🚀', evmCompatible: true, chainId: 167000, rpcUrl: 'https://rpc.mainnet.taiko.xyz' },
    { id: 220, name: 'Mode Network', symbol: 'MODE', icon: '🚀', evmCompatible: true, chainId: 34443, rpcUrl: 'https://mainnet.mode.network' },
    { id: 221, name: 'Redstone', symbol: 'RED', icon: '🚀', evmCompatible: true, chainId: 690, rpcUrl: 'https://rpc.redstonechain.com' },
    { id: 222, name: 'OpBNB', symbol: 'BNB', icon: '🚀', evmCompatible: true, chainId: 204, rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org' },
    { id: 223, name: 'Arbitrum Nova', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 42170, rpcUrl: 'https://nova.arbitrum.io/rpc' },
    { id: 224, name: 'Zora Network', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 7777777, rpcUrl: 'https://rpc.zora.energy' },
    { id: 225, name: 'Aevo Rollup', symbol: 'AEVO', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 226, name: 'Cartesi Rollups', symbol: 'CTSI', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 227, name: 'Manta Pacific', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 169, rpcUrl: 'https://pacific-rpc.manta.network/http' },
    { id: 228, name: 'Morph L2', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 2818, rpcUrl: 'https://rpc.morphl2.io' },
    { id: 229, name: 'Xai Network', symbol: 'XAI', icon: '🚀', evmCompatible: true, chainId: 660279, rpcUrl: 'https://xai-chain.net/rpc' },
    { id: 230, name: 'Frame Network', symbol: 'FRAME', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 231, name: 'Espresso Systems', symbol: 'ESP', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 232, name: 'Caldera', symbol: 'CAL', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 233, name: 'Movement Labs', symbol: 'MOVE', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 234, name: 'Nautilus Chain', symbol: 'ZBC', icon: '🚀', evmCompatible: true, chainId: 22222, rpcUrl: 'https://api.nautilus.nautchain.xyz' },
    { id: 235, name: 'Parallel Network', symbol: 'PARA', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 236, name: 'Treasure L2', symbol: 'MAGIC', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 237, name: 'Eclipse Network', symbol: 'ECL', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 238, name: 'Polymer Network', symbol: 'POLY', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 239, name: 'Degen Chain', symbol: 'DEGEN', icon: '🚀', evmCompatible: true, chainId: 666666666, rpcUrl: 'https://rpc.degen.tips' },
    { id: 240, name: 'FraxChain', symbol: 'FXS', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 241, name: 'Kinto Network', symbol: 'KINTO', icon: '🚀', evmCompatible: true, chainId: 7887, rpcUrl: 'https://rpc.kinto.xyz' },
    { id: 242, name: 'Railgun L2', symbol: 'RAIL', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 243, name: 'Ink L2', symbol: 'INK', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 244, name: 'Automata Network', symbol: 'ATA', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 245, name: 'Lyra Chain', symbol: 'LYRA', icon: '🚀', evmCompatible: true, chainId: 957, rpcUrl: 'https://rpc.lyra.finance' },
    { id: 246, name: 'Titan Network', symbol: 'TITAN', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 247, name: 'Sanko Network', symbol: 'SANKO', icon: '🚀', evmCompatible: true, chainId: 1996, rpcUrl: 'https://mainnet.sanko.xyz' },
    { id: 248, name: 'Public Goods Network', symbol: 'PGN', icon: '🚀', evmCompatible: true, chainId: 424, rpcUrl: 'https://rpc.publicgoods.network' },
    { id: 249, name: 'Rhino Fi', symbol: 'DVF', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 250, name: 'Hermez', symbol: 'HEZ', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 251, name: 'StarkEx', symbol: 'STARK', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 252, name: 'Metis Andromeda', symbol: 'METIS', icon: '🚀', evmCompatible: true, chainId: 1088, rpcUrl: 'https://andromeda.metis.io/?owner=1088' },
    { id: 253, name: 'zkSync Lite', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 1000, rpcUrl: '' },
    { id: 254, name: 'RariChain', symbol: 'RARI', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 255, name: 'Polygon Supernets', symbol: 'MATIC', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 256, name: 'Base Goerli', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 84531, rpcUrl: 'https://goerli.base.org' },
    { id: 257, name: 'Scroll Alpha', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 534353, rpcUrl: 'https://alpha-rpc.scroll.io/l2' },
    { id: 258, name: 'Blast Mainnet', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 81457, rpcUrl: 'https://rpc.blast.io' },
    { id: 259, name: 'Arbitrum Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 421614, rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc' },
    { id: 260, name: 'Optimism Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 11155420, rpcUrl: 'https://sepolia.optimism.io' },
    { id: 261, name: 'zkSync Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 300, rpcUrl: 'https://sepolia.era.zksync.dev' },
    { id: 262, name: 'Blast Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 168587773, rpcUrl: 'https://sepolia.blast.io' },
    { id: 263, name: 'Mode Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 919, rpcUrl: 'https://sepolia.mode.network' },
    { id: 264, name: 'Manta Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 3441006, rpcUrl: '' },
    { id: 265, name: 'Linea Goerli', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 59140, rpcUrl: 'https://rpc.goerli.linea.build' },
    { id: 266, name: 'Scroll Sepolia', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 534351, rpcUrl: 'https://sepolia-rpc.scroll.io' },
    { id: 267, name: 'Taiko Katla', symbol: 'ETH', icon: '🚀', evmCompatible: true, chainId: 167008, rpcUrl: 'https://rpc.katla.taiko.xyz' },
    { id: 268, name: 'AltLayer', symbol: 'ALT', icon: '🚀', evmCompatible: true, chainId: null, rpcUrl: '' },
    { id: 269, name: 'Dymension', symbol: 'DYM', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' },
    { id: 270, name: 'Fuel Network', symbol: 'FUEL', icon: '🚀', evmCompatible: false, chainId: null, rpcUrl: '' }
  ]
});

// State
const selectedLayer = ref('all');
const selectedEvmFilter = ref('all'); // 'all', 'evm', 'non-evm'
const searchQuery = ref('');
const selectedNetwork = ref(null);
const showWalletModal = ref(false);
const walletProvider = ref(null);
const connectedAddress = ref('');
const connectionStatus = ref('');
const showWalletInfo = ref(false);

// Generated wallet states
const showGeneratedWalletModal = ref(false);
const generatedWallet = ref(null);
const showPrivateKey = ref(false);
const showMnemonic = ref(false);
const isGenerating = ref(false);

// Bitcoin wallet config modal states
const showBitcoinConfigModal = ref(false);
const selectedBitcoinNetwork = ref(null);

// Computed
const filteredNetworks = computed(() => {
  let networks = [];

  if (selectedLayer.value === 'all') {
    networks = [
      ...networksData.value.layer0,
      ...networksData.value.layer1,
      ...networksData.value.layer2
    ];
  } else if (selectedLayer.value === 'layer0') {
    networks = networksData.value.layer0;
  } else if (selectedLayer.value === 'layer1') {
    networks = networksData.value.layer1;
  } else if (selectedLayer.value === 'layer2') {
    networks = networksData.value.layer2;
  }

  // Apply EVM filter
  if (selectedEvmFilter.value === 'evm') {
    networks = networks.filter(n => n.evmCompatible === true);
  } else if (selectedEvmFilter.value === 'non-evm') {
    networks = networks.filter(n => n.evmCompatible === false);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    networks = networks.filter(n =>
      n.name.toLowerCase().includes(query) ||
      n.symbol.toLowerCase().includes(query)
    );
  }

  return networks;
});

const layerTabs = [
  { value: 'all', label: '🎯 All Networks', count: 0 },
  { value: 'layer0', label: '⚙️ Layer 0', count: 0 },
  { value: 'layer1', label: '🧱 Layer 1', count: 0 },
  { value: 'layer2', label: '🚀 Layer 2', count: 0 }
];

// Calculate counts
onMounted(() => {
  layerTabs[0].count = networksData.value.layer0.length + networksData.value.layer1.length + networksData.value.layer2.length;
  layerTabs[1].count = networksData.value.layer0.length;
  layerTabs[2].count = networksData.value.layer1.length;
  layerTabs[3].count = networksData.value.layer2.length;
});

// Get native wallet info
function getWalletExtension(networkName) {
  return walletExtensions[networkName] || null;
}

// Functions
async function openWalletModal(network) {
  selectedNetwork.value = network;
  showWalletModal.value = true;
  connectionStatus.value = '';
  showWalletInfo.value = false;
  connectedAddress.value = '';
}

// METAMASK CONNECTION
async function connectMetaMask() {
  if (!selectedNetwork.value) return;

  connectionStatus.value = 'Connecting to MetaMask...';

  try {
    if (typeof window.ethereum === 'undefined') {
      window.$message.error('MetaMask not installed! Please install MetaMask extension.');
      connectionStatus.value = 'Failed: MetaMask not found';
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Switch to the selected network
    await switchNetwork(selectedNetwork.value);

    connectedAddress.value = address;
    connectionStatus.value = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    walletProvider.value = 'MetaMask';

    window.$message.success(`Connected to ${selectedNetwork.value.name} via MetaMask!`);

    // Save to database
    await saveConnection({
      network: selectedNetwork.value.name,
      chainId: selectedNetwork.value.chainId,
      address,
      provider: 'MetaMask'
    });

    setTimeout(() => {
      showWalletModal.value = false;
      connectionStatus.value = '';
    }, 2000);

  } catch (error) {
    console.error('MetaMask connection error:', error);
    connectionStatus.value = `Failed: ${error.message}`;
    window.$message.error(`Connection failed: ${error.message}`);
  }
}

// COINBASE WALLET CONNECTION
async function connectCoinbaseWallet() {
  if (!selectedNetwork.value) return;

  connectionStatus.value = 'Connecting to Coinbase Wallet...';

  try {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
      window.open('https://www.coinbase.com/wallet', '_blank');
      window.$message.warning('Coinbase Wallet extension not detected. Opening download page...');
      connectionStatus.value = 'Failed: Coinbase Wallet not found';
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    await switchNetwork(selectedNetwork.value);

    connectedAddress.value = address;
    connectionStatus.value = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    walletProvider.value = 'Coinbase Wallet';

    window.$message.success(`Connected to ${selectedNetwork.value.name} via Coinbase Wallet!`);

    await saveConnection({
      network: selectedNetwork.value.name,
      chainId: selectedNetwork.value.chainId,
      address,
      provider: 'Coinbase Wallet'
    });

    setTimeout(() => {
      showWalletModal.value = false;
      connectionStatus.value = '';
    }, 2000);

  } catch (error) {
    console.error('Coinbase Wallet connection error:', error);
    connectionStatus.value = `Failed: ${error.message}`;
    window.$message.error(`Connection failed: ${error.message}`);
  }
}

// NON-EVM WALLET CONNECTION (Native Extensions)
async function connectNativeWallet() {
  if (!selectedNetwork.value) return;

  const walletExt = getWalletExtension(selectedNetwork.value.name);
  if (!walletExt) {
    window.$message.error('No wallet extension configured for this network');
    return;
  }

  connectionStatus.value = `Connecting to ${walletExt.name}...`;

  try {
    // Check if extension is installed
    if (!walletExt.checkInstalled()) {
      window.open(walletExt.downloadUrl, '_blank');
      window.$message.warning(`${walletExt.name} extension not detected. Opening download page...`);
      connectionStatus.value = `Failed: ${walletExt.name} not found`;
      return;
    }

    // Connect to wallet
    const result = await walletExt.connect();

    connectedAddress.value = result.address;
    connectionStatus.value = `Connected: ${result.address.slice(0, 8)}...${result.address.slice(-6)}`;
    walletProvider.value = walletExt.name;

    window.$message.success(`Connected to ${selectedNetwork.value.name} via ${walletExt.name}!`);

    // Save to database
    await saveConnection({
      network: selectedNetwork.value.name,
      address: result.address,
      provider: walletExt.name,
      type: result.type
    });

    setTimeout(() => {
      showWalletModal.value = false;
      connectionStatus.value = '';
    }, 2000);

  } catch (error) {
    console.error('Native wallet connection error:', error);
    connectionStatus.value = `Failed: ${error.message}`;
    window.$message.error(`Connection failed: ${error.message}`);
  }
}

async function switchNetwork(network) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${network.chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: {
              name: network.symbol,
              symbol: network.symbol,
              decimals: 18
            },
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: null
          }],
        });
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    } else {
      throw switchError;
    }
  }
}

// Save connection to database
async function saveConnection(connectionData) {
  try {
    await $fetch('/api/v1/Wallets/saveConnection', {
      method: 'POST',
      body: {
        userID: userID.value,
        connectionData
      }
    });
  } catch (error) {
    console.error('Error saving connection to DB:', error);
  }
}

// Generate Wallet Function
async function generateWallet(network) {
  if (isGenerating.value) return;

  // Special handling for Bitcoin - show config modal
  if (network.name === 'Bitcoin') {
    selectedBitcoinNetwork.value = network;
    showBitcoinConfigModal.value = true;
    return;
  }

  isGenerating.value = true;

  try {
    console.log(`[Generate Wallet] Generating wallet for ${network.name}...`);

    const response = await $fetch('/api/v1/Wallets/generateWalletUniversal', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: network.name,
        walletName: `${network.name} Wallet`,
        saveToDatabase: true
      }
    });

    if (response.success) {
      console.log('[Generate Wallet] Success:', response);
      generatedWallet.value = response.wallet;
      showGeneratedWalletModal.value = true;
      showPrivateKey.value = false;
      showMnemonic.value = false;

      // Show success message
      window.$message?.success(`${network.name} wallet generated successfully!`);
    } else {
      console.error('[Generate Wallet] Error:', response.message);
      window.$message?.error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Generate Wallet] Exception:', error);
    window.$message?.error(`Failed to generate wallet: ${error.message}`);
  } finally {
    isGenerating.value = false;
  }
}

// Handle Bitcoin wallet generation with custom config
async function handleBitcoinWalletGeneration(config) {
  if (isGenerating.value) return;

  isGenerating.value = true;
  showBitcoinConfigModal.value = false;

  try {
    console.log(`[Generate Bitcoin Wallet] Generating with config:`, config);

    const response = await $fetch('/api/v1/Wallets/generateWalletUniversal', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Bitcoin',
        walletName: `Bitcoin Wallet (${config.wallets.length} wallets)`,
        saveToDatabase: true,
        bitcoinConfig: config
      }
    });

    if (response.success) {
      console.log('[Generate Bitcoin Wallet] Success:', response);
      generatedWallet.value = response.wallet;
      showGeneratedWalletModal.value = true;
      showPrivateKey.value = false;
      showMnemonic.value = false;

      // Show success message
      window.$message?.success(`Bitcoin wallet generated successfully with ${config.wallets.length} wallets!`);
    } else {
      console.error('[Generate Bitcoin Wallet] Error:', response.message);
      window.$message?.error(response.message || 'Failed to generate Bitcoin wallet');
    }
  } catch (error) {
    console.error('[Generate Bitcoin Wallet] Exception:', error);
    window.$message?.error(`Failed to generate Bitcoin wallet: ${error.message}`);
  } finally {
    isGenerating.value = false;
  }
}

// Copy to Clipboard Function
function copyToClipboard(text, label) {
  if (!text) return;

  navigator.clipboard.writeText(text)
    .then(() => {
      window.$message?.success(`${label} copied to clipboard!`);
    })
    .catch((error) => {
      console.error('Copy failed:', error);
      window.$message?.error('Failed to copy to clipboard');
    });
}

// Close Generated Wallet Modal
function closeGeneratedWalletModal() {
  showGeneratedWalletModal.value = false;
  generatedWallet.value = null;
  showPrivateKey.value = false;
  showMnemonic.value = false;
}

function closeModal() {
  showWalletModal.value = false;
  connectionStatus.value = '';
  selectedNetwork.value = null;
  connectedAddress.value = '';
  walletProvider.value = null;
}
</script>

<template>
  <div class="networks-page">
    <!-- Header -->
    <n-card class="header-card">
      <div class="header-content">
        <h1 class="page-title">🌐 Networks / Blockchains</h1>
        <p class="page-subtitle">200+ EVM & Non-EVM Networks - Connect with MetaMask, Coinbase Wallet, or Native Extensions</p>
      </div>

      <!-- Search Bar -->
      <n-input
        v-model:value="searchQuery"
        placeholder="Search networks by name or symbol..."
        size="large"
        clearable
        class="search-input"
      >
        <template #prefix>
          🔍
        </template>
      </n-input>
    </n-card>

    <!-- Layer Tabs -->
    <n-card class="tabs-card">
      <n-tabs v-model:value="selectedLayer" type="segment" size="large">
        <n-tab-pane
          v-for="tab in layerTabs"
          :key="tab.value"
          :name="tab.value"
          :tab="`${tab.label} (${tab.count})`"
        />
      </n-tabs>
    </n-card>

    <!-- EVM Filter -->
    <n-card class="filter-card">
      <div class="filter-header">
        <span class="filter-label">🔧 Filter by Type:</span>
        <n-button-group>
          <n-button
            :type="selectedEvmFilter === 'all' ? 'primary' : 'default'"
            @click="selectedEvmFilter = 'all'"
            size="medium"
          >
            🌐 All ({{ filteredNetworks.length }})
          </n-button>
          <n-button
            :type="selectedEvmFilter === 'evm' ? 'success' : 'default'"
            @click="selectedEvmFilter = 'evm'"
            size="medium"
          >
            🦊 EVM Compatible
          </n-button>
          <n-button
            :type="selectedEvmFilter === 'non-evm' ? 'warning' : 'default'"
            @click="selectedEvmFilter = 'non-evm'"
            size="medium"
          >
            📱 Non-EVM
          </n-button>
        </n-button-group>
      </div>
    </n-card>

    <!-- Networks Grid -->
    <n-card class="networks-card">
      <n-scrollbar style="max-height: calc(100vh - 350px);">
        <div class="networks-grid">
          <div
            v-for="network in filteredNetworks"
            :key="network.id"
            class="network-item"
            :class="{ 'evm-compatible': network.evmCompatible }"
          >
            <!-- Network Header -->
            <div class="network-header">
              <div class="network-icon">{{ network.icon }}</div>
              <div class="network-info">
                <div class="network-name">{{ network.name }}</div>
                <div class="network-symbol">{{ network.symbol }}</div>
              </div>
              <div v-if="network.evmCompatible" class="evm-badge">EVM</div>
              <div v-else class="non-evm-badge">Non-EVM</div>
            </div>

            <!-- Network Details -->
            <div class="network-details">
              <div class="detail-item">
                <span class="label">Chain ID:</span>
                <span class="value">{{ network.chainId || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">RPC:</span>
                <span class="value rpc-url">{{ network.rpcUrl ? '✓' : '✗' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="network-actions">
              <!-- Generate New Wallet Button -->
              <n-button
                type="success"
                size="small"
                @click="generateWallet(network)"
                block
                class="action-btn"
                style="margin-bottom: 8px;"
              >
                ✨ Generate Wallet
              </n-button>

              <!-- Connect Existing Wallet Button -->
              <n-button
                :type="network.evmCompatible ? 'primary' : 'info'"
                size="small"
                @click="openWalletModal(network)"
                block
                class="action-btn"
              >
                {{ network.evmCompatible ? '🦊 Connect' : '📱 Connect' }}
              </n-button>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </n-card>

    <!-- Wallet Modal -->
    <n-modal
      v-model:show="showWalletModal"
      preset="card"
      :title="`${selectedNetwork?.evmCompatible ? '🦊 Connect Wallet' : '📱 Connect Native Wallet'} - ${selectedNetwork?.name}`"
      style="width: 650px;"
    >
      <div class="wallet-modal-content">
        <!-- Network Info -->
        <div class="network-info-modal">
          <div class="info-row">
            <span class="label">Network:</span>
            <span class="value">{{ selectedNetwork?.name }} ({{ selectedNetwork?.symbol }})</span>
          </div>
          <div class="info-row">
            <span class="label">Type:</span>
            <span class="value">{{ selectedNetwork?.evmCompatible ? '🦊 EVM Compatible' : '📱 Non-EVM' }}</span>
          </div>
          <div class="info-row" v-if="selectedNetwork?.chainId">
            <span class="label">Chain ID:</span>
            <span class="value">{{ selectedNetwork?.chainId }}</span>
          </div>
        </div>

        <n-divider />

        <!-- Connection Status -->
        <div v-if="connectionStatus" class="connection-status">
          <n-alert
            :type="connectionStatus.includes('Connected') ? 'success' : connectionStatus.includes('Failed') ? 'error' : 'info'"
          >
            {{ connectionStatus }}
          </n-alert>
        </div>

        <!-- EVM Wallet Options -->
        <div v-if="selectedNetwork?.evmCompatible" class="wallet-options">
          <n-button
            type="primary"
            size="large"
            block
            @click="connectMetaMask"
            :loading="connectionStatus.includes('MetaMask')"
            class="wallet-option-btn metamask"
          >
            <div class="btn-content">
              <span class="wallet-icon">🦊</span>
              <span class="wallet-name">Connect with MetaMask</span>
            </div>
          </n-button>

          <n-button
            type="info"
            size="large"
            block
            @click="connectCoinbaseWallet"
            :loading="connectionStatus.includes('Coinbase')"
            class="wallet-option-btn coinbase"
            style="margin-top: 12px;"
          >
            <div class="btn-content">
              <span class="wallet-icon">🔵</span>
              <span class="wallet-name">Connect with Coinbase Wallet</span>
            </div>
          </n-button>
        </div>

        <!-- Non-EVM Wallet Option -->
        <div v-else class="wallet-options">
          <div v-if="getWalletExtension(selectedNetwork?.name)" class="native-wallet-info">
            <n-alert type="info" title="Native Wallet Required" style="margin-bottom: 16px;">
              This network requires {{ getWalletExtension(selectedNetwork?.name).name }} extension
            </n-alert>

            <n-button
              type="primary"
              size="large"
              block
              @click="connectNativeWallet"
              :loading="connectionStatus.includes('Connecting')"
              class="wallet-option-btn native"
            >
              <div class="btn-content">
                <span class="wallet-icon">{{ getWalletExtension(selectedNetwork?.name).icon }}</span>
                <span class="wallet-name">Connect {{ getWalletExtension(selectedNetwork?.name).name }}</span>
              </div>
            </n-button>

            <n-button
              type="default"
              size="medium"
              block
              tag="a"
              :href="getWalletExtension(selectedNetwork?.name).downloadUrl"
              target="_blank"
              style="margin-top: 12px;"
            >
              📥 Download Extension
            </n-button>
          </div>

          <div v-else>
            <n-alert type="warning">
              No native wallet extension configured for {{ selectedNetwork?.name }}
            </n-alert>
          </div>
        </div>

        <n-button size="large" block @click="closeModal" style="margin-top: 20px;">
          Close
        </n-button>
      </div>
    </n-modal>

    <!-- Generated Wallet Modal -->
    <n-modal
      v-model:show="showGeneratedWalletModal"
      preset="card"
      title="🎉 Wallet Generated Successfully!"
      style="width: 700px;"
      :closable="false"
    >
      <div class="generated-wallet-content" v-if="generatedWallet">
        <!-- Success Message -->
        <n-alert type="success" style="margin-bottom: 20px;">
          <template #icon>
            <span style="font-size: 24px;">✅</span>
          </template>
          Your {{ generatedWallet.network }} wallet has been created and saved securely!
        </n-alert>

        <!-- Wallet Details -->
        <n-card title="📋 Wallet Details" style="margin-bottom: 20px;">
          <!-- Network -->
          <div class="wallet-detail-row">
            <span class="wallet-label">🌐 Network:</span>
            <span class="wallet-value">{{ generatedWallet.network }} ({{ generatedWallet.symbol }})</span>
          </div>

          <!-- Address -->
          <div class="wallet-detail-row" v-if="generatedWallet.address">
            <span class="wallet-label">📍 Address:</span>
            <div class="wallet-value-with-copy">
              <n-input
                :value="generatedWallet.address"
                readonly
                size="small"
              />
              <n-button
                size="small"
                @click="copyToClipboard(generatedWallet.address, 'Address')"
                style="margin-left: 8px;"
              >
                📋 Copy
              </n-button>
            </div>
          </div>

          <!-- Type -->
          <div class="wallet-detail-row">
            <span class="wallet-label">🔧 Type:</span>
            <n-tag :type="generatedWallet.type === 'EVM' ? 'success' : 'info'">
              {{ generatedWallet.type }}
            </n-tag>
          </div>
        </n-card>

        <!-- Security Warning -->
        <n-alert type="warning" style="margin-bottom: 20px;">
          <template #icon>
            <span style="font-size: 24px;">⚠️</span>
          </template>
          <strong>IMPORTANT SECURITY WARNING:</strong>
          <ul style="margin: 10px 0 0 20px;">
            <li>Your private key and mnemonic are stored securely in the database</li>
            <li>NEVER share your private key or mnemonic with anyone!</li>
            <li>Make a backup and store it offline in a safe place</li>
            <li>You are responsible for keeping your wallet secure</li>
          </ul>
        </n-alert>

        <!-- Private Key (Show/Hide) -->
        <n-card title="🔑 Private Key" style="margin-bottom: 20px;">
          <n-alert type="error" style="margin-bottom: 12px;">
            <strong>⛔ DO NOT SHARE THIS!</strong> Anyone with your private key can access your funds.
          </n-alert>

          <div class="wallet-detail-row">
            <n-button
              @click="showPrivateKey = !showPrivateKey"
              type="warning"
              size="small"
              style="margin-bottom: 12px;"
            >
              {{ showPrivateKey ? '🙈 Hide' : '👁️ Show' }} Private Key
            </n-button>
          </div>

          <div v-if="showPrivateKey" class="wallet-value-with-copy">
            <n-input
              :value="generatedWallet.privateKey || 'Not available'"
              readonly
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
            <n-button
              size="small"
              @click="copyToClipboard(generatedWallet.privateKey, 'Private Key')"
              style="margin-top: 8px;"
              v-if="generatedWallet.privateKey"
            >
              📋 Copy Private Key
            </n-button>
          </div>
        </n-card>

        <!-- Mnemonic Phrase -->
        <n-card title="📝 Mnemonic Phrase (Seed Phrase)" style="margin-bottom: 20px;">
          <n-alert type="error" style="margin-bottom: 12px;">
            <strong>⛔ BACKUP REQUIRED!</strong> Write down this phrase and store it safely offline.
          </n-alert>

          <div class="wallet-detail-row">
            <n-button
              @click="showMnemonic = !showMnemonic"
              type="warning"
              size="small"
              style="margin-bottom: 12px;"
            >
              {{ showMnemonic ? '🙈 Hide' : '👁️ Show' }} Mnemonic
            </n-button>
          </div>

          <div v-if="showMnemonic" class="wallet-value-with-copy">
            <n-input
              :value="generatedWallet.mnemonic || 'Not available'"
              readonly
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
            <n-button
              size="small"
              @click="copyToClipboard(generatedWallet.mnemonic, 'Mnemonic')"
              style="margin-top: 8px;"
              v-if="generatedWallet.mnemonic"
            >
              📋 Copy Mnemonic
            </n-button>
          </div>
        </n-card>

        <!-- Actions -->
        <div style="display: flex; gap: 12px;">
          <n-button
            type="primary"
            size="large"
            block
            @click="closeGeneratedWalletModal"
          >
            ✅ I've Saved My Wallet
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Bitcoin Wallet Config Modal -->
    <n-modal
      v-model:show="showBitcoinConfigModal"
      preset="card"
      title="🧱 Configure Bitcoin Wallet"
      style="width: 900px; max-height: 90vh; overflow-y: auto;"
      :closable="true"
    >
      <BitcoinWalletConfigForm
        @generate="handleBitcoinWalletGeneration"
        @cancel="showBitcoinConfigModal = false"
      />
    </n-modal>
  </div>
</template>

<style scoped>
.networks-page {
  padding: 20px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  min-height: 100vh;
}

.header-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
  margin-bottom: 20px;
}

.header-content {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #00ff88;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0 0 0;
}

.search-input {
  margin-top: 20px;
}

.tabs-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
  margin-bottom: 20px;
}

.filter-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}

.filter-label {
  font-size: 16px;
  font-weight: 600;
  color: #00ff88;
}

.networks-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.networks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px;
}

.network-item {
  background: rgba(20, 25, 45, 0.8);
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.network-item.evm-compatible {
  border-color: rgba(0, 255, 136, 0.4);
}

.network-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.2);
  background: rgba(25, 30, 50, 0.9);
}

.network-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.network-icon {
  font-size: 32px;
}

.network-info {
  flex: 1;
}

.network-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.network-symbol {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.evm-badge {
  background: #00ff88;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.non-evm-badge {
  background: #ff6b6b;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.network-details {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(10, 15, 30, 0.6);
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-item .value {
  color: #fff;
  font-weight: bold;
}

.detail-item .value.rpc-url {
  color: #00ff88;
}

.network-actions {
  margin-top: 12px;
}

.action-btn {
  font-weight: 600;
}

/* Wallet Modal Styles */
.wallet-modal-content {
  padding: 12px;
}

.network-info-modal {
  background: rgba(20, 25, 45, 0.6);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
}

.info-row .value {
  color: #fff;
}

.connection-status {
  margin-bottom: 16px;
}

.wallet-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-option-btn {
  height: 60px;
  font-size: 16px;
}

.wallet-option-btn .btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-option-btn .wallet-icon {
  font-size: 24px;
}

.wallet-option-btn .wallet-name {
  font-weight: 600;
}

.wallet-option-btn.metamask {
  background: linear-gradient(135deg, #f6851b 0%, #e2761b 100%);
}

.wallet-option-btn.coinbase {
  background: linear-gradient(135deg, #0052ff 0%, #0041cc 100%);
}

.wallet-option-btn.native {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.native-wallet-info {
  padding: 8px 0;
}

/* Generated Wallet Modal Styles */
.generated-wallet-content {
  max-height: 70vh;
  overflow-y: auto;
}

.wallet-detail-row {
  margin-bottom: 16px;
}

.wallet-label {
  font-weight: 600;
  color: #00ff88;
  display: block;
  margin-bottom: 8px;
}

.wallet-value {
  color: #fff;
  font-family: 'Monaco', 'Courier New', monospace;
  word-break: break-all;
}

.wallet-value-with-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
