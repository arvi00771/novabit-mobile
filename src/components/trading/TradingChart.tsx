import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function TradingChart() {
  const { colors } = useTheme();

  // Mock data for the chart
  const data = [
    {value: 58000, label: '08:00'},
    {value: 58200},
    {value: 58100},
    {value: 58500},
    {value: 59000, label: '12:00'},
    {value: 58800},
    {value: 59200},
    {value: 59500},
    {value: 59300},
    {value: 60000, label: '16:00'},
    {value: 59800},
    {value: 60200},
    {value: 60500},
    {value: 60300},
    {value: 61000, label: '20:00'},
  ];

  return (
    <View style={{ marginVertical: 20 }}>
      <LineChart
        data={data}
        width={screenWidth - 20}
        height={200}
        color={colors.primary}
        thickness={2}
        noOfSections={4}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        yAxisTextStyle={{color: colors.tabIconDefault, fontSize: 10}}
        xAxisTextStyle={{color: colors.tabIconDefault, fontSize: 10}}
        hideDataPoints
        isAnimated
        areaChart
        startFillColor={colors.primary}
        startOpacity={0.4}
        endFillColor={colors.primary}
        endOpacity={0.1}
        curved
      />
    </View>
  );
}
