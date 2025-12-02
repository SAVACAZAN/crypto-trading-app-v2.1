<template>
  <div class="referrals-container">
    <!-- Sub-tabs for Referrals Section -->
    <div class="referrals-subtabs">
      <button
        class="subtab-btn"
        :class="{ active: activeSubTab === 'overview' }"
        @click="activeSubTab = 'overview'"
      >
        🎁 Referrals Overview
      </button>
      <button
        class="subtab-btn"
        :class="{ active: activeSubTab === 'tree' }"
        @click="activeSubTab = 'tree'"
      >
        🌳 5-Tier Network
      </button>
    </div>

    <!-- Overview Sub-Tab -->
    <div v-show="activeSubTab === 'overview'" class="subtab-content">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Username Card with Avatar -->
      <div class="stat-card user-info-card avatar-card clickable-card" @click="openProfilePictureModal">
        <div class="user-avatar">
          <img
            v-if="userData.profilePicture"
            :src="userData.profilePicture"
            :alt="userData.username"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            {{ (userData.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="avatar-edit-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="edit-icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        </div>
        <div class="stat-content">
          <p class="stat-label">Username</p>
          <h2 class="stat-value">{{ userData.username || 'N/A' }}</h2>
          <p class="upload-hint">Click to change photo</p>
        </div>
      </div>

      <!-- Referral Code Card -->
      <div class="stat-card referral-code-card" @click="handleCodeCardClick">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Your Code</p>
          <div v-if="!isEditingCode">
            <h2 class="stat-value code-value">{{ userData.referralCode || 'N/A' }}</h2>
            <p v-if="!codeEditedOnce" class="edit-hint">Click to edit (once)</p>
          </div>
          <div v-else class="code-edit-container">
            <input
              v-model="newReferralCode"
              @click.stop
              @keyup.enter="saveReferralCode"
              @keyup.escape="cancelEdit"
              class="code-input"
              placeholder="Enter new code"
              maxlength="20"
              ref="codeInput"
            />
          </div>
        </div>
        <div v-if="isEditingCode" class="edit-actions" @click.stop>
          <n-button size="tiny" type="success" @click="saveReferralCode" :loading="isSaving">
            ✓
          </n-button>
          <n-button size="tiny" type="error" @click="cancelEdit">
            ✕
          </n-button>
        </div>
      </div>

      <!-- Referred By Card -->
      <div class="stat-card referred-by-card" @click="handleReferredByCardClick">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Referred By</p>
          <div v-if="!isEditingReferredBy">
            <h2 class="stat-value referred-value">{{ userData.referredBy || 'Direct' }}</h2>
            <p v-if="!referredByEdited && !userData.referredBy" class="edit-hint">Click to add (once)</p>
            <p v-else-if="!referredByEdited && userData.referredBy" class="edit-hint">Click to edit (once)</p>
          </div>
          <div v-else class="code-edit-container">
            <input
              v-model="newReferredBy"
              @click.stop
              @keyup.enter="saveReferredBy"
              @keyup.escape="cancelReferredByEdit"
              class="code-input"
              placeholder="Enter referrer code"
              maxlength="20"
              ref="referredByInput"
            />
          </div>
        </div>
        <div v-if="isEditingReferredBy" class="edit-actions" @click.stop>
          <n-button size="tiny" type="success" @click="saveReferredBy" :loading="isSavingReferredBy">
            ✓
          </n-button>
          <n-button size="tiny" type="error" @click="cancelReferredByEdit">
            ✕
          </n-button>
        </div>
      </div>

      <!-- Total Referrals Card -->
      <div class="stat-card total-referrals-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Refs</p>
          <h2 class="stat-value">{{ totalReferrals }}</h2>
        </div>
      </div>

      <!-- Total Earnings Card -->
      <div class="stat-card total-earnings-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Earned</p>
          <h2 class="stat-value earnings-value">${{ totalEarnings }}</h2>
        </div>
      </div>

      <!-- Registration Bonus Card -->
      <div class="stat-card registration-bonus-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 12v10H4V12"/>
            <path d="M22 7H2v5h20V7z"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Welcome Bonus</p>
          <h2 class="stat-value bonus-value">${{ registrationBonus }}</h2>
          <p class="bonus-status">{{ bonusStatus }}</p>
        </div>
      </div>
    </div>

    <!-- Referral Tier Card -->
    <div class="tier-section">
      <div class="tier-card">
        <div class="tier-header">
          <div class="tier-badge-container">
            <img :src="tierData.badge" :alt="tierData.tier" class="tier-badge-img" />
          </div>
          <div class="tier-info">
            <h2 class="tier-name">{{ tierData.tier }} Tier</h2>
            <p class="tier-stats">
              <span class="commission-rate">{{ tierData.commission }}% Commission</span>
              <span class="monthly-bonus">{{ tierData.monthlyBonus }} USDT/month</span>
            </p>
          </div>
        </div>

        <div class="tier-benefits">
          <h3 class="benefits-title">Your Benefits:</h3>
          <ul class="benefits-list">
            <li v-for="(benefit, index) in tierData.benefits" :key="index" class="benefit-item">
              <span class="benefit-icon">✓</span>
              {{ benefit }}
            </li>
          </ul>
        </div>

        <div class="tier-progress" v-if="nextTierInfo">
          <div class="progress-header">
            <span class="progress-label">Progress to {{ nextTierInfo.name }}</span>
            <span class="progress-count">{{ totalReferrals }} / {{ nextTierInfo.minReferrals }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <p class="progress-text">{{ referralsNeeded }} more referrals to unlock {{ nextTierInfo.name }} tier</p>
        </div>

        <div v-else class="tier-max">
          <p class="max-tier-text">🎉 You've reached the highest tier! Keep growing your network.</p>
        </div>
      </div>
    </div>

    <!-- Referral Link Section -->
    <div class="referral-link-section">
      <div class="section-header">
        <h3 class="section-title">📎 Your Referral Link</h3>
      </div>
      <div class="link-container">
        <div class="link-box">
          <input
            type="text"
            :value="referralLink"
            readonly
            class="link-input"
            ref="linkInput"
          />
          <n-button
            type="primary"
            @click="copyLink"
            class="copy-btn"
          >
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </n-icon>
            </template>
            {{ copyButtonText }}
          </n-button>
        </div>
        <p class="link-description">Share this link with friends to earn rewards!</p>
      </div>
    </div>

    <!-- Referral History -->
    <div class="referral-history-section">
      <div class="section-header">
        <h3 class="section-title">👥 Your Referrals</h3>
      </div>

      <div v-if="referralHistory.length > 0" class="referrals-grid">
        <div
          v-for="(referral, index) in referralHistory"
          :key="index"
          class="referral-card"
        >
          <div class="referral-icon">
            👤
          </div>
          <div class="referral-info">
            <p class="referral-username">{{ referral.username || 'Anonymous User' }}</p>
            <p class="referral-date">{{ formatDate(referral.joinedAt) }}</p>
          </div>
          <div class="referral-status">
            <span class="status-badge active">Active</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h4 class="empty-title">No Referrals Yet</h4>
        <p class="empty-description">Start sharing your referral link to grow your network!</p>
      </div>
    </div>

    <!-- Tier Legend - All Tiers -->
    <div class="tier-legend-section">
      <div class="section-header">
        <h3 class="section-title">🏆 Referral Tiers - What You Can Achieve</h3>
      </div>
      <div class="tier-legend-grid">
        <!-- Bronze Tier -->
        <div class="legend-tier-card bronze">
          <div class="legend-header">
            <img src="/Refferalls-images/Bronze.svg" alt="Bronze" class="legend-badge" />
            <h4 class="legend-tier-name">Bronze</h4>
          </div>
          <p class="legend-requirement">1-10 Referrals</p>
          <div class="legend-stats">
            <span class="legend-commission">5% Commission</span>
            <span class="legend-bonus">10 USDT/month</span>
          </div>
          <ul class="legend-benefits">
            <li>✓ Basic referral dashboard</li>
            <li>✓ 5% commission on trades</li>
            <li>✓ Monthly bonus: 10 USDT</li>
          </ul>
        </div>

        <!-- Silver Tier -->
        <div class="legend-tier-card silver">
          <div class="legend-header">
            <img src="/Refferalls-images/Gray.svg" alt="Silver" class="legend-badge" />
            <h4 class="legend-tier-name">Silver</h4>
          </div>
          <p class="legend-requirement">11-50 Referrals</p>
          <div class="legend-stats">
            <span class="legend-commission">7.5% Commission</span>
            <span class="legend-bonus">50 USDT/month</span>
          </div>
          <ul class="legend-benefits">
            <li>✓ Priority support</li>
            <li>✓ 7.5% commission on trades</li>
            <li>✓ Monthly bonus: 50 USDT</li>
            <li>✓ Silver Casino access</li>
          </ul>
        </div>

        <!-- Gold Tier -->
        <div class="legend-tier-card gold">
          <div class="legend-header">
            <img src="/Refferalls-images/Yellow.svg" alt="Gold" class="legend-badge" />
            <h4 class="legend-tier-name">Gold</h4>
          </div>
          <p class="legend-requirement">51-100 Referrals</p>
          <div class="legend-stats">
            <span class="legend-commission">10% Commission</span>
            <span class="legend-bonus">150 USDT/month</span>
          </div>
          <ul class="legend-benefits">
            <li>✓ VIP support</li>
            <li>✓ 10% commission on trades</li>
            <li>✓ Monthly bonus: 150 USDT</li>
            <li>✓ Gold Trading signals</li>
            <li>✓ Free Grid Bot (1 month)</li>
          </ul>
        </div>

        <!-- Platinum Tier -->
        <div class="legend-tier-card platinum">
          <div class="legend-header">
            <img src="/Refferalls-images/Green.svg" alt="Platinum" class="legend-badge" />
            <h4 class="legend-tier-name">Platinum</h4>
          </div>
          <p class="legend-requirement">101-500 Referrals</p>
          <div class="legend-stats">
            <span class="legend-commission">12.5% Commission</span>
            <span class="legend-bonus">500 USDT/month</span>
          </div>
          <ul class="legend-benefits">
            <li>✓ Account manager</li>
            <li>✓ 12.5% commission on trades</li>
            <li>✓ Monthly bonus: 500 USDT</li>
            <li>✓ Platinum Casino</li>
            <li>✓ Unlimited API calls</li>
            <li>✓ Custom bot development</li>
          </ul>
        </div>

        <!-- Diamond Tier -->
        <div class="legend-tier-card diamond">
          <div class="legend-header">
            <img src="/Refferalls-images/Blue.svg" alt="Diamond" class="legend-badge" />
            <h4 class="legend-tier-name">Diamond</h4>
          </div>
          <p class="legend-requirement">500+ Referrals</p>
          <div class="legend-stats">
            <span class="legend-commission">15% Commission</span>
            <span class="legend-bonus">2000 USDT/month</span>
          </div>
          <ul class="legend-benefits">
            <li>✓ 15% commission on trades</li>
            <li>✓ 5% platform profit sharing</li>
            <li>✓ Monthly bonus: 2000 USDT</li>
            <li>✓ Diamond Casino & VIP events</li>
            <li>✓ Personal trading coach</li>
            <li>✓ Exclusive airdrops</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div class="how-it-works-section">
      <div class="section-header">
        <h3 class="section-title">💡 How Referrals Work</h3>
      </div>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h4 class="step-title">Share Your Link</h4>
          <p class="step-description">Copy and share your unique referral link with friends</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h4 class="step-title">Friends Sign Up</h4>
          <p class="step-description">They register using your referral link</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h4 class="step-title">Earn Rewards</h4>
          <p class="step-description">Get bonuses for each successful referral</p>
        </div>
      </div>
    </div>
    </div><!-- End Overview Sub-Tab -->

    <!-- 5-Tier Network Sub-Tab -->
    <div v-show="activeSubTab === 'tree'" class="subtab-content tree-subtab">
      <ReferralTreeContent />
    </div>

    <!-- Profile Picture Upload Modal -->
    <n-modal
      v-model:show="showProfilePictureModal"
      preset="card"
      title="Update Profile Picture"
      class="profile-picture-modal"
      style="width: 90%; max-width: 500px;"
    >
      <div class="profile-picture-upload-container">
        <!-- Preview -->
        <div class="profile-preview">
          <div class="preview-avatar">
            <img
              v-if="previewImage"
              :src="previewImage"
              alt="Preview"
              class="preview-image"
            />
            <div v-else-if="userData.profilePicture" class="preview-image-wrapper">
              <img
                :src="userData.profilePicture"
                alt="Current"
                class="preview-image"
              />
            </div>
            <div v-else class="preview-placeholder">
              {{ (userData.username || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>
          <p class="preview-label">{{ previewImage ? 'New Photo Preview' : 'Current Photo' }}</p>
        </div>

        <!-- Upload Options -->
        <div class="upload-options">
          <!-- File Upload -->
          <n-upload
            ref="uploadRef"
            :max="1"
            accept="image/*"
            :show-file-list="false"
            @change="handleFileChange"
            :custom-request="customUploadRequest"
          >
            <n-button type="primary" block>
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </template>
              Choose Photo from Device
            </n-button>
          </n-upload>

          <!-- URL Input -->
          <div class="url-input-section">
            <n-input
              v-model:value="profilePictureUrl"
              placeholder="Or paste image URL"
              @input="handleUrlInput"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <n-button @click="cancelUpload" class="cancel-btn">
            Cancel
          </n-button>
          <n-button
            type="primary"
            @click="saveProfilePicture"
            :loading="isUploading"
            :disabled="!previewImage"
            class="save-btn"
          >
            Save Photo
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCookie } from '#app'
import { useNotification } from 'naive-ui'
import ReferralTreeContent from '~/components/ReferralTreeContent.vue'

const notification = useNotification()

// Active sub-tab state
const activeSubTab = ref('overview')

// User data from cookies
const userData = ref({
  userID: useCookie('userID').value,
  username: useCookie('username').value,
  referralCode: useCookie('referralCode').value,
  referredBy: useCookie('referredBy').value,
})

// Referral code editing
const isEditingCode = ref(false)
const newReferralCode = ref('')
const codeEditedOnce = ref(false)
const isSaving = ref(false)
const codeInput = ref(null)

// Referred By editing
const isEditingReferredBy = ref(false)
const newReferredBy = ref('')
const referredByEdited = ref(false)
const isSavingReferredBy = ref(false)
const referredByInput = ref(null)

// Referral link (use ref to avoid SSR hydration mismatch)
const referralLink = ref('')

// Copy button state
const copyButtonText = ref('Copy')
const linkInput = ref(null)

// Mock data - replace with API call
const totalReferrals = ref(0)
const referralHistory = ref([])

// Tier data
const tierData = ref({
  tier: 'Bronze',
  commission: 5,
  monthlyBonus: 10,
  badge: '/Refferalls-images/Bronze.svg',
  benefits: [
    '5% commission from referral trades',
    'Access to basic referral dashboard',
    'Monthly bonus: 10 USDT'
  ]
})

// Bonus data (fetched from API)
const totalEarnings = ref(0)
const registrationBonus = ref(150)
const bonusClaimedAt = ref(null)

// Computed property for bonus status
const bonusStatus = computed(() => {
  if (bonusClaimedAt.value) {
    const claimedDate = new Date(bonusClaimedAt.value)
    return `Claimed on ${claimedDate.toLocaleDateString()}`
  }
  return 'Claimed at registration'
})

// Profile Picture Upload
const showProfilePictureModal = ref(false)
const previewImage = ref('')
const profilePictureUrl = ref('')
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadRef = ref(null)

// Open profile picture modal
const openProfilePictureModal = () => {
  showProfilePictureModal.value = true
  previewImage.value = ''
  profilePictureUrl.value = ''
  selectedFile.value = null
}

// Handle file selection
const handleFileChange = (options) => {
  const { file } = options
  if (file.file) {
    selectedFile.value = file.file
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file.file)
  }
}

// Custom upload request (prevent auto upload)
const customUploadRequest = ({ file, onFinish, onError }) => {
  // Don't auto upload, we'll handle it manually
  onFinish()
}

// Handle URL input
const handleUrlInput = () => {
  if (profilePictureUrl.value) {
    previewImage.value = profilePictureUrl.value
    selectedFile.value = null
  }
}

// Save profile picture
const saveProfilePicture = async () => {
  isUploading.value = true

  try {
    let imageData = previewImage.value

    // If file is selected, convert to base64
    if (selectedFile.value) {
      const reader = new FileReader()
      imageData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile.value)
      })
    }

    // Save to backend
    const response = await $fetch('/api/v1/updateProfilePicture', {
      method: 'POST',
      body: {
        userID: userData.value.userID,
        profilePicture: imageData
      }
    })

    if (response.success) {
      userData.value.profilePicture = imageData

      // Update cookie
      const profilePictureCookie = useCookie('profilePicture')
      profilePictureCookie.value = imageData

      notification.success({
        content: 'Profile Picture Updated!',
        meta: 'Your profile picture has been saved successfully',
        duration: 3000
      })

      showProfilePictureModal.value = false
      previewImage.value = ''
      profilePictureUrl.value = ''
      selectedFile.value = null
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    notification.error({
      content: 'Upload Failed',
      meta: error.data?.statusMessage || 'Could not upload profile picture',
      duration: 3000
    })
  } finally {
    isUploading.value = false
  }
}

// Cancel upload
const cancelUpload = () => {
  showProfilePictureModal.value = false
  previewImage.value = ''
  profilePictureUrl.value = ''
  selectedFile.value = null
}

// Tier thresholds for progress calculation
const TIER_THRESHOLDS = {
  Bronze: { min: 1, max: 10 },
  Silver: { min: 11, max: 50 },
  Gold: { min: 51, max: 100 },
  Platinum: { min: 101, max: 500 },
  Diamond: { min: 501, max: Infinity }
}

// Calculate next tier info
const nextTierInfo = computed(() => {
  const currentTier = tierData.value.tier
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex === tiers.length - 1) {
    return null // Already at max tier
  }

  const nextTier = tiers[currentIndex + 1]
  return {
    name: nextTier,
    minReferrals: TIER_THRESHOLDS[nextTier].min
  }
})

// Calculate progress percentage
const progressPercentage = computed(() => {
  if (!nextTierInfo.value) return 100

  const currentTier = tierData.value.tier
  const currentMin = TIER_THRESHOLDS[currentTier].min
  const nextMin = nextTierInfo.value.minReferrals
  const range = nextMin - currentMin
  const progress = totalReferrals.value - currentMin

  return Math.min(Math.max((progress / range) * 100, 0), 100)
})

// Calculate referrals needed for next tier
const referralsNeeded = computed(() => {
  if (!nextTierInfo.value) return 0
  return Math.max(0, nextTierInfo.value.minReferrals - totalReferrals.value)
})

// Copy link function
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copyButtonText.value = 'Copied!'
    notification.success({
      content: 'Referral Link Copied!',
      duration: 2000
    })
    setTimeout(() => {
      copyButtonText.value = 'Copy'
    }, 2000)
  } catch (err) {
    notification.error({
      content: 'Failed to copy link',
      duration: 2000
    })
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) {
    return 'Recently'
  }

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Recently'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle code card click
const handleCodeCardClick = () => {
  if (codeEditedOnce.value) {
    notification.warning({
      content: 'Referral Code Already Edited',
      meta: 'You can only edit your referral code once',
      duration: 3000
    })
    return
  }
  isEditingCode.value = true
  newReferralCode.value = userData.value.referralCode || ''
  nextTick(() => {
    codeInput.value?.focus()
  })
}

// Save referral code
const saveReferralCode = async () => {
  if (!newReferralCode.value || newReferralCode.value.trim() === '') {
    notification.error({
      content: 'Invalid Code',
      meta: 'Please enter a valid referral code',
      duration: 2000
    })
    return
  }

  // Validate code format (alphanumeric, 3-20 chars)
  const codeRegex = /^[a-zA-Z0-9]{3,20}$/
  if (!codeRegex.test(newReferralCode.value)) {
    notification.error({
      content: 'Invalid Format',
      meta: 'Code must be 3-20 alphanumeric characters',
      duration: 3000
    })
    return
  }

  isSaving.value = true

  try {
    // Check if code is unique
    const checkResponse = await $fetch('/api/v1/checkReferralCode', {
      method: 'POST',
      body: {
        referralCode: newReferralCode.value,
        userID: userData.value.userID
      }
    })

    if (!checkResponse.unique) {
      notification.error({
        content: 'Code Already Taken',
        meta: 'This referral code is already in use. Please choose another.',
        duration: 3000
      })
      isSaving.value = false
      return
    }

    // Save the new code
    const response = await $fetch('/api/v1/updateReferralCode', {
      method: 'POST',
      body: {
        userID: userData.value.userID,
        newReferralCode: newReferralCode.value
      }
    })

    if (response.success) {
      userData.value.referralCode = newReferralCode.value
      // Update cookie
      const referralCodeCookie = useCookie('referralCode')
      referralCodeCookie.value = newReferralCode.value

      codeEditedOnce.value = true
      isEditingCode.value = false

      notification.success({
        content: 'Code Updated Successfully!',
        meta: 'Your referral code has been saved',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Error updating referral code:', error)

    // Better error handling - extract meaningful error message
    let errorMessage = 'Could not update referral code'

    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.statusMessage) {
      errorMessage = error.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    }

    // Prevent crash by catching all error types
    notification.error({
      content: 'Update Failed',
      meta: errorMessage,
      duration: 4000
    })
  } finally {
    isSaving.value = false
  }
}

// Cancel edit
const cancelEdit = () => {
  isEditingCode.value = false
  newReferralCode.value = ''
}

// Handle referred by card click
const handleReferredByCardClick = () => {
  if (referredByEdited.value) {
    notification.warning({
      content: 'Referred By Already Set',
      meta: 'You can only set your referrer code once',
      duration: 3000
    })
    return
  }
  isEditingReferredBy.value = true
  newReferredBy.value = userData.value.referredBy || ''
  nextTick(() => {
    referredByInput.value?.focus()
  })
}

// Save referred by code
const saveReferredBy = async () => {
  if (!newReferredBy.value || newReferredBy.value.trim() === '') {
    notification.error({
      content: 'Invalid Code',
      meta: 'Please enter a valid referrer code',
      duration: 2000
    })
    return
  }

  // Validate code format (alphanumeric, 3-20 chars)
  const codeRegex = /^[a-zA-Z0-9]{3,20}$/
  if (!codeRegex.test(newReferredBy.value)) {
    notification.error({
      content: 'Invalid Format',
      meta: 'Code must be 3-20 alphanumeric characters',
      duration: 3000
    })
    return
  }

  isSavingReferredBy.value = true

  try {
    // First validate the referral code
    const validationResponse = await $fetch('/api/v1/validateReferralCode', {
      method: 'POST',
      body: {
        referralCode: newReferredBy.value,
        userID: userData.value.userID
      }
    })

    if (!validationResponse.valid) {
      notification.error({
        content: 'Invalid Referral Code',
        meta: validationResponse.reason || 'This referral code cannot be used',
        duration: 3000
      })
      isSavingReferredBy.value = false
      return
    }

    // Show who the referrer is
    notification.info({
      content: 'Validating...',
      meta: `Referrer: ${validationResponse.referrerUsername}`,
      duration: 2000
    })

    // Save the referred by code
    const response = await $fetch('/api/v1/updateReferredBy', {
      method: 'POST',
      body: {
        userID: userData.value.userID,
        referredByCode: newReferredBy.value
      }
    })

    if (response.success) {
      userData.value.referredBy = newReferredBy.value
      // Update cookie
      const referredByCookie = useCookie('referredBy')
      referredByCookie.value = newReferredBy.value

      referredByEdited.value = true
      isEditingReferredBy.value = false

      notification.success({
        content: 'Referrer Set Successfully!',
        meta: `You are now sharing profits with ${validationResponse.referrerUsername}`,
        duration: 4000
      })
    }
  } catch (error) {
    console.error('Error updating referred by:', error)

    // Better error handling - extract meaningful error message
    let errorMessage = 'Could not set referrer code'

    if (error.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error.statusMessage) {
      errorMessage = error.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    }

    // Prevent crash by catching all error types
    notification.error({
      content: 'Update Failed',
      meta: errorMessage,
      duration: 4000
    })
  } finally {
    isSavingReferredBy.value = false
  }
}

// Cancel referred by edit
const cancelReferredByEdit = () => {
  isEditingReferredBy.value = false
  newReferredBy.value = ''
}

// Fetch referral data and check if code was edited
onMounted(async () => {
  // Set referral link on client side (avoid SSR hydration mismatch)
  if (userData.value.referralCode) {
    referralLink.value = `${window.location.origin}/register?ref=${userData.value.referralCode}`
  }

  try {
    // Fetch user info including edit statuses and referral data
    const userInfo = await $fetch('/api/v1/getUserInfo', {
      query: { userID: userData.value.userID }
    })

    if (userInfo.success) {
      // Update username from API if not in cookie
      if (userInfo.data.username && !userData.value.username) {
        userData.value.username = userInfo.data.username
        // Update cookie for future use
        const usernameCookie = useCookie('username')
        usernameCookie.value = userInfo.data.username
        console.log('✅ Username loaded from API:', userInfo.data.username)
      }

      // Update referral code and referredBy if different from cookies
      if (userInfo.data.referralCode) {
        userData.value.referralCode = userInfo.data.referralCode
        // Update referral link with fresh data
        referralLink.value = `${window.location.origin}/register?ref=${userInfo.data.referralCode}`
      }
      if (userInfo.data.referredBy) {
        userData.value.referredBy = userInfo.data.referredBy
      }

      // Load profile picture from database
      if (userInfo.data.profilePicture) {
        userData.value.profilePicture = userInfo.data.profilePicture
        console.log('✅ Profile picture loaded from database')
      }

      // Set edit flags
      codeEditedOnce.value = userInfo.data.codeEditedOnce || false
      referredByEdited.value = userInfo.data.referredByEdited || false

      // Update referral statistics
      totalReferrals.value = userInfo.data.totalReferrals || 0

      // Update tier data
      if (userInfo.data.referralTier) {
        tierData.value = {
          tier: userInfo.data.referralTier.tier || 'Bronze',
          commission: userInfo.data.referralTier.commission || 5,
          monthlyBonus: userInfo.data.referralTier.monthlyBonus || 10,
          badge: userInfo.data.referralTier.badge || '/Refferalls-images/Bronze.svg',
          benefits: userInfo.data.referralTier.benefits || [
            '5% commission from referral trades',
            'Access to basic referral dashboard',
            'Monthly bonus: 10 USDT'
          ]
        }
      }

      // Update referral history
      if (userInfo.data.referredUsers && userInfo.data.referredUsers.length > 0) {
        console.log('📊 Referral users data:', userInfo.data.referredUsers);
        referralHistory.value = userInfo.data.referredUsers.map(user => ({
          userId: user.userID,
          username: user.username,
          joinedAt: user.joinedAt
        }))
        console.log('📊 Mapped referral history:', referralHistory.value);
      }

      // Update bonus data from API
      if (userInfo.data.referralEarnings) {
        totalEarnings.value = userInfo.data.referralEarnings.totalEarnings || 0
      }
      if (userInfo.data.registeredBonus) {
        registrationBonus.value = userInfo.data.registeredBonus.amount || 150
        bonusClaimedAt.value = userInfo.data.registeredBonus.claimedAt || null
      }

      // Automatically update tier based on referral count
      try {
        const tierUpdateResponse = await $fetch('/api/v1/updateUserTier', {
          method: 'POST',
          body: { userID: userData.value.userID }
        })

        if (tierUpdateResponse.success && tierUpdateResponse.data.tierChanged) {
          // Update tier data with new tier
          tierData.value = {
            tier: tierUpdateResponse.data.tier,
            commission: tierUpdateResponse.data.commission,
            monthlyBonus: tierUpdateResponse.data.monthlyBonus,
            badge: tierUpdateResponse.data.badge,
            benefits: tierUpdateResponse.data.benefits
          }

          // Show notification about tier upgrade
          notification.success({
            content: `🎉 Tier Upgraded to ${tierUpdateResponse.data.tier}!`,
            meta: `You now have ${tierUpdateResponse.data.commission}% commission and ${tierUpdateResponse.data.monthlyBonus} USDT monthly bonus`,
            duration: 5000
          })
        }
      } catch (tierError) {
        console.error('Error updating tier:', tierError)
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    notification.error({
      content: 'Failed to Load Data',
      meta: 'Could not load user information',
      duration: 2000
    })
  }
})

console.log('User Data:', userData.value)
</script>

<style scoped>
.referrals-container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid;
  transition: all 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.user-info-card {
  border-color: rgba(16, 235, 4, 0.3);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05), rgba(16, 235, 4, 0.02));
}

.clickable-card {
  cursor: pointer;
  position: relative;
}

.clickable-card:hover {
  border-color: rgba(16, 235, 4, 0.6);
  box-shadow: 0 6px 20px rgba(16, 235, 4, 0.3);
}

.clickable-card:hover .avatar-edit-overlay {
  opacity: 1;
}

.upload-hint {
  margin: 4px 0 0 0;
  font-size: 8px;
  color: rgba(16, 235, 4, 0.6);
  font-style: italic;
  font-weight: 600;
}

.referral-code-card {
  border-color: rgba(0, 212, 255, 0.3);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(0, 212, 255, 0.02));
  cursor: pointer;
  position: relative;
}

.referral-code-card:hover {
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2);
}

.referred-by-card {
  border-color: rgba(255, 165, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.05), rgba(255, 165, 0, 0.02));
  cursor: pointer;
  position: relative;
}

.referred-by-card:hover {
  border-color: rgba(255, 165, 0, 0.5);
  box-shadow: 0 4px 16px rgba(255, 165, 0, 0.2);
}

.total-referrals-card {
  border-color: rgba(255, 0, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.05), rgba(255, 0, 255, 0.02));
}

.total-earnings-card {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.02));
}

.registration-bonus-card {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info-card .stat-icon {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.2), rgba(16, 235, 4, 0.1));
  color: #10eb04;
}

.referral-code-card .stat-icon {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1));
  color: #00d4ff;
}

.referred-by-card .stat-icon {
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 165, 0, 0.1));
  color: #ffa500;
}

.total-referrals-card .stat-icon {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.1));
  color: #ff00ff;
}

.total-earnings-card .stat-icon {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  color: #ffd700;
}

.registration-bonus-card .stat-icon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
}

.stat-icon svg {
  width: 16px;
  height: 16px;
}

/* Avatar Styles */
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(16, 235, 4, 0.4);
  box-shadow: 0 0 15px rgba(16, 235, 4, 0.3);
  position: relative;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.edit-icon {
  width: 20px;
  height: 20px;
  color: #10eb04;
}

.avatar-image {
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
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  color: #000;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-content {
  flex: 1;
  overflow: hidden;
}

.stat-label {
  margin: 0;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.stat-value {
  margin: 2px 0 0 0;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.code-value {
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.referred-value {
  color: #ffa500;
  font-family: 'Courier New', monospace;
}

.earnings-value {
  color: #ffd700;
  font-weight: 900;
}

.bonus-value {
  color: #22c55e;
  font-weight: 900;
}

.bonus-status {
  margin: 4px 0 0 0;
  font-size: 8px;
  color: rgba(34, 197, 94, 0.7);
  font-style: italic;
}

.edit-hint {
  margin: 4px 0 0 0;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.code-edit-container {
  margin-top: 4px;
}

.code-input {
  width: 100%;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 6px;
  color: #00d4ff;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: all 0.2s ease;
}

.code-input:focus {
  border-color: rgba(0, 212, 255, 0.8);
  background: rgba(255, 255, 255, 0.12);
}

.referred-by-card .code-input {
  border-color: rgba(255, 165, 0, 0.4);
  color: #ffa500;
}

.referred-by-card .code-input:focus {
  border-color: rgba(255, 165, 0, 0.8);
}

.edit-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

/* Tier Section */
.tier-section {
  margin: 0 15px 20px 15px;
}

.tier-card {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05) 0%, rgba(5, 245, 237, 0.05) 100%);
  border: 2px solid rgba(16, 235, 4, 0.2);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(16, 235, 4, 0.1);
}

.tier-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(16, 235, 4, 0.1);
}

.tier-badge-container {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.tier-badge-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(16, 235, 4, 0.5));
}

.tier-info {
  flex: 1;
}

.tier-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tier-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin: 0;
}

.commission-rate,
.monthly-bonus {
  padding: 6px 12px;
  background: rgba(16, 235, 4, 0.1);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tier-benefits {
  margin-bottom: 20px;
}

.benefits-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.benefit-item:hover {
  border-color: rgba(16, 235, 4, 0.3);
  background: rgba(16, 235, 4, 0.05);
}

.benefit-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
}

.tier-progress {
  padding-top: 20px;
  border-top: 1px solid rgba(16, 235, 4, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 12px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-count {
  font-size: 14px;
  font-weight: 900;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10eb04, #05f5ed);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
}

.progress-text {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.tier-max {
  padding-top: 20px;
  border-top: 1px solid rgba(16, 235, 4, 0.1);
  text-align: center;
}

.max-tier-text {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tier Legend Section */
.tier-legend-section {
  margin: 0 15px 20px 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(16, 235, 4, 0.1);
  overflow: hidden;
}

.tier-legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  padding: 15px;
}

.legend-tier-card {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.legend-tier-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0.5;
}

.legend-tier-card.bronze {
  border-color: rgba(205, 127, 50, 0.4);
}

.legend-tier-card.bronze::before {
  background: linear-gradient(90deg, #cd7f32, #b8860b);
}

.legend-tier-card.silver {
  border-color: rgba(192, 192, 192, 0.4);
}

.legend-tier-card.silver::before {
  background: linear-gradient(90deg, #c0c0c0, #d3d3d3);
}

.legend-tier-card.gold {
  border-color: rgba(255, 215, 0, 0.4);
}

.legend-tier-card.gold::before {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
}

.legend-tier-card.platinum {
  border-color: rgba(34, 197, 94, 0.4);
}

.legend-tier-card.platinum::before {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.legend-tier-card.diamond {
  border-color: rgba(59, 130, 246, 0.4);
}

.legend-tier-card.diamond::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.legend-tier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(16, 235, 4, 0.2);
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-badge {
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(16, 235, 4, 0.3));
}

.legend-tier-name {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.legend-requirement {
  margin: 0 0 10px 0;
  font-size: 12px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  padding: 6px;
  background: rgba(16, 235, 4, 0.1);
  border-radius: 6px;
}

.legend-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.legend-commission,
.legend-bonus {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #10eb04;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.legend-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}

.legend-benefits li {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  padding: 6px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  border-left: 2px solid rgba(16, 235, 4, 0.3);
}

/* Sections */
.referral-link-section,
.referral-history-section,
.how-it-works-section {
  margin: 0 15px 20px 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(16, 235, 4, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 12px 15px;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  border-bottom: 1px solid rgba(16, 235, 4, 0.1);
}

.section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #10eb04;
  letter-spacing: 0.3px;
}

/* Link Container */
.link-container {
  padding: 15px;
}

.link-box {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.link-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 8px;
  color: #10eb04;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  outline: none;
}

.link-input:focus {
  border-color: rgba(16, 235, 4, 0.5);
}

.copy-btn {
  font-weight: 700;
  font-size: 12px;
  height: 38px;
}

.link-description {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

/* Referrals Grid */
.referrals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  padding: 15px;
}

.referral-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.referral-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 235, 4, 0.3);
  box-shadow: 0 4px 12px rgba(16, 235, 4, 0.1);
}

.referral-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.2), rgba(16, 235, 4, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.referral-info {
  flex: 1;
}

.referral-username {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.referral-date {
  margin: 2px 0 0 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.referral-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.empty-description {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* Steps Grid */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding: 15px;
}

.step-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(16, 235, 4, 0.1);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.step-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 235, 4, 0.3);
  box-shadow: 0 4px 12px rgba(16, 235, 4, 0.1);
}

.step-number {
  width: 32px;
  height: 32px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  color: #0a0118;
  font-size: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  margin: 0 0 6px 0;
  font-size: 13px;
  font-weight: 700;
  color: #10eb04;
}

.step-description {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* Profile Picture Upload Modal */
.profile-picture-upload-container {
  padding: 20px 0;
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.preview-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(16, 235, 4, 0.4);
  box-shadow: 0 0 20px rgba(16, 235, 4, 0.3);
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-image-wrapper,
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  color: #000;
  font-size: 60px;
  font-weight: 900;
  text-transform: uppercase;
}

.preview-label {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.url-input-section {
  width: 100%;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  flex: 1;
}

.save-btn {
  flex: 1;
}

/* Modal Override */
:deep(.n-card.n-modal) {
  background: linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%);
  border: 2px solid rgba(16, 235, 4, 0.3);
}

:deep(.n-card-header) {
  border-bottom: 1px solid rgba(16, 235, 4, 0.2);
}

:deep(.n-card-header .n-card-header__main) {
  color: #10eb04;
  font-weight: 800;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Referrals Sub-tabs */
.referrals-subtabs {
  display: flex;
  gap: 10px;
  padding: 15px 15px 0 15px;
  margin-bottom: 15px;
  border-bottom: 2px solid rgba(16, 235, 4, 0.1);
}

.subtab-btn {
  flex: 1;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: none;
  border-bottom: 3px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
}

.subtab-btn:hover {
  background: rgba(16, 235, 4, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.subtab-btn.active {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.15), rgba(5, 245, 237, 0.15));
  border-bottom-color: #10eb04;
  color: #10eb04;
  box-shadow: 0 -2px 10px rgba(16, 235, 4, 0.2);
}

.subtab-content {
  animation: fadeInSubTab 0.3s ease;
}

@keyframes fadeInSubTab {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tree-subtab {
  min-height: 600px;
}
</style>
