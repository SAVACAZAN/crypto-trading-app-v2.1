# Crypto Trading Application

A comprehensive cryptocurrency trading platform built with Nuxt 3, supporting multiple exchanges including Coinbase Advanced, Kraken, Bitrue, LCX, and ProBit.

## Features

- 🔐 **Multi-Exchange Support**: Manage API keys and trade across multiple exchanges
- 📊 **Real-time Balance Tracking**: View balances across all exchanges in real-time
- 🤖 **DCA Bots**: Automated Dollar Cost Averaging trading bots
- 📈 **Trading Strategies**: Multiple built-in strategies with backtesting
- 💹 **Portfolio Management**: Track and manage your crypto portfolio
- 🎰 **Casino Features**: Betting, staking, rewards, and jackpot system
- 📉 **Advanced Charts**: Lightweight charts integration for market analysis

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, Naive UI
- **Backend**: Nuxt Server API Routes
- **Database**: MongoDB with Mongoose
- **Charts**: Chart.js, Lightweight Charts
- **Exchange Integration**: CCXT v4
- **Trading Indicators**: technicalindicators, @debut/indicators
- **Machine Learning**: TensorFlow.js
- **State Management**: Pinia with persistence

## Prerequisites

- Node.js 16+
- MongoDB running locally or remote connection
- Exchange API keys (optional, for trading features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure MongoDB connection in `nuxt.config.ts`:
```typescript
mongoose: {
  uri: 'mongodb://127.0.0.1:27017/crypto-app-V1',
  options: {},
  modelsDir: 'models',
}
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── pages/                  # Vue pages
│   ├── dashboard.vue       # Main dashboard with balances
│   ├── profile.vue         # API key management
│   ├── trade.vue          # Trading interface
│   ├── dca-bots.vue       # DCA bot management
│   └── back-testing.vue   # Strategy backtesting
├── components/            # Vue components
├── server/               # Nuxt server
│   ├── api/v1/          # API endpoints
│   ├── models/          # Mongoose schemas
│   └── plugins/         # Server plugins (CCXT wrapper)
├── strategies/          # Trading strategies
├── composables/         # Vue composables
└── stores/             # Pinia stores
```

## Available Exchanges

- **Coinbase Advanced Trade**
- **Kraken**
- **Bitrue**
- **LCX**
- **ProBit**

## API Key Management

1. Navigate to the Profile page
2. Select an exchange from the dropdown
3. Enter API key name and credentials
4. API keys are stored securely in MongoDB
5. Each user can have multiple API keys per exchange

## Security Notes

- Never commit `.env` files or API keys to version control
- API keys are stored in the database (ensure MongoDB is secured)
- Use environment variables for sensitive configuration
- This is a private repository - keep it that way

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

Private - All Rights Reserved

## Support

For issues or questions, please contact the repository owner.
