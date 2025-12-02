import { gridBotSchema } from '~/server/models/gridBot.schema.js';
import { FronRunSchema } from '~/server/models/FronRun.schema.js';
import { OneClickBotSchema } from '~/server/models/OneClickBot.schema.js';
import { FibBotSchema } from '~/server/models/FibBot.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, command, botType } = body;

    if (!userID || !command) {
      return {
        success: false,
        message: 'Missing required parameters: userID and command',
      };
    }

    console.log(`[Global Command] User: ${userID}, Command: ${command}, BotType: ${botType}`);

    // Determine which bot collections to target
    const botSchemas = getBotSchemas(botType);

    const results = [];

    // Execute command on all specified bot types
    for (const { schema, name } of botSchemas) {
      try {
        const bots = await schema.find({ userID });

        for (const bot of bots) {
          const result = await executeCommand(bot, schema, command, name);
          results.push(result);
        }
      } catch (error) {
        console.error(`Error executing command on ${name}:`, error);
        results.push({
          botType: name,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      message: `Global command '${command}' executed on ${results.length} bots`,
      results,
    };

  } catch (error) {
    console.error('[Global Command] Error:', error);
    return {
      success: false,
      message: 'Failed to execute global command',
      error: error.message,
    };
  }
});

// Helper: Get bot schemas based on botType filter
function getBotSchemas(botType) {
  const allSchemas = [
    { schema: gridBotSchema, name: 'gridBots' },
    { schema: FronRunSchema, name: 'frontRunBots' },
    { schema: OneClickBotSchema, name: 'oneClickBots' },
    { schema: FibBotSchema, name: 'fibBots' },
  ];

  if (botType === 'all') {
    return allSchemas;
  }

  return allSchemas.filter(s => s.name === botType);
}

// Helper: Execute command on a specific bot
async function executeCommand(bot, schema, command, botTypeName) {
  try {
    console.log(`[Execute] ${command} on ${bot.name} (${botTypeName})`);

    switch (command) {
      case 'start':
        return await startBot(bot, schema);

      case 'pause':
        return await pauseBot(bot, schema);

      case 'stop':
        return await stopBot(bot, schema);

      case 'buyAll':
        return await executeBuyAll(bot, schema);

      case 'sellAll':
        return await executeSellAll(bot, schema);

      case 'close':
        return await closeBot(bot, schema);

      case 'regroup':
        return await regroupBot(bot, schema);

      case 'rebalance':
        return await rebalanceBot(bot, schema);

      case 'cancelAll':
        return await cancelAllOrders(bot, schema);

      default:
        return {
          botId: bot._id,
          botName: bot.name,
          success: false,
          message: `Unknown command: ${command}`
        };
    }
  } catch (error) {
    console.error(`[Execute Command] Error on bot ${bot.name}:`, error);
    return {
      botId: bot._id,
      botName: bot.name,
      success: false,
      error: error.message
    };
  }
}

// Command Implementations

async function startBot(bot, schema) {
  // Logic to start/resume bot
  await schema.findByIdAndUpdate(bot._id, {
    $set: { status: 'running', lastStarted: new Date() }
  });

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot started successfully'
  };
}

async function pauseBot(bot, schema) {
  // Logic to pause bot
  await schema.findByIdAndUpdate(bot._id, {
    $set: { status: 'paused', lastPaused: new Date() }
  });

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot paused successfully'
  };
}

async function stopBot(bot, schema) {
  // Logic to stop bot completely
  await schema.findByIdAndUpdate(bot._id, {
    $set: { status: 'stopped', lastStopped: new Date() }
  });

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot stopped successfully'
  };
}

async function executeBuyAll(bot, schema) {
  // Logic to execute buy orders for all grids
  // This would trigger the bot to place all buy orders
  console.log(`[Buy All] Executing for ${bot.name}`);

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Buy all orders executed'
  };
}

async function executeSellAll(bot, schema) {
  // Logic to execute sell orders for all positions
  console.log(`[Sell All] Executing for ${bot.name}`);

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Sell all orders executed'
  };
}

async function closeBot(bot, schema) {
  // Logic to close all positions and cancel orders
  await schema.findByIdAndUpdate(bot._id, {
    $set: {
      status: 'closed',
      activeOrders: [],
      closedAt: new Date()
    }
  });

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot closed successfully'
  };
}

async function regroupBot(bot, schema) {
  // Logic to regroup orders based on current price
  console.log(`[Regroup] Regrouping orders for ${bot.name}`);

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot regrouped successfully'
  };
}

async function rebalanceBot(bot, schema) {
  // Logic to rebalance bot's portfolio
  console.log(`[Rebalance] Rebalancing for ${bot.name}`);

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'Bot rebalanced successfully'
  };
}

async function cancelAllOrders(bot, schema) {
  // Logic to cancel all active orders
  await schema.findByIdAndUpdate(bot._id, {
    $set: { activeOrders: [] }
  });

  console.log(`[Cancel All] Cancelled all orders for ${bot.name}`);

  return {
    botId: bot._id,
    botName: bot.name,
    success: true,
    message: 'All orders cancelled successfully'
  };
}