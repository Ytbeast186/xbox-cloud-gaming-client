# Security Guide

## Overview

This document outlines security best practices and implementation for Xbox Cloud Gaming Client.

## Authentication

### JWT Implementation

```javascript
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-secret-key';

// Generate token
function generateToken(userId, deviceId) {
  return jwt.sign(
    { userId, deviceId, iat: Date.now() },
    secret,
    { expiresIn: '1h' }
  );
}

// Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
```

## Encryption

### TLS/SSL Configuration

```javascript
import fs from 'fs';
import https from 'https';
import express from 'express';

const app = express();
const options = {
  key: fs.readFileSync(process.env.SSL_KEY),
  cert: fs.readFileSync(process.env.SSL_CERT)
};

https.createServer(options, app).listen(443);
```

### Data Encryption

```javascript
import crypto from 'crypto';

class Encryption {
  constructor(key) {
    this.key = crypto.scryptSync(key, 'salt', 32);
  }

  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(data) {
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
```

## Input Validation

### Sanitization

```bash
npm install sanitize-html xss
```

```javascript
import sanitizeHtml from 'sanitize-html';
import xss from 'xss';

function sanitizeInput(input) {
  return xss(sanitizeHtml(input));
}
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## CORS & CSRF

### CORS Configuration

```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Secrets Management

### Environment Variables

```bash
# .env
DATABASE_URL=<encrypted>
JWT_SECRET=<strong-random-key>
API_KEY=<api-key>
```

## HTTP Security Headers

```javascript
import helmet from 'helmet';

// Helmet provides various HTTP headers for security
app.use(helmet());

// Additional security headers
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // X-Frame-Options (Clickjacking prevention)
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options (MIME sniffing prevention)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
```

## Logging & Monitoring

### Secure Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Never log sensitive data
logger.info('User action', { userId: user.id }); // OK
// logger.info('Auth attempt', { password }); // NEVER DO THIS
```

## WebSocket Security

### Origin Verification

```javascript
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }
});

// Verify authentication on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (verifyToken(token)) {
    next();
  } else {
    next(new Error('Authentication failed'));
  }
});
```

## DDoS Protection

### Application Level

```javascript
const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.user?.isAdmin, // Whitelist admins
  keyGenerator: (req) => req.ip
});

app.use('/api/', limit);
```

## API Security

### API Key Management

```javascript
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
}

app.use('/api/v1/', verifyApiKey);
```

## Dependency Security

### Regular Audits

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

## Security Checklist

- [ ] All data encrypted in transit (TLS/SSL)
- [ ] HTTPS enforced
- [ ] Strong password requirements
- [ ] JWT tokens with short expiry
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Secrets not in version control
- [ ] Security headers configured
- [ ] Logging doesn't contain sensitive data
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Authentication required for streaming
- [ ] Session timeouts configured
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented
- [ ] Backup strategy in place

## Incident Response

### Response Plan

1. **Detection** - Monitor logs for anomalies
2. **Containment** - Isolate affected systems
3. **Investigation** - Determine root cause
4. **Remediation** - Fix the vulnerability
5. **Recovery** - Restore normal operations
6. **Post-Incident** - Review and improve

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [WebSocket Security](https://owasp.org/www-community/attacks/WebSocket_Protocol_Manipulation)
