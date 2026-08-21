import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '../../context/ThemeContext';
import apiClient, { apiConfigurationMessage, getApiErrorMessage, isApiConfigured } from '../../api/client';

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ email, password }: RegisterForm) => {
    if (!isApiConfigured) {
      Alert.alert('Configuration required', apiConfigurationMessage);
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password });
      Alert.alert('Account created', 'Your account was created. Sign in to continue.', [
        { text: 'Log in', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error) {
      Alert.alert('Registration failed', getApiErrorMessage(error, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name: keyof RegisterForm, label: string, secure = false, email = false) => <>
    <Text style={[styles.label, { color: colors.text, marginTop: label === 'Email' ? 0 : 15 }]}>{label}</Text>
    <Controller control={control} name={name} render={({ field: { onChange, onBlur, value } }) => (
      <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors[name] ? colors.error : colors.border }]}
        onBlur={onBlur} onChangeText={onChange} value={value} placeholder={email ? 'email@example.com' : '••••••••'}
        placeholderTextColor={colors.tabIconDefault} secureTextEntry={secure} autoCapitalize="none"
        keyboardType={email ? 'email-address' : 'default'} autoComplete={email ? 'email' : 'new-password'} />
    )} />
    {errors[name] && <Text style={[styles.errorText, { color: colors.error }]}>{errors[name]?.message}</Text>}
  </>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Join NovaBit Exchange</Text>
        <View style={styles.form}>
          {renderInput('email', 'Email', false, true)}
          {renderInput('password', 'Password', true)}
          {renderInput('confirmPassword', 'Confirm Password', true)}
          <TouchableOpacity accessibilityRole="button" style={[styles.registerButton, { backgroundColor: colors.primary }, loading && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerButtonText}>Register</Text>}
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={{ color: colors.tabIconDefault }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={{ color: colors.primary, fontWeight: 'bold' }}>Log In</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scrollInner: { flexGrow: 1, padding: 24, justifyContent: 'center' }, title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 }, form: { width: '100%' }, label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { height: 50, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 }, errorText: { fontSize: 12, marginTop: 4 },
  registerButton: { height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }, disabled: { opacity: 0.6 },
  registerButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
});
