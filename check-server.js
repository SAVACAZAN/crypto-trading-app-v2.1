/**
 * Server Health Check Script
 * Usage: node check-server.js
 *
 * This script will:
 * - Check if server is running
 * - Show response time
 * - Display server health info
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

console.log('🔍 Checking server health...\n');

// Function to make HTTP request
function checkEndpoint(path, name) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;

        try {
          const jsonData = JSON.parse(data);
          resolve({
            name,
            status: 'OK',
            responseTime,
            data: jsonData
          });
        } catch (error) {
          resolve({
            name,
            status: 'OK',
            responseTime,
            data: data.substring(0, 100)
          });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        name,
        status: 'TIMEOUT',
        error: `Request timeout after ${TIMEOUT}ms`
      });
    });

    req.on('error', (error) => {
      reject({
        name,
        status: 'ERROR',
        error: error.message
      });
    });

    req.end();
  });
}

// Main check function
async function checkServer() {
  const checks = [
    { path: '/api/ping', name: 'Ping' },
    { path: '/api/health', name: 'Health Check' }
  ];

  console.log('━'.repeat(60));
  console.log('  SERVER HEALTH CHECK');
  console.log('━'.repeat(60));
  console.log(`  Target: ${SERVER_URL}`);
  console.log(`  Time: ${new Date().toLocaleString()}`);
  console.log('━'.repeat(60));
  console.log();

  let allOk = true;

  for (const check of checks) {
    try {
      const result = await checkEndpoint(check.path, check.name);

      console.log(`✅ ${result.name}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response Time: ${result.responseTime}ms`);

      if (result.data && typeof result.data === 'object') {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2).split('\n').map((line, i) => i === 0 ? line : '        ' + line).join('\n'));
      }
      console.log();
    } catch (error) {
      allOk = false;
      console.log(`❌ ${error.name}`);
      console.log(`   Status: ${error.status}`);
      console.log(`   Error: ${error.error}`);
      console.log();
    }
  }

  console.log('━'.repeat(60));

  if (allOk) {
    console.log('✅ Server is HEALTHY and responding normally');
    console.log('━'.repeat(60));
    process.exit(0);
  } else {
    console.log('❌ Server has ISSUES - check logs above');
    console.log('━'.repeat(60));
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure server is running: npm run dev');
    console.log('   2. Check if port 3000 is available');
    console.log('   3. Look for errors in the server console');
    console.log('   4. Try restarting the server');
    process.exit(1);
  }
}

// Run the check
checkServer().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
