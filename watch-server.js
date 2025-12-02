/**
 * Continuous Server Monitor
 * Usage: node watch-server.js
 *
 * This script will:
 * - Continuously monitor server health
 * - Alert when server becomes unresponsive
 * - Show real-time status
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3000';
const CHECK_INTERVAL = 5000; // Check every 5 seconds
const TIMEOUT = 3000; // 3 seconds timeout

let consecutiveFailures = 0;
let totalChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;
let totalResponseTime = 0;

console.log('🔄 Starting continuous server monitoring...\n');
console.log('━'.repeat(60));
console.log(`  Target: ${SERVER_URL}/api/ping`);
console.log(`  Interval: ${CHECK_INTERVAL / 1000}s`);
console.log(`  Timeout: ${TIMEOUT / 1000}s`);
console.log('━'.repeat(60));
console.log('\nPress Ctrl+C to stop\n');

function ping() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ping',
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
        resolve({ success: true, responseTime });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function getStatusIcon(success) {
  return success ? '✅' : '❌';
}

function getResponseTimeColor(time) {
  if (time < 100) return '🟢'; // Fast
  if (time < 500) return '🟡'; // Normal
  return '🔴'; // Slow
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

async function checkServer() {
  totalChecks++;
  const timestamp = new Date().toLocaleTimeString();

  try {
    const result = await ping();
    successfulChecks++;
    consecutiveFailures = 0;
    totalResponseTime += result.responseTime;

    const avgResponseTime = Math.round(totalResponseTime / successfulChecks);
    const uptime = Math.round((successfulChecks / totalChecks) * 100);
    const icon = getResponseTimeColor(result.responseTime);

    console.log(
      `${getStatusIcon(true)} [${timestamp}] ` +
      `${icon} ${result.responseTime}ms | ` +
      `Avg: ${avgResponseTime}ms | ` +
      `Uptime: ${uptime}% | ` +
      `Success: ${successfulChecks}/${totalChecks}`
    );

  } catch (error) {
    failedChecks++;
    consecutiveFailures++;

    console.log(
      `${getStatusIcon(false)} [${timestamp}] ` +
      `ERROR: ${error.message} | ` +
      `Consecutive failures: ${consecutiveFailures} | ` +
      `Failed: ${failedChecks}/${totalChecks}`
    );

    // Alert on multiple consecutive failures
    if (consecutiveFailures === 3) {
      console.log('\n⚠️  WARNING: Server unresponsive for 3 consecutive checks!\n');
    } else if (consecutiveFailures === 10) {
      console.log('\n🚨 CRITICAL: Server down for 10 consecutive checks!\n');
    }
  }
}

// Show statistics on exit
process.on('SIGINT', () => {
  const avgResponseTime = successfulChecks > 0
    ? Math.round(totalResponseTime / successfulChecks)
    : 0;
  const uptime = Math.round((successfulChecks / totalChecks) * 100);

  console.log('\n\n━'.repeat(60));
  console.log('  MONITORING SUMMARY');
  console.log('━'.repeat(60));
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  ✅ Successful: ${successfulChecks} (${uptime}%)`);
  console.log(`  ❌ Failed: ${failedChecks} (${100 - uptime}%)`);
  console.log(`  ⏱️  Avg Response Time: ${avgResponseTime}ms`);
  console.log('━'.repeat(60));
  console.log('\n👋 Monitoring stopped\n');
  process.exit(0);
});

// Start monitoring
console.log('🚀 Monitoring started...\n');
checkServer(); // First check immediately
setInterval(checkServer, CHECK_INTERVAL);
