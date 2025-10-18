<template>
  <div class="order-form">
    <h2>Place a Limit Order on LCX</h2>
    <form @submit.prevent="handleSubmit">
      <label>
        Symbol:
        <select v-model="symbol" required>
          <option disabled value="">Select a Symbol</option>
          <option v-for="symbol in symbols" :key="symbol" :value="symbol">
            {{ symbol }}
          </option>
        </select>
      </label>

      <label>
        Amount:
        <input v-model.number="amount" type="number" placeholder="Order Amount" required />
      </label>

      <label>
        Price:
        <input v-model.number="price" type="number" placeholder="Order Price" required />
      </label>

      <button type="button" @click="handleOrder('BUY')">Buy</button>
      <button type="button" @click="handleOrder('SELL')">Sell</button>
    </form>

    <div v-if="orderResult">
      <h3>Order Result:</h3>
      <pre>{{ orderResult }}</pre>
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const symbol = ref('');
    const symbols = ref([]);
    const amount = ref(null);
    const price = ref(null);
    const orderResult = ref(null);
    const errorMessage = ref(null);

    const fetchSymbols = async () => {
      try {
        const data = await $fetch('/filteredTickerData.json');
        symbols.value = data.map((ticker) => ticker.symbol);
      } catch (error) {
        errorMessage.value = 'Failed to load symbols: ' + error.message;
      }
    };

    const handleOrder = async (side) => {
      try {
        errorMessage.value = null;
        orderResult.value = null;

        const data = {
          Pair: symbol.value,
          Amount: amount.value,
          Price: price.value,
          OrderType: 'LIMIT',
          Side: side,
        };

        // Call the server API route instead of the LCX API directly
        const response = await $fetch('/api/v1/lcx/createOrder', {
          method: 'POST',
          body: data,
        });

        if (response.error) {
          throw new Error(response.message);
        }

        orderResult.value = response;
      } catch (error) {
        errorMessage.value = 'Error placing order: ' + error.message;
      }
    };

    onMounted(() => {
      fetchSymbols();
    });

    return {
      symbol,
      symbols,
      amount,
      price,
      orderResult,
      errorMessage,
      handleOrder,
    };
  },
};
</script>

<style scoped>
/* Add any necessary styles */
</style>
