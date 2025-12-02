/**
 * Hyperliquid Markets Auto-Sync Scheduler
 * Runs every hour to keep market data fresh
 */

let syncInterval = null;
let isEnabled = false; // Set to true to enable auto-sync

export default defineNitroPlugin((nitroApp) => {
  console.log('[HYPERLIQUID-SCHEDULER] 🚀 Initializing Hyperliquid market sync scheduler...');

  // Check if auto-sync is enabled
  if (!isEnabled) {
    console.log('[HYPERLIQUID-SCHEDULER] ⚠️ Auto-sync is DISABLED');
    console.log('[HYPERLIQUID-SCHEDULER] 💡 To enable, set isEnabled = true in server/plugins/hyperliquid-sync-scheduler.js');
    console.log('[HYPERLIQUID-SCHEDULER] 📝 You can manually sync by calling POST /api/v1/sync-hyperliquid-markets');
    return;
  }

  // Function to perform sync
  const performSync = async () => {
    try {
      console.log('[HYPERLIQUID-SCHEDULER] 🔄 Starting scheduled market sync...');

      const response = await fetch('http://localhost:3000/api/v1/sync-hyperliquid-markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        console.log('[HYPERLIQUID-SCHEDULER] ✅ Sync completed successfully');
        console.log(`[HYPERLIQUID-SCHEDULER] 📊 SPOT: ${result.data.spot.count} markets`);
        console.log(`[HYPERLIQUID-SCHEDULER] 📊 PERP: ${result.data.perp.count} markets`);
        console.log(`[HYPERLIQUID-SCHEDULER] 📊 TOTAL: ${result.data.totalCount} markets`);
      } else {
        console.error('[HYPERLIQUID-SCHEDULER] ❌ Sync failed:', result.error);
      }

    } catch (error) {
      console.error('[HYPERLIQUID-SCHEDULER] ❌ Error during sync:', error.message);
    }
  };

  // Run initial sync after 10 seconds (give server time to fully start)
  setTimeout(() => {
    console.log('[HYPERLIQUID-SCHEDULER] 🎬 Running initial market sync...');
    performSync();
  }, 10000);

  // Schedule sync every hour (3600000 ms)
  syncInterval = setInterval(() => {
    performSync();
  }, 3600000); // 1 hour

  console.log('[HYPERLIQUID-SCHEDULER] ⏰ Scheduler activated - syncing every hour');

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      console.log('[HYPERLIQUID-SCHEDULER] 🛑 Scheduler stopped');
    }
  });
});
