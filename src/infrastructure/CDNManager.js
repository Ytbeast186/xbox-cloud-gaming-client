import logger from '../utils/logger.js';

class CDNManager {
  constructor(config = {}) {
    this.provider = config.provider || 'none';
    this.regions = config.regions || ['us-east', 'eu-west', 'ap-southeast'];
    this.cache = new Map();
    logger.info(`CDNManager initialized with provider: ${this.provider}`);
  }

  cacheAsset(assetId, data, ttlSeconds = 3600) {
    const asset = {
      id: assetId,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
      accessCount: 0
    };
    this.cache.set(assetId, asset);
    return asset;
  }

  getAsset(assetId) {
    const asset = this.cache.get(assetId);
    if (!asset) return null;
    if (asset.expiresAt <= Date.now()) {
      this.cache.delete(assetId);
      return null;
    }
    asset.accessCount += 1;
    return asset;
  }

  purgeCache(assetId) {
    this.cache.delete(assetId);
    logger.info(`Cache purged: ${assetId}`);
  }

  getOptimalRegion(location) {
    const regions = { US: 'us-east', EU: 'eu-west', ASIA: 'ap-southeast' };
    return regions[location] || this.regions[0];
  }

  getCacheStats() {
    let activeAssets = 0;
    let expiredAssets = 0;
    let totalAccesses = 0;
    for (const asset of this.cache.values()) {
      if (asset.expiresAt > Date.now()) activeAssets += 1;
      else expiredAssets += 1;
      totalAccesses += asset.accessCount;
    }
    return { activeAssets, expiredAssets, totalAccesses };
  }
}

export default CDNManager;
