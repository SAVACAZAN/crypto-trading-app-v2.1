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
    if (data.referralCode) {
        const referringUser = await userSchema.findOne({ referralCode: data.referralCode });
        if (referringUser) {
            referredBy = referringUser._id;
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
