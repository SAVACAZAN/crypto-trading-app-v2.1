import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIAMONDS_CONTRACT = '0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B';
const RPC_ENDPOINT = 'https://ethereum.publicnode.com';
const MAX_TOKEN_ID = 315;

const ERC721_ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Download timeout after 30 seconds'));
    }, 30000);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          clearTimeout(timeout);
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (err) => {
          clearTimeout(timeout);
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        clearTimeout(timeout);
        const redirectUrl = response.headers.location;
        console.log(`  ↪️  Redirecting to: ${redirectUrl}`);
        downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
      } else {
        clearTimeout(timeout);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      clearTimeout(timeout);
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function checkAndDownloadMissingImages() {
  console.log('🔍 Checking for missing TIAMONDS NFT images...\n');

  const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
  const contract = new ethers.Contract(TIAMONDS_CONTRACT, ERC721_ABI, provider);

  const imagesDir = path.join(__dirname, '..', 'public', 'nft-images', 'tiamonds');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Check which images are missing
  const missingTokenIds = [];
  for (let tokenId = 1; tokenId <= MAX_TOKEN_ID; tokenId++) {
    const imagePath = path.join(imagesDir, `tiamond-${tokenId}.png`);
    if (!fs.existsSync(imagePath)) {
      missingTokenIds.push(tokenId);
    }
  }

  console.log(`📊 Status:`);
  console.log(`   Total NFTs: ${MAX_TOKEN_ID}`);
  console.log(`   Existing images: ${MAX_TOKEN_ID - missingTokenIds.length}`);
  console.log(`   Missing images: ${missingTokenIds.length}\n`);

  if (missingTokenIds.length === 0) {
    console.log('✅ All images already exist! No download needed.\n');
    return;
  }

  console.log(`🚀 Starting download for ${missingTokenIds.length} missing images...\n`);

  let downloadedCount = 0;
  let failedCount = 0;
  const failedTokens = [];

  for (let i = 0; i < missingTokenIds.length; i++) {
    const tokenId = missingTokenIds[i];

    try {
      console.log(`🎨 Fetching token #${tokenId}... (${i + 1}/${missingTokenIds.length})`);

      // Get tokenURI
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`  📎 TokenURI: ${tokenURI.substring(0, 50)}...`);

      // Convert IPFS to HTTP if needed
      let metadataUrl = tokenURI.startsWith('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : tokenURI;

      // Fetch metadata with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const metadataResponse = await fetch(metadataUrl, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const metadata = await metadataResponse.json();
      console.log(`  📝 Name: ${metadata.name || `Tiamond #${tokenId.toString().padStart(3, '0')}`}`);

      if (metadata.image) {
        // Convert IPFS image URL to HTTP
        let imageUrl = metadata.image.startsWith('ipfs://')
          ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : metadata.image;

        const imageFilePath = path.join(imagesDir, `tiamond-${tokenId}.png`);

        try {
          await downloadImage(imageUrl, imageFilePath);
          console.log(`  ✅ Downloaded: /nft-images/tiamonds/tiamond-${tokenId}.png`);
          downloadedCount++;
        } catch (downloadError) {
          console.log(`  ❌ Image download failed: ${downloadError.message}`);
          failedCount++;
          failedTokens.push({ tokenId, error: downloadError.message });
        }
      } else {
        console.log(`  ⚠️  No image URL in metadata`);
        failedCount++;
        failedTokens.push({ tokenId, error: 'No image URL in metadata' });
      }

      console.log('');

      // Rate limiting - wait 150ms between requests
      await sleep(150);

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
      failedCount++;
      failedTokens.push({ tokenId, error: error.message });

      // Wait a bit longer after an error
      await sleep(300);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully downloaded: ${downloadedCount} images`);
  console.log(`❌ Failed: ${failedCount} images`);
  console.log(`📁 Images directory: ${imagesDir}`);

  if (failedTokens.length > 0) {
    console.log(`\n⚠️  Failed tokens:`);
    failedTokens.forEach(({ tokenId, error }) => {
      console.log(`   Token #${tokenId}: ${error}`);
    });
  }

  console.log('\n✅ Redownload process complete!');
}

// Run the script
checkAndDownloadMissingImages().catch(console.error);
