import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fingerprint } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login, isBiometricsEnabled, authenticateWithBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // Placeholder for real API call
      // const response = await apiClient.post('/auth/login', data);

      // Mock logic: if email is '2fa@example.com', navigate to TwoFactor
      setTimeout(async () => {
        setLoading(false);
        if (data.email === '2fa@example.com') {
          navigation.navigate('TwoFactor', { email: data.email });
        } else {
          await login('mock-token');
        }
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      // In a real app, you might use a refresh token or a saved token
      // For this demo, we'll just log in
      await login('mock-token-from-biometrics');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>NovaBit</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Sign in to your account
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.email ? colors.error : colors.border,
                  },
                ]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="email@example.com"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.email.message}
            </Text>
          )}

          <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.password ? colors.error : colors.border,
                  },
                ]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="••••••••"
                placeholderTextColor={colors.tabIconDefault}
                secureTextEntry
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.password.message}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {isBiometricsEnabled && (
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.border }]}
              onPress={handleBiometricAuth}
            >
              <Fingerprint color={colors.text} size={24} />
              <Text style={[styles.biometricText, { color: colors.text }]}>
                Sign in with Biometrics
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.tabIconDefault }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  biometricButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
});
