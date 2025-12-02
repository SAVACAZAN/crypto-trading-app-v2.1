import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const data = await readBody(event);

    // Generăm codul de referal
    const referralCode = createReferralCode();

    // Căutăm utilizatorul care a referit utilizatorul nou
    let referredBy = null;
    let referredByEdited = false;

    if (data.referralCode) {
        const referringUser = await userSchema.findOne({ referralCode: data.referralCode });
        if (referringUser) {
            // Salvăm codul de referral, nu ID-ul
            referredBy = data.referralCode;
            // Marcăm că a venit prin link, deci nu poate edita
            referredByEdited = true;
        }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Pentru demo, vom genera cheile mnemonice și adresele portofelelor Bitcoin și Ethereum
    const demoBitcoinMnemonic = generateRandomMnemonic();
    const demoEthereumMnemonic = generateRandomMnemonic();
    const demoBitcoinAddress = generateRandomBitcoinAddress();
    const demoEthereumAddress = generateRandomEthereumAddress();

    // Generăm date pentru faucet
    const faucetData = {
        BitcoinFaucet: {
            claimAt: null, // Inițializăm cu null, deoarece utilizatorul nu a făcut încă o cerere
            BitcoinFaucetuserBalance: 0, // Inițializăm cu 0
            action: null // Inițializăm cu null
        },
        EthereumFaucet: {
            claimAt: null,
            EthereumFaucetuserBalance: 0,
            action: null
        },
        CryptoAppFaucet: {
            claimAt: null,
            CryptoAppFaucetuserBalance: 100,
            action: null
        }
    };

    // Creăm obiectul user cu toate informațiile
    const user = new userSchema({
        username: data.username,
        password: hashedPassword,
        referralCode: referralCode,
        referredBy: referredBy,
        referredByEdited: referredByEdited,
        codeEditedOnce: false,
        BitcoinWallet: {
            mnemonic: demoBitcoinMnemonic,
            Key: null, // Nu am generat încă o cheie Bitcoin pentru acest exemplu
            address: demoBitcoinAddress
        },
        EthereumWallet: {
            mnemonic: demoEthereumMnemonic,
            Key: null, // Nu am generat încă o cheie Ethereum pentru acest exemplu
            address: demoEthereumAddress
        },
        CryptoAppWallet: {
            mnemonic: null,
            Key: null,
            address: null
        },
        faucet: faucetData // Adăugăm datele faucet în obiectul user
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, 'randomkey1234');

    // Build tier credits for the new user (who earns from their activity)
    if (referredBy) {
        try {
            await buildTierCredits(user._id, referredBy);
            console.log(`✅ Built tier credits for new user ${user.username}`);
        } catch (error) {
            console.error('Error building tier credits:', error);
        }
    }

    // Update referral chains for the referring user (if exists)
    if (referredBy) {
        try {
            await updateReferralChainsForUser(referredBy);
        } catch (error) {
            console.error('Error updating referral chains:', error);
            // Don't fail registration if chain update fails
        }
    }

    // Give 100 USD reward to referrer
    if (referredBy) {
        try {
            await giveReferralReward(referredBy, user._id, user.username);
            console.log(`💰 Gave 100 USD reward to referrer with code: ${referredBy}`);
        } catch (error) {
            console.error('Error giving referral reward:', error);
            // Don't fail registration if reward fails
        }
    }

    return {
        data: { token }
    };
});

/**
 * Build tier credits for a new user (UP the chain - who earns from this user's activity)
 * This function goes UP 5 levels from the referrer to establish who gets points when this user earns activity points
 */
async function buildTierCredits(newUserId, referrerCode) {
    const tiers = [
        { level: 1, percentage: 25 },
        { level: 2, percentage: 15 },
        { level: 3, percentage: 10 },
        { level: 4, percentage: 5 },
        { level: 5, percentage: 2 }
    ];

    const tierCredits = {
        tier1: { userID: null, username: null, referralCode: null, percentage: 25 },
        tier2: { userID: null, username: null, referralCode: null, percentage: 15 },
        tier3: { userID: null, username: null, referralCode: null, percentage: 10 },
        tier4: { userID: null, username: null, referralCode: null, percentage: 5 },
        tier5: { userID: null, username: null, referralCode: null, percentage: 2 }
    };

    let currentReferrer = referrerCode;

    // Go UP the chain 5 levels
    for (let i = 0; i < 5; i++) {
        if (!currentReferrer) break;

        // Find the user with this referral code
        const referrerUser = await userSchema.findOne({ referralCode: currentReferrer });
        if (!referrerUser) break;

        // Assign tier credit
        tierCredits[`tier${i + 1}`] = {
            userID: referrerUser._id.toString(),
            username: referrerUser.username || referrerUser.referralCode,
            referralCode: referrerUser.referralCode,
            percentage: tiers[i].percentage
        };

        console.log(`  ↑ Tier ${i + 1}: ${referrerUser.username || referrerUser.referralCode} (${tiers[i].percentage}%)`);

        // Move up the chain
        currentReferrer = referrerUser.referredBy;
    }

    // Save tier credits to new user
    await userSchema.findByIdAndUpdate(newUserId, {
        tierCredits: tierCredits
    });

    return tierCredits;
}

/**
 * Update referral chains for a specific user (when someone new joins their network)
 */
async function updateReferralChainsForUser(referralCode) {
    // Find the user with this referral code
    const user = await userSchema.findOne({ referralCode });
    if (!user) return;

    console.log(`🔄 Updating referral chain for user ${user.username || referralCode}`);

    // Build their complete referral chain
    const chain = await buildUserReferralChain(referralCode);

    // Update the user
    await userSchema.findByIdAndUpdate(user._id, {
        'referralPoints.referralChain': chain,
        'referralPoints.lastUpdated': new Date()
    });

    // Also need to update all users UP the chain (5 levels up)
    let currentReferredBy = user.referredBy;
    let level = 1;

    while (currentReferredBy && level <= 5) {
        const parentUser = await userSchema.findOne({ referralCode: currentReferredBy });
        if (!parentUser) break;

        console.log(`  ↑ Updating parent user ${parentUser.username || currentReferredBy} (level ${level})`);

        const parentChain = await buildUserReferralChain(currentReferredBy);
        await userSchema.findByIdAndUpdate(parentUser._id, {
            'referralPoints.referralChain': parentChain,
            'referralPoints.lastUpdated': new Date()
        });

        currentReferredBy = parentUser.referredBy;
        level++;
    }
}

/**
 * Build the referral chain for a user (who they referred up to 5 levels deep)
 * WITH CIRCULAR REFERENCE PROTECTION
 */
async function buildUserReferralChain(referralCode) {
    const chain = {
        level1: [],
        level2: [],
        level3: [],
        level4: [],
        level5: []
    };

    // Track processed referral codes to prevent circular references
    const processedCodes = new Set();
    processedCodes.add(referralCode); // Add starting code to prevent self-referral

    // Level 1: Direct referrals
    const level1Users = await userSchema.find(
        { referredBy: referralCode },
        { _id: 1, username: 1, referralCode: 1 }
    );

    for (const l1User of level1Users) {
        // Skip if already processed (circular reference)
        if (processedCodes.has(l1User.referralCode)) {
            console.log(`⚠️  Skipping circular reference at L1: ${l1User.referralCode}`);
            continue;
        }
        processedCodes.add(l1User.referralCode);

        chain.level1.push({
            userID: l1User._id.toString(),
            username: l1User.username || l1User.referralCode,
            referralCode: l1User.referralCode
        });
    }

    // Level 2: Referrals of level 1 users
    for (const l1User of level1Users) {
        if (!processedCodes.has(l1User.referralCode)) continue;

        const level2Users = await userSchema.find(
            { referredBy: l1User.referralCode },
            { _id: 1, username: 1, referralCode: 1 }
        );

        for (const l2User of level2Users) {
            // Skip if already processed (circular reference)
            if (processedCodes.has(l2User.referralCode)) {
                console.log(`⚠️  Skipping circular reference at L2: ${l2User.referralCode}`);
                continue;
            }
            processedCodes.add(l2User.referralCode);

            chain.level2.push({
                userID: l2User._id.toString(),
                username: l2User.username || l2User.referralCode,
                referralCode: l2User.referralCode,
                referredBy: l1User.referralCode
            });

            // Level 3
            const level3Users = await userSchema.find(
                { referredBy: l2User.referralCode },
                { _id: 1, username: 1, referralCode: 1 }
            );

            for (const l3User of level3Users) {
                // Skip if already processed (circular reference)
                if (processedCodes.has(l3User.referralCode)) {
                    console.log(`⚠️  Skipping circular reference at L3: ${l3User.referralCode}`);
                    continue;
                }
                processedCodes.add(l3User.referralCode);

                chain.level3.push({
                    userID: l3User._id.toString(),
                    username: l3User.username || l3User.referralCode,
                    referralCode: l3User.referralCode,
                    referredBy: l2User.referralCode
                });

                // Level 4
                const level4Users = await userSchema.find(
                    { referredBy: l3User.referralCode },
                    { _id: 1, username: 1, referralCode: 1 }
                );

                for (const l4User of level4Users) {
                    // Skip if already processed (circular reference)
                    if (processedCodes.has(l4User.referralCode)) {
                        console.log(`⚠️  Skipping circular reference at L4: ${l4User.referralCode}`);
                        continue;
                    }
                    processedCodes.add(l4User.referralCode);

                    chain.level4.push({
                        userID: l4User._id.toString(),
                        username: l4User.username || l4User.referralCode,
                        referralCode: l4User.referralCode,
                        referredBy: l3User.referralCode
                    });

                    // Level 5
                    const level5Users = await userSchema.find(
                        { referredBy: l4User.referralCode },
                        { _id: 1, username: 1, referralCode: 1 }
                    );

                    for (const l5User of level5Users) {
                        // Skip if already processed (circular reference)
                        if (processedCodes.has(l5User.referralCode)) {
                            console.log(`⚠️  Skipping circular reference at L5: ${l5User.referralCode}`);
                            continue;
                        }
                        processedCodes.add(l5User.referralCode);

                        chain.level5.push({
                            userID: l5User._id.toString(),
                            username: l5User.username || l5User.referralCode,
                            referralCode: l5User.referralCode,
                            referredBy: l4User.referralCode
                        });
                    }
                }
            }
        }
    }

    return chain;
}

// Funcție pentru generarea codului de referal
function createReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 6; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referralCode;
}

// Funcție pentru generarea unui mnemonic aleatoriu
function generateRandomMnemonic() {
    // Aici poți folosi o bibliotecă specializată pentru generarea mnemonicelor, cum ar fi "bip39"
    // În acest exemplu, voi returna un șir de caractere aleatoriu pentru scopuri demo
    return 'random mnemonic phrase';
}

// Funcție pentru generarea unei adrese Bitcoin aleatorii
function generateRandomBitcoinAddress() {
    // Aici poți utiliza o bibliotecă specializată pentru generarea adreselor Bitcoin
    // În acest exemplu, voi returna un șir de caractere aleatoriu pentru scopuri demo
    return 'random bitcoin address';
}

// Funcție pentru generarea unei adrese Ethereum aleatorii
function generateRandomEthereumAddress() {
    // Aici poți utiliza o bibliotecă specializată pentru generarea adreselor Ethereum
    // În acest exemplu, voi returna un șir de caractere aleatoriu pentru scopuri demo
    return 'random ethereum address';
}

/**
 * Give $100 referral reward distributed across 5 tiers
 * Distribution:
 * - Tier 1 (direct referrer): $100 × 25% = $25
 * - Tier 2: $100 × 15% = $15
 * - Tier 3: $100 × 10% = $10
 * - Tier 4: $100 × 5% = $5
 * - Tier 5: $100 × 2% = $2
 * Total distributed: $57
 *
 * @param {string} referrerCode - The referral code of the direct referrer
 * @param {string} newUserId - The ID of the new user who registered
 * @param {string} newUsername - The username of the new user
 */
async function giveReferralReward(referrerCode, newUserId, newUsername) {
    const BASE_BONUS = 100; // $100 per referral
    const tiers = [
        { level: 1, percentage: 0.25 }, // 25% = $25
        { level: 2, percentage: 0.15 }, // 15% = $15
        { level: 3, percentage: 0.10 }, // 10% = $10
        { level: 4, percentage: 0.05 }, // 5% = $5
        { level: 5, percentage: 0.02 }  // 2% = $2
    ];

    let currentReferrer = referrerCode;
    let totalDistributed = 0;

    console.log(`\n💰 Distributing $${BASE_BONUS} referral bonus for ${newUsername}...`);

    // Go UP the chain 5 levels
    for (let i = 0; i < 5; i++) {
        if (!currentReferrer) break;

        // Find the user with this referral code
        const referrerUser = await userSchema.findOne({ referralCode: currentReferrer });
        if (!referrerUser) break;

        // Calculate earnings for this tier
        const earnings = BASE_BONUS * tiers[i].percentage;

        // Update referrer's earnings
        const currentEarnings = referrerUser.referralEarnings || {
            totalEarnings: 0,
            earningsPerReferral: 100,
            earningsHistory: [],
            lastUpdated: null
        };

        const newTotalEarnings = (currentEarnings.totalEarnings || 0) + earnings;

        // Create earnings history entry
        const earningsEntry = {
            userID: newUserId.toString(),
            username: newUsername || 'New User',
            amount: earnings,
            tier: i + 1,
            earnedAt: new Date()
        };

        // Update using $inc and $push to avoid race conditions
        await userSchema.findByIdAndUpdate(referrerUser._id, {
            $inc: {
                'referralEarnings.totalEarnings': earnings
            },
            $push: {
                'referralEarnings.earningsHistory': earningsEntry
            },
            $set: {
                'referralEarnings.lastUpdated': new Date()
            }
        });

        console.log(`  ↑ Tier ${i + 1}: ${referrerUser.username || referrerUser.referralCode} earned $${earnings.toFixed(2)} (${tiers[i].percentage * 100}%)`);
        console.log(`     Total earnings now: $${newTotalEarnings.toFixed(2)}`);

        totalDistributed += earnings;

        // Move up the chain
        currentReferrer = referrerUser.referredBy;
    }

    console.log(`\n✅ Total distributed: $${totalDistributed.toFixed(2)} across the chain\n`);
}
