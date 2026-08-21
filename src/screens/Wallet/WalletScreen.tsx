import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { Eye, EyeOff, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import BalanceItem from '../../components/wallet/BalanceItem';
import TransactionItem from '../../components/wallet/TransactionItem';
import apiClient from '../../api/client';

export default function WalletScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Balances' | 'History'>('Balances');

  const [balances, setBalances] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalUSD, setTotalUSD] = useState('0.00');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletsRes, transRes] = await Promise.all([
        apiClient.get('/v1/wallets'),
        apiClient.get('/v1/transactions?limit=10')
      ]);

      const walletData = walletsRes.data.data;
      setBalances(walletData.map((w: any) => ({
        asset: w.asset,
        name: w.asset,
        balance: w.balance,
        available: w.available_balance,
        locked: w.locked_balance,
        usdValue: '0.00'
      })));

      setTransactions(transRes.data.data);
      setTotalUSD('0.00');
    } catch (error) {
      console.error('Failed to fetch wallet data', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.totalBalanceBox, { backgroundColor: colors.surface }]}>
        <View style={styles.totalBalanceHeader}>
          <Text style={[styles.totalBalanceLabel, { color: colors.tabIconDefault }]}>Total Balance</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            {showBalance ? <Eye size={18} color={colors.tabIconDefault} /> : <EyeOff size={18} color={colors.tabIconDefault} />}
          </TouchableOpacity>
        </View>
        <Text style={[styles.totalBalanceValue, { color: colors.text }]}>
          {showBalance ? `$${totalUSD}` : '******'}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit')}
          >
            <ArrowDownCircle color={colors.primary} size={24} />
            <Text style={[styles.actionText, { color: colors.text }]}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <ArrowUpCircle color={colors.primary} size={24} />
            <Text style={[styles.actionText, { color: colors.text }]}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setActiveTab('History')}
          >
            <History color={colors.primary} size={24} />
            <Text style={[styles.actionText, { color: colors.text }]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('Balances')}
          style={[styles.tab, activeTab === 'Balances' && { borderBottomColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'Balances' ? colors.primary : colors.tabIconDefault }]}>Balances</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('History')}
          style={[styles.tab, activeTab === 'History' && { borderBottomColor: colors.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'History' ? colors.primary : colors.tabIconDefault }]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'Balances' ? (
          balances.map((item, index) => (
            <BalanceItem
              key={index}
              asset={item.asset}
              name={item.name}
              balance={showBalance ? item.balance : '******'}
              usdValue={showBalance ? item.usdValue : '******'}
              onPress={() => navigation.navigate('Deposit', { asset: item.asset })}
            />
          ))
        ) : (
          transactions.map((item, index) => (
            <TransactionItem
              key={index}
              type={item.type}
              asset={item.asset}
              amount={item.amount}
              status={item.status}
              date={item.date}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalBalanceBox: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  totalBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  totalBalanceLabel: {
    fontSize: 14,
  },
  totalBalanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2b3139',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
});
