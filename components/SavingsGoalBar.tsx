import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SavingsGoalBarProps {
  savedAmount: number;
  targetPrice: number;
  currency: string;
}

export function SavingsGoalBar({ savedAmount, targetPrice, currency }: SavingsGoalBarProps) {
  const trackColor = useThemeColor({}, 'progressTrack');
  const accent = useThemeColor({}, 'accent');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const success = useThemeColor({}, 'success');

  const progress = Math.min(savedAmount / targetPrice, 1);
  const remaining = Math.max(targetPrice - savedAmount, 0);
  const isComplete = savedAmount >= targetPrice;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: isComplete ? success : accent,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: textSecondary }]}>
          Saved {currency}{savedAmount.toLocaleString()} of {currency}{targetPrice.toLocaleString()}
        </Text>
        {!isComplete && (
          <Text style={[styles.remaining, { color: textSecondary }]}>
            {currency}{remaining.toLocaleString()} left
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  label: {
    fontSize: 11,
  },
  remaining: {
    fontSize: 11,
    fontWeight: '600',
  },
});
