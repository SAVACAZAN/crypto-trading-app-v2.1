# FULL HISTORICAL SYNC - Closed Orders

## Prezentare Generală

Sistemul de sincronizare a closed orders funcționează în **2 FAZE**:

### FAZA 1: FULL HISTORICAL SYNC (Prima Rulare)
- **Când se activează**: Automat la prima rulare (când `totalOrdersSynced === 0`)
- **Ce face**: Fetch-uiește **TOATE** orders-urile disponibile din ultimele 3 luni (Coinbase default)
- **Limită**: **UNLIMITED** (nu se oprește la 1000, continuă până când nu mai sunt orders)
- **Durată**: Poate dura câteva minute (depinde de câte orders ai - poate 10,000, 50,000, 100,000+)
- **Rate Limiting**: **DEZACTIVAT** pentru această fază (sync imediat, fără așteptare)

### FAZA 2: INCREMENTAL SYNC (Ongoing Maintenance)
- **Când se activează**: După ce FULL HISTORICAL SYNC s-a completat (când `totalOrdersSynced > 0`)
- **Ce face**: Fetch-uiește doar **ultimele 1000 orders** pentru actualizări
- **Limită**: **1000 orders** (suficient pentru updates zilnice)
- **Durată**: ~2-3 secunde (10 requests × 100 orders)
- **Rate Limiting**: **ACTIVAT** (5 minute între sync-uri pentru Coinbase)

## Cum Funcționează

### Detecție Automată
```javascript
// FULL HISTORICAL SYNC
const isFullHistoricalSync = !syncState || (syncState.totalOrdersSynced || 0) === 0;

if (isFullHistoricalSync) {
  targetLimit = null; // UNLIMITED
  lastTimestamp = null; // Toate orders-urile din ultimele 3 luni
  // No rate limiting
}

// INCREMENTAL SYNC
else {
  targetLimit = 1000; // Doar ultimele 1000
  lastTimestamp = lastSyncTimestamp; // Doar orders-uri noi
  // Rate limiting: 5 min între sync-uri
}
```

### Pagination Unlimited
```javascript
// Pentru FULL HISTORICAL SYNC
const isUnlimited = targetLimit === null;
const maxRequests = isUnlimited ? 10000 : Math.ceil(targetLimit / perPageLimit);

// Loop continuă până când:
// 1. Nu mai sunt orders disponibile (cursor === null)
// 2. Sau am atins maxRequests (10,000 = ~1 million orders)
```

## Cum Să Rulezi FULL HISTORICAL SYNC

### Opțiunea 1: Reset Manual (Recomandat)
```bash
cd "crypto-app-github v2.2 - updated COINBASE"
node triggerFullHistoricalSync.js
```

Acest script:
1. ✅ Șterge toate closed orders din DB
2. ✅ Șterge toate sync states pentru closed orders
3. ✅ Next scheduler run va detecta automat că trebuie să facă FULL HISTORICAL SYNC

### Opțiunea 2: Delete Manual din MongoDB
```javascript
// În MongoDB shell sau Compass:
db.closedorderhistories.deleteMany({})
db.syncstates.deleteMany({ syncType: 'closed_orders' })
```

## Logs de Monitorizare

### FULL HISTORICAL SYNC Logs
```
[SYNC-SERVICE] 🚀 FULL HISTORICAL SYNC for coinbaseadvanced - Alex: fetching ALL orders from last 3 months
[SYNC-SERVICE] 🔄 Starting UNLIMITED Coinbase pagination (fetching ALL historical orders)
[SYNC-SERVICE] 📄 Page 1: fetched 100 orders (total: 100)
[SYNC-SERVICE] 📄 Page 2: fetched 100 orders (total: 200)
...
[SYNC-SERVICE] 📄 Page 547: fetched 100 orders (total: 54,700)
[SYNC-SERVICE] 📄 Page 548: fetched 23 orders (total: 54,723)
[SYNC-SERVICE] 🛑 Got 23 < 100, no more pages
[SYNC-SERVICE] ✅ Coinbase pagination complete: 54,723 total orders in 548 requests
[SYNC-SERVICE] ✅ Inserted 54,723 new orders, skipped 0 duplicates
```

### INCREMENTAL SYNC Logs
```
[SYNC-SERVICE] 🔄 INCREMENTAL SYNC for coinbaseadvanced - Alex: fetching latest 1000 orders for updates
[SYNC-SERVICE] 🔄 Starting Coinbase pagination (target: 1000 orders, max 10 requests)
[SYNC-SERVICE] 📄 Page 1: fetched 100 orders (total: 100)
...
[SYNC-SERVICE] 📄 Page 10: fetched 100 orders (total: 1000)
[SYNC-SERVICE] ✅ Coinbase pagination complete: 1000 total orders in 10 requests
[SYNC-SERVICE] ✅ Inserted 15 new orders, skipped 985 duplicates
```

## Configurare

### Config Files
`server/services/ClosedOrdersSyncService.js`

```javascript
// Rate Limiting (INCREMENTAL SYNC only)
this.rateLimitConfig = {
  'coinbaseadvanced': 300000, // 5 minute între sync-uri
}

// INCREMENTAL SYNC Limits
this.fetchLimitConfig = {
  'coinbaseadvanced': 1000, // 1000 orders per sync
}

// FULL HISTORICAL SYNC (unlimited)
this.historicalSyncConfig = {
  'coinbaseadvanced': null, // null = unlimited
}
```

## Performance

### FULL HISTORICAL SYNC
- **100,000 orders** = ~1000 requests × 200ms delay = ~3-4 minute
- **50,000 orders** = ~500 requests × 200ms delay = ~2 minute
- **10,000 orders** = ~100 requests × 200ms delay = ~20 secunde

### INCREMENTAL SYNC
- **1000 orders** = 10 requests × 200ms delay = ~2-3 secunde
- Rulează automat la fiecare **5 minute** (rate limiting)

## Avantaje

✅ **Fetch toate orders-urile istorice** din ultimele 3 luni (50,000 - 100,000+ orders)
✅ **Salvează totul în DB** o singură dată (FULL HISTORICAL SYNC)
✅ **Updates rapide** după (doar 1000 orders pentru incremental sync)
✅ **Rate limiting inteligent** (disabled pentru full sync, enabled pentru incremental)
✅ **Duplicate detection** (skip orders care există deja)
✅ **Automatic mode detection** (full vs incremental)

## Troubleshooting

### Problemă: Sync se oprește după 1000 orders
**Soluție**: Verifică că `totalOrdersSynced === 0` în `syncstates` collection
```javascript
db.syncstates.find({ syncType: 'closed_orders' })
```

### Problemă: Rate limiting prea agresiv
**Soluție**: Pentru FULL HISTORICAL SYNC, rate limiting este automat dezactivat. Verifică logs pentru:
```
[SYNC-SERVICE] 🚀 FULL HISTORICAL SYNC mode: allowing immediate sync
```

### Problemă: Vrei să re-rulezi FULL HISTORICAL SYNC
**Soluție**: Rulează script-ul de reset
```bash
node triggerFullHistoricalSync.js
```

## Database Schema

### closedorderhistories
```javascript
{
  userID: String,
  exchange: String,
  apiKeyName: String,
  orderId: String,
  symbol: String,
  side: String, // buy/sell
  type: String, // market/limit
  price: Number,
  amount: Number,
  cost: Number,
  fee: { cost: Number, currency: String },
  datetime: Date,
  timestamp: Number,
  status: String,
  syncedAt: Date,
  lastUpdated: Date
}
```

### syncstates
```javascript
{
  userID: String,
  exchange: String,
  apiKeyName: String,
  syncType: String, // 'closed_orders'
  totalOrdersSynced: Number, // 0 = trigger FULL HISTORICAL SYNC
  lastSyncTimestamp: Number,
  lastSyncDate: Date,
  nextSyncAllowed: Date,
  consecutiveEmptyFetches: Number
}
```

## Coinbase API Limits

- **Max orders per request**: 100
- **Default time range**: Ultimele 3 luni (Coinbase default)
- **Cursor-based pagination**: Da
- **Rate limit**: ~30 requests/sec (cu delay de 200ms = 5 req/sec, safe)

## Testare

```bash
# 1. Reset database
node triggerFullHistoricalSync.js

# 2. Verifică că sync states au fost șterse
node checkSyncStates.js

# 3. Monitorizează logs pentru FULL HISTORICAL SYNC
# Caută în logs:
[SYNC-SERVICE] 🚀 FULL HISTORICAL SYNC for coinbaseadvanced

# 4. După completare, verifică numărul de orders
node checkSyncStates.js
# Ar trebui să vezi: totalOrdersSynced: 50000+ (depinde de history)

# 5. Next sync ar trebui să fie INCREMENTAL
# Caută în logs:
[SYNC-SERVICE] 🔄 INCREMENTAL SYNC for coinbaseadvanced
```
