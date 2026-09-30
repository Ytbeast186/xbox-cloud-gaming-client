# Testing Guide

## Unit Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run with coverage:
```bash
npm test -- --coverage
```

## Integration Tests

Test streaming functionality:
```bash
npm test -- src/streaming/StreamingManager.test.js
```

Test input handling:
```bash
npm test -- src/input/InputHandler.test.js
```

Test network optimization:
```bash
npm test -- src/network/NetworkOptimizer.test.js
```

## Manual Testing

### 1. Start the Server
```bash
npm run dev
```

### 2. Open Client
Navigate to `http://localhost:8080` in your browser

### 3. Test Connections
- Click "Connect" button
- Check connection status indicator
- Verify WebSocket connection in browser DevTools

### 4. Test Video Settings
- Change resolution
- Adjust FPS
- Modify bitrate
- Verify settings are sent to server

### 5. Test Input
- Connect a gamepad/controller
- Press buttons and verify input is detected
- Test keyboard input
- Test mouse input

### 6. Monitor Performance
- Watch latency metrics
- Check FPS counter
- Monitor packet loss
- Verify bandwidth calculation

## Performance Testing

### Load Testing
```bash
# Simulate multiple clients
for i in {1..10}; do
  curl http://localhost:8080/api/health &
done
```

### Network Simulation
```bash
# Add latency (macOS)
sudo networkQuality -v

# Or use tc on Linux
sudo tc qdisc add dev eth0 root netem delay 50ms loss 2%
```

## Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. Check for errors
4. Monitor Network tab for WebSocket messages

### Server Logs
```bash
tail -f ./logs/combined.log
```

## Test Coverage Goals

- Streaming: 85%+
- Input Handling: 90%+
- Network: 80%+
- Overall: 80%+

## Continuous Integration

Tests run automatically on:
- Every push
- Every pull request
- Daily scheduled runs

Check GitHub Actions for results.
