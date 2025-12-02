/**
 * Get Supported Networks API
 * Returns list of all supported blockchain networks
 */

import {
  getAllNetworks,
  getNetworksByType,
  getCosmosNetworks,
  getSupportedNetworksCount,
  NETWORK_CATEGORIES
} from '~/server/config/supportedNetworks.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { type, category } = query;

    // Get networks by type
    if (type) {
      const networks = getNetworksByType(type);
      return {
        success: true,
        data: networks,
        count: networks.length,
        type: type
      };
    }

    // Get Cosmos ecosystem networks
    if (category === 'cosmos') {
      const networks = getCosmosNetworks();
      return {
        success: true,
        data: networks,
        count: networks.length,
        category: 'Cosmos Ecosystem'
      };
    }

    // Get networks by category
    if (category && NETWORK_CATEGORIES[category.toUpperCase()]) {
      const categoryNetworks = NETWORK_CATEGORIES[category.toUpperCase()];
      const allNetworks = getAllNetworks();
      const networks = allNetworks.filter(n => categoryNetworks.includes(n.name));

      return {
        success: true,
        data: networks,
        count: networks.length,
        category: category
      };
    }

    // Get all networks with statistics
    const allNetworks = getAllNetworks();
    const stats = getSupportedNetworksCount();

    return {
      success: true,
      data: allNetworks,
      stats: stats,
      categories: Object.keys(NETWORK_CATEGORIES),
      message: `${stats.total} blockchain networks supported`
    };

  } catch (error) {
    console.error('[Get Supported Networks] Error:', error);
    return {
      success: false,
      message: `Failed to get supported networks: ${error.message}`
    };
  }
});
