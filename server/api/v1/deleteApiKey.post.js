import { userExchangesSchema } from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    console.log('deleteApiKey endpoint called with:', body);

    try {
        // Find the user exchange document
        const userExchange = await userExchangesSchema.findOne({
            _id: body.id,
            userID: body.userID,
            exchange: body.exchange
        });

        console.log('Found userExchange:', userExchange ? 'Yes' : 'No');

        if (!userExchange) {
            return {
                success: false,
                message: 'Exchange not found'
            };
        }

        console.log('Current API keys count:', userExchange.apiKeys.length);
        console.log('Deleting API key at index:', body.apiKeyIndex);

        // Check if there's only one API key left
        if (userExchange.apiKeys.length <= 1) {
            // If it's the last API key, delete the entire exchange
            await userExchangesSchema.findByIdAndDelete(body.id);
            console.log('Deleted entire exchange (last API key)');
            return {
                success: true,
                deletedExchange: true,
                message: 'Last API key deleted, exchange removed',
                data: userExchange
            };
        }

        // Remove the specific API key by index
        userExchange.apiKeys.splice(body.apiKeyIndex, 1);
        console.log('Remaining API keys count:', userExchange.apiKeys.length);

        // Save the updated document
        await userExchange.save();
        console.log('Saved updated exchange');

        return {
            success: true,
            deletedExchange: false,
            message: 'API key deleted successfully',
            data: userExchange
        };
    } catch (error) {
        console.error('Error deleting API key:', error);
        return {
            success: false,
            message: error.message || 'Failed to delete API key'
        };
    }
});
