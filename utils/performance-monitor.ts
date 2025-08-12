interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

// Extend Performance interface to include memory property
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface PerformanceMetric {
  average: number;
  count: number;
  latest: number;
  min: number;
  max: number;
  p95: number;
}

class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();
  private memorySnapshots: MemoryUsage[] = [];
  private maxMetricHistory = 100; // Limit memory usage
  private isEnabled = __DEV__; // Only enable in development
  private batchSize = 10; // Batch operations for better performance
  private operationQueue: { label: string; startTime: number; endTime?: number }[] = [];

  startTimer(label: string): void {
    if (!this.isEnabled) return;
    this.timers.set(label, performance.now());
  }

  endTimer(label: string): number {
    if (!this.isEnabled) return 0;
    
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Batch operations for better performance
    this.operationQueue.push({ label, startTime, endTime: performance.now() });
    
    if (this.operationQueue.length >= this.batchSize) {
      this.processBatch();
    }

    // Store metric with history limit
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    const times = this.metrics.get(label)!;
    times.push(duration);
    
    // Keep only recent metrics to prevent memory leaks
    if (times.length > this.maxMetricHistory) {
      times.shift();
    }

    // Only log slow operations
    if (duration > 100) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  private processBatch(): void {
    // Process batched operations for analytics
    const batch = this.operationQueue.splice(0, this.batchSize);
    
    // Group by operation type for better insights
    const grouped = batch.reduce((acc, op) => {
      const category = op.label.split('-')[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(op);
      return acc;
    }, {} as Record<string, typeof batch>);
    
    // Log batch summary for critical operations
    Object.entries(grouped).forEach(([category, operations]) => {
      if (operations.length > 3) {
        const avgDuration = operations.reduce((sum, op) => 
          sum + ((op.endTime || 0) - op.startTime), 0) / operations.length;
        if (avgDuration > 50) {
          console.log(`📊 ${category} batch: ${operations.length} ops, avg ${avgDuration.toFixed(2)}ms`);
        }
      }
    });
  }

  measureMemory(): MemoryUsage | null {
    if (!this.isEnabled) return null;
    
    try {
      // Memory API is only available in Chrome and some browsers
      // It's not part of the standard Performance interface
      const perf = performance as unknown as PerformanceWithMemory;
      if (typeof performance !== 'undefined' && perf.memory && typeof perf.memory.usedJSHeapSize === 'number') {
        const memory = perf.memory;
        const usage: MemoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
        
        this.memorySnapshots.push(usage);
        if (this.memorySnapshots.length > 50) {
          this.memorySnapshots.shift();
        }
        
        return usage;
      }
    } catch (error) {
      // Memory API not available - this is expected on mobile
      console.debug('Memory API not available:', error);
    }
    return null;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  getMetrics(): Record<string, PerformanceMetric> {
    const result: Record<string, PerformanceMetric> = {};

    this.metrics.forEach((times, label) => {
      if (times.length > 0) {
        const sorted = [...times].sort((a, b) => a - b);
        const sum = times.reduce((acc, time) => acc + time, 0);
        const p95Index = Math.floor(sorted.length * 0.95);
        
        result[label] = {
          average: sum / times.length,
          count: times.length,
          latest: times[times.length - 1],
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p95: sorted[p95Index] || sorted[sorted.length - 1]
        };
      }
    });

    return result;
  }

  logMetrics(): void {
    if (!this.isEnabled) return;
    
    const metrics = this.getMetrics();
    const memory = this.measureMemory();
    
    console.group("📊 Performance Metrics");
    
    Object.entries(metrics).forEach(([label, data]) => {
      if (data.count > 0) {
        console.log(
          `${label}: avg ${data.average.toFixed(2)}ms | p95 ${data.p95.toFixed(2)}ms | samples ${data.count}`
        );
      }
    });
    
    if (memory) {
      console.log(
        `Memory: ${(memory.used / 1024 / 1024).toFixed(2)}MB / ${(memory.total / 1024 / 1024).toFixed(2)}MB (${memory.percentage.toFixed(1)}%)`
      );
    }
    
    console.groupEnd();
  }

  getSlowOperations(threshold = 100): { label: string; duration: number }[] {
    const slowOps: { label: string; duration: number }[] = [];
    
    this.metrics.forEach((times, label) => {
      const latest = times[times.length - 1];
      if (latest > threshold) {
        slowOps.push({ label, duration: latest });
      }
    });
    
    return slowOps.sort((a, b) => b.duration - a.duration);
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
    this.memorySnapshots.length = 0;
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Get performance summary with enhanced insights
  getSummary(): {
    totalOperations: number;
    averageResponseTime: number;
    slowOperations: number;
    memoryUsage?: MemoryUsage;
    criticalOperations: string[];
    performanceScore: number;
  } {
    const metrics = this.getMetrics();
    const totalOps = Object.values(metrics).reduce((sum, metric) => sum + metric.count, 0);
    const avgTime = Object.values(metrics).reduce((sum, metric) => sum + metric.average, 0) / Object.keys(metrics).length || 0;
    const slowOps = this.getSlowOperations().length;
    
    // Identify critical operations that need optimization
    const criticalOperations = Object.entries(metrics)
      .filter(([, metric]) => metric.p95 > 200 || metric.average > 100)
      .map(([label]) => label);
    
    // Calculate performance score (0-100)
    const performanceScore = Math.max(0, 100 - (avgTime / 10) - (slowOps * 5));
    
    return {
      totalOperations: totalOps,
      averageResponseTime: avgTime,
      slowOperations: slowOps,
      memoryUsage: this.memorySnapshots[this.memorySnapshots.length - 1],
      criticalOperations,
      performanceScore: Math.round(performanceScore)
    };
  }
}

export default new PerformanceMonitor();