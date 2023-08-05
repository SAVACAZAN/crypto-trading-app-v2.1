// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // ssr:false,
  modules: [
    '@pinia/nuxt',
    // '@pinia-plugin-persistedstate/nuxt',
    'nuxt-mongoose',
    '@bg-dev/nuxt-naiveui'
  ],
  mongoose: {
    uri: 'mongodb://127.0.0.1:27017/crypto-app',
    options: {},
    modelsDir: 'models',
  },
  naiveui: {
    colorModePreference: "light",
    iconSize: 18,
    themeConfig: {},
  },
  devtools: {
    enabled: true
  },
  // @ts-ignore
  build: {
    target: 'esnext'
  }
})
