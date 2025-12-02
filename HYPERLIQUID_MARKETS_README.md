# Hyperliquid Markets Ecosystem - Documentation

## Overview

Sistem complet de caching pentru markets-urile Hyperliquid (SPOT și PERP) care elimină necesitatea de a face fetch repetat către API-ul public. Datele sunt stocate în MongoDB și actualizate automat la fiecare oră.

## Current Statistics

- **SPOT Markets**: 385 (incluzând USDC pairs)
- **PERP Markets**: 218 (perpetual futures)
- **Total Markets**: 603
- **Update Frequency**: La fiecare oră (configurabil)

---

## Database Schema

### Collection: `hyperliquid_ecosystem`

```javascript
{
  marketType: 'spot' | 'perp',           // Tipul de market
  markets: [                              // Array de markets
    {
      symbol: 'BTC/USDC',                 // Simbolul market-ului
      baseAsset: 'BTC',                   // Asset-ul de bază
      quoteAsset: 'USDC',                 // Asset-ul quote
      status: 'active',                   // Status: active/inactive/paused
      pricePrecision: 8,                  // Precizie preț
      quantityPrecision: 8,               // Precizie cantitate
      minOrderSize: 0.001,                // Mărimea minimă order
      maxOrderSize: 1000,                 // Mărimea maximă order
      tickSize: 0.01,                     // Incrementul minim de preț
      stepSize: 0.001,                    // Incrementul minim de cantitate
      metadata: { ... }                   // Date suplimentare din API
    }
  ],
  totalMarkets: 385,                      // Total markets în array
  lastSync: Date,                         // Ultima sincronizare
  syncStatus: 'success' | 'failed',       // Status sincronizare
  syncError: null,                        // Mesaj eroare (dacă există)
  source: 'Hyperliquid Public API',
  version: '1.0.0'
}
```

---

## API Endpoints

### 1. GET `/api/v1/hyperliquid-markets`

Preia markets din database (cached).

**Query Parameters:**
- `type` (optional): `'spot'` | `'perp'` | `'all'` (default: `'all'`)
- `search` (optional): Term de căutare pentru filtrare
- `activeOnly` (optional): `true` | `false` (default: `true`)

**Examples:**

```bash
# Toate markets (SPOT + PERP)
GET /api/v1/hyperliquid-markets

# Doar SPOT markets
GET /api/v1/hyperliquid-markets?type=spot

# Doar PERP markets
GET /api/v1/hyperliquid-markets?type=perp

# Caută markets care conțin "BTC"
GET /api/v1/hyperliquid-markets?search=BTC

# Caută doar în SPOT markets
GET /api/v1/hyperliquid-markets?type=spot&search=ETH
```

**Response:**

```json
{
  "success": true,
  "data": {
    "spot": [...],
    "perp": [...],
    "spotCount": 385,
    "perpCount": 218,
    "totalCount": 603,
    "lastSync": {
      "spot": "2025-10-23T19:30:00.000Z",
      "perp": "2025-10-23T19:30:00.000Z"
    }
  },
  "warning": null
}
```

### 2. POST `/api/v1/sync-hyperliquid-markets`

Trigger manual pentru sincronizare markets.

**Example:**

```bash
POST /api/v1/sync-hyperliquid-markets
```

**Response:**

```json
{
  "success": true,
  "message": "Markets synced successfully",
  "data": {
    "spot": {
      "success": true,
      "count": 385,
      "error": null
    },
    "perp": {
      "success": true,
      "count": 218,
      "error": null
    },
    "totalCount": 603,
    "syncTime": "2025-10-23T19:30:00.000Z"
  }
}
```

---

## Sincronizare Automată

### Server Plugin (Auto-Sync la fiecare oră)

**File:** `server/plugins/hyperliquid-sync-scheduler.js`

**Status:** DISABLED by default (pentru a evita API flooding)

**Pentru a activa:**
1. Deschide `server/plugins/hyperliquid-sync-scheduler.js`
2. Modifică `isEnabled = false` în `isEnabled = true`
3. Restart server

**Comportament:**
- Sincronizare inițială după 10 secunde de la pornirea serverului
- Sincronizare automată la fiecare oră (3600000ms)
- Logging complet în consolă

---

## Manual Sync Script

### Rulare script standalone

**File:** `scripts/sync-hyperliquid-markets.js`

**Rulare:**

```bash
cd "crypto-app-github v2.2 - updated COINBASE"
node scripts/sync-hyperliquid-markets.js
```

**Output:**

```
🚀 Starting Hyperliquid Markets Sync...
📡 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Fetching SPOT markets from Hyperliquid API...
✅ SPOT markets synced: 385

📊 Fetching PERP markets from Hyperliquid API...
✅ PERP markets synced: 218

📈 SYNC SUMMARY:
   SPOT: ✅ 385 markets
   PERP: ✅ 218 markets
   TOTAL: 603 markets

🔌 Disconnected from MongoDB
```

---

## Usage Examples

### Frontend (Vue/Nuxt)

```vue
<script setup>
import { ref, onMounted } from 'vue';

const markets = ref({ spot: [], perp: [] });
const loading = ref(true);

async function fetchMarkets() {
  try {
    const response = await fetch('/api/v1/hyperliquid-markets');
    const result = await response.json();

    if (result.success) {
      markets.value = result.data;
      console.log(`Loaded ${result.data.totalCount} markets`);
    }
  } catch (error) {
    console.error('Error fetching markets:', error);
  } finally {
    loading.value = false;
  }
}

// Sincronizare manuală
async function syncMarkets() {
  try {
    const response = await fetch('/api/v1/sync-hyperliquid-markets', {
      method: 'POST'
    });
    const result = await response.json();

    if (result.success) {
      console.log('Markets synced successfully!');
      await fetchMarkets(); // Reload markets
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

onMounted(() => {
  fetchMarkets();
});
</script>

<template>
  <div>
    <h2>Hyperliquid Markets</h2>
    <button @click="syncMarkets">Sync Markets</button>

    <div v-if="!loading">
      <h3>SPOT Markets ({{ markets.spotCount }})</h3>
      <ul>
        <li v-for="market in markets.spot" :key="market.symbol">
          {{ market.symbol }}
        </li>
      </ul>

      <h3>PERP Markets ({{ markets.perpCount }})</h3>
      <ul>
        <li v-for="market in markets.perp" :key="market.symbol">
          {{ market.symbol }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

---

## MongoDB Queries

### Query direct în MongoDB

```javascript
// Toate SPOT markets
db.hyperliquid_ecosystem.findOne({ marketType: 'spot' })

// Toate PERP markets
db.hyperliquid_ecosystem.findOne({ marketType: 'perp' })

// Căutare market specific
db.hyperliquid_ecosystem.aggregate([
  { $match: { marketType: 'spot' } },
  { $unwind: '$markets' },
  { $match: { 'markets.symbol': /BTC/ } }
])

// Count total markets
db.hyperliquid_ecosystem.aggregate([
  { $group: { _id: null, total: { $sum: '$totalMarkets' } } }
])
```

---

## Maintenance

### Verificare status sincronizare

```bash
# Check în MongoDB
db.hyperliquid_ecosystem.find({}, {
  marketType: 1,
  totalMarkets: 1,
  lastSync: 1,
  syncStatus: 1
})
```

### Force re-sync

```bash
# Opțiune 1: Via API
curl -X POST http://localhost:3000/api/v1/sync-hyperliquid-markets

# Opțiune 2: Via script
node scripts/sync-hyperliquid-markets.js
```

### Ștergere date vechi

```javascript
// Șterge toate înregistrările
db.hyperliquid_ecosystem.deleteMany({})

// Șterge doar SPOT sau PERP
db.hyperliquid_ecosystem.deleteOne({ marketType: 'spot' })
db.hyperliquid_ecosystem.deleteOne({ marketType: 'perp' })
```

---

## Benefits

✅ **Reduce API Calls** - Nu mai faci fetch repetat către Hyperliquid API
✅ **Faster Loading** - Markets sunt cached în MongoDB (local)
✅ **Auto-Update** - Sincronizare automată la fiecare oră
✅ **Search Support** - Căutare rapidă prin toate markets
✅ **Type Filtering** - Filtrare ușoară între SPOT și PERP
✅ **Status Tracking** - Monitorizare status sincronizare
✅ **Error Handling** - Gestionare erori cu logging complet

---

## Troubleshooting

### Markets nu se actualizează

1. Verifică dacă auto-sync este activat în `server/plugins/hyperliquid-sync-scheduler.js`
2. Rulează sync manual: `POST /api/v1/sync-hyperliquid-markets`
3. Verifică logs-urile server-ului pentru erori

### Eroare la sincronizare

1. Verifică conexiunea la MongoDB
2. Verifică dacă API-ul Hyperliquid este disponibil
3. Verifică logs pentru detalii: `syncStatus: 'failed'` și `syncError`

### Date vechi (stale)

Markets mai vechi de 1 oră sunt marcate ca "stale" în răspunsul API.
Rulează sync manual sau activează auto-sync.

---

## Files Structure

```
server/
  models/
    hyperliquidEcosystem.schema.js      # MongoDB schema
  api/v1/
    hyperliquid-markets.get.js          # GET endpoint pentru markets
    sync-hyperliquid-markets.post.js    # POST endpoint pentru sync
  plugins/
    hyperliquid-sync-scheduler.js       # Auto-sync plugin (hourly)

scripts/
  sync-hyperliquid-markets.js           # Standalone sync script

HYPERLIQUID_MARKETS_README.md           # Această documentație
```

---

## License

Internal use only - Crypto Trading Bot Application
