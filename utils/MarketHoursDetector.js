/**
 * MarketHoursDetector - Utility for detecting market hours and providing bot recommendations
 *
 * Tracks:
 * - STOCKS (NYSE, NASDAQ, LSE, etc.) - 09:30-16:00 ET + pre/after hours
 * - FUTURES (ES, NQ, CL, GC, BTC) - 24/5 with daily pause 17:00-18:00 ET
 * - FOREX (4 major sessions) - 24/5 continuous
 * - CRYPTO - 24/7 with volatility patterns
 */

class MarketHoursDetector {
  constructor() {
    this.currentTime = new Date();
  }

  // ============================================
  // TIMEZONE CONVERSIONS
  // ============================================

  /**
   * Get current time in Eastern Time (ET)
   */
  getETTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }

  /**
   * Get current time in București/Bucharest (GMT+2)
   */
  getBucharestTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  }

  /**
   * Get current time in UTC
   */
  getUTCTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  }

  // ============================================
  // STOCKS MARKET STATUS
  // ============================================

  /**
   * Check if US stock market (NYSE/NASDAQ) is open
   * Regular hours: 09:30 - 16:00 ET
   */
  isStockMarketOpen() {
    const et = this.getETTime();
    const hour = et.getHours();
    const minutes = et.getMinutes();
    const day = et.getDay();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Regular hours: 09:30 - 16:00 ET
    const currentMinutes = hour * 60 + minutes;
    const openMinutes = 9 * 60 + 30;  // 09:30
    const closeMinutes = 16 * 60;     // 16:00

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  /**
   * Check if in pre-market (04:00 - 09:30 ET)
   */
  isPreMarket() {
    const et = this.getETTime();
    const hour = et.getHours();
    const minutes = et.getMinutes();
    const day = et.getDay();

    if (day === 0 || day === 6) return false;

    const currentMinutes = hour * 60 + minutes;
    const preStart = 4 * 60;      // 04:00
    const preEnd = 9 * 60 + 30;   // 09:30

    return currentMinutes >= preStart && currentMinutes < preEnd;
  }

  /**
   * Check if in after-hours (16:00 - 20:00 ET)
   */
  isAfterHours() {
    const et = this.getETTime();
    const hour = et.getHours();
    const day = et.getDay();

    if (day === 0 || day === 6) return false;

    return hour >= 16 && hour < 20;
  }

  // ============================================
  // FUTURES MARKET STATUS
  // ============================================

  /**
   * Check if futures market is in daily pause (17:00-18:00 ET)
   */
  isFuturesPause() {
    const et = this.getETTime();
    const hour = et.getHours();
    const day = et.getDay();

    // Saturday full pause
    if (day === 6) return true;

    // Friday close at 17:00
    if (day === 5 && hour >= 17) return true;

    // Daily pause 17:00-18:00 ET
    return hour >= 17 && hour < 18;
  }

  /**
   * Check if futures are actively trading
   * Active: Sunday 18:00 ET - Friday 17:00 ET (with daily pause 17:00-18:00)
   */
  isFuturesActive() {
    const et = this.getETTime();
    const day = et.getDay();
    const hour = et.getHours();

    // Sunday opens at 18:00 ET
    if (day === 0) {
      return hour >= 18;
    }

    // Saturday closed
    if (day === 6) {
      return false;
    }

    // Friday closes at 17:00 ET
    if (day === 5) {
      return hour < 17;
    }

    // Check daily pause (17:00-18:00 ET)
    return !this.isFuturesPause();
  }

  // ============================================
  // FOREX MARKET STATUS
  // ============================================

  /**
   * Get current forex session and characteristics
   */
  getForexSession() {
    const bucharest = this.getBucharestTime();
    const hour = bucharest.getHours();

    // London + New York overlap (15:00-19:00 București) - MAXIMUM liquidity
    if (hour >= 15 && hour < 19) {
      return {
        session: 'LONDON_NY_OVERLAP',
        liquidity: 'MAXIMUM',
        volatility: 'VERY_HIGH',
        description: 'London + New York overlap - 70% of daily volume'
      };
    }

    // London session (10:00-19:00 București)
    if (hour >= 10 && hour < 19) {
      return {
        session: 'LONDON_SESSION',
        liquidity: 'HIGH',
        volatility: 'HIGH',
        description: 'European session - EUR/GBP pairs active'
      };
    }

    // New York session (15:00-24:00 București)
    if (hour >= 15 && hour < 24) {
      return {
        session: 'NY_SESSION',
        liquidity: 'HIGH',
        volatility: 'MEDIUM_HIGH',
        description: 'New York session - USD pairs active'
      };
    }

    // Asian session (01:00-10:00 București)
    if (hour >= 1 && hour < 10) {
      return {
        session: 'ASIA_SESSION',
        liquidity: 'MEDIUM',
        volatility: 'MEDIUM',
        description: 'Tokyo + Hong Kong + Shanghai'
      };
    }

    // Low liquidity gap
    return {
      session: 'LOW_LIQUIDITY',
      liquidity: 'LOW',
      volatility: 'LOW',
      description: 'Gap between Tokyo close and London open'
    };
  }

  // ============================================
  // CRYPTO MARKET STATUS
  // ============================================

  /**
   * Get crypto volatility zone and trading recommendations
   */
  getCryptoVolatilityZone() {
    const bucharest = this.getBucharestTime();
    const hour = bucharest.getHours();
    const minutes = bucharest.getMinutes();
    const decimalHour = hour + minutes / 60;

    // DEAD ZONE (06:00-09:00 București) - Avoid aggressive trading
    if (hour >= 6 && hour < 9) {
      return {
        zone: 'DEAD_ZONE',
        liquidity: 'VERY_LOW',
        volatility: 'VERY_LOW',
        recommendation: 'REDUCE_ACTIVITY',
        description: 'Low global activity - caution for fake moves'
      };
    }

    // EU + US OVERLAP (15:30-17:30 București) - PEAK trading
    if (decimalHour >= 15.5 && decimalHour < 17.5) {
      return {
        zone: 'EU_US_OVERLAP',
        liquidity: 'MAXIMUM',
        volatility: 'MAXIMUM',
        recommendation: 'PEAK_PERFORMANCE',
        description: 'EU + US stock markets overlap - maximum activity'
      };
    }

    // EUROPE ACTIVE (10:00-18:00 București)
    if (hour >= 10 && hour < 18) {
      return {
        zone: 'EUROPE_ACTIVE',
        liquidity: 'HIGH',
        volatility: 'HIGH',
        recommendation: 'INCREASE_ACTIVITY',
        description: 'European traders active'
      };
    }

    // US EVENING (21:00-01:00 București)
    if (hour >= 21 || hour < 1) {
      return {
        zone: 'US_EVENING',
        liquidity: 'MEDIUM_HIGH',
        volatility: 'MEDIUM_HIGH',
        recommendation: 'NORMAL_GRID',
        description: 'US evening activity'
      };
    }

    // ASIAN HOURS (01:00-06:00 București)
    if (hour >= 1 && hour < 6) {
      return {
        zone: 'ASIA_SESSION',
        liquidity: 'MEDIUM',
        volatility: 'MEDIUM',
        recommendation: 'MONITOR_ASIA_NEWS',
        description: 'Asian session - monitor news from Asia'
      };
    }

    // Default
    return {
      zone: 'TRANSITION',
      liquidity: 'MEDIUM',
      volatility: 'MEDIUM',
      recommendation: 'NORMAL_GRID',
      description: 'Transition period'
    };
  }

  // ============================================
  // COMPLETE MARKET STATUS
  // ============================================

  /**
   * Get complete status of all markets
   */
  getMarketStatus() {
    return {
      stocks: {
        isOpen: this.isStockMarketOpen(),
        isPreMarket: this.isPreMarket(),
        isAfterHours: this.isAfterHours(),
        status: this.isStockMarketOpen() ? 'OPEN' :
                this.isPreMarket() ? 'PRE_MARKET' :
                this.isAfterHours() ? 'AFTER_HOURS' : 'CLOSED'
      },
      futures: {
        isActive: this.isFuturesActive(),
        isPause: this.isFuturesPause(),
        status: this.isFuturesActive() ? 'ACTIVE' :
                this.isFuturesPause() ? 'PAUSE' : 'CLOSED'
      },
      forex: this.getForexSession(),
      crypto: this.getCryptoVolatilityZone(),
      timestamps: {
        bucharest: this.getBucharestTime(),
        et: this.getETTime(),
        utc: this.getUTCTime()
      }
    };
  }

  // ============================================
  // BOT RECOMMENDATIONS
  // ============================================

  /**
   * Get automated bot recommendations based on current market conditions
   */
  getBotRecommendations() {
    const status = this.getMarketStatus();
    const recommendations = [];

    // CRITICAL: Futures pause
    if (this.isFuturesPause()) {
      recommendations.push({
        severity: 'CRITICAL',
        action: 'PAUSE_ALL',
        multiplier: 0,
        reason: 'Futures daily maintenance (17:00-18:00 ET)',
        markets: ['FUTURES']
      });
    }

    // HIGH: Crypto dead zone
    if (status.crypto.zone === 'DEAD_ZONE') {
      recommendations.push({
        severity: 'HIGH',
        action: 'REDUCE_FREQUENCY',
        multiplier: 0.3,
        reason: 'Crypto low liquidity period (06:00-09:00 București)',
        markets: ['CRYPTO']
      });

      recommendations.push({
        severity: 'HIGH',
        action: 'WIDEN_STOPS',
        multiplier: 2.0,
        reason: 'Avoid fake moves in low liquidity',
        markets: ['CRYPTO']
      });
    }

    // MEDIUM: Peak crypto performance
    if (status.crypto.zone === 'EU_US_OVERLAP') {
      recommendations.push({
        severity: 'MEDIUM',
        action: 'INCREASE_ACTIVITY',
        multiplier: 1.5,
        reason: 'Peak crypto liquidity - EU + US overlap (15:30-17:30)',
        markets: ['CRYPTO']
      });

      recommendations.push({
        severity: 'MEDIUM',
        action: 'TIGHTEN_GRID',
        multiplier: 0.9,
        reason: 'High liquidity allows tighter grid',
        markets: ['CRYPTO']
      });
    }

    // MEDIUM: Forex London + NY overlap
    if (status.forex.session === 'LONDON_NY_OVERLAP') {
      recommendations.push({
        severity: 'MEDIUM',
        action: 'WIDEN_SPREAD',
        multiplier: 1.5,
        reason: 'Forex maximum volatility - London + NY overlap',
        markets: ['FOREX', 'CRYPTO']
      });
    }

    // HIGH: Stock market opening (first 30 minutes)
    if (this.isStockMarketOpen()) {
      const et = this.getETTime();
      const minutes = et.getHours() * 60 + et.getMinutes();
      const openingMinutes = 9 * 60 + 30;

      // First 30 minutes after open
      if (minutes < openingMinutes + 30) {
        recommendations.push({
          severity: 'HIGH',
          action: 'WIDEN_GRID',
          multiplier: 1.5,
          reason: 'Stock market opening - high volatility (09:30-10:00 ET)',
          markets: ['STOCKS', 'CRYPTO']
        });
      }

      // Power hour (15:00-16:00 ET)
      if (minutes >= 15 * 60 && minutes < 16 * 60) {
        recommendations.push({
          severity: 'MEDIUM',
          action: 'INCREASE_MONITORING',
          multiplier: 1.3,
          reason: 'Power hour - high volume before close',
          markets: ['STOCKS']
        });
      }
    }

    // LOW: Weekend crypto (lower institutional volume)
    const day = this.getBucharestTime().getDay();
    if (day === 0 || day === 6) {
      recommendations.push({
        severity: 'LOW',
        action: 'REDUCE_POSITION_SIZE',
        multiplier: 0.7,
        reason: 'Weekend - lower institutional volume',
        markets: ['CRYPTO']
      });
    }

    return recommendations;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if currently in a high volatility window
   */
  isHighVolatilityWindow() {
    const status = this.getMarketStatus();

    return (
      status.crypto.zone === 'EU_US_OVERLAP' ||
      status.forex.session === 'LONDON_NY_OVERLAP' ||
      (this.isStockMarketOpen() && this.getETTime().getHours() === 9)
    );
  }

  /**
   * Check if currently in a low liquidity period
   */
  isLowLiquidityPeriod() {
    const status = this.getMarketStatus();

    return (
      status.crypto.zone === 'DEAD_ZONE' ||
      status.forex.session === 'LOW_LIQUIDITY' ||
      this.isFuturesPause()
    );
  }

  /**
   * Get overall market activity level (0-100)
   */
  getMarketActivityLevel() {
    const status = this.getMarketStatus();
    let activityScore = 50; // Base score

    // Stocks open
    if (status.stocks.isOpen) activityScore += 20;
    if (status.stocks.isPreMarket || status.stocks.isAfterHours) activityScore += 10;

    // Futures active
    if (status.futures.isActive) activityScore += 15;
    if (status.futures.isPause) activityScore -= 20;

    // Forex session
    if (status.forex.session === 'LONDON_NY_OVERLAP') activityScore += 20;
    else if (status.forex.liquidity === 'HIGH') activityScore += 10;
    else if (status.forex.liquidity === 'LOW') activityScore -= 15;

    // Crypto zone
    if (status.crypto.zone === 'EU_US_OVERLAP') activityScore += 20;
    else if (status.crypto.zone === 'DEAD_ZONE') activityScore -= 25;

    return Math.max(0, Math.min(100, activityScore));
  }

  /**
   * Refresh current time (call this periodically in your bot loop)
   */
  refresh() {
    this.currentTime = new Date();
  }
}

// Export for use in Nuxt/Vue
export default MarketHoursDetector;
