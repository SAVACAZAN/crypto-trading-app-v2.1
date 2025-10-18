<template>
    
    <h2>DELETE bots</h2>

    <n-space>
     
      <n-button @click="deleteDBGridBotsData">Delete DB Grid Bots data</n-button>
      <n-button @click="deleteDBdkdBotsData">Delete DB dkd Bots data</n-button>
      <n-button @click="deleteDBFrontRunBotsData">Delete DB FrontRun Bots data</n-button>
    </n-space>

    <h2>DELETEDATA</h2>
    <n-space>
      <n-button @click="deleteDBChartData">Delete DB chart data</n-button>
   
      <n-button @click="deleteDBDCABotsData">Delete DB DCA Bots data</n-button>
<!--      <n-button>Delete DB User Exchanges and markets data</n-button>-->
<!--      <n-button>Delete ALL DB User Data</n-button>-->
    </n-space>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
let userID = useCookie('userID');
const notification = useNotification();

async function deleteDBChartData() {
  await $fetch('/api/v1/deleteDBChartData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all candles data from database.`,
    duration: 2500,
  });
}

async function deleteDBGridBotsData() {
  await $fetch('/api/v1/deleteDBGridBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all grid bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBDCABotsData() {
  await $fetch('/api/v1/deleteDBDCABotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all dca bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBdkdBotsData() {
  await $fetch('/api/v1/deleteDBdkdBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all dkd bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBFrontRunBotsData() {
  await $fetch('/api/v1/deleteDBFrontRunBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all FrontRun bots data from database.`,
    duration: 2500,
  });
}

</script>
