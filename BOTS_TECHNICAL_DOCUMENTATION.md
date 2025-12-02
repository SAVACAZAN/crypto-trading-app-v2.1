# 🤖 Technical Documentation - 12 Trading Bots System

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Bot Implementations](#bot-implementations)
3. [Database Schemas](#database-schemas)
4. [API Integration](#api-integration)
5. [Execution Engine](#execution-engine)
6. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

### Technology Stack
- **Backend Framework**: Nuxt 3 Server API
- **Database**: MongoDB with Mongoose ODM
- **Exchange Integration**: CCXT (Custom fork for LCX)
- **Math Library**: mathjs (BigNumber precision: 20)
- **Technical Indicators**: technicalindicators, @debut/indicators
- **Time Management**: moment.js

### Core Components
```
server/
├── plugins/
│   ├── GridBotLib.js          # Grid trading engine
│   ├── FibBotLib.js            # Fibonacci retracement bot
│   ├── Scalp1ngBotLib.js       # High-frequency scalping
│   ├── CoPilotBotLib.js        # AI-assisted trading
│   ├── DkdBotLib.js            # DKD (Dollar-Kost-Dollar) strategy
│   ├── OneClickBotLib.js       # Quick deployment bot
│   ├── GrinderBotLib.js        # Continuous profit grinding
│   ├── FronRunLib.js           # Front-running strategy
│   ├── smartDcaScheduler.js    # Smart DCA execution scheduler
│   └── ccxtw.js                # CCXT wrapper with multi-key support
│
├── models/
│   ├── gridBot.schema.js
│   ├── FibBot.schema.js
│   ├── Scalp1ngBot.schema.js
│   ├── CoPilotBot.schema.js
│   ├── DkdBot.schema.js
│   ├── smartDcaBot.schema.js
│   └── ... (other schemas)
│
└── api/v1/
    ├── Bots/
    │   ├── createCoPilotBot.post.js
    │   ├── createFibBot.post.js
    │   ├── createScalp1ngBot.post.js
    │   └── ... (bot endpoints)
    │
    ├── createSmartDCABot.post.js
    ├── stopSmartDCABot.post.js
    ├── fetchSmartDCABots.post.js
    └── ... (other endpoints)
```

---

## 🤖 Bot Implementations

### 1. 📊 Grid Bot (GridBotLib.js)

**Purpose**: Market-neutral strategy for ranging markets

#### Technical Details
```javascript
// Grid Price Calculation
gridWidth = (upperPrice - lowerPrice) / nrOfGrids
prices[i] = lowerPrice + (gridWidth * i)

// Special handling for nrOfGrids = 2
if (nrOfGrids === 2) {
    gridWidth = (upperPrice - lowerPrice) / 2
}
```

#### Key Features
- **Multi-API Key Support**: Distributes orders across multiple API keys
- **Balance Tracking**: Monitors balance before/after order placement
- **USD Value Calculation**: Converts base/quote to USD for tracking
- **Smart Order Placement**: Separates buy/sell orders based on current market price

#### Configuration Parameters
```javascript
{
    userID: String,
    exchange: String,
    symbol: String,
    lowerPrice: Number,
    upperPrice: Number,
    nrOfGrids: Number,
    amount: Number,
    amountType: 'quantityPerGrid' | 'totalAmount' | 'incrementalPercent',
    ordersSide: 'buyOrSell' | 'buyOnly' | 'sellOnly',
    incrementalPercentAmountBuy: Number,
    incrementalPercentAmountSell: Number,
    apiKeyNames: Array<String>  // NEW: Multiple API keys
}
```

#### Amount Calculation Methods

**1. Quantity Per Grid**
```javascript
quantityPerGrid = amount / price
```

**2. Total Amount**
```javascript
quantityPerGrid = (amount / nrOfGrids) / price
```

**3. Incremental Percent**
```javascript
quantityPerGrid = (amount + ((amount / 100) * (index + 1) * amount)) / price
```

#### Order Placement Logic
```javascript
// Split prices based on current market
if (price > lastPrice) {
    sellPrices.push(price)
} else if (price < lastPrice) {
    buyPrices.push(price)
}

// Place orders for each API key
for (let apiKeyName of apiKeyNames) {
    if (ordersSide === 'buyOrSell') {
        placeBuyOrders(buyPrices)
        placeSellOrders(sellPrices)
    }
    // Add delay for Coinbase Advanced
    if (exchange === 'coinbaseadvanced') {
        await delay(2000)
    }
}
```

#### Balance Tracking
```javascript
// Snapshot BEFORE orders
balanceSnapshot = {
    baseFree: float,
    baseTotal: float,
    quoteFree: float,
    quoteTotal: float
}

// Calculate balance in active orders
balanceInOrders = {
    baseInOrders: sum(sellOrders.amount),
    quoteInOrders: sum(buyOrders.amount * buyOrders.price)
}

// USD conversion
balanceBaseInUSD = baseInOrders * basePriceUSD
balanceQuoteInUSD = quoteInOrders * quotePriceUSD
totalBalanceInUSD = balanceBaseInUSD + balanceQuoteInUSD
```

---

### 2. 📈 Fibonacci Bot (FibBotLib.js)

**Purpose**: Trade using Fibonacci retracement levels

#### Fibonacci Calculation
```javascript
// Grid width calculation
gridWidth = (upperPrice - lowerPrice) / nrOfGrids

// Price levels
for (i = 0; i < nrOfGrids; i++) {
    currentPrice += gridWidth
    prices.push(currentPrice)
}
```

#### Order Structure
```javascript
// Buy strategy: Start with buy, then sell grids
if (ordersSide === 'buyOnly') {
    placeOrder(PriceStart, 'buy', amountPriceStart)
    placeOrders(prices.slice(1), 'sell', amount)
}

// Sell strategy: Start with sell, then buy grids
if (ordersSide === 'sellOnly') {
    placeOrder(PriceStart, 'sell', amountPriceStart)
    placeOrders(prices.slice(1), 'buy', amount)
}
```

#### Auto-Rebalancing Logic
```javascript
// When order filled, place inverse order
if (side === 'buy') {
    newSide = 'sell'
    newPrice = price + (price * 0.10)  // 10% profit
}

if (side === 'sell') {
    newSide = 'buy'
    newPrice = price - (price * 0.10)  // 10% below
}

// Check for duplicates before placing
if (!existsInOrders && !existsInPriceStart) {
    placeOrder(newSide, newPrice, amount)
    updateDatabase()
}
```

---

### 3. ⚡ Scalping Bot (Scalp1ngBotLib.js)

**Purpose**: High-frequency trading for quick profits

#### Key Features
- **Time-Limited Orders**: 25-second order lifetime
- **Auto-Cancel**: Cancels unfilled orders automatically
- **Balance Tracking**: Tracks remaining balance after fills

#### Execution Flow
```javascript
// Place order
placeOrder(price, side, amount)

// Wait 25 seconds
await delay(25000)

// Cancel if not filled
cancelOrder(orderId)

// Wait before next order
await delay(25000)

// Track filled amount
if (order.filled) {
    totalFilledAmount += (quantity * price)
}

// Calculate remaining balance
BalanceBotRemain = BalanceBotStart - totalFilledAmount
```

#### Order Direction
```javascript
// Buy orders: Start from highest buy price
for (i = buyPrices.length - 1; i >= 0; i--) {
    placeOrder(buyPrices[i], 'buy')
}

// Sell orders: Start from lowest sell price
for (i = 0; i < sellPrices.length; i++) {
    placeOrder(sellPrices[i], 'sell')
}
```

---

### 4. 🧠 Smart DCA Bot (Smart Dollar Cost Averaging)

**Purpose**: Intelligent DCA with RSI & MACD indicators

#### Technical Indicators Integration

**RSI (Relative Strength Index)**
```javascript
// Timeframes monitored
timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d']

// Capture initial RSI values
for (timeframe of timeframes) {
    initialRSI[timeframe] = fetchRSI(timeframe)
}

// Execution logic
if (enableRSI) {
    if (side === 'buy' && currentRSI < rsiOversold) {
        executeTrade()
    }
    if (side === 'sell' && currentRSI > rsiOverbought) {
        executeTrade()
    }
}
```

**MACD (Moving Average Convergence Divergence)**
```javascript
// Capture initial MACD values
for (timeframe of timeframes) {
    initialMACD[timeframe] = {
        macd: value,
        signal: value,
        histogram: value
    }
}

// Execution logic
if (enableMACD) {
    if (side === 'buy' && macdHistogram > 0) {
        executeTrade()  // Bullish crossover
    }
    if (side === 'sell' && macdHistogram < 0) {
        executeTrade()  // Bearish crossover
    }
}
```

#### Execution Modes

**1. Scheduled Mode**
```javascript
executionMode = 'scheduled'
// Executes every interval regardless of conditions
```

**2. Smart Mode**
```javascript
executionMode = 'smart'
// Only executes when RSI/MACD conditions are met
```

#### DCA Interval Conversion
```javascript
// Convert interval to milliseconds
intervalToMs(interval) {
    units = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'M': 30 * 24 * 60 * 60 * 1000
    }

    return value * units[unit]
}
```

#### Execution History Tracking
```javascript
executionHistory = [{
    timestamp: Date,
    side: 'buy' | 'sell',
    price: Number,
    amount: Number,
    cost: Number,
    fee: Number,
    rsi: Number,
    macd: {
        macd: Number,
        signal: Number,
        histogram: Number
    },
    executed: Boolean,
    orderId: String
}]
```

#### Statistics Tracking
```javascript
botStats = {
    startedAt: Date,
    executionCount: Number,
    totalSpent: Number,      // For buy bots
    totalReceived: Number,   // For sell bots
    totalBase: Number,       // Total base currency
    totalFees: Number,
    averagePrice: Number,

    // Duration tracking
    totalDuration: Number,   // In hours, 0 = infinite
    elapsedTime: Number,
    completionPercent: Number,

    // P&L (for buy bots)
    currentValue: Number,
    unrealizedPnL: Number,
    pnlPercent: Number
}
```

---

### 5. ✈️ Co-Pilot Bot (CoPilotBotLib.js)

**Purpose**: AI-assisted semi-automated trading

#### Features
- **Manual Approval**: AI suggests, user approves
- **Automation Rules**: Configurable rule-based execution
- **Rule Templates**: Pre-configured strategy templates

#### Rule Structure
```javascript
rule = {
    ruleId: String,
    name: String,
    condition: {
        indicator: 'RSI' | 'MACD' | 'Price' | 'Volume',
        operator: '>' | '<' | '=' | '>=' | '<=',
        value: Number
    },
    action: {
        type: 'buy' | 'sell',
        amount: Number,
        priceType: 'market' | 'limit',
        price: Number
    },
    enabled: Boolean
}
```

#### Rule Templates
```javascript
ruleTemplate = {
    templateId: String,
    name: String,
    description: String,
    category: 'Scalping' | 'DCA' | 'Grid' | 'Trend',
    rules: Array<Rule>,
    defaultParams: Object
}
```

#### Execution Logic
```javascript
// Check conditions for each active rule
for (rule of activeRules) {
    if (rule.enabled && checkCondition(rule.condition)) {
        suggestion = {
            rule: rule,
            action: rule.action,
            timestamp: now,
            status: 'pending_approval'
        }

        // Notify user for approval
        notifyUser(suggestion)

        // If user approves
        if (userApproves) {
            executeAction(suggestion.action)
            suggestion.status = 'executed'
        }
    }
}
```

---

### 6. 👆 One Click Bot (OneClickBotLib.js)

**Purpose**: Quick deployment with preset strategies

#### Pre-configured Strategies
```javascript
strategies = {
    'Conservative': {
        nrOfGrids: 5,
        ordersSide: 'buyOrSell',
        amountType: 'totalAmount',
        incrementalPercentAmountBuy: 10,
        incrementalPercentAmountSell: 10
    },
    'Aggressive': {
        nrOfGrids: 10,
        ordersSide: 'buyOrSell',
        amountType: 'incrementalPercent',
        incrementalPercentAmountBuy: 20,
        incrementalPercentAmountSell: 20
    },
    'ScalpingMode': {
        nrOfGrids: 20,
        ordersSide: 'buyOrSell',
        amountType: 'quantityPerGrid',
        incrementalPercentAmountBuy: 5,
        incrementalPercentAmountSell: 5
    }
}
```

#### Quick Deployment
```javascript
// User selects strategy
selectedStrategy = 'Conservative'

// Auto-fill parameters
botConfig = {
    ...strategies[selectedStrategy],
    symbol: userSelectedSymbol,
    exchange: userSelectedExchange,
    lowerPrice: currentPrice * 0.95,  // 5% below
    upperPrice: currentPrice * 1.05,  // 5% above
    amount: userBalance * 0.1         // 10% of balance
}

// Deploy with one click
deployBot(botConfig)
```

---

### 7. 🔄 Grinder Bot (GrinderBotLib.js)

**Purpose**: Continuous small profit extraction

#### Order Book Integration
```javascript
// Fetch order book
orderBook = fetchOrderBook(symbol)

// Get best bid/ask
bestBid = orderBook.bids[0][0]
bestAsk = orderBook.asks[0][0]

// Place tight orders
spread = bestAsk - bestBid
targetSpread = spread * 0.5  // 50% of current spread

buyPrice = bestBid + (spread * 0.25)
sellPrice = bestAsk - (spread * 0.25)
```

#### Continuous Execution
```javascript
// Loop indefinitely
while (bot.active) {
    // Place orders
    placeOrder(buyPrice, 'buy', amount)
    placeOrder(sellPrice, 'sell', amount)

    // Monitor fills
    checkFills()

    // Re-adjust prices
    updatePrices()

    // Small delay
    await delay(1000)
}
```

---

### 8. 🏃 Front-Run Bot (FronRunLib.js)

**Purpose**: Front-running strategy (ethical use only)

#### Detection Logic
```javascript
// Monitor pending transactions
monitorMempool()

// Detect large orders
if (pendingOrder.size > threshold) {
    // Calculate front-run price
    frontRunPrice = pendingOrder.price * 1.001  // 0.1% ahead

    // Place order quickly
    placeOrder(frontRunPrice, pendingOrder.side, amount)

    // Exit when target filled
    if (targetFilled) {
        placeExitOrder()
    }
}
```

#### Inverse Order Execution
```javascript
// When buy order fills
if (order.side === 'buy') {
    newPrice = price + (price * profitPercent)
    placeOrder(newPrice, 'sell', amount)
}

// When sell order fills
if (order.side === 'sell') {
    newPrice = price - (price * profitPercent)
    placeOrder(newPrice, 'buy', amount)
}
```

---

### 9. 💎 DKD Bot (DkdBotLib.js)

**Purpose**: Dollar-Kost-Dollar accumulation strategy

#### Single Order Focus
```javascript
// Unlike grid bots, DKD places ONE initial order
if (ordersSide === 'buyOnly') {
    placeOrder(PriceStart, 'buy', amount)
}

if (ordersSide === 'sellOnly') {
    placeOrder(PriceStart, 'sell', amount)
}

// No additional grid orders
// Focuses on averaging cost over time
```

#### Position Averaging
```javascript
// As market moves, add to position
if (priceDroppedBy(targetPercent)) {
    // Dollar cost average down
    placeOrder(currentPrice, 'buy', amount)
    updateAveragePrice()
}
```

---

### 10. 🤖 AI Bot (AIBOT)

**Purpose**: GPT-powered trading decisions

#### AI Integration
```javascript
// Groq API Integration
groqAPI = {
    endpoint: 'https://api.groq.com/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    apiKey: process.env.GROQ_API_KEY
}

// OpenAI API Integration
openaiAPI = {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-turbo',
    apiKey: process.env.OPENAI_API_KEY
}
```

#### Market Analysis Prompt
```javascript
prompt = `
Analyze the following market data and provide trading recommendation:

Symbol: ${symbol}
Current Price: ${currentPrice}
24h Volume: ${volume24h}
RSI (14): ${rsi14}
MACD: ${macd}
Support Levels: ${supportLevels}
Resistance Levels: ${resistanceLevels}

Recent News:
${newsHeadlines}

Provide:
1. Market sentiment (Bullish/Bearish/Neutral)
2. Recommended action (Buy/Sell/Hold)
3. Entry price
4. Target price
5. Stop loss
6. Confidence level (0-100%)
7. Reasoning

Format response as JSON.
`

// Get AI response
aiResponse = await fetchAI(prompt)

// Parse recommendation
recommendation = JSON.parse(aiResponse)
```

#### Grid Advisor Feature
```javascript
// AI analyzes current balance and market
analyzeForGridStrategy(balance, currentPrice, volatility)

// AI suggests optimal grid configuration
aiSuggestion = {
    lowerPrice: Number,
    upperPrice: Number,
    nrOfGrids: Number,
    amount: Number,
    ordersSide: 'buyOrSell' | 'buyOnly' | 'sellOnly',
    reasoning: String,
    expectedProfit: Number,
    riskLevel: 'Low' | 'Medium' | 'High'
}
```

---

### 11. 📖 Order Book Bot (OrderBookBot)

**Purpose**: Trade based on order book depth analysis

#### Order Book Analysis
```javascript
// Analyze bid/ask walls
analyzeOrderBook(orderBook) {
    // Find large walls
    bidWalls = findWalls(orderBook.bids, threshold)
    askWalls = findWalls(orderBook.asks, threshold)

    // Calculate imbalance
    bidVolume = sum(orderBook.bids.map(b => b[1]))
    askVolume = sum(orderBook.asks.map(a => a[1]))
    imbalance = (bidVolume - askVolume) / (bidVolume + askVolume)

    // Detect spoofing
    spoofingDetected = detectSpoofing(orderBook)

    return {
        bidWalls,
        askWalls,
        imbalance,
        spoofingDetected,
        recommendation: imbalance > 0.2 ? 'buy' :
                       imbalance < -0.2 ? 'sell' : 'neutral'
    }
}
```

#### Wall Detection
```javascript
findWalls(orders, threshold) {
    walls = []

    for (let i = 0; i < orders.length; i++) {
        [price, amount] = orders[i]

        // Check if amount is significantly larger
        avgAmount = calculateAverage(orders, 10)

        if (amount > avgAmount * threshold) {
            walls.push({
                price,
                amount,
                percentOfTotal: amount / totalVolume
            })
        }
    }

    return walls
}
```

---

### 12. 📅 1 Year Bot (1YearBot)

**Purpose**: Long-term macro strategy

#### Long-term Accumulation
```javascript
// Calculate yearly DCA schedule
schedule = {
    frequency: 'weekly' | 'monthly',
    amount: totalCapital / periods,
    startDate: now,
    endDate: now + 365 days
}

// Execute scheduled buys
for (period of schedule) {
    if (isTimeToExecute(period)) {
        // Buy regardless of price
        placeOrder('market', 'buy', period.amount)

        // Track cost basis
        updateCostBasis(period.amount, currentPrice)
    }
}
```

#### Rebalancing Strategy
```javascript
// Quarterly rebalancing
if (isQuarterEnd()) {
    currentAllocation = calculateAllocation()
    targetAllocation = getTargetAllocation()

    // Rebalance if deviation > threshold
    if (deviation > 0.05) {  // 5% threshold
        rebalance(currentAllocation, targetAllocation)
    }
}
```

---

## 💾 Database Schemas

### Common Fields (All Bots)
```javascript
{
    _id: ObjectId,
    userID: String,
    name: String,
    exchange: String,
    symbol: String,
    status: 'active' | 'stopped' | 'completed' | 'error',
    createdAt: Date,
    updatedAt: Date,
    startedAt: Date,
    stoppedAt: Date,

    // API Key Management
    apiKeyName: String,        // Legacy: Single key
    apiKeyNames: [String],     // NEW: Multiple keys

    // Orders
    activeOrders: [{
        id: String,
        price: Number,
        side: 'buy' | 'sell',
        amount: Number,
        filled: Number,
        remaining: Number,
        status: String
    }],

    filledOrders: [{
        id: String,
        price: Number,
        side: 'buy' | 'sell',
        amount: Number,
        timestamp: Date,
        fee: Number
    }],

    // Balance tracking
    balanceSnapshot: {
        baseFree: Number,
        baseTotal: Number,
        quoteFree: Number,
        quoteTotal: Number,
        timestamp: Date
    },

    balanceInOrders: {
        baseInOrders: Number,
        quoteInOrders: Number,
        baseInOrdersUSD: Number,
        quoteInOrdersUSD: Number,
        totalBalanceInUSD: Number
    }
}
```

### Grid Bot Schema Extensions
```javascript
{
    lowerPrice: Number,
    upperPrice: Number,
    nrOfGrids: Number,
    amount: Number,
    amountType: 'quantityPerGrid' | 'totalAmount' | 'incrementalPercent',
    ordersSide: 'buyOrSell' | 'buyOnly' | 'sellOnly',
    incrementalPercentAmountBuy: Number,
    incrementalPercentAmountSell: Number,

    // Performance metrics
    totalProfit: Number,
    totalTrades: Number,
    winRate: Number,
    averageProfit: Number
}
```

### Smart DCA Bot Schema Extensions
```javascript
{
    side: 'buy' | 'sell',
    amountPerInterval: Number,
    dcaInterval: String,  // '1m', '5m', '15m', etc.
    totalDuration: Number,  // hours, 0 = infinite

    // Indicators
    enableRSI: Boolean,
    rsiTimeframe: String,
    rsiPeriod: Number,
    rsiOversold: Number,
    rsiOverbought: Number,

    enableMACD: Boolean,
    macdTimeframe: String,
    macdFast: Number,
    macdSlow: Number,
    macdSignal: Number,

    executionMode: 'scheduled' | 'smart',

    // Initial conditions
    startingPrice: Number,
    initialRSI: {
        '1m': Number,
        '5m': Number,
        '15m': Number,
        '30m': Number,
        '1h': Number,
        '2h': Number,
        '6h': Number,
        '1d': Number
    },
    initialMACD: {
        '1m': { macd: Number, signal: Number, histogram: Number },
        // ... other timeframes
    },

    // Execution tracking
    executionCount: Number,
    lastExecutionAt: Date,
    nextRun: Date,

    executionHistory: [{
        timestamp: Date,
        side: String,
        price: Number,
        amount: Number,
        cost: Number,
        fee: Number,
        rsi: Number,
        macd: Object,
        executed: Boolean,
        orderId: String
    }],

    // Performance
    totalSpent: Number,
    totalReceived: Number,
    totalBase: Number,
    totalFees: Number,
    averagePrice: Number,

    // RSI/MACD History
    rsiHistory: [{
        timestamp: Date,
        timeframe: String,
        value: Number
    }],

    macdHistory: [{
        timestamp: Date,
        timeframe: String,
        macd: Number,
        signal: Number,
        histogram: Number
    }]
}
```

---

## 🔌 API Integration

### CCXT Wrapper (ccxtw.js)

#### Multi-Key Support
```javascript
// Fetch balance with specific API key
fetchBalance(userID, exchange, apiKeyName) {
    ccxt = initializeCCXT(exchange, apiKeyName)
    balance = await ccxt.fetchBalance()
    return balance
}

// Create order with specific API key
createOrder(userID, exchange, symbol, type, side, amount, price, apiKeyName) {
    ccxt = initializeCCXT(exchange, apiKeyName)
    order = await ccxt.createOrder(symbol, type, side, amount, price)
    return order
}
```

#### Rate Limiting
```javascript
// Coinbase Advanced: 30 req/sec burst, 25 req/sec sustained
rateLimiter = {
    coinbaseadvanced: {
        maxBurst: 30,
        sustained: 25,
        window: 1000,  // 1 second
        delay: 2000    // 2 sec between API key switches
    }
}
```

#### Error Handling
```javascript
try {
    order = await ccxt.createOrder(...)
    return { success: true, data: order }
} catch (error) {
    if (error instanceof ccxt.InsufficientFunds) {
        return { success: false, error: 'Insufficient balance', code: 'INSUFFICIENT_FUNDS' }
    }
    if (error instanceof ccxt.InvalidOrder) {
        return { success: false, error: 'Invalid order', code: 'INVALID_ORDER' }
    }
    if (error instanceof ccxt.RateLimitExceeded) {
        await delay(rateLimiter.delay)
        return retry(createOrder)
    }

    return { success: false, error: error.message, code: 'UNKNOWN_ERROR' }
}
```

---

## ⚙️ Execution Engine

### Smart DCA Scheduler (smartDcaScheduler.js)

#### Cron Job Execution
```javascript
// Check every minute
schedule('*/1 * * * *', async () => {
    activeBots = await fetchActiveBots()

    for (bot of activeBots) {
        if (isTimeToExecute(bot)) {
            await executeDCA(bot)
        }
    }
})
```

#### Execution Decision
```javascript
async function executeDCA(bot) {
    // Fetch current indicators
    currentRSI = await fetchRSI(bot.symbol, bot.rsiTimeframe)
    currentMACD = await fetchMACD(bot.symbol, bot.macdTimeframe)
    currentPrice = await fetchPrice(bot.symbol)

    // Check execution mode
    if (bot.executionMode === 'scheduled') {
        // Always execute
        shouldExecute = true
    }

    if (bot.executionMode === 'smart') {
        // Check conditions
        shouldExecute = checkConditions(bot, currentRSI, currentMACD)
    }

    if (shouldExecute) {
        // Execute trade
        order = await placeOrder(bot.side, bot.amountPerInterval, currentPrice)

        // Update bot
        bot.executionCount++
        bot.lastExecutionAt = now
        bot.nextRun = calculateNextRun(bot.dcaInterval)
        bot.executionHistory.push({
            timestamp: now,
            side: bot.side,
            price: currentPrice,
            amount: order.amount,
            rsi: currentRSI,
            macd: currentMACD,
            executed: true,
            orderId: order.id
        })

        // Update stats
        if (bot.side === 'buy') {
            bot.totalSpent += order.cost
            bot.totalBase += order.amount
        } else {
            bot.totalReceived += order.cost
        }
        bot.totalFees += order.fee

        // Save history
        bot.rsiHistory.push({
            timestamp: now,
            timeframe: bot.rsiTimeframe,
            value: currentRSI
        })

        bot.macdHistory.push({
            timestamp: now,
            timeframe: bot.macdTimeframe,
            ...currentMACD
        })

        await bot.save()
    } else {
        // Log skip
        console.log(`⏭️ Skipping execution for ${bot.name} - Conditions not met`)

        // Still log the attempt
        bot.executionHistory.push({
            timestamp: now,
            rsi: currentRSI,
            macd: currentMACD,
            executed: false
        })

        bot.nextRun = calculateNextRun(bot.dcaInterval)
        await bot.save()
    }
}
```

#### Condition Checking
```javascript
function checkConditions(bot, currentRSI, currentMACD) {
    let conditionsMet = true

    if (bot.enableRSI) {
        if (bot.side === 'buy') {
            // Buy when oversold
            conditionsMet = conditionsMet && (currentRSI < bot.rsiOversold)
        } else {
            // Sell when overbought
            conditionsMet = conditionsMet && (currentRSI > bot.rsiOverbought)
        }
    }

    if (bot.enableMACD) {
        if (bot.side === 'buy') {
            // Buy on bullish crossover
            conditionsMet = conditionsMet && (currentMACD.histogram > 0)
        } else {
            // Sell on bearish crossover
            conditionsMet = conditionsMet && (currentMACD.histogram < 0)
        }
    }

    return conditionsMet
}
```

---

## 🎯 Best Practices

### 1. Multi-API Key Configuration

**Why use multiple API keys?**
- Distribute orders across keys to avoid rate limits
- Increase total order capacity
- Better for high-frequency strategies

**How to configure:**
```javascript
// In sidebar/navbar: Select multiple API keys
selectedApiKeys = ['API_Key_1', 'API_Key_2', 'API_Key_3']

// Bot will use all selected keys
createBot({
    apiKeyNames: selectedApiKeys,
    // ... other params
})
```

### 2. Grid Bot Optimization

**Tight Grids (High Frequency)**
```javascript
{
    nrOfGrids: 20-50,
    lowerPrice: currentPrice * 0.98,  // 2% below
    upperPrice: currentPrice * 1.02,  // 2% above
    amountType: 'quantityPerGrid',
    ordersSide: 'buyOrSell'
}
```

**Wide Grids (Swing Trading)**
```javascript
{
    nrOfGrids: 5-10,
    lowerPrice: currentPrice * 0.90,  // 10% below
    upperPrice: currentPrice * 1.10,  // 10% above
    amountType: 'totalAmount',
    ordersSide: 'buyOrSell'
}
```

### 3. Smart DCA Configuration

**Conservative (Long-term)**
```javascript
{
    side: 'buy',
    amountPerInterval: 100,  // $100 per interval
    dcaInterval: '1d',       // Daily
    totalDuration: 8760,     // 1 year (365 days * 24 hours)
    executionMode: 'smart',
    enableRSI: true,
    rsiOversold: 30,
    enableMACD: true
}
```

**Aggressive (Short-term)**
```javascript
{
    side: 'buy',
    amountPerInterval: 50,
    dcaInterval: '15m',      // Every 15 minutes
    totalDuration: 24,       // 1 day
    executionMode: 'smart',
    enableRSI: true,
    rsiOversold: 40,         // Less strict
    enableMACD: false
}
```

### 4. Risk Management

**Position Sizing**
```javascript
// Never risk more than 5% per bot
maxRiskPerBot = totalCapital * 0.05

// Total bots allocation: 25% max
totalBotsAllocation = totalCapital * 0.25

// Remaining 75% in cold storage
coldStorage = totalCapital * 0.75
```

**Stop Loss Implementation**
```javascript
// Monitor bot performance
if (bot.totalProfit < (bot.totalInvested * -0.10)) {
    // 10% loss: Stop bot
    stopBot(bot._id)
    notifyUser(`Bot ${bot.name} stopped due to 10% loss`)
}
```

### 5. Performance Monitoring

**Key Metrics to Track**
```javascript
metrics = {
    // Profitability
    totalProfit: Number,
    roi: (totalProfit / totalInvested) * 100,
    winRate: (winningTrades / totalTrades) * 100,

    // Efficiency
    averageTradeTime: Number,
    tradesPerDay: Number,
    fillRate: (filledOrders / totalOrders) * 100,

    // Risk
    maxDrawdown: Number,
    sharpeRatio: Number,
    volatility: Number
}
```

### 6. Exchange-Specific Optimizations

**Coinbase Advanced**
```javascript
// Ultra-fast execution
rateLimit = {
    burst: 30,
    sustained: 25,
    delay: 2000  // Between API key switches
}

// Batch orders when possible
batchSize = 10
```

**LCX Exchange**
```javascript
// Use custom CCXT fork
ccxt: 'github:LCX-AG/ccxt'

// Lower rate limits
rateLimit = {
    burst: 10,
    sustained: 8
}
```

### 7. Indicator Optimization

**RSI Settings**
```javascript
// Scalping (Fast response)
rsiPeriod = 7
rsiTimeframe = '5m'
rsiOversold = 40
rsiOverbought = 60

// Swing Trading (Smoother)
rsiPeriod = 14
rsiTimeframe = '1h'
rsiOversold = 30
rsiOverbought = 70

// Long-term (Very smooth)
rsiPeriod = 21
rsiTimeframe = '1d'
rsiOversold = 25
rsiOverbought = 75
```

**MACD Settings**
```javascript
// Fast (Scalping)
macdFast = 8
macdSlow = 17
macdSignal = 9
macdTimeframe = '5m'

// Standard (Most common)
macdFast = 12
macdSlow = 26
macdSignal = 9
macdTimeframe = '1h'

// Slow (Long-term)
macdFast = 19
macdSlow = 39
macdSignal = 9
macdTimeframe = '1d'
```

---

## 🔐 Security Considerations

### API Key Management
```javascript
// NEVER store API keys in code
apiKeys = {
    key: process.env.EXCHANGE_API_KEY,
    secret: process.env.EXCHANGE_API_SECRET,
    passphrase: process.env.EXCHANGE_PASSPHRASE
}

// Encrypt in database
encryptedKey = encrypt(apiKey, masterKey)
```

### Order Validation
```javascript
// Validate before placing order
function validateOrder(order) {
    // Check balance
    if (order.cost > availableBalance) {
        throw new Error('Insufficient balance')
    }

    // Check minimum order size
    if (order.amount < minOrderSize) {
        throw new Error('Order too small')
    }

    // Check price limits
    if (order.price < minPrice || order.price > maxPrice) {
        throw new Error('Price out of range')
    }

    return true
}
```

---

## 📊 Monitoring & Logging

### Structured Logging
```javascript
// Console colors for better readability
colors = {
    buy: '\x1b[32m',   // Green
    sell: '\x1b[31m',  // Red
    info: '\x1b[33m',  // Yellow
    error: '\x1b[41m', // Red background
    reset: '\x1b[37m'  // White
}

// Log format
console.log(`▶️ ${colors.info}${exchange}${colors.reset} ${colors.buy}${symbol}${colors.reset} --> ${colors.buy}BUY${colors.reset} ${amount} @ ${price}`)
```

### Performance Tracking
```javascript
// Log execution time
startTime = Date.now()
await executeBot()
executionTime = Date.now() - startTime

console.log(`⏱️ Execution time: ${executionTime}ms`)
```

---

## 🚀 Deployment Checklist

- [ ] MongoDB connection configured
- [ ] Exchange API keys added
- [ ] Rate limits configured per exchange
- [ ] Environment variables set
- [ ] Cron jobs scheduled (Smart DCA)
- [ ] Monitoring dashboard active
- [ ] Backup system in place
- [ ] Error notification system configured
- [ ] Test bots on testnet first
- [ ] Review security settings
- [ ] Document custom configurations

---

## 📚 Additional Resources

- **CCXT Documentation**: https://docs.ccxt.com
- **Technical Indicators**: https://github.com/anandanand84/technicalindicators
- **Mathjs Documentation**: https://mathjs.org/docs/
- **MongoDB Mongoose**: https://mongoosejs.com/docs/
- **Nuxt 3 Server API**: https://nuxt.com/docs/guide/directory-structure/server

---

## 🤝 Support & Contribution

For technical questions or contributions:
- Check bot performance in "Bots Analysis" page
- Monitor execution history and logs
- Adjust parameters based on market conditions
- Share successful strategies with the community

**Happy Trading! 🚀💰**
