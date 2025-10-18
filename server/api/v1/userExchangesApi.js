// server/api/v1/userExchangesApi.js
import { userExchangesSchema } from '../../models/userExchanges.schema.js';
import { userSchema } from '../../models/user.schema.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // Extragem query-ul din cerere
  const userId = query.userID;
  const exchange = query.exchange || 'coinbaseadvanced';

  try {
    // Verificăm dacă utilizatorul există
    const user = await userSchema.findOne({ _id: userId });
    if (!user) {
      return { error: 'User not found' };
    }

    // Obținem `apiKey` și `apiSecret` pentru exchange-ul specificat
    const exchangeData = await userExchangesSchema.findOne({ userID: userId, exchange });
    if (!exchangeData || exchangeData.apiKeys.length < 2) {
      return { error: 'API credentials not found for coinbaseadvanced' };
    }

    const [apiKey, apiSecret] = exchangeData.apiKeys;
    return {
      data: { apiKey, apiSecret }
    };
  } catch (error) {
    return { error: 'Server error', details: error.message };
  }
});
