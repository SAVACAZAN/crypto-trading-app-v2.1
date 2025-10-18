
<template>
    
    <n-grid x-gap="12" :cols="12" item-responsive>
      <n-gi span="12 800:8">
      
      

      
 
        <TickerBar2/>
     
        
        
      </n-gi>
    </n-grid>
  
  
  </template>
  
  
  
  
  <script setup>
  import FrontRunningBotsForm from '~/components/frontrun-bots-form.vue';
  
  definePageMeta({
    middleware: 'auth'
  })
  import { useAppStore } from '~/stores/app.store';
  const app = useAppStore()
  let userID = useCookie('userID');
  
  await app.loadUserExchangeData(userID.value);
  </script>
  
  
  <style scoped>
/* Stil pentru întreaga grilă */
.n-grid {
  padding: 20px;
  gap: 20px;
}

/* Stil pentru secțiunea principală */
.n-gi {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Stil pentru barele de selecție (TickerBar2) */
.ticker-bar {
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 10px;
}

/* Stil pentru cardurile interne */
.n-card {
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Stil pentru select-box-uri */
.n-select {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  background-color: #fff;
}

/* Stil pentru butoane */
.n-button {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-align: center;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  transition-duration: 0.4s;
}

.n-button:hover {
  background-color: #0056b3;
}

/* Stil pentru text */
p, h1, h2, h3, h4 {
  color: #333;
  font-family: 'Arial', sans-serif;
}

</style>
