import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  Check,
  AlertCircle,
  Fingerprint,
  Building,
} from 'lucide-react-native';
import { LoginCredentials, SignupCredentials } from '@/types/auth';

type AuthMode = 'login' | 'signup' | 'phone' | 'sso';

export default function AuthScreen() {
  const { colors: theme } = useTheme();
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithPhone,
    sendPhoneVerification,
    loginWithSocial,
    loginWithSSO,
    authenticateWithBiometrics,
    biometricEnabled,
    isLoading,
    error,
    setError,
  } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState<boolean>(false);
  const [ssoStep, setSsoStep] = useState<'domain' | 'auth'>('domain');

  // Form states
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [signupForm, setSignupForm] = useState<SignupCredentials>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    acceptTerms: false,
  });

  const [phoneForm, setPhoneForm] = useState({
    phoneNumber: '',
    verificationCode: '',
  });

  const [ssoForm, setSsoForm] = useState({
    domain: '',
    provider: 'microsoft',
  });

  const handleLogin = useCallback(async () => {
    try {
      setError(null);
      if (!loginForm.email || !loginForm.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      await loginWithEmail(loginForm);
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, [loginForm, loginWithEmail, setError]);

  const handleSignup = useCallback(async () => {
    try {
      setError(null);
      if (!signupForm.email || !signupForm.password || !signupForm.name) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (!signupForm.acceptTerms) {
        Alert.alert('Error', 'Please accept the terms and conditions');
        return;
      }

      await signupWithEmail(signupForm);
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  }, [signupForm, signupWithEmail, setError]);

  const handlePhoneAuth = useCallback(async () => {
    try {
      setError(null);
      if (!phoneVerificationSent) {
        if (!phoneForm.phoneNumber) {
          Alert.alert('Error', 'Please enter your phone number');
          return;
        }
        await sendPhoneVerification(phoneForm.phoneNumber);
        setPhoneVerificationSent(true);
        Alert.alert('Success', 'Verification code sent to your phone');
      } else {
        if (!phoneForm.verificationCode) {
          Alert.alert('Error', 'Please enter the verification code');
          return;
        }
        await loginWithPhone({
          phoneNumber: phoneForm.phoneNumber,
          verificationCode: phoneForm.verificationCode,
        });
        router.replace('/(tabs)/notes');
      }
    } catch (error) {
      console.error('Phone auth failed:', error);
    }
  }, [phoneForm, phoneVerificationSent, sendPhoneVerification, loginWithPhone, setError]);

  const handleSocialLogin = useCallback(async (provider: string) => {
    try {
      setError(null);
      await loginWithSocial(provider);
      router.replace('/(tabs)/notes');
    } catch (error) {
      console.error('Social login failed:', error);
    }
  }, [loginWithSocial, setError]);

  const handleSSOLogin = useCallback(async () => {
    try {
      setError(null);
      if (ssoStep === 'domain') {
        if (!ssoForm.domain) {
          Alert.alert('Error', 'Please enter your organization domain');
          return;
        }
        setSsoStep('auth');
      } else {
        await loginWithSSO({
          domain: ssoForm.domain,
          provider: ssoForm.provider,
          clientId: 'demo-client-id',
        });
        router.replace('/(tabs)/notes');
      }
    } catch (error) {
      console.error('SSO login failed:', error);
    }
  }, [ssoForm, ssoStep, loginWithSSO, setError]);

  const handleBiometricAuth = useCallback(async () => {
    try {
      const result = await authenticateWithBiometrics();
      if (result.success) {
        router.replace('/(tabs)/notes');
      } else {
        Alert.alert('Authentication Failed', result.error || 'Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric auth failed:', error);
    }
  }, [authenticateWithBiometrics]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.appTitle, { color: theme.text }]}>Scribe</Text>
              <Text style={[styles.appSubtitle, { color: theme.gray[600] }]}>
                Your AI-powered note companion
              </Text>
            </View>

            <View style={styles.authModeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.authModeScroll}>
                {[
                  { key: 'login', label: 'Sign In' },
                  { key: 'signup', label: 'Sign Up' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'sso', label: 'SSO' },
                ].map((mode) => (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.authModeButton,
                      {
                        backgroundColor: authMode === mode.key ? theme.primary : 'transparent',
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => {
                      setAuthMode(mode.key as AuthMode);
                      setError(null);
                      setPhoneVerificationSent(false);
                      setSsoStep('domain');
                    }}
                  >
                    <Text
                      style={[
                        styles.authModeText,
                        {
                          color: authMode === mode.key ? 'white' : theme.text,
                        },
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {error && (
              <BlurView intensity={80} style={styles.errorContainer}>
                <AlertCircle size={20} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </BlurView>
            )}

            <View style={styles.formContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'signup' && 'Create Account'}
                {authMode === 'phone' && 'Phone Authentication'}
                {authMode === 'sso' && 'Enterprise SSO'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.gray[600] }]}>
                {authMode === 'login' && 'Sign in to continue to your account'}
                {authMode === 'signup' && 'Sign up to get started with your account'}
                {authMode === 'phone' && (phoneVerificationSent 
                  ? 'Enter the verification code sent to your phone'
                  : 'Enter your phone number to receive a verification code')}
                {authMode === 'sso' && (ssoStep === 'domain'
                  ? 'Enter your organization domain to continue'
                  : 'Redirecting to your organization login page...')}
              </Text>

              {/* Login Form */}
              {authMode === 'login' && (
                <>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Email address"
                      placeholderTextColor={theme.gray[600]}
                      value={loginForm.email}
                      onChangeText={(text) => setLoginForm(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Password"
                      placeholderTextColor={theme.gray[600]}
                      value={loginForm.password}
                      onChangeText={(text) => setLoginForm(prev => ({ ...prev, password: text }))}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={theme.gray[600]} />
                      ) : (
                        <Eye size={20} color={theme.gray[600]} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setLoginForm(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                    >
                      <View style={[styles.checkbox, { borderColor: theme.border }]}>
                        {loginForm.rememberMe && <Check size={16} color={theme.primary} />}
                      </View>
                      <Text style={[styles.checkboxText, { color: theme.gray[600] }]}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <Text style={[styles.linkText, { color: theme.primary }]}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  {biometricEnabled && Platform.OS !== 'web' && (
                    <TouchableOpacity
                      style={[styles.biometricButton, { borderColor: theme.border }]}
                      onPress={handleBiometricAuth}
                    >
                      <Fingerprint size={24} color={theme.primary} />
                      <Text style={[styles.biometricText, { color: theme.text }]}>Use Biometric</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Signup Form */}
              {authMode === 'signup' && (
                <>
                  <View style={styles.inputContainer}>
                    <User size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Full name"
                      placeholderTextColor={theme.gray[600]}
                      value={signupForm.name}
                      onChangeText={(text) => setSignupForm(prev => ({ ...prev, name: text }))}
                      autoComplete="name"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Mail size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Email address"
                      placeholderTextColor={theme.gray[600]}
                      value={signupForm.email}
                      onChangeText={(text) => setSignupForm(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Phone size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Phone number (optional)"
                      placeholderTextColor={theme.gray[600]}
                      value={signupForm.phone}
                      onChangeText={(text) => setSignupForm(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Password"
                      placeholderTextColor={theme.gray[600]}
                      value={signupForm.password}
                      onChangeText={(text) => setSignupForm(prev => ({ ...prev, password: text }))}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={theme.gray[600]} />
                      ) : (
                        <Eye size={20} color={theme.gray[600]} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Lock size={20} color={theme.gray[600]} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Confirm password"
                      placeholderTextColor={theme.gray[600]}
                      value={signupForm.confirmPassword}
                      onChangeText={(text) => setSignupForm(prev => ({ ...prev, confirmPassword: text }))}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={theme.gray[600]} />
                      ) : (
                        <Eye size={20} color={theme.gray[600]} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setSignupForm(prev => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
                  >
                    <View style={[styles.checkbox, { borderColor: theme.border }]}>
                      {signupForm.acceptTerms && <Check size={16} color={theme.primary} />}
                    </View>
                    <Text style={[styles.checkboxText, { color: theme.gray[600] }]}>
                      I agree to the{' '}
                      <Text style={{ color: theme.primary }}>Terms of Service</Text> and{' '}
                      <Text style={{ color: theme.primary }}>Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={handleSignup}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Phone Form */}
              {authMode === 'phone' && (
                <>
                  {!phoneVerificationSent ? (
                    <View style={styles.inputContainer}>
                      <Phone size={20} color={theme.gray[600]} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        placeholder="+1 (555) 123-4567"
                        placeholderTextColor={theme.gray[600]}
                        value={phoneForm.phoneNumber}
                        onChangeText={(text) => setPhoneForm(prev => ({ ...prev, phoneNumber: text }))}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                      />
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <Lock size={20} color={theme.gray[600]} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        placeholder="123456"
                        placeholderTextColor={theme.gray[600]}
                        value={phoneForm.verificationCode}
                        onChangeText={(text) => setPhoneForm(prev => ({ ...prev, verificationCode: text }))}
                        keyboardType="numeric"
                        maxLength={6}
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={handlePhoneAuth}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {phoneVerificationSent ? 'Verify Code' : 'Send Code'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {phoneVerificationSent && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => {
                        setPhoneVerificationSent(false);
                        setPhoneForm(prev => ({ ...prev, verificationCode: '' }));
                      }}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Change Number</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* SSO Form */}
              {authMode === 'sso' && (
                <>
                  {ssoStep === 'domain' && (
                    <>
                      <View style={styles.inputContainer}>
                        <Building size={20} color={theme.gray[600]} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                          placeholder="company.com"
                          placeholderTextColor={theme.gray[600]}
                          value={ssoForm.domain}
                          onChangeText={(text) => setSsoForm(prev => ({ ...prev, domain: text }))}
                          keyboardType="url"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.ssoProviderContainer}>
                        <Text style={[styles.ssoProviderLabel, { color: theme.gray[600] }]}>SSO Provider:</Text>
                        <View style={styles.ssoProviderButtons}>
                          {['microsoft', 'google', 'okta', 'auth0'].map((provider) => (
                            <TouchableOpacity
                              key={provider}
                              style={[
                                styles.ssoProviderButton,
                                {
                                  backgroundColor: ssoForm.provider === provider ? theme.primary : 'transparent',
                                  borderColor: theme.border,
                                },
                              ]}
                              onPress={() => setSsoForm(prev => ({ ...prev, provider }))}
                            >
                              <Text
                                style={[
                                  styles.ssoProviderText,
                                  {
                                    color: ssoForm.provider === provider ? 'white' : theme.text,
                                  },
                                ]}
                              >
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                    onPress={handleSSOLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {ssoStep === 'domain' ? 'Continue' : 'Authenticating...'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {ssoStep === 'auth' && (
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => setSsoStep('domain')}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Back</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Social Login */}
            {(authMode === 'login' || authMode === 'signup') && (
              <View style={styles.socialContainer}>
                <Text style={[styles.dividerText, { color: theme.gray[600] }]}>Or continue with</Text>
                
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={[styles.socialButton, { borderColor: theme.border }]}
                    onPress={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { borderColor: theme.border }]}
                    onPress={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { borderColor: theme.border }]}
                    onPress={() => handleSocialLogin('microsoft')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Microsoft</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.gray[600] }]}>
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity
                onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              >
                <Text style={[styles.footerLink, { color: theme.primary }]}>
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  authModeContainer: {
    marginBottom: 30,
  },
  authModeScroll: {
    flexGrow: 0,
  },
  authModeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  authModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FF6B6B20',
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 30,
  },
  dividerText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ssoProviderContainer: {
    marginBottom: 20,
  },
  ssoProviderLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  ssoProviderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ssoProviderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  ssoProviderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});