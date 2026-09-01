import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import OrderBook from '../../components/trading/OrderBook';
import TradingChart from '../../components/trading/TradingChart';
import OrderForm from '../../components/trading/OrderForm';
import TradeHistory from '../../components/trading/TradeHistory';
import apiClient from '../../api/client';

const PAIR = 'BTCUSDT';
type OrderBookItem = { price: string; amount: string; total: string };
type TradeItem = { price: string; amount: string; time: string; side: 'BUY' | 'SELL' };
type Kline = { time: number; close: string };

export default function TradingScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'Chart' | 'OrderBook' | 'Trades'>('Chart');
  const [bids, setBids] = useState<OrderBookItem[]>([]);
  const [asks, setAsks] = useState<OrderBookItem[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [klines, setKlines] = useState<Kline[]>([]);
  const [price, setPrice] = useState('--');
  const [change, setChange] = useState('--');
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const loadMarket = useCallback(async () => {
    const [ticker, book, recentTrades, chart] = await Promise.allSettled([
      apiClient.get(`/market/ticker/${PAIR}`),
      apiClient.get(`/market/orderbook/${PAIR}?depth=20`),
      apiClient.get(`/market/trades/${PAIR}?limit=20`),
      apiClient.get(`/market/klines/${PAIR}?interval=1h&limit=30`),
    ]);
    const unavailable: string[] = [];

    if (ticker.status === 'fulfilled') {
      const data = ticker.value.data?.data;
      setPrice(data?.last_price ? Number(data.last_price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--');
      setChange(data?.change_percent_24h ? `${Number(data.change_percent_24h).toFixed(2)}%` : '--');
    } else unavailable.push('ticker');

    if (book.status === 'fulfilled') {
      const data = book.value.data?.data;
      setBids((data?.bids || []).map((item: any) => ({ price: String(item.price), amount: String(item.quantity), total: String(item.total ?? '') })));
      setAsks((data?.asks || []).map((item: any) => ({ price: String(item.price), amount: String(item.quantity), total: String(item.total ?? '') })));
    } else unavailable.push('order book');

    if (recentTrades.status === 'fulfilled') {
      setTrades((recentTrades.value.data?.data || []).map((item: any) => ({
        price: String(item.price), amount: String(item.quantity),
        time: new Date(item.trade_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        side: item.taker_side === 'SELL' ? 'SELL' : 'BUY',
      })));
    } else unavailable.push('recent trades');

    if (chart.status === 'fulfilled') {
      setKlines(chart.value.data?.data || []);
    } else unavailable.push('chart');

    setErrors(unavailable);
  }, []);

  useEffect(() => { void loadMarket(); }, [loadMarket]);
  const onRefresh = async () => { setRefreshing(true); await loadMarket(); setRefreshing(false); };
  const changeColor = change.startsWith('-') ? colors.error : colors.success;
  const activeDataUnavailable = (activeTab === 'Chart' && errors.includes('chart')) || (activeTab === 'OrderBook' && errors.includes('order book')) || (activeTab === 'Trades' && errors.includes('recent trades'));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={[styles.pairText, { color: colors.text }]}>BTC/USDT</Text>
        <Text style={[styles.priceText, { color: change.startsWith('-') ? colors.error : colors.success }]}>{price}</Text>
        <Text style={[styles.changeText, { color: changeColor }]}>{change}</Text>
      </View>
      {errors.length > 0 && <Text style={[styles.error, { color: colors.error }]}>Some live market data is unavailable ({errors.join(', ')}). Pull down to retry.</Text>}
      <View style={[styles.tradingSection, { borderBottomColor: colors.border }]}><OrderForm pair={PAIR} baseAsset="BTC" quoteAsset="USDT" onOrderPlaced={loadMarket} /></View>
      <View style={styles.dataSection}>
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {(['Chart', 'OrderBook', 'Trades'] as const).map((tab) => <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}><Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.tabIconDefault }]}>{tab}</Text></TouchableOpacity>)}
        </View>
        {activeDataUnavailable ? <Text style={[styles.empty, { color: colors.tabIconDefault }]}>This market data is unavailable right now.</Text> : <>
          {activeTab === 'Chart' && <TradingChart data={klines} />}
          {activeTab === 'OrderBook' && (bids.length || asks.length ? <OrderBook bids={bids} asks={asks} /> : <ActivityIndicator color={colors.primary} style={styles.loader} />)}
          {activeTab === 'Trades' && (trades.length ? <TradeHistory trades={trades} /> : <Text style={[styles.empty, { color: colors.tabIconDefault }]}>No recent trades</Text>)}
        </>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { padding: 15, flexDirection: 'row', alignItems: 'baseline', gap: 10 }, pairText: { fontSize: 20, fontWeight: 'bold' }, priceText: { fontSize: 18, fontWeight: '600' }, changeText: { fontSize: 14 },
  error: { paddingHorizontal: 15, paddingBottom: 10, fontSize: 13 }, tradingSection: { borderBottomWidth: 1 }, dataSection: { flex: 1 }, tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' }, tabText: { fontSize: 14, fontWeight: 'bold' }, loader: { marginVertical: 40 }, empty: { textAlign: 'center', marginVertical: 30 },
});
