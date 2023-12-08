<template>
    <h2>Dashboard</h2>

    <div v-for="exchange in exchanges">

      <n-grid x-gap="12" :cols="12">
        <n-gi span="8">
          <h3>Exchange: {{exchange.name}}</h3>
          <h4>Estimated Balance: ~ {{ exchange.totalUSD }}</h4>
          <n-data-table
              :columns="tableColumns"
              :data="exchange.lastBalance"
          />
        </n-gi>
        <n-gi span="4">
          <h3>Asset Allocation</h3>

          <n-space style="max-width:400px">
            <Pie :data="formatBalance(exchange.lastBalance)" />
          </n-space>
        </n-gi>
      </n-grid>
      <n-divider></n-divider>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)
let userID = useCookie('userID');

let loaded = true;
//get user exchanges
const dbExchanges = await $fetch('/api/v1/fetchUserExchanges', {
  query:{
    userID:userID.value,
  }
});

let exchanges = [];

if (dbExchanges.data.length) {
  for (let i = 0; i < dbExchanges.data.length; i++) {

    let currentExchange = dbExchanges.data[i].exchange;

    const response = await $fetch('/api/v1/fetchUserDbBalance', {
        query:{
            userID:userID.value,
            exchange:currentExchange,
        }
    });

    if (response.data.length) {
      exchanges.push({
        name:currentExchange,
        lastBalance:response.data[response.data.length - 1].balance,
        allBalance:response.data,
        totalUSD:response.data[response.data.length - 1].totalUSD,
      })
    }
  }
}

const tableColumns = [
  {
    title: "Coin",
    key: "coin",
  },
  {
    title: "Free",
    key: "free",
  },
  {
    title: "Used",
    key: "used",
  },
  {
    title: "Total",
    key: "total"
  },
  {
    title: "Total USD",
    key: "usdt",
  },
];


function formatBalance(balance) {
  let data = {
    labels: [],
    datasets: [
      {
        backgroundColor: [],
        data: []
      }
    ]
  }

  for (let i = 0; i < balance.length; i++) {
    data.labels.push(balance[i].coin);
    data.datasets[0].data.push(balance[i].total);
    data.datasets[0].backgroundColor.push(stringToHex(balance[i].coin));
  }

  // console.log(data);

  return data;
}

function stringToHex(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    rgb[i] = (hash >> (i * 8)) & 255;
  }

  const hex = rgb.reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

  return `#${hex}`;
}

</script>
