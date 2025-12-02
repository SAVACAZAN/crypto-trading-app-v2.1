# 🔐 Crypto Wallet Generators API

Complete wallet generation system supporting **15+ blockchains** across multiple ecosystems.

---

## 📚 Table of Contents

- [Supported Networks](#supported-networks)
- [API Endpoints](#api-endpoints)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Network-Specific Details](#network-specific-details)
- [Security Best Practices](#security-best-practices)
- [Examples](#examples)

---

## 🌐 Supported Networks

### **EVM-Compatible Chains** (1 Universal Generator)
- ✅ Ethereum (ETH)
- ✅ Arbitrum (ARB)
- ✅ Optimism (OP)
- ✅ Base
- ✅ Polygon (MATIC)
- ✅ Avalanche (AVAX)
- ✅ BNB Chain (BNB)
- ✅ Plasma (PLS)
- ✅ And 50+ other EVM chains

**Endpoint:** `POST /api/v1/Wallets/generateWallet.post.js`

---

### **Non-EVM Chains** (11 Specialized Generators)

#### **1. Bitcoin (BTC)** 🟠
**Endpoint:** `POST /api/v1/Wallets/generateBitcoinWallet.post.js`
- **Special Features:** 5 address types (Legacy, SegWit, Native SegWit, Taproot, etc.)
- **Mnemonic:** 12 or 24 words
- **Addresses:** Up to 50 addresses (10 wallets × 5 types)

#### **2. MultiversX (EGLD)** 🔷
**Endpoint:** `POST /api/v1/Wallets/generateMultiversXWallet.post.js`
- **SDK:** `@multiversx/sdk-wallet`
- **Format:** `erd1...` (bech32)
- **Derivation:** `m/44'/508'/{account}'/0'/0'`
- **Mnemonic:** 24 words

#### **3. Cardano (ADA)** 🔵
**Endpoint:** `POST /api/v1/Wallets/generateCardanoWallet.post.js`
- **SDK:** `@emurgo/cardano-serialization-lib-nodejs`
- **Format:** `addr1...` (Shelley) + `stake1...` (staking)
- **Derivation:** `m/1852'/1815'/{account}'/0/0` (CIP-1852)
- **Mnemonic:** 24 words

#### **4. Cosmos (ATOM)** ⚛️
**Endpoint:** `POST /api/v1/Wallets/generateCosmosWallet.post.js`
- **SDK:** `@cosmjs/stargate`
- **Format:** `cosmos1...`, `osmo1...`, `juno1...`, etc.
- **Supports:** ALL Cosmos SDK chains (ATOM, OSMO, JUNO, INJ, TIA, DYDX, etc.)
- **Derivation:** `m/44'/{coinType}'/{account}'/0/0`
- **Mnemonic:** 24 words

#### **5. Stellar (XLM)** ⭐
**Endpoint:** `POST /api/v1/Wallets/generateStellarWallet.post.js`
- **SDK:** `stellar-sdk`
- **Format:** `G...` (public) + `S...` (secret)
- **Derivation:** `m/44'/148'/{account}'`
- **Mnemonic:** 24 words

#### **6. Ripple (XRP)** 💧
**Endpoint:** `POST /api/v1/Wallets/generateRippleWallet.post.js`
- **SDK:** `ripple-keypairs`
- **Format:** `r...` (classic address)
- **Algorithms:** secp256k1 or ed25519
- **Derivation:** `m/44'/144'/{account}'/0/0`
- **Mnemonic:** 24 words

#### **7. TON** 💎
**Endpoint:** `POST /api/v1/Wallets/generateTONWallet.post.js`
- **SDK:** `ton-crypto` + `ton-core`
- **Format:** `EQ...` (bounceable) / `UQ...` (non-bounceable)
- **Wallet Contract:** v4R2 (recommended)
- **Mnemonic:** 24 words

#### **8. Polkadot (DOT) / Kusama (KSM)** 🔴
**Endpoint:** `POST /api/v1/Wallets/generatePolkadotWallet.post.js`
- **SDK:** `@polkadot/keyring`
- **Format:** Multiple SS58 formats (0=Polkadot, 2=Kusama, 42=Generic)
- **Key Types:** sr25519, ed25519, ecdsa
- **Mnemonic:** 12 words (default)

#### **9. Algorand (ALGO)** ◼️
**Endpoint:** `POST /api/v1/Wallets/generateAlgorandWallet.post.js`
- **SDK:** `algosdk`
- **Format:** 58-character address (base32)
- **Mnemonic:** 25 words (unique to Algorand!)

#### **10. Aptos (APT)** 🪨
**Endpoint:** `POST /api/v1/Wallets/generateAptosWallet.post.js`
- **SDK:** `aptos`
- **Format:** `0x...` (64 hex characters)
- **Language:** Move
- **Mnemonic:** 12 words

#### **11. Sui** 💧
**Endpoint:** `POST /api/v1/Wallets/generateSuiWallet.post.js`
- **SDK:** `@mysten/sui.js`
- **Format:** `0x...` (64 hex characters)
- **Language:** Move
- **Mnemonic:** 12 words

#### **12. Tron (TRX)** 🔶
**Endpoint:** `POST /api/v1/Wallets/generateTronWallet.post.js`
- **SDK:** `tronweb`
- **Format:** `T...` (base58) / `41...` (hex)
- **Derivation:** `m/44'/195'/{account}'/0/0`
- **Mnemonic:** 12 words

---

## 📡 API Endpoints

### General Format
```
POST /api/v1/Wallets/generate[Network]Wallet
```

### Available Endpoints
```
POST /api/v1/Wallets/generateWallet                    # EVM chains
POST /api/v1/Wallets/generateBitcoinWallet             # Bitcoin
POST /api/v1/Wallets/generateEthereumWallet            # Ethereum
POST /api/v1/Wallets/generateMultiversXWallet          # MultiversX
POST /api/v1/Wallets/generateCardanoWallet             # Cardano
POST /api/v1/Wallets/generateCosmosWallet              # Cosmos
POST /api/v1/Wallets/generateStellarWallet             # Stellar
POST /api/v1/Wallets/generateRippleWallet              # Ripple
POST /api/v1/Wallets/generateTONWallet                 # TON
POST /api/v1/Wallets/generatePolkadotWallet            # Polkadot
POST /api/v1/Wallets/generateAlgorandWallet            # Algorand
POST /api/v1/Wallets/generateAptosWallet               # Aptos
POST /api/v1/Wallets/generateSuiWallet                 # Sui
POST /api/v1/Wallets/generateTronWallet                # Tron
```

---

## 📥 Request Format

### Standard Request Body
```json
{
  "userID": "string (required)",
  "walletName": "string (optional)",
  "saveToDatabase": "boolean (default: true)",
  "useCustomMnemonic": "boolean (default: false)",
  "customMnemonic": "string (optional)",
  "accountIndex": "number (default: 0)"
}
```

### Network-Specific Parameters

#### Cosmos
```json
{
  "addressPrefix": "cosmos | osmo | juno | inj | etc.",
  "chainName": "Cosmos Hub | Osmosis | Juno | etc."
}
```

#### Cardano
```json
{
  "networkType": "mainnet | testnet"
}
```

#### TON
```json
{
  "walletVersion": "v4R2 | v4R1 | v3R2 | v3R1",
  "workchain": "0 (basechain) | -1 (masterchain)"
}
```

#### Ripple
```json
{
  "algorithm": "secp256k1 | ed25519"
}
```

#### Polkadot
```json
{
  "keyType": "sr25519 | ed25519 | ecdsa",
  "network": "polkadot | kusama | westend",
  "addressFormat": "0 | 2 | 42"
}
```

---

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "wallet": {
    "network": "Network Name",
    "type": "Network Type",
    "symbol": "SYMBOL",
    "address": "wallet_address",
    "publicKey": "public_key",
    // privateKey and mnemonic are NOT returned for security
    "warning": "Security warning message",
    "chainInfo": {
      "rpcUrl": "https://...",
      "explorerUrl": "https://...",
      // ... more chain-specific info
    },
    "notes": [
      "Important note 1",
      "Important note 2"
    ]
  },
  "walletId": "mongodb_id",
  "message": "Wallet generated successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔍 Network-Specific Details

### Mnemonic Word Counts
| Network | Word Count | Standard |
|---------|-----------|----------|
| Bitcoin | 12 or 24 | BIP39 |
| Ethereum/EVM | 12 | BIP39 |
| MultiversX | 24 | BIP39 |
| Cardano | 24 | BIP39 |
| Cosmos | 24 | BIP39 |
| Stellar | 24 | BIP39 |
| Ripple | 24 | BIP39 |
| TON | 24 | TON-specific |
| Polkadot | 12 | Substrate |
| **Algorand** | **25** | **Algorand-specific** |
| Aptos | 12 | BIP39 |
| Sui | 12 | BIP39 |
| Tron | 12 | BIP39 |

### Derivation Paths (BIP44)
| Network | Coin Type | Path |
|---------|-----------|------|
| Bitcoin | 0 | m/44'/0'/{account}' |
| Ethereum | 60 | m/44'/60'/0'/0/{index} |
| MultiversX | 508 | m/44'/508'/{account}'/0'/0' |
| Cardano | 1815 | m/1852'/1815'/{account}'/0/0 |
| Cosmos | 118 | m/44'/118'/{account}'/0/0 |
| Stellar | 148 | m/44'/148'/{account}' |
| Ripple | 144 | m/44'/144'/{account}'/0/0 |
| Tron | 195 | m/44'/195'/{account}'/0/0 |

---

## 🔒 Security Best Practices

### ⚠️ CRITICAL WARNINGS

1. **NEVER share your private keys or mnemonics** with anyone
2. **Always encrypt private keys** before storing in production databases
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** on wallet generation endpoints
5. **Add authentication** to protect wallet generation
6. **Backup mnemonics offline** (paper wallet, hardware wallet)
7. **Use environment variables** for sensitive configuration

### Production Recommendations

```javascript
// ❌ DON'T - Store plain private keys
privateKey: wallet.privateKey

// ✅ DO - Encrypt before storing
privateKey: encrypt(wallet.privateKey, userMasterKey)
```

### Mnemonic Storage

```javascript
// ❌ DON'T - Return mnemonic in API response
return { mnemonic: wallet.mnemonic }

// ✅ DO - Return undefined (already saved in DB encrypted)
return { mnemonic: undefined }
```

---

## 📝 Examples

### Example 1: Generate Ethereum Wallet
```bash
curl -X POST http://localhost:3000/api/v1/Wallets/generateWallet \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "user123",
    "network": "Ethereum",
    "walletName": "My ETH Wallet",
    "saveToDatabase": true
  }'
```

### Example 2: Generate Cosmos Wallet (Osmosis)
```bash
curl -X POST http://localhost:3000/api/v1/Wallets/generateCosmosWallet \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "user123",
    "walletName": "My OSMO Wallet",
    "addressPrefix": "osmo",
    "chainName": "Osmosis",
    "saveToDatabase": true
  }'
```

### Example 3: Restore Wallet from Mnemonic
```bash
curl -X POST http://localhost:3000/api/v1/Wallets/generateCardanoWallet \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "user123",
    "useCustomMnemonic": true,
    "customMnemonic": "word1 word2 word3 ... word24",
    "accountIndex": 0
  }'
```

### Example 4: Generate Multiple Addresses (Bitcoin)
```bash
curl -X POST http://localhost:3000/api/v1/Wallets/generateBitcoinWallet \
  -H "Content-Type: application/json" \
  -d '{
    "userID": "user123",
    "bitcoinConfig": {
      "wallets": [
        { "index": 0, "name": "SAVINGS", "emoji": "💰" },
        { "index": 1, "name": "TRADING", "emoji": "📈" },
        { "index": 2, "name": "HODL", "emoji": "💎" }
      ],
      "wordCount": 24,
      "passphrase": "optional_passphrase"
    }
  }'
```

---

## 🧪 Testing

### Test Endpoints

All generators support testnet/devnet:

- **Cardano:** `networkType: "testnet"`
- **Aptos:** `network: "testnet" | "devnet"`
- **Sui:** `network: "testnet" | "devnet"`
- **Tron:** `network: "shasta" | "nile"`
- **Polkadot:** `network: "westend"`
- **Cosmos:** Use testnet RPC URLs

### Faucets for Testing

| Network | Faucet URL |
|---------|-----------|
| Aptos Testnet | https://faucet.testnet.aptoslabs.com |
| Sui Testnet | https://faucet.testnet.sui.io |
| Tron Shasta | https://www.trongrid.io/shasta |
| Algorand Testnet | https://bank.testnet.algorand.network |

---

## 🛠️ Database Schema

Wallets are saved to MongoDB using the `userWalletsSchema`:

```javascript
{
  userID: String,
  walletName: String,
  network: String,
  networkSymbol: String,
  chainId: Number,
  walletType: String,
  address: String,
  publicKey: String,
  privateKey: String,  // ⚠️ Encrypt in production!
  mnemonic: String,    // ⚠️ Encrypt in production!
  isDefault: Boolean,
  balance: String,
  balanceUSD: String,
  note: String,
  tags: [String],
  createdAt: Date,
  lastUsed: Date,
  isActive: Boolean
}
```

---

## 📊 Comparison Table

| Feature | Bitcoin | Ethereum | MultiversX | Cardano | Cosmos | TON | Polkadot | Algorand |
|---------|---------|----------|------------|---------|--------|-----|----------|----------|
| Address Types | 5 | 1 | 1 | 2 | 1 | 2 | 3 | 1 |
| Mnemonic Words | 12/24 | 12 | 24 | 24 | 24 | 24 | 12 | **25** |
| Staking | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Smart Contracts | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EVM Compatible | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔗 Useful Links

### Documentation
- [BIP39 Standard](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 Standard](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)

### SDKs
- [ethers.js](https://docs.ethers.org/)
- [MultiversX SDK](https://docs.multiversx.com/)
- [Cardano Serialization Lib](https://github.com/Emurgo/cardano-serialization-lib)
- [CosmJS](https://github.com/cosmos/cosmjs)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)

---

## 📄 License

This wallet generation system is part of the Crypto Trading App.

**Security Notice:** This code is provided for educational purposes. Always conduct security audits before using in production.

---

## 🤝 Support

For issues or questions:
1. Check the [Examples](#examples) section
2. Review [Security Best Practices](#security-best-practices)
3. Test with testnets first
4. Implement proper encryption for production

---

**Last Updated:** 2025-01-26
**Version:** 2.2
**Supported Networks:** 15+ blockchains
