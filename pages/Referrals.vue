<template>
  <n-space vertical>
    <n-layout>
      <n-layout-header bordered class="header">
        <n-space justify="space-between" align="center" class="inner">
          <n-text>User Information</n-text>
          <n-space vertical>
            <!-- Display basic user information -->
            <n-text>userID: {{ userData.userID }}</n-text>
            <n-text>Referral Code: {{ userData.referralCode }}</n-text>
            <n-text>Referred By: {{ userData.referredBy }}</n-text>
          </n-space>
        </n-space>
      </n-layout-header>

      <n-layout-footer bordered class="footer">
        Crypto App - 2023
      </n-layout-footer>
    </n-layout>
  </n-space>
</template>

<script setup>
import { ref } from 'vue';
import { useCookie } from '#app'; // Ensure you have this import

// Initializing userData with cookie values
const userData = ref({
  userID: useCookie('userID').value,  // Assuming you're using cookies to get this data
  referralCode: useCookie('referralCode').value,
  referredBy: useCookie('referredBy').value,
});

// Log the userData object to the console
console.log('User Data:', userData.value);
</script>
