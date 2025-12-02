# Co-Pilot Bots Reference Guide

## Overview
Co-Pilot monitors your orders and when they are filled (partially or fully), it can automatically launch one of 12 different bot types with customized configurations.

## Trigger Conditions
- **On Fill**: Triggers when order is 100% filled
- **On Partial Fill**: Triggers when order reaches X% filled (configurable)
- **On Cancel**: Triggers when order is cancelled
- **On Price Change**: Triggers on significant price movement
- **On Time**: Triggers after X seconds/minutes
- **Manual**: User manually triggers the action

---

## Bot Types Reference

### 1. Grid Bot (`grid`)
**Library**: `GridBotLib.js`
**Purpose**: Places buy and sell orders at preset price intervals (grid levels)

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair (e.g., "LCX/USDC") |
| `lowerPrice` | number | Bottom of the grid range |
| `upperPrice` | number | Top of the grid range |
| `nrOfGrids` | number | Number of grid levels |
| `amount` | number | Amount per grid order |
| `amountType` | string | "quantityPerGrid", "totalAmount", "fixed" |
| `ordersSide` | string | "buyOnly", "sellOnly", "buyOrSell" |
| `apiKeyNames` | array | API keys to use |

**How it works**:
1. Calculates grid width: `(upperPrice - lowerPrice) / nrOfGrids`
2. Places orders at each grid level
3. When order fills, places inverse order

---

### 2. GridBot Plus / DCA Grid (`dcagrid`)
**Library**: `GridBotLib.js` (extended)
**Purpose**: Grid trading with DCA (Dollar Cost Averaging) strategy

**Additional Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `incrementalPercentAmountBuy` | number | Increase buy amount by X% per level |
| `incrementalPercentAmountSell` | number | Increase sell amount by X% per level |
| `devPriceBuy` | number | Price deviation for buy orders |
| `devPriceSell` | number | Price deviation for sell orders |

**Best Use Case**: Accumulating during downtrends, distributing during uptrends

---

### 3. DCA Bot (`dca`)
**Library**: `DCALib.js`
**Purpose**: Dollar Cost Averaging - buys fixed amounts at regular intervals or price drops

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `baseOrderAmount` | number | Initial order amount in USD |
| `safetyOrderAmount` | number | Amount for safety orders |
| `safetyOrderPercent` | number | Price drop % to trigger safety order |
| `takeProfitPercent` | number | Target profit % |
| `maxSafetyOrders` | number | Maximum safety orders |
| `leverage` | number | Leverage (1 for spot) |
| `direction` | string | "long" or "short" |

**How it works**:
1. Places base order at market price
2. If price drops X%, places safety order (averaging down)
3. Calculates average entry and places take-profit order

---

### 4. Smart DCA (`smartdca`)
**Library**: `DCALib.js` + ML indicators
**Purpose**: AI-powered DCA using RSI and technical indicators

**Additional Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `rsiOversold` | number | RSI level to trigger buy (default: 30) |
| `rsiOverbought` | number | RSI level to trigger sell (default: 70) |
| `smaFast` | number | Fast SMA period |
| `smaSlow` | number | Slow SMA period |

**How it works**:
1. Monitors RSI indicator
2. Buys when RSI < oversold threshold
3. Sells when RSI > overbought threshold

---

### 5. Fibonacci Bot (`fib`)
**Library**: `FibBotLib.js`
**Purpose**: Trading based on Fibonacci retracement levels

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `lowerPrice` | number | 100% retracement level |
| `upperPrice` | number | 0% retracement level |
| `nrOfGrids` | number | Number of Fib levels to use |
| `PriceStart` | number | Entry price |
| `amountPriceStart` | number | Amount for initial order |

**Fibonacci Levels**: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%

---

### 6. FrontRun Bot (`frontrun`)
**Library**: `FronRunLib.js`
**Purpose**: Quick entry/exit strategy for momentum trading

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `lowerPrice` | number | Entry zone bottom |
| `upperPrice` | number | Exit zone top |
| `nrOfGrids` | number | Number of order levels |
| `PriceStart` | number | Initial order price |
| `amountPriceStart` | number | Initial order amount |

**Best Use Case**: Quick scalps on momentum moves

---

### 7. Scalping Bot (`scalping`)
**Library**: `Scalp1ngBotLib.js`
**Purpose**: High-frequency trading for small, quick profits

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `lowerPrice` | number | Scalp range bottom |
| `upperPrice` | number | Scalp range top |
| `nrOfGrids` | number | Number of scalp levels |
| `BalanceBotStart` | number | Starting balance for bot |

**Special Feature**: Auto-cancels orders after 25 seconds and replaces

**Best Use Case**: High liquidity pairs with tight spreads

---

### 8. OneClick Bot (`oneclick`)
**Library**: `OneClickBotLib.js`
**Purpose**: One-click deployment with saved strategy configurations

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `lowerPrice` | number | Grid bottom |
| `upperPrice` | number | Grid top |
| `nrOfGrids` | number | Number of grids |
| `incrementalPercentAmountBuy` | number | Buy increment % |
| `incrementalPercentAmountSell` | number | Sell increment % |
| `ordersSide` | string | "buyOnly", "sellOnly", "buyOrSell" |

**Features**:
- Save strategies as presets
- Dynamic percentage-based pricing
- Multi-pair support in single strategy

---

### 9. CoPilot Bot (`copilot`)
**Library**: `CoPilotBotLib.js`
**Purpose**: Order monitoring and automated chaining

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `triggerCondition` | string | When to trigger |
| `actionConfig` | object | What action to take |
| `automationRules` | array | List of rules |

**Features**:
- Monitor orders for fill status
- Chain multiple bots together
- Rule-based automation

---

### 10. Grinder Bot (`grinder`)
**Library**: `GrindeBotLib.js`
**Purpose**: Persistent trading to grind profits over time

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `BalanceBotStart` | number | Starting balance |
| `ordersSide` | string | "buyOnly" or "sellOnly" |

**How it works**:
- Uses order book to find best bid/ask
- Places orders at optimal prices
- Grinds small profits repeatedly

---

### 11. OrderBook Bot (`orderbook`)
**Library**: Uses ccxtw.fetchOrderBook
**Purpose**: Trading based on order book analysis and depth

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `bidDepth` | number | Levels of bids to analyze |
| `askDepth` | number | Levels of asks to analyze |
| `imbalanceThreshold` | number | Buy/sell pressure threshold |

**How it works**:
- Analyzes bid/ask depth
- Detects buying/selling pressure
- Places orders based on order book imbalance

---

### 12. AI Bot (`aibot`)
**Library**: Uses TensorFlow.js + technicalindicators
**Purpose**: Machine learning powered trading decisions

**Required Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Trading pair |
| `modelType` | string | "lstm", "rnn", "dense" |
| `indicators` | array | ["RSI", "MACD", "SMA", "EMA"] |
| `lookbackPeriod` | number | Historical candles to analyze |
| `confidenceThreshold` | number | Min confidence for trade |

**How it works**:
- Analyzes historical data with ML model
- Predicts price direction
- Executes trades when confidence exceeds threshold

---

## Co-Pilot Integration

### Creating a Rule from Order Fill

When an order fills, Co-Pilot can:

1. **Copy Order**: Duplicate the order on another API key
2. **Reverse Order**: Place opposite order (buy becomes sell)
3. **Create Bot**: Launch any of the 12 bots above
4. **Cancel Order**: Cancel related orders
5. **Chain Action**: Trigger another rule

### Example: Order Fill → Grid Bot

```javascript
{
  triggerCondition: 'on_fill',
  ruleType: 'create_bot',
  actionConfig: {
    botType: 'grid',
    symbol: 'LCX/USDC',
    lowerPrice: filledOrder.price * 0.9,  // 10% below fill
    upperPrice: filledOrder.price * 1.1,  // 10% above fill
    nrOfGrids: 10,
    amount: filledOrder.amount / 10,
    ordersSide: 'buyOrSell'
  }
}
```

### Example: Partial Fill → DCA Bot

```javascript
{
  triggerCondition: 'on_partial_fill',
  triggerValue: 50,  // 50% filled
  ruleType: 'create_bot',
  actionConfig: {
    botType: 'dca',
    symbol: 'LCX/USDC',
    baseOrderAmount: remainingAmount,
    safetyOrderPercent: 3,
    takeProfitPercent: 2,
    maxSafetyOrders: 5
  }
}
```

---

## Bot Selection Guide

| Scenario | Recommended Bot |
|----------|-----------------|
| Range-bound market | Grid Bot, OneClick |
| Downtrend (accumulate) | DCA Bot, Smart DCA |
| Uptrend (distribute) | FrontRun, Scalping |
| High volatility | Fibonacci, Grid |
| Low volatility | Grinder, OrderBook |
| Automated strategy | CoPilot, AI Bot |
| Quick execution | OneClick, Scalping |

---

## Common Configuration Patterns

### Conservative Grid
```javascript
{
  nrOfGrids: 5,
  range: '10%',  // 5% above/below current
  amountType: 'totalAmount'
}
```

### Aggressive DCA
```javascript
{
  safetyOrderPercent: 2,
  maxSafetyOrders: 10,
  takeProfitPercent: 1
}
```

### Scalping Setup
```javascript
{
  nrOfGrids: 3,
  range: '2%',
  autoCancel: 25  // seconds
}
```
