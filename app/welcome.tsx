import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Brain, FileText, Shield, CheckCircle, X, Sparkles, Zap, Globe } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Mic color="#FFFFFF" size={28} />,
    title: 'Meeting Recording',
    description: 'Record meetings and calls with crystal clear audio quality'
  },
  {
    icon: <FileText color="#FFFFFF" size={28} />,
    title: 'Smart Transcription',
    description: 'Accurate speech-to-text conversion in multiple languages'
  },
  {
    icon: <Brain color="#FFFFFF" size={28} />,
    title: 'AI Summaries',
    description: 'Get intelligent summaries and key insights from your recordings'
  },
  {
    icon: <Shield color="#FFFFFF" size={28} />,
    title: 'Secure & Private',
    description: 'All data stored locally on your device with encryption'
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkDisclaimerStatus();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const checkDisclaimerStatus = async () => {
    try {
      const accepted = await AsyncStorage.getItem('disclaimer_accepted');
      if (accepted === 'true') {
        setDisclaimerAccepted(true);
      } else {
        setShowDisclaimer(true);
      }
    } catch (error) {
      console.log('Error checking disclaimer status:', error);
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = async () => {
    try {
      await AsyncStorage.setItem('disclaimer_accepted', 'true');
      setDisclaimerAccepted(true);
      setShowDisclaimer(false);
    } catch (error) {
      console.log('Error saving disclaimer acceptance:', error);
    }
  };

  const handleDeclineDisclaimer = () => {
    setShowDisclaimer(false);
    // In a real app, you might want to close the app or redirect
  };

  const handleGetStarted = async () => {
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    
    // Check if onboarding is completed
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      if (onboardingCompleted === 'true') {
        router.push('/(tabs)/notes');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      router.push('/onboarding');
    }
  };

  const handleLogin = async () => {
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    
    // For now, navigate to the main app - in a real app this would go to login screen
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      if (onboardingCompleted === 'true') {
        router.push('/(tabs)/notes');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      router.push('/onboarding');
    }
  };

  const handleSignUp = async () => {
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    
    // For now, navigate to the main app - in a real app this would go to signup screen
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      if (onboardingCompleted === 'true') {
        router.push('/(tabs)/notes');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      router.push('/onboarding');
    }
  };

  const renderFeature = (feature: Feature, index: number) => (
    <View key={index} style={styles.featureCard}>
      <LinearGradient
        colors={index % 2 === 0 ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureGradient}
      >
        <View style={styles.featureIcon}>
          {feature.icon}
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.floatingShapes}>
          <View style={[styles.shape, styles.shape1]} />
          <View style={[styles.shape, styles.shape2]} />
          <View style={[styles.shape, styles.shape3]} />
          <View style={[styles.shape, styles.shape4]} />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.headerLogo}>
              <View style={styles.headerLogoWrapper}>
                <Sparkles color="#FFFFFF" size={20} style={styles.headerLogoIcon} />
                <Text style={styles.headerLogoText}>SCRIBE AI</Text>
                <Zap color="#FFD700" size={16} style={styles.headerLogoAccent} />
              </View>
            </View>
            <View style={styles.authButtons}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.heroLogoContainer}>
              <View style={styles.aiPoweredBadge}>
                <Globe color="#FFFFFF" size={12} />
                <Text style={styles.aiPoweredText}>AI Powered</Text>
              </View>
            </View>
            
            <Text style={styles.heroTitle}>
              Transform Your Meetings Into{' '}
              <Text style={styles.heroTitleAccent}>Actionable Insights</Text>
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Record, transcribe, and summarize your meetings and calls with the power of AI. 
              Never miss important details again.
            </Text>

            <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaButtonText}>Get Started Free</Text>
                <Sparkles color="#FFFFFF" size={16} style={styles.ctaIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose Scribe AI?</Text>
            <View style={styles.featuresGrid}>
              {features.map(renderFeature)}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Key Benefits</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <CheckCircle color={"#4ECDC4"} size={20} />
                <Text style={styles.benefitText}>Save hours of manual note-taking</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle color={"#4ECDC4"} size={20} />
                <Text style={styles.benefitText}>Never miss important action items</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle color={"#4ECDC4"} size={20} />
                <Text style={styles.benefitText}>Searchable meeting history</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle color={"#4ECDC4"} size={20} />
                <Text style={styles.benefitText}>Multi-language support</Text>
              </View>
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footerCta}>
            <Text style={styles.footerCtaTitle}>Ready to Get Started?</Text>
            <Text style={styles.footerCtaSubtitle}>
              Join thousands of professionals who trust Scribe AI for their meeting needs.
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaButtonText}>Start Recording Now</Text>
                <Sparkles color="#FFFFFF" size={16} style={styles.ctaIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Disclaimer Modal */}
      <Modal
        visible={showDisclaimer}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Privacy Notice</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDisclaimer(false)}
            >
              <X color={Colors.light.gray[600]} size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.disclaimerTitle}>Recording Consent & Privacy</Text>
            <Text style={styles.disclaimerText}>
              By using Scribe AI Note, you acknowledge and agree to the following:
            </Text>
            
            <Text style={styles.disclaimerSection}>📱 Recording Consent</Text>
            <Text style={styles.disclaimerText}>
              • You are responsible for obtaining proper consent before recording any meetings or calls
              • Recording laws vary by jurisdiction - ensure compliance with local regulations
              • Always inform participants when recording is active
            </Text>
            
            <Text style={styles.disclaimerSection}>🔒 Data Privacy</Text>
            <Text style={styles.disclaimerText}>
              • All recordings and transcripts are stored locally on your device
              • We use AI services to process audio for transcription and summaries
              • No personal data is shared without your explicit consent
              • You can delete your data at any time
            </Text>
            
            <Text style={styles.disclaimerSection}>⚖️ Legal Compliance</Text>
            <Text style={styles.disclaimerText}>
              • You agree to use this app in compliance with all applicable laws
              • You are solely responsible for the content you record
              • We are not liable for any misuse of the recording functionality
            </Text>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDeclineDisclaimer}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptDisclaimer}
            >
              <Text style={styles.acceptButtonText}>Accept & Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientBackground: {
    flex: 1,
  },
  floatingShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  shape1: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    top: '10%',
    left: '10%',
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: '#FFD700',
    top: '20%',
    right: '15%',
  },
  shape3: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B6B',
    bottom: '30%',
    left: '20%',
  },
  shape4: {
    width: 120,
    height: 120,
    backgroundColor: '#4ECDC4',
    bottom: '15%',
    right: '10%',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLogo: {
    alignItems: 'flex-start',
  },
  headerLogoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerLogoIcon: {
    marginRight: 3,
  },
  headerLogoAccent: {
    marginLeft: 3,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  signUpButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  signUpButtonText: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: 14,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroLogoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiPoweredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroTitleAccent: {
    color: '#FFD700',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  ctaIcon: {
    marginLeft: 4,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureCard: {
    width: (width - 56) / 2,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  featureGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  footerCta: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  footerCtaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footerCtaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  disclaimerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  disclaimerSection: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 16,
    color: Colors.light.gray[700],
    lineHeight: 24,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error,
    alignItems: 'center',
  },
  declineButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});