/**
 * COMPLETE REFERRAL SYSTEM RESET - ALL USERS
 *
 * This script will COMPLETELY RESET the entire referral system for ALL users:
 *
 * ✅ What will be RESET (DELETED):
 * - All referredBy connections (removed completely)
 * - All referral chains (level1-5)
 * - All referral points (totalPoints, pointsByTier)
 * - All referral trees (tree structure, pointsBreakdown)
 * - All tier credits (who earns from this user)
 * - All activity points (reset to 0)
 * - All referral earnings ($100 bonuses)
 * - All Referrals arrays (old data)
 * - All referredByEdited flags
 *
 * ✅ What will be KEPT:
 * - User referralCodes (users can still refer others)
 * - User accounts and authentication
 * - All other user data (wallets, API keys, etc.)
 *
 * Rulare: node reset-user-referrals.js
 *
 * ⚠️ WARNING: This will DELETE ALL referral data for ALL users!
 */

import mongoose from 'mongoose';

// Conectare la MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/crypto-app-V1';

// Schema user (simplificată pentru script)
const userSchema = new mongoose.Schema({
    username: String,
    referralCode: String,
    referredBy: String,
    referredByEdited: Boolean,
    tierCredits: Object,
    referralPoints: Object,
    referralTree: Object,
    activityPoints: Number,
    referralEarnings: Object,
    Referrals: Array
}, { collection: 'users', strict: false });

const User = mongoose.model('User', userSchema);

async function resetAllReferralSystem() {
    try {
        console.log(`\n🔄 Conectare la MongoDB...`);
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ Conectat la baza de date\n`);

        console.log(`⚠️⚠️⚠️ ATENȚIE: RESETARE COMPLETĂ SISTEM REFERRAL ⚠️⚠️⚠️`);
        console.log(`\n🗑️ Resetare date referral pentru TOȚI utilizatorii...`);
        console.log(`   Toate conexiunile referral vor fi ȘTERSE!`);
        console.log(`   Toate punctele și bonusurile vor fi RESETATE!\n`);

        // Găsește TOȚI utilizatorii
        const allUsers = await User.find({});

        if (allUsers.length === 0) {
            console.log(`❌ Nu au fost găsiți utilizatori în baza de date!`);
            process.exit(1);
        }

        console.log(`📊 Găsiți ${allUsers.length} utilizatori în baza de date\n`);

        let usersReset = 0;
        let totalReferralsCleared = 0;
        let totalEarningsCleared = 0;
        let totalActivityPointsCleared = 0;

        // Resetează fiecare user
        for (const user of allUsers) {
            console.log(`\n🔄 Resetare: ${user.username || user.referralCode}`);

            // Afișează ce va fi șters
            if (user.referredBy) {
                console.log(`   ❌ Șterge referredBy: ${user.referredBy}`);
            }
            if (user.Referrals && user.Referrals.length > 0) {
                console.log(`   ❌ Șterge ${user.Referrals.length} referrals din array`);
                totalReferralsCleared += user.Referrals.length;
            }
            if (user.activityPoints > 0) {
                console.log(`   ❌ Șterge activityPoints: ${user.activityPoints}`);
                totalActivityPointsCleared += user.activityPoints;
            }
            if (user.referralEarnings?.totalEarnings > 0) {
                console.log(`   ❌ Șterge earnings: $${user.referralEarnings.totalEarnings.toFixed(2)}`);
                totalEarningsCleared += user.referralEarnings.totalEarnings;
            }

            // Date de resetare COMPLETE
            const resetData = {
                // ❌ ȘTERGE COMPLET referredBy
                referredBy: null,
                referredByEdited: false,

                // ❌ Reset activity points
                activityPoints: 0,

                // ❌ Reset tier credits (UP chain)
                'tierCredits.tier1.userID': null,
                'tierCredits.tier1.username': null,
                'tierCredits.tier1.referralCode': null,
                'tierCredits.tier1.percentage': 25,
                'tierCredits.tier2.userID': null,
                'tierCredits.tier2.username': null,
                'tierCredits.tier2.referralCode': null,
                'tierCredits.tier2.percentage': 15,
                'tierCredits.tier3.userID': null,
                'tierCredits.tier3.username': null,
                'tierCredits.tier3.referralCode': null,
                'tierCredits.tier3.percentage': 10,
                'tierCredits.tier4.userID': null,
                'tierCredits.tier4.username': null,
                'tierCredits.tier4.referralCode': null,
                'tierCredits.tier4.percentage': 5,
                'tierCredits.tier5.userID': null,
                'tierCredits.tier5.username': null,
                'tierCredits.tier5.referralCode': null,
                'tierCredits.tier5.percentage': 2,

                // ❌ Reset referral points and chain (DOWN chain)
                'referralPoints.totalPoints': 0,
                'referralPoints.pointsByTier.level1': 0,
                'referralPoints.pointsByTier.level2': 0,
                'referralPoints.pointsByTier.level3': 0,
                'referralPoints.pointsByTier.level4': 0,
                'referralPoints.pointsByTier.level5': 0,
                'referralPoints.referralChain.level1': [],
                'referralPoints.referralChain.level2': [],
                'referralPoints.referralChain.level3': [],
                'referralPoints.referralChain.level4': [],
                'referralPoints.referralChain.level5': [],
                'referralPoints.lastUpdated': new Date(),

                // ❌ Reset referral tree cache
                'referralTree.tree': [],
                'referralTree.pointsBreakdown.level1.users': 0,
                'referralTree.pointsBreakdown.level1.points': 0,
                'referralTree.pointsBreakdown.level2.users': 0,
                'referralTree.pointsBreakdown.level2.points': 0,
                'referralTree.pointsBreakdown.level3.users': 0,
                'referralTree.pointsBreakdown.level3.points': 0,
                'referralTree.pointsBreakdown.level4.users': 0,
                'referralTree.pointsBreakdown.level4.points': 0,
                'referralTree.pointsBreakdown.level5.users': 0,
                'referralTree.pointsBreakdown.level5.points': 0,
                'referralTree.pointsBreakdown.grandTotal': 0,
                'referralTree.lastCalculated': null,

                // ❌ Reset referral earnings ($100 bonuses)
                'referralEarnings.totalEarnings': 0,
                'referralEarnings.earningsPerReferral': 100,
                'referralEarnings.earningsHistory': [],
                'referralEarnings.lastUpdated': null,

                // ❌ Reset Referrals array (șterge array-ul vechi)
                'Referrals': [],

                // ✅ PĂSTREAZĂ referralCode (users pot încă referi alții)
            };

            // Actualizează user-ul
            await User.findByIdAndUpdate(user._id, { $set: resetData });

            console.log(`   ✅ Resetat complet`);
            usersReset++;
        }

        console.log(`\n\n🎉 RESETARE COMPLETĂ FINALIZATĂ! 🎉`);
        console.log(`\n📊 STATISTICI:`);
        console.log(`   ✓ Utilizatori resetați: ${usersReset}`);
        console.log(`   ✓ Referrals șterse: ${totalReferralsCleared}`);
        console.log(`   ✓ Activity points șterse: ${totalActivityPointsCleared}`);
        console.log(`   ✓ Earnings șterse: $${totalEarningsCleared.toFixed(2)}`);

        console.log(`\n🗑️ CE A FOST ȘTERS:`);
        console.log(`   ❌ Toate conexiunile referredBy`);
        console.log(`   ❌ Toate referral chains (levels 1-5)`);
        console.log(`   ❌ Toate referral points`);
        console.log(`   ❌ Toate referral trees`);
        console.log(`   ❌ Toate tier credits`);
        console.log(`   ❌ Toate activity points`);
        console.log(`   ❌ Toate referral earnings ($${totalEarningsCleared.toFixed(2)})`);
        console.log(`   ❌ Toate Referrals arrays`);

        console.log(`\n✅ CE A FOST PĂSTRAT:`);
        console.log(`   ✓ Referral codes (users pot încă referi alții)`);
        console.log(`   ✓ User accounts și authentication`);
        console.log(`   ✓ Toate celelalte date (wallets, API keys, etc.)`);

        // Verificare finală
        console.log(`\n🔍 Verificare finală...`);
        const verifyUsers = await User.find({});

        let stillHasReferredBy = 0;
        let stillHasActivityPoints = 0;
        let stillHasEarnings = 0;

        for (const user of verifyUsers) {
            if (user.referredBy) stillHasReferredBy++;
            if (user.activityPoints > 0) stillHasActivityPoints++;
            if (user.referralEarnings?.totalEarnings > 0) stillHasEarnings++;
        }

        if (stillHasReferredBy === 0 && stillHasActivityPoints === 0 && stillHasEarnings === 0) {
            console.log(`✅ VERIFICARE OK! Toate datele au fost șterse cu succes!`);
        } else {
            console.log(`⚠️ ATENȚIE: Unele date nu au fost șterse complet:`);
            if (stillHasReferredBy > 0) console.log(`   - ${stillHasReferredBy} users încă au referredBy`);
            if (stillHasActivityPoints > 0) console.log(`   - ${stillHasActivityPoints} users încă au activityPoints`);
            if (stillHasEarnings > 0) console.log(`   - ${stillHasEarnings} users încă au earnings`);
        }

        console.log(`\n✨ Sistemul de referral este acum CURAT și GATA pentru un început fresh!`);
        console.log(`   Utilizatorii pot începe să refere alții de la ZERO.\n`);

    } catch (error) {
        console.error(`\n❌ Eroare:`, error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log(`🔌 Deconectat de la baza de date\n`);
        process.exit(0);
    }
}

// Rulează scriptul pentru TOȚI utilizatorii
resetAllReferralSystem();
