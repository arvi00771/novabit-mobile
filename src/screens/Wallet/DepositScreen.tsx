import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Copy, Share2, ChevronDown, CheckCircle2, Clock } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';



export default function DepositScreen({ route }: any) {
  const { colors } = useTheme();
  const [supportedCoins, setSupportedCoins] = useState<any[]>([]);
  const [asset, setAsset] = useState(route.params?.asset || 'BTC');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [showCoinPicker, setShowShowCoinPicker] = useState(false);

  useEffect(() => {
    fetchSupportedCoins();
  }, []);

  useEffect(() => {
    if (supportedCoins.length > 0) {
      fetchData();
    }
  }, [asset, supportedCoins]);

  const fetchSupportedCoins = async () => {
    try {
      const response = await apiClient.get('/v1/wallets/coins');
      setSupportedCoins(response.data.data);
      if (!route.params?.asset && response.data.data.length > 0) {
        setAsset(response.data.data[0].asset);
      }
    } catch (error) {
      console.error('Failed to fetch supported coins', error);
      // Fallback if API fails
      setSupportedCoins([
        { asset: 'BTC', name: 'Bitcoin', network: 'BTC' },
        { asset: 'ETH', name: 'Ethereum', network: 'ERC20' },
        { asset: 'USDT', name: 'Tether', network: 'TRC20' },
        { asset: 'SOL', name: 'Solana', network: 'SOL' },
      ]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchDepositAddress(), fetchDepositHistory()]);
    setLoading(false);
  };

  const fetchDepositAddress = async () => {
    try {
      const response = await apiClient.get(`/v1/wallets/deposit/address/${asset}`);
      setAddress(response.data.data.address);
      setNetwork(response.data.data.network);
    } catch (error) {
      console.error('Failed to fetch deposit address', error);
      setAddress('Error fetching address');
    }
  };

  const fetchDepositHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await apiClient.get(`/v1/transactions?type=DEPOSIT&asset=${asset}`);
      setDepositHistory(response.data.data);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Failed to fetch deposit history', error);
      setHistoryLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const shareAddress = async () => {
    try {
      await Share.share({
        message: address,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderHistoryItem = ({ item }: any) => (
    <View style={[styles.historyItem, { borderBottomColor: colors.border }]}>
      <View style={styles.historyLeft}>
        <Text style={[styles.historyAmount, { color: colors.text }]}>{item.amount} {asset}</Text>
        <Text style={[styles.historyDate, { color: colors.tabIconDefault }]}>{item.date}</Text>
      </View>
      <View style={styles.historyRight}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'CONFIRMED' ? colors.success + '20' : colors.surface }]}>
          {item.status === 'CONFIRMED' ?
            <CheckCircle2 size={12} color={colors.success} /> :
            <Clock size={12} color={colors.tabIconDefault} />
          }
          <Text style={[styles.statusText, { color: item.status === 'CONFIRMED' ? colors.success : colors.tabIconDefault }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Coin Selector */}
        <TouchableOpacity
          style={[styles.coinSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowShowCoinPicker(true)}
        >
          <View style={styles.coinInfo}>
            <View style={[styles.coinIcon, { backgroundColor: colors.primary }]}>
              <Text style={styles.coinIconText}>{asset[0]}</Text>
            </View>
            <Text style={[styles.coinName, { color: colors.text }]}>{asset}</Text>
          </View>
          <ChevronDown color={colors.tabIconDefault} size={20} />
        </TouchableOpacity>

        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Only send {asset} to this address. Sending any other coin may result in permanent loss.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <>
            <View style={[styles.qrContainer, { backgroundColor: '#fff' }]}>
              <QRCode value={address} size={180} />
            </View>

            <View style={[styles.addressContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.addressLabel, { color: colors.tabIconDefault }]}>Deposit Address ({network})</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                  <Copy color={colors.primary} size={20} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={shareAddress}>
                  <Share2 color={colors.primary} size={20} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
            • Minimum deposit: 0.0001 {asset}
          </Text>
          <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
            • 2 network confirmations required
          </Text>
        </View>

        {/* Deposit History */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Deposit History</Text>
          {historyLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : depositHistory.length > 0 ? (
            depositHistory.map((item) => (
              <React.Fragment key={item.id}>
                {renderHistoryItem({ item })}
              </React.Fragment>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No recent deposits</Text>
          )}
        </View>
      </View>

      {/* Coin Picker Modal */}
      <Modal
        visible={showCoinPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShowCoinPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Coin</Text>
              <TouchableOpacity onPress={() => setShowShowCoinPicker(false)}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
            {supportedCoins.map((coin) => (
              <TouchableOpacity
                key={coin.asset}
                style={[styles.coinOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setAsset(coin.asset);
                  setShowShowCoinPicker(false);
                }}
              >
                <View style={[styles.coinIcon, { backgroundColor: colors.primary }]}>
                  <Text style={styles.coinIconText}>{coin.asset[0]}</Text>
                </View>
                <View>
                  <Text style={[styles.coinOptionName, { color: colors.text }]}>{coin.name}</Text>
                  <Text style={[styles.coinOptionSymbol, { color: colors.tabIconDefault }]}>{coin.asset}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  coinSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinIconText: {
    fontWeight: 'bold',
    color: '#000',
  },
  coinName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  qrContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  addressContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
  },
  historySection: {
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyLeft: {
    gap: 4,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
  },
  historyRight: {
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  coinOptionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  coinOptionSymbol: {
    fontSize: 12,
  },
});
