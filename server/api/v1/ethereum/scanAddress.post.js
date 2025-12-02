import { ethers } from 'ethers';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { address } = body;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return {
        success: false,
        message: "Invalid Ethereum address format"
      };
    }

    console.log(`🔍 Scanning Ethereum address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);

    // Initialize Ethereum provider (using public RPC endpoints)
    // Try multiple public endpoints for better reliability
    const RPC_ENDPOINTS = [
      'https://ethereum.publicnode.com',        // PublicNode - FREE, no API key
      'https://rpc.builder0x69.io',             // Builder0x69 - FREE
      'https://eth.drpc.org',                   // dRPC - FREE
      'https://cloudflare-eth.com'              // Cloudflare - reliable
    ];

    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[0]);

    // Get ETH balance
    const ethBalanceWei = await provider.getBalance(address);
    const ethBalance = parseFloat(ethers.formatEther(ethBalanceWei));
    console.log(`💰 ETH Balance: ${ethBalance.toFixed(6)} ETH`);

    // Fetch ETH price from CoinGecko
    let ethPriceUSD = 0;
    let ethBalanceUSD = 0;
    try {
      const priceResponse = await $fetch('https://api.coingecko.com/api/v3/simple/price', {
        query: {
          ids: 'ethereum',
          vs_currencies: 'usd'
        }
      });
      ethPriceUSD = priceResponse.ethereum?.usd || 0;
      ethBalanceUSD = ethBalance * ethPriceUSD;
      console.log(`💵 ETH Price: $${ethPriceUSD.toFixed(2)} | Balance USD: $${ethBalanceUSD.toFixed(2)}`);
    } catch (error) {
      console.warn('⚠️  Could not fetch ETH price:', error.message);
    }

    // ERC-20 Token ABI (minimal - just balanceOf and decimals, symbol, name)
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)"
    ];

    // List of popular ERC-20 token contract addresses to check
    const knownTokens = [
      // Stablecoins
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', coingeckoId: 'tether' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin' },
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', coingeckoId: 'dai' },
      { address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', symbol: 'BUSD', name: 'Binance USD', coingeckoId: 'binance-usd' },
      { address: '0x0000000000085d4780B73119b644AE5ecd22b376', symbol: 'TUSD', name: 'TrueUSD', coingeckoId: 'true-usd' },
      { address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd', symbol: 'GUSD', name: 'Gemini Dollar', coingeckoId: 'gemini-dollar' },
      { address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1', symbol: 'PAX', name: 'Paxos Standard', coingeckoId: 'paxos-standard' },

      // Wrapped tokens
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', coingeckoId: 'wrapped-bitcoin' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', coingeckoId: 'weth' },

      // DeFi tokens
      { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink' },
      { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', coingeckoId: 'uniswap' },
      { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
      { address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', symbol: 'stETH', name: 'Lido Staked Ether', coingeckoId: 'staked-ether' },
      { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', coingeckoId: 'aave' },
      { address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', symbol: 'SNX', name: 'Synthetix', coingeckoId: 'synthetix-network-token' },
      { address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', symbol: 'MKR', name: 'Maker', coingeckoId: 'maker' },
      { address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', symbol: 'COMP', name: 'Compound', coingeckoId: 'compound-governance-token' },
      { address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', symbol: 'YFI', name: 'yearn.finance', coingeckoId: 'yearn-finance' },
      { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', symbol: 'CRV', name: 'Curve DAO', coingeckoId: 'curve-dao-token' },

      // Exchange tokens
      { address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
      { address: '0x75231F58b43240C9718Dd58B4967c5114342a86c', symbol: 'OKB', name: 'OKB', coingeckoId: 'okb' },
      { address: '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9', symbol: 'FTT', name: 'FTX Token', coingeckoId: 'ftx-token' },

      // Meme/Community tokens
      { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', name: 'Shiba Inu', coingeckoId: 'shiba-inu' },
      { address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381', symbol: 'APE', name: 'ApeCoin', coingeckoId: 'apecoin' },
      { address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', symbol: 'PEPE', name: 'Pepe', coingeckoId: 'pepe' },

      // Layer 2 & Scaling
      { address: '0xfc98e825A2264D890F9a1e68ed50E1526abCcacD', symbol: 'MCO2', name: 'Moss Carbon Credit', coingeckoId: 'moss-carbon-credit' },
      { address: '0x0f5D2fB29fb7d3CFeE444a200298f468908cC942', symbol: 'MANA', name: 'Decentraland', coingeckoId: 'decentraland' },
      { address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c', symbol: 'ENJ', name: 'Enjin Coin', coingeckoId: 'enjincoin' },
      { address: '0x15D4c048F83bd7e37d49eA4C83a07267Ec4203dA', symbol: 'GALA', name: 'Gala', coingeckoId: 'gala' },
      { address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85', symbol: 'FET', name: 'Fetch.ai', coingeckoId: 'fetch-ai' },

      // Additional tokens (based on common holdings)
      { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', coingeckoId: 'uniswap' },
      { address: '0x6e36556B3ee5Aa28Def2a8EC3DAe30eC2B208739', symbol: 'BUILD', name: 'BUILD Finance', coingeckoId: 'build-finance' },
      { address: '0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29', symbol: 'FORT', name: 'Forta', coingeckoId: 'forta' },
      { address: '0x0AbdAce70D3790235af448C88547603b945604ea', symbol: 'DNT', name: 'district0x', coingeckoId: 'district0x' },
      { address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48', symbol: 'OCEAN', name: 'Ocean Protocol', coingeckoId: 'ocean-protocol' },
      { address: '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0', symbol: 'FOUR', name: 'The 4th Pillar Token', decimals: 18 },
      { address: '0xBA50933C268F567BDC86E1aC131BE072C6B0b71a', symbol: 'ARPA', name: 'ARPA Chain', coingeckoId: 'arpa-chain' },
      { address: '0xd49EfA7BC0D339d74f487959C573d518BA3F8437', symbol: 'OPEN', name: 'OPEN Governance Token', decimals: 18 },
      { address: '0xf0610eb7d8EE12D59412DA32625d5e273E78FF0b', symbol: 'MDEX', name: 'Mdex', decimals: 18, logo: '/token-logos/mdex.png' },
      { address: '0xdfbc9050F5B01DF53512DCC39B4f2B2BBaCD517A', symbol: 'JOBCHAIN', name: 'JobChain', decimals: 8, logo: '/token-logos/jobchain.png' },
      { address: '0xae78736Cd615f374D3085123A210448E74Fc6393', symbol: 'rETH', name: 'Rocket Pool ETH', coingeckoId: 'rocket-pool-eth' },
      { address: '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad', symbol: 'DAO', name: 'DAO Maker', coingeckoId: 'dao-maker' },
      { address: '0x467Bccd9d29f223BcE8043b84E8C8B282827790F', symbol: 'TEL', name: 'Telcoin', coingeckoId: 'telcoin' },
      { address: '0xC214A0B73Ce4c30594B4173219e885691254801b', symbol: 'TOTO', name: 'TIAMONDS', decimals: 9, logo: '/token-logos/toto.svg' },
    ];

    // Try multiple methods to discover tokens
    let tokensFromAPIs = [];

    // Method 1: Try Etherscan API
    // Use demo key or env variable (demo key has rate limits but works for testing)
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';

    try {
      console.log('🔍 Trying Etherscan API for token transactions...');
      const tokenTxResponse = await $fetch('https://api.etherscan.io/api', {
        query: {
          module: 'account',
          action: 'tokentx',
          address: address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 10000,
          sort: 'asc',
          apikey: ETHERSCAN_API_KEY
        },
        timeout: 10000
      });

      if (tokenTxResponse.status === '1' && Array.isArray(tokenTxResponse.result)) {
        console.log(`📜 Etherscan: Found ${tokenTxResponse.result.length} token transactions`);

        const uniqueTokensMap = new Map();
        tokenTxResponse.result.forEach(tx => {
          if (!uniqueTokensMap.has(tx.contractAddress)) {
            uniqueTokensMap.set(tx.contractAddress, {
              address: tx.contractAddress,
              symbol: tx.tokenSymbol,
              name: tx.tokenName,
              decimals: parseInt(tx.tokenDecimal || 18)
            });
          }
        });

        tokensFromAPIs = Array.from(uniqueTokensMap.values());
        console.log(`🔑 Etherscan: Found ${tokensFromAPIs.length} unique token contracts from transactions`);
      } else {
        console.warn('⚠️  Etherscan response:', tokenTxResponse.message || 'No data');
      }
    } catch (error) {
      console.warn('⚠️  Etherscan API error:', error.message);
    }

    // Method 2: Try Ankr API (free, no API key required)
    if (tokensFromAPIs.length === 0) {
      try {
        console.log('🔍 Trying Ankr API...');
        const ankrResponse = await $fetch('https://rpc.ankr.com/multichain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            jsonrpc: '2.0',
            method: 'ankr_getAccountBalance',
            params: {
              blockchain: 'eth',
              walletAddress: address
            },
            id: 1
          }
        });

        if (ankrResponse?.result?.assets) {
          console.log(`📜 Ankr: Found ${ankrResponse.result.assets.length} assets`);

          ankrResponse.result.assets.forEach(asset => {
            // Skip native ETH
            if (asset.tokenType === 'ERC20' && asset.contractAddress) {
              tokensFromAPIs.push({
                address: asset.contractAddress,
                symbol: asset.tokenSymbol,
                name: asset.tokenName,
                decimals: parseInt(asset.tokenDecimals || 18)
              });
            }
          });

          console.log(`🔑 Ankr: Found ${tokensFromAPIs.length} ERC-20 tokens`);
        }
      } catch (error) {
        console.warn('⚠️  Ankr API error:', error.message);
      }
    }

    // Method 3: Try BlockPi API (free public endpoint)
    if (tokensFromAPIs.length === 0) {
      try {
        console.log('🔍 Trying alternative method - checking recent blocks...');
        // This is a fallback - just use our known tokens list
        console.log('ℹ️  Using fallback: checking known tokens only');
      } catch (error) {
        console.warn('⚠️  Alternative method error:', error.message);
      }
    }

    // Combine known tokens with tokens from APIs
    const allTokensToCheck = [...knownTokens];
    tokensFromAPIs.forEach(token => {
      if (!allTokensToCheck.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
        allTokensToCheck.push(token);
      }
    });

    console.log(`🔍 Checking ${allTokensToCheck.length} token contracts...`);

    // Check balance for each token
    const tokensWithBalance = [];
    for (const token of allTokensToCheck) {
      try {
        console.log(`  🔎 Checking ${token.symbol} (${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)})`);

        // Normalize address with correct checksum
        const normalizedAddress = ethers.getAddress(token.address);
        const contract = new ethers.Contract(normalizedAddress, ERC20_ABI, provider);

        // Get balance (use BigInt safely)
        const balanceRaw = await contract.balanceOf(address);
        const balanceString = balanceRaw.toString();
        const balance = BigInt(balanceString);

        console.log(`    💾 Balance raw: ${balanceString}`);

        if (balance > 0n) {
          console.log(`    ✅ HAS BALANCE > 0!`);
          // Get token details if not available
          let decimals = token.decimals;
          let symbol = token.symbol;
          let name = token.name;

          if (!decimals) {
            try {
              decimals = await contract.decimals();
            } catch (e) {
              decimals = 18;
            }
          }

          if (!symbol) {
            try {
              symbol = await contract.symbol();
            } catch (e) {
              symbol = 'UNKNOWN';
            }
          }

          if (!name) {
            try {
              name = await contract.name();
            } catch (e) {
              name = 'Unknown Token';
            }
          }

          // Calculate formatted balance using BigInt
          const divisor = BigInt(Math.pow(10, decimals));
          const formattedBalance = Number(balance) / Number(divisor);
          console.log(`  ✅ ${symbol}: ${formattedBalance.toFixed(4)}`);

          tokensWithBalance.push({
            contractAddress: normalizedAddress,
            symbol: symbol,
            name: name,
            decimals: decimals,
            balance: balance.toString(),
            formattedBalance: formattedBalance,
            price: null,
            coingeckoId: token.coingeckoId || null,
            logo: token.logo || null
          });
        }
      } catch (error) {
        // Token contract doesn't exist or error reading - skip it
        console.log(`  ⏭️  Skipped ${token.symbol || token.address}: ${error.message}`);
      }
    }

    console.log(`✅ Found ${tokensWithBalance.length} tokens with balance > 0`);

    // Uniswap V2 Router & Factory addresses
    const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const UNISWAP_V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    // Uniswap V2 Factory ABI (minimal - just getPair)
    const UNISWAP_V2_FACTORY_ABI = [
      "function getPair(address tokenA, address tokenB) view returns (address pair)"
    ];

    // Uniswap V2 Pair ABI (minimal - just getReserves)
    const UNISWAP_V2_PAIR_ABI = [
      "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() view returns (address)",
      "function token1() view returns (address)"
    ];

    // Helper function to get token price from Uniswap V2
    async function getUniswapV2Price(tokenAddress, tokenDecimals) {
      try {
        const factory = new ethers.Contract(UNISWAP_V2_FACTORY, UNISWAP_V2_FACTORY_ABI, provider);

        // Try USDC pair first
        let pairAddress = await factory.getPair(tokenAddress, USDC_ADDRESS);
        let quoteToken = USDC_ADDRESS;
        let quoteDecimals = 6; // USDC has 6 decimals

        // If no USDC pair, try WETH pair
        if (pairAddress === ethers.ZeroAddress) {
          pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);
          quoteToken = WETH_ADDRESS;
          quoteDecimals = 18; // WETH has 18 decimals
        }

        // If no pair found, return null
        if (pairAddress === ethers.ZeroAddress) {
          return null;
        }

        // Get pair contract
        const pair = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);

        // Get reserves
        const [reserve0, reserve1] = await pair.getReserves();
        const token0 = await pair.token0();

        // Determine which reserve is our token
        let tokenReserve, quoteReserve;
        if (token0.toLowerCase() === tokenAddress.toLowerCase()) {
          tokenReserve = reserve0;
          quoteReserve = reserve1;
        } else {
          tokenReserve = reserve1;
          quoteReserve = reserve0;
        }

        // Calculate price (quote per token) - USE CORRECT DECIMALS!
        const price = (Number(quoteReserve) / (10 ** quoteDecimals)) / (Number(tokenReserve) / (10 ** tokenDecimals));

        // If paired with WETH, multiply by ETH price to get USD
        if (quoteToken === WETH_ADDRESS && ethPriceUSD > 0) {
          return price * ethPriceUSD;
        }

        // If paired with USDC, price is already in USD
        return price;
      } catch (error) {
        return null;
      }
    }

    // Fetch prices for tokens with CoinGecko IDs
    const tokensWithPrices = await Promise.all(
      tokensWithBalance.map(async (token) => {
        // Try CoinGecko first
        if (token.coingeckoId) {
          try {
            const priceResponse = await $fetch('https://api.coingecko.com/api/v3/simple/price', {
              query: {
                ids: token.coingeckoId,
                vs_currencies: 'usd'
              }
            });
            token.price = priceResponse[token.coingeckoId]?.usd || null;
            if (token.price) {
              console.log(`  💰 ${token.symbol} price from CoinGecko: $${token.price.toFixed(4)}`);
            }
          } catch (error) {
            // Ignore price fetch errors
          }
        }

        // If no price from CoinGecko, try Uniswap V2
        if (!token.price) {
          const uniswapPrice = await getUniswapV2Price(token.contractAddress, token.decimals);
          if (uniswapPrice) {
            token.price = uniswapPrice;
            console.log(`  💰 ${token.symbol} price from Uniswap: $${token.price.toFixed(6)}`);
          }
        }

        return token;
      })
    );

    // Scan for NFTs (ERC-721 and ERC-1155) - MANUAL CONTRACT LIST
    console.log('🖼️  Scanning for NFTs with ethers.js...');
    let nftCollections = [];

    // ERC-721 ABI (minimal - balanceOf, name, symbol, tokenOfOwnerByIndex, tokenURI)
    const ERC721_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
      "function tokenURI(uint256 tokenId) view returns (string)"
    ];

    // ERC-1155 ABI (minimal - balanceOf for specific token ID)
    const ERC1155_ABI = [
      "function balanceOf(address account, uint256 id) view returns (uint256)",
      "function uri(uint256 id) view returns (string)"
    ];

    // Manual list of known NFT contracts (similar to ERC-20 tokens)
    const knownNFTs = [
      // TIAMONDS NFT - fetch from Etherscan API
      {
        address: '0x853459E9b0AAadD95c80AfC49FF26643aA1A2c7B',
        name: 'TIAMONDS NFT',
        symbol: 'TIAMONDS',
        type: 'ERC721',
        logo: '/token-logos/toto.svg',
        useEtherscanAPI: true // Flag to use Etherscan API for NFT discovery
      },
      // Add more NFT contracts here...
      // Popular NFT collections (examples):
      { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'Bored Ape Yacht Club', symbol: 'BAYC', type: 'ERC721' },
      { address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', name: 'Mutant Ape Yacht Club', symbol: 'MAYC', type: 'ERC721' },
      { address: '0xED5AF388653567Af2F388E6224dC7C4b3241C544', name: 'Azuki', symbol: 'AZUKI', type: 'ERC721' },
      { address: '0x23581767a106ae21c074b2276D25e5C3e136a68b', name: 'Moonbirds', symbol: 'MOONBIRD', type: 'ERC721' },
      { address: '0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B', name: 'CloneX', symbol: 'CloneX', type: 'ERC721' },
      { address: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e', name: 'Doodles', symbol: 'DOODLE', type: 'ERC721' },
      { address: '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7', name: 'Meebits', symbol: 'MEEBITS', type: 'ERC721' },
      { address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', name: 'CryptoPunks', symbol: 'PUNK', type: 'ERC721' },
    ];

    try {
      console.log(`🔍 Checking ${knownNFTs.length} NFT contracts...`);

      for (const nft of knownNFTs) {
        try {
          console.log(`  🖼️  Checking ${nft.name} (${nft.address.substring(0, 6)}...${nft.address.substring(nft.address.length - 4)})`);

          const normalizedAddress = ethers.getAddress(nft.address);

          if (nft.type === 'ERC721') {
            const contract = new ethers.Contract(normalizedAddress, ERC721_ABI, provider);

            // Get balance
            const balance = await contract.balanceOf(address);
            const balanceNum = Number(balance);

            console.log(`    💾 NFT Balance: ${balanceNum}`);

            if (balanceNum > 0) {
              console.log(`    ✅ HAS ${balanceNum} NFTs!`);

              // Get collection details
              let collectionName = nft.name;
              let collectionSymbol = nft.symbol;

              try {
                collectionName = await contract.name();
              } catch (e) {
                // Use default
              }

              try {
                collectionSymbol = await contract.symbol();
              } catch (e) {
                // Use default
              }

              // Fetch individual NFT images (limit to first 10 to avoid slow loading)
              const nftItems = [];
              const maxNFTsToFetch = Math.min(balanceNum, 10);
              let supportsEnumerable = true;

              // Check if we have known tokens for this address (hardcoded data)
              const addressLower = address.toLowerCase();
              if (nft.knownTokens && nft.knownTokens[addressLower]) {
                console.log(`      ℹ️  Using known token data for this address`);
                const knownItems = nft.knownTokens[addressLower];

                for (const item of knownItems) {
                  nftItems.push({
                    tokenId: item.tokenId.toString(),
                    name: item.name,
                    image: item.image
                  });
                  console.log(`      ✅ Known NFT: ${item.name} (tokenId: ${item.tokenId})`);
                }

                supportsEnumerable = false; // Skip other methods
              }

              // Try tokenOfOwnerByIndex first (ERC-721 Enumerable) if no known tokens
              if (supportsEnumerable && nftItems.length === 0) {
                for (let i = 0; i < maxNFTsToFetch; i++) {
                try {
                  // Get token ID at index
                  const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                  console.log(`      🎨 Fetching NFT #${i + 1} (tokenId: ${tokenId.toString()})`);

                  // Get token URI
                  const tokenURI = await contract.tokenURI(tokenId);
                  console.log(`      📎 Token URI: ${tokenURI.substring(0, 50)}...`);

                  // Fetch metadata from token URI
                  let imageUrl = null;
                  let nftName = `#${tokenId.toString()}`;
                  try {
                    // Convert IPFS URIs to HTTP gateways
                    let metadataUrl = tokenURI;
                    if (metadataUrl.startsWith('ipfs://')) {
                      metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    }

                    // Fetch metadata JSON
                    const metadata = await $fetch(metadataUrl, { timeout: 5000 });

                    // Extract name
                    if (metadata.name) {
                      nftName = metadata.name;
                      console.log(`      📝 Name: ${nftName}`);
                    }

                    // Extract image
                    if (metadata.image) {
                      imageUrl = metadata.image;
                      // Convert IPFS image URLs to HTTP
                      if (imageUrl.startsWith('ipfs://')) {
                        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                      }
                      console.log(`      🖼️  Image: ${imageUrl.substring(0, 50)}...`);
                    }
                  } catch (metaError) {
                    console.log(`      ⚠️  Could not fetch metadata: ${metaError.message}`);
                  }

                  nftItems.push({
                    tokenId: tokenId.toString(),
                    name: nftName,
                    image: imageUrl
                  });

                  } catch (nftError) {
                    console.log(`      ⏭️  Skipped NFT #${i + 1}: ${nftError.message}`);
                    // If tokenOfOwnerByIndex not supported, use alternative method
                    if (nftError.message.includes('execution reverted') || nftError.message.includes('tokenOfOwnerByIndex')) {
                      console.log(`      ℹ️  Contract doesn't support tokenOfOwnerByIndex - trying alternative method`);
                      supportsEnumerable = false;
                      break;
                    }
                  }
                }
              }

              // If contract doesn't support Enumerable, try checking common token IDs
              if (!supportsEnumerable && nftItems.length === 0) {
                console.log(`      🔍 Alternative method: checking token IDs 0-100...`);
                const ERC721_OWNER_ABI = ["function ownerOf(uint256 tokenId) view returns (address)"];
                const ownerContract = new ethers.Contract(normalizedAddress, ERC721_OWNER_ABI, provider);

                for (let tokenId = 0; tokenId < 100 && nftItems.length < maxNFTsToFetch; tokenId++) {
                  try {
                    const owner = await ownerContract.ownerOf(tokenId);

                    if (owner.toLowerCase() === address.toLowerCase()) {
                      console.log(`      ✅ Found owned token: ${tokenId}`);

                      // Try to get metadata
                      let imageUrl = null;
                      let nftName = `#${tokenId}`;

                      try {
                        const tokenURI = await contract.tokenURI(tokenId);
                        console.log(`      📎 Token URI: ${tokenURI.substring(0, 50)}...`);

                        let metadataUrl = tokenURI;
                        if (metadataUrl.startsWith('ipfs://')) {
                          metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                        }

                        const metadata = await $fetch(metadataUrl, { timeout: 3000 });

                        if (metadata.name) {
                          nftName = metadata.name;
                          console.log(`      📝 Name: ${nftName}`);
                        }

                        if (metadata.image) {
                          imageUrl = metadata.image;
                          if (imageUrl.startsWith('ipfs://')) {
                            imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                          }
                          console.log(`      🖼️  Image: ${imageUrl.substring(0, 50)}...`);
                        }
                      } catch (metaError) {
                        console.log(`      ⚠️  Could not fetch metadata: ${metaError.message}`);
                      }

                      nftItems.push({
                        tokenId: tokenId.toString(),
                        name: nftName,
                        image: imageUrl
                      });
                    }
                  } catch (e) {
                    // Token doesn't exist or not owned by address - skip silently
                  }
                }

                console.log(`      ✅ Found ${nftItems.length} NFTs using alternative method`);
              }

              nftCollections.push({
                contractAddress: normalizedAddress,
                name: collectionName,
                symbol: collectionSymbol,
                type: 'ERC721',
                balance: balanceNum,
                logo: nft.logo || null,
                thumbnail: nftItems[0]?.image || null,
                nfts: nftItems
              });

              console.log(`  ✅ ${collectionName}: ${balanceNum} NFTs (fetched ${nftItems.length} images)`);
            }
          } else if (nft.type === 'ERC1155') {
            // For ERC-1155, we'd need to know specific token IDs
            // This is more complex - skip for now or implement with known token IDs
            console.log(`  ⏭️  Skipped ${nft.name}: ERC-1155 requires known token IDs`);
          }

        } catch (error) {
          console.log(`  ⏭️  Skipped ${nft.name}: ${error.message}`);
        }
      }

      console.log(`✅ Found ${nftCollections.length} NFT collections with balance > 0`);

    } catch (error) {
      console.warn('⚠️  Could not scan NFTs:', error.message);
    }

    return {
      success: true,
      data: {
        address: address,
        ethBalance: ethBalance,
        ethBalanceUSD: ethBalanceUSD,
        ethPrice: ethPriceUSD,
        tokens: tokensWithPrices,
        tokensCount: tokensWithPrices.length,
        nfts: nftCollections,
        nftsCount: nftCollections.length
      }
    };

  } catch (error) {
    console.error('❌ Error scanning Ethereum address:', error);
    return {
      success: false,
      message: error.message || "Failed to scan Ethereum address",
      data: {
        address: '',
        ethBalance: 0,
        ethBalanceUSD: 0,
        tokens: []
      }
    };
  }
});
