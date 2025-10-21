<template>
  <div class="gridbotsplus-page">
    <!-- Main Content with Sidebar -->
    <div class="content-wrapper">
      <!-- Sidebar: Grid Bot Form -->
      <div class="sidebar-form">
        <GridBotsFormPlus/>
      </div>

      <!-- Main Area: Bots List Only -->
      <div class="main-area">
        <GridBotsList/>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>

<style scoped>
.gridbotsplus-page {
  padding: 8px;
  width: 100%;
  min-height: 100vh;
  background: #0f1419;
  font-size: 12px;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  gap: 8px;
  height: calc(100vh - 16px);
}

/* Sidebar Form (left, compact) */
.sidebar-form {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Main Area (right, takes remaining space) */
.main-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Scrollbar Styling */
.sidebar-form::-webkit-scrollbar,
.main-area::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar-form::-webkit-scrollbar-thumb,
.main-area::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

.sidebar-form::-webkit-scrollbar-track,
.main-area::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .sidebar-form {
    width: 260px;
  }
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar-form {
    width: 100%;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .gridbotsplus-page {
    padding: 4px;
  }

  .content-wrapper {
    gap: 6px;
  }
}
</style>
