<template>
  <n-card title="Register" style="width:400px; margin:60px auto">
    <n-form ref="formRef" :model="modelRef" :rules="rules">
      <n-form-item path="username" label="Username">
        <n-input v-model:value="modelRef.username" @keydown.enter.prevent />
      </n-form-item>
      <n-form-item path="password" label="Password">
        <n-input
            v-model:value="modelRef.password"
            type="password"
            @input="handlePasswordInput"
            @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item
          ref="rPasswordFormItemRef"
          first
          path="reenteredPassword"
          label="Re-enter Password"
      >
        <n-input
            v-model:value="modelRef.reenteredPassword"
            :disabled="!modelRef.password"
            type="password"
            @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item path="referralCode" label="Referral Code">
        <n-input v-model:value="modelRef.referralCode" @keydown.enter.prevent />
      </n-form-item>
      <n-row :gutter="[0, 24]">
        <n-col :span="24">
          <div style="display: flex; justify-content: space-between">
            <NuxtLink to="/login" custom v-slot="{ navigate }">
              <n-button @click="navigate">
                Login
              </n-button>
            </NuxtLink>
            <n-button
                :disabled="modelRef.username === null"
                type="primary"
                @click="handleValidateButtonClick"
            >
              Submit
            </n-button>
          </div>
        </n-col>
      </n-row>
    </n-form>
  </n-card>
</template>

<script setup>
definePageMeta({
  layout: "no-sidebar",
});
import { ref } from "vue";
const notification = useNotification();

const formRef = ref(null);
const rPasswordFormItemRef = ref(null);
const message = useMessage();
const modelRef = ref({
  username: null,
  password: null,
  reenteredPassword: null,
  referralCode: null  // Adăugăm câmpul pentru codul de referal
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
  referralCode: [  // Adăugăm regulile pentru codul de referal
    {
      validator(rule, value) {
        // În acest exemplu, presupunem că codul de referal trebuie să aibă exact 6 caractere
        if (!value || value.length !== 9) {
          return new Error("Referral code must be 6 characters long");
        }
        return true;
      },
      trigger: ["input", "blur"]
    }
  ]
}
</script>
