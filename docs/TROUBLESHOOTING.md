# Troubleshooting Guide

## Connection Issues

### WebSocket Connection Refused

**Problem:** Cannot connect to the server

**Solutions:**
1. Verify server is running: `npm run dev`
2. Check port is open: `lsof -i :8080`
3. Verify server address in UI config
4. Check firewall settings
5. Try localhost vs IP address

```bash
# Test connection
curl -i http://localhost:8080/api/health
```

### SSL/TLS Certificate Error

**Problem:** Certificate validation failed

**Solutions:**
1. Regenerate certificate:
```bash
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes
```

2. Verify certificate:
```bash
openssl x509 -in certs/server.crt -text -noout
```

3. Update .env with correct paths

## Performance Issues

### High Latency (>50ms)

**Diagnostics:**
```bash
# Check network
ping google.com

# Monitor latency
watch -n 1 'curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/health'
```

**Solutions:**
1. Reduce bitrate in UI settings
2. Decrease resolution
3. Check network connection quality
4. Disable other network applications
5. Move closer to server

### Low FPS (<30)

**Diagnostics:**
```bash
# Check CPU usage
top -b -n 1 | grep node

# Check memory
free -h
```

**Solutions:**
1. Lower resolution
2. Reduce FPS target
3. Close other applications
4. Upgrade hardware
5. Optimize video encoder settings

### High Packet Loss (>2%)

**Diagnostics:**
```bash
# Use mtr to analyze packet loss
mtr -n google.com
```

**Solutions:**
1. Move closer to router
2. Use wired connection
3. Restart router
4. Reduce bitrate
5. Enable forward error correction

## Memory Issues

### Out of Memory Error

**Problem:** `JavaScript heap out of memory`

**Solutions:**
1. Increase Node.js heap:
```bash
node --max-old-space-size=4096 src/index.js
```

2. Check for memory leaks:
```bash
node --inspect src/index.js
```

3. Reduce concurrent sessions
4. Lower bitrate/resolution

## Codec Issues

### H.264 Not Working

**Problem:** Video encoding fails

**Solutions:**
1. Verify FFmpeg installed:
```bash
ffmpeg -version
```

2. Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
choco install ffmpeg
```

3. Check FFmpeg path in config
4. Verify codec support:
```bash
ffmpeg -codecs | grep h264
```

### Audio Not Playing

**Solutions:**
1. Check browser audio permissions
2. Verify audio is not muted
3. Check audio device settings
4. Verify audio processor initialized
5. Check browser console for errors

## Controller Issues

### Gamepad Not Detected

**Problem:** Controller input not working

**Solutions:**
1. Verify gamepad connected
2. Test in browser DevTools Console:
```javascript
navigator.getGamepads()
```

3. Ensure controller enabled in UI
4. Refresh page after connecting
5. Try different USB port
6. Update controller drivers

### Input Lag

**Solutions:**
1. Check input polling rate
2. Verify network latency
3. Disable keyboard if not needed
4. Reduce mouse sensitivity
5. Enable fast input mode

## Browser Issues

### WebSocket Not Working in Browser

**Solutions:**
1. Check browser console (F12)
2. Verify WebSocket support:
```javascript
if (window.WebSocket) {
  console.log('WebSocket supported');
}
```

3. Check for Content Security Policy issues
4. Verify HTTPS if required
5. Try different browser

### Canvas Rendering Issues

**Solutions:**
1. Check browser GPU support
2. Verify WebGL enabled:
```javascript
const gl = document.createElement('canvas').getContext('webgl');
if (!gl) console.log('WebGL not supported');
```

3. Try fallback to 2D canvas
4. Check for conflicting extensions

## Network Issues

### STUN Server Connection Failed

**Problem:** NAT traversal not working

**Solutions:**
1. Verify STUN server is reachable:
```bash
stunclient stun.l.google.com 19302
```

2. Configure alternative STUN servers in config
3. Use TURN server for relaying
4. Check firewall UDP rules

### Proxy/Firewall Blocking

**Solutions:**
1. Check corporate firewall settings
2. Try different port in config
3. Enable port forwarding
4. Use VPN
5. Contact network admin

## Server Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port
SERVER_PORT=8081 npm start
```

### Too Many Connections

**Solutions:**
1. Increase max connections:
```bash
ulimit -n 4096
```

2. Enable connection pooling
3. Reduce session timeout
4. Scale horizontally

## Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Console tab
3. Monitor Network tab
4. Check WebSocket frames
5. Review Performance tab

### Server Logs
```bash
# Watch logs in real-time
tail -f logs/combined.log

# Search for errors
grep ERROR logs/combined.log
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| EADDRINUSE | Port in use | Change port or kill process |
| ENOTFOUND | DNS resolution failed | Check server address |
| ETIMEDOUT | Connection timeout | Check network/firewall |
| WebSocket is closed | Connection lost | Reconnect |
| Out of memory | Memory leak | Restart server |
| FFMPEG not found | FFmpeg not installed | Install FFmpeg |

