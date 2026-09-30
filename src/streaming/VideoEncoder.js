import logger from '../utils/logger.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoEncoder {
  constructor(config = {}) {
    this.config = {
      resolution: config.resolution || '1920x1080',
      fps: config.fps || 60,
      bitrate: config.bitrate || '10000k',
      codec: config.codec || 'libx264',
      preset: config.preset || 'fast',
      ...config
    };
    this.encodingProcess = null;
    logger.info('VideoEncoder initialized');
  }

  startEncoding(inputStream, outputStream) {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`Starting video encoding: ${this.config.resolution} @ ${this.config.fps}fps`);

        this.encodingProcess = ffmpeg(inputStream)
          .outputOptions([
            `-c:v ${this.config.codec}`,
            `-preset ${this.config.preset}`,
            `-b:v ${this.config.bitrate}`,
            `-maxrate ${this.config.bitrate}`,
            `-bufsize ${parseInt(this.config.bitrate) * 2}k`,
            `-r ${this.config.fps}`,
            `-s ${this.config.resolution}`,
            `-pix_fmt yuv420p`,
            `-f rtp`,
            'rtp://127.0.0.1:5000'
          ])
          .on('start', (commandLine) => {
            logger.debug(`FFmpeg command: ${commandLine}`);
          })
          .on('progress', (progress) => {
            logger.debug(`Video encoding progress: ${JSON.stringify(progress)}`);
          })
          .on('error', (error) => {
            logger.error(`Video encoding error: ${error.message}`);
            reject(error);
          })
          .on('end', () => {
            logger.info('Video encoding completed');
            resolve();
          })
          .pipe(outputStream);
      } catch (error) {
        logger.error(`Failed to start encoding: ${error.message}`);
        reject(error);
      }
    });
  }

  stopEncoding() {
    if (this.encodingProcess) {
      this.encodingProcess.kill();
      logger.info('Video encoding stopped');
    }
  }

  updateBitrate(newBitrate) {
    this.config.bitrate = newBitrate;
    logger.info(`Bitrate updated to ${newBitrate}`);
  }

  getStats() {
    return {
      resolution: this.config.resolution,
      fps: this.config.fps,
      bitrate: this.config.bitrate,
      codec: this.config.codec,
      preset: this.config.preset
    };
  }
}

export default VideoEncoder;
