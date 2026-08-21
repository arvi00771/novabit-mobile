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
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function TwoFactorScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = route.params || {};

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Mock verification
      setTimeout(async () => {
        await login('mock-token-after-2fa');
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Verification Failed', 'The code you entered is incorrect');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.text }]}>2FA Verification</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Enter the 6-digit code from your authenticator app
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            onChangeText={setCode}
            value={code}
            placeholder="000000"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: colors.primary }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.tabIconDefault }]}>
              Cancel
            </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  form: {
    width: '100%',
  },
  input: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
  verifyButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
