import logger from '../utils/logger.js';

class NetworkOptimizer {
  constructor() {
    this.networkStats = new Map();
    this.statsHistory = new Map();
    logger.info('NetworkOptimizer initialized');
  }

  updateNetworkStats(clientId, stats) {
    try {
      const optimizedStats = {
        timestamp: Date.now(),
        latency: stats.latency || 0,
        bandwidth: stats.bandwidth || 0,
        packetLoss: stats.packetLoss || 0,
        jitter: stats.jitter || 0,
        rtt: stats.rtt || 0
      };

      this.networkStats.set(clientId, optimizedStats);

      // Keep history for analysis
      if (!this.statsHistory.has(clientId)) {
        this.statsHistory.set(clientId, []);
      }
      this.statsHistory.get(clientId).push(optimizedStats);

      // Keep only last 100 samples
      const history = this.statsHistory.get(clientId);
      if (history.length > 100) {
        history.shift();
      }

      // Log quality assessment
      const quality = this.assessNetworkQuality(optimizedStats);
      if (quality !== 'good') {
        logger.warn(`Network quality for ${clientId}: ${quality}`);
      }
    } catch (error) {
      logger.error(`Failed to update network stats: ${error.message}`);
    }
  }

  assessNetworkQuality(stats) {
    if (stats.latency > 100 || stats.packetLoss > 5) {
      return 'poor';
    }
    if (stats.latency > 50 || stats.packetLoss > 2) {
      return 'fair';
    }
    return 'good';
  }

  getOptimalBitrate(clientId) {
    const stats = this.networkStats.get(clientId);
    if (!stats) return '10000k';

    if (stats.bandwidth < 5000) return '2000k';
    if (stats.bandwidth < 10000) return '5000k';
    if (stats.bandwidth < 20000) return '10000k';
    if (stats.bandwidth < 50000) return '25000k';
    return '50000k';
  }

  getNetworkStats(clientId) {
    return this.networkStats.get(clientId) || null;
  }

  getAverageStats(clientId) {
    const history = this.statsHistory.get(clientId) || [];
    if (history.length === 0) return null;

    const average = {
      latency: history.reduce((sum, s) => sum + s.latency, 0) / history.length,
      bandwidth: history.reduce((sum, s) => sum + s.bandwidth, 0) / history.length,
      packetLoss: history.reduce((sum, s) => sum + s.packetLoss, 0) / history.length,
      jitter: history.reduce((sum, s) => sum + s.jitter, 0) / history.length
    };

    return average;
  }
}

export default NetworkOptimizer;
