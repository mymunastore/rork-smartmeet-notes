import { safeStorage } from "@/utils/safe-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import {
  AuthUser,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  PhoneAuthCredentials,
  TwoFactorCredentials,
  SSOConfig,

  BiometricAuthResult,
} from "@/types/auth";

const AUTH_USER_KEY = "scribe-auth-user";
const AUTH_TOKEN_KEY = "scribe-auth-token";
const BIOMETRIC_ENABLED_KEY = "scribe-biometric-enabled";

// Mock authentication service
class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async loginWithEmail(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (credentials.email === "demo@example.com" && credentials.password === "password123") {
      const user: AuthUser = {
        id: "user-1",
        email: credentials.email,
        name: "Demo User",
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        provider: "email",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      return user;
    }
    
    throw new Error("Invalid credentials");
  }

  async signupWithEmail(credentials: SignupCredentials): Promise<AuthUser> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    
    const user: AuthUser = {
      id: `user-${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      phone: credentials.phone,
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    
    return user;
  }

  async loginWithPhone(credentials: PhoneAuthCredentials): Promise<AuthUser> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (credentials.verificationCode === "123456") {
      const user: AuthUser = {
        id: `user-phone-${Date.now()}`,
        email: "",
        name: "Phone User",
        phone: credentials.phoneNumber,
        emailVerified: false,
        phoneVerified: true,
        twoFactorEnabled: false,
        provider: "email",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      return user;
    }
    
    throw new Error("Invalid verification code");
  }

  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    // Simulate sending SMS
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Verification code sent to ${phoneNumber}: 123456`);
  }

  async verifyTwoFactor(credentials: TwoFactorCredentials): Promise<boolean> {
    // Simulate 2FA verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    return credentials.code === "123456" || credentials.backupCode === "backup123";
  }

  async loginWithSocial(provider: string): Promise<AuthUser> {
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user: AuthUser = {
      id: `user-${provider}-${Date.now()}`,
      email: `user@${provider}.com`,
      name: `${provider} User`,
      profilePicture: `https://ui-avatars.com/api/?name=${provider}+User&background=4A6FFF&color=fff`,
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: false,
      provider: provider as any,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    
    return user;
  }

  async loginWithSSO(config: SSOConfig): Promise<AuthUser> {
    // Simulate SSO login
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const user: AuthUser = {
      id: `user-sso-${Date.now()}`,
      email: `user@${config.domain}`,
      name: "SSO User",
      emailVerified: true,
      phoneVerified: false,
      twoFactorEnabled: true,
      provider: "sso",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    
    return user;
  }

  async logout(): Promise<void> {
    // Simulate logout
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async refreshToken(): Promise<string> {
    // Simulate token refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `token-${Date.now()}`;
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const authService = AuthService.getInstance();

  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading }));
  }, []);

  const loadStoredAuth = useCallback(async () => {
    try {
      setLoading(true);
      const [storedUser, storedToken, storedBiometric] = await Promise.all([
        safeStorage.getItem(AUTH_USER_KEY),
        safeStorage.getItem(AUTH_TOKEN_KEY),
        safeStorage.getItem(BIOMETRIC_ENABLED_KEY),
      ]);

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }

      if (storedBiometric) {
        setBiometricEnabled(JSON.parse(storedBiometric));
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [setLoading]);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const saveAuthData = useCallback(async (user: AuthUser, token: string) => {
    try {
      await Promise.all([
        safeStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
        safeStorage.setItem(AUTH_TOKEN_KEY, token),
      ]);
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  }, []);

  const clearAuthData = useCallback(async () => {
    try {
      await Promise.all([
        safeStorage.removeItem(AUTH_USER_KEY),
        safeStorage.removeItem(AUTH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }, []);

  const loginWithEmail = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.loginWithEmail(credentials);
      const token = await authService.refreshToken();
      
      await saveAuthData(user, token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, saveAuthData, setError, setLoading]);

  const signupWithEmail = useCallback(async (credentials: SignupCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.signupWithEmail(credentials);
      const token = await authService.refreshToken();
      
      await saveAuthData(user, token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Signup failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, saveAuthData, setError, setLoading]);

  const loginWithPhone = useCallback(async (credentials: PhoneAuthCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.loginWithPhone(credentials);
      const token = await authService.refreshToken();
      
      await saveAuthData(user, token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Phone login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, saveAuthData, setError, setLoading]);

  const sendPhoneVerification = useCallback(async (phoneNumber: string) => {
    try {
      setError(null);
      await authService.sendPhoneVerification(phoneNumber);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification";
      setError(errorMessage);
      throw error;
    }
  }, [authService, setError]);

  const loginWithSocial = useCallback(async (provider: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.loginWithSocial(provider);
      const token = await authService.refreshToken();
      
      await saveAuthData(user, token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Social login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, saveAuthData, setError, setLoading]);

  const loginWithSSO = useCallback(async (config: SSOConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await authService.loginWithSSO(config);
      const token = await authService.refreshToken();
      
      await saveAuthData(user, token);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "SSO login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authService, saveAuthData, setError, setLoading]);

  const authenticateWithBiometrics = useCallback(async (): Promise<BiometricAuthResult> => {
    try {
      if (Platform.OS === 'web') {
        return { success: false, error: "Biometric authentication not available on web" };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: "Biometric hardware not available" };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: false, error: "No biometric data enrolled" };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometryType = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) 
        ? 'FaceID' 
        : supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ? 'Fingerprint'
        : 'TouchID';

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your account",
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
      });

      if (result.success) {
        return { success: true, biometryType };
      } else {
        return { success: false, error: result.error || "Authentication failed" };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Biometric authentication failed" 
      };
    }
  }, []);

  const enableBiometricAuth = useCallback(async () => {
    try {
      const result = await authenticateWithBiometrics();
      if (result.success) {
        setBiometricEnabled(true);
        await safeStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(true));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to enable biometric auth:", error);
      return false;
    }
  }, [authenticateWithBiometrics]);

  const disableBiometricAuth = useCallback(async () => {
    try {
      setBiometricEnabled(false);
      await safeStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(false));
    } catch (error) {
      console.error("Failed to disable biometric auth:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      await clearAuthData();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }, [authService, clearAuthData, setLoading]);

  const verifyTwoFactor = useCallback(async (credentials: TwoFactorCredentials) => {
    try {
      setError(null);
      const isValid = await authService.verifyTwoFactor(credentials);
      if (!isValid) {
        throw new Error("Invalid 2FA code");
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "2FA verification failed";
      setError(errorMessage);
      throw error;
    }
  }, [authService, setError]);

  return {
    ...authState,
    biometricEnabled,
    loginWithEmail,
    signupWithEmail,
    loginWithPhone,
    sendPhoneVerification,
    loginWithSocial,
    loginWithSSO,
    authenticateWithBiometrics,
    enableBiometricAuth,
    disableBiometricAuth,
    verifyTwoFactor,
    logout,
    setError,
  };
});