import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import apiClient from '../api/client';
import {
  ACCESS_TOKEN_KEY,
  AuthTokens,
  BIOMETRICS_ENABLED_KEY,
  clearTokens,
  getStoredTokens,
  saveTokens,
} from '../api/authStorage';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  isBiometricsEnabled: boolean;
  authenticateWithBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  useEffect(() => {
    void loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedTokens, biometricsSetting] = await Promise.all([
        getStoredTokens(),
        SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY),
      ]);
      const biometricsEnabled = biometricsSetting === 'true';
      setIsBiometricsEnabled(biometricsEnabled);

      // When quick unlock is enabled, do not expose a session until the OS has
      // confirmed the user locally. Otherwise restore the persisted session.
      if (storedTokens && !biometricsEnabled) {
        setToken(storedTokens.accessToken);
      }
    } catch (error) {
      console.error('Failed to restore auth state', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (tokens: AuthTokens) => {
    await saveTokens(tokens);
    setToken(tokens.accessToken);
  };

  const logout = async () => {
    try {
      const tokens = await getStoredTokens();
      if (tokens?.refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: tokens.refreshToken });
      }
    } catch {
      // Local sign-out must still succeed if the device is offline.
    } finally {
      await clearTokens();
      setToken(null);
    }
  };

  const enableBiometrics = async (): Promise<boolean> => {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm biometric quick unlock',
      fallbackLabel: 'Use device passcode',
      disableDeviceFallback: false,
    });
    if (!result.success) return false;

    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
    setIsBiometricsEnabled(true);
    return true;
  };

  const disableBiometrics = async () => {
    await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
    setIsBiometricsEnabled(false);
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    const tokens = await getStoredTokens();
    if (!tokens) return false;

    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock NovaBit',
      fallbackLabel: 'Use device passcode',
      disableDeviceFallback: false,
    });
    if (!result.success) return false;

    setToken(tokens.accessToken);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        logout,
        enableBiometrics,
        disableBiometrics,
        isBiometricsEnabled,
        authenticateWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
