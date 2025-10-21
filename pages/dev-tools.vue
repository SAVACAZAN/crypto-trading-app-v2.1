<template>
    <div style="padding: 20px;">
      <h1>Developer Tools</h1>
      <p style="color: #888; margin-bottom: 30px;">Manage and delete bot data from the database</p>

      <n-card title="Delete Bot Data" style="margin-bottom: 20px;">
        <n-space vertical :size="16">
          <div>
            <h3 style="margin-bottom: 12px;">Trading Bots</h3>
            <n-space wrap>
              <n-button type="error" @click="deleteDBGridBotsData">
                Delete Grid Bots
              </n-button>
              <n-button type="error" @click="deleteDBDCABotsData">
                Delete DCA Bots
              </n-button>
              <n-button type="error" @click="deleteDBOneClickBotsData">
                Delete OneClick Bots
              </n-button>
              <n-button type="error" @click="deleteDBCoPilotBotsData">
                Delete CoPilot Bots
              </n-button>
              <n-button type="error" @click="deleteDBGrinderBotsData">
                Delete Grinder Bots
              </n-button>
              <n-button type="error" @click="deleteDBScalp1ngBotsData">
                Delete Scalp1ng Bots
              </n-button>
              <n-button type="error" @click="deleteDBFibBotsData">
                Delete Fib Bots
              </n-button>
            </n-space>
          </div>

          <n-divider />

          <div>
            <h3 style="margin-bottom: 12px;">Advanced Bots</h3>
            <n-space wrap>
              <n-button type="error" @click="deleteDBdkdBotsData">
                Delete DKD Bots
              </n-button>
              <n-button type="error" @click="deleteDBFrontRunBotsData">
                Delete FrontRun Bots
              </n-button>
            </n-space>
          </div>
        </n-space>
      </n-card>

      <n-card title="Delete Other Data">
        <n-space wrap>
          <n-button type="warning" @click="deleteDBChartData">
            Delete Chart Data
          </n-button>
        </n-space>
      </n-card>
    </div>
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

async function deleteDBOneClickBotsData() {
  await $fetch('/api/v1/deleteDBOneClickBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all OneClick bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBCoPilotBotsData() {
  await $fetch('/api/v1/deleteDBCoPilotBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all CoPilot bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBGrinderBotsData() {
  await $fetch('/api/v1/deleteDBGrinderBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all Grinder bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBScalp1ngBotsData() {
  await $fetch('/api/v1/deleteDBScalp1ngBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all Scalp1ng bots data from database.`,
    duration: 2500,
  });
}

async function deleteDBFibBotsData() {
  await $fetch('/api/v1/deleteDBFibBotsData');

  notification['info']({
    content: "Data deleted!",
    meta: `Deleted all Fib bots data from database.`,
    duration: 2500,
  });
}

</script>
