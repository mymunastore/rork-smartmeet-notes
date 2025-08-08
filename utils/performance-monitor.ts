class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);

    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};

    this.metrics.forEach((times, label) => {
      if (times.length > 0) {
        const sum = times.reduce((acc, time) => acc + time, 0);
        result[label] = {
          average: sum / times.length,
          count: times.length,
          latest: times[times.length - 1],
        };
      }
    });

    return result;
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    console.log("📊 Performance Metrics:");
    Object.entries(metrics).forEach(([label, data]) => {
      console.log(`  ${label}: avg ${data.average.toFixed(2)}ms (${data.count} samples)`);
    });
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }
}

export default new PerformanceMonitor();