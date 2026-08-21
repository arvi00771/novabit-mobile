import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import apiClient, { getApiErrorMessage } from '../../api/client';

interface OrderFormProps { pair: string; baseAsset: string; quoteAsset: string; onOrderPlaced?: () => void; }

export default function OrderForm({ pair, baseAsset, quoteAsset, onOrderPlaced }: OrderFormProps) {
  const { colors } = useTheme();
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitOrder = async () => {
    if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', `Enter a ${baseAsset} amount greater than zero.`);
      return;
    }
    if (type === 'LIMIT' && (!/^\d+(\.\d+)?$/.test(price) || Number(price) <= 0)) {
      Alert.alert('Invalid price', `Enter a ${quoteAsset} price greater than zero.`);
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/orders', {
        pair, side, type, quantity: amount,
        ...(type === 'LIMIT' ? { price } : {}),
        time_in_force: 'GTC',
      });
      setAmount('');
      if (type === 'LIMIT') setPrice('');
      Alert.alert('Order submitted', `${side} ${baseAsset} order submitted successfully.`);
      onOrderPlaced?.();
    } catch (error) {
      Alert.alert('Order rejected', getApiErrorMessage(error, 'The order could not be submitted.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.sideSelector, { backgroundColor: colors.surface }]}>
        <TouchableOpacity accessibilityRole="button" style={[styles.sideButton, side === 'BUY' && { backgroundColor: colors.success }]} onPress={() => setSide('BUY')}>
          <Text style={[styles.sideButtonText, { color: side === 'BUY' ? '#fff' : colors.tabIconDefault }]}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={[styles.sideButton, side === 'SELL' && { backgroundColor: colors.error }]} onPress={() => setSide('SELL')}>
          <Text style={[styles.sideButtonText, { color: side === 'SELL' ? '#fff' : colors.tabIconDefault }]}>SELL</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.typeSelector}>
        {(['LIMIT', 'MARKET'] as const).map((orderType) => (
          <TouchableOpacity key={orderType} onPress={() => setType(orderType)}><Text style={[styles.typeText, { color: type === orderType ? colors.primary : colors.tabIconDefault }]}>{orderType}</Text></TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Price</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={type === 'MARKET' ? 'Market price' : price} onChangeText={setPrice} editable={type === 'LIMIT'} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.tabIconDefault} />
        <Text style={[styles.unit, { color: colors.tabIconDefault }]}>{quoteAsset}</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Amount</Text>
        <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.tabIconDefault} />
        <Text style={[styles.unit, { color: colors.tabIconDefault }]}>{baseAsset}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" style={[styles.submitButton, { backgroundColor: side === 'BUY' ? colors.success : colors.error }, submitting && styles.disabled]} onPress={submitOrder} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{side} {baseAsset}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 }, sideSelector: { flexDirection: 'row', borderRadius: 5, padding: 2, marginBottom: 15 }, sideButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 5 },
  sideButtonText: { fontWeight: 'bold', fontSize: 14 }, typeSelector: { flexDirection: 'row', gap: 20, marginBottom: 15 }, typeText: { fontSize: 12, fontWeight: '600' },
  inputContainer: { position: 'relative', marginBottom: 10 }, label: { fontSize: 12, marginBottom: 5 }, input: { height: 40, borderWidth: 1, borderRadius: 5, paddingLeft: 10, paddingRight: 60, fontSize: 14 },
  unit: { position: 'absolute', right: 10, bottom: 12, fontSize: 12 }, submitButton: { height: 45, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, disabled: { opacity: 0.6 }, submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
