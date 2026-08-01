import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TodoItem } from '@/types/todo';
import { PRIORITY_CONFIG } from '@/types/wishlist';

interface CompletedTodoCardProps {
  item: TodoItem;
  onPress: () => void;
}

export function CompletedTodoCard({ item, onPress }: CompletedTodoCardProps) {
  const surface = useThemeColor({}, 'surface');
  const textDimmed = useThemeColor({}, 'textDimmed');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  const priorityConfig = PRIORITY_CONFIG[item.priority];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkCircle, { borderColor: success, backgroundColor: success + '20' }]}>
        <Ionicons name="checkmark" size={14} color={success} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: textDimmed }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.priorityDot, { color: priorityConfig.color }]}>
            {priorityConfig.icon}
          </Text>
        </View>
        <Text style={[styles.date, { color: textSecondary }]}>
          {item.completedAt
            ? `Completed ${new Date(item.completedAt).toLocaleDateString()}`
            : 'Completed'}
        </Text>
      </View>

      <Ionicons name="ellipsis-horizontal" size={16} color={textSecondary} style={styles.ellipsis} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  priorityDot: {
    fontSize: 10,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  ellipsis: {
    marginLeft: 4,
  },
});
