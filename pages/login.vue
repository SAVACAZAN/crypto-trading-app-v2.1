<template>
  <div class="login-container">
    <!-- Background Effects -->
    <div class="bg-gradient"></div>
    <div class="grid-overlay"></div>

    <!-- Main Content -->
    <div class="login-content">
      <!-- Login Form Card -->
      <div class="login-card">
        <div class="card-header">
          <h1 class="login-title">Welcome Back</h1>
          <p class="login-subtitle">Sign in to continue trading</p>
        </div>

        <n-form ref="formRef" :model="modelRef" :rules="rules" size="large">
          <!-- Username Input -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">👤</span>
              Username
            </label>
            <n-input
              v-model:value="modelRef.username"
              placeholder="Enter your username"
              @keydown.enter.prevent="handleValidateButtonClick"
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
              placeholder="Enter your password"
              @input="handlePasswordInput"
              @keydown.enter.prevent="handleValidateButtonClick"
              class="custom-input"
            />
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
              <span class="btn-text">Sign In</span>
              <span class="btn-icon">→</span>
            </n-button>
          </div>
        </n-form>

        <!-- Register Link -->
        <div class="footer-section">
          <p class="footer-text">
            Don't have an account?
            <NuxtLink to="/register" class="register-link">
              Create Account
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
import {ref} from "vue";
import { useAppStore } from '~/stores/app.store';

const notification = useNotification();
const app = useAppStore()
const formRef = ref(null);
const rPasswordFormItemRef = ref(null);
const message = useMessage();
const modelRef = ref({
  username: null,
  password: null,
});
function validatePasswordStartWith(rule, value) {
  return !!modelRef.value.password && modelRef.value.password.startsWith(value) && modelRef.value.password.length >= value.length;
}
function validatePasswordSame(rule, value) {
  return value === modelRef.value.password;
}

function handlePasswordInput() {
  rPasswordFormItemRef.value?.validate({ trigger: "password-input" });
}

function handleValidateButtonClick(e) {
  e.preventDefault();
  formRef.value?.validate(
      async (errors) => {
        if (!errors) {
          // message.success("Valid");

          let data = {
            username:modelRef.value.username,
            password:modelRef.value.password,
          }

          try {

            let resp = await $fetch( '/api/v1/login', {
              method: 'POST',
              body: data
            } );

            if (resp.data) {

              notification['info']({
                content: "User Logged In!",
                meta: `The user ${resp.data.username} has been successfully authenticated. You will be redirected in a moment!`,
                duration: 2500,
              });

              setTimeout(async () => {
                await navigateTo('/cryptoapp')
              }, 1000)

            } else {

              notification['error']({
                content: "Error!",
                meta: `Check console for error code and message!`,
                duration: 2500,
              });
              console.log(resp);
            }


          } catch (e){
            notification['error']({
              content: "Error!",
              meta: `${e.statusMessage || e.message}`,
              duration: 2500,
            });
            console.log(e);
          }


        } else {
          // console.log(errors);
          // message.error("Invalid");
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
};
</script>

<style scoped>
.login-container {
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
.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
  padding: 15px;
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 235, 4, 0.2);
  border-radius: 16px;
  padding: 35px 30px 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Card Header */
.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 0 30px rgba(16, 235, 4, 0.3);
}

.login-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
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

/* Action Buttons */
.form-actions {
  margin-top: 25px;
}

.submit-btn {
  height: 48px !important;
  background: linear-gradient(135deg, #10eb04, #05f5ed) !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 16px !important;
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
  margin-top: 20px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-text {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.register-link {
  color: #10eb04;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-left: 5px;
}

.register-link:hover {
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
  .login-content {
    max-width: 100%;
    padding: 10px;
  }

  .login-card {
    padding: 25px 20px 20px;
  }

  .card-header {
    margin-bottom: 25px;
  }

  .login-title {
    font-size: 26px;
  }

  .login-subtitle {
    font-size: 13px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .submit-btn {
    height: 44px !important;
  }

  .footer-section {
    margin-top: 16px;
    padding-top: 16px;
  }
}
</style>
