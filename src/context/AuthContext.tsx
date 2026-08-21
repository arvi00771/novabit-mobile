import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import apiClient from '../api/client';

const TOKEN_KEY = 'novabit_auth_token';
const BIOMETRICS_ENABLED_KEY = 'novabit_biometrics_enabled';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
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
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const biometricsEnabled = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);

      if (storedToken) {
        setToken(storedToken);
      }

      setIsBiometricsEnabled(biometricsEnabled === 'true');
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  const enableBiometrics = async () => {
    await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
    setIsBiometricsEnabled(true);
  };

  const disableBiometrics = async () => {
    await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
    setIsBiometricsEnabled(false);
  };

  const authenticateWithBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with biometrics',
      fallbackLabel: 'Use passcode',
    });

    return result.success;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
