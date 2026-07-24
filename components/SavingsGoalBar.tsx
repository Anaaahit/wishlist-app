import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SavingsGoalBarProps {
  price: number;
  targetPrice: number;
  currency: string;
}

export function SavingsGoalBar({ price, targetPrice, currency }: SavingsGoalBarProps) {
  const trackColor = useThemeColor({}, 'progressTrack');
  const accent = useThemeColor({}, 'accent');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const progress = Math.min(price / targetPrice, 1);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: accent,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: textSecondary }]}>
        {currency}{price.toLocaleString()} / {currency}{targetPrice.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
