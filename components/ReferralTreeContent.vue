<template>
  <div class="referral-tree-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">🌳 My Referral Network</h1>
        <p class="page-subtitle">5-Tier Multi-Level Marketing System</p>
      </div>
      <div class="header-btns">
        <button @click="updateAllChains" :disabled="isUpdatingChains" class="btn btn-update">
          {{ isUpdatingChains ? '⏳ Updating...' : '🔄 Update Chains' }}
        </button>
        <button @click="refreshTree" :disabled="isLoading" class="btn btn-refresh">
          {{ isLoading ? '⏳ Loading...' : '↻ Refresh' }}
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-summary">
      <div class="stat-box">
        <div class="stat-icon">👥</div>
        <div>
          <p class="stat-label">Total Network</p>
          <h3 class="stat-value">{{ calculateTotalUsers() }}</h3>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon">⭐</div>
        <div>
          <p class="stat-label">Total Points</p>
          <h3 class="stat-value">{{ referralTreeData.pointsBreakdown?.grandTotal?.toFixed(2) || '0.00' }}</h3>
        </div>
      </div>
    </div>

    <!-- Level Cards -->
    <div class="levels-container">
      <div v-for="level in [1, 2, 3, 4, 5]" :key="`level-${level}`" class="level-wrapper">
        <!-- Level Card (Clickable) -->
        <div
          class="level-card"
          :class="{ active: expandedLevels[level] }"
          @click="toggleLevel(level)"
        >
          <div class="level-card-left">
            <div class="level-badge" :class="`badge-${level}`">{{ level }}</div>
            <div>
              <h3 class="level-title">Level {{ level }}</h3>
              <p class="level-subtitle">{{ getLevelPercentage(level) }}% Commission</p>
            </div>
          </div>
          <div class="level-card-right">
            <div class="level-metrics">
              <div>
                <span class="metric-value">{{ referralTreeData.pointsBreakdown[`level${level}`]?.users || 0 }}</span>
                <span class="metric-label">Users</span>
              </div>
              <div>
                <span class="metric-value">{{ referralTreeData.pointsBreakdown[`level${level}`]?.points?.toFixed(2) || '0.00' }}</span>
                <span class="metric-label">Points</span>
              </div>
            </div>
            <div class="expand-arrow" :class="{ rotated: expandedLevels[level] }">▼</div>
          </div>
        </div>

        <!-- Users List (Expandable) -->
        <div v-if="expandedLevels[level]" class="users-list">
          <div v-if="getLevelUsers(level).length > 0">
            <div v-for="user in getLevelUsers(level)" :key="user.userID" class="user-row">
              <div class="user-avatar">
                <img v-if="user.profilePicture" :src="user.profilePicture" />
                <div v-else class="avatar-initials">{{ user.username.charAt(0).toUpperCase() }}</div>
              </div>
              <div class="user-details">
                <p class="user-name">{{ user.username }}</p>
                <p class="user-code">{{ user.referralCode }}</p>
              </div>
              <div class="user-stats">
                <span>⭐ {{ user.activityPoints || 0 }} pts</span>
                <span>📅 {{ formatDate(user.joinedAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-users">
            <p>No users at this level yet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Points Table -->
    <div class="points-table">
      <h2 class="table-title">📊 Points Breakdown</h2>
      <div class="table-content">
        <div class="table-header">
          <div>Level</div>
          <div>Commission</div>
          <div>Users</div>
          <div>Points</div>
        </div>
        <div v-for="level in [1, 2, 3, 4, 5]" :key="`table-${level}`" class="table-row">
          <div>
            <div class="mini-badge" :class="`badge-${level}`">{{ level }}</div>
          </div>
          <div>{{ getLevelPercentage(level) }}%</div>
          <div>{{ referralTreeData.pointsBreakdown[`level${level}`]?.users || 0 }}</div>
          <div class="points-col">{{ referralTreeData.pointsBreakdown[`level${level}`]?.points?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="table-footer">
          <div>Total</div>
          <div>-</div>
          <div>{{ calculateTotalUsers() }}</div>
          <div class="points-col grand">{{ referralTreeData.pointsBreakdown?.grandTotal?.toFixed(2) || '0.00' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCookie } from '#app'

// User data
const userData = ref({
  userID: useCookie('userID').value,
  username: useCookie('username').value,
  referralCode: useCookie('referralCode').value
})

// Referral tree data
const referralTreeData = ref({
  referralTree: [],
  pointsBreakdown: {
    level1: { users: 0, points: 0 },
    level2: { users: 0, points: 0 },
    level3: { users: 0, points: 0 },
    level4: { users: 0, points: 0 },
    level5: { users: 0, points: 0 },
    grandTotal: 0
  }
})

const isLoading = ref(false)
const isUpdatingChains = ref(false)

// Expanded levels
const expandedLevels = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false
})

// Toggle level
const toggleLevel = (level) => {
  expandedLevels.value[level] = !expandedLevels.value[level]
}

// Get users at level
const getLevelUsers = (level) => {
  const users = []

  const collect = (nodes) => {
    if (!nodes) return
    for (const node of nodes) {
      if (node.level === level) users.push(node)
      if (node.children) collect(node.children)
    }
  }

  collect(referralTreeData.value.referralTree)
  return users
}

// Get level percentage
const getLevelPercentage = (level) => {
  const percentages = { 1: 25, 2: 15, 3: 10, 4: 5, 5: 2 }
  return percentages[level]
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Fetch tree
const fetchReferralTree = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/v1/calculateReferralTree', {
      query: { userID: userData.value.userID }
    })

    if (response.success) {
      referralTreeData.value.referralTree = response.data.referralTree || []
      referralTreeData.value.pointsBreakdown = response.data.pointsBreakdown
    }
  } catch (error) {
    console.error('Error loading tree:', error)
  } finally {
    isLoading.value = false
  }
}

// Update chains
const updateAllChains = async () => {
  isUpdatingChains.value = true
  try {
    await $fetch('/api/v1/updateReferralChains', { method: 'POST' })
    await fetchReferralTree()
  } catch (error) {
    console.error('Error updating chains:', error)
  } finally {
    isUpdatingChains.value = false
  }
}

// Refresh
const refreshTree = () => fetchReferralTree()

// Calculate total
const calculateTotalUsers = () => {
  const b = referralTreeData.value.pointsBreakdown
  return b.level1.users + b.level2.users + b.level3.users + b.level4.users + b.level5.users
}

onMounted(() => fetchReferralTree())
</script>

<style scoped>
/* Main Container */
.referral-tree-page {
  padding: 24px;
  background: transparent;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.header-btns {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-update {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.2), rgba(16, 235, 4, 0.1));
  color: #10eb04;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.btn-update:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.3), rgba(16, 235, 4, 0.2));
  box-shadow: 0 4px 16px rgba(16, 235, 4, 0.3);
  transform: translateY(-2px);
}

.btn-refresh {
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.2), rgba(5, 245, 237, 0.1));
  color: #05f5ed;
  border: 1px solid rgba(5, 245, 237, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.3), rgba(5, 245, 237, 0.2));
  box-shadow: 0 4px 16px rgba(5, 245, 237, 0.3);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-box:hover {
  border-color: rgba(16, 235, 4, 0.4);
  box-shadow: 0 4px 20px rgba(16, 235, 4, 0.2);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 48px;
  line-height: 1;
}

.stat-label {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Levels Container */
.levels-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.level-wrapper {
  width: 100%;
}

.level-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.level-card:hover {
  border-color: rgba(16, 235, 4, 0.4);
  box-shadow: 0 4px 20px rgba(16, 235, 4, 0.2);
  transform: translateX(4px);
}

.level-card.active {
  border-color: rgba(16, 235, 4, 0.5);
  background: rgba(16, 235, 4, 0.08);
  box-shadow: 0 8px 32px rgba(16, 235, 4, 0.3);
}

.level-card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-badge {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 900;
  color: #000;
}

.badge-1 { background: linear-gradient(135deg, #10eb04, #0a9602); }
.badge-2 { background: linear-gradient(135deg, #00d4ff, #0088cc); }
.badge-3 { background: linear-gradient(135deg, #ffd700, #cc9900); }
.badge-4 { background: linear-gradient(135deg, #ffa500, #cc7700); }
.badge-5 { background: linear-gradient(135deg, #ff00ff, #cc00cc); }

.level-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.level-subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.level-card-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.level-metrics {
  display: flex;
  gap: 24px;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 24px;
  font-weight: 900;
  color: #10eb04;
  margin-bottom: 4px;
}

.metric-label {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.expand-arrow {
  font-size: 16px;
  color: #10eb04;
  transition: transform 0.3s ease;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

/* Users List */
.users-list {
  margin-top: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  animation: slideDown 0.3s ease;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.user-row:last-child {
  margin-bottom: 0;
}

.user-row:hover {
  border-color: rgba(16, 235, 4, 0.3);
  background: rgba(16, 235, 4, 0.05);
  transform: translateX(4px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(16, 235, 4, 0.3);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10eb04, #0a9602);
  color: #000;
  font-weight: 900;
  font-size: 20px;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.user-code {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
}

.user-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-users {
  padding: 32px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Points Table */
.points-table {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.table-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 800;
  color: #10eb04;
}

.table-content {
  width: 100%;
}

.table-header,
.table-row,
.table-footer {
  display: grid;
  grid-template-columns: 100px 150px 100px 1fr;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
}

.table-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid rgba(16, 235, 4, 0.2);
  padding-bottom: 12px;
  margin-bottom: 8px;
}

.table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(16, 235, 4, 0.05);
}

.table-footer {
  font-weight: 700;
  border-top: 2px solid rgba(16, 235, 4, 0.3);
  margin-top: 8px;
  padding-top: 16px;
}

.mini-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 14px;
  color: #000;
}

.points-col {
  color: #10eb04;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.points-col.grand {
  font-size: 18px;
  font-weight: 900;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tree Header */
.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
}

.header-info {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tree-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.tree-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* Points Dashboard */
.points-dashboard {
  margin-bottom: 30px;
}

.total-points-card {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  border: 2px solid rgba(16, 235, 4, 0.3);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(16, 235, 4, 0.2);
}

.card-icon {
  font-size: 50px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-label {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-value {
  margin: 0 0 8px 0;
  font-size: 42px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-description {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* Points Grid */
.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.points-card {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.points-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16, 235, 4, 0.2);
}

.level-1-card { border-color: rgba(16, 235, 4, 0.4); }
.level-2-card { border-color: rgba(0, 212, 255, 0.4); }
.level-3-card { border-color: rgba(255, 215, 0, 0.4); }
.level-4-card { border-color: rgba(255, 165, 0, 0.4); }
.level-5-card { border-color: rgba(255, 0, 255, 0.4); }

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.level-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-1-badge { background: rgba(16, 235, 4, 0.2); color: #10eb04; }
.level-2-badge { background: rgba(0, 212, 255, 0.2); color: #00d4ff; }
.level-3-badge { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.level-4-badge { background: rgba(255, 165, 0, 0.2); color: #ffa500; }
.level-5-badge { background: rgba(255, 0, 255, 0.2); color: #ff00ff; }

.level-percentage {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.level-stats {
  text-align: center;
}

.level-points {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 900;
  color: #fff;
}

.level-users {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

/* Clickable Cards */
.clickable-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 235, 4, 0.15);
  border-color: rgba(16, 235, 4, 0.4);
}

.clickable-card.expanded {
  border-color: rgba(16, 235, 4, 0.5);
  background: rgba(16, 235, 4, 0.08);
}

.expand-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 14px;
  color: #10eb04;
  font-weight: 800;
  transition: transform 0.3s ease;
}

.clickable-card.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Level Details (Expandable User Lists) */
.level-details {
  margin-top: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.level-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(16, 235, 4, 0.2);
}

.level-details-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.users-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

/* Users List */
.users-list {
  display: grid;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-item:hover {
  border-color: rgba(16, 235, 4, 0.3);
  background: rgba(16, 235, 4, 0.05);
  transform: translateX(5px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(16, 235, 4, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10eb04 0%, #0a9602 100%);
  color: #000;
  font-weight: 800;
  font-size: 18px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.user-code {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.user-points {
  margin: 0;
  font-size: 11px;
  color: #10eb04;
  font-weight: 600;
}

.user-date {
  text-align: right;
}

.user-date p {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-level {
  padding: 40px 20px;
  text-align: center;
}

.empty-level p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Tier Explanation */
.tier-explanation {
  margin-bottom: 30px;
}

.explanation-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.explanation-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 800;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.explanation-grid {
  display: grid;
  gap: 12px;
}

.explanation-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.explanation-item:hover {
  border-color: rgba(16, 235, 4, 0.3);
  background: rgba(16, 235, 4, 0.05);
}

.explanation-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.explanation-item h4 {
  margin: 0 0 6px 0;
  font-size: 13px;
  font-weight: 700;
  color: #10eb04;
}

.explanation-item p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* Empty State */
.empty-tree-state {
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 12px;
}

.empty-tree-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-tree-title {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 800;
  color: #10eb04;
}

.empty-tree-description {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

/* Tree Info */
.tree-info {
  padding: 15px 20px;
  background: rgba(16, 235, 4, 0.05);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 8px;
  text-align: center;
}

.tree-count {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.tree-count strong {
  color: #10eb04;
  font-weight: 800;
}
</style>
