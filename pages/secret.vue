<template>
  <div class="secret-page">
    <!-- Background Effect -->
    <div class="stars-background"></div>

    <n-card
      v-if="!authenticated"
      title="🔐 Secret Portal - Access Restricted"
      class="secret-card"
      style="max-width: 500px; margin: 0 auto;"
    >
      <template #header-extra>
        <n-tag type="warning" size="small">🔒 Protected</n-tag>
      </template>

      <n-space vertical size="large">
        <!-- Lock Icon -->
        <div style="text-align: center; margin: 20px 0;">
          <div style="font-size: 80px; animation: pulse 2s infinite;">🔐</div>
        </div>

        <!-- Warning Alert -->
        <n-alert type="warning">
          <template #icon>
            <span style="font-size: 20px;">⚠️</span>
          </template>
          <strong>Restricted Area</strong>
          <br>
          <span style="font-size: 13px;">Enter the secret password to proceed</span>
        </n-alert>

        <!-- Password Input -->
        <n-form @submit.prevent="checkPassword">
          <n-form-item label="🔑 Password">
            <n-input
              v-model:value="passwordInput"
              type="password"
              placeholder="Enter secret password..."
              size="large"
              show-password-on="click"
              :status="passwordError ? 'error' : undefined"
              @keyup.enter="checkPassword"
              ref="passwordInputRef"
            >
              <template #prefix>
                <span style="font-size: 16px;">🔑</span>
              </template>
            </n-input>
          </n-form-item>

          <!-- Error Message -->
          <n-alert v-if="passwordError" type="error" style="margin-bottom: 16px;" size="small">
            <template #icon>
              <span style="font-size: 16px;">❌</span>
            </template>
            {{ passwordError }}
          </n-alert>

          <!-- Attempts Counter -->
          <div v-if="attempts > 0" style="text-align: center; margin-bottom: 16px; font-size: 12px; color: rgba(255,255,255,0.5);">
            Failed attempts: {{ attempts }} / 3
            <span v-if="attempts >= 3" style="color: #f87171;">⚠️ Too many attempts!</span>
          </div>

          <!-- Submit Button -->
          <n-button
            type="primary"
            size="large"
            block
            @click="checkPassword"
            :loading="checking"
            :disabled="!passwordInput || attempts >= 3"
          >
            <template #icon>
              <span style="font-size: 18px;">🔓</span>
            </template>
            Unlock Secret
          </n-button>
        </n-form>

        <!-- Hint -->
        <n-alert type="default" size="small" closable>
          <template #icon>
            <span style="font-size: 14px;">💡</span>
          </template>
          <span style="font-size: 11px; color: rgba(255,255,255,0.5);">
            Hint: It's a special word... maybe the same one that brought you here?
          </span>
        </n-alert>
      </n-space>
    </n-card>

    <!-- Welcome Screen (After Authentication) -->
    <n-card
      v-else
      title="🎉 Welcome!"
      class="welcome-card"
      style="max-width: 600px; margin: 0 auto;"
    >
      <template #header-extra>
        <n-tag type="success" size="small">✅ Authenticated</n-tag>
      </template>

      <n-space vertical size="large" style="text-align: center;">
        <!-- Success Animation -->
        <div style="font-size: 100px; animation: bounce 1s ease-in-out;">
          🎊
        </div>

        <!-- Welcome Message -->
        <div>
          <h1 style="font-size: 48px; margin: 0; background: linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient 3s ease infinite;">
            WELCOME
          </h1>
          <p style="font-size: 18px; color: rgba(255,255,255,0.8); margin-top: 12px;">
            You have successfully unlocked the secret portal!
          </p>
        </div>

        <!-- Success Alert -->
        <n-alert type="success">
          <template #icon>
            <span style="font-size: 24px;">✨</span>
          </template>
          <strong>Access Granted!</strong>
          <br>
          <span style="font-size: 13px;">
            Congratulations on finding the easter egg! You are now part of the secret club.
          </span>
        </n-alert>

        <!-- Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px;">
          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 32px;">🏆</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Achievement</div>
              <div style="font-size: 14px; font-weight: bold;">Unlocked</div>
            </div>
          </n-card>

          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 32px;">🎯</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Status</div>
              <div style="font-size: 14px; font-weight: bold;">Elite</div>
            </div>
          </n-card>

          <n-card size="small">
            <div style="text-align: center;">
              <div style="font-size: 32px;">⏱️</div>
              <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px;">Time</div>
              <div style="font-size: 14px; font-weight: bold;">{{ formatTime(Date.now()) }}</div>
            </div>
          </n-card>
        </div>

        <!-- Secret Message -->
        <n-card size="small" style="margin-top: 20px;">
          <div style="font-family: monospace; font-size: 12px; color: #10b981; text-align: left;">
            <div>> Decrypting secret message...</div>
            <div>> Access level: MAXIMUM</div>
            <div>> User status: LEGENDARY</div>
            <div>> Secret code: ██████████</div>
            <div style="margin-top: 12px; color: rgba(255,255,255,0.8);">
              > Message: "{{ secretMessage }}"
            </div>
          </div>
        </n-card>

        <!-- Actions -->
        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
          <n-button type="primary" @click="goHome" size="large">
            🏠 Go Home
          </n-button>
          <n-button @click="logout" size="large">
            🔒 Lock Again
          </n-button>
        </div>

        <!-- Easter Egg Info -->
        <n-alert type="info" size="small" style="margin-top: 20px;">
          <template #icon>
            <span style="font-size: 16px;">🥚</span>
          </template>
          <strong>Easter Egg Unlocked!</strong>
          <br>
          <span style="font-size: 12px;">
            You found this by typing "SAVACAZAN" on the ping page. Share this secret with your friends!
          </span>
        </n-alert>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const authenticated = ref(false);
const passwordInput = ref('');
const passwordError = ref('');
const checking = ref(false);
const attempts = ref(0);
const passwordInputRef = ref(null);

// Secret password (same as the code)
const SECRET_PASSWORD = 'SAVACAZAN';

// Secret messages
const secretMessages = [
  'You are a true explorer!',
  'The journey was worth it!',
  'Welcome to the inner circle!',
  'You have unlocked the matrix!',
  'Congratulations, you are now enlightened!'
];

const secretMessage = ref(secretMessages[Math.floor(Math.random() * secretMessages.length)]);

// Methods
async function checkPassword() {
  if (!passwordInput.value) {
    passwordError.value = 'Please enter a password';
    return;
  }

  if (attempts.value >= 3) {
    passwordError.value = 'Too many failed attempts. Please refresh the page.';
    return;
  }

  checking.value = true;
  passwordError.value = '';

  // Simulate checking delay for effect
  await new Promise(resolve => setTimeout(resolve, 800));

  if (passwordInput.value.toUpperCase() === SECRET_PASSWORD) {
    // Success!
    authenticated.value = true;
    window.$message?.success('🎉 Access granted! Welcome!');

    // Play success sound (if available)
    playSuccessSound();

    // Store in sessionStorage (optional)
    if (process.client) {
      sessionStorage.setItem('secret_authenticated', 'true');
    }
  } else {
    // Failed
    attempts.value++;
    passwordError.value = `Incorrect password. ${3 - attempts.value} attempts remaining.`;
    passwordInput.value = '';
    window.$message?.error('❌ Access denied!');

    // Shake animation
    if (passwordInputRef.value) {
      passwordInputRef.value.$el.style.animation = 'shake 0.5s';
      setTimeout(() => {
        if (passwordInputRef.value) {
          passwordInputRef.value.$el.style.animation = '';
        }
      }, 500);
    }

    if (attempts.value >= 3) {
      passwordError.value = '🚨 Too many failed attempts! Access locked.';
    }
  }

  checking.value = false;
}

function playSuccessSound() {
  // Optional: Play a success sound if you have one
  if (process.client && window.Audio) {
    try {
      const audio = new Audio('/success.mp3'); // Add a success sound file if you have one
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore if sound fails to play
      });
    } catch (error) {
      // Ignore audio errors
    }
  }
}

function logout() {
  authenticated.value = false;
  passwordInput.value = '';
  passwordError.value = '';
  attempts.value = 0;

  if (process.client) {
    sessionStorage.removeItem('secret_authenticated');
  }

  window.$message?.info('🔒 Portal locked again');
}

function goHome() {
  navigateTo('/');
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

// Lifecycle
onMounted(() => {
  // 🔒 SECURITY CHECK: Verify access token
  if (process.client) {
    const accessToken = sessionStorage.getItem('secret_access_token');

    // Block direct access - redirect to /ping if no token
    if (!accessToken) {
      console.log('%c🚫 ACCESS DENIED', 'color: #f87171; font-size: 20px; font-weight: bold;');
      console.log('%cThis page can only be accessed from /ping after unlocking the secret!', 'color: #fbbf24; font-size: 14px;');
      console.log('%cRedirecting to /ping...', 'color: #3b82f6; font-size: 12px;');

      window.$message?.error('❌ Access denied! This page is secret.');

      // Redirect to /ping after 1 second
      setTimeout(() => {
        navigateTo('/ping');
      }, 1000);

      return;
    }

    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem('secret_authenticated');
    if (isAuth === 'true') {
      authenticated.value = true;
    }

    // Console easter egg hint
    console.log('%c🔐 SECRET PORTAL', 'color: #8b5cf6; font-size: 24px; font-weight: bold;');
    console.log('%cYou made it to the secret page!', 'color: #10b981; font-size: 14px;');
    console.log('%cNow enter the password to proceed...', 'color: #3b82f6; font-size: 12px;');
  }

  // Focus on password input
  setTimeout(() => {
    if (passwordInputRef.value && !authenticated.value) {
      passwordInputRef.value?.focus();
    }
  }, 500);
});
</script>

<style scoped>
.secret-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.stars-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 60px 70px, #fff, transparent),
    radial-gradient(1px 1px at 50px 50px, #ddd, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 90px 10px, #eee, transparent);
  background-size: 200px 200px;
  animation: stars 20s linear infinite;
  opacity: 0.5;
}

@keyframes stars {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

.secret-card,
.welcome-card {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.secret-page :deep(.n-card) {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-20px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-10px); }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
</style>
