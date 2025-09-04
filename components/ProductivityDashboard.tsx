import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Clock,
  FileText,
  Mic,
  Target,
  Calendar,
  BarChart3,
  Award,
  Zap,
  Brain,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotes } from '@/hooks/use-notes-store';
import { useTheme } from '@/hooks/use-theme';

const { width: screenWidth } = Dimensions.get('window');

// Analytics data structure
interface AnalyticsData {
  totalNotes: number;
  completedNotes: number;
  totalRecordingTime: number;
  averageNoteLength: number;
  weeklyProgress: number[];
  topCategories: { name: string; count: number; color: string }[];
  productivityScore: number;
  streakDays: number;
  todayGoal: { completed: number; total: number };
}

// Productivity insights
const PRODUCTIVITY_INSIGHTS = [
  {
    id: '1',
    title: 'Peak Performance Hours',
    description: 'You are most productive between 9 AM - 11 AM',
    icon: Clock,
    color: '#4299E1',
    trend: 'up',
  },
  {
    id: '2',
    title: 'Note Quality Improvement',
    description: 'Your notes are 23% more detailed this week',
    icon: TrendingUp,
    color: '#38A169',
    trend: 'up',
  },
  {
    id: '3',
    title: 'Recording Efficiency',
    description: 'Average recording time decreased by 15%',
    icon: Mic,
    color: '#ED8936',
    trend: 'down',
  },
  {
    id: '4',
    title: 'Completion Rate',
    description: 'You completed 85% of your notes this week',
    icon: Target,
    color: '#9F7AEA',
    trend: 'up',
  },
];

// Achievement badges
const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Note Master',
    description: 'Created 100+ notes',
    icon: FileText,
    earned: true,
    color: '#F6AD55',
  },
  {
    id: '2',
    title: 'Consistency King',
    description: '7-day streak',
    icon: Calendar,
    earned: true,
    color: '#68D391',
  },
  {
    id: '3',
    title: 'Speed Demon',
    description: 'Quick transcription expert',
    icon: Zap,
    earned: false,
    color: '#63B3ED',
  },
  {
    id: '4',
    title: 'AI Whisperer',
    description: 'Used AI features 50+ times',
    icon: Brain,
    earned: false,
    color: '#F093FB',
  },
];

interface ProductivityDashboardProps {
  onNavigateToNotes?: () => void;
  onNavigateToRecording?: () => void;
}

export default function ProductivityDashboard({ 
  onNavigateToNotes, 
  onNavigateToRecording 
}: ProductivityDashboardProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { notes, completedNotes } = useNotes();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Calculate analytics data
  const analyticsData = useMemo((): AnalyticsData => {
    const totalNotes = notes.length;
    const completed = completedNotes.length;
    const totalRecordingTime = notes.reduce((acc, note) => acc + (note.duration || 0), 0);
    const averageLength = totalNotes > 0 ? notes.reduce((acc, note) => acc + (note.transcript?.length || 0), 0) / totalNotes : 0;
    
    // Mock weekly progress data
    const weeklyProgress = [65, 78, 82, 90, 85, 92, 88];
    
    // Mock category data
    const topCategories = [
      { name: 'Meetings', count: Math.floor(totalNotes * 0.4), color: colors.primary },
      { name: 'Ideas', count: Math.floor(totalNotes * 0.3), color: colors.secondary },
      { name: 'Tasks', count: Math.floor(totalNotes * 0.2), color: colors.accent },
      { name: 'Other', count: Math.floor(totalNotes * 0.1), color: colors.nature.sage },
    ];
    
    const productivityScore = Math.min(100, Math.floor((completed / Math.max(totalNotes, 1)) * 100 + Math.random() * 20));
    const streakDays = Math.floor(Math.random() * 15) + 1;
    const todayGoal = { completed: Math.floor(Math.random() * 8) + 2, total: 10 };

    return {
      totalNotes,
      completedNotes: completed,
      totalRecordingTime,
      averageNoteLength: averageLength,
      weeklyProgress,
      topCategories,
      productivityScore,
      streakDays,
      todayGoal,
    };
  }, [notes, completedNotes, colors]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return ArrowUp;
      case 'down':
        return ArrowDown;
      default:
        return Minus;
    }
  }, []);

  const getTrendColor = useCallback((trend: string) => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.gray[500];
    }
  }, [colors]);

  const renderStatCard = useCallback(({ title, value, subtitle, icon: Icon, gradient, onPress }: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    gradient: [string, string];
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <LinearGradient
        colors={gradient}
        style={styles.statIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon size={24} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  ), [colors]);

  const renderInsightCard = useCallback(({ item }: { item: typeof PRODUCTIVITY_INSIGHTS[0] }) => {
    const IconComponent = item.icon;
    const TrendIcon = getTrendIcon(item.trend);
    const trendColor = getTrendColor(item.trend);

    return (
      <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: `${item.color}20` }]}>
            <IconComponent size={20} color={item.color} />
          </View>
          <View style={styles.insightTrend}>
            <TrendIcon size={16} color={trendColor} />
          </View>
        </View>
        <Text style={[styles.insightTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    );
  }, [colors, getTrendIcon, getTrendColor]);

  const renderAchievementBadge = useCallback(({ item }: { item: typeof ACHIEVEMENTS[0] }) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        style={[
          styles.achievementBadge,
          { 
            backgroundColor: colors.card, 
            borderColor: item.earned ? item.color : colors.border,
            opacity: item.earned ? 1 : 0.6,
          }
        ]}
        onPress={() => {
          Alert.alert(
            item.title,
            item.description + (item.earned ? '\n\n🎉 Achievement Unlocked!' : '\n\nKeep going to unlock this achievement!'),
            [{ text: 'OK' }]
          );
        }}
        activeOpacity={0.8}
      >
        <View style={[
          styles.achievementIcon,
          { backgroundColor: item.earned ? `${item.color}20` : colors.gray[200] }
        ]}>
          <IconComponent size={24} color={item.earned ? item.color : colors.gray[500]} />
        </View>
        <Text style={[styles.achievementTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.earned && (
          <View style={[styles.achievementBadgeIcon, { backgroundColor: item.color }]}>
            <CheckCircle size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [colors]);

  const renderProgressBar = useCallback((progress: number, total: number, color: string) => (
    <View style={[styles.progressBarContainer, { backgroundColor: colors.gray[200] }]}>
      <View
        style={[
          styles.progressBar,
          {
            width: `${Math.min((progress / total) * 100, 100)}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  ), [colors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Productivity Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Track your progress and insights
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard({
          title: 'Total Notes',
          value: analyticsData.totalNotes.toString(),
          subtitle: `${analyticsData.completedNotes} completed`,
          icon: FileText,
          gradient: ['#667eea', '#764ba2'],
          onPress: onNavigateToNotes,
        })}
        {renderStatCard({
          title: 'Recording Time',
          value: formatTime(analyticsData.totalRecordingTime),
          subtitle: 'This week',
          icon: Mic,
          gradient: ['#f093fb', '#f5576c'],
          onPress: onNavigateToRecording,
        })}
        {renderStatCard({
          title: 'Productivity Score',
          value: `${analyticsData.productivityScore}%`,
          subtitle: '+12% from last week',
          icon: TrendingUp,
          gradient: ['#4facfe', '#00f2fe'],
        })}
        {renderStatCard({
          title: 'Current Streak',
          value: `${analyticsData.streakDays}`,
          subtitle: 'days in a row',
          icon: Award,
          gradient: ['#43e97b', '#38f9d7'],
        })}
      </View>

      {/* Today's Goal */}
      <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalHeaderLeft}>
            <View style={[styles.goalIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Target size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.goalTitle, { color: colors.text }]}>Today&apos;s Goal</Text>
              <Text style={[styles.goalSubtitle, { color: colors.textSecondary }]}>
                {analyticsData.todayGoal.completed} of {analyticsData.todayGoal.total} notes
              </Text>
            </View>
          </View>
          <Text style={[styles.goalPercentage, { color: colors.primary }]}>
            {Math.round((analyticsData.todayGoal.completed / analyticsData.todayGoal.total) * 100)}%
          </Text>
        </View>
        {renderProgressBar(
          analyticsData.todayGoal.completed,
          analyticsData.todayGoal.total,
          colors.primary
        )}
      </View>

      {/* Productivity Insights */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Productivity Insights</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsContainer}
        >
          {PRODUCTIVITY_INSIGHTS.map((insight) => (
            <View key={insight.id} style={styles.insightWrapper}>
              {renderInsightCard({ item: insight })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <View key={achievement.id} style={styles.achievementWrapper}>
              {renderAchievementBadge({ item: achievement })}
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Activity Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <View style={styles.chartHeaderLeft}>
            <View style={[styles.chartIcon, { backgroundColor: `${colors.secondary}20` }]}>
              <BarChart3 size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Activity</Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          {analyticsData.weeklyProgress.map((value, index) => (
            <View key={index} style={styles.chartBar}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: `${value}%`,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
              <Text style={[styles.chartBarLabel, { color: colors.textTertiary }]}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (screenWidth - 52) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalSubtitle: {
    fontSize: 14,
  },
  goalPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  insightsContainer: {
    paddingRight: 20,
  },
  insightWrapper: {
    marginRight: 12,
  },
  insightCard: {
    width: screenWidth * 0.7,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTrend: {
    padding: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementWrapper: {
    width: (screenWidth - 52) / 2,
  },
  achievementBadge: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  achievementBadgeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});