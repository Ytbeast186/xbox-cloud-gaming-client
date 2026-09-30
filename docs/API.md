# API Documentation

## REST Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "online",
  "timestamp": "2026-09-30T07:30:00.000Z",
  "version": "0.1.0"
}
```

### Get Configuration
```
GET /api/config
```

Response:
```json
{
  "streaming": {
    "resolution": "1080p",
    "fps": 60,
    "codec": "h264"
  },
  "network": {
    "protocol": "webrtc"
  }
}
```

## WebSocket Events

### Client Events

#### Connect
```javascript
ws.send(JSON.stringify({
  type: 'init-stream',
  data: {
    resolution: '1080p',
    fps: 60,
    bitrate: '10000k',
    codec: 'h264'
  }
}));
```

#### Send Input
```javascript
ws.send(JSON.stringify({
  type: 'input-event',
  data: {
    type: 'button',
    key: 'A',
    value: 1
  }
}));
```

#### Report Network Stats
```javascript
ws.send(JSON.stringify({
  type: 'network-stats',
  data: {
    latency: 25,
    bandwidth: 15000,
    packetLoss: 0.5,
    jitter: 5,
    rtt: 30
  }
}));
```

### Server Events

#### Stream Initialized
```javascript
{
  type: 'stream-initialized',
  data: {
    clientId: 'client-id',
    sessionId: 'session-id',
    status: 'initialized',
    config: { /* ... */ }
  }
}
```

#### Stream Error
```javascript
{
  type: 'stream-error',
  data: {
    message: 'Error message'
  }
}
```

#### Input Received
```javascript
{
  type: 'input-received'
}
```

## Class APIs

### StreamingManager

```javascript
const manager = new StreamingManager();

// Initialize stream
await manager.initializeStream(clientId, config);

// Start streaming
manager.startStreaming(clientId);

// Stop stream
manager.stopStream(clientId);

// Get stats
const stats = manager.getStreamStats(clientId);
```

### InputHandler

```javascript
const handler = new InputHandler();

// Handle input
handler.handleInput(clientId, inputData);

// Get input buffer
const inputs = handler.getInputBuffer(clientId);

// Clear buffer
handler.clearInputBuffer(clientId);

// Get supported methods
const methods = handler.getSupportedInputMethods();
```

### NetworkOptimizer

```javascript
const optimizer = new NetworkOptimizer();

// Update stats
optimizer.updateNetworkStats(clientId, stats);

// Get optimal bitrate
const bitrate = optimizer.getOptimalBitrate(clientId);

// Get current stats
const currentStats = optimizer.getNetworkStats(clientId);

// Get average stats
const avgStats = optimizer.getAverageStats(clientId);
```

### VideoEncoder

```javascript
const encoder = new VideoEncoder(config);

// Start encoding
await encoder.startEncoding(inputStream, outputStream);

// Stop encoding
encoder.stopEncoding();

// Update bitrate
encoder.updateBitrate('5000k');

// Get stats
const stats = encoder.getStats();
```

### PerformanceMonitor

```javascript
const monitor = new PerformanceMonitor();

// Record metric
monitor.recordMetric(sessionId, {
  latency: 25,
  fps: 60,
  packetLoss: 0.5,
  jitter: 5
});

// Get report
const report = monitor.getPerformanceReport(sessionId);
```

### AuthenticationManager

```javascript
const auth = new AuthenticationManager();

// Generate token
const token = auth.generateToken(userId, deviceId);

// Validate token
const result = auth.validateToken(tokenValue);

// Refresh token
const newToken = auth.refreshToken(refreshTokenValue);

// Revoke token
auth.revokeToken(tokenValue);
```

## Error Handling

All endpoints and methods follow standard error handling:

```javascript
try {
  await manager.initializeStream(clientId, config);
} catch (error) {
  console.error('Stream initialization failed:', error.message);
  // Handle error appropriately
}
```

## Rate Limiting

- Default: 100 requests per minute per client
- Maximum: 10,000 requests per hour per client
- Violating clients are blocked for 1 minute

## Authentication

All streaming endpoints require a valid JWT token:

```javascript
const headers = {
  'Authorization': `Bearer ${token.value}`
};
```

## Versioning

API version is included in responses:
- Current version: `0.1.0`
- Semantic versioning used for updates
