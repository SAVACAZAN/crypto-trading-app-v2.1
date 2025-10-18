<template>
     <n-card>
        <span>Avlb: {{ baseBalance }}</span>
        <span>Avlb: {{ quoteBalance }}</span>
      </n-card>

      <div>
    <h2>User Information</h2>
    <div v-if="userInfo">
      <p>User ID: {{ userInfo.userID }}</p>
      <p>Username: {{ userInfo.username }}</p>
      <p>Referral Code: {{ userInfo.referralCode }}</p>
      <p>Referred By: {{ userInfo.referredBy }}</p>
      <!-- Display other user info as needed -->
    </div>
    <p v-else>Loading user information...</p>
  </div>
  


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
const userInfo = ref(null);
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
        username:  username.value,
        referralCode:  referralCode.value,
        referredBy: referredBy.value,
      },
    });

    if (response.data) {
      userInfo.value = {
        userID: response.data.userID,
        username: response.data.username,
        referralCode: response.data.referralCode,
        referredBy: response.data.referredBy,
        // Include other fields as necessary
      };
    } else {
      console.error('User info not found');
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    notification.error({
      title: 'Error',
      message: 'Failed to fetch user info.',
    });
  }
}

// Fetch user info when component mounts
onMounted(fetchUserInfo);
</script>

<style scoped>
/* Stilizează componenta conform nevoilor tale */
</style>
