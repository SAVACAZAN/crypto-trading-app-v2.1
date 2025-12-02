import { defineMongooseModel } from '#nuxt/mongoose'

export const testNetworksSchema = defineMongooseModel({
    name: 'TestNetworks',
    schema: {
        // User reference
        userID: {
            type: String,
            required: true,
            index: true
        },
        // Wallet info
        walletName: {
            type: String,
            required: true
        },
        // Network details
        network: {
            type: String,
            required: true,
            enum: ['Monad', 'Berachain', 'zkSync', 'Fraction AI', 'MegaETH', 'Sepolia', 'Other']
        },
        networkSymbol: {
            type: String,
            required: true
        },
        networkType: {
            type: String,
            required: true,
            enum: ['EVM', 'Non-EVM']
        },
        chainId: {
            type: Number,
            required: false
        },
        rpcUrl: {
            type: String,
            required: false
        },
        explorerUrl: {
            type: String,
            required: false
        },
        // Wallet credentials
        address: {
            type: String,
            required: true
        },
        publicKey: {
            type: String,
            required: false
        },
        privateKey: {
            type: String,
            required: false // Not required for MetaMask wallets
        },
        mnemonic: {
            type: String,
            required: false
        },
        // Wallet type
        walletType: {
            type: String,
            required: true,
            enum: ['generated', 'metamask'],
            default: 'generated'
        },
        // Testnet specific
        faucetUrl: {
            type: String,
            required: false
        },
        portalUrl: {
            type: String,
            required: false
        },
        tasks: {
            type: Array,
            default: []
        },
        tasksCompleted: {
            type: Array,
            default: []
        },
        // Status
        isActive: {
            type: Boolean,
            default: true
        },
        balance: {
            type: String,
            default: '0'
        },
        lastActivity: {
            type: Date,
            default: Date.now
        },
        // Metadata
        note: {
            type: String,
            required: false
        },
        tags: {
            type: Array,
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
});
