<template>
  <bet-casino-crypto/>
</template>


<script setup>
definePageMeta({
middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>


<style scoped>
h1 {
  background-color: #0c01a5;
  color: #fff;
  padding: 20px;
  text-align: center;
  font-size: 24px;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.button {
  background-color: #ff5733; /* Culoarea butoanelor (portocaliu) */
  color: #fff;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #ff331a; /* Culoarea butoanelor la hover (portocaliu mai închis) */
}
</style>
