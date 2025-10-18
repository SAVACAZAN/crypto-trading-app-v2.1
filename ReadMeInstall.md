# Installation Guide - LCX & Coinbase Advanced Setup

This guide explains how to set up the custom CCXT modules for LCX and Coinbase Advanced exchanges.

## Table of Contents

- [Prerequisites](#prerequisites)
- [LCX Module Installation](#lcx-module-installation)
- [Coinbase Advanced Configuration](#coinbase-advanced-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- Node.js 16+ installed
- MongoDB installed and running
- Git installed
- Project cloned from GitHub

---

## Project Installation

1. **Clone the repository:**
```bash
git clone https://github.com/SAVACAZAN/crypto-trading-app-v2.1.git
cd crypto-trading-app-v2.1
```

2. **Install dependencies:**
```bash
npm install
```

This will install all required packages including CCXT v4.5.11.

---

## LCX Module Installation

LCX exchange requires a custom CCXT module because it's not officially supported in the standard CCXT library. The custom module is already included in the `lcx/` directory.

### Directory Structure

```
lcx/
└── lcx/
    ├── ccxt.d.ts          # TypeScript definitions
    ├── ccxt.js            # Main CCXT export
    └── src/
        ├── abstract/
        │   ├── lcx.d.ts   # Abstract LCX class definitions
        │   └── lcx.js     # Abstract LCX class implementation
        ├── lcx.d.ts       # LCX exchange definitions
        └── lcx.js         # LCX exchange implementation
```

### Installation Steps

**Option 1: Automatic Copy (Windows)**

```powershell
# PowerShell - Run after npm install
Copy-Item -Path "lcx\lcx\src\lcx.d.ts" -Destination "node_modules\ccxt\js\src\lcx.d.ts" -Force
Copy-Item -Path "lcx\lcx\src\lcx.js" -Destination "node_modules\ccxt\js\src\lcx.js" -Force
Copy-Item -Path "lcx\lcx\src\abstract\lcx.js" -Destination "node_modules\ccxt\js\src\abstract\lcx.js" -Force
Copy-Item -Path "lcx\lcx\src\abstract\lcx.d.ts" -Destination "node_modules\ccxt\js\src\abstract\lcx.d.ts" -Force
```

**Option 2: Automatic Copy (Linux/Mac)**

```bash
cp lcx/lcx/src/lcx.d.ts node_modules/ccxt/js/src/lcx.d.ts
cp lcx/lcx/src/lcx.js node_modules/ccxt/js/src/lcx.js
cp lcx/lcx/src/abstract/lcx.js node_modules/ccxt/js/src/abstract/lcx.js
cp lcx/lcx/src/abstract/lcx.d.ts node_modules/ccxt/js/src/abstract/lcx.d.ts
```

### How LCX Module Works

The custom LCX module is loaded in `server/plugins/ccxtw.js`:

```javascript
// Import custom LCX exchange class
import LCXExchange from '~/lcx/lcx/src/lcx.js';

async loadInstance(userID, exchange, apiKeyName = null) {
    const apiKeys = await this.getApiKeys(userID, exchange, apiKeyName);

    let instance;
    if (exchange === 'lcx') {
        // Use custom LCX implementation
        instance = new LCXExchange(apiKeys);
    } else if (exchange === 'coinbaseadvanced') {
        // Use CCXT with v3 API configuration
        instance = new ccxt[exchange]({
            ...apiKeys,
            options: {
                fetchBalance: 'v3PrivateGetBrokerageAccounts'
            }
        });
    } else {
        // Standard CCXT exchange
        instance = new ccxt[exchange](apiKeys);
    }

    await instance.loadMarkets();
    return instance;
}
```

---

## Coinbase Advanced Configuration

Coinbase Advanced Trade uses the standard CCXT library but requires special configuration to use the v3 API endpoints.

### Why v3 API?

The Coinbase v3 API (`/brokerage/accounts`) properly returns:
- `available_balance` (free funds)
- `hold` (funds held in orders)

The older v2 Consumer API doesn't report held balances correctly, causing balance discrepancies.

### Configuration

The configuration is automatically applied in `server/plugins/ccxtw.js`:

```javascript
if (exchange === 'coinbaseadvanced') {
    instance = new ccxt[exchange]({
        ...apiKeys,
        options: {
            fetchBalance: 'v3PrivateGetBrokerageAccounts'
        }
    });
}
```

### API Key Setup

To get Coinbase Advanced Trade API keys:

1. Go to https://www.coinbase.com/settings/api
2. Click "New API Key"
3. Select "Trade" permissions
4. Copy:
   - API Key
   - API Secret

Store them in the database via the Profile page:
- Exchange: `coinbaseadvanced`
- API Key Name: `Main Account` (or any name)
- Credentials:
  - `apiKey`: Your API key
  - `secret`: Your API secret

---

## Verification

After installation, verify everything works:

### 1. Check LCX Module

```bash
# Verify files were copied
ls -la node_modules/ccxt/js/src/lcx.js
ls -la node_modules/ccxt/js/src/abstract/lcx.js
```

### 2. Start Application

```bash
npm run dev
```

Navigate to http://localhost:3000/profile and add your exchange API keys.

Check http://localhost:3000/dashboard to see balances.

---

## Troubleshooting

### LCX Module Not Found

**Error:** `Cannot find module 'lcx'`

**Solution:** Re-copy the LCX files using the commands above.

### Coinbase Balance Shows Zero "Used"

**Error:** Used/held balances show as 0.00 even with open orders

**Solution:** Ensure the v3 API configuration is applied in `server/plugins/ccxtw.js`.

### API Key Errors

**Error:** `Authentication failed` or `Invalid API key`

**Solutions:**
1. Verify API keys are correct (no extra spaces)
2. Check API key permissions (need "Trade" for Coinbase)
3. For LCX, ensure you're using the correct environment
4. Re-generate API keys if necessary

---

## Production Deployment

When deploying to production:

1. Include LCX files in your deployment package
2. Run copy commands after `npm install`
3. Use environment variables for API keys
4. Ensure MongoDB is secured

---

**Last Updated:** October 2025  
**CCXT Version:** 4.5.11  
**Node Version:** 16+
