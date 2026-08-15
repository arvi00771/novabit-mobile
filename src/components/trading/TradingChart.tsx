import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
interface Kline { time: number; close: string }

export default function TradingChart({ data }: { data: Kline[] }) {
  const { colors } = useTheme();
  if (!data.length) {
    return <Text style={{ color: colors.tabIconDefault, textAlign: 'center', marginVertical: 36 }}>Loading chart data…</Text>;
  }

  const chartData = data.map((point, index) => ({
    value: Number(point.close),
    label: index === 0 || index === data.length - 1 ? new Date(point.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  })).filter((point) => Number.isFinite(point.value));

  if (!chartData.length) return null;
  return (
    <View style={{ marginVertical: 20 }}>
      <LineChart data={chartData} width={screenWidth - 28} height={200} color={colors.primary} thickness={2} noOfSections={4}
        yAxisColor={colors.border} xAxisColor={colors.border} yAxisTextStyle={{ color: colors.tabIconDefault, fontSize: 10 }} xAxisTextStyle={{ color: colors.tabIconDefault, fontSize: 10 }}
        hideDataPoints isAnimated areaChart startFillColor={colors.primary} startOpacity={0.4} endFillColor={colors.primary} endOpacity={0.1} curved />
    </View>
  );
}
