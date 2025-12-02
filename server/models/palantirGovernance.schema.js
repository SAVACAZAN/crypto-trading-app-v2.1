import { defineMongooseModel } from '#nuxt/mongoose'

export const palantirGovernanceSchema = defineMongooseModel({
    name: 'palantirGovernance',
    schema: {
        userID: {
            type: String,
            required: true,
            index: true
        },
        apiKeyId: {
            // Format: exchangeMongoId_keyIndex (e.g., "66e5d23b4844420459b54ee9_0")
            type: String,
            required: true
        },
        exchange: {
            type: String,
            required: true
        },
        apiKeyName: {
            type: String,
            required: true
        },
        governanceLevel: {
            // empire, coalition, federation, alliance, syndicate, enterprise, directorate, organization, corporation, division
            type: String,
            required: true,
            enum: [
                'empire',
                'coalition',
                'federation',
                'alliance',
                'syndicate',
                'enterprise',
                'directorate',
                'organization',
                'corporation',
                'division'
            ]
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            default: ''
        }
    },
    options: {
        timestamps: true
    }
})
