import logger from '../utils/logger.js';

class AuthenticationManager {
  constructor(config = {}) {
    this.tokens = new Map();
    this.tokenExpiry = config.tokenExpiry || 3600000; // 1 hour
    this.refreshTokens = new Map();
    logger.info('AuthenticationManager initialized');
  }

  generateToken(userId, deviceId) {
    const token = {
      value: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      deviceId,
      issuedAt: Date.now(),
      expiresAt: Date.now() + this.tokenExpiry,
      refreshToken: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.tokens.set(token.value, token);
    this.refreshTokens.set(token.refreshToken, token);

    logger.info(`Token generated for user ${userId}`);

    return token;
  }

  validateToken(token) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      logger.warn(`Invalid token attempted: ${token}`);
      return { valid: false, reason: 'Token not found' };
    }

    if (tokenData.expiresAt < Date.now()) {
      this.tokens.delete(token);
      logger.warn(`Expired token: ${token}`);
      return { valid: false, reason: 'Token expired' };
    }

    return {
      valid: true,
      userId: tokenData.userId,
      deviceId: tokenData.deviceId
    };
  }

  refreshToken(refreshToken) {
    const originalToken = this.refreshTokens.get(refreshToken);

    if (!originalToken) {
      logger.warn(`Invalid refresh token attempted: ${refreshToken}`);
      return null;
    }

    // Remove old token
    this.tokens.delete(originalToken.value);
    this.refreshTokens.delete(refreshToken);

    // Generate new token
    return this.generateToken(originalToken.userId, originalToken.deviceId);
  }

  revokeToken(token) {
    const tokenData = this.tokens.get(token);
    if (tokenData) {
      this.tokens.delete(token);
      this.refreshTokens.delete(tokenData.refreshToken);
      logger.info(`Token revoked: ${token}`);
      return true;
    }
    return false;
  }

  cleanupExpiredTokens() {
    const now = Date.now();
    let expiredCount = 0;

    for (const [token, data] of this.tokens.entries()) {
      if (data.expiresAt < now) {
        this.tokens.delete(token);
        this.refreshTokens.delete(data.refreshToken);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.info(`Cleaned up ${expiredCount} expired tokens`);
    }
  }
}

export default AuthenticationManager;
