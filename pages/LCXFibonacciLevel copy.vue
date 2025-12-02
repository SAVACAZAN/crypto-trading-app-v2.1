<template>
  <div class="fib-container">
    <h2>BTC ↔ LCX Fibonacci Analyzer</h2>

    <div class="fib-info">
      <p>LCX price (USD): ${{ lcxPriceUsd }}</p>
      <p>BTC price (USD): ${{ btcUsd }}</p>
      <p>LCX in BTC: {{ lcxInBtc.toFixed(10) }}</p>
      <p>BTC in LCX: {{ btcInLcx.toFixed(2) }}</p>
    </div>

    <table class="fib-table">
      <thead>
        <tr>
          <th>#</th>
          <th>BTC</th>
          <th>USD</th>
          <th>LCX</th>
          <th>Multiplier</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(lvl, index) in enrichedBtcLevels" :key="index">
          <td>{{ lvl.index }}</td>
          <td>{{ lvl.btc }}</td>
          <td>${{ lvl.usd }}</td>
          <td>{{ lvl.lcx }}</td>
          <td>{{ lvl.multiplier }}</td>
        </tr>
      </tbody>
    </table>

    <div class="fib-section">
      <h3>Fibonacci Levels (USD)</h3>
      <ul>
        <li v-for="(f, i) in fibLevels" :key="i">
          Ratio: {{ f.ratio }} → ${{ f.price }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "FibonacciAnalyzer",

  data() {
    const start = 0.0000001;
    const end = 0.00001;
    const steps = 100;

    // raport constant între valori
    const factor = Math.pow(end / start, 1 / (steps - 1));

    const btcLevels = Array.from({ length: steps }, (_, i) => {
      const btcPrice = start * Math.pow(factor, i);
      return {
        btcPrice: parseFloat(btcPrice.toFixed(10)),
        label: btcPrice.toFixed(10),
      };
    });

    return {
      // valori de bază
      lcxPriceUsd: 0.1108,
      btcUsd: 112000,
      btcLevels,
    };
  },

  computed: {
    // conversii simple
    lcxInBtc() {
      return this.lcxPriceUsd / this.btcUsd;
    },
    btcInLcx() {
      return this.btcUsd * this.lcxPriceUsd;
    },

    // niveluri Fibonacci clasice
    fibLevels() {
      const base = this.lcxPriceUsd;
      const fibs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 4.236];
      return fibs.map((ratio) => ({
        ratio,
        price: parseFloat((base * ratio).toFixed(6)),
      }));
    },

    // BTC → USD → LCX + multiplicator
    enrichedBtcLevels() {
      return this.btcLevels.map((lvl, idx) => {
        const usdValue = lvl.btcPrice * this.btcUsd;
        const lcxEquivalent = usdValue / this.lcxPriceUsd;
        return {
          index: idx + 1,
          btc: lvl.btcPrice.toFixed(10),
          usd: usdValue.toFixed(6),
          lcx: lcxEquivalent.toFixed(2),
          multiplier: (lcxEquivalent / 1).toFixed(2) + "x",
        };
      });
    },
  },
};
</script>

<style scoped>
.fib-container {
  font-family: Arial, sans-serif;
  background: #111;
  color: #eee;
  padding: 20px;
  border-radius: 16px;
  max-width: 900px;
  margin: auto;
}

h2 {
  text-align: center;
  color: #ffcc00;
  margin-bottom: 20px;
}

.fib-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background: #222;
  padding: 10px;
  border-radius: 8px;
}

.fib-table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.fib-table th, .fib-table td {
  padding: 6px 8px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.fib-table th {
  background: #333;
  color: #ffcc00;
}

.fib-section {
  margin-top: 20px;
  background: #222;
  padding: 10px;
  border-radius: 8px;
}

.fib-section h3 {
  color: #ffcc00;
  margin-bottom: 10px;
}
</style>
