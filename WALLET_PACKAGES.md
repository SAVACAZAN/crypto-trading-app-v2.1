# Non-EVM Wallet Generation Packages

This document lists all required packages for generating wallets on non-EVM blockchains.

## Bitcoin & Variants

### Bitcoin (BTC)
```bash
npm install bitcoinjs-lib bip32 bip39 tiny-secp256k1
```
- **bitcoinjs-lib** - Bitcoin wallet and transaction library
- **bip32** - HD wallet derivation
- **bip39** - Mnemonic phrase generation (already installed)
- **tiny-secp256k1** - Elliptic curve cryptography (already installed)

### Bitcoin Cash (BCH)
```bash
npm install @psf/bitcoincashjs-lib bip32 bip39
```

### Litecoin (LTC)
```bash
npm install litecore-lib bip39
```

### Dogecoin (DOGE)
```bash
npm install bitcore-lib-doge bip39
```

---

## Layer 1 Blockchains

### Solana (SOL)
```bash
npm install @solana/web3.js @solana/spl-token bs58
```
- **@solana/web3.js** - Solana JavaScript API
- **bs58** - Base58 encoding for keypairs

### Cardano (ADA)
```bash
npm install @emurgo/cardano-serialization-lib-nodejs cardano-wallet-js
```
- **cardano-serialization-lib** - Cardano core library
- **cardano-wallet-js** - Wallet generation and management

### Polkadot (DOT) / Kusama (KSM)
```bash
npm install @polkadot/api @polkadot/util-crypto @polkadot/keyring
```
- **@polkadot/api** - Polkadot/Substrate API (already installed)
- **@polkadot/util-crypto** - Cryptographic utilities (already installed)
- **@polkadot/keyring** - Key management

### Cosmos (ATOM)
```bash
npm install @cosmjs/crypto @cosmjs/encoding @cosmjs/proto-signing
```
- **@cosmjs/crypto** - Cosmos cryptography (already installed)
- **@cosmjs/encoding** - Bech32 address encoding (already installed)

### Near Protocol (NEAR)
```bash
npm install near-api-js
```

### Algorand (ALGO)
```bash
npm install algosdk
```
- **algosdk** - Complete Algorand SDK with wallet generation (already installed)

### Stellar (XLM)
```bash
npm install stellar-sdk
```

### Ripple (XRP)
```bash
npm install ripple-lib ripple-keypairs
```

### Tezos (XTZ)
```bash
npm install @taquito/taquito @taquito/signer
```

### TON (TON)
```bash
npm install ton ton-crypto ton-core
```

### Aptos (APT)
```bash
npm install aptos
```
- **aptos** - Official Aptos SDK (already installed)

### Sui (SUI)
```bash
npm install @mysten/sui.js
```
- Already installed

### Hedera (HBAR)
```bash
npm install @hashgraph/sdk
```

### Internet Computer (ICP)
```bash
npm install @dfinity/agent @dfinity/identity
```

### IOTA (IOTA)
```bash
npm install @iota/sdk
```

---

## Smart Contract Platforms

### Tron (TRX)
```bash
npm install tronweb
```
- Already installed

### EOS (EOS)
```bash
npm install eosjs eosjs-ecc
```

### NEO (NEO)
```bash
npm install @cityofzion/neon-js
```

### Waves (WAVES)
```bash
npm install @waves/waves-crypto
```

### Stacks (STX)
```bash
npm install @stacks/transactions @stacks/wallet-sdk
```

---

## Privacy Coins

### Monero (XMR)
```bash
npm install monero-javascript
```

### Zcash (ZEC)
```bash
npm install bitcore-lib-zcash bip39
```

---

## Move-Based Chains

### Aptos (APT) - Already listed above
### Sui (SUI) - Already listed above

---

## Substrate-Based Chains
All Substrate chains can use Polkadot packages:
```bash
npm install @polkadot/api @polkadot/util-crypto @polkadot/keyring
```

**Supported:**
- Polkadot (DOT)
- Kusama (KSM)
- Moonbeam (GLMR) - *Actually EVM compatible*
- Acala (ACA)
- Astar (ASTR) - *Has EVM support*
- Phala (PHA)
- Parallel (PARA)

---

## Cosmos Ecosystem (IBC-enabled)
All Cosmos SDK chains use CosmJS:
```bash
npm install @cosmjs/crypto @cosmjs/encoding @cosmjs/proto-signing @cosmjs/stargate
```

**Supported:**
- Cosmos Hub (ATOM)
- Osmosis (OSMO)
- Juno (JUNO)
- Injective (INJ)
- Kujira (KUJI)
- Terra Classic (LUNC)
- Terra (LUNA)
- Celestia (TIA)
- dYdX (DYDX)
- Noble (USDC)
- Stride (STRD)
- Kava (KAVA) - *Has EVM support*
- Evmos (EVMOS) - *EVM compatible*
- Cronos (CRO) - *EVM compatible*

---

## Specialized Networks

### Filecoin (FIL)
```bash
npm install @glif/filecoin-address @zondax/filecoin-signing-tools
```

### VeChain (VET)
```bash
npm install thor-devkit
```

### Zilliqa (ZIL)
```bash
npm install @zilliqa-js/zilliqa
```

### Flow (FLOW)
```bash
npm install @onflow/fcl @onflow/types
```

### Elrond/MultiversX (EGLD)
```bash
npm install @multiversx/sdk-core @multiversx/sdk-wallet
```

### Casper (CSPR)
```bash
npm install casper-js-sdk
```

### Mina Protocol (MINA)
```bash
npm install mina-signer
```

---

## COMPLETE INSTALLATION COMMAND

To install ALL packages at once:

```bash
npm install \
  bitcoinjs-lib bip32 \
  @solana/web3.js bs58 \
  @emurgo/cardano-serialization-lib-nodejs cardano-wallet-js \
  @polkadot/keyring \
  @cosmjs/stargate \
  near-api-js \
  stellar-sdk \
  ripple-lib ripple-keypairs \
  @taquito/taquito @taquito/signer \
  ton ton-crypto ton-core \
  @hashgraph/sdk \
  @dfinity/agent @dfinity/identity \
  @iota/sdk \
  eosjs eosjs-ecc \
  @cityofzion/neon-js \
  @waves/waves-crypto \
  @stacks/transactions @stacks/wallet-sdk \
  monero-javascript \
  @glif/filecoin-address @zondax/filecoin-signing-tools \
  thor-devkit \
  @zilliqa-js/zilliqa \
  @onflow/fcl @onflow/types \
  @multiversx/sdk-core @multiversx/sdk-wallet \
  casper-js-sdk \
  mina-signer \
  litecore-lib \
  bitcore-lib-doge \
  @psf/bitcoincashjs-lib \
  bitcore-lib-zcash
```

---

## Recommended Priority Order

### High Priority (Most Popular)
1. **Bitcoin** - Most important cryptocurrency
2. **Solana** - Very popular, large ecosystem
3. **Cosmos Ecosystem** - Many chains with IBC (ATOM, OSMO, etc.)
4. **Polkadot Ecosystem** - Growing Substrate ecosystem
5. **Cardano** - Major smart contract platform
6. **Algorand** - Fast, efficient blockchain (already installed)

### Medium Priority
7. Stellar
8. Ripple
9. Near
10. Aptos (already installed)
11. Sui (already installed)
12. TON

### Lower Priority
- Privacy coins (Monero, Zcash)
- Legacy chains (EOS, NEO, Waves)
- Specialized networks

---

## Phase 1: Essential Networks (Install First)

```bash
npm install bitcoinjs-lib bip32 @solana/web3.js bs58 @polkadot/keyring @cosmjs/stargate stellar-sdk near-api-js
```

This covers:
- Bitcoin
- Solana
- All Cosmos chains (30+ networks)
- All Polkadot chains (10+ networks)
- Stellar
- Near

**Total: ~50+ networks with 8 packages**

---

## Phase 2: Popular Alts

```bash
npm install @emurgo/cardano-serialization-lib-nodejs cardano-wallet-js ripple-lib ripple-keypairs ton ton-crypto ton-core
```

This covers:
- Cardano
- Ripple
- TON

**Total: +3 networks**

---

## Phase 3: Extended Support

```bash
npm install @taquito/taquito @taquito/signer @hashgraph/sdk @dfinity/agent @dfinity/identity @iota/sdk eosjs eosjs-ecc
```

This covers:
- Tezos
- Hedera
- Internet Computer
- IOTA
- EOS

**Total: +5 networks**

---

## Security Notes

1. **ALL private keys MUST be encrypted** in production
2. **NEVER log private keys or mnemonics**
3. **Use server-side only** - NEVER expose wallet generation to client
4. **Implement rate limiting** on wallet generation endpoints
5. **Add user authentication** - require valid user session
6. **Backup strategies** - warn users to backup mnemonics
7. **HD Wallets** - use BIP-39/BIP-44 where supported

---

## Configuration for nuxt.config.ts

Add to `vite.optimizeDeps.exclude` and `nitro.externals.external`:

```javascript
vite: {
  optimizeDeps: {
    exclude: [
      // Already there:
      'ethers', 'bip39', 'bip32', 'tiny-secp256k1',
      // Add these:
      '@solana/web3.js',
      '@polkadot/api',
      '@polkadot/util-crypto',
      '@polkadot/keyring',
      '@cosmjs/crypto',
      '@cosmjs/stargate',
      'algosdk',
      'stellar-sdk',
      'tronweb',
      'bitcoinjs-lib',
      'cardano-wallet-js',
      '@emurgo/cardano-serialization-lib-nodejs',
      'near-api-js',
      'aptos',
      '@mysten/sui.js',
      'ripple-lib',
      'monero-javascript'
    ]
  }
},
nitro: {
  externals: {
    external: [
      // Add all wallet libraries
      '@solana/web3.js',
      '@polkadot/api',
      '@polkadot/keyring',
      '@cosmjs/crypto',
      '@cosmjs/stargate',
      'algosdk',
      'stellar-sdk',
      'tronweb',
      'bitcoinjs-lib',
      'near-api-js',
      'aptos',
      '@mysten/sui.js',
      'ripple-lib'
    ]
  }
}
```
