import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Mic, 
  Brain, 
  FileText, 
  FolderOpen, 
  ChevronRight, 
  ChevronLeft,
  Search,
  CheckCircle
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

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
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
  },
  skipButtonText: {
    color: Colors.light.gray[600],
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 80,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.gray[300],
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
    width: 24,
  },
  stepsContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  stepsWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  stepContainer: {
    width: width,
    flex: 1,
  },
  stepContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  demoSection: {
    paddingVertical: 30,
  },
  demoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // Recording Demo Styles
  recordingDemo: {
    alignItems: 'center',
    gap: 20,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 50,
  },
  waveformBar: {
    width: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
    opacity: 0.7,
  },
  recordingTime: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  // Transcription Demo Styles
  transcriptionDemo: {
    gap: 16,
  },
  transcriptHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  transcriptDate: {
    fontSize: 14,
    color: Colors.light.gray[500],
    marginTop: 4,
  },
  transcriptContent: {
    gap: 12,
  },
  transcriptLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  speaker: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    minWidth: 50,
  },
  transcriptText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.gray[400],
  },
  // Summary Demo Styles
  summaryDemo: {
    gap: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  summarySection: {
    gap: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    paddingLeft: 8,
  },
  // Project Demo Styles
  projectDemo: {
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: Colors.light.gray[500],
  },
  projectList: {
    gap: 12,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  projectCount: {
    fontSize: 14,
    color: Colors.light.gray[500],
    marginTop: 2,
  },
  // Features Section
  featuresSection: {
    paddingVertical: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 22,
  },
  // Navigation
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  previousButton: {
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.gray[600],
  },
  navButtonTextDisabled: {
    color: Colors.light.gray[400],
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  demoComponent?: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Record Meetings & Calls',
    subtitle: 'Crystal Clear Audio Capture',
    description: 'Start recording with a single tap. Our advanced audio processing ensures every word is captured clearly, even in noisy environments.',
    icon: <Mic color={Colors.light.primary} size={48} />,
    features: [
      'One-tap recording start/stop',
      'Background recording support',
      'Noise cancellation technology',
      'Multiple audio format support'
    ],
    demoComponent: (
      <View style={styles.demoContainer}>
        <View style={styles.recordingDemo}>
          <View style={styles.recordButton}>
            <Mic color="#FFFFFF" size={32} />
          </View>
          <View style={styles.waveformContainer}>
            {[...Array(8)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: Math.random() * 40 + 10 }
                ]}
              />
            ))}
          </View>
          <Text style={styles.recordingTime}>02:34</Text>
        </View>
      </View>
    )
  },
  {
    id: 2,
    title: 'Access & Manage Transcriptions',
    subtitle: 'Smart Text Conversion',
    description: 'View accurate transcriptions of your recordings with speaker identification, timestamps, and easy editing capabilities.',
    icon: <FileText color={Colors.light.nature.ocean} size={48} />,
    features: [
      'Real-time transcription',
      'Speaker identification',
      'Timestamp markers',
      'Edit and correct text',
      'Multi-language support'
    ],
    demoComponent: (
      <View style={styles.demoContainer}>
        <View style={styles.transcriptionDemo}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Meeting Transcript</Text>
            <Text style={styles.transcriptDate}>Today, 2:30 PM</Text>
          </View>
          <View style={styles.transcriptContent}>
            <View style={styles.transcriptLine}>
              <Text style={styles.speaker}>John:</Text>
              <Text style={styles.transcriptText}>Let&apos;s discuss the quarterly results...</Text>
              <Text style={styles.timestamp}>2:31</Text>
            </View>
            <View style={styles.transcriptLine}>
              <Text style={styles.speaker}>Sarah:</Text>
              <Text style={styles.transcriptText}>The numbers look promising this quarter...</Text>
              <Text style={styles.timestamp}>2:33</Text>
            </View>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 3,
    title: 'AI-Generated Summaries',
    subtitle: 'Intelligent Insights',
    description: 'Get comprehensive summaries with key points, action items, and important decisions automatically extracted from your recordings.',
    icon: <Brain color={Colors.light.nature.coral} size={48} />,
    features: [
      'Automatic key point extraction',
      'Action item identification',
      'Decision tracking',
      'Sentiment analysis',
      'Custom summary formats'
    ],
    demoComponent: (
      <View style={styles.demoContainer}>
        <View style={styles.summaryDemo}>
          <View style={styles.summaryHeader}>
            <Brain color={Colors.light.nature.coral} size={24} />
            <Text style={styles.summaryTitle}>AI Summary</Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Key Points:</Text>
            <Text style={styles.summaryText}>• Q4 revenue exceeded targets by 15%</Text>
            <Text style={styles.summaryText}>• New product launch scheduled for March</Text>
          </View>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Action Items:</Text>
            <Text style={styles.summaryText}>• John to prepare budget proposal</Text>
            <Text style={styles.summaryText}>• Sarah to coordinate with marketing team</Text>
          </View>
        </View>
      </View>
    )
  },
  {
    id: 4,
    title: 'Manage Projects & Notes',
    subtitle: 'Organized Workspace',
    description: 'Organize your recordings and notes into projects. Search, filter, and export your content with powerful management tools.',
    icon: <FolderOpen color={Colors.light.nature.sage} size={48} />,
    features: [
      'Project-based organization',
      'Advanced search & filtering',
      'Tag and categorize notes',
      'Export to multiple formats',
      'Backup and sync options'
    ],
    demoComponent: (
      <View style={styles.demoContainer}>
        <View style={styles.projectDemo}>
          <View style={styles.searchBar}>
            <Search color={Colors.light.gray[500]} size={20} />
            <Text style={styles.searchPlaceholder}>Search notes...</Text>
          </View>
          <View style={styles.projectList}>
            <View style={styles.projectItem}>
              <FolderOpen color={Colors.light.primary} size={20} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>Team Meetings</Text>
                <Text style={styles.projectCount}>12 recordings</Text>
              </View>
            </View>
            <View style={styles.projectItem}>
              <FolderOpen color={Colors.light.nature.ocean} size={20} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>Client Calls</Text>
                <Text style={styles.projectCount}>8 recordings</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Animate slide transition
      Animated.timing(slideAnim, {
        toValue: -nextStep * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Animate slide transition
      Animated.timing(slideAnim, {
        toValue: -prevStep * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    Animated.timing(slideAnim, {
      toValue: -stepIndex * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <ScrollView 
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon and Title */}
        <View style={styles.stepHeader}>
          <View style={styles.iconContainer}>
            {step.icon}
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {/* Demo Component */}
        {step.demoComponent && (
          <View style={styles.demoSection}>
            {step.demoComponent}
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you can do:</Text>
          {step.features.map((feature, featureIndex) => (
            <View key={featureIndex} style={styles.featureItem}>
              <CheckCircle color={Colors.light.success} size={16} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {onboardingSteps.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.progressDot,
            index === currentStep && styles.progressDotActive
          ]}
          onPress={() => goToStep(index)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome to Scribe AI</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        <Animated.View
          style={[
            styles.stepsWrapper,
            {
              transform: [{ translateX: slideAnim }],
              width: width * onboardingSteps.length,
            }
          ]}
        >
          {onboardingSteps.map(renderStep)}
        </Animated.View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.previousButton,
            currentStep === 0 && styles.navButtonDisabled
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft 
            color={currentStep === 0 ? Colors.light.gray[400] : Colors.light.gray[600]} 
            size={24} 
          />
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled
          ]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}