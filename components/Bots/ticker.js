const axios = require('axios');
const fs = require('fs');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://api.coinbase.com/api/v3/brokerage/market/products?limit=100000',
  headers: { 
    'Content-Type': 'application/json'
  }
};

axios.request(config)
  .then((response) => {
    const products = response.data.products || [];
    
    // Filtrăm doar perechile unde USDC este quote_asset
    const usdcPairs = products
      .filter(product => product.quote_currency_id === 'USDC') // Verificăm dacă USDC este quote_asset
      .map(product => `${product.base_currency_id}/USDC`); // Formatăm ca [ticker/USDC]

    console.log('USDC Trading Pairs:', usdcPairs);

    // Salvăm perechile în fișierul JSON
    fs.writeFile('usdc_pairs.json', JSON.stringify(usdcPairs, null, 2), (err) => {
      if (err) {
        console.error('Error saving USDC trading pairs to JSON:', err.message);
      } else {
        console.log('USDC trading pairs successfully saved to usdc_pairs.json');
      }
    });
  })
  .catch((error) => {
    console.error('Error fetching trading pairs:', error.message);
  });
