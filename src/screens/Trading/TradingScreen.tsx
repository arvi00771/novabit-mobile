import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import OrderBook from '../../components/trading/OrderBook';
import TradingChart from '../../components/trading/TradingChart';
import OrderForm from '../../components/trading/OrderForm';
import TradeHistory from '../../components/trading/TradeHistory';

export default function TradingScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'Chart' | 'OrderBook' | 'Trades'>('Chart');

  // Mock data states
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    // Initial mock data
    const initialBids = Array.from({ length: 15 }, (_, i) => ({
      price: (60000 - i * 10).toString(),
      amount: (Math.random() * 0.5).toString(),
      total: '0'
    }));
    const initialAsks = Array.from({ length: 15 }, (_, i) => ({
      price: (60050 + i * 10).toString(),
      amount: (Math.random() * 0.5).toString(),
      total: '0'
    }));
    const initialTrades = Array.from({ length: 20 }, (_, i) => ({
      price: (60000 + (Math.random() - 0.5) * 100).toString(),
      amount: (Math.random() * 0.1).toString(),
      time: new Date().toLocaleTimeString().split(' ')[0],
      side: Math.random() > 0.5 ? 'BUY' : 'SELL' as any
    }));

    setBids(initialBids);
    setAsks(initialAsks);
    setTrades(initialTrades);

    // Mock WebSocket updates
    const interval = setInterval(() => {
      setBids(prev => {
        const newBids = [...prev];
        const index = Math.floor(Math.random() * 10);
        newBids[index] = {
          ...newBids[index],
          amount: (parseFloat(newBids[index].amount) + (Math.random() - 0.5) * 0.1).toFixed(4)
        };
        return newBids;
      });

      setAsks(prev => {
        const newAsks = [...prev];
        const index = Math.floor(Math.random() * 10);
        newAsks[index] = {
          ...newAsks[index],
          amount: (parseFloat(newAsks[index].amount) + (Math.random() - 0.5) * 0.1).toFixed(4)
        };
        return newAsks;
      });

      if (Math.random() > 0.7) {
        setTrades(prev => [
          {
            price: (60000 + (Math.random() - 0.5) * 100).toFixed(2),
            amount: (Math.random() * 0.1).toFixed(4),
            time: new Date().toLocaleTimeString().split(' ')[0],
            side: Math.random() > 0.5 ? 'BUY' : 'SELL'
          },
          ...prev.slice(0, 19)
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.pairText, { color: colors.text }]}>BTC/USDT</Text>
        <Text style={[styles.priceText, { color: colors.success }]}>60,024.50</Text>
        <Text style={[styles.changeText, { color: colors.success }]}>+2.45%</Text>
      </View>

      <View style={styles.mainSection}>
        <View style={styles.tradingSection}>
          <OrderForm />
        </View>

        <View style={styles.dataSection}>
          <View style={styles.tabs}>
            {(['Chart', 'OrderBook', 'Trades'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.tabIconDefault }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Chart' && <TradingChart />}
          {activeTab === 'OrderBook' && <OrderBook bids={bids} asks={asks} />}
          {activeTab === 'Trades' && <TradeHistory trades={trades} />}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  pairText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
  },
  changeText: {
    fontSize: 14,
  },
  mainSection: {
    flexDirection: 'column',
  },
  tradingSection: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3139',
  },
  dataSection: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2b3139',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
