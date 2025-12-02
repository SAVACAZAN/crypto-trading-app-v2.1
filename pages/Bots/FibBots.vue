<template>
  <div>
    <h2>Fibonacci Bots</h2>
    <FibBotsForm/>
  </div>
</template>

<script setup>
import FibBotsForm from '~/components/Bots/fib-bots-form.vue';
import { useAppStore } from '~/stores/app.store';
import { onMounted } from 'vue';

definePageMeta({
  middleware: 'auth'
})

const app = useAppStore();
const userID = useCookie('userID');

// Load data in onMounted to avoid blocking page render
onMounted(async () => {
  try {
    console.log('📦 FibBots page: Loading user exchange data...');
    await app.loadUserExchangeData(userID.value);
    console.log('✅ FibBots page: User exchange data loaded');
  } catch (error) {
    console.error('❌ FibBots page: Error loading user exchange data:', error);
  }
});
</script>
