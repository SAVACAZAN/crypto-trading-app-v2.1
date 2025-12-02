<template>
  <div class="register-container">
    <!-- Background Effects -->
    <div class="bg-gradient"></div>
    <div class="grid-overlay"></div>

    <!-- Main Content -->
    <div class="register-content">
      <!-- Register Form Card -->
      <div class="register-card">
        <n-form ref="formRef" :model="modelRef" :rules="rules" size="large">
          <!-- Username Input -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">👤</span>
              Username
            </label>
            <n-input
              v-model:value="modelRef.username"
              placeholder="Choose your username"
              @keydown.enter.prevent
              class="custom-input"
            />
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔒</span>
              Password
            </label>
            <n-input
              v-model:value="modelRef.password"
              type="password"
              placeholder="Create a strong password"
              @input="handlePasswordInput"
              @keydown.enter.prevent
              class="custom-input"
            />
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✓</span>
              Confirm Password
            </label>
            <n-input
              v-model:value="modelRef.reenteredPassword"
              :disabled="!modelRef.password"
              type="password"
              placeholder="Re-enter your password"
              @keydown.enter.prevent
              class="custom-input"
            />
          </div>

          <!-- Referral Code Input -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🎁</span>
              Referral Code
              <span class="optional-badge">Optional</span>
            </label>
            <n-input
              v-model:value="modelRef.referralCode"
              :disabled="cameFromReferralLink"
              :placeholder="cameFromReferralLink ? 'Referred by link' : 'Enter referral code (optional)'"
              @keydown.enter.prevent
              class="custom-input"
              :class="{ 'input-locked': cameFromReferralLink }"
            />
            <div v-if="cameFromReferralLink" class="referral-success">
              <span class="success-icon">✓</span>
              <span class="ref-text">Referred by:</span>
              <strong class="ref-code">{{ modelRef.referralCode }}</strong>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <n-button
              type="primary"
              size="large"
              block
              :disabled="!modelRef.username"
              @click="handleValidateButtonClick"
              class="submit-btn"
            >
              <span class="btn-text">Create Account</span>
              <span class="btn-icon">→</span>
            </n-button>
          </div>
        </n-form>

        <!-- Login Link -->
        <div class="footer-section">
          <p class="footer-text">
            Already have an account?
            <NuxtLink to="/login" class="login-link">
              Sign In
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Since 1993 Bar -->
    <div class="since-bar">
      <span class="since-text">Since 1993</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "no-sidebar",
});
import { ref, onMounted } from "vue";
import { useRoute } from 'vue-router';

const notification = useNotification();
const route = useRoute();

const formRef = ref(null);
const rPasswordFormItemRef = ref(null);
const message = useMessage();

// Check if user came from referral link
const cameFromReferralLink = ref(false);

const modelRef = ref({
  username: null,
  password: null,
  reenteredPassword: null,
  referralCode: null  // Adăugăm câmpul pentru codul de referal
});

// Auto-fill referral code from URL on mount
onMounted(() => {
  const refCode = route.query.ref;
  if (refCode) {
    modelRef.value.referralCode = refCode;
    cameFromReferralLink.value = true;

    notification.info({
      content: 'Referral Code Applied',
      meta: `You were referred by: ${refCode}`,
      duration: 4000
    });
  }
});
function validatePasswordStartWith(rule, value) {
  return !!modelRef.value.password && modelRef.value.password.startsWith(value) && modelRef.value.password.length >= value.length;
}
function validatePasswordSame(rule, value) {
  return value === modelRef.value.password;
}

function handlePasswordInput() {
  if (modelRef.value.reenteredPassword) {
    rPasswordFormItemRef.value?.validate({ trigger: "password-input" });
  }
}

async function handleValidateButtonClick() {
  formRef.value?.validate(
      async (errors) => {
        if (!errors) {
          const data = {
            username: modelRef.value.username,
            password: modelRef.value.password,
            referralCode: modelRef.value.referralCode  // Trimitem și codul de referal la server
          }

          try {
            const resp = await $fetch('/api/v1/register', {
              method: 'POST',
              body: data
            });

            notification['info']({
              content: "Registered User!",
              meta: `The user ${modelRef.value.username} has been successfully registered. Please log in!`,
              duration: 2500,
            });

            setTimeout(async () => {
              await navigateTo('/login')
            }, 1000);
          } catch (error) {
            console.error(error);
            // Handle error notification or display to user
          }
        } else {
          console.log(errors);
        }
      }
  );
}

const rules = {
  username: [
    {
      required: true,
      validator(rule, value) {
        if (!value) {
          return new Error("Username is required");
        }
        return true;
      },
      trigger: ["input", "blur"]
    }
  ],
  password: [
    {
      required: true,
      message: "Password is required"
    }
  ],
  reenteredPassword: [
    {
      required: true,
      message: "Re-entered password is required",
      trigger: ["input", "blur"]
    },
    {
      validator: validatePasswordStartWith,
      message: "Password is not same as re-entered password!",
      trigger: "input"
    },
    {
      validator: validatePasswordSame,
      message: "Password is not same as re-entered password!",
      trigger: ["blur", "password-input"]
    }
  ],
  referralCode: [  // Referral code is optional
    {
      validator(rule, value) {
        // Optional field - only validate if value exists
        if (value && value.length > 0) {
          // Validate format (3-20 alphanumeric)
          const codeRegex = /^[a-zA-Z0-9]{3,20}$/;
          if (!codeRegex.test(value)) {
            return new Error("Referral code must be 3-20 alphanumeric characters");
          }
        }
        return true;
      },
      trigger: ["input", "blur"]
    }
  ]
}
</script>

<style scoped>
.register-container {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a0118;
}

/* Background Effects */
.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at top, rgba(16, 235, 4, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(5, 245, 237, 0.15) 0%, transparent 50%);
  z-index: 0;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(16, 235, 4, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 235, 4, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 0;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Main Content */
.register-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 15px;
}

/* Register Card */
.register-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 16px;
  padding: 25px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Form Groups */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 16px;
}

.optional-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

/* Custom Input Styling */
.form-group :deep(.n-input) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(16, 235, 4, 0.2) !important;
  border-radius: 10px !important;
  transition: all 0.3s ease !important;
}

.form-group :deep(.n-input:hover) {
  border-color: rgba(16, 235, 4, 0.4) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.form-group :deep(.n-input.n-input--focus) {
  border-color: rgba(16, 235, 4, 0.6) !important;
  background: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 0 0 3px rgba(16, 235, 4, 0.1) !important;
}

.form-group :deep(.n-input__input-el) {
  color: #fff !important;
  font-size: 15px !important;
  font-weight: 500 !important;
}

.form-group :deep(.n-input__input-el::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

.form-group :deep(.n-input.n-input--disabled) {
  background: rgba(255, 165, 0, 0.1) !important;
  border-color: rgba(255, 165, 0, 0.3) !important;
  opacity: 1 !important;
}

/* Referral Success Message */
.referral-success {
  margin-top: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.15), rgba(5, 245, 237, 0.15));
  border: 1px solid rgba(16, 235, 4, 0.4);
  border-radius: 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: default;
}

.referral-success:hover {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.25), rgba(5, 245, 237, 0.25));
  border-color: rgba(16, 235, 4, 0.6);
  box-shadow: 0 0 15px rgba(16, 235, 4, 0.3);
  transform: translateY(-2px);
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #0a0118;
  box-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
}

.ref-text {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.ref-code {
  color: #10eb04;
  font-weight: 800;
  font-size: 13px;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.6);
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.referral-success:hover .ref-code {
  text-shadow: 0 0 12px rgba(16, 235, 4, 0.8);
  transform: scale(1.05);
}

/* Action Buttons */
.form-actions {
  margin-top: 20px;
}

.submit-btn {
  height: 45px !important;
  background: linear-gradient(135deg, #10eb04, #05f5ed) !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  color: #0a0118 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(16, 235, 4, 0.3) !important;
}

.submit-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(16, 235, 4, 0.4) !important;
}

.submit-btn:active {
  transform: translateY(0px) !important;
}

.submit-btn :deep(.n-button__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-icon {
  font-size: 18px;
  font-weight: 900;
}

/* Footer Section */
.footer-section {
  margin-top: 16px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.login-link {
  color: #10eb04;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-left: 5px;
}

.login-link:hover {
  color: #05f5ed;
  text-decoration: underline;
}

/* Since 1993 Bar */
.since-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  padding: 18px 0;
  text-align: center;
  background: linear-gradient(180deg, transparent, rgba(16, 235, 4, 0.08));
  border-top: 1px solid rgba(16, 235, 4, 0.3);
  z-index: 1000;
  backdrop-filter: blur(8px);
  margin: 0;
}

.since-text {
  font-size: 13px;
  font-weight: 800;
  color: rgba(16, 235, 4, 0.9);
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 15px rgba(16, 235, 4, 0.4);
}

/* Responsive Design */
@media (max-width: 600px) {
  .register-content {
    max-width: 100%;
    padding: 10px;
  }

  .register-card {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .submit-btn {
    height: 42px !important;
  }

  .footer-section {
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
