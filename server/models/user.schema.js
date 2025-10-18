// În fișierul user.schema.js

import { defineMongooseModel } from '#nuxt/mongoose';

export const userSchema = defineMongooseModel({
    name: 'users',
    schema: {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        referralCode: {
            type: String,
            required: false
        },
        referredBy: {
            type: String,
            required: false
        },
        BitcoinWallet: {
            mnemonic: {
                type: String,
                required: false
            },
            Key: {
                type: String,
                required: false
            },
            address: {
                type: String,
                required: false
            }
        },
        EthereumWallet: {
            mnemonic: {
                type: String,
                required: false
            },
            Key: {
                type: String,
                required: false
            },
            address: {
                type: String,
                required: false
            }
        },
        CryptoAppWallet: {
            mnemonic: {
                type: String,
                required: false
            },
            Key: {
                type: String,
                required: false
            },
            address: {
                type: String,
                required: false
            }
        },
        faucet: {
            BitcoinFaucet: {
                claimAt: Date, // Vom folosi tipul Date pentru a stoca data la care s-a făcut ultima cerere de faucet
                BitcoinFaucetuserBalance: Number, // Vom folosi tipul Number pentru a stoca balanța utilizatorului în faucet
                action: String // Poate fi un șir care indică ultima acțiune (de exemplu, 'claimed' pentru cerere efectuată)
            },
            EthereumFaucet: {
                claimAt: Date, // Vom folosi tipul Date pentru a stoca data la care s-a făcut ultima cerere de faucet
                EthereumFaucetuserBalance: Number, // Vom folosi tipul Number pentru a stoca balanța utilizatorului în faucet
                action: String // Poate fi un șir care indică ultima acțiune (de exemplu, 'claimed' pentru cerere efectuată)
            },
            CryptoAppFaucet: {
                claimAt: Date, // Vom folosi tipul Date pentru a stoca data la care s-a făcut ultima cerere de faucet
                CryptoAppFaucetuserBalance: Number, // Vom folosi tipul Number pentru a stoca balanța utilizatorului în faucet
                action: String // Poate fi un șir care indică ultima acțiune (de exemplu, 'claimed' pentru cerere efectuată)
            },
        },

    },
});
