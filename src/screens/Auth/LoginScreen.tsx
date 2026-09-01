import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fingerprint } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient, { apiConfigurationMessage, getApiErrorMessage, isApiConfigured } from '../../api/client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login, isBiometricsEnabled, authenticateWithBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    if (!isApiConfigured) {
      Alert.alert('Configuration required', apiConfigurationMessage);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const result = response.data?.data;
      if (result?.require_2fa) {
        navigation.navigate('TwoFactor', { email: data.email, password: data.password });
        return;
      }
      if (!result?.access_token || !result?.refresh_token) {
        throw new Error('The server returned an invalid sign-in response.');
      }
      await login({ accessToken: result.access_token, refreshToken: result.refresh_token });
    } catch (error) {
      Alert.alert('Login failed', getApiErrorMessage(error, 'Unable to sign in. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (!success) {
      Alert.alert('Biometric sign-in unavailable', 'Use your email and password, or enable biometrics after signing in.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>NovaBit</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Sign in to your account</Text>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.email ? colors.error : colors.border }]}
              onBlur={onBlur} onChangeText={onChange} value={value} placeholder="email@example.com"
              placeholderTextColor={colors.tabIconDefault} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          )} />
          {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email.message}</Text>}
          <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Password</Text>
          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.password ? colors.error : colors.border }]}
              onBlur={onBlur} onChangeText={onChange} value={value} placeholder="••••••••"
              placeholderTextColor={colors.tabIconDefault} secureTextEntry autoComplete="current-password" />
          )} />
          {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text>}
          <TouchableOpacity accessibilityRole="button" style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>Log In</Text>}
          </TouchableOpacity>
          {isBiometricsEnabled && (
            <TouchableOpacity accessibilityRole="button" style={[styles.biometricButton, { borderColor: colors.border }]} onPress={handleBiometricAuth} disabled={loading}>
              <Fingerprint color={colors.text} size={24} /><Text style={[styles.biometricText, { color: colors.text }]}>Unlock with Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={{ color: colors.tabIconDefault }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={{ color: colors.primary, fontWeight: 'bold' }}>Register</Text></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' }, subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' }, label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 50, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 }, errorText: { fontSize: 12, marginTop: 4 },
  loginButton: { height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }, disabled: { opacity: 0.6 },
  loginButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' }, biometricButton: { height: 50, borderRadius: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  biometricText: { marginLeft: 10, fontSize: 16, fontWeight: '600' }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
});
