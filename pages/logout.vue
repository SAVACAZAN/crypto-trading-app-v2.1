<template>
  <h3>Logging out...</h3>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const notification = useNotification();
let userIDCookie = useCookie('userID');

onMounted(async () => {
  userIDCookie.value = ''; // Set the cookie value to an empty string
  userIDCookie.options = { expires: new Date(0) }; // Set the expiration date to a past date

  notification['info']({
    content: "User Logged Out!",
    meta: `The user has been logged out! You will be redirected in a moment!`,
    duration: 2500,
  });

  setTimeout(async () => {
    await navigateTo('/')
  }, 1000)
})
</script>
