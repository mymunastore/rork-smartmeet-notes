import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Brain, FileText, Shield, CheckCircle, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Mic color={Colors.light.primary} size={32} />,
    title: 'Meeting Recording',
    description: 'Record meetings and calls with crystal clear audio quality'
  },
  {
    icon: <FileText color={Colors.light.nature.ocean} size={32} />,
    title: 'Smart Transcription',
    description: 'Accurate speech-to-text conversion in multiple languages'
  },
  {
    icon: <Brain color={Colors.light.nature.coral} size={32} />,
    title: 'AI Summaries',
    description: 'Get intelligent summaries and key insights from your recordings'
  },
  {
    icon: <Shield color={Colors.light.nature.sage} size={32} />,
    title: 'Secure & Private',
    description: 'All data stored locally on your device with encryption'
  },
];

export default function HomePage() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    checkDisclaimerStatus();
  }, []);

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

  const handleLogin = () => {
    // TODO: Navigate to login screen when implemented
    console.log('Login pressed');
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign up screen when implemented
    console.log('Sign up pressed');
  };

  const renderFeature = (feature: Feature, index: number) => (
    <View key={index} style={styles.featureCard}>
      <View style={styles.featureIcon}>
        {feature.icon}
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🌿 SCRIBE</Text>
            <View style={styles.aiPoweredBadge}>
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
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>

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
              <CheckCircle color={Colors.light.success} size={20} />
              <Text style={styles.benefitText}>Save hours of manual note-taking</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle color={Colors.light.success} size={20} />
              <Text style={styles.benefitText}>Never miss important action items</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle color={Colors.light.success} size={20} />
              <Text style={styles.benefitText}>Searchable meeting history</Text>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle color={Colors.light.success} size={20} />
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
            <Text style={styles.ctaButtonText}>Start Recording Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  loginButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  signUpButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.primary,
    marginRight: 12,
  },
  aiPoweredBadge: {
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiPoweredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: Colors.light.primary,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.light.gray[600],
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  ctaButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
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
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  footerCtaSubtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
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