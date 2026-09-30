import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import StreamingManager from './streaming/StreamingManager.js';
import InputHandler from './input/InputHandler.js';
import NetworkOptimizer from './network/NetworkOptimizer.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.SERVER_PORT || 8080;
const HOST = process.env.SERVER_HOST || '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize managers
const streamingManager = new StreamingManager();
const inputHandler = new InputHandler();
const networkOptimizer = new NetworkOptimizer();

logger.info('Xbox Cloud Gaming Client - Server Starting');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    streaming: {
      resolution: process.env.STREAMING_RESOLUTION || '1080p',
      fps: parseInt(process.env.STREAMING_FPS || '60'),
      codec: process.env.STREAMING_CODEC || 'h264'
    },
    network: {
      protocol: process.env.NETWORK_PROTOCOL || 'webrtc'
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('init-stream', async (data) => {
    try {
      logger.info(`Initializing stream for client: ${socket.id}`);
      const streamSession = await streamingManager.initializeStream(socket.id, data);
      socket.emit('stream-initialized', streamSession);
    } catch (error) {
      logger.error(`Stream initialization failed: ${error.message}`);
      socket.emit('stream-error', { message: error.message });
    }
  });

  socket.on('input-event', (data) => {
    inputHandler.handleInput(socket.id, data);
    socket.emit('input-received');
  });

  socket.on('network-stats', (data) => {
    networkOptimizer.updateNetworkStats(socket.id, data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    streamingManager.stopStream(socket.id);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Start server
httpServer.listen(PORT, HOST, () => {
  logger.info(`Server running at http://${HOST}:${PORT}`);
  logger.info('Waiting for client connections...');
});

export default httpServer;
