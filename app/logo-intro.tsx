import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Zap, Mic, Brain, FileText, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LogoIntroPage() {
  const router = useRouter();
  const [showSkip, setShowSkip] = useState(false);
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(50)).current;
  const particleAnimations = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const orbitalAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setHidden(true);
    startAnimationSequence();
    
    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);

    // Auto-navigate after 5 seconds
    const autoNavigateTimer = setTimeout(() => {
      handleContinue();
    }, 5000);

    return () => {
      StatusBar.setHidden(false);
      clearTimeout(skipTimer);
      clearTimeout(autoNavigateTimer);
    };
  }, []);

  const startAnimationSequence = () => {
    // Start all animations in sequence
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start continuous animations
    startContinuousAnimations();
    startParticleAnimations();
  };

  const startContinuousAnimations = () => {
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Orbital animation
    Animated.loop(
      Animated.timing(orbitalAnimation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startParticleAnimations = () => {
    particleAnimations.forEach((particle, index) => {
      const delay = index * 200;
      const duration = 3000 + Math.random() * 2000;
      const radius = 100 + Math.random() * 50;
      const angle = (index / particleAnimations.length) * Math.PI * 2;
      
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0.8,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * radius,
                duration: duration,
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * radius,
                duration: duration,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      }, delay);
    });
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem('logo_intro_seen', 'true');
      router.replace('/welcome');
    } catch (error) {
      console.log('Error saving logo intro status:', error);
      router.replace('/welcome');
    }
  };

  const handleSkip = () => {
    handleContinue();
  };

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const orbitalRotation = orbitalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderParticles = () => {
    return particleAnimations.map((particle, index) => {
      const particleIcons = [Sparkles, Zap, Mic, Brain, FileText, Globe];
      const IconComponent = particleIcons[index % particleIcons.length];
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      const color = colors[index % colors.length];

      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <IconComponent color={color} size={16} />
        </Animated.View>
      );
    });
  };

  const renderOrbitalElements = () => {
    const elements = [
      { icon: Mic, color: '#FF6B6B', radius: 80, speed: 1 },
      { icon: Brain, color: '#4ECDC4', radius: 100, speed: -0.8 },
      { icon: FileText, color: '#45B7D1', radius: 120, speed: 0.6 },
      { icon: Globe, color: '#96CEB4', radius: 140, speed: -0.4 },
    ];

    return elements.map((element, index) => {
      const ElementIcon = element.icon;
      const rotation = orbitalAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${360 * element.speed}deg`],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.orbitalElement,
            {
              transform: [
                { rotate: rotation },
                { translateX: element.radius },
                { rotate: orbitalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${-360 * element.speed}deg`],
                }) },
              ],
            },
          ]}
        >
          <View style={[styles.orbitalIcon, { backgroundColor: element.color }]}>
            <ElementIcon color="#FFFFFF" size={20} />
          </View>
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Background Shapes */}
      <View style={styles.backgroundShapes}>
        <View style={[styles.shape, styles.shape1]} />
        <View style={[styles.shape, styles.shape2]} />
        <View style={[styles.shape, styles.shape3]} />
        <View style={[styles.shape, styles.shape4]} />
        <View style={[styles.shape, styles.shape5]} />
      </View>

      {/* Skip Button */}
      {showSkip && (
        <Animated.View style={[styles.skipContainer, { opacity: textOpacity }]}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main Logo Container */}
      <View style={styles.logoContainer}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        />

        {/* Orbital Elements */}
        <View style={styles.orbitalContainer}>
          {renderOrbitalElements()}
        </View>

        {/* Particles */}
        <View style={styles.particlesContainer}>
          {renderParticles()}
        </View>

        {/* Main Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: logoRotationInterpolate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F0F8FF', '#E6F3FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <View style={styles.logoInner}>
              <View style={styles.logoIconContainer}>
                <Sparkles color="#667eea" size={32} />
                <View style={styles.logoAccent}>
                  <Zap color="#f5576c" size={20} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Logo Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textSlide }],
            },
          ]}
        >
          <Text style={styles.logoTitle}>SCRIBE AI</Text>
          <Text style={styles.logoSubtitle}>Intelligent Meeting Assistant</Text>
          <View style={styles.taglineContainer}>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>Transform Voice to Insights</Text>
            <View style={styles.taglineDot} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Indicator */}
      <Animated.View style={[styles.bottomIndicator, { opacity: textOpacity }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.loadingText}>Initializing AI Engine...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  shape1: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    top: '10%',
    left: '-10%',
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFD700',
    top: '20%',
    right: '-5%',
  },
  shape3: {
    width: 100,
    height: 100,
    backgroundColor: '#FF6B6B',
    bottom: '30%',
    left: '10%',
  },
  shape4: {
    width: 180,
    height: 180,
    backgroundColor: '#4ECDC4',
    bottom: '10%',
    right: '5%',
  },
  shape5: {
    width: 120,
    height: 120,
    backgroundColor: '#96CEB4',
    top: '50%',
    left: '80%',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  orbitalContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitalElement: {
    position: 'absolute',
  },
  orbitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAccent: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    marginBottom: 16,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});