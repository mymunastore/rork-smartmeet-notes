import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useChat } from '@/hooks/use-chat-store';
import { useTheme } from '@/hooks/use-theme';

interface FloatingChatButtonProps {
  onPress?: () => void;
  style?: any;
}

export default function FloatingChatButton({ onPress, style }: FloatingChatButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { unreadCount } = useChat();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/chat');
    }

    // Add press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    Animated.timing(scaleAnim, {
      toValue: isExpanded ? 1 : 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Pulse animation for attention
  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat pulse every 5 seconds
        setTimeout(pulse, 5000);
      });
    };

    const timer = setTimeout(pulse, 2000);
    return () => clearTimeout(timer);
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      {isExpanded && (
        <Animated.View style={[styles.tooltip, { shadowColor: colors.text }]}>
          <LinearGradient
            colors={[`${colors.background}F2`, `${colors.background}FA`]}
            style={[styles.tooltipGradient, { borderColor: colors.border }]}
          >
            <View style={styles.tooltipContent}>
              <Sparkles size={16} color={colors.nature.sage} />
              <Text style={[styles.tooltipText, { color: colors.text }]}>Ask AI Assistant</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleExpanded}
            >
              <X size={14} color={colors.gray[400]} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
      
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onLongPress={toggleExpanded}
        activeOpacity={0.8}
        testID="floating-chat-button"
      >
        <LinearGradient
          colors={[colors.nature.sage, colors.nature.ocean]}
          style={styles.buttonGradient}
        >
          <MessageCircle size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.nature.coral }]}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount.toString()}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  tooltip: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipGradient: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 160,
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});