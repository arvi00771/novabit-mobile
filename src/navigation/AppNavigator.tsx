import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import TwoFactorScreen from '../screens/Auth/TwoFactorScreen';
import TabNavigator from './TabNavigator';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
