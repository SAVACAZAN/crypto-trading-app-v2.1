<template>
  <n-layout>
    <n-layout class="content">
      <slot></slot>
    </n-layout>
  </n-layout>
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

