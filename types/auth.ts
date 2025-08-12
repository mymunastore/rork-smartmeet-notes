export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  provider: 'email' | 'google' | 'apple' | 'facebook' | 'microsoft' | 'github' | 'sso';
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface PhoneAuthCredentials {
  phoneNumber: string;
  verificationCode?: string;
}

export interface TwoFactorCredentials {
  code: string;
  backupCode?: string;
}

export interface SSOConfig {
  domain: string;
  provider: string;
  clientId: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export type AuthMethod = 'email' | 'phone' | 'social' | 'sso' | 'biometric';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: 'TouchID' | 'FaceID' | 'Fingerprint' | 'None';
}