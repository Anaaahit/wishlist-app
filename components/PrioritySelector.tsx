import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PRIORITY_CONFIG, Priority } from '@/types/wishlist';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  const priorities: Priority[] = ['low', 'medium', 'high'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: text }]}>Priority</Text>
      <View style={styles.row}>
        {priorities.map((p) => {
          const config = PRIORITY_CONFIG[p];
          const isSelected = value === p;
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? config.color + '18' : surface,
                  borderColor: isSelected ? config.color : border,
                },
              ]}
              onPress={() => onChange(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipIcon, { color: config.color }]}>{config.icon}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  { color: isSelected ? config.color : text },
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
