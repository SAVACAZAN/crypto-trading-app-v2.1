import mongoose from 'mongoose';

/**
 * MIGRATION SCRIPT: Reorganize Referral Structure
 *
 * OLD STRUCTURE:
 * - referralPoints (scattered)
 * - referralTree (scattered)
 * - tierCredits (scattered)
 * - activityPoints (scattered)
 * - referralEarnings (scattered)
 * - registeredBonus (scattered)
 *
 * NEW STRUCTURE:
 * - user.referrals.tree
 * - user.referrals.chain
 * - user.referrals.points
 * - user.referrals.tierCredits
 * - user.referrals.activityPoints
 * - user.registerWelcomeBonus
 * - user.referralBonus
 */

const MONGODB_URI = 'mongodb://127.0.0.1:27017/crypto-app-V1';

const userSchema = new mongoose.Schema({}, { collection: 'users', strict: false });
const User = mongoose.model('User', userSchema);

async function migrateReferralStructure() {
    try {
        console.log('\n🔄 Conectare la MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectat la baza de date\n');

        console.log('🔄 MIGRARE STRUCTURĂ REFERRAL\n');

        const allUsers = await User.find({});
        console.log(`📊 Găsiți ${allUsers.length} utilizatori\n`);

        let migrated = 0;

        for (const user of allUsers) {
            console.log(`\n🔄 Migrare: ${user.username || user.referralCode}`);

            // BUILD NEW STRUCTURE
            const newStructure = {
                // 1. user.referrals - TOT ce ține de referrals
                referrals: {
                    // Referral Tree (DOWN chain - cine ai referit)
                    tree: user.referralTree?.tree || [],

                    // Referral Chain (DOWN chain - structured by levels)
                    chain: {
                        level1: user.referralPoints?.referralChain?.level1 || [],
                        level2: user.referralPoints?.referralChain?.level2 || [],
                        level3: user.referralPoints?.referralChain?.level3 || [],
                        level4: user.referralPoints?.referralChain?.level4 || [],
                        level5: user.referralPoints?.referralChain?.level5 || []
                    },

                    // Points breakdown
                    points: {
                        total: user.referralPoints?.totalPoints || 0,
                        byTier: {
                            level1: user.referralPoints?.pointsByTier?.level1 || 0,
                            level2: user.referralPoints?.pointsByTier?.level2 || 0,
                            level3: user.referralPoints?.pointsByTier?.level3 || 0,
                            level4: user.referralPoints?.pointsByTier?.level4 || 0,
                            level5: user.referralPoints?.pointsByTier?.level5 || 0
                        },
                        breakdown: {
                            level1: {
                                users: user.referralTree?.pointsBreakdown?.level1?.users || 0,
                                points: user.referralTree?.pointsBreakdown?.level1?.points || 0
                            },
                            level2: {
                                users: user.referralTree?.pointsBreakdown?.level2?.users || 0,
                                points: user.referralTree?.pointsBreakdown?.level2?.points || 0
                            },
                            level3: {
                                users: user.referralTree?.pointsBreakdown?.level3?.users || 0,
                                points: user.referralTree?.pointsBreakdown?.level3?.points || 0
                            },
                            level4: {
                                users: user.referralTree?.pointsBreakdown?.level4?.users || 0,
                                points: user.referralTree?.pointsBreakdown?.level4?.points || 0
                            },
                            level5: {
                                users: user.referralTree?.pointsBreakdown?.level5?.users || 0,
                                points: user.referralTree?.pointsBreakdown?.level5?.points || 0
                            },
                            grandTotal: user.referralTree?.pointsBreakdown?.grandTotal || 0
                        },
                        lastCalculated: user.referralTree?.lastCalculated || null
                    },

                    // Tier Credits (UP chain - who earns from this user)
                    tierCredits: {
                        tier1: user.tierCredits?.tier1 || { userID: null, username: null, referralCode: null, percentage: 25 },
                        tier2: user.tierCredits?.tier2 || { userID: null, username: null, referralCode: null, percentage: 15 },
                        tier3: user.tierCredits?.tier3 || { userID: null, username: null, referralCode: null, percentage: 10 },
                        tier4: user.tierCredits?.tier4 || { userID: null, username: null, referralCode: null, percentage: 5 },
                        tier5: user.tierCredits?.tier5 || { userID: null, username: null, referralCode: null, percentage: 2 }
                    },

                    // Activity Points - Give users some points if they have 0
                    activityPoints: user.activityPoints || Math.floor(Math.random() * 451) + 50, // 50-500 if none exist

                    // Last Updated
                    lastUpdated: user.referralPoints?.lastUpdated || new Date()
                },

                // 2. user.registerWelcomeBonus - Bonus de înregistrare
                registerWelcomeBonus: {
                    amount: user.registeredBonus?.amount || 150,
                    claimed: user.registeredBonus?.claimed !== undefined ? user.registeredBonus.claimed : true,
                    claimedAt: user.registeredBonus?.claimedAt || user.createdAt || new Date(),
                    currency: 'USD'
                },

                // 3. user.referralBonus - Bonusuri de referral (câștiguri din referrals)
                referralBonus: {
                    totalEarnings: user.referralEarnings?.totalEarnings || 0,
                    earningsPerReferral: user.referralEarnings?.earningsPerReferral || 100,
                    earningsHistory: user.referralEarnings?.earningsHistory || [],
                    lastUpdated: user.referralEarnings?.lastUpdated || null,
                    currency: 'USD'
                }
            };

            // UPDATE USER
            await User.findByIdAndUpdate(user._id, {
                $set: newStructure,
                $unset: {
                    // Remove old scattered fields
                    referralPoints: "",
                    referralTree: "",
                    tierCredits: "",
                    activityPoints: "",
                    referralEarnings: "",
                    registeredBonus: ""
                }
            });

            console.log('   ✅ Migrat cu succes');
            migrated++;
        }

        console.log(`\n\n🎉 MIGRARE COMPLETĂ!`);
        console.log(`   Utilizatori migrați: ${migrated}`);
        console.log(`\n✨ Noua structură:`);
        console.log(`   📁 user.referrals.tree`);
        console.log(`   📁 user.referrals.chain`);
        console.log(`   📁 user.referrals.points`);
        console.log(`   📁 user.referrals.tierCredits`);
        console.log(`   📁 user.referrals.activityPoints`);
        console.log(`   💰 user.registerWelcomeBonus`);
        console.log(`   💰 user.referralBonus\n`);

    } catch (error) {
        console.error('\n❌ Eroare:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Deconectat de la MongoDB\n');
        process.exit(0);
    }
}

// RUN MIGRATION
migrateReferralStructure();
