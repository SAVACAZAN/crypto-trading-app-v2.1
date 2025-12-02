import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_TOKEN_ID = 315;
const imagesDir = path.join(__dirname, '..', 'public', 'nft-images', 'tiamonds');

console.log('🔍 Verifying all TIAMONDS NFT images...\n');

const results = {
  total: MAX_TOKEN_ID,
  existing: 0,
  missing: [],
  tooSmall: [],
  valid: 0
};

for (let tokenId = 1; tokenId <= MAX_TOKEN_ID; tokenId++) {
  const imagePath = path.join(imagesDir, `tiamond-${tokenId}.png`);

  if (fs.existsSync(imagePath)) {
    results.existing++;

    // Check file size (valid images should be at least 1KB)
    const stats = fs.statSync(imagePath);
    const fileSizeInKB = stats.size / 1024;

    if (fileSizeInKB < 1) {
      results.tooSmall.push({ tokenId, size: fileSizeInKB.toFixed(2) });
      console.log(`⚠️  Token #${tokenId}: File too small (${fileSizeInKB.toFixed(2)} KB) - likely corrupted`);
    } else {
      results.valid++;
      if (tokenId % 50 === 0) {
        console.log(`✅ Token #${tokenId}: Valid (${fileSizeInKB.toFixed(2)} KB)`);
      }
    }
  } else {
    results.missing.push(tokenId);
    console.log(`❌ Token #${tokenId}: Image file missing`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total NFTs to check: ${results.total}`);
console.log(`✅ Valid images: ${results.valid} (${((results.valid / results.total) * 100).toFixed(1)}%)`);
console.log(`⚠️  Corrupted/too small: ${results.tooSmall.length}`);
console.log(`❌ Missing: ${results.missing.length}`);

if (results.missing.length > 0) {
  console.log(`\n❌ Missing token IDs: ${results.missing.join(', ')}`);
}

if (results.tooSmall.length > 0) {
  console.log(`\n⚠️  Corrupted/too small files:`);
  results.tooSmall.forEach(({ tokenId, size }) => {
    console.log(`   Token #${tokenId}: ${size} KB`);
  });
}

if (results.valid === results.total) {
  console.log('\n🎉 ALL IMAGES ARE VALID AND READY TO DISPLAY!');
} else {
  console.log(`\n⚠️  ${results.total - results.valid} images need attention`);
}
