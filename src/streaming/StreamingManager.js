import logger from '../utils/logger.js';
import { RTCPeerConnection } from 'wrtc';

class StreamingManager {
  constructor() {
    this.streams = new Map();
    this.peerConnections = new Map();
    logger.info('StreamingManager initialized');
  }

  async initializeStream(clientId, config) {
    try {
      logger.info(`Initializing stream for client ${clientId}`);

      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ]
      });

      // Store peer connection
      this.peerConnections.set(clientId, peerConnection);

      // Create stream session
      const streamSession = {
        clientId,
        sessionId: `session_${Date.now()}_${Math.random()}`,
        status: 'initialized',
        config: {
          resolution: config.resolution || '1080p',
          fps: config.fps || 60,
          bitrate: config.bitrate || '10000k',
          codec: config.codec || 'h264'
        },
        createdAt: new Date()
      };

      this.streams.set(clientId, streamSession);

      logger.info(`Stream initialized for ${clientId}: ${streamSession.sessionId}`);
      return streamSession;
    } catch (error) {
      logger.error(`Failed to initialize stream: ${error.message}`);
      throw error;
    }
  }

  startStreaming(clientId) {
    const stream = this.streams.get(clientId);
    if (!stream) {
      throw new Error(`Stream not found for client ${clientId}`);
    }

    stream.status = 'streaming';
    logger.info(`Streaming started for ${clientId}`);
    return stream;
  }

  stopStream(clientId) {
    const peerConnection = this.peerConnections.get(clientId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(clientId);
    }

    const stream = this.streams.get(clientId);
    if (stream) {
      stream.status = 'stopped';
      this.streams.delete(clientId);
    }

    logger.info(`Stream stopped for ${clientId}`);
  }

  getStreamStats(clientId) {
    const stream = this.streams.get(clientId);
    const peerConnection = this.peerConnections.get(clientId);

    return {
      stream,
      pcState: peerConnection ? {
        connectionState: peerConnection.connectionState,
        iceConnectionState: peerConnection.iceConnectionState
      } : null
    };
  }
}

export default StreamingManager;
