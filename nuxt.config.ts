// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
  // ssr:false,
  modules: [
    '@nuxt/devtools',
    '@pinia/nuxt',
    // '@pinia-plugin-persistedstate/nuxt',
    'nuxt-mongoose',
    '@bg-dev/nuxt-naiveui'
  ],

  mongoose: {
    uri: 'mongodb://127.0.0.1:27017/crypto-app-github',
    options: {},
    modelsDir: 'models',
  },


  devtools: {
    enabled: false
  },


  // build: {
  //   target: 'esnext'
  // },
})
