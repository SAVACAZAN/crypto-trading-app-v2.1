<template>
  <n-space vertical>
    <n-layout>
      <n-layout-header bordered class="header">
        <n-space justify="space-between" align="center" class="inner">
          <nuxt-link to="/"><n-text><b>Crypto App</b></n-text></nuxt-link>
        </n-space>
      </n-layout-header>
      <n-layout class="container">
        <n-layout class="content">
          <slot></slot>
        </n-layout>
      </n-layout>
      <n-layout-footer bordered class="footer">
        Crypto App - 2023
      </n-layout-footer>
    </n-layout>
  </n-space>
</template>

<script setup>
import NuxtLink from "#app/components/nuxt-link";
import { h } from "vue";
import { NIcon } from "naive-ui";
import {
  BookOutline as BookIcon,
  PersonCircleOutline as UserIcon,
  LogOutOutline as LogoutIcon
} from "@vicons/ionicons5";

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const dropdownOptions = [
  {
    label: () =>
        h(
            NuxtLink,
            {
              to: {
                name: 'profile',
              }
            },
            { default: () => 'Profile' }
        ),
    key: 'profile',
    icon: renderIcon(UserIcon)
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(LogoutIcon)
  }
];

</script>

