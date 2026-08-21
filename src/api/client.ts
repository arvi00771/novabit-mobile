import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { clearTokens, getStoredTokens, saveTokens } from './authStorage';

/**
 * Native builds must point to the publicly reachable, TLS-protected API origin.
 * Metro/device localhost is intentionally not used: it points at the phone/emulator,
 * not at the exchange backend.
 */
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
export const API_BASE_URL = configuredApiUrl || (Platform.OS === 'web' ? '/api/v1' : '');
export const isApiConfigured = API_BASE_URL.length > 0;
export const apiConfigurationMessage =
  'This build has no API endpoint. Set EXPO_PUBLIC_API_URL to the public HTTPS API URL ending in /api/v1 before distributing it.';

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean };
let refreshRequest: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!isApiConfigured) return null;
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const tokens = await getStoredTokens();
    if (!tokens) return null;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: tokens.refreshToken,
      }, { timeout: 20_000, headers: { 'Content-Type': 'application/json' } });
      const data = response.data?.data;
      if (!data?.access_token || !data?.refresh_token) throw new Error('Invalid refresh response');
      await saveTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
      return data.access_token as string;
    } catch {
      await clearTokens();
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

apiClient.interceptors.request.use(async (config) => {
  if (!isApiConfigured) {
    return Promise.reject(new Error(apiConfigurationMessage));
  }

  const tokens = await getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;
    const requestPath = config?.url || '';
    const isAuthRequest = requestPath.includes('/auth/login') || requestPath.includes('/auth/refresh');

    if (error.response?.status !== 401 || !config || config._retried || isAuthRequest) {
      return Promise.reject(error);
    }

    config._retried = true;
    const accessToken = await refreshAccessToken();
    if (!accessToken) return Promise.reject(error);

    config.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(config);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: { message?: string }; message?: string } | undefined;
    return payload?.error?.message || payload?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default apiClient;
