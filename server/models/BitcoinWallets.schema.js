import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * Bitcoin Wallets Collection
 * Stores complete Bitcoin wallet data with ALL 5 address types
 * Based on generateALL-BTC-Types.js output format
 */
export const BitcoinWalletsSchema = defineMongooseModel({
    name: 'BitcoinWallets',
    schema: {
        // User Info
        userID: {
            type: String,
            required: true,
            index: true
        },
        walletName: {
            type: String,
            required: true,
            default: 'Bitcoin Wallet'
        },

        // Master Wallet Info (from generateALL-BTC-Types.js)
        generatedAt: {
            type: Date,
            default: Date.now
        },
        version: {
            type: String,
            default: 'complete-v1.1-passphrase'
        },
        mnemonic: {
            type: String,
            required: true
        },
        passphrase: {
            type: String,
            default: ''
        },
        hasPassphrase: {
            type: Boolean,
            default: false
        },
        wordCount: {
            type: Number,
            enum: [12, 24],
            default: 12
        },

        // Master Keys
        masterSeed: {
            type: String,
            required: true
        },
        masterPrivateKey: {
            type: String,
            required: true
        },
        masterPublicKey: {
            type: String,
            required: true
        },

        // 10 Wallets with 5 Address Types Each (exact structure from generateALL-BTC-Types.js)
        wallets: [{
            index: Number,
            name: String,  // SAVACAZAN, ALEX, MIRUNA, INGRID, ADI, MAMA, TATA, BANK, VAULT, EU
            emoji: String,
            description: String,

            addresses: {
                // 🔑 Legacy (P2PKH) - starts with "1"
                legacy: {
                    type: { type: String },
                    path: { type: String },
                    address: { type: String },
                    privateKeyWIF: { type: String },
                    privateKeyHex: { type: String },
                    publicKey: { type: String }
                },

                // 📜 Script Hash (P2SH) - starts with "3"
                scriptHash: {
                    type: { type: String },
                    path: { type: String },
                    address: { type: String },
                    privateKeyWIF: { type: String },
                    privateKeyHex: { type: String },
                    publicKey: { type: String }
                },

                // ⚡ SegWit (P2SH-P2WPKH) - starts with "3"
                segwit: {
                    type: { type: String },
                    path: { type: String },
                    address: { type: String },
                    privateKeyWIF: { type: String },
                    privateKeyHex: { type: String },
                    publicKey: { type: String }
                },

                // 🚀 Native SegWit (P2WPKH) - starts with "bc1q"
                nativeSegwit: {
                    type: { type: String },
                    path: { type: String },
                    address: { type: String },
                    privateKeyWIF: { type: String },
                    privateKeyHex: { type: String },
                    publicKey: { type: String }
                },

                // 🌳 Taproot (P2TR) - starts with "bc1p"
                taproot: {
                    type: { type: String },
                    path: { type: String },
                    address: { type: String },
                    privateKeyWIF: { type: String },
                    privateKeyHex: { type: String },
                    publicKey: { type: String }
                }
            }
        }],

        // Metadata
        isActive: {
            type: Boolean,
            default: true
        },
        lastUsed: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            default: '⚠️ KEEP THIS WALLET SECURE! Contains all private keys for 10 wallets × 5 address types = 50 Bitcoin addresses'
        },
        tags: {
            type: [String],
            default: ['Bitcoin', 'BTC', 'Multi-Address', 'Complete']
        }
    }
});
