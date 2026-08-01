import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '@/context/WishlistContext';
import { useTodos } from '@/context/TodoContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CompletedCard } from '@/components/CompletedCard';
import { CompletedTodoCard } from '@/components/CompletedTodoCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { WishlistItem } from '@/types/wishlist';
import { TodoItem } from '@/types/todo';
import { fetchRates, convertAmount } from '@/services/currencyRates';
import { useSettings } from '@/context/SettingsContext';

type Section = 'wishes' | 'todos';

export default function CompletedScreen() {
  const insets = useSafeAreaInsets();
  const { completedItems, restoreItem, deleteItem } = useWishlist();
  const { completedTodos, restoreTodo, deleteTodo } = useTodos();
  const { settings } = useSettings();
  const [section, setSection] = useState<Section>('wishes');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRates().then(setRates);
  }, []);

  const convert = useCallback(
    (amount: number, fromCurrency: string) => {
      return convertAmount(amount, fromCurrency, settings.defaultCurrency, rates);
    },
    [settings.defaultCurrency, rates]
  );

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const success = useThemeColor({}, 'success');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');

  const handleCardPress = (item: WishlistItem) => {
    setSelectedItem(item);
    setSelectedTodo(null);
    setActionModalVisible(true);
  };

  const handleTodoPress = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setSelectedItem(null);
    setActionModalVisible(true);
  };

  const handleRestore = () => {
    if (selectedItem) {
      restoreItem(selectedItem.id);
    } else if (selectedTodo) {
      restoreTodo(selectedTodo.id);
    }
    setActionModalVisible(false);
    setSelectedItem(null);
    setSelectedTodo(null);
  };

  const handleDeletePress = () => {
    setActionModalVisible(false);
    setTimeout(() => setDeleteModalVisible(true), 300);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
    } else if (selectedTodo) {
      deleteTodo(selectedTodo.id);
    }
    setDeleteModalVisible(false);
    setSelectedItem(null);
    setSelectedTodo(null);
  };

  const renderWish = ({ item }: { item: WishlistItem }) => {
    const displayPrice = item.price != null ? convert(item.price, item.currency) : null;
    return (
      <CompletedCard
        item={item}
        displayPrice={displayPrice}
        displayCurrency={settings.defaultCurrency}
        onPress={() => handleCardPress(item)}
      />
    );
  };

  const renderTodo = ({ item }: { item: TodoItem }) => (
    <CompletedTodoCard item={item} onPress={() => handleTodoPress(item)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: text }]}>Completed</Text>
        <View style={[styles.countBadge, { backgroundColor: success + '15' }]}>
          <Ionicons name="checkmark-circle" size={16} color={success} />
          <Text style={[styles.countText, { color: success }]}>
            {section === 'wishes' ? completedItems.length : completedTodos.length}
          </Text>
        </View>
      </View>

      <View style={styles.segmented}>
        <TouchableOpacity
          style={[
            styles.segment,
            { backgroundColor: section === 'wishes' ? accent : surface, borderColor: section === 'wishes' ? accent : border },
          ]}
          onPress={() => setSection('wishes')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, { color: section === 'wishes' ? '#FFFFFF' : textSecondary }]}>
            Wishes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            { backgroundColor: section === 'todos' ? accent : surface, borderColor: section === 'todos' ? accent : border },
          ]}
          onPress={() => setSection('todos')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, { color: section === 'todos' ? '#FFFFFF' : textSecondary }]}>
            To-dos
          </Text>
        </TouchableOpacity>
      </View>

      {section === 'wishes' ? (
        <FlatList
          data={completedItems}
          renderItem={renderWish}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={64} color={textSecondary} />
              <Text style={[styles.emptyTitle, { color: text }]}>No completed wishes</Text>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                Complete wishes from the Wishlist tab
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={completedTodos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkbox-outline" size={64} color={textSecondary} />
              <Text style={[styles.emptyTitle, { color: text }]}>No completed to-dos</Text>
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                Mark tasks as done in the To-do List tab
              </Text>
            </View>
          }
        />
      )}

      {(selectedItem || selectedTodo) && (
        <ConfirmModal
          visible={actionModalVisible}
          title={selectedItem?.title ?? selectedTodo?.title ?? ''}
          message="What would you like to do with this completed item?"
          confirmLabel="Restore"
          confirmColor={accent}
          onConfirm={handleRestore}
          onCancel={() => {
            setActionModalVisible(false);
            setSelectedItem(null);
            setSelectedTodo(null);
          }}
          secondaryLabel="Delete"
          onSecondary={handleDeletePress}
        />
      )}

      {(selectedItem || selectedTodo) && (
        <ConfirmModal
          visible={deleteModalVisible}
          title="Delete"
          message={`Are you sure you want to permanently delete "${selectedItem?.title ?? selectedTodo?.title ?? ''}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalVisible(false);
            setSelectedItem(null);
            setSelectedTodo(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
  segmented: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    paddingTop: 4,
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
