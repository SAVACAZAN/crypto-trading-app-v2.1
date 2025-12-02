<template>
  <div class="lcx-eth-pyramid-page">
    <LCXtoETHPyramid
      :eth-price="ethPrice"
      :current-price="currentPrice"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '~/stores/app.store'
import LCXtoETHPyramid from '../components/LCXtoETHPyramid.vue'

definePageMeta({
  middleware: 'auth'
})

const appStore = useAppStore()

// ETH price from store (updated every 3 seconds by ticker-bar)
const ethPrice = computed(() => {
  const storePrice = appStore.getEthPrice
  return storePrice ? storePrice.toFixed(2) : "3500.00"
})

// LCX price from store (updated every 3 seconds by ticker-bar)
const currentPrice = computed(() => {
  const storePrice = appStore.getCurrentPrice
  return storePrice ? storePrice.toFixed(4) : "0.1120"
})
</script>

<style scoped>
.lcx-eth-pyramid-page {
  width: 100%;
  height: 100%;
  padding: 8px;
}
</style>
