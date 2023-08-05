<template>
  <n-config-provider :theme="darkTheme">
    <n-notification-provider>
      <n-message-provider>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup lang="ts">

import {darkTheme} from "naive-ui";
</script>

<style>

.header {
  text-align:center;
  display:flex;
  align-items: center;
  padding:20px;

  .inner {
    width:100%;
  }
}

.container {
  height: calc(100vh - 118px);
}

.content {
  padding: 10px 20px;
}

.footer {
  padding:10px;
  text-align:center;
  display:flex;
  align-items: center;
  justify-content: center
}
</style>
