import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ChevronDown, CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';



export default function WithdrawScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const [supportedCoins, setSupportedCoins] = useState<any[]>([]);
  const [asset, setAsset] = useState(route.params?.asset || 'BTC');
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (supportedCoins.length > 0) {
      const coin = supportedCoins.find(c => c.asset === asset) || supportedCoins[0];
      setSelectedCoin(coin);
      fetchWithdrawalHistory();
    }
  }, [asset, supportedCoins]);

  const fetchInitialData = async () => {
    try {
      const [coinsRes, walletsRes] = await Promise.all([
        apiClient.get('/v1/wallets/coins'),
        apiClient.get('/v1/wallets')
      ]);

      const coins = coinsRes.data.data;
      const wallets = walletsRes.data.data;

      const mergedCoins = coins.map((coin: any) => {
        const wallet = wallets.find((w: any) => w.asset === coin.asset);
        return {
          ...coin,
          available: wallet ? wallet.available_balance : '0.00'
        };
      });

      setSupportedCoins(mergedCoins);
    } catch (error) {
      console.error('Failed to fetch initial withdrawal data', error);
      // Fallback
      setSupportedCoins([
        { asset: 'BTC', name: 'Bitcoin', min_withdrawal_amount: '0.001', withdrawal_fee: '0.0005', available: '0.00', network: 'BTC' },
        { asset: 'ETH', name: 'Ethereum', min_withdrawal_amount: '0.01', withdrawal_fee: '0.005', available: '0.00', network: 'ERC20' },
      ]);
    }
  };

  const fetchWithdrawalHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await apiClient.get(`/v1/wallets/withdrawals?asset=${asset}`);
      setWithdrawalHistory(response.data.data);
      setHistoryLoading(false);
    } catch (error) {
      console.error(error);
      setHistoryLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address) {
      Alert.alert('Error', 'Please enter a withdrawal address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) < parseFloat(selectedCoin.min_withdrawal_amount)) {
      Alert.alert('Error', `Minimum withdrawal is ${selectedCoin.min_withdrawal_amount} ${selectedCoin.asset}`);
      return;
    }
    if (parseFloat(amount) > parseFloat(selectedCoin.available)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    if (totpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit 2FA code');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/v1/wallets/withdraw', {
        asset: selectedCoin.asset,
        amount,
        address,
        network: selectedCoin.network,
        totp_code: totpCode
      });

      setLoading(false);
      Alert.alert('Success', 'Withdrawal request submitted', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Withdrawal Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  const renderHistoryItem = (item: any) => (
    <View key={item.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
      <View style={styles.historyLeft}>
        <Text style={[styles.historyAmount, { color: colors.text }]}>{item.amount} {item.asset}</Text>
        <Text style={[styles.historyAddress, { color: colors.tabIconDefault }]}>{item.address}</Text>
        <Text style={[styles.historyDate, { color: colors.tabIconDefault }]}>{item.date}</Text>
      </View>
      <View style={styles.historyRight}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? colors.success + '20' : colors.surface }]}>
          {item.status === 'COMPLETED' ?
            <CheckCircle2 size={12} color={colors.success} /> :
            <Clock size={12} color={colors.tabIconDefault} />
          }
          <Text style={[styles.statusText, { color: item.status === 'COMPLETED' ? colors.success : colors.tabIconDefault }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!selectedCoin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Coin Selector */}
          <TouchableOpacity
            style={[styles.coinSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowCoinPicker(true)}
          >
            <View style={styles.coinInfo}>
              <View style={[styles.coinIcon, { backgroundColor: colors.primary }]}>
                <Text style={styles.coinIconText}>{selectedCoin.asset[0]}</Text>
              </View>
              <View>
                <Text style={[styles.coinName, { color: colors.text }]}>{selectedCoin.name}</Text>
                <Text style={[styles.availableSub, { color: colors.tabIconDefault }]}>Available: {selectedCoin.available} {selectedCoin.asset}</Text>
              </View>
            </View>
            <ChevronDown color={colors.tabIconDefault} size={20} />
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Withdrawal Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={address}
                onChangeText={setAddress}
                placeholder={`Paste ${selectedCoin.asset} address`}
                placeholderTextColor={colors.tabIconDefault}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <TouchableOpacity onPress={() => setAmount(selectedCoin.available)}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>MAX</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWithAction}>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={`Min ${selectedCoin.min_withdrawal_amount}`}
                  placeholderTextColor={colors.tabIconDefault}
                  keyboardType="numeric"
                />
                <Text style={[styles.inputUnit, { color: colors.text }]}>{selectedCoin.asset}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>2FA Verification Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={totpCode}
                onChangeText={setTotpCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={[styles.feeBox, { backgroundColor: colors.surface }]}>
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, { color: colors.tabIconDefault }]}>Network Fee</Text>
                <Text style={[styles.feeValue, { color: colors.text }]}>{selectedCoin.withdrawal_fee} {selectedCoin.asset}</Text>
              </View>
              <View style={[styles.feeRow, { marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
                <Text style={[styles.receiveLabel, { color: colors.text }]}>You will receive</Text>
                <Text style={[styles.receiveValue, { color: colors.primary }]}>
                  {amount && parseFloat(amount) > parseFloat(selectedCoin.withdrawal_fee) ?
                    (parseFloat(amount) - parseFloat(selectedCoin.withdrawal_fee)).toFixed(8).replace(/\.?0+$/, "") :
                    '0.00'} {selectedCoin.asset}
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <AlertTriangle size={16} color="#F0B90B" />
              <Text style={styles.warningText}>
                Ensure the address is correct and supports the network. Transfers cannot be undone.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>Withdraw {selectedCoin.asset}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Withdrawal History */}
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Withdrawal History</Text>
            {historyLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : withdrawalHistory.length > 0 ? (
              withdrawalHistory.map((item) => renderHistoryItem(item))
            ) : (
              <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No recent withdrawals</Text>
            )}
          </View>
        </View>

        {/* Coin Picker Modal */}
        <Modal
          visible={showCoinPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCoinPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Coin</Text>
                <TouchableOpacity onPress={() => setShowCoinPicker(false)}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
              {supportedCoins.map((coin) => (
                <TouchableOpacity
                  key={coin.asset}
                  style={[styles.coinOption, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setAsset(coin.asset);
                    setShowCoinPicker(false);
                  }}
                >
                  <View style={[styles.coinIcon, { backgroundColor: colors.primary }]}>
                    <Text style={styles.coinIconText}>{coin.asset[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.coinOptionName, { color: colors.text }]}>{coin.name}</Text>
                    <Text style={[styles.coinOptionSymbol, { color: colors.tabIconDefault }]}>{coin.asset} • Available: {coin.available}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  coinSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 25,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  coinIconText: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  coinName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  availableSub: {
    fontSize: 12,
    marginTop: 2,
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  inputWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputUnit: {
    position: 'absolute',
    right: 15,
    fontWeight: 'bold',
    fontSize: 14,
  },
  feeBox: {
    padding: 15,
    borderRadius: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
  },
  feeValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  receiveLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiveValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#F0B90B20',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#F0B90B',
    lineHeight: 16,
  },
  submitButton: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historySection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  historyLeft: {
    gap: 4,
    flex: 1,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  historyDate: {
    fontSize: 11,
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
