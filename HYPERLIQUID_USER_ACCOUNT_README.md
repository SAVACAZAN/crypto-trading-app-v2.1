# Hyperliquid User Account Data - Documentation

## Overview

Sistem complet pentru stocarea și gestionarea datelor de cont Hyperliquid pentru fiecare utilizator: Balance, Deposits, Withdrawals și Internal Transfers (Spot ↔ Perp). Datele sunt sincronizate din Hyperliquid API și stocate în MongoDB pentru acces rapid.

## Database Schema

### Collection: `hyperliquid_user_accounts`

```javascript
{
  userId: String,                // User ID
  walletAddress: String,         // Hyperliquid wallet address
  apiKeyId: ObjectId,           // Reference to API key

  // 💰 BALANCE
  balance: {
    spot: {
      assets: [{
        coin: String,
        total: Number,
        hold: Number,
        available: Number,
        usdValue: Number
      }],
      totalUsdValue: Number,
      lastUpdated: Date
    },
    perp: {
      marginSummary: {
        accountValue: Number,
        totalNtlPos: Number,
        totalRawUsd: Number,
        totalMarginUsed: Number,
        withdrawable: Number
      },
      assetPositions: [...],
      crossMarginSummary: {...},
      lastUpdated: Date
    },
    totalAccountValue: Number,
    lastSync: Date
  },

  // 📥 DEPOSITS
  deposits: [{
    transactionHash: String,
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    status: String,              // pending, confirmed, failed
    confirmations: Number,
    fromAddress: String,
    toAddress: String,
    fee: Number,
    metadata: Object
  }],

  // 📤 WITHDRAWALS
  withdrawals: [{
    transactionHash: String,
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    status: String,              // pending, processing, completed, failed, cancelled
    fromAddress: String,
    toAddress: String,
    fee: Number,
    nonce: Number,
    metadata: Object
  }],

  // 🔄 INTERNAL TRANSFERS
  transfers: [{
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    fromAccount: String,         // spot, perp
    toAccount: String,           // spot, perp
    transactionHash: String,
    status: String,              // pending, completed, failed
    metadata: Object
  }],

  // Sync timestamps
  lastDepositSync: Date,
  lastWithdrawalSync: Date,
  lastTransferSync: Date,
  lastBalanceSync: Date,

  // Sync status
  syncStatus: {
    balance: String,             // success, failed, never
    deposits: String,
    withdrawals: String,
    transfers: String
  },

  // Statistics
  stats: {
    totalDeposits: Number,
    totalWithdrawals: Number,
    totalTransfers: Number,
    totalDepositAmount: Number,
    totalWithdrawalAmount: Number,
    netDeposits: Number
  }
}
```

---

## API Endpoints

### 1. GET `/api/v1/hyperliquid-balance`

Preia balanța utilizatorului (Spot + Perp).

**Query Parameters:**
- `userId` (required): User ID
- `walletAddress` (required): Hyperliquid wallet address
- `apiKeyId` (optional): Specific API key ID

**Example:**

```bash
GET /api/v1/hyperliquid-balance?userId=123&walletAddress=0xabc...
```

**Response:**

```json
{
  "success": true,
  "data": {
    "spot": {
      "assets": [
        {
          "coin": "USDC",
          "total": 1000.50,
          "hold": 100.00,
          "available": 900.50,
          "usdValue": 1000.50
        }
      ],
      "totalUsdValue": 1000.50
    },
    "perp": {
      "marginSummary": {
        "accountValue": 5000.00,
        "totalNtlPos": 2000.00,
        "totalMarginUsed": 500.00,
        "withdrawable": 4500.00
      },
      "assetPositions": [...]
    },
    "totalAccountValue": 6000.50,
    "lastSync": "2025-10-23T20:00:00.000Z",
    "isStale": false,
    "syncStatus": "success",
    "stats": {
      "totalDeposits": 10,
      "totalWithdrawals": 5,
      "netDeposits": 5000.00
    }
  },
  "warning": null
}
```

---

### 2. GET `/api/v1/hyperliquid-deposits`

Preia istoricul depunerilor.

**Query Parameters:**
- `userId` (required): User ID
- `walletAddress` (required): Hyperliquid wallet address
- `limit` (optional): Number of deposits (default: 100)
- `coin` (optional): Filter by coin (e.g., "USDC")

**Example:**

```bash
GET /api/v1/hyperliquid-deposits?userId=123&walletAddress=0xabc...&limit=50&coin=USDC
```

**Response:**

```json
{
  "success": true,
  "data": {
    "deposits": [
      {
        "transactionHash": "0x123...",
        "time": "2025-10-23T19:00:00.000Z",
        "coin": "USDC",
        "amount": 1000.00,
        "usdValue": 1000.00,
        "status": "confirmed",
        "confirmations": 12,
        "fromAddress": "0xdef...",
        "toAddress": "0xabc...",
        "fee": 0.50
      }
    ],
    "count": 10,
    "displayedCount": 10,
    "totalAmount": 10000.00,
    "totalUsdValue": 10000.00,
    "lastSync": "2025-10-23T20:00:00.000Z",
    "isStale": false,
    "syncStatus": "success",
    "filter": { "coin": "USDC" }
  }
}
```

---

### 3. GET `/api/v1/hyperliquid-withdrawals`

Preia istoricul retragerilor.

**Query Parameters:**
- `userId` (required): User ID
- `walletAddress` (required): Hyperliquid wallet address
- `limit` (optional): Number of withdrawals (default: 100)
- `coin` (optional): Filter by coin
- `status` (optional): Filter by status (pending, processing, completed, failed, cancelled)

**Example:**

```bash
GET /api/v1/hyperliquid-withdrawals?userId=123&walletAddress=0xabc...&status=completed
```

**Response:**

```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "transactionHash": "0x456...",
        "time": "2025-10-23T18:00:00.000Z",
        "coin": "USDC",
        "amount": 500.00,
        "usdValue": 500.00,
        "status": "completed",
        "fromAddress": "0xabc...",
        "toAddress": "0xghi...",
        "fee": 1.00,
        "nonce": 42
      }
    ],
    "count": 5,
    "displayedCount": 5,
    "totalAmount": 2500.00,
    "totalUsdValue": 2500.00,
    "totalFees": 5.00,
    "statusBreakdown": {
      "pending": 0,
      "processing": 0,
      "completed": 5,
      "failed": 0,
      "cancelled": 0
    },
    "lastSync": "2025-10-23T20:00:00.000Z",
    "isStale": false,
    "syncStatus": "success"
  }
}
```

---

### 4. GET `/api/v1/hyperliquid-transfers`

Preia istoricul transferurilor interne (Spot ↔ Perp).

**Query Parameters:**
- `userId` (required): User ID
- `walletAddress` (required): Hyperliquid wallet address
- `limit` (optional): Number of transfers (default: 100)
- `coin` (optional): Filter by coin
- `direction` (optional): Filter by direction (spot-to-perp, perp-to-spot)

**Example:**

```bash
GET /api/v1/hyperliquid-transfers?userId=123&walletAddress=0xabc...&direction=spot-to-perp
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "time": "2025-10-23T17:00:00.000Z",
        "coin": "USDC",
        "amount": 1000.00,
        "usdValue": 1000.00,
        "fromAccount": "spot",
        "toAccount": "perp",
        "transactionHash": "0x789...",
        "status": "completed"
      }
    ],
    "count": 15,
    "displayedCount": 15,
    "totalAmount": 15000.00,
    "totalUsdValue": 15000.00,
    "directionBreakdown": {
      "spotToPerp": {
        "count": 10,
        "totalAmount": 10000.00
      },
      "perpToSpot": {
        "count": 5,
        "totalAmount": 5000.00
      }
    },
    "statusBreakdown": {
      "completed": 15,
      "pending": 0,
      "failed": 0
    },
    "lastSync": "2025-10-23T20:00:00.000Z",
    "isStale": false,
    "syncStatus": "success"
  }
}
```

---

### 5. POST `/api/v1/sync-hyperliquid-account`

Sincronizează datele contului din Hyperliquid API.

**Body Parameters:**
- `userId` (required): User ID
- `walletAddress` (required): Hyperliquid wallet address
- `apiKeyId` (required): API Key ID
- `apiKey` (optional): Hyperliquid API key
- `apiSecret` (optional): Hyperliquid API secret
- `syncTypes` (optional): Array ['balance', 'deposits', 'withdrawals', 'transfers'] (default: all)

**Example:**

```bash
POST /api/v1/sync-hyperliquid-account

{
  "userId": "123",
  "walletAddress": "0xabc...",
  "apiKeyId": "60d5ec49f1b2c8b1f8c4e5a6",
  "syncTypes": ["balance", "deposits"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account data synced successfully",
  "data": {
    "balance": {
      "success": true,
      "error": null
    },
    "deposits": {
      "success": true,
      "count": 10,
      "error": null
    },
    "withdrawals": {
      "success": true,
      "count": 5,
      "error": null
    },
    "transfers": {
      "success": true,
      "count": 15,
      "error": null
    },
    "syncTime": "2025-10-23T20:00:00.000Z"
  }
}
```

---

## Usage Examples

### Frontend (Vue/Nuxt)

```vue
<script setup>
import { ref, onMounted } from 'vue';

const userId = ref('123');
const walletAddress = ref('0xabc...');
const balance = ref(null);
const deposits = ref([]);
const withdrawals = ref([]);
const transfers = ref([]);

// Fetch balance
async function fetchBalance() {
  const response = await fetch(`/api/v1/hyperliquid-balance?userId=${userId.value}&walletAddress=${walletAddress.value}`);
  const result = await response.json();
  if (result.success) {
    balance.value = result.data;
  }
}

// Fetch deposits
async function fetchDeposits() {
  const response = await fetch(`/api/v1/hyperliquid-deposits?userId=${userId.value}&walletAddress=${walletAddress.value}&limit=50`);
  const result = await response.json();
  if (result.success) {
    deposits.value = result.data.deposits;
  }
}

// Sync account data
async function syncAccount() {
  const response = await fetch('/api/v1/sync-hyperliquid-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId.value,
      walletAddress: walletAddress.value,
      apiKeyId: '60d5ec49f1b2c8b1f8c4e5a6',
      syncTypes: ['balance', 'deposits', 'withdrawals', 'transfers']
    })
  });

  const result = await response.json();
  if (result.success) {
    console.log('Account synced!');
    await fetchBalance();
    await fetchDeposits();
  }
}

onMounted(() => {
  fetchBalance();
  fetchDeposits();
});
</script>

<template>
  <div>
    <h2>Hyperliquid Account</h2>
    <button @click="syncAccount">Sync Account Data</button>

    <div v-if="balance">
      <h3>💰 Balance</h3>
      <p>Total Account Value: ${{ balance.totalAccountValue }}</p>
      <p>Spot: ${{ balance.spot.totalUsdValue }}</p>
      <p>Perp: ${{ balance.perp.marginSummary?.accountValue }}</p>
    </div>

    <div>
      <h3>📥 Recent Deposits</h3>
      <ul>
        <li v-for="deposit in deposits" :key="deposit.transactionHash">
          {{ deposit.coin }}: {{ deposit.amount }} - {{ deposit.time }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

---

## Multi-User Support

Fiecare utilizator poate avea multiple API keys (Alex, Miruna, Adi etc.):

```javascript
// User Alex
const alexAccount = {
  userId: 'alex-id',
  walletAddress: '0xalex...',
  apiKeyId: 'alex-key-id'
};

// User Miruna
const mirunaAccount = {
  userId: 'miruna-id',
  walletAddress: '0xmiruna...',
  apiKeyId: 'miruna-key-id'
};

// Fetch balance for each user
const alexBalance = await fetch(`/api/v1/hyperliquid-balance?userId=${alexAccount.userId}&walletAddress=${alexAccount.walletAddress}`);
const mirunaBalance = await fetch(`/api/v1/hyperliquid-balance?userId=${mirunaAccount.userId}&walletAddress=${mirunaAccount.walletAddress}`);
```

---

## MongoDB Queries

### Get user account
```javascript
db.hyperliquid_user_accounts.findOne({
  userId: '123',
  walletAddress: '0xabc...'
})
```

### Get all deposits for user
```javascript
db.hyperliquid_user_accounts.findOne(
  { userId: '123', walletAddress: '0xabc...' },
  { deposits: 1, lastDepositSync: 1 }
)
```

### Count total withdrawals
```javascript
db.hyperliquid_user_accounts.aggregate([
  { $match: { userId: '123' } },
  { $project: { withdrawalCount: { $size: '$withdrawals' } } }
])
```

---

## Benefits

✅ **Per-User Data** - Separate data for each user and API key
✅ **Cached Access** - Fast retrieval from MongoDB
✅ **Comprehensive History** - Full deposit, withdrawal, and transfer records
✅ **Real-time Balance** - Spot and Perp balances with margin details
✅ **Filtering Support** - Filter by coin, status, direction, etc.
✅ **Staleness Detection** - Alerts when data needs refreshing
✅ **Statistics** - Automatic calculation of totals and summaries
✅ **Multi-API Key** - Support for multiple API keys per user

---

## Files Structure

```
server/
  models/
    hyperliquidUserAccount.schema.js           # MongoDB schema
  api/v1/
    hyperliquid-balance.get.js                 # GET balance
    hyperliquid-deposits.get.js                # GET deposits
    hyperliquid-withdrawals.get.js             # GET withdrawals
    hyperliquid-transfers.get.js               # GET transfers
    sync-hyperliquid-account.post.js           # POST sync account

HYPERLIQUID_USER_ACCOUNT_README.md             # This documentation
```

---

## License

Internal use only - Crypto Trading Bot Application
