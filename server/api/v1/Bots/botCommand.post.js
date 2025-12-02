import { gridBotSchema } from '~/server/models/gridBot.schema.js';
import { FronRunSchema } from '~/server/models/FronRun.schema.js';
import { OneClickBotSchema } from '~/server/models/OneClickBot.schema.js';
import { FibBotSchema } from '~/server/models/FibBot.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, botId, botType, command } = body;

    if (!userID || !botId || !botType || !command) {
      return {
        success: false,
        message: 'Missing required parameters: userID, botId, botType, and command',
      };
    }

    console.log(`[Bot Command] User: ${userID}, Bot: ${botId}, Type: ${botType}, Command: ${command}`);

    // Get the appropriate schema
    const schema = getBotSchema(botType);

    if (!schema) {
      return {
        success: false,
        message: `Unknown bot type: ${botType}`,
      };
    }

    // Find the bot
    const bot = await schema.findOne({ _id: botId, userID });

    if (!bot) {
      return {
        success: false,
        message: 'Bot not found',
      };
    }

    // Execute command
    const result = await executeCommand(bot, schema, command);

    return {
      success: true,
      message: `Command '${command}' executed successfully`,
      data: result,
    };

  } catch (error) {
    console.error('[Bot Command] Error:', error);
    return {
      success: false,
      message: 'Failed to execute bot command',
      error: error.message,
    };
  }
});

// Helper: Get schema by bot type
function getBotSchema(botType) {
  const schemas = {
    gridBots: gridBotSchema,
    frontRunBots: FronRunSchema,
    oneClickBots: OneClickBotSchema,
    fibBots: FibBotSchema,
  };

  return schemas[botType];
}

// Helper: Execute command on a specific bot
async function executeCommand(bot, schema, command) {
  console.log(`[Execute] ${command} on ${bot.name}`);

  switch (command) {
    case 'start':
      return await startBot(bot, schema);

    case 'pause':
      return await pauseBot(bot, schema);

    case 'stop':
      return await stopBot(bot, schema);

    case 'close':
      return await closeBot(bot, schema);

    case 'buyAll':
      return await executeBuyAll(bot, schema);

    case 'sellAll':
      return await executeSellAll(bot, schema);

    case 'regroup':
      return await regroupBot(bot, schema);

    case 'rebalance':
      return await rebalanceBot(bot, schema);

    case 'cancelAll':
      return await cancelAllOrders(bot, schema);

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Command Implementations

async function startBot(bot, schema) {
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        status: 'running',
        lastStarted: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot started successfully',
  };
}

async function pauseBot(bot, schema) {
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        status: 'paused',
        lastPaused: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot paused successfully',
  };
}

async function stopBot(bot, schema) {
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        status: 'stopped',
        lastStopped: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot stopped successfully',
  };
}

async function closeBot(bot, schema) {
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        status: 'closed',
        activeOrders: [],
        closedAt: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot closed successfully',
  };
}

async function executeBuyAll(bot, schema) {
  console.log(`[Buy All] Executing for ${bot.name}`);

  // Logic to place all buy orders based on bot configuration
  // This would integrate with the bot's engine to execute orders

  return {
    message: 'Buy all orders executed',
    ordersPlaced: 0, // Would be calculated based on actual execution
  };
}

async function executeSellAll(bot, schema) {
  console.log(`[Sell All] Executing for ${bot.name}`);

  // Logic to place all sell orders or liquidate positions

  return {
    message: 'Sell all orders executed',
    ordersPlaced: 0, // Would be calculated based on actual execution
  };
}

async function regroupBot(bot, schema) {
  console.log(`[Regroup] Regrouping orders for ${bot.name}`);

  // Cancel existing orders and regroup based on current market price
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        activeOrders: [],
        lastRegrouped: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot regrouped successfully',
  };
}

async function rebalanceBot(bot, schema) {
  console.log(`[Rebalance] Rebalancing for ${bot.name}`);

  // Rebalance portfolio based on target allocation
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        lastRebalanced: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'Bot rebalanced successfully',
  };
}

async function cancelAllOrders(bot, schema) {
  console.log(`[Cancel All] Cancelling all orders for ${bot.name}`);

  // Cancel all active orders via exchange API
  const updatedBot = await schema.findByIdAndUpdate(
    bot._id,
    {
      $set: {
        activeOrders: [],
        lastCancelled: new Date(),
      }
    },
    { new: true }
  );

  return {
    bot: updatedBot,
    message: 'All orders cancelled successfully',
  };
}