/**
 * EXEMPLU: Cum să folosești wallet-urile generate
 */

// ============================================================================
// 1. IMPORT WALLET
// ============================================================================

// Schimbă path-ul cu cel al wallet-ului tău generat
const wallet = require('./bitcoin-complete-2025-10-25T18-17-39/1-savacazan.js');

console.log('\n🔐 WALLET INFO:');
console.log('=====================================');
console.log('Name:', wallet.name);
console.log('Emoji:', wallet.emoji);
console.log('Description:', wallet.description);

// ============================================================================
// 2. PRIMIRE BITCOIN - Obține Adresa
// ============================================================================

console.log('\n💰 PENTRU A PRIMI BITCOIN:');
console.log('=====================================');

// Adresa Native SegWit (RECOMANDAT - taxe minime)
const nativeSegwitAddress = wallet.getAddress('nativeSegwit');
console.log('Native SegWit (bc1q...):', nativeSegwitAddress);

// Adresa Taproot (CEA MAI NOUĂ)
const taprootAddress = wallet.getAddress('taproot');
console.log('Taproot (bc1p...):', taprootAddress);

// Adresa Legacy (pentru compatibilitate maximă)
const legacyAddress = wallet.getAddress('legacy');
console.log('Legacy (1...):', legacyAddress);

console.log('\n📝 INSTRUCȚIUNI:');
console.log('1. Copiază adresa de mai sus');
console.log('2. Folosește-o pentru a primi Bitcoin');
console.log('3. Verifică tranzacția pe blockchain explorer');

// ============================================================================
// 3. VERIFICARE BALANȚĂ - Fără Private Key
// ============================================================================

console.log('\n🔍 VERIFICARE BALANȚĂ (SIGUR):');
console.log('=====================================');

// Link-uri către blockchain explorers
console.log('Mempool.space:', wallet.getExplorerURL('nativeSegwit'));

// Poți verifica manual la:
console.log('\nAlte explorers:');
console.log('- https://blockchain.com/explorer');
console.log('- https://blockchair.com/bitcoin');
console.log('- https://www.blockchain.com/btc/address/' + nativeSegwitAddress);

// ============================================================================
// 4. TRIMITERE BITCOIN - Import Private Key în Wallet
// ============================================================================

console.log('\n💸 PENTRU A TRIMITE BITCOIN:');
console.log('=====================================');
console.log('\n⚠️  ATENȚIE: Private Key-ul este SECRET!');
console.log('Nu-l împărtăși NICIODATĂ cu nimeni!\n');

// Obține Private Key pentru import
const privateKeyWIF = wallet.getPrivateKey('nativeSegwit', 'wif');
console.log('Private Key (WIF format):', privateKeyWIF);

console.log('\n📱 PAȘI PENTRU IMPORT ÎN WALLET:');
console.log('=====================================');

console.log('\n1️⃣  TRUST WALLET:');
console.log('   - Deschide Trust Wallet');
console.log('   - Settings → Wallets');
console.log('   - Tap "+" → Import Wallet');
console.log('   - Alege "Bitcoin"');
console.log('   - Paste Private Key:', privateKeyWIF);

console.log('\n2️⃣  ELECTRUM (Desktop):');
console.log('   - Deschide Electrum');
console.log('   - File → New/Restore');
console.log('   - Standard wallet → Use public or private keys');
console.log('   - Paste Private Key:', privateKeyWIF);

console.log('\n3️⃣  COINOMI:');
console.log('   - Deschide Coinomi');
console.log('   - Settings → Add Wallet');
console.log('   - Bitcoin → Import');
console.log('   - Paste Private Key:', privateKeyWIF);

// ============================================================================
// 5. RESTAURARE DIN MNEMONIC (TOATE WALLET-URILE)
// ============================================================================

console.log('\n🔄 RESTAURARE DIN MNEMONIC:');
console.log('=====================================');
console.log('Mnemonic:', wallet.mnemonic);
console.log('\n⚠️  CU ACEST MNEMONIC RESTAUREZI TOATE CELE 10 WALLET-URI!');

console.log('\n📱 LEDGER/TREZOR:');
console.log('1. Recovery Mode');
console.log('2. Enter 12 words mnemonic');
console.log('3. Toate wallet-urile vor fi restaurate automat');

console.log('\n💻 ELECTRUM:');
console.log('1. New Wallet → Standard → I already have a seed');
console.log('2. Enter mnemonic');
console.log('3. Specifică derivation path pentru fiecare wallet:');
console.log('   - SAVACAZAN: m/84\'/0\'/0\'/0/0');
console.log('   - ALEX: m/84\'/0\'/1\'/0/0');
console.log('   - etc.');

// ============================================================================
// 6. VEZI TOATE TIPURILE DE ADRESE
// ============================================================================

console.log('\n📊 TOATE TIPURILE DE ADRESE:');
console.log('=====================================');

const allAddresses = wallet.getAllAddresses();
allAddresses.forEach(addr => {
  console.log(`${addr.type}:`, addr.address);
});

// ============================================================================
// 7. INFORMAȚII DESPRE FIECARE TIP DE ADRESĂ
// ============================================================================

console.log('\n📚 CE TIP DE ADRESĂ SĂ FOLOSEȘTI:');
console.log('=====================================');

console.log('\n🚀 Native SegWit (bc1q...) - RECOMANDAT');
console.log('   ✅ Taxe cele mai mici');
console.log('   ✅ Modern și sigur');
console.log('   ✅ Suportat de majoritatea exchange-urilor');
console.log('   📍 Folosește pentru: tranzacții zilnice');

console.log('\n🌳 Taproot (bc1p...) - CEA MAI NOUĂ');
console.log('   ✅ Privacy îmbunătățit');
console.log('   ✅ Smart contracts');
console.log('   ✅ Taxe minime');
console.log('   ⚠️  Unele wallet-uri vechi nu suportă trimitere către bc1p');
console.log('   📍 Folosește pentru: privacy și features avansate');

console.log('\n🔑 Legacy (1...) - VECHI DAR UNIVERSAL');
console.log('   ✅ Compatibilitate maximă');
console.log('   ❌ Taxe mari');
console.log('   📍 Folosește pentru: exchange-uri vechi care nu suportă SegWit');

console.log('\n⚡ SegWit (3...) - COMPATIBIL');
console.log('   ✅ Taxe moderate');
console.log('   ✅ Bună compatibilitate');
console.log('   📍 Folosește pentru: când Native SegWit nu e disponibil');

// ============================================================================
// 8. EXEMPLE PRACTICE
// ============================================================================

console.log('\n💡 EXEMPLE PRACTICE:');
console.log('=====================================');

console.log('\n🎯 Scenariul 1: Primesc Bitcoin de pe Binance');
console.log('1. Log in to Binance');
console.log('2. Wallet → Spot → Withdraw → Bitcoin');
console.log('3. Paste adresa:', nativeSegwitAddress);
console.log('4. Choose Network: BTC (Bitcoin)');
console.log('5. Confirm');

console.log('\n🎯 Scenariul 2: Verific cât Bitcoin am');
console.log('1. Deschide:', wallet.getExplorerURL('nativeSegwit'));
console.log('2. Vezi balance și transaction history');
console.log('3. NU trebuie să introduci private key!');

console.log('\n🎯 Scenariul 3: Trimit Bitcoin cuiva');
console.log('1. Importă private key în Trust Wallet (vezi mai sus)');
console.log('2. Open Bitcoin wallet');
console.log('3. Send → Enter amount și destination address');
console.log('4. Confirm transaction');

// ============================================================================
// 9. SECURITATE
// ============================================================================

console.log('\n🔒 SECURITATE:');
console.log('=====================================');

console.log('\n✅ SIGUR (poți împărtăși):');
console.log('   • Bitcoin Address (bc1q..., bc1p..., 1..., 3...)');
console.log('   • Public Key');
console.log('   • QR Code cu adresa');

console.log('\n❌ SECRET (NU împărtăși NICIODATĂ):');
console.log('   • Private Key (WIF sau Hex)');
console.log('   • Mnemonic (12 cuvinte)');
console.log('   • Master Private Key (xprv)');
console.log('   • Seed (hex)');

console.log('\n💾 BACKUP:');
console.log('   • Scrie mnemonic-ul pe hârtie');
console.log('   • Păstrează în 2-3 locuri sigure');
console.log('   • Consideră un metal backup pentru siguranță maximă');
console.log('   • NU stoca pe computer în text simplu');
console.log('   • NU trimite prin email sau cloud');

console.log('\n✅ Script finalizat! Vezi outputul de mai sus pentru instrucțiuni complete.\n');
