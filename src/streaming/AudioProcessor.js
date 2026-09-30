import logger from '../utils/logger.js';

class AudioProcessor {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 48000,
      channels: config.channels || 2,
      bitrate: config.bitrate || '128k',
      codec: config.codec || 'aac',
      ...config
    };
    this.audioContext = null;
    this.analyser = null;
    logger.info('AudioProcessor initialized');
  }

  initializeWebAudio() {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        logger.info('Web Audio API initialized');
        return this.audioContext;
      }
    } catch (error) {
      logger.error(`Failed to initialize Web Audio: ${error.message}`);
    }
    return null;
  }

  playAudio(audioBuffer) {
    try {
      if (!this.audioContext) {
        this.initializeWebAudio();
      }

      if (this.audioContext && audioBuffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        logger.debug('Audio playing');
      }
    } catch (error) {
      logger.error(`Failed to play audio: ${error.message}`);
    }
  }

  getAudioStats() {
    if (!this.analyser) {
      return null;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const max = Math.max(...dataArray);

    return {
      average,
      max,
      sampleRate: this.config.sampleRate,
      channels: this.config.channels
    };
  }

  setSampleRate(rate) {
    this.config.sampleRate = rate;
    logger.info(`Sample rate updated to ${rate}Hz`);
  }

  getConfig() {
    return this.config;
  }
}

export default AudioProcessor;
