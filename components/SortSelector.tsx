import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SortOption } from '@/types/wishlist';
import { Ionicons } from '@expo/vector-icons';

interface SortSelectorProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'date', label: 'Newest', icon: 'time-outline' },
  { key: 'price-asc', label: 'Price ↑', icon: 'trending-up-outline' },
  { key: 'price-desc', label: 'Price ↓', icon: 'trending-down-outline' },
  { key: 'priority', label: 'Priority', icon: 'flag-outline' },
];

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const textSecondary = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.container}>
      {SORT_OPTIONS.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? accent : surface,
                borderColor: isSelected ? accent : border,
              },
            ]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={opt.icon as any}
              size={14}
              color={isSelected ? '#FFFFFF' : textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: isSelected ? '#FFFFFF' : textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
