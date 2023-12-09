<template>
    <h2>Profile</h2>
    <h3>My Exchanges</h3>
    <n-data-table
        :columns="tableColumns"
        :data="tableData"
        :pagination="tablePagination"
    />
    <n-divider></n-divider>
    <h3>Add new exchange</h3>
    <n-space vertical>
        <n-select v-model:value="selectedExchange"
                  :options="availableExchanges"
                  placeholder="Select exchange"
                  filterable
        />
        <n-dynamic-input
            v-model:value="apiKeys"
            preset="pair"
            key-placeholder="Please input the key"
            value-placeholder="Please input the value"
        />

        <n-button @click="addExchange" :disabled="addBtn.disabled">{{addBtn.text}}</n-button>
    </n-space>
</template>

<script setup>
import { NButton } from "naive-ui";
definePageMeta({
    middleware: 'auth'
})
let userIDCookie = useCookie('userID');
let userID = userIDCookie.value;


const notification = useNotification();

const addBtn = ref({
  'text':'Add exchange',
  'disabled':false,
});

//show data
const tablePagination = false;
const tableColumns = [
    {
        title: "Exchange",
        key: "exchange",
    },
    {
        title: "API Keys",
        key: "apiKeys"
    },
    {
        title: "Actions",
        key: "actions",
        render(row) {
            return h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    size: "small",
                    onClick: () => deleteKeys(row)
                },
                { default: () => "Delete" }
            );
        }
    },
];

let userExchanges = await $fetch('/api/v1/fetchUserExchanges', {
    query:{
        userID:userID,
    }
});

const tableData = ref([]);
for (let i = 0; i < userExchanges.data.length; i++) {
    tableData.value.push({
        id:userExchanges.data[i]._id,
        exchange:userExchanges.data[i].exchange,
        apiKeys:userExchanges.data[i].apiKeys[0].value,
        actions:''
    })
}

//add data
const selectedExchange = ref(null);
let exchanges = await $fetch('/api/v1/fetchCCXTExchanges');
let availableExchanges = [];

for (let i = 0; i < exchanges.data.length; i++) {
    availableExchanges.push({
        label:exchanges.data[i],
        value:exchanges.data[i],
    })
}
const apiKeys = ref([
    {
        key: "apiKey",
        value: ""
    },
    {
        key: "secret",
        value: ""
    }
]);

async function addExchange() {
    let data = {
        userID:userID,
        exchange:selectedExchange.value,
        apiKeys:apiKeys.value,
    }

    //disable add exchange btn
    //change exchange btn text
    addBtn.value.text = 'Please wait...';
    addBtn.value.disabled = true;

    let resp = await $fetch( '/api/v1/addUserExchange', {
        method: 'POST',
        body: data
    } );

    tableData.value.push({
        id:resp.data._id,
        exchange:resp.data.exchange,
        apiKeys:resp.data.apiKeys[0].value,
        actions:''
    })

    notify('info', {
        content: "Exchange added",
        meta: `The exchange ${data.exchange} has been successfully added to the database!`,
    });

    //remove exchange/apikey/secret
    selectedExchange.value = null;
    apiKeys.value = [
      {
        key: "apiKey",
        value: ""
      },
      {
        key: "secret",
        value: ""
      }
    ];

    //reset add exchange btn
    addBtn.value.text = 'Add exchange';
    addBtn.value.disabled = false;
}

async function deleteKeys(row) {
    let data = {
        userID:userID,
        exchange:row.exchange,
        id:row.id,
    }

    let resp = await $fetch( '/api/v1/deleteUserExchange', {
        method: 'POST',
        body: data
    } );

    const index = tableData.value.findIndex((obj) => obj.id === resp.data._id);
    if (index !== -1) {
        tableData.value.splice(index, 1);
    }

    notify('info', {
        content: "Exchange deleted",
        meta: `The exchange ${data.exchange} has been successfully deleted from the database!`,
    });
}

function notify(type, data) {
    notification[type]({
        content: data.content,
        meta: data.meta,
        duration: 2500,
        keepAliveOnHover: true
    });
}

</script>
