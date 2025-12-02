// Script to fetch all TIAMONDS NFTs and download their metadata + images
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIAMONDS_CONTRACT = '0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B';
const RPC_ENDPOINT = 'https://ethereum.publicnode.com';

const ERC721_ABI = [
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete file on error
      reject(err);
    });
  });
}

async function fetchTiamondsNFTs() {
  console.log('🔍 Fetching TIAMONDS NFTs...');

  const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
  const contract = new ethers.Contract(TIAMONDS_CONTRACT, ERC721_ABI, provider);

  let totalSupply = 0;
  try {
    totalSupply = Number(await contract.totalSupply());
    console.log(`📦 Total Supply: ${totalSupply}`);
  } catch (e) {
    console.log('⚠️  Could not get totalSupply, will scan 0-100');
    totalSupply = 100;
  }

  const nftData = [];
  const imagesDir = path.join(__dirname, '..', 'public', 'nft-images', 'tiamonds');

  // Create directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  for (let tokenId = 0; tokenId < Math.min(totalSupply, 100); tokenId++) {
    try {
      console.log(`\n🎨 Fetching token #${tokenId}...`);

      // Get owner
      const owner = await contract.ownerOf(tokenId);
      console.log(`  👤 Owner: ${owner.substring(0, 6)}...${owner.substring(owner.length - 4)}`);

      // Get tokenURI
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`  📎 TokenURI: ${tokenURI.substring(0, 60)}...`);

      // Convert IPFS to HTTP
      let metadataUrl = tokenURI;
      if (metadataUrl.startsWith('ipfs://')) {
        metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      // Fetch metadata
      const metadataResponse = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
      const metadata = await metadataResponse.json();

      console.log(`  📝 Name: ${metadata.name || `Tiamond #${tokenId}`}`);

      let imageUrl = metadata.image;
      if (imageUrl && imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      // Download image
      let localImagePath = `/nft-images/tiamonds/tiamond-${tokenId}.png`;
      if (imageUrl) {
        try {
          const imageFilePath = path.join(imagesDir, `tiamond-${tokenId}.png`);
          await downloadImage(imageUrl, imageFilePath);
          console.log(`  🖼️  Image downloaded: ${localImagePath}`);
        } catch (imgError) {
          console.log(`  ⚠️  Could not download image: ${imgError.message}`);
          localImagePath = '/token-logos/toto.svg'; // Fallback
        }
      }

      nftData.push({
        tokenId: tokenId,
        name: metadata.name || `Tiamond #${tokenId}`,
        image: localImagePath,
        owner: owner.toLowerCase()
      });

    } catch (error) {
      console.log(`  ❌ Token #${tokenId} error: ${error.message}`);
      // Token might not exist or burned
    }
  }

  console.log(`\n✅ Fetched ${nftData.length} NFTs`);

  // Save to JSON file
  const outputPath = path.join(__dirname, 'tiamonds-nfts.json');
  fs.writeFileSync(outputPath, JSON.stringify(nftData, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);

  // Generate code snippet
  console.log('\n📋 Code snippet for backend:');
  console.log('const TIAMONDS_ALL_NFTS = ' + JSON.stringify(nftData, null, 2) + ';');
}

fetchTiamondsNFTs().catch(console.error);
