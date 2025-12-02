# Palantir API Reference

Complete API documentation for the Palantir Trading Intelligence System.

## Base URL

All API endpoints are accessible at: `http://localhost:3000/api/v1/palantir`

---

## 📊 Bot Chains API

### 1. Create Bot Chain

**POST** `/api/v1/palantir/chains/create`

Create a new bot chain with multiple nodes.

**Request Body:**
```json
{
  "userId": "user123",
  "name": "Profit Chain",
  "nodes": [
    {
      "nodeId": "n1",
      "type": "GridBot",
      "config": {
        "strategy": "BUY",
        "symbol": "BTC/USDT",
        "amount": 100
      },
      "trigger": {
        "event": "profit_reached",
        "operator": ">=",
        "value": 5,
        "unit": "percent"
      }
    }
  ],
  "edges": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chainId": "chain-1234567890-abc123",
    "userId": "user123",
    "name": "Profit Chain",
    "status": "idle",
    "enabled": true,
    "nodes": [...],
    "currentNode": "n1"
  },
  "message": "Bot chain created successfully"
}
```

---

### 2. List Bot Chains

**GET** `/api/v1/palantir/chains/list?userId=user123`

Get all bot chains for a user with optional filters.

**Query Parameters:**
- `userId` (required) - User ID
- `status` (optional) - Filter by status: running, paused, completed, failed
- `enabled` (optional) - Filter by enabled state: true/false

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "total": 10,
    "running": 3,
    "paused": 2,
    "completed": 4,
    "failed": 1
  },
  "count": 10
}
```

---

### 3. Toggle Bot Chain

**POST** `/api/v1/palantir/chains/toggle`

Enable or disable a bot chain.

**Request Body:**
```json
{
  "userId": "user123",
  "chainId": "chain-1234567890-abc123",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Bot chain enabled successfully"
}
```

---

### 4. Delete Bot Chain

**POST** `/api/v1/palantir/chains/delete`

Delete a bot chain.

**Request Body:**
```json
{
  "chainId": "chain-1234567890-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bot chain deleted successfully"
}
```

---

### 5. Get Chain Statistics

**GET** `/api/v1/palantir/chains/stats?userId=user123`

Get aggregated statistics for all chains.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChains": 10,
    "activeChains": 3,
    "pausedChains": 2,
    "completedChains": 4,
    "failedChains": 1,
    "totalExecutions": 150,
    "totalSuccesses": 120,
    "totalFailures": 30,
    "avgProfit": 15.7,
    "successRate": "80.00"
  }
}
```

---

## 🔍 Pattern Detection API

### 1. Scan for Patterns

**POST** `/api/v1/palantir/patterns/scan`

Manually trigger a pattern scan.

**Request Body:**
```json
{
  "userId": "user123",
  "symbol": "BTC/USDT",
  "timeframe": "15m",
  "patternTypes": ["pump", "dump", "breakout"],
  "metrics": {
    "currentPrice": 50000,
    "currentVolume": 1000000,
    "priceChange": 3.5,
    "volumeChange": 45,
    "rsi": 65,
    "macd": 0.4,
    "ema20": 49800,
    "sma50": 49500
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "patternType": "pump",
      "confidence": 78,
      "signals": ["Strong upward momentum", "High volume"],
      "symbol": "BTC/USDT",
      "timeframe": "15m"
    }
  ],
  "count": 1,
  "message": "1 pattern(s) detected"
}
```

---

### 2. List Patterns

**GET** `/api/v1/palantir/patterns/list?userId=user123`

Get detected patterns with filters.

**Query Parameters:**
- `userId` (required) - User ID
- `symbol` (optional) - Filter by symbol
- `timeframe` (optional) - Filter by timeframe
- `patternType` (optional) - Filter by pattern type
- `minConfidence` (optional) - Minimum confidence threshold
- `since` (optional) - ISO date string
- `limit` (optional) - Max results (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "pump": { "count": 5, "avgConfidence": "72.5" },
    "dump": { "count": 3, "avgConfidence": "68.0" }
  },
  "count": 8
}
```

---

### 3. Pattern Statistics

**GET** `/api/v1/palantir/patterns/stats?userId=user123`

Get aggregated pattern statistics.

**Query Parameters:**
- `userId` (required)
- `since` (optional) - ISO date string (default: last 24h)

**Response:**
```json
{
  "success": true,
  "data": {
    "byPattern": [
      {
        "_id": "pump",
        "count": 15,
        "avgConfidence": 72.5,
        "maxConfidence": 95,
        "minConfidence": 50
      }
    ],
    "overall": {
      "totalPatterns": 45,
      "avgConfidence": 68.5,
      "highConfidenceCount": 12,
      "mediumConfidenceCount": 25,
      "lowConfidenceCount": 8
    },
    "byTimeframe": [...],
    "bySymbol": [...]
  }
}
```

---

### 4. Configure Pattern

**POST** `/api/v1/palantir/patterns/configure`

Update pattern detection configuration.

**Request Body:**
```json
{
  "userId": "user123",
  "patternId": "pattern-id",
  "config": {
    "minConfidence": 70,
    "enabled": true,
    "notifications": true,
    "autoTrade": false
  }
}
```

---

### 5. Delete Patterns

**POST** `/api/v1/palantir/patterns/delete`

Delete pattern(s).

**Request Body:**
```json
{
  "userId": "user123",
  "patternId": "pattern-id",
  // OR
  "deleteAll": true,
  "olderThan": 24  // hours
}
```

---

## ⚙️ Automation Rules API

### 1. Create Rule

**POST** `/api/v1/palantir/rules/create`

Create a new automation rule.

**Request Body:**
```json
{
  "userId": "user123",
  "name": "Start Bot on Pump",
  "description": "Start grid bot when pump pattern detected",
  "trigger": {
    "event": "PATTERN_DETECTED",
    "conditions": [
      {
        "field": "patternType",
        "operator": "==",
        "value": "pump"
      },
      {
        "field": "confidence",
        "operator": ">=",
        "value": 75
      }
    ]
  },
  "actions": [
    {
      "type": "START_BOT",
      "config": {
        "botType": "GridBot",
        "strategy": "BUY"
      }
    },
    {
      "type": "SEND_NOTIFICATION",
      "config": {
        "message": "Pump detected - Grid bot started",
        "channel": "telegram"
      }
    }
  ],
  "priority": 8,
  "cooldown": {
    "enabled": true,
    "duration": 300
  },
  "limits": {
    "maxExecutionsPerDay": 50
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ruleId": "rule-1234567890-xyz",
    "name": "Start Bot on Pump",
    "enabled": true,
    ...
  },
  "message": "Automation rule created successfully"
}
```

---

### 2. List Rules

**GET** `/api/v1/palantir/rules/list?userId=user123`

Get all automation rules.

**Query Parameters:**
- `userId` (required)
- `enabled` (optional) - true/false
- `event` (optional) - Filter by event type
- `minPriority` (optional) - Minimum priority

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "total": 15,
    "enabled": 10,
    "disabled": 5,
    "totalExecutions": 450
  },
  "byEvent": {
    "PATTERN_DETECTED": { "count": 8, "enabled": 6 }
  }
}
```

---

### 3. Toggle Rule

**POST** `/api/v1/palantir/rules/toggle`

Enable/disable an automation rule.

**Request Body:**
```json
{
  "userId": "user123",
  "ruleId": "rule-1234567890-xyz",
  "enabled": true
}
```

---

### 4. Execute Rule

**POST** `/api/v1/palantir/rules/execute`

Manually execute an automation rule.

**Request Body:**
```json
{
  "userId": "user123",
  "ruleId": "rule-1234567890-xyz",
  "eventData": {
    "patternType": "pump",
    "confidence": 85
  },
  "manual": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ruleId": "rule-1234567890-xyz",
    "ruleName": "Start Bot on Pump",
    "executionResults": [
      {
        "action": "START_BOT",
        "result": { "success": true, "botId": "bot-123" }
      }
    ],
    "executionCount": 15
  }
}
```

---

### 5. Delete Rule

**POST** `/api/v1/palantir/rules/delete`

Delete an automation rule.

**Request Body:**
```json
{
  "userId": "user123",
  "ruleId": "rule-1234567890-xyz"
}
```

---

### 6. Rule Statistics

**GET** `/api/v1/palantir/rules/stats?userId=user123`

Get aggregated rule statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalRules": 15,
      "enabledRules": 10,
      "totalExecutions": 450
    },
    "byEvent": [...],
    "byAction": [...],
    "topExecuted": [...],
    "recentlyExecuted": [...]
  }
}
```

---

## 📈 Analytics API

### 1. Multi-Timeframe Analysis

**GET** `/api/v1/palantir/analytics/multiTimeframe?symbol=BTC/USDT`

Get multi-timeframe analysis for a symbol.

**Query Parameters:**
- `symbol` (required)
- `timeframes` (optional) - Comma-separated list (default: 1m,5m,15m,30m,1h,4h,1d)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTC/USDT",
    "timestamp": "2025-01-14T10:00:00.000Z",
    "timeframes": [
      {
        "timeframe": "1m",
        "signal": "bullish",
        "strength": "strong",
        "rsi": 65,
        "macd": 0.5,
        "trend": "up"
      }
    ],
    "correlation": {
      "1m": { "1m": 1.0, "5m": 0.7 }
    },
    "overallSignal": {
      "direction": "bullish",
      "confidence": "75.0",
      "bullishTimeframes": 5,
      "bearishTimeframes": 2
    }
  }
}
```

---

### 2. Trading Signals

**GET** `/api/v1/palantir/analytics/signals?userId=user123`

Get live trading signals from patterns and chains.

**Query Parameters:**
- `userId` (required)
- `symbol` (optional)
- `minConfidence` (optional) - Default: 60
- `limit` (optional) - Default: 20

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pattern-id",
      "type": "pattern",
      "timestamp": "2025-01-14T10:00:00.000Z",
      "symbol": "BTC/USDT",
      "action": "BUY",
      "confidence": 85,
      "reason": "Dump detected - potential bounce",
      "priceTarget": 52500,
      "stopLoss": 47500
    }
  ],
  "stats": {
    "total": 15,
    "buySignals": 8,
    "sellSignals": 5,
    "avgConfidence": "72.5"
  }
}
```

---

### 3. Event Log

**GET** `/api/v1/palantir/analytics/eventLog?userId=user123`

Get system event log.

**Query Parameters:**
- `userId` (required)
- `limit` (optional) - Default: 50
- `eventType` (optional) - pattern, chain, automation
- `since` (optional) - ISO date (default: last 24h)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "pattern",
      "eventType": "pattern_detected",
      "timestamp": "2025-01-14T10:00:00.000Z",
      "source": "Pattern Engine",
      "description": "pump pattern detected on BTC/USDT",
      "severity": "high"
    }
  ],
  "stats": {
    "total": 150,
    "byType": { "chain": 50, "pattern": 75, "automation": 25 },
    "bySeverity": { "high": 15, "medium": 85, "low": 50 }
  }
}
```

---

### 4. Dashboard Data

**GET** `/api/v1/palantir/analytics/dashboard?userId=user123`

Get complete dashboard overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "chains": {
        "totalChains": 10,
        "runningChains": 3,
        "totalProfit": 250.75
      },
      "patterns": {
        "total24h": 45,
        "highConfidenceCount": 12
      },
      "automation": {
        "totalRules": 15,
        "enabledRules": 10,
        "executionsToday": 28
      }
    },
    "systemHealth": {
      "status": "healthy",
      "activeComponents": {
        "botChains": true,
        "patternEngine": true,
        "automationEngine": true
      }
    }
  }
}
```

---

## Event Types Reference

### Trigger Events
- `BOT_STARTED` - Bot instance started
- `BOT_STOPPED` - Bot instance stopped
- `PROFIT_THRESHOLD` - Profit target reached
- `LOSS_THRESHOLD` - Loss limit reached
- `PATTERN_DETECTED` - Market pattern detected
- `PRICE_ALERT` - Price threshold reached
- `CHAIN_COMPLETED` - Bot chain finished
- `CHAIN_FAILED` - Bot chain failed

### Pattern Types
- `pump` - Upward price surge
- `dump` - Downward price drop
- `breakout` - Price breakout from range
- `reversal` - Trend reversal
- `accumulation` - Low volatility accumulation

### Bot Types
- `GridBot` - Grid trading bot
- `DCABot` - Dollar cost averaging bot
- `Scalp1ngBot` - Scalping bot
- `FibBot` - Fibonacci retracement bot
- `ArbitrageBot` - Arbitrage bot

### Action Types
- `START_BOT` - Start a trading bot
- `STOP_BOT` - Stop a trading bot
- `START_CHAIN` - Start a bot chain
- `SEND_NOTIFICATION` - Send notification
- `SEND_WEBHOOK` - Trigger webhook
- `ADJUST_PARAMETERS` - Adjust bot parameters

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "statusCode": 400,
  "statusMessage": "userId is required"
}
```

Common error codes:
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit/cooldown)
- `500` - Internal Server Error

---

## Rate Limiting

- Pattern scans: Max 100/hour per user
- Rule executions: Configurable per-rule cooldown
- Daily limits: Configurable per-rule

---

## WebSocket Events (Coming Soon)

Real-time updates via WebSocket:
- `pattern:detected` - New pattern detected
- `chain:status` - Chain status changed
- `rule:executed` - Automation rule executed
- `signal:new` - New trading signal

---

## Examples

### Create a Simple Bot Chain

```javascript
const response = await fetch('http://localhost:3000/api/v1/palantir/chains/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    name: 'My First Chain',
    nodes: [
      {
        nodeId: 'n1',
        type: 'GridBot',
        config: { strategy: 'BUY', symbol: 'BTC/USDT', amount: 100 },
        trigger: { event: 'profit_reached', operator: '>=', value: 5 }
      }
    ]
  })
});
```

### Monitor Patterns

```javascript
const patterns = await fetch(
  'http://localhost:3000/api/v1/palantir/patterns/list?userId=user123&minConfidence=75'
);
const data = await patterns.json();
console.log(data.data); // Array of high-confidence patterns
```

---

**Last Updated:** 2025-01-14
**API Version:** v1
