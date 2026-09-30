import logger from '../utils/logger.js';

class RateLimiter {
  constructor(config = {}) {
    this.requestsPerMinute = config.requestsPerMinute || 100;
    this.requestsPerHour = config.requestsPerHour || 10000;
    this.clients = new Map();
    logger.info('RateLimiter initialized');

    // Cleanup old data every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isAllowed(clientId) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        requests: [],
        blocked: false
      });
    }

    const clientData = this.clients.get(clientId);

    if (clientData.blocked) {
      logger.warn(`Request from blocked client: ${clientId}`);
      return false;
    }

    // Remove old requests
    clientData.requests = clientData.requests.filter(time => time > oneHourAgo);

    // Check minute limit
    const lastMinute = clientData.requests.filter(time => time > oneMinuteAgo).length;
    if (lastMinute >= this.requestsPerMinute) {
      logger.warn(`Rate limit exceeded for ${clientId} (per minute)`);
      clientData.blocked = true;
      setTimeout(() => {
        clientData.blocked = false;
      }, 60000);
      return false;
    }

    // Check hour limit
    if (clientData.requests.length >= this.requestsPerHour) {
      logger.warn(`Rate limit exceeded for ${clientId} (per hour)`);
      clientData.blocked = true;
      setTimeout(() => {
        clientData.blocked = false;
      }, 3600000);
      return false;
    }

    clientData.requests.push(now);
    return true;
  }

  cleanup() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    for (const [clientId, data] of this.clients.entries()) {
      data.requests = data.requests.filter(time => time > oneHourAgo);
      if (data.requests.length === 0 && !data.blocked) {
        this.clients.delete(clientId);
      }
    }
  }

  getClientStats(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData) return null;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    return {
      blocked: clientData.blocked,
      requestsLastMinute: clientData.requests.filter(time => time > oneMinuteAgo).length,
      totalRequests: clientData.requests.length
    };
  }
}

export default RateLimiter;
