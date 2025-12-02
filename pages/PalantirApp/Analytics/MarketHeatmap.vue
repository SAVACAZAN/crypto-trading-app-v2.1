<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
        <div style="font-size: 24px;">🗺️</div>
        <div style="flex: 1;">
          <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">LIVE MARKET HEATMAP</h1>
          <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Real-Time Cryptocurrency Market Overview</p>
        </div>
        <div v-if="lastUpdate" style="text-align: right;">
          <div style="color: #888; font-size: 9px;">Last Update</div>
          <div style="color: #10eb04; font-size: 10px;">{{ lastUpdate }}</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && marketAssets.length === 0" style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 40px; border-radius: 8px; text-align: center;">
      <div style="color: #f52a09; font-size: 16px; margin-bottom: 10px;">⏳ Loading Market Data...</div>
      <div style="color: #888; font-size: 11px;">Fetching real-time cryptocurrency prices from CoinGecko</div>
    </div>

    <!-- Error State -->
    <div v-if="error" style="background: rgba(245,42,9,0.2); border: 1px solid #f52a09; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 13px; font-weight: 700; margin-bottom: 5px;">❌ Error Loading Data</div>
      <div style="color: #888; font-size: 11px;">{{ error }}</div>
      <n-button size="small" @click="loadMarketData" style="margin-top: 10px;">
        🔄 Retry
      </n-button>
    </div>

    <template v-if="!isLoading || marketAssets.length > 0">
      <!-- Stats Overview -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 15px;">
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 5px;">TOTAL MARKET CAP</div>
          <div style="color: #f52a09; font-size: 18px; font-weight: 700;">${{ totalMarketCap.toLocaleString() }}B</div>
          <div :style="`color: ${avgChange24h >= 0 ? '#10eb04' : '#f52a09'}; font-size: 9px;`">
            {{ avgChange24h >= 0 ? '+' : '' }}{{ avgChange24h }}% (24H)
          </div>
        </div>
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 5px;">GAINERS / LOSERS</div>
          <div style="color: #f52a09; font-size: 18px; font-weight: 700;">
            <span style="color: #10eb04;">{{ gainersCount }}</span> / <span style="color: #f52a09;">{{ losersCount }}</span>
          </div>
          <div style="color: #888; font-size: 9px;">{{ totalAssets }} Assets Tracked</div>
        </div>
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 5px;">24H VOLUME</div>
          <div style="color: #f52a09; font-size: 18px; font-weight: 700;">${{ totalVolume.toLocaleString() }}B</div>
          <div style="color: #888; font-size: 9px;">Total Trading Volume</div>
        </div>
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
          <div style="color: #888; font-size: 10px; margin-bottom: 5px;">BTC DOMINANCE</div>
          <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ btcDominance }}%</div>
          <div style="color: #888; font-size: 9px;">Market Share</div>
        </div>
      </div>

      <!-- Controls -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #888; font-size: 11px;">Timeframe:</span>
            <n-select
              v-model:value="selectedTimeframe"
              :options="timeframeOptions"
              size="small"
              style="width: 100px;"
            />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #888; font-size: 11px;">Category:</span>
            <n-select
              v-model:value="selectedCategory"
              :options="categoryOptions"
              size="small"
              style="width: 150px;"
            />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #888; font-size: 11px;">Size By:</span>
            <n-select
              v-model:value="sizeBy"
              :options="sizeOptions"
              size="small"
              style="width: 120px;"
            />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #888; font-size: 11px;">View:</span>
            <n-select
              v-model:value="viewMode"
              :options="viewOptions"
              size="small"
              style="width: 100px;"
            />
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #888; font-size: 11px;">Limit:</span>
            <n-select
              v-model:value="assetLimit"
              :options="limitOptions"
              size="small"
              style="width: 100px;"
              @update:value="loadMarketData"
            />
          </div>
          <div style="margin-left: auto; display: flex; gap: 8px;">
            <n-button size="small" @click="loadMarketData" :loading="isRefreshing">
              🔄 Refresh
            </n-button>
            <n-button size="small" @click="exportData">
              📊 Export CSV
            </n-button>
          </div>
        </div>
      </div>

      <!-- Heatmap View -->
      <div v-if="viewMode === 'heatmap'" style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
          <span>Market Heatmap - {{ selectedTimeframe }}</span>
          <span style="color: #888; font-size: 11px; font-weight: 400;">{{ filteredAssets.length }} assets shown</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px;">
          <div
            v-for="asset in filteredAssets"
            :key="asset.symbol"
            :style="getHeatmapStyle(asset)"
            @click="showAssetDetails(asset)"
            style="cursor: pointer; padding: 12px; border-radius: 6px; transition: all 0.2s; position: relative; overflow: visible;"
            @mouseenter="hoveredAsset = asset.symbol"
            @mouseleave="hoveredAsset = null"
          >
            <!-- Icon/Image -->
            <div style="margin-bottom: 6px; display: flex; align-items: center; justify-content: center;">
              <img v-if="asset.icon && asset.icon.startsWith('http')"
                   :src="asset.icon"
                   :alt="asset.symbol"
                   style="width: 28px; height: 28px; border-radius: 50%;"
                   @error="handleImageError"
              />
              <div v-else style="font-size: 20px;">{{ asset.icon || '💰' }}</div>
            </div>

            <div style="color: #fff; font-size: 11px; font-weight: 700; margin-bottom: 2px;">{{ asset.symbol }}</div>
            <div :style="`color: ${getChangeValue(asset) >= 0 ? '#10eb04' : '#f52a09'}; font-size: 13px; font-weight: 700;`">
              {{ getChangeValue(asset) >= 0 ? '+' : '' }}{{ getChangeValue(asset).toFixed(2) }}%
            </div>
            <div style="color: rgba(255,255,255,0.7); font-size: 9px; margin-top: 3px;">
              ${{ formatPrice(asset.price) }}
            </div>

            <!-- Rank Badge -->
            <div v-if="asset.rank" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #888; font-size: 8px; padding: 2px 5px; border-radius: 3px;">
              #{{ asset.rank }}
            </div>

            <!-- Tooltip on hover -->
            <div v-if="hoveredAsset === asset.symbol" style="position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.95); border: 1px solid #f52a09; padding: 10px; border-radius: 6px; white-space: nowrap; margin-bottom: 8px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              <div style="color: #f52a09; font-size: 11px; font-weight: 700; margin-bottom: 5px;">{{ asset.name }}</div>
              <div style="color: #888; font-size: 9px; margin-bottom: 2px;">MCap: ${{ asset.marketCap.toLocaleString() }}M</div>
              <div style="color: #888; font-size: 9px; margin-bottom: 2px;">Vol: ${{ asset.volume.toLocaleString() }}M</div>
              <div style="color: #888; font-size: 9px;">Category: {{ asset.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
          <span>Market Table - {{ selectedTimeframe }}</span>
          <span style="color: #888; font-size: 11px; font-weight: 400;">{{ filteredAssets.length }} assets shown</span>
        </div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #0f3460;">
                <th style="color: #888; font-size: 10px; text-align: left; padding: 10px;">#</th>
                <th style="color: #888; font-size: 10px; text-align: left; padding: 10px;">ASSET</th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px;">PRICE</th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px; cursor: pointer;" @click="toggleSort('1h')">
                  1H {{ sortBy === '1h' ? (sortDesc ? '↓' : '↑') : '' }}
                </th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px; cursor: pointer;" @click="toggleSort('24h')">
                  24H {{ sortBy === '24h' ? (sortDesc ? '↓' : '↑') : '' }}
                </th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px; cursor: pointer;" @click="toggleSort('7d')">
                  7D {{ sortBy === '7d' ? (sortDesc ? '↓' : '↑') : '' }}
                </th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px;">MARKET CAP</th>
                <th style="color: #888; font-size: 10px; text-align: right; padding: 10px;">VOLUME (24H)</th>
                <th style="color: #888; font-size: 10px; text-align: center; padding: 10px;">CATEGORY</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(asset, index) in sortedAssets"
                :key="asset.symbol"
                style="border-bottom: 1px solid rgba(15,52,96,0.5); cursor: pointer;"
                @click="showAssetDetails(asset)"
              >
                <td style="color: #888; font-size: 11px; padding: 12px;">{{ asset.rank || (index + 1) }}</td>
                <td style="padding: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img v-if="asset.icon && asset.icon.startsWith('http')"
                         :src="asset.icon"
                         :alt="asset.symbol"
                         style="width: 24px; height: 24px; border-radius: 50%;"
                         @error="handleImageError"
                    />
                    <div v-else style="font-size: 18px;">{{ asset.icon || '💰' }}</div>
                    <div>
                      <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ asset.symbol }}</div>
                      <div style="color: #888; font-size: 9px;">{{ asset.name }}</div>
                    </div>
                  </div>
                </td>
                <td style="color: #fff; font-size: 12px; text-align: right; padding: 12px;">${{ formatPrice(asset.price) }}</td>
                <td :style="`color: ${(asset.change1h || 0) >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 600; text-align: right; padding: 12px;`">
                  {{ (asset.change1h || 0) >= 0 ? '+' : '' }}{{ (asset.change1h || 0).toFixed(2) }}%
                </td>
                <td :style="`color: ${asset.change >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 600; text-align: right; padding: 12px;`">
                  {{ asset.change >= 0 ? '+' : '' }}{{ asset.change.toFixed(2) }}%
                </td>
                <td :style="`color: ${(asset.change7d || 0) >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 600; text-align: right; padding: 12px;`">
                  {{ (asset.change7d || 0) >= 0 ? '+' : '' }}{{ (asset.change7d || 0).toFixed(2) }}%
                </td>
                <td style="color: #fff; font-size: 11px; text-align: right; padding: 12px;">${{ asset.marketCap.toLocaleString() }}M</td>
                <td style="color: #fff; font-size: 11px; text-align: right; padding: 12px;">${{ asset.volume.toLocaleString() }}M</td>
                <td style="text-align: center; padding: 12px;">
                  <n-tag :type="getCategoryType(asset.category)" size="small" round>
                    {{ formatCategory(asset.category) }}
                  </n-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Color Legend -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 12px;">Color Legend</div>
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(16,235,4,0.8); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">&gt; +5%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(16,235,4,0.5); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">+2% to +5%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(16,235,4,0.2); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">+0% to +2%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(245,42,9,0.2); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">-2% to 0%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(245,42,9,0.5); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">-5% to -2%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 30px; height: 20px; background: rgba(245,42,9,0.8); border-radius: 4px;"></div>
            <span style="color: #888; font-size: 11px;">&lt; -5%</span>
          </div>
        </div>
      </div>

      <!-- Top Movers -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
        <!-- Top Gainers -->
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
          <div style="color: #10eb04; font-size: 13px; font-weight: 700; margin-bottom: 12px;">
            🚀 Top Gainers ({{ selectedTimeframe }})
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div
              v-for="asset in topGainers"
              :key="asset.symbol"
              style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(16,235,4,0.1); border-radius: 6px; border: 1px solid rgba(16,235,4,0.3); cursor: pointer;"
              @click="showAssetDetails(asset)"
            >
              <div style="display: flex; align-items: center; gap: 8px;">
                <img v-if="asset.icon && asset.icon.startsWith('http')"
                     :src="asset.icon"
                     :alt="asset.symbol"
                     style="width: 24px; height: 24px; border-radius: 50%;"
                     @error="handleImageError"
                />
                <div v-else style="font-size: 20px;">{{ asset.icon || '💰' }}</div>
                <div>
                  <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ asset.symbol }}</div>
                  <div style="color: #888; font-size: 9px;">${{ formatPrice(asset.price) }}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="color: #10eb04; font-size: 14px; font-weight: 700;">+{{ getChangeValue(asset).toFixed(2) }}%</div>
                <div style="color: #888; font-size: 9px;">Vol: ${{ asset.volume.toLocaleString() }}M</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Losers -->
        <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
          <div style="color: #f52a09; font-size: 13px; font-weight: 700; margin-bottom: 12px;">
            📉 Top Losers ({{ selectedTimeframe }})
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div
              v-for="asset in topLosers"
              :key="asset.symbol"
              style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(245,42,9,0.1); border-radius: 6px; border: 1px solid rgba(245,42,9,0.3); cursor: pointer;"
              @click="showAssetDetails(asset)"
            >
              <div style="display: flex; align-items: center; gap: 8px;">
                <img v-if="asset.icon && asset.icon.startsWith('http')"
                     :src="asset.icon"
                     :alt="asset.symbol"
                     style="width: 24px; height: 24px; border-radius: 50%;"
                     @error="handleImageError"
                />
                <div v-else style="font-size: 20px;">{{ asset.icon || '💰' }}</div>
                <div>
                  <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ asset.symbol }}</div>
                  <div style="color: #888; font-size: 9px;">${{ formatPrice(asset.price) }}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="color: #f52a09; font-size: 14px; font-weight: 700;">{{ getChangeValue(asset).toFixed(2) }}%</div>
                <div style="color: #888; font-size: 9px;">Vol: ${{ asset.volume.toLocaleString() }}M</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Asset Details Modal -->
    <n-modal v-model:show="showAssetModal" preset="card" style="width: 650px; max-width: 95vw; background: #1a1a2e; border: 1px solid #f52a09;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img v-if="selectedAsset?.icon && selectedAsset.icon.startsWith('http')"
               :src="selectedAsset.icon"
               :alt="selectedAsset.symbol"
               style="width: 32px; height: 32px; border-radius: 50%;"
               @error="handleImageError"
          />
          <div v-else style="font-size: 24px;">{{ selectedAsset?.icon || '💰' }}</div>
          <div>
            <div style="color: #f52a09; font-size: 16px; font-weight: 700;">{{ selectedAsset?.name }}</div>
            <div style="color: #888; font-size: 11px;">{{ selectedAsset?.symbol }} - Rank #{{ selectedAsset?.rank }}</div>
          </div>
        </div>
      </template>
      <div v-if="selectedAsset" style="padding: 10px;">
        <!-- Price Info -->
        <div style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Current Price</div>
              <div style="color: #fff; font-size: 20px; font-weight: 700;">${{ formatPrice(selectedAsset.price) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">24H Change</div>
              <div :style="`color: ${selectedAsset.change >= 0 ? '#10eb04' : '#f52a09'}; font-size: 20px; font-weight: 700;`">
                {{ selectedAsset.change >= 0 ? '+' : '' }}{{ selectedAsset.change.toFixed(2) }}%
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">1H Change</div>
              <div :style="`color: ${(selectedAsset.change1h || 0) >= 0 ? '#10eb04' : '#f52a09'}; font-size: 14px; font-weight: 700;`">
                {{ (selectedAsset.change1h || 0) >= 0 ? '+' : '' }}{{ (selectedAsset.change1h || 0).toFixed(2) }}%
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">7D Change</div>
              <div :style="`color: ${(selectedAsset.change7d || 0) >= 0 ? '#10eb04' : '#f52a09'}; font-size: 14px; font-weight: 700;`">
                {{ (selectedAsset.change7d || 0) >= 0 ? '+' : '' }}{{ (selectedAsset.change7d || 0).toFixed(2) }}%
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">Market Cap</div>
              <div style="color: #fff; font-size: 14px; font-weight: 700;">${{ selectedAsset.marketCap.toLocaleString() }}M</div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; margin-bottom: 5px;">24H Volume</div>
              <div style="color: #fff; font-size: 14px; font-weight: 700;">${{ selectedAsset.volume.toLocaleString() }}M</div>
            </div>
          </div>
        </div>

        <!-- Price Range -->
        <div v-if="selectedAsset.high24h && selectedAsset.low24h" style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 10px;">24H Price Range</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div>
              <div style="color: #888; font-size: 9px;">Low</div>
              <div style="color: #f52a09; font-size: 12px; font-weight: 700;">${{ formatPrice(selectedAsset.low24h) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">High</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">${{ formatPrice(selectedAsset.high24h) }}</div>
            </div>
          </div>
        </div>

        <!-- All-Time Highs/Lows -->
        <div v-if="selectedAsset.ath || selectedAsset.atl" style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 10px;">All-Time Records</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div v-if="selectedAsset.ath">
              <div style="color: #888; font-size: 9px;">All-Time High</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">${{ formatPrice(selectedAsset.ath) }}</div>
            </div>
            <div v-if="selectedAsset.atl">
              <div style="color: #888; font-size: 9px;">All-Time Low</div>
              <div style="color: #f52a09; font-size: 12px; font-weight: 700;">${{ formatPrice(selectedAsset.atl) }}</div>
            </div>
          </div>
        </div>

        <!-- Supply Info -->
        <div v-if="selectedAsset.circulatingSupply" style="background: rgba(15,52,96,0.3); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #fff; font-size: 13px; font-weight: 700; margin-bottom: 10px;">Supply Information</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div>
              <div style="color: #888; font-size: 9px;">Circulating</div>
              <div style="color: #fff; font-size: 11px;">{{ formatSupply(selectedAsset.circulatingSupply) }}</div>
            </div>
            <div v-if="selectedAsset.totalSupply">
              <div style="color: #888; font-size: 9px;">Total</div>
              <div style="color: #fff; font-size: 11px;">{{ formatSupply(selectedAsset.totalSupply) }}</div>
            </div>
            <div v-if="selectedAsset.maxSupply">
              <div style="color: #888; font-size: 9px;">Max</div>
              <div style="color: #fff; font-size: 11px;">{{ formatSupply(selectedAsset.maxSupply) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">Category</div>
              <n-tag :type="getCategoryType(selectedAsset.category)" size="small" round>
                {{ formatCategory(selectedAsset.category) }}
              </n-tag>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

// State
const marketAssets = ref([]);
const isLoading = ref(false);
const isRefreshing = ref(false);
const error = ref(null);
const lastUpdate = ref(null);
const selectedTimeframe = ref('24H');
const selectedCategory = ref('all');
const sizeBy = ref('marketCap');
const viewMode = ref('heatmap');
const assetLimit = ref(100);
const showAssetModal = ref(false);
const selectedAsset = ref(null);
const hoveredAsset = ref(null);
const sortBy = ref('24h');
const sortDesc = ref(true);

// Options
const timeframeOptions = [
  { label: '1H', value: '1H' },
  { label: '24H', value: '24H' },
  { label: '7D', value: '7D' }
];

const categoryOptions = [
  { label: 'All Assets', value: 'all' },
  { label: 'Layer 1', value: 'layer1' },
  { label: 'Layer 2', value: 'layer2' },
  { label: 'DeFi', value: 'defi' },
  { label: 'Meme Coins', value: 'meme' },
  { label: 'Altcoins', value: 'altcoin' }
];

const sizeOptions = [
  { label: 'Market Cap', value: 'marketCap' },
  { label: 'Volume', value: 'volume' },
  { label: 'Price Change', value: 'change' }
];

const viewOptions = [
  { label: 'Heatmap', value: 'heatmap' },
  { label: 'Table', value: 'table' }
];

const limitOptions = [
  { label: '50 Assets', value: 50 },
  { label: '100 Assets', value: 100 },
  { label: '200 Assets', value: 200 },
  { label: '500 Assets', value: 500 }
];

// Computed
const filteredAssets = computed(() => {
  let assets = [...marketAssets.value];

  if (selectedCategory.value !== 'all') {
    assets = assets.filter(a => a.category === selectedCategory.value);
  }

  return assets;
});

const sortedAssets = computed(() => {
  const assets = [...filteredAssets.value];

  if (sortBy.value === '1h') {
    assets.sort((a, b) => {
      const aVal = a.change1h || 0;
      const bVal = b.change1h || 0;
      return sortDesc.value ? bVal - aVal : aVal - bVal;
    });
  } else if (sortBy.value === '24h') {
    assets.sort((a, b) => {
      return sortDesc.value ? b.change - a.change : a.change - b.change;
    });
  } else if (sortBy.value === '7d') {
    assets.sort((a, b) => {
      const aVal = a.change7d || 0;
      const bVal = b.change7d || 0;
      return sortDesc.value ? bVal - aVal : aVal - bVal;
    });
  }

  return assets;
});

const topGainers = computed(() => {
  const changeField = selectedTimeframe.value === '1H' ? 'change1h' :
                      selectedTimeframe.value === '7D' ? 'change7d' : 'change';

  return [...marketAssets.value]
    .filter(a => (a[changeField] || a.change) > 0)
    .sort((a, b) => (b[changeField] || b.change) - (a[changeField] || a.change))
    .slice(0, 5);
});

const topLosers = computed(() => {
  const changeField = selectedTimeframe.value === '1H' ? 'change1h' :
                      selectedTimeframe.value === '7D' ? 'change7d' : 'change';

  return [...marketAssets.value]
    .filter(a => (a[changeField] || a.change) < 0)
    .sort((a, b) => (a[changeField] || a.change) - (b[changeField] || b.change))
    .slice(0, 5);
});

const totalMarketCap = computed(() => {
  return Math.round(marketAssets.value.reduce((sum, a) => sum + a.marketCap, 0) / 1000);
});

const totalVolume = computed(() => {
  return Math.round(marketAssets.value.reduce((sum, a) => sum + a.volume, 0) / 1000);
});

const gainersCount = computed(() => {
  return marketAssets.value.filter(a => a.change > 0).length;
});

const losersCount = computed(() => {
  return marketAssets.value.filter(a => a.change < 0).length;
});

const totalAssets = computed(() => marketAssets.value.length);

const btcDominance = computed(() => {
  const btcMcap = marketAssets.value.find(a => a.symbol === 'BTC')?.marketCap || 0;
  const total = marketAssets.value.reduce((sum, a) => sum + a.marketCap, 0);
  return total > 0 ? ((btcMcap / total) * 100).toFixed(1) : '0.0';
});

const avgChange24h = computed(() => {
  if (marketAssets.value.length === 0) return '0.00';
  const avg = marketAssets.value.reduce((sum, a) => sum + a.change, 0) / marketAssets.value.length;
  return avg.toFixed(2);
});

// Methods
const loadMarketData = async () => {
  try {
    isLoading.value = true;
    isRefreshing.value = true;
    error.value = null;

    const response = await $fetch('/api/v1/fetchMarketHeatmap', {
      query: {
        limit: assetLimit.value,
        currency: 'usd'
      }
    });

    if (response.success) {
      marketAssets.value = response.data.assets;
      lastUpdate.value = new Date().toLocaleTimeString();
      console.log(`✅ Loaded ${marketAssets.value.length} market assets`);
    } else {
      error.value = response.error || 'Failed to load market data';
    }
  } catch (err) {
    console.error('❌ Error loading market data:', err);
    error.value = err.message || 'Failed to fetch market data';
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

const getChangeValue = (asset) => {
  if (selectedTimeframe.value === '1H') return asset.change1h || 0;
  if (selectedTimeframe.value === '7D') return asset.change7d || 0;
  return asset.change;
};

const getHeatmapStyle = (asset) => {
  const change = getChangeValue(asset);
  let backgroundColor = '';
  let borderColor = '';

  if (change >= 5) {
    backgroundColor = 'rgba(16,235,4,0.8)';
    borderColor = 'rgba(16,235,4,1)';
  } else if (change >= 2) {
    backgroundColor = 'rgba(16,235,4,0.5)';
    borderColor = 'rgba(16,235,4,0.7)';
  } else if (change >= 0) {
    backgroundColor = 'rgba(16,235,4,0.2)';
    borderColor = 'rgba(16,235,4,0.4)';
  } else if (change >= -2) {
    backgroundColor = 'rgba(245,42,9,0.2)';
    borderColor = 'rgba(245,42,9,0.4)';
  } else if (change >= -5) {
    backgroundColor = 'rgba(245,42,9,0.5)';
    borderColor = 'rgba(245,42,9,0.7)';
  } else {
    backgroundColor = 'rgba(245,42,9,0.8)';
    borderColor = 'rgba(245,42,9,1)';
  }

  // Size based on selected metric
  let size = 1;
  if (sizeBy.value === 'marketCap') {
    size = Math.min(Math.max(asset.marketCap / 100000, 0.8), 1.5);
  } else if (sizeBy.value === 'volume') {
    size = Math.min(Math.max(asset.volume / 10000, 0.8), 1.5);
  } else if (sizeBy.value === 'change') {
    size = Math.min(Math.max(Math.abs(change) / 5, 0.8), 1.5);
  }

  return {
    background: backgroundColor,
    border: `1px solid ${borderColor}`,
    transform: hoveredAsset.value === asset.symbol ? `scale(${size * 1.08})` : `scale(${size})`,
    boxShadow: hoveredAsset.value === asset.symbol ? `0 0 15px ${borderColor}` : 'none',
    zIndex: hoveredAsset.value === asset.symbol ? 50 : 1
  };
};

const getCategoryType = (category) => {
  const types = {
    layer1: 'success',
    layer2: 'info',
    defi: 'warning',
    meme: 'error',
    altcoin: 'default'
  };
  return types[category] || 'default';
};

const formatCategory = (category) => {
  const names = {
    layer1: 'Layer 1',
    layer2: 'Layer 2',
    defi: 'DeFi',
    meme: 'Meme',
    altcoin: 'Altcoin'
  };
  return names[category] || category;
};

const formatPrice = (price) => {
  if (price >= 1000) return price.toLocaleString();
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
};

const formatSupply = (supply) => {
  if (!supply) return 'N/A';
  if (supply >= 1000000000) return `${(supply / 1000000000).toFixed(2)}B`;
  if (supply >= 1000000) return `${(supply / 1000000).toFixed(2)}M`;
  if (supply >= 1000) return `${(supply / 1000).toFixed(2)}K`;
  return supply.toLocaleString();
};

const showAssetDetails = (asset) => {
  selectedAsset.value = asset;
  showAssetModal.value = true;
};

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = field;
    sortDesc.value = true;
  }
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};

const exportData = () => {
  const data = filteredAssets.value.map(a => ({
    Rank: a.rank || '',
    Symbol: a.symbol,
    Name: a.name,
    Price: a.price,
    Change_1H: a.change1h || 0,
    Change_24H: a.change,
    Change_7D: a.change7d || 0,
    MarketCap_M: a.marketCap,
    Volume_24H_M: a.volume,
    Category: a.category
  }));

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `market-heatmap-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Auto refresh
let refreshInterval = null;

onMounted(() => {
  loadMarketData();

  // Auto-refresh every 60 seconds
  refreshInterval = setInterval(() => {
    loadMarketData();
  }, 60000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
