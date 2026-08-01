import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TodoItem } from '@/types/todo';
import { PRIORITY_CONFIG } from '@/types/wishlist';

interface TodoCardProps {
  item: TodoItem;
  onToggleComplete: () => void;
  onPress: () => void;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function deadlineInfo(deadline: number | null, textSecondary: string, warning: string, danger: string) {
  if (deadline == null) return null;
  const today = startOfDay(Date.now());
  const day = startOfDay(deadline);
  const diffDays = Math.round((day - today) / 86400000);
  const date = new Date(deadline).toLocaleDateString();
  if (diffDays < 0) return { label: `Overdue · ${date}`, color: danger };
  if (diffDays === 0) return { label: 'Today', color: warning };
  if (diffDays === 1) return { label: 'Tomorrow', color: warning };
  if (diffDays === 7) return { label: `Next week · ${date}`, color: textSecondary };
  return { label: date, color: textSecondary };
}

export function TodoCard({ item, onToggleComplete, onPress }: TodoCardProps) {
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const warning = useThemeColor({}, 'warning');
  const danger = useThemeColor({}, 'danger');

  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const deadline = deadlineInfo(item.deadline, textSecondary, warning, danger);

  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onToggleComplete();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[styles.checkbox, { borderColor: accent, backgroundColor: 'transparent' }]}
        onPress={handleToggle}
        activeOpacity={0.6}
      >
        <View style={styles.checkInner} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.priorityDot, { color: priorityConfig.color }]}>
            {priorityConfig.icon}
          </Text>
        </View>
        {item.notes ? (
          <Text style={[styles.notes, { color: textSecondary }]} numberOfLines={1}>
            {item.notes}
          </Text>
        ) : null}
        {deadline && (
          <View style={[styles.deadlineRow, { backgroundColor: deadline.color + '15' }]}>
            <Ionicons
              name={item.deadline != null && item.deadline < Date.now() ? 'alert-circle' : 'calendar-outline'}
              size={12}
              color={deadline.color}
            />
            <Text style={[styles.deadlineText, { color: deadline.color }]}>{deadline.label}</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color={textSecondary} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
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
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityDot: {
    fontSize: 10,
  },
  notes: {
    fontSize: 13,
    marginTop: 2,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 2,
  },
});
