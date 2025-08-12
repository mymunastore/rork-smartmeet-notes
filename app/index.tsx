import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';

export default function IndexPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const logoIntroSeen = await AsyncStorage.getItem('logo_intro_seen');
        
        if (logoIntroSeen === 'true') {
          // Logo intro has been seen, go to welcome page
          router.replace('/welcome');
        } else {
          // First time, show logo intro
          router.replace('/logo-intro');
        }
      } catch (error) {
        console.log('Error checking logo intro status:', error);
        // Default to logo intro on error
        router.replace('/logo-intro');
      }
    };
    
    checkAndNavigate();
  }, [router]);

  // Show loading screen while checking
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A202C', '#2D3748', '#4A5568'] : ['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <View style={styles.content}>
        <Text style={[styles.loadingText, { color: colors.background }]}>
          Loading SCRIBE...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});