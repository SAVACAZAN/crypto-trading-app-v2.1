import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { balanceSchema } from '../models/balance.schema';
import { userExchangesSchema } from '../models/userExchanges.schema';
import { userSchema } from '../models/user.schema';

let syncInterval = null;
let isRunning = false;

// Rate limiting for LCX - max 1 request per 5 seconds to be safe when we have multiple API keys
const lcxRequestQueue = [];
let lcxLastRequestTime = 0;
const LCX_MIN_DELAY = 5000; // 5 seconds between LCX requests (to handle multiple API keys)

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Process LCX requests with rate limiting
async function processLCXRequest(fn) {
  return new Promise(async (resolve) => {
    lcxRequestQueue.push({ fn, resolve });

    // Start processing if not already running
    if (lcxRequestQueue.length === 1) {
      while (lcxRequestQueue.length > 0) {
        const now = Date.now();
        const timeSinceLastRequest = now - lcxLastRequestTime;

        if (timeSinceLastRequest < LCX_MIN_DELAY) {
          await delay(LCX_MIN_DELAY - timeSinceLastRequest);
        }

        const { fn, resolve: resolveRequest } = lcxRequestQueue.shift();
        lcxLastRequestTime = Date.now();

        try {
          const result = await fn();
          resolveRequest(result);
        } catch (error) {
          resolveRequest({ error: error.message });
        }
      }
    }
  });
}

// Sync balances for a single user
async function syncUserBalances(userID) {
  console.log(`[SCHEDULER] 🔄 Syncing balances for user ${userID}...`);

  try {
    // Fetch all exchanges for the user
    const userExchanges = await userExchangesSchema.find({ userID });

    if (!userExchanges || userExchanges.length === 0) {
      console.log(`[SCHEDULER] ⚠️ No exchanges found for user ${userID}`);
      return { success: true, cached: 0, errors: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    // Loop through each exchange and API key combination
    for (const exchangeDoc of userExchanges) {
      const exchange = exchangeDoc.exchange;
      const apiKeysArray = exchangeDoc.apiKeys || [];

      // Handle both old and new API key formats
      let apiKeysList = [];
      if (apiKeysArray.length > 0) {
        if (apiKeysArray[0].name !== undefined) {
          // New format - filter out inactive keys
          apiKeysList = apiKeysArray
            .filter(k => k.isActive !== false)
            .map(k => k.name);
        } else {
          apiKeysList = ['default'];
        }
      }

      // Skip if no active API keys
      if (apiKeysList.length === 0) {
        console.log(`[SCHEDULER] ⏭️ Skipping ${exchange} - all API keys are inactive`);
        continue;
      }

      for (const apiKeyName of apiKeysList) {
        try {
          // Special handling for LCX with rate limiting
          let balanceResponse;

          if (exchange === 'lcx') {
            console.log(`[SCHEDULER] 🐌 LCX request queued for ${apiKeyName}...`);
            balanceResponse = await processLCXRequest(async () => {
              return await $fetch('/api/v1/fetchBalance', {
                method: 'GET',
                params: {
                  userID,
                  exchange,
                  apiKeyName
                }
              });
            });
          } else {
            // Normal fetch for other exchanges
            balanceResponse = await $fetch('/api/v1/fetchBalance', {
              method: 'GET',
              params: {
                userID,
                exchange,
                apiKeyName
              }
            });
          }

          if (balanceResponse && balanceResponse.success && balanceResponse.data) {
            // Calculate total USD value
            let totalUSD = 0;
            if (balanceResponse.data.total) {
              totalUSD = Object.values(balanceResponse.data.total).reduce((sum, val) => {
                return sum + (typeof val === 'number' ? val : 0);
              }, 0);
            }

            // Upsert balance in database
            await balanceSchema.findOneAndUpdate(
              {
                userID,
                exchange,
                apiKeyName
              },
              {
                userID,
                exchange,
                apiKeyName,
                balance: balanceResponse.data,
                totalUSD,
                timestamp: new Date(),
                lastUpdated: new Date()
              },
              {
                upsert: true,
                new: true
              }
            );

            successCount++;
            console.log(`[SCHEDULER] ✅ Cached ${exchange} - ${apiKeyName}`);
          } else {
            errorCount++;
            console.log(`[SCHEDULER] ⚠️ Failed ${exchange} - ${apiKeyName}: ${balanceResponse?.log || 'No data'}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`[SCHEDULER] ❌ Error ${exchange} - ${apiKeyName}:`, error.message);
        }
      }
    }

    console.log(`[SCHEDULER] ✅ User ${userID}: ${successCount} cached, ${errorCount} errors`);
    return { success: true, cached: successCount, errors: errorCount };

  } catch (error) {
    console.error(`[SCHEDULER] ❌ Error syncing user ${userID}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main sync job - runs every minute
async function runBalanceSyncJob() {
  if (isRunning) {
    console.log('[SCHEDULER] ⏭️ Previous sync still running, skipping...');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log('\n[SCHEDULER] 🚀 Starting automatic balance sync...');

  try {
    // Get all users
    const users = await userSchema.find({});

    if (!users || users.length === 0) {
      console.log('[SCHEDULER] ℹ️ No users found');
      isRunning = false;
      return;
    }

    console.log(`[SCHEDULER] 👥 Found ${users.length} user(s) to sync`);

    let totalCached = 0;
    let totalErrors = 0;

    // Sync each user with a small delay between users
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const result = await syncUserBalances(user._id.toString());

      if (result.success) {
        totalCached += result.cached || 0;
        totalErrors += result.errors || 0;
      }

      // Add delay between users to spread load (5 seconds)
      if (i < users.length - 1) {
        await delay(5000);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[SCHEDULER] 🎉 Sync completed in ${duration}s: ${totalCached} cached, ${totalErrors} errors\n`);

  } catch (error) {
    console.error('[SCHEDULER] ❌ Sync job failed:', error);
  } finally {
    isRunning = false;
  }
}

export default defineNitroPlugin((nitroApp) => {
  console.log('[SCHEDULER] 🛑 BALANCE SYNC DISABLED - No automatic syncing');

  // DISABLED - NO AUTOMATIC SYNC
  // syncInterval = setIntervalAsync(async () => {
  //   await runBalanceSyncJob();
  // }, 60000);

  // DISABLED - NO SYNC ON STARTUP
  // runBalanceSyncJob();

  console.log('[SCHEDULER] ⚠️ Balance sync is DISABLED to prevent flooding when exchanges are down');

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', async () => {
    console.log('[SCHEDULER] 🛑 Stopping balance sync scheduler...');
    if (syncInterval) {
      await clearIntervalAsync(syncInterval);
    }
  });
});
