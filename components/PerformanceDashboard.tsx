import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X, Activity, Database, Zap, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import performanceMonitor from '@/utils/performance-monitor';
import cacheManager from '@/utils/cache-manager';
import { getAPIStats, checkAPIHealth } from '@/utils/api';

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface APIHealth {
  transcription: boolean;
  summary: boolean;
  latency: number;
}

export default function PerformanceDashboard({ visible, onClose }: PerformanceDashboardProps) {
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [apiHealth, setApiHealth] = useState<APIHealth | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Get performance and cache stats
      const stats = getAPIStats();
      setPerformanceStats(stats.performanceStats);
      setCacheStats(stats.cacheStats);
      
      // Check API health
      const health = await checkAPIHealth();
      setApiHealth(health);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadStats();
      // Auto-refresh every 5 seconds when visible
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [visible, loadStats]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy ? Colors.light.success : Colors.light.error;
  };

  const StatCard = ({ title, value, subtitle, icon, color = Colors.light.primary }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {React.cloneElement(icon as React.ReactElement, { color: color, size: 20 } as any)}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🚀 Performance Dashboard</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color={Colors.light.gray[600]} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* API Health Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Health</Text>
            {apiHealth ? (
              <View style={styles.healthGrid}>
                <StatCard
                  title="Transcription"
                  value={apiHealth.transcription ? "Healthy" : "Down"}
                  icon={<Activity />}
                  color={getHealthColor(apiHealth.transcription)}
                />
                <StatCard
                  title="Summary"
                  value={apiHealth.summary ? "Healthy" : "Down"}
                  icon={<Zap />}
                  color={getHealthColor(apiHealth.summary)}
                />
                <StatCard
                  title="Latency"
                  value={`${apiHealth.latency}ms`}
                  subtitle={apiHealth.latency < 1000 ? "Excellent" : "Slow"}
                  icon={<Clock />}
                  color={apiHealth.latency < 1000 ? Colors.light.success : Colors.light.warning}
                />
              </View>
            ) : (
              <Text style={styles.loadingText}>Loading API health...</Text>
            )}
          </View>

          {/* Cache Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cache Performance</Text>
            {cacheStats ? (
              <View style={styles.statsGrid}>
                <StatCard
                  title="Cache Size"
                  value={cacheStats.size.toString()}
                  subtitle="items cached"
                  icon={<Database />}
                />
                <StatCard
                  title="Hit Rate"
                  value={formatPercentage(cacheStats.hitRate)}
                  subtitle="cache efficiency"
                  icon={<Zap />}
                  color={cacheStats.hitRate > 0.8 ? Colors.light.success : Colors.light.warning}
                />
                <StatCard
                  title="Memory Usage"
                  value={formatBytes(cacheStats.memoryUsage)}
                  subtitle="cache memory"
                  icon={<Activity />}
                />
              </View>
            ) : (
              <Text style={styles.loadingText}>Loading cache stats...</Text>
            )}
          </View>

          {/* Performance Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Performance</Text>
            {performanceStats ? (
              <View style={styles.statsGrid}>
                <StatCard
                  title="Operations"
                  value={performanceStats.totalOperations.toString()}
                  subtitle="total completed"
                  icon={<Activity />}
                />
                <StatCard
                  title="Avg Response"
                  value={`${performanceStats.averageResponseTime.toFixed(0)}ms`}
                  subtitle="average time"
                  icon={<Clock />}
                  color={performanceStats.averageResponseTime < 100 ? Colors.light.success : Colors.light.warning}
                />
                <StatCard
                  title="Slow Operations"
                  value={performanceStats.slowOperations.toString()}
                  subtitle="needs attention"
                  icon={<Zap />}
                  color={performanceStats.slowOperations === 0 ? Colors.light.success : Colors.light.error}
                />
              </View>
            ) : (
              <Text style={styles.loadingText}>Loading performance stats...</Text>
            )}
          </View>

          {/* Memory Usage (if available) */}
          {performanceStats?.memoryUsage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Memory Usage</Text>
              <StatCard
                title="JS Heap"
                value={formatBytes(performanceStats.memoryUsage.used)}
                subtitle={`${formatPercentage(performanceStats.memoryUsage.percentage / 100)} of ${formatBytes(performanceStats.memoryUsage.total)}`}
                icon={<Database />}
                color={performanceStats.memoryUsage.percentage > 80 ? Colors.light.error : Colors.light.success}
              />
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.light.primary }]}
                onPress={() => {
                  performanceMonitor.clearMetrics();
                  loadStats();
                }}
              >
                <Text style={styles.actionButtonText}>Clear Metrics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.light.secondary }]}
                onPress={() => {
                  cacheManager.clear();
                  loadStats();
                }}
              >
                <Text style={styles.actionButtonText}>Clear Cache</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.light.success }]}
                onPress={loadStats}
                disabled={refreshing}
              >
                <Text style={styles.actionButtonText}>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  statsGrid: {
    gap: 12,
  },
  healthGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.light.gray[600],
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.light.gray[500],
    marginTop: 2,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.gray[500],
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});