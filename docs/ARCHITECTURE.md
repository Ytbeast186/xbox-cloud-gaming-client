# Architecture Documentation

## System Overview

```
┌────────────────────────────────────────────┐
│         Client Application                 │
│  ┌──────────────────────────────────────┐  │
│  │  UI Layer (WebGL/React)              │  │
│  └──────────┬───────────────────────────┘  │
│             │                              │
│  ┌──────────▼───────────────────────────┐  │
│  │  Streaming Layer (WebRTC)            │  │
│  │  - Video Decoder                     │  │
│  │  - Audio Processor                   │  │
│  └──────────┬───────────────────────────┘  │
│             │                              │
│  ┌──────────▼───────────────────────────┐  │
│  │  Input Layer                         │  │
│  │  - Controller Handler                │  │
│  │  - Keyboard/Mouse Input              │  │
│  └──────────┬───────────────────────────┘  │
│             │                              │
│  ┌──────────▼───────────────────────────┐  │
│  │  Network Layer                       │  │
│  │  - RTCPeerConnection                 │  │
│  │  - WebSocket (signaling)             │  │
│  └──────────┬───────────────────────────┘  │
└─────────────┼────────────────────────────────┘
              │ WebRTC + H.264/H.265
              │ (UDP/TLS Encrypted)
              │
┌─────────────▼────────────────────────────────┐
│         Server/Cloud Infrastructure          │
│  ┌──────────────────────────────────────┐   │
│  │  Game Instance Manager               │   │
│  │  - VM/Container Management           │   │
│  │  - Resource Allocation               │   │
│  └──────────┬───────────────────────────┘   │
│             │                               │
│  ┌──────────▼───────────────────────────┐   │
│  │  Encoding Pipeline                   │   │
│  │  - Game Capture                      │   │
│  │  - Video Encoding (H.264/H.265)      │   │
│  │  - Audio Encoding                    │   │
│  └──────────┬───────────────────────────┘   │
│             │                               │
│  ┌──────────▼───────────────────────────┐   │
│  │  Network Optimization                │   │
│  │  - Adaptive Bitrate                  │   │
│  │  - Packet Loss Recovery              │   │
│  │  - Jitter Buffer                     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. Streaming Manager
- Manages RTCPeerConnection lifecycle
- Handles stream initialization and teardown
- Tracks streaming sessions
- Location: `src/streaming/StreamingManager.js`

### 2. Input Handler
- Processes controller input (Xbox, PlayStation, generic)
- Handles keyboard and mouse events
- Supports touchscreen gestures
- Manages input buffering and timing
- Location: `src/input/InputHandler.js`

### 3. Network Optimizer
- Monitors network conditions
- Calculates optimal bitrate
- Tracks latency and jitter
- Detects packet loss
- Location: `src/network/NetworkOptimizer.js`

### 4. Logger
- Centralized logging system
- Winston-based implementation
- File and console output
- Location: `src/utils/logger.js`

## Data Flow

### Streaming Pipeline
```
Game Running
    ↓
Capture Screen
    ↓
Encode Video (H.264/H.265)
    ↓
Encrypt Frames
    ↓
Send via WebRTC
    ↓
Network Optimization
    ↓
Client Receives
    ↓
Decrypt Frames
    ↓
Decode Video
    ↓
Render to Display
```

### Input Pipeline
```
User Input (Controller/Keyboard/Mouse)
    ↓
Capture Event
    ↓
Process Input Data
    ↓
Buffer Input
    ↓
Send to Server via WebSocket
    ↓
Server Processes Input
    ↓
Game Receives Input
    ↓
Execute Action
```

## Technology Stack

### Frontend
- **Framework**: React or Vue.js
- **Rendering**: WebGL or Canvas
- **WebRTC**: wrtc (Node.js WebRTC library)
- **State Management**: Redux or Vuex

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Video**: FFmpeg
- **Logging**: Winston

### Protocols
- **Signaling**: WebSocket
- **Media**: WebRTC (SRTP)
- **Transport**: UDP (with FEC)
- **Encoding**: H.264, H.265, VP9

## Latency Breakdown

Target: <50ms total latency

```
Input Processing:      ~5ms
Network Round Trip:    ~20ms
Encoding:             ~10ms
Decoding:             ~8ms
Rendering:            ~7ms
─────────────────────────────
Total:               ~50ms
```

## Scalability Considerations

1. **Horizontal Scaling**: Multiple server instances
2. **Load Balancing**: Distribute clients across servers
3. **Resource Management**: Limit simultaneous streams
4. **Caching**: Cache game assets
5. **CDN Integration**: Distribute content geographically

## Security

- **Encryption**: TLS/SSL for signaling, DTLS for media
- **Authentication**: JWT tokens
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all user inputs
- **DDoS Protection**: Rate limiting and firewall rules

## Performance Metrics

- **Frames Per Second (FPS)**: Target 60 FPS
- **Latency**: <50ms target
- **Bitrate**: Adaptive 2-50 Mbps
- **Packet Loss**: <2% acceptable
- **Jitter**: <10ms acceptable

## Future Enhancements

- [ ] Hardware acceleration (GPU encoding)
- [ ] AI-based quality optimization
- [ ] Multi-region failover
- [ ] Peer-to-peer streaming
- [ ] Recording and replay
- [ ] Social features (streaming)
- [ ] Cross-platform cloud saves
