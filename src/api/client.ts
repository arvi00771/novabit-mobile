import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000/api'; // This will be configurable

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('novabit_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle unauthorized (e.g., logout)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
