import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => {
        return {
            userExchanges:[],
            userSelectedExchange:'',
            userExchangeMarkets:[],
            userSelectedMarket:'',
            timeframes:null,
        }
    },
    getters:{
        getUserExchanges(state) {
            return state.userExchanges;
        },
        getUserSelectedExchange(state) {
            return state.userSelectedExchange;
        },
        getUserExchangeMarkets(state) {
            return state.userExchangeMarkets;
        },
        getUserSelectedMarket(state) {
            return `${state.userSelectedMarket.base}/${state.userSelectedMarket.quote}`;
        },
        getAvailableTimeframes(state) {
            return state.timeframes;
        }
    },
    actions: {
        async loadUserExchangeData(userID) {
            let response = await $fetch('/api/v1/fetchUserExchanges', {
                query:{
                    userID,
                }
            });

            if (response.data.length) {
                let exchanges = [];

                for (let i = 0; i < response.data.length; i++) {

                    if (response.data[i].isSelectedExchange) {
                        this.userSelectedExchange = response.data[i].exchange;
                        this.timeframes = response.data[i].timeframes;

                        let markets = [];
                        for (let j = 0; j < response.data[i].markets.length; j++) {
                            markets.push({
                                label:`${response.data[i].markets[j].base}/${response.data[i].markets[j].quote}`,
                                value:`${response.data[i].markets[j].base}/${response.data[i].markets[j].quote}`
                            });
                        }

                        this.userExchangeMarkets = markets;
                        this.userSelectedMarket =  response.data[i].selectedMarket;
                    }

                    exchanges.push({
                        label:response.data[i].exchange,
                        value:response.data[i].exchange,
                    });

                }

                this.userExchanges = exchanges;
            }
        },
        async updateUserSelectedExchange(userID, exchange) {
            let data = {
                userID:userID,
                exchange:exchange,
            }

            let resp = await $fetch( '/api/v1/updateUserSelectedExchange', {
                method: 'POST',
                body: data
            } );
        },
        async updateUserSelectedMarket(userID, exchange, market) {
            let data = {
                userID:userID,
                exchange:exchange,
                market:market,
            }

            let resp = await $fetch( '/api/v1/updateUserSelectedMarket', {
                method: 'POST',
                body: data
            } );
        },
    },
})
