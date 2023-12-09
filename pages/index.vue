<template>
  <n-card style="width:300px; margin:60px auto; align-items:center">

    <n-space>
      <nuxt-link to="/login">
        <n-button>Login</n-button>
      </nuxt-link>
      <nuxt-link to="/register">
        <n-button>Register</n-button>
      </nuxt-link>
    </n-space>

  </n-card>
</template>

<script setup>
import NuxtLink from "#app/components/nuxt-link";

definePageMeta({
    layout: "no-sidebar",
});
</script>
