const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'CryptoWallet.vue');
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to find: </div> followed by <div class="card-stats"> without proper closing
// We need to add </div> before <div class="card-stats"> when it's missing

const pattern = /(<span class="crypto-symbol">[^<]+<\/span>\s*<\/div>)\s*(<div class="card-stats">)/g;

content = content.replace(pattern, '$1\n        </div>\n        $2');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed missing closing tags!');
