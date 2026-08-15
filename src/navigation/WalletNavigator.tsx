import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../screens/Wallet/WalletScreen';
import DepositScreen from '../screens/Wallet/DepositScreen';
import WithdrawScreen from '../screens/Wallet/WithdrawScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function WalletNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="WalletMain"
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Stack.Screen
        name="Deposit"
        component={DepositScreen}
        options={{ title: 'Deposit' }}
      />
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{ title: 'Withdraw' }}
      />
    </Stack.Navigator>
  );
}
