import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    checkAndNavigate();
  }, []);

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

  // Show loading screen while checking
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
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
});