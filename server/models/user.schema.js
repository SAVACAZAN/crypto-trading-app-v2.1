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
        codeEditedOnce: {
            type: Boolean,
            required: false,
            default: false
        },
        referredByEdited: {
            type: Boolean,
            required: false,
            default: false
        },
        // Referral Tier System
        referralTier: {
            tier: {
                type: String,
                enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
                default: 'Bronze'
            },
            commission: {
                type: Number,
                default: 5 // percentage
            },
            monthlyBonus: {
                type: Number,
                default: 10 // USDT
            },
            badge: {
                type: String,
                default: '/Refferalls-images/Bronze.svg'
            },
            benefits: {
                type: Array,
                default: [
                    '5% commission from referral trades',
                    'Access to basic referral dashboard',
                    'Monthly bonus: 10 USDT'
                ]
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        // Multi-Level Referral Points System (5 tiers deep)
        referralPoints: {
            totalPoints: {
                type: Number,
                default: 0
            },
            // Points earned from each tier level
            pointsByTier: {
                level1: { type: Number, default: 0 }, // 25% from direct referrals
                level2: { type: Number, default: 0 }, // 15% from level 2
                level3: { type: Number, default: 0 }, // 10% from level 3
                level4: { type: Number, default: 0 }, // 5% from level 4
                level5: { type: Number, default: 0 }  // 2% from level 5
            },
            // Track referral chain (up to 5 levels)
            referralChain: {
                level1: { type: Array, default: [] }, // Direct referrals
                level2: { type: Array, default: [] }, // Referrals of referrals
                level3: { type: Array, default: [] }, // Level 3 referrals
                level4: { type: Array, default: [] }, // Level 4 referrals
                level5: { type: Array, default: [] }  // Level 5 referrals
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        // Cached Referral Tree (stores the full 5-tier tree structure)
        referralTree: {
            tree: {
                type: Array,
                default: []
                // Each node: {
                //   userID: String,
                //   username: String,
                //   referralCode: String,
                //   profilePicture: String,
                //   joinedAt: Date,
                //   activityPoints: Number,
                //   level: Number (1-5),
                //   children: Array (recursive structure)
                // }
            },
            pointsBreakdown: {
                level1: {
                    users: { type: Number, default: 0 },
                    points: { type: Number, default: 0 }
                },
                level2: {
                    users: { type: Number, default: 0 },
                    points: { type: Number, default: 0 }
                },
                level3: {
                    users: { type: Number, default: 0 },
                    points: { type: Number, default: 0 }
                },
                level4: {
                    users: { type: Number, default: 0 },
                    points: { type: Number, default: 0 }
                },
                level5: {
                    users: { type: Number, default: 0 },
                    points: { type: Number, default: 0 }
                },
                grandTotal: { type: Number, default: 0 }
            },
            lastCalculated: {
                type: Date,
                default: null
            }
        },
        // Tier Credits (UP the chain - who earns from this user's activity)
        tierCredits: {
            tier1: {
                userID: { type: String, default: null },
                username: { type: String, default: null },
                referralCode: { type: String, default: null },
                percentage: { type: Number, default: 25 }
            },
            tier2: {
                userID: { type: String, default: null },
                username: { type: String, default: null },
                referralCode: { type: String, default: null },
                percentage: { type: Number, default: 15 }
            },
            tier3: {
                userID: { type: String, default: null },
                username: { type: String, default: null },
                referralCode: { type: String, default: null },
                percentage: { type: Number, default: 10 }
            },
            tier4: {
                userID: { type: String, default: null },
                username: { type: String, default: null },
                referralCode: { type: String, default: null },
                percentage: { type: Number, default: 5 }
            },
            tier5: {
                userID: { type: String, default: null },
                username: { type: String, default: null },
                referralCode: { type: String, default: null },
                percentage: { type: Number, default: 2 }
            }
        },
        // Activity Points (earned from trading, bot usage, etc.)
        activityPoints: {
            type: Number,
            default: 0
        },
        // NEW STRUCTURE: Consolidated Referral System
        referrals: {
            tree: {
                type: Array,
                default: []
            },
            chain: {
                level1: { type: Array, default: [] },
                level2: { type: Array, default: [] },
                level3: { type: Array, default: [] },
                level4: { type: Array, default: [] },
                level5: { type: Array, default: [] }
            },
            points: {
                total: { type: Number, default: 0 },
                byTier: {
                    level1: { type: Number, default: 0 },
                    level2: { type: Number, default: 0 },
                    level3: { type: Number, default: 0 },
                    level4: { type: Number, default: 0 },
                    level5: { type: Number, default: 0 }
                },
                breakdown: {
                    level1: {
                        users: { type: Number, default: 0 },
                        points: { type: Number, default: 0 }
                    },
                    level2: {
                        users: { type: Number, default: 0 },
                        points: { type: Number, default: 0 }
                    },
                    level3: {
                        users: { type: Number, default: 0 },
                        points: { type: Number, default: 0 }
                    },
                    level4: {
                        users: { type: Number, default: 0 },
                        points: { type: Number, default: 0 }
                    },
                    level5: {
                        users: { type: Number, default: 0 },
                        points: { type: Number, default: 0 }
                    },
                    grandTotal: { type: Number, default: 0 }
                },
                lastCalculated: { type: Date, default: null }
            },
            tierCredits: {
                tier1: {
                    userID: { type: String, default: null },
                    username: { type: String, default: null },
                    referralCode: { type: String, default: null },
                    percentage: { type: Number, default: 25 }
                },
                tier2: {
                    userID: { type: String, default: null },
                    username: { type: String, default: null },
                    referralCode: { type: String, default: null },
                    percentage: { type: Number, default: 15 }
                },
                tier3: {
                    userID: { type: String, default: null },
                    username: { type: String, default: null },
                    referralCode: { type: String, default: null },
                    percentage: { type: Number, default: 10 }
                },
                tier4: {
                    userID: { type: String, default: null },
                    username: { type: String, default: null },
                    referralCode: { type: String, default: null },
                    percentage: { type: Number, default: 5 }
                },
                tier5: {
                    userID: { type: String, default: null },
                    username: { type: String, default: null },
                    referralCode: { type: String, default: null },
                    percentage: { type: Number, default: 2 }
                }
            },
            activityPoints: { type: Number, default: 0 },
            lastUpdated: { type: Date, default: null }
        },
        // NEW STRUCTURE: Referral bonus earnings (replaces referralEarnings)
        referralBonus: {
            totalEarnings: { type: Number, default: 0 },
            earningsPerReferral: { type: Number, default: 100 },
            earningsHistory: { type: Array, default: [] },
            lastUpdated: { type: Date, default: null },
            currency: { type: String, default: 'USD' }
        },
        // NEW STRUCTURE: Welcome Bonus (replaces registeredBonus)
        registerWelcomeBonus: {
            amount: { type: Number, default: 150 },
            claimed: { type: Boolean, default: true },
            claimedAt: { type: Date, default: null },
            currency: { type: String, default: 'USD' }
        },
        // Referral Earnings (100 USD per referral)
        referralEarnings: {
            totalEarnings: {
                type: Number,
                default: 0 // USD earned from referrals
            },
            earningsPerReferral: {
                type: Number,
                default: 100 // USD per referral
            },
            earningsHistory: {
                type: Array,
                default: []
                // Each entry: {
                //   userID: String,
                //   username: String,
                //   amount: Number,
                //   earnedAt: Date
                // }
            },
            lastUpdated: {
                type: Date,
                default: null
            }
        },
        // Registration Bonus (150 USD for new users)
        registeredBonus: {
            amount: {
                type: Number,
                default: 150 // USD bonus for registration
            },
            claimed: {
                type: Boolean,
                default: true // Automatically claimed upon registration
            },
            claimedAt: {
                type: Date,
                default: null
            }
        },
        createdAt: {
            type: Date,
            required: false,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            required: false,
            default: Date.now
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
        // AI API Keys for multiple providers (Claude, ChatGPT, Gemini, DeepAI, Cohere, HuggingFace, Replicate, Anthropic, Mistral, Perplexity, Groq, Together)
        aiApiKeys: {
            type: Object,
            required: false,
            default: {}
        },
        // Hyperliquid API Keys (wallet address + private key for perpetual trading DEX)
        hyperliquidKeys: {
            type: Array,
            required: false,
            default: []
        },
        // Specialized Platforms API Keys (Asterdex, Omni/Apex.exchange)
        specializedPlatforms: {
            asterdex: {
                type: Array,
                required: false,
                default: []
                // Each item: { name: String, apiKey: String, secret: String, createdAt: Date }
            },
            omni: {
                type: Array,
                required: false,
                default: []
                // Each item: { name: String, apiKey: String, passphrase: String, secret: String, createdAt: Date }
            }
        },
        // Google OAuth fields
        email: {
            type: String,
            required: false
        },
        fullName: {
            type: String,
            required: false
        },
        profilePicture: {
            type: String,
            required: false
        },
        googleId: {
            type: String,
            required: false
        },
        authProvider: {
            type: String,
            required: false,
            default: 'local'
        },
        emailVerified: {
            type: Boolean,
            required: false,
            default: false
        },
        // Telegram Client configuration (persistent authentication)
        telegramClient: {
            phoneNumber: {
                type: String,
                required: false
            },
            isAuthenticated: {
                type: Boolean,
                required: false,
                default: false
            },
            userInfo: {
                type: Object,
                required: false
            },
            lastConnected: {
                type: Date,
                required: false
            }
        },
        // WhatsApp configuration (persistent authentication)
        whatsappClient: {
            phoneNumber: {
                type: String,
                required: false
            },
            isConnected: {
                type: Boolean,
                required: false,
                default: false
            },
            clientInfo: {
                type: Object,
                required: false
            },
            lastConnected: {
                type: Date,
                required: false
            }
        },
        // Multi-chain Wallets Array (EVM & Non-EVM)
        wallets: {
            type: Array,
            required: false,
            default: []
            // Each wallet: {
            //   walletId: String (unique ID),
            //   walletName: String,
            //   network: String,
            //   networkSymbol: String,
            //   chainId: Number,
            //   walletType: String ('EVM' | 'Non-EVM'),
            //   address: String (for EVM),
            //   publicKey: String (for Non-EVM),
            //   privateKey: String (encrypted in production!),
            //   mnemonic: String,
            //   isDefault: Boolean,
            //   balance: String,
            //   balanceUSD: String,
            //   note: String,
            //   tags: Array,
            //   createdAt: Date,
            //   lastUsed: Date,
            //   isActive: Boolean
            // }
        }
    },
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});
