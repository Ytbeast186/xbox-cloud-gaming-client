import logger from '../utils/logger.js';

class PerformanceMonitor {
  constructor(config = {}) {
    this.metrics = new Map();
    this.thresholds = {
      maxLatency: config.maxLatency || 50,
      minFPS: config.minFPS || 30,
      maxPacketLoss: config.maxPacketLoss || 2,
      maxJitter: config.maxJitter || 10,
      ...config.thresholds
    };
    logger.info('PerformanceMonitor initialized');
  }

  recordMetric(sessionId, metric) {
    if (!this.metrics.has(sessionId)) {
      this.metrics.set(sessionId, []);
    }

    const metrics = this.metrics.get(sessionId);
    metrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics per session
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  getPerformanceReport(sessionId) {
    const metrics = this.metrics.get(sessionId) || [];
    if (metrics.length === 0) return null;

    const latencies = metrics.map(m => m.latency).filter(Boolean);
    const fps = metrics.map(m => m.fps).filter(Boolean);
    const packetLoss = metrics.map(m => m.packetLoss).filter(Boolean);
    const jitter = metrics.map(m => m.jitter).filter(Boolean);

    const report = {
      sessionId,
      sampleCount: metrics.length,
      latency: {
        avg: this.average(latencies),
        min: Math.min(...latencies),
        max: Math.max(...latencies),
        p95: this.percentile(latencies, 0.95),
        p99: this.percentile(latencies, 0.99)
      },
      fps: {
        avg: this.average(fps),
        min: Math.min(...fps),
        max: Math.max(...fps)
      },
      packetLoss: {
        avg: this.average(packetLoss),
        max: Math.max(...packetLoss)
      },
      jitter: {
        avg: this.average(jitter),
        max: Math.max(...jitter)
      }
    };

    // Check health
    report.health = this.assessHealth(report);

    return report;
  }

  assessHealth(report) {
    const issues = [];

    if (report.latency.avg > this.thresholds.maxLatency) {
      issues.push(`High latency: ${report.latency.avg.toFixed(2)}ms`);
    }
    if (report.fps.avg < this.thresholds.minFPS) {
      issues.push(`Low FPS: ${report.fps.avg.toFixed(2)}`);
    }
    if (report.packetLoss.avg > this.thresholds.maxPacketLoss) {
      issues.push(`High packet loss: ${report.packetLoss.avg.toFixed(2)}%`);
    }
    if (report.jitter.avg > this.thresholds.maxJitter) {
      issues.push(`High jitter: ${report.jitter.avg.toFixed(2)}ms`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'degraded',
      issues
    };
  }

  average(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  percentile(values, p) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  clearMetrics(sessionId) {
    this.metrics.delete(sessionId);
  }
}

export default PerformanceMonitor;
