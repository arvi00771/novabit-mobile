import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient, { getApiErrorMessage } from '../../api/client';

export default function TwoFactorScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { email, password } = route.params || {};

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your authenticator app.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Sign in again', 'Your sign-in session expired. Please enter your email and password again.');
      navigation.replace('Login');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password, totp_code: code });
      const result = response.data?.data;
      if (!result?.access_token || !result?.refresh_token) {
        throw new Error('The verification response was invalid.');
      }
      await login({ accessToken: result.access_token, refreshToken: result.refresh_token });
    } catch (error) {
      Alert.alert('Verification failed', getApiErrorMessage(error, 'The verification code was not accepted.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>Two-factor verification</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Enter the 6-digit code from your authenticator app.</Text>
        <View style={styles.form}>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            onChangeText={(value) => setCode(value.replace(/\D/g, ''))} value={code} placeholder="000000"
            placeholderTextColor={colors.tabIconDefault} keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} autoFocus />
          <TouchableOpacity accessibilityRole="button" style={[styles.verifyButton, { backgroundColor: colors.primary }, loading && styles.disabled]} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}><Text style={[styles.cancelButtonText, { color: colors.tabIconDefault }]}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, inner: { flex: 1, padding: 24, justifyContent: 'center' }, title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, marginTop: 10 }, form: { width: '100%' },
  input: { height: 60, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, fontSize: 24, textAlign: 'center', letterSpacing: 10 },
  verifyButton: { height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }, disabled: { opacity: 0.6 },
  verifyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' }, cancelButton: { marginTop: 20, alignItems: 'center' }, cancelButtonText: { fontSize: 14, fontWeight: '600' },
});
