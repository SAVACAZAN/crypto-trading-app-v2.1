/**
 * Bitcoin Wallet Generator
 * Generează un wallet Bitcoin complet cu toate detaliile:
 * - Mnemonic phrase (12/24 cuvinte)
 * - Seed
 * - Private Key
 * - Public Key
 * - Bitcoin Address (Legacy, SegWit, Native SegWit)
 */

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

// Culori pentru consolă (Windows compatible)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Culori text
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Culori fundal
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Helper pentru afișare colorată
function print(text, color = 'white', style = '') {
  const colorCode = colors[color] || colors.white;
  const styleCode = style ? colors[style] : '';
  console.log(`${styleCode}${colorCode}%s${colors.reset}`, text);
}

function printHeader(text) {
  console.log('\n' + '═'.repeat(80));
  print(`  ${text}`, 'cyan', 'bright');
  console.log('═'.repeat(80));
}

function printInfo(label, value, description = '') {
  print(`\n${label}:`, 'yellow', 'bright');
  print(`  ${value}`, 'green');
  if (description) {
    print(`  ℹ️  ${description}`, 'dim');
  }
}

function printWarning(text) {
  print(`\n⚠️  ${text}`, 'red', 'bright');
}

// Funcție principală de generare wallet
function generateBitcoinWallet(wordCount = 12) {
  try {
    printHeader('🔐 BITCOIN WALLET GENERATOR 🔐');

    // 1. Generare Mnemonic
    printHeader('1️⃣  MNEMONIC PHRASE (Recovery Phrase)');
    const strength = wordCount === 24 ? 256 : 128;
    const mnemonic = bip39.generateMnemonic(strength);

    printInfo(
      'Mnemonic',
      mnemonic,
      'Această frază de recuperare (seed phrase) este CHEIA ta principală. Cu ea poți recupera wallet-ul!'
    );
    print(`  📝 Număr cuvinte: ${wordCount}`, 'cyan');

    // 2. Generare Seed
    printHeader('2️⃣  SEED (Master Seed)');
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    printInfo(
      'Seed (Hex)',
      seed.toString('hex'),
      'Seed-ul este generat din mnemonic și este folosit pentru a deriva toate cheile'
    );
    print(`  📏 Lungime: ${seed.length} bytes (${seed.length * 8} bits)`, 'cyan');

    // 3. Generare Master Key (BIP32)
    printHeader('3️⃣  MASTER KEY (BIP32 Root)');
    const root = bip32.fromSeed(seed);

    printInfo(
      'Master Private Key (xprv)',
      root.toBase58(),
      'Cheia privată master din care se derivă toate celelalte chei'
    );

    printInfo(
      'Master Public Key (xpub)',
      root.neutered().toBase58(),
      'Cheia publică master - poate genera adrese fără a dezvălui cheia privată'
    );

    // 4. Derivare chei pentru diferite tipuri de adrese
    const networks = {
      mainnet: bitcoin.networks.bitcoin,
      testnet: bitcoin.networks.testnet
    };

    // Bitcoin Mainnet - diferite derivation paths
    const paths = [
      { path: "m/44'/0'/0'/0/0", type: 'Legacy (P2PKH)', prefix: '1...' },
      { path: "m/49'/0'/0'/0/0", type: 'SegWit (P2SH-P2WPKH)', prefix: '3...' },
      { path: "m/84'/0'/0'/0/0", type: 'Native SegWit (P2WPKH)', prefix: 'bc1...' },
    ];

    paths.forEach((pathInfo, index) => {
      printHeader(`${index + 4}️⃣  ${pathInfo.type.toUpperCase()}`);

      const child = root.derivePath(pathInfo.path);

      printInfo(
        'Derivation Path (BIP44/49/84)',
        pathInfo.path,
        'Path-ul BIP conform standardului pentru acest tip de adresă'
      );

      printInfo(
        'Private Key (WIF - Wallet Import Format)',
        child.toWIF(),
        'Cheie privată în format WIF - folosită pentru import în wallet-uri'
      );

      printInfo(
        'Private Key (Hex)',
        child.privateKey.toString('hex'),
        'Cheie privată în format hexadecimal'
      );

      printInfo(
        'Public Key (Hex)',
        child.publicKey.toString('hex'),
        'Cheie publică derivată din cheia privată folosind criptografie eliptică (secp256k1)'
      );

      // Generare adresă în funcție de tip
      let address;
      if (pathInfo.path.includes("44'")) {
        // Legacy P2PKH
        const { address: addr } = bitcoin.payments.p2pkh({
          pubkey: child.publicKey,
          network: networks.mainnet
        });
        address = addr;
      } else if (pathInfo.path.includes("49'")) {
        // SegWit P2SH
        const { address: addr } = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: networks.mainnet
          }),
          network: networks.mainnet
        });
        address = addr;
      } else if (pathInfo.path.includes("84'")) {
        // Native SegWit
        const { address: addr } = bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network: networks.mainnet
        });
        address = addr;
      }

      printInfo(
        'Bitcoin Address',
        address,
        `Adresa Bitcoin publică (${pathInfo.prefix}) - ACEASTA o poți împărtăși pentru a primi BTC`
      );

      print(`\n  💡 Caracteristici ${pathInfo.type}:`, 'magenta', 'bright');
      if (pathInfo.path.includes("44'")) {
        print('     • Format original Bitcoin (2009)', 'magenta');
        print('     • Taxe mai mari de tranzacționare', 'magenta');
        print('     • Compatibilitate maximă', 'magenta');
      } else if (pathInfo.path.includes("49'")) {
        print('     • Wrapped SegWit - compatibil backwards', 'magenta');
        print('     • Taxe moderate', 'magenta');
        print('     • Adrese încep cu "3"', 'magenta');
      } else if (pathInfo.path.includes("84'")) {
        print('     • Cea mai modernă implementare', 'magenta');
        print('     • Taxe cele mai mici', 'magenta');
        print('     • Adrese încep cu "bc1"', 'magenta');
      }
    });

    // 5. Informații importante despre securitate
    printHeader('🔒 INFORMAȚII DE SECURITATE');

    printWarning('IMPORTANT: Nu împărtăși NICIODATĂ:');
    print('  ❌ Mnemonic phrase (cele 12/24 cuvinte)', 'red');
    print('  ❌ Private Key (WIF sau Hex)', 'red');
    print('  ❌ Seed-ul', 'red');

    print('\n✅ Poți împărtăși în siguranță:', 'green', 'bright');
    print('  ✓ Bitcoin Address (adresa publică)', 'green');
    print('  ✓ Public Key (doar pentru verificare)', 'green');

    printHeader('📚 GLOSAR - CE REPREZINTĂ FIECARE ELEMENT');

    const glossary = [
      {
        term: 'Mnemonic/Seed Phrase',
        definition: 'Lista de 12/24 cuvinte care reprezintă wallet-ul tău complet. Este MASTER KEY-ul.'
      },
      {
        term: 'Seed',
        definition: 'Număr de 512 biti generat din mnemonic. Este rădăcina matematică a tuturor cheilor.'
      },
      {
        term: 'Master Private Key (xprv)',
        definition: 'Cheia privată principală din care derivă toate celelalte chei private.'
      },
      {
        term: 'Master Public Key (xpub)',
        definition: 'Permite generarea de adrese publice fără a avea acces la chei private.'
      },
      {
        term: 'Derivation Path',
        definition: 'Calea BIP44/49/84 care definește cum se generează chei specifice din master key.'
      },
      {
        term: 'Private Key',
        definition: 'Cheia secretă care îți permite să cheltui Bitcoin-urile. PĂSTREAZ-O SECRETĂ!'
      },
      {
        term: 'Public Key',
        definition: 'Derivată din private key folosind criptografie cu curbe eliptice (secp256k1).'
      },
      {
        term: 'Bitcoin Address',
        definition: 'Adresa publică pe care o dai altora pentru a primi Bitcoin.'
      },
      {
        term: 'WIF (Wallet Import Format)',
        definition: 'Format standard pentru exportul/importul de private keys în wallet-uri.'
      },
      {
        term: 'P2PKH (Pay to PubKey Hash)',
        definition: 'Legacy Bitcoin address. Început cu "1". Cel mai vechi format.'
      },
      {
        term: 'P2SH (Pay to Script Hash)',
        definition: 'SegWit wrapped. Început cu "3". Compatibilitate și eficiență moderată.'
      },
      {
        term: 'P2WPKH (Native SegWit)',
        definition: 'Native SegWit. Început cu "bc1". Cel mai eficient, taxe minime.'
      }
    ];

    glossary.forEach(item => {
      print(`\n📖 ${item.term}`, 'cyan', 'bright');
      print(`   ${item.definition}`, 'white');
    });

    printHeader('✅ WALLET GENERAT CU SUCCES!');

    printWarning('NOTĂ FINALĂ: Acest wallet este generat ALEATORIU și este REAL!');
    print('  💾 Salvează mnemonic-ul într-un loc SIGUR (offline)', 'yellow');
    print('  🔥 Nu-l stoca pe computer în text plain', 'yellow');
    print('  📝 Scrie-l pe hârtie și păstrează-l în siguranță', 'yellow');
    print('  🚫 Oricine are access la mnemonic are access la fonduri!', 'red', 'bright');

    console.log('\n' + '═'.repeat(80) + '\n');

    return {
      mnemonic,
      seed: seed.toString('hex'),
      masterPrivateKey: root.toBase58(),
      masterPublicKey: root.neutered().toBase58(),
      addresses: paths.map(p => {
        const child = root.derivePath(p.path);
        let address;
        if (p.path.includes("44'")) {
          address = bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address;
        } else if (p.path.includes("49'")) {
          address = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey })
          }).address;
        } else {
          address = bitcoin.payments.p2wpkh({ pubkey: child.publicKey }).address;
        }
        return {
          type: p.type,
          path: p.path,
          address,
          privateKey: child.toWIF(),
          publicKey: child.publicKey.toString('hex')
        };
      })
    };

  } catch (error) {
    printWarning(`EROARE: ${error.message}`);
    console.error(error);
    return null;
  }
}

// Execuție
console.clear(); // Curăță consola pentru o afișare mai curată

// Generează wallet cu 12 cuvinte (poți schimba la 24)
const wallet = generateBitcoinWallet(12);

// Opțional: exportă rezultatul într-un fișier JSON (ATENȚIE LA SECURITATE!)
// const fs = require('fs');
// fs.writeFileSync('wallet-backup.json', JSON.stringify(wallet, null, 2));
// printWarning('⚠️  Wallet salvat în wallet-backup.json - ȘTERGE-L după ce ai salvat mnemonic-ul!');

module.exports = { generateBitcoinWallet };
