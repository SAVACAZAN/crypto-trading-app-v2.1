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
    const now = new Date();
    const user = new userSchema({
        username: data.username,
        password: hashedPassword,
        referralCode: referralCode,
        referredBy: referredBy,
        referredByEdited: referredByEdited, // Adăugăm flag-ul
        codeEditedOnce: false, // Codul propriu nu a fost editat
        createdAt: now, // Adăugăm explicit timestamp-ul de creare
        updatedAt: now, // Adăugăm explicit timestamp-ul de actualizare

        // NEW STRUCTURE: Welcome Bonus - $150 USD automatic pentru fiecare user nou
        registerWelcomeBonus: {
            amount: 150,
            claimed: true,
            claimedAt: now,
            currency: 'USD'
        },

        // NEW STRUCTURE: Referral system organization
        referrals: {
            tree: [],
            chain: {
                level1: [],
                level2: [],
                level3: [],
                level4: [],
                level5: []
            },
            points: {
                total: 0,
                byTier: {
                    level1: 0,
                    level2: 0,
                    level3: 0,
                    level4: 0,
                    level5: 0
                },
                breakdown: {
                    level1: { users: 0, points: 0 },
                    level2: { users: 0, points: 0 },
                    level3: { users: 0, points: 0 },
                    level4: { users: 0, points: 0 },
                    level5: { users: 0, points: 0 },
                    grandTotal: 0
                },
                lastCalculated: null
            },
            tierCredits: {
                tier1: { userID: null, username: null, referralCode: null, percentage: 25 },
                tier2: { userID: null, username: null, referralCode: null, percentage: 15 },
                tier3: { userID: null, username: null, referralCode: null, percentage: 10 },
                tier4: { userID: null, username: null, referralCode: null, percentage: 5 },
                tier5: { userID: null, username: null, referralCode: null, percentage: 2 }
            },
            activityPoints: 100, // Give new users 100 activity points to start
            lastUpdated: now
        },

        // NEW STRUCTURE: Referral bonus earnings
        referralBonus: {
            totalEarnings: 0,
            earningsPerReferral: 100,
            earningsHistory: [],
            lastUpdated: null,
            currency: 'USD'
        },

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

    return {
        data: { token }
    };
});

// Funcție pentru generarea codului de referal
function createReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 9; i++) {
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
// Metoda pentru a obține informații de înregistrare din baza de date
async function getRegisterInfo(username, referralCode, referredBy) {
    // Recuperează informațiile de înregistrare din baza de date
    const registerInfo = await userSchema.find({ username, referralCode, referredBy });
    console.log('Register info:', registerInfo);
    return registerInfo;
}

// Exportă metoda pentru a putea fi folosită în alte părți ale aplicației
export { getRegisterInfo };