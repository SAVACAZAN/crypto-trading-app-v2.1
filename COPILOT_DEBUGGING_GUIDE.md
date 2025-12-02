# 🐛 Co-Pilot Debugging Guide

## 🎯 Problema Rezolvată

**Eroare inițială:**
```
Failed to load resource: 500 (Cannot read properties of undefined (reading 'findOne'))
```

**Cauză:**
- Import greșit: `getUserApiKeysSchema` nu există în `user.schema.js`
- Schema corectă este `userExchangesSchema` din `userExchanges.schema.js`

## ✅ Soluția Implementată

### 1. **Import Corect**
```javascript
// ❌ GREȘIT (înainte)
const { getUserApiKeysSchema } = await import('~/server/models/user.schema');
const userApiKeys = await getUserApiKeysSchema.findOne({ userID });

// ✅ CORECT (acum)
import { userExchangesSchema } from '~/server/models/userExchanges.schema';
const userExchanges = await userExchangesSchema.find({ userID });
```

### 2. **Structură Corectă Date**

**userExchangesSchema structure:**
```javascript
{
  userID: "66e5d23b4844420459b54ee9",
  exchange: "lcx",  // sau "coinbase", "kraken", etc.
  apiKeys: [
    {
      name: "default",
      apiKey: "...",
      secret: "...",
      isActive: true
    },
    {
      name: "trading1",
      apiKey: "...",
      secret: "...",
      isActive: true
    }
  ]
}
```

### 3. **Loop prin Exchanges și API Keys**

```javascript
// Loop prin toate exchanges-urile user-ului
for (const userExchange of userExchanges) {
    const apiKeys = userExchange.apiKeys || [];

    // Loop prin toate API keys din acest exchange
    for (const apiKey of apiKeys) {
        if (apiKey.isActive === false) continue;

        const keyName = apiKey.name || 'default';
        const ordersResponse = await nitroApp.ccxtw.fetchOpenOrders(
            userID,
            userExchange.exchange,  // ← exchange din userExchange
            null,
            keyName
        );
    }
}
```

## 📊 Console Logs Adăugate

Endpoint-ul acum afișează logs detaliate pentru debugging:

```javascript
📊 [FetchCoPilotOrders] Fetching orders for user: 66e5d23b4844420459b54ee9
🔧 [FetchCoPilotOrders] nitroApp.ccxtw available: true
🔍 [FetchCoPilotOrders] Found 2 exchanges for user
📦 [FetchCoPilotOrders] Exchange lcx: 3 API keys
🔍 [FetchCoPilotOrders] Fetching orders from lcx (default)
✅ [FetchCoPilotOrders] Found 5 orders from lcx (default)
🔍 [FetchCoPilotOrders] Fetching orders from lcx (trading1)
✅ [FetchCoPilotOrders] Found 3 orders from lcx (trading1)
📦 [FetchCoPilotOrders] Exchange coinbase: 1 API keys
🔍 [FetchCoPilotOrders] Fetching orders from coinbase (default)
✅ [FetchCoPilotOrders] Found 2 orders from coinbase (default)
📋 [FetchCoPilotOrders] Found 0 automation rules
✅ [FetchCoPilotOrders] Total orders fetched: 10
📊 [FetchCoPilotOrders] Stats: 0 rules, 4 API keys scanned, 0 errors
```

## 🧪 Cum să Testezi

### 1. **Browser Console**
Deschide DevTools (F12) → Console tab → refresh pagina

Ar trebui să vezi:
```javascript
🔄 [CO-PILOT] Fetching orders from new endpoint...
📊 [CO-PILOT] Response: { success: true, data: [...], stats: {...} }
✅ Loaded 10 orders with 0 rules (4 API keys scanned)
✅ [CO-PILOT] Auto-refresh enabled (30s interval)
```

### 2. **Server Console** (Terminal Nuxt)
În terminalul unde rulează `npm run dev`:

Ar trebui să vezi logs de mai sus (📊, 🔧, 🔍, etc.)

### 3. **Network Tab**
DevTools → Network → filter "fetchCoPilotOrders"

Status: `200 OK`
Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "order123",
      "symbol": "BTC/USDT",
      "rulesCount": 0,
      "hasActiveRules": false,
      "fillPercent": "45.50",
      "totalValue": "1234.56"
    }
  ],
  "stats": {
    "totalOrders": 10,
    "totalRules": 0,
    "apiKeysScanned": 4
  }
}
```

## ❌ Possible Errors & Solutions

### Error 1: "No exchanges configured"
**Cauză:** User-ul nu are exchanges setate în `userExchangesSchema`

**Soluție:**
1. Verifică în MongoDB dacă există documente în collection `userexchanges` cu `userID`
2. Adaugă un exchange folosind UI-ul sau direct în DB

### Error 2: "nitroApp.ccxtw is undefined"
**Cauză:** Plugin-ul `ccxtw` nu s-a încărcat

**Soluție:**
1. Verifică dacă `server/plugins/ccxtw.js` există
2. Verifică dacă plugin-ul are `export default defineNitroPlugin`
3. Restart server Nuxt

### Error 3: "CoPilotAutomationRuleSchema is not defined"
**Cauză:** Schema nu este importată corect

**Soluție:**
1. Verifică că `server/models/coPilotAutomationRule.schema.js` există
2. Verifică export: `export const CoPilotAutomationRuleSchema`
3. Restart server pentru hot-reload

## 🔧 Files Modified

1. ✅ `server/api/v1/Bots/fetchCoPilotOrders.get.js` - Fixed imports and logic
2. ✅ `server/models/coPilotAutomationRule.schema.js` - Created schema
3. ✅ `pages/Bots/Co-Pilot.vue` - Updated to use new endpoint

## 📝 Next Steps

Dacă endpoint-ul funcționează (status 200):
- ✅ Orders se afișează în tabel
- ✅ Coloana "Active Rules" arată status corect
- ✅ Auto-refresh funcționează la 30s
- ✅ Stats se afișează în success message

Dacă mai sunt erori:
- 📋 Verifică console logs (browser + server)
- 📋 Verifică Network tab pentru request/response
- 📋 Verifică MongoDB pentru date existente

---

**Data:** 2025-11-25
**Versiune:** v2.2 (Co-Pilot Refactored + Debugged)