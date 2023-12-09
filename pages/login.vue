<template>
  <n-card title="Login" style="width:400px; margin:60px auto">
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
      <n-row :gutter="[0, 24]">
        <n-col :span="24">
          <div style="display: flex; justify-content: space-between">
            <NuxtLink to="/register" custom v-slot="{ navigate }">
              <n-button @click="navigate">
                Register
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
                await navigateTo('/dashboard')
              }, 1000)

            } else {

              notification['error']({
                content: "Error!",
                meta: `Check console for error code and message!`,
                duration: 2500,
              });
              // console.log(resp);
            }


          } catch (e){
            notification['error']({
              content: "Error!",
              meta: `Check console for error code and message!`,
              duration: 2500,
            });
            // console.log(e);
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
