// Script to fetch ALL 316 TIAMONDS NFTs and download their metadata + images
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIAMONDS_CONTRACT = '0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B';
const RPC_ENDPOINT = 'https://ethereum.publicnode.com';
const MAX_TOKEN_ID = 315; // Etherscan shows 316 total (0-315)

const ERC721_ABI = [
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Download timeout'));
    }, 30000); // 30 second timeout

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          clearTimeout(timeout);
          fileStream.close();
          resolve();
        });
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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllTiamondsNFTs() {
  console.log('🔍 Fetching ALL TIAMONDS NFTs (0-315)...\n');

  const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
  const contract = new ethers.Contract(TIAMONDS_CONTRACT, ERC721_ABI, provider);

  const nftData = [];
  const imagesDir = path.join(__dirname, '..', 'public', 'nft-images', 'tiamonds');

  // Create directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;

  for (let tokenId = 0; tokenId <= MAX_TOKEN_ID; tokenId++) {
    try {
      console.log(`\n🎨 Fetching token #${tokenId}... (${tokenId + 1}/${MAX_TOKEN_ID + 1})`);

      // Get owner
      const owner = await contract.ownerOf(tokenId);
      console.log(`  👤 Owner: ${owner.slice(0, 6)}...${owner.slice(-4)}`);

      // Get tokenURI
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`  📎 TokenURI: ${tokenURI.substring(0, 50)}...`);

      // Convert IPFS to HTTP
      let metadataUrl = tokenURI.startsWith('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : tokenURI;

      // Fetch metadata with timeout
      let metadata = {};
      try {
        const metadataResponse = await fetch(metadataUrl, {
          signal: AbortSignal.timeout(10000)
        });
        metadata = await metadataResponse.json();
        console.log(`  📝 Name: ${metadata.name || `Tiamond #${tokenId.toString().padStart(3, '0')}`}`);
      } catch (metaError) {
        console.log(`  ⚠️  Metadata fetch failed, using default name`);
        metadata = {
          name: `Tiamond #${tokenId.toString().padStart(3, '0')}`,
          image: null
        };
      }

      // Download image
      let localImagePath = `/nft-images/tiamonds/tiamond-${tokenId}.png`;
      if (metadata.image) {
        let imageUrl = metadata.image.startsWith('ipfs://')
          ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : metadata.image;

        const imageFilePath = path.join(imagesDir, `tiamond-${tokenId}.png`);

        // Skip if image already exists
        if (fs.existsSync(imageFilePath)) {
          console.log(`  ✅ Image already exists, skipping download`);
        } else {
          try {
            await downloadImage(imageUrl, imageFilePath);
            console.log(`  🖼️  Image downloaded: ${localImagePath}`);
          } catch (imgError) {
            console.log(`  ⚠️  Could not download image: ${imgError.message}`);
            localImagePath = '/token-logos/toto.svg'; // Fallback
          }
        }
      } else {
        console.log(`  ⚠️  No image in metadata`);
        localImagePath = '/token-logos/toto.svg'; // Fallback
      }

      nftData.push({
        tokenId: tokenId,
        name: metadata.name || `Tiamond #${tokenId.toString().padStart(3, '0')}`,
        image: localImagePath,
        owner: owner.toLowerCase()
      });

      successCount++;

      // Rate limiting - wait 100ms between requests to avoid hitting RPC limits
      if (tokenId < MAX_TOKEN_ID) {
        await sleep(100);
      }

    } catch (error) {
      errorCount++;
      if (error.message.includes('nonexistent token')) {
        console.log(`  ❌ Token #${tokenId} does not exist`);
      } else {
        console.log(`  ❌ Token #${tokenId} error: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Fetched ${successCount} NFTs successfully`);
  console.log(`❌ ${errorCount} errors`);

  // Save to JSON file
  const outputPath = path.join(__dirname, 'tiamonds-all-nfts.json');
  fs.writeFileSync(outputPath, JSON.stringify(nftData, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Generate JavaScript module
  const jsContent = `// TIAMONDS NFT Collection Data - COMPLETE COLLECTION
// Generated from scripts/fetchAllTiamondsNFTs.js
// Contract: 0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B
// Total: ${nftData.length} NFTs

export const TIAMONDS_ALL_NFTS = ${JSON.stringify(nftData, null, 2)};
`;

  const jsOutputPath = path.join(__dirname, '..', 'data', 'tiamonds-all-nfts.js');
  fs.writeFileSync(jsOutputPath, jsContent);
  console.log(`💾 Saved JS module to: ${jsOutputPath}`);

  console.log(`\n📊 Summary:`);
  console.log(`   Total NFTs: ${nftData.length}`);
  console.log(`   Unique owners: ${new Set(nftData.map(n => n.owner)).size}`);
  console.log(`   Images downloaded: ${nftData.filter(n => n.image !== '/token-logos/toto.svg').length}`);
}

fetchAllTiamondsNFTs().catch(console.error);
