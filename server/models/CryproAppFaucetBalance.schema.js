// În fișierul CryproAppFaucetBalance.schema.js

import { defineMongooseModel } from '#nuxt/mongoose';

export const CryproAppFaucetBalance = defineMongooseModel({
    name: 'CryproAppFaucetBalance',
    schema: {
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
