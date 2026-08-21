import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface OrderBookItem {
  price: string;
  amount: string;
  total: string;
}

interface OrderBookProps {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
}

export default function OrderBook({ bids, asks }: OrderBookProps) {
  const { colors } = useTheme();

  const renderItem = (item: OrderBookItem, type: 'bid' | 'ask') => {
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, { color: type === 'bid' ? colors.success : colors.error }]}>
          {parseFloat(item.price).toFixed(2)}
        </Text>
        <Text style={[styles.cell, { color: colors.text, textAlign: 'right' }]}>
          {parseFloat(item.amount).toFixed(4)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.tabIconDefault }]}>Price (USDT)</Text>
        <Text style={[styles.headerText, { color: colors.tabIconDefault, textAlign: 'right' }]}>Amount (BTC)</Text>
      </View>
      <View style={styles.booksContainer}>
        <View style={styles.book}>
          {asks.slice(0, 10).reverse().map((ask, index) => (
            <React.Fragment key={`ask-${index}`}>
              {renderItem(ask, 'ask')}
            </React.Fragment>
          ))}
          <View style={styles.spreadContainer}>
            <Text style={[styles.spreadText, { color: colors.text }]}>
              {parseFloat(asks[0]?.price || '0') - parseFloat(bids[0]?.price || '0') > 0
                ? (parseFloat(asks[0]?.price) - parseFloat(bids[0]?.price)).toFixed(2)
                : '0.00'}
            </Text>
          </View>
          {bids.slice(0, 10).map((bid, index) => (
            <React.Fragment key={`bid-${index}`}>
              {renderItem(bid, 'bid')}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  booksContainer: {
    flex: 1,
  },
  book: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cell: {
    fontSize: 13,
    flex: 1,
    fontFamily: 'monospace',
  },
  spreadContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 5,
    borderColor: '#333',
  },
  spreadText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
