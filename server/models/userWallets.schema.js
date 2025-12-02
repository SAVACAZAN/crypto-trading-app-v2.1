import { defineMongooseModel } from '#nuxt/mongoose'

export const userWalletsSchema = defineMongooseModel({
    name: 'UserWallets',
    schema: {
        userID: {
            type: String,
            required: true,
            index: true
        },
        walletName: {
            type: String,
            required: true
        },
        network: {
            type: String,
            required: true
        },
        networkSymbol: {
            type: String,
            required: false
        },
        chainId: {
            type: Number,
            required: false
        },
        walletType: {
            type: String,
            required: true,
            enum: ['EVM', 'Non-EVM', 'L2']
        },
        // For EVM wallets
        address: {
            type: String,
            required: false
        },
        // For Non-EVM wallets
        publicKey: {
            type: String,
            required: false
        },
        // Encrypted private data (should be encrypted in production!)
        // For mnemonic-based wallets (Cosmos, Polkadot), this may be empty
        privateKey: {
            type: String,
            required: false,
            default: ''
        },
        mnemonic: {
            type: String,
            required: false
        },
        // Additional info
        isDefault: {
            type: Boolean,
            default: false
        },
        balance: {
            type: String,
            default: '0'
        },
        balanceUSD: {
            type: String,
            default: '0'
        },
        note: {
            type: String,
            required: false
        },
        tags: {
            type: Array,
            default: []
        },
        // Metadata
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastUsed: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }
});
