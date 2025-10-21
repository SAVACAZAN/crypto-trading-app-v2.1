import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';
import { userExchangesSchema } from '../models/userExchanges.schema';
import { userSchema } from '../models/user.schema';
import { createClosedOrdersSyncService } from '../services/ClosedOrdersSyncService';

let syncInterval = null;
let isRunning = false;
let closedOrdersSyncService = null; // Will be initialized with nitroApp

// Rate limiting for LCX - max 1 request per 2 seconds
const lcxRequestQueue = [];
let lcxLastRequestTime = 0;
const LCX_MIN_DELAY = 2000; // 2 seconds between LCX requests

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

// Sync closed orders for a single user - OPTIMIZED VERSION
async function syncUserClosedOrders(userID, symbol = undefined) {
  console.log(`[CLOSED-SYNC] 🔄 Syncing closed orders for user ${userID}...`);

  try {
    // Fetch all exchanges for the user
    const userExchanges = await userExchangesSchema.find({ userID });

    if (!userExchanges || userExchanges.length === 0) {
      console.log(`[CLOSED-SYNC] ⚠️ No exchanges found for user ${userID}`);
      return { success: true, synced: 0, errors: 0, rateLimited: 0 };
    }

    let syncedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let rateLimitedCount = 0;

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
        console.log(`[CLOSED-SYNC] ⏭️ Skipping ${exchange} - all API keys are inactive`);
        continue;
      }

      for (const apiKeyName of apiKeysList) {
        try {
          // Check if service is initialized
          if (!closedOrdersSyncService) {
            console.error(`[CLOSED-SYNC] ❌ Service not initialized yet`);
            errorCount++;
            continue;
          }

          // Use optimized sync service
          const result = await closedOrdersSyncService.syncClosedOrders(
            userID,
            exchange,
            apiKeyName,
            symbol
          );

          if (result.success) {
            syncedCount += result.inserted || 0;
            skippedCount += result.skipped || 0;

            if (result.inserted > 0) {
              console.log(`[CLOSED-SYNC] ✅ ${exchange} - ${apiKeyName}: ${result.inserted} new, ${result.skipped} skipped (next sync in ${result.nextSyncIn}s)`);
            } else {
              console.log(`[CLOSED-SYNC] ⏭️ ${exchange} - ${apiKeyName}: No new orders (next sync in ${result.nextSyncIn}s)`);
            }
          } else if (result.rateLimited) {
            rateLimitedCount++;
            // Don't log every rate limit - too noisy
          } else {
            errorCount++;
            console.error(`[CLOSED-SYNC] ❌ ${exchange} - ${apiKeyName}: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`[CLOSED-SYNC] ❌ Error ${exchange} - ${apiKeyName}:`, error.message);
        }

        // Small delay between API keys to spread load
        await delay(1000);
      }
    }

    console.log(`[CLOSED-SYNC] ✅ User ${userID}: ${syncedCount} inserted, ${skippedCount} skipped, ${rateLimitedCount} rate-limited, ${errorCount} errors`);
    return {
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      rateLimited: rateLimitedCount,
      errors: errorCount
    };

  } catch (error) {
    console.error(`[CLOSED-SYNC] ❌ Error syncing user ${userID}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main sync job - runs every 5 minutes
async function runClosedOrdersSyncJob() {
  if (isRunning) {
    console.log('[CLOSED-SYNC] ⏭️ Previous sync still running, skipping...');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  console.log('\n[CLOSED-SYNC] 🚀 Starting automatic closed orders sync...');

  try {
    // Get all users
    const users = await userSchema.find({});

    if (!users || users.length === 0) {
      console.log('[CLOSED-SYNC] ℹ️ No users found');
      isRunning = false;
      return;
    }

    console.log(`[CLOSED-SYNC] 👥 Found ${users.length} user(s) to sync`);

    let totalSynced = 0;
    let totalSkipped = 0;
    let totalRateLimited = 0;
    let totalErrors = 0;

    // Sync each user with a small delay between users
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const result = await syncUserClosedOrders(user._id.toString());

      if (result.success) {
        totalSynced += result.synced || 0;
        totalSkipped += result.skipped || 0;
        totalRateLimited += result.rateLimited || 0;
        totalErrors += result.errors || 0;
      }

      // Add delay between users to spread load (5 seconds)
      if (i < users.length - 1) {
        await delay(5000);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[CLOSED-SYNC] 🎉 Sync completed in ${duration}s: ${totalSynced} inserted, ${totalSkipped} skipped, ${totalRateLimited} rate-limited, ${totalErrors} errors\n`);

  } catch (error) {
    console.error('[CLOSED-SYNC] ❌ Sync job failed:', error);
  } finally {
    isRunning = false;
  }
}

export default defineNitroPlugin((nitroApp) => {
  console.log('[CLOSED-SYNC] 🛑 SYNC SCHEDULER DISABLED - No automatic syncing');

  // Initialize service with nitroApp (still needed for manual sync)
  closedOrdersSyncService = createClosedOrdersSyncService(nitroApp);
  console.log('[CLOSED-SYNC] ✅ Service initialized (manual sync only)');

  // DISABLED - NO AUTOMATIC SYNC
  // syncInterval = setIntervalAsync(async () => {
  //   await runClosedOrdersSyncJob();
  // }, 300000);

  // DISABLED - NO SYNC ON STARTUP
  // runClosedOrdersSyncJob();

  console.log('[CLOSED-SYNC] ⚠️ Automatic sync is DISABLED to prevent flooding');

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', async () => {
    console.log('[CLOSED-SYNC] 🛑 Stopping closed orders sync scheduler...');
    if (syncInterval) {
      await clearIntervalAsync(syncInterval);
    }
  });
});
