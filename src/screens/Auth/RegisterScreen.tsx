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
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // Placeholder for real API call
      // await apiClient.post('/auth/register', data);

      // Mock registration
      setTimeout(async () => {
        await login('mock-token-from-register');
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollInner}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Join NovaBit Exchange today
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

          <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>
            Confirm Password
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.confirmPassword ? colors.error : colors.border,
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
          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.tabIconDefault }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollInner: {
    flexGrow: 1,
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
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
});
