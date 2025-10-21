import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => {
        return {
            userExchanges:[],
            userSelectedExchange:'',
            userExchangeMarkets:[],
            userSelectedMarket:'',
            timeframes:null,
            selectedApiKey:null,
            selectedApiKeys:[], // Array for multiple API keys
            currentPrice: null, // Live price from ticker
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
            if (!state.userSelectedMarket || !state.userSelectedMarket.base) {
                return 'LCX/USDC'; // Default fallback
            }
            return `${state.userSelectedMarket.base}/${state.userSelectedMarket.quote}`;
        },
        getAvailableTimeframes(state) {
            return state.timeframes;
        },
        getSelectedApiKey(state) {
            // Return first API key from array (for single API compatibility)
            if (state.selectedApiKeys && state.selectedApiKeys.length > 0) {
                return state.selectedApiKeys[0];
            }
            return state.selectedApiKey; // Fallback to old single API key
        },
        getSelectedApiKeys(state) {
            return state.selectedApiKeys || [];
        },
        // NEW GETTERS FOR GLOBAL ACCESS
        getSelectedTicker(state) {
            if (!state.userSelectedMarket || !state.userSelectedMarket.base) {
                return 'LCX/USDC'; // Default
            }
            return `${state.userSelectedMarket.base}/${state.userSelectedMarket.quote}`;
        },
        getSelectedExchange(state) {
            return state.userSelectedExchange || 'coinbaseadvanced'; // Default
        },
        getCurrentPrice(state) {
            return state.currentPrice;
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
                let hasSelectedExchange = false;

                for (let i = 0; i < response.data.length; i++) {

                    if (response.data[i].isSelectedExchange) {
                        hasSelectedExchange = true;
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

                // SET DEFAULT IF NO EXCHANGE IS SELECTED
                if (!hasSelectedExchange) {
                    // Try to find coinbaseadvanced in exchanges
                    const hasCoinbase = response.data.find(ex => ex.exchange === 'coinbaseadvanced');
                    if (hasCoinbase) {
                        console.log('🔧 Setting default: coinbaseadvanced + LCX/USDC');

                        // Set default exchange
                        this.userSelectedExchange = 'coinbaseadvanced';
                        this.timeframes = hasCoinbase.timeframes;

                        // Set markets for coinbaseadvanced
                        let markets = [];
                        for (let j = 0; j < hasCoinbase.markets.length; j++) {
                            markets.push({
                                label:`${hasCoinbase.markets[j].base}/${hasCoinbase.markets[j].quote}`,
                                value:`${hasCoinbase.markets[j].base}/${hasCoinbase.markets[j].quote}`
                            });
                        }
                        this.userExchangeMarkets = markets;

                        // Set default market to LCX/USDC if available
                        const lcxUSDC = hasCoinbase.markets.find(m => m.base === 'LCX' && m.quote === 'USDC');
                        if (lcxUSDC) {
                            this.userSelectedMarket = lcxUSDC;
                            // Save to database
                            await this.updateUserSelectedExchange(userID, 'coinbaseadvanced');
                            await this.updateUserSelectedMarket(userID, 'coinbaseadvanced', 'LCX/USDC');
                        } else {
                            // Fallback to first market
                            this.userSelectedMarket = hasCoinbase.markets[0] || { base: 'LCX', quote: 'USDC' };
                        }
                    }
                }
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
        setSelectedApiKey(apiKey) {
            this.selectedApiKey = apiKey;
        },
        setSelectedApiKeys(apiKeys) {
            this.selectedApiKeys = apiKeys;
        },
        setCurrentPrice(price) {
            this.currentPrice = price;
        }
    },
})
