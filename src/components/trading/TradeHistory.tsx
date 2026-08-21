import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TradeItem {
  price: string;
  amount: string;
  time: string;
  side: 'BUY' | 'SELL';
}

interface TradeHistoryProps {
  trades: TradeItem[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: TradeItem }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { color: item.side === 'BUY' ? colors.success : colors.error }]}>
        {parseFloat(item.price).toFixed(2)}
      </Text>
      <Text style={[styles.cell, { color: colors.text, textAlign: 'center' }]}>
        {parseFloat(item.amount).toFixed(4)}
      </Text>
      <Text style={[styles.cell, { color: colors.tabIconDefault, textAlign: 'right' }]}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.tabIconDefault }]}>Price</Text>
        <Text style={[styles.headerText, { color: colors.tabIconDefault, textAlign: 'center' }]}>Amount</Text>
        <Text style={[styles.headerText, { color: colors.tabIconDefault, textAlign: 'right' }]}>Time</Text>
      </View>
      <FlatList
        data={trades}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 12,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  cell: {
    fontSize: 13,
    flex: 1,
    fontFamily: 'monospace',
  },
});
