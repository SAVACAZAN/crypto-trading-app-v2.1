<template>
  <div>
   <h2>User Information</h2>
   <n-card v-if="userInfo">
     <span>UserID: {{ userInfo.userID }}</span>
     <span>Username: {{ userInfo.username }}</span>
     <span>Referral Code: {{ userInfo.referralCode }}</span>
     <!-- Alte detalii despre utilizator -->
   </n-card>
   <p v-else>Loading user information...</p>
 </div>

  
<TickerBar/>

     <n-card>
       <span>Avlb: {{ baseBalance }}</span>
       <span>Avlb: {{ quoteBalance }}</span>
     </n-card>
  
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import { useAppStore } from '~/stores/app.store';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
const app = useAppStore();

let userID = useCookie('userID');
let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);
let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let baseBalance = ref('Loading...');
let quoteBalance = ref('Loading...');

let userBalanceInterval = null;

onMounted(() => {
 userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
});

onUnmounted(() => {
 clearIntervalAsync(userBalanceInterval);
});

async function fetchUserBalancePooling() {
 try {
   const response = await $fetch('/api/v1/fetchBalance', {
     query: {
       userID: userID.value,
       exchange: currentExchange.value,
     },
   });

   if (response.data) {
     if (response.data[base]) {
       quoteBalance.value = `${response.data[base].free}`;
     } else {
       quoteBalance.value = `${response.data[quote].free}`;
     }
   } else {
     quoteBalance.value = 'N/A';
   }

   if (response.data) {
     if (response.data[quote]) {
       baseBalance.value = `${response.data[quote].free}`;
     }
   } else {
     baseBalance.value = 'N/A';
   }
 } catch (error) {
   console.error('Error fetching user balance:', error);
   notification.error({
     title: 'Error',
     message: 'Failed to fetch user balance.',
   });
 }
}

async function fetchUserInfo() {
 try {
   const response = await $fetch('/api/v1/fetchUserInfo', {
     query: {
       userID: userID.value,
       username: userID.value, // Assuming username is the same as userID
       referralCode: referralCode.value,
     },
   });

   if (response.data && response.data.length > 0) { // Assuming response is an array of user data
     userInfo.value = response.data[0]; // Assuming response contains only one user data object
   } else {
     console.error('No user data found.');
   }
 } catch (error) {
   console.error('Error fetching user info:', error);
   notification.error({
     title: 'Error',
     message: 'Failed to fetch user info.',
   });
 }
}
fetchUserInfo(); 

</script>

<style scoped>
/* Stilizează componenta conform nevoilor tale */
</style>
