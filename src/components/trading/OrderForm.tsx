import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function OrderForm() {
  const { colors } = useTheme();
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.sideSelector}>
        <TouchableOpacity
          style={[styles.sideButton, side === 'BUY' && { backgroundColor: colors.success }]}
          onPress={() => setSide('BUY')}
        >
          <Text style={[styles.sideButtonText, side === 'BUY' ? { color: '#fff' } : { color: colors.tabIconDefault }]}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideButton, side === 'SELL' && { backgroundColor: colors.error }]}
          onPress={() => setSide('SELL')}
        >
          <Text style={[styles.sideButtonText, side === 'SELL' ? { color: '#fff' } : { color: colors.tabIconDefault }]}>SELL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        {['LIMIT', 'MARKET'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setType(t as any)}>
            <Text style={[
              styles.typeText,
              { color: type === t ? colors.primary : colors.tabIconDefault }
            ]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Price</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={type === 'MARKET' ? 'Market Price' : price}
          onChangeText={setPrice}
          editable={type === 'LIMIT'}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.tabIconDefault}
        />
        <Text style={[styles.unit, { color: colors.tabIconDefault }]}>USDT</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.tabIconDefault}
        />
        <Text style={[styles.unit, { color: colors.tabIconDefault }]}>BTC</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: side === 'BUY' ? colors.success : colors.error }]}
        onPress={() => {}}
      >
        <Text style={styles.submitButtonText}>{side} BTC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  sideSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e2329',
    borderRadius: 5,
    padding: 2,
    marginBottom: 15,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 5,
  },
  sideButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 45,
    fontSize: 14,
  },
  unit: {
    position: 'absolute',
    right: 10,
    bottom: 12,
    fontSize: 12,
  },
  submitButton: {
    height: 45,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
