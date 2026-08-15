import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { LogOut, Shield, Moon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout, isBiometricsEnabled, enableBiometrics, disableBiometrics } = useAuth();

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const enabled = await enableBiometrics();
      if (!enabled) {
        Alert.alert('Biometrics unavailable', 'Enroll Face ID, Touch ID, or fingerprint in your device settings before enabling quick unlock.');
      }
    } else {
      await disableBiometrics();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>PREFERENCES</Text>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Moon color={colors.text} size={20} />
            <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Shield color={colors.text} size={20} />
            <Text style={[styles.rowText, { color: colors.text }]}>Biometric Auth</Text>
          </View>
          <Switch
            value={isBiometricsEnabled}
            onValueChange={handleToggleBiometrics}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderTopColor: colors.border, borderBottomColor: colors.border }]}
        onPress={handleLogout}
      >
        <LogOut color={colors.error} size={20} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
