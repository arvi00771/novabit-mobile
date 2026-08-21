import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface TransactionItemProps {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE';
  asset: string;
  amount: string;
  status: string;
  date: string;
}

export default function TransactionItem({ type, asset, amount, status, date }: TransactionItemProps) {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft color={colors.success} size={20} />;
      case 'WITHDRAWAL':
        return <ArrowUpRight color={colors.error} size={20} />;
      default:
        return <RefreshCcw color={colors.primary} size={20} />;
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {getIcon()}
        </View>
        <View>
          <Text style={[styles.typeText, { color: colors.text }]}>{type}</Text>
          <Text style={[styles.dateText, { color: colors.tabIconDefault }]}>{date}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amountText, { color: colors.text }]}>{amount} {asset}</Text>
        <Text style={[styles.statusText, { color: status === 'CONFIRMED' ? colors.success : colors.tabIconDefault }]}>
          {status}
        </Text>
      </View>
    </View>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
