import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function TwoFactorScreen() {
  const { colors: theme } = useTheme();
  const { verifyTwoFactor, isLoading, error, setError } = useAuth();
  
  const [code, setCode] = useState<string>('');
  const [backupCode, setBackupCode] = useState<string>('');
  const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = useCallback(async () => {
    try {
      setError(null);
      
      if (!useBackupCode && !code) {
        Alert.alert('Error', 'Please enter the 6-digit code');
        return;
      }
      
      if (useBackupCode && !backupCode) {
        Alert.alert('Error', 'Please enter your backup code');
        return;
      }

      await verifyTwoFactor({
        code: useBackupCode ? '' : code,
        backupCode: useBackupCode ? backupCode : undefined,
      });
      
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.error('2FA verification failed:', error);
    }
  }, [code, backupCode, useBackupCode, verifyTwoFactor, setError]);

  const handleResendCode = useCallback(() => {
    setTimeLeft(30);
    Alert.alert('Code Sent', 'A new verification code has been sent to your device');
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <Shield size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Two-Factor Authentication</Text>
            <Text style={[styles.subtitle, { color: theme.gray[600] }]}>
              {useBackupCode 
                ? 'Enter your backup recovery code'
                : 'Enter the 6-digit code from your authenticator app'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!useBackupCode ? (
            <View style={styles.codeContainer}>
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                  },
                ]}
                placeholder="000000"
                placeholderTextColor={theme.gray[600]}
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"


                autoFocus
              />
              
              <View style={styles.timerContainer}>
                <Text style={[styles.timerText, { color: theme.gray[600] }]}>
                  Code expires in {formatTime(timeLeft)}
                </Text>
                
                {timeLeft === 0 && (
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendCode}
                  >
                    <RefreshCw size={16} color={theme.primary} />
                    <Text style={[styles.resendText, { color: theme.primary }]}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.backupContainer}>
              <TextInput
                style={[
                  styles.backupInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                  },
                ]}
                placeholder="Enter backup code"
                placeholderTextColor={theme.gray[600]}
                value={backupCode}
                onChangeText={setBackupCode}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: theme.primary }]}
            onPress={handleVerify}
            disabled={isLoading || (!code && !backupCode)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setBackupCode('');
              setError(null);
            }}
          >
            <Text style={[styles.switchButtonText, { color: theme.primary }]}>
              {useBackupCode 
                ? 'Use authenticator code instead'
                : 'Use backup recovery code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Text style={[styles.helpTitle, { color: theme.text }]}>Need help?</Text>
            <Text style={[styles.helpText, { color: theme.gray[600] }]}>
              • Make sure your device&apos;s time is correct{'\n'}
              • Check your authenticator app for the latest code{'\n'}
              • Contact support if you&apos;ve lost access to your device
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#FF6B6B20',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 14,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeInput: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    marginBottom: 10,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  backupContainer: {
    marginBottom: 30,
  },
  backupInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  verifyButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 30,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpContainer: {
    marginTop: 'auto',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});