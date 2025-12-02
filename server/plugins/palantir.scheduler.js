import BotChainEngine from '~/server/engines/palantir/BotChainEngine.js';
import PatternEngine from '~/server/engines/palantir/PatternEngine.js';
import EventEngine from '~/server/engines/palantir/EventEngine.js';

/**
 * Palantir Scheduler Plugin
 *
 * This plugin starts the three core Palantir engines:
 * 1. BotChainEngine - Orchestrates bot chain execution
 * 2. PatternEngine - Detects market patterns in real-time
 * 3. EventEngine - Handles event-driven automation
 */
export default defineNitroPlugin((nitroApp) => {
  console.log('🎯 Initializing Palantir System...');

  // Start Event Engine first (handles events from other engines)
  try {
    EventEngine.start();
    console.log('✅ EventEngine initialized');
  } catch (error) {
    console.error('❌ Failed to start EventEngine:', error);
  }

  // Start Pattern Engine (detects patterns and emits events)
  try {
    PatternEngine.start();
    console.log('✅ PatternEngine initialized');
  } catch (error) {
    console.error('❌ Failed to start PatternEngine:', error);
  }

  // Start Bot Chain Engine (orchestrates bot chains)
  try {
    BotChainEngine.start();
    console.log('✅ BotChainEngine initialized');
  } catch (error) {
    console.error('❌ Failed to start BotChainEngine:', error);
  }

  console.log('🚀 Palantir System fully initialized');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎯 Palantir Trading Intelligence System');
  console.log('  ⛓️  Bot Chains: ACTIVE');
  console.log('  🔍 Pattern Detection: ACTIVE');
  console.log('  ⚡ Event Automation: ACTIVE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Cleanup on shutdown
  nitroApp.hooks.hook('close', () => {
    console.log('🛑 Shutting down Palantir System...');

    try {
      BotChainEngine.stop();
      PatternEngine.stop();
      EventEngine.stop();
      console.log('✅ Palantir System shut down gracefully');
    } catch (error) {
      console.error('❌ Error during Palantir shutdown:', error);
    }
  });
});
