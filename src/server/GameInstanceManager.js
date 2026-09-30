import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

class GameInstanceManager {
  constructor(config = {}) {
    this.instances = new Map();
    this.maxInstances = config.maxInstances || 10;
    this.instanceTimeout = config.instanceTimeout || 3600000; // 1 hour
    logger.info(`GameInstanceManager initialized with max ${this.maxInstances} instances`);
  }

  createInstance(gameId, userId, config = {}) {
    try {
      if (this.instances.size >= this.maxInstances) {
        throw new Error(`Maximum instances (${this.maxInstances}) reached`);
      }

      const instanceId = uuidv4();
      const instance = {
        id: instanceId,
        gameId,
        userId,
        status: 'initializing',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        config: {
          resolution: config.resolution || '1080p',
          fps: config.fps || 60,
          ...config
        },
        stats: {
          uptime: 0,
          frameCount: 0,
          totalDataSent: 0
        }
      };

      this.instances.set(instanceId, instance);
      logger.info(`Game instance created: ${instanceId} for game ${gameId}`);

      // Set cleanup timer
      setTimeout(() => {
        this.terminateInstance(instanceId);
      }, this.instanceTimeout);

      return instance;
    } catch (error) {
      logger.error(`Failed to create instance: ${error.message}`);
      throw error;
    }
  }

  getInstance(instanceId) {
    return this.instances.get(instanceId);
  }

  updateInstanceStatus(instanceId, status) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = status;
      instance.lastActivity = Date.now();
      logger.debug(`Instance ${instanceId} status updated to ${status}`);
    }
  }

  updateInstanceStats(instanceId, stats) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.stats = {
        ...instance.stats,
        ...stats,
        uptime: Date.now() - instance.createdAt
      };
    }
  }

  terminateInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = 'terminated';
      this.instances.delete(instanceId);
      logger.info(`Instance terminated: ${instanceId}`);
    }
  }

  getAllInstances() {
    return Array.from(this.instances.values());
  }

  getInstancesByUser(userId) {
    return Array.from(this.instances.values()).filter(i => i.userId === userId);
  }

  getStats() {
    const instances = this.getAllInstances();
    return {
      totalInstances: instances.length,
      maxInstances: this.maxInstances,
      activeInstances: instances.filter(i => i.status === 'running').length,
      totalUptime: instances.reduce((sum, i) => sum + i.stats.uptime, 0),
      totalDataSent: instances.reduce((sum, i) => sum + i.stats.totalDataSent, 0)
    };
  }
}

export default GameInstanceManager;
