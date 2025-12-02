import { dcaGridBotSchema } from "~/server/models/dcaGridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API createDcaGridBot] Request received:', {
        userID: data.userID,
        symbol: data.symbol,
        strategyType: data.strategyType
    });

    try {
        // Validate required fields
        if (!data.userID || !data.symbol || !data.strategyType) {
            return {
                success: false,
                message: 'Missing required fields: userID, symbol, or strategyType'
            };
        }

        // Calculate next DCA date based on interval
        const calculateNextDca = (startDate, interval) => {
            const start = new Date(startDate);
            const intervalMap = {
                'hourly': 60 * 60 * 1000,
                '4hours': 4 * 60 * 60 * 1000,
                '12hours': 12 * 60 * 60 * 1000,
                'daily': 24 * 60 * 60 * 1000,
                '3days': 3 * 24 * 60 * 60 * 1000,
                'weekly': 7 * 24 * 60 * 60 * 1000,
                'biweekly': 14 * 24 * 60 * 60 * 1000,
                'monthly': 30 * 24 * 60 * 60 * 1000
            };

            const ms = intervalMap[interval] || intervalMap['daily'];
            return new Date(start.getTime() + ms);
        };

        // Create DCA + Grid bot document
        const newBot = new dcaGridBotSchema({
            userID: data.userID,
            name: data.name || `DCA_GRID_${data.symbol.replace('/', '_')}_${Date.now()}`,
            exchange: data.exchange || 'coinbaseadvanced',
            symbol: data.symbol,
            strategyType: data.strategyType,

            // DCA Configuration
            dcaAmount: data.dcaAmount,
            dcaInterval: data.dcaInterval,
            totalBudget: data.totalBudget,
            startDate: new Date(data.startDate),
            duration: data.duration,
            nextDcaDate: calculateNextDca(data.startDate, data.dcaInterval),

            // Grid Configuration
            lowerPrice: data.lowerPrice,
            upperPrice: data.upperPrice,
            nrOfGrids: data.nrOfGrids,
            gridAmount: data.gridAmount,
            gridSide: data.gridSide,

            // Advanced Options
            autoAdjustGrid: data.autoAdjustGrid || false,
            reinvestProfits: data.reinvestProfits || false,
            stopLoss: data.stopLoss,
            takeProfit: data.takeProfit,

            // API Keys
            apiKeyNames: data.apiKeyNames || [],

            // Status
            status: 'active',
            totalInvested: 0,
            profit: 0,
            dcaExecutions: [],
            gridOrders: [],
            filledOrders: [],

            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newBot.save();

        console.log('[API createDcaGridBot] Bot created successfully:', {
            botId: newBot._id,
            name: newBot.name
        });

        return {
            success: true,
            message: 'DCA + Grid bot created successfully',
            data: {
                botId: newBot._id,
                name: newBot.name,
                symbol: newBot.symbol,
                strategyType: newBot.strategyType,
                nextDcaDate: newBot.nextDcaDate
            }
        };

    } catch (error) {
        console.error('[API createDcaGridBot] Error:', error);
        return {
            success: false,
            message: 'Error creating DCA + Grid bot: ' + error.message
        };
    }
});
