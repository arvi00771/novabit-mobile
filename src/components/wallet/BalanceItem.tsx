import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface BalanceItemProps {
  asset: string;
  name: string;
  balance: string;
  usdValue: string;
  onPress: () => void;
}

export default function BalanceItem({ asset, name, balance, usdValue, onPress }: BalanceItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={[styles.iconPlaceholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.iconText, { color: colors.text }]}>{asset[0]}</Text>
        </View>
        <View>
          <Text style={[styles.assetText, { color: colors.text }]}>{asset}</Text>
          <Text style={[styles.nameText, { color: colors.tabIconDefault }]}>{name}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.balanceText, { color: colors.text }]}>{balance}</Text>
        <Text style={[styles.usdText, { color: colors.tabIconDefault }]}>≈ ${usdValue}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  assetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  usdText: {
    fontSize: 12,
  },
});
