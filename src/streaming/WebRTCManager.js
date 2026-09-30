import logger from '../utils/logger.js';

class WebRTCManager {
  constructor(config = {}) {
    this.config = {
      iceServers: config.iceServers || [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] }
      ],
      ...config
    };
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    logger.info('WebRTCManager initialized');
  }

  async createPeerConnection(clientId) {
    const { RTCPeerConnection } = await import('wrtc');
    const pc = new RTCPeerConnection({ iceServers: this.config.iceServers });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) logger.debug(`ICE candidate for ${clientId}`);
    };
    pc.onconnectionstatechange = () => logger.info(`Connection state for ${clientId}: ${pc.connectionState}`);
    pc.oniceconnectionstatechange = () => logger.info(`ICE state for ${clientId}: ${pc.iceConnectionState}`);

    this.peerConnections.set(clientId, pc);
    return pc;
  }

  createDataChannel(clientId, label) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) throw new Error(`Peer connection not found for ${clientId}`);

    const channel = pc.createDataChannel(label, { ordered: true });
    const key = `${clientId}:${label}`;
    channel.onopen = () => logger.info(`Data channel opened: ${key}`);
    channel.onclose = () => this.dataChannels.delete(key);
    channel.onerror = error => logger.error(`Data channel error (${key}): ${error.message}`);
    this.dataChannels.set(key, channel);
    return channel;
  }

  async createOffer(clientId) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) throw new Error(`Peer connection not found for ${clientId}`);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async handleAnswer(clientId, answer) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) throw new Error(`Peer connection not found for ${clientId}`);
    const { RTCSessionDescription } = await import('wrtc');
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(clientId, candidate) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) throw new Error(`Peer connection not found for ${clientId}`);
    const { RTCIceCandidate } = await import('wrtc');
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  sendData(clientId, label, data) {
    const channel = this.dataChannels.get(`${clientId}:${label}`);
    if (!channel || channel.readyState !== 'open') return false;
    channel.send(JSON.stringify(data));
    return true;
  }

  getStats(clientId) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) return null;
    return {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState
    };
  }

  closePeerConnection(clientId) {
    const pc = this.peerConnections.get(clientId);
    if (!pc) return;
    pc.close();
    this.peerConnections.delete(clientId);
    for (const [key, channel] of this.dataChannels) {
      if (key.startsWith(`${clientId}:`)) {
        channel.close();
        this.dataChannels.delete(key);
      }
    }
  }

  cleanup() {
    for (const clientId of this.peerConnections.keys()) this.closePeerConnection(clientId);
  }
}

export default WebRTCManager;
