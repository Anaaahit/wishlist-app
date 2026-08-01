import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTodos } from '@/context/TodoContext';
import { TodoCard } from '@/components/TodoCard';
import { TodoFormModal } from '@/components/TodoFormModal';
import { FAB } from '@/components/FAB';
import { TodoItem, TodoSortOption } from '@/types/todo';

const SORT_OPTIONS: { key: TodoSortOption; label: string; icon: string }[] = [
  { key: 'deadline', label: 'Deadline', icon: 'calendar-outline' },
  { key: 'date', label: 'Newest', icon: 'time-outline' },
  { key: 'priority', label: 'Priority', icon: 'flag-outline' },
];

export default function TodosScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    sortBy,
    setSortBy,
  } = useTodos();

  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  const handleCardPress = (todo: TodoItem) => {
    setEditingTodo(todo);
    setFormVisible(true);
  };

  const handleSave = (data: any) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, data);
    } else {
      addTodo(data);
    }
    setEditingTodo(null);
  };

  const handleDelete = () => {
    if (editingTodo) {
      deleteTodo(editingTodo.id);
      setEditingTodo(null);
    }
  };

  const renderItem = ({ item }: { item: TodoItem }) => (
    <TodoCard
      item={item}
      onToggleComplete={() => completeTodo(item.id)}
      onPress={() => handleCardPress(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: textSecondary }]}>To-do List</Text>
            <Text style={[styles.title, { color: text }]}>
              {activeTodos.length} {activeTodos.length === 1 ? 'task' : 'tasks'} to do
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
            <Ionicons name="checkbox-outline" size={16} color={accent} />
            <Text style={[styles.countText, { color: accent }]}>{activeTodos.length}</Text>
          </View>
        </View>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.key;
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
                onPress={() => setSortBy(opt.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : textSecondary}
                />
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isSelected ? '#FFFFFF' : textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={activeTodos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkbox-outline" size={64} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: text }]}>No tasks yet</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Tap the + button to add your first to-do
            </Text>
          </View>
        }
      />

      <FAB onPress={() => { setEditingTodo(null); setFormVisible(true); }} />

      <TodoFormModal
        visible={formVisible}
        item={editingTodo}
        onClose={() => { setFormVisible(false); setEditingTodo(null); }}
        onSave={handleSave}
        onDelete={editingTodo ? handleDelete : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  countText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
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
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 120,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
});
