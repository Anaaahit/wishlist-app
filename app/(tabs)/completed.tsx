import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '@/context/WishlistContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CompletedCard } from '@/components/CompletedCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { WishlistItem } from '@/types/wishlist';

export default function CompletedScreen() {
  const insets = useSafeAreaInsets();
  const { completedItems, restoreItem, deleteItem } = useWishlist();
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const success = useThemeColor({}, 'success');

  const handleCardPress = (item: WishlistItem) => {
    setSelectedItem(item);
    setActionModalVisible(true);
  };

  const handleRestore = () => {
    if (selectedItem) {
      restoreItem(selectedItem.id);
      setActionModalVisible(false);
      setSelectedItem(null);
    }
  };

  const handleDeletePress = () => {
    setActionModalVisible(false);
    setTimeout(() => setDeleteModalVisible(true), 300);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      setDeleteModalVisible(false);
      setSelectedItem(null);
    }
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <CompletedCard item={item} onPress={() => handleCardPress(item)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: text }]}>Completed</Text>
        <View style={[styles.countBadge, { backgroundColor: success + '15' }]}>
          <Ionicons name="checkmark-circle" size={16} color={success} />
          <Text style={[styles.countText, { color: success }]}>{completedItems.length}</Text>
        </View>
      </View>

      <FlatList
        data={completedItems}
        renderItem={renderItem}
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

      {selectedItem && (
        <ConfirmModal
          visible={actionModalVisible}
          title={selectedItem.title}
          message="What would you like to do with this completed wish?"
          confirmLabel="Restore"
          confirmColor={accent}
          onConfirm={handleRestore}
          onCancel={() => {
            setActionModalVisible(false);
            setSelectedItem(null);
          }}
          secondaryLabel="Delete"
          onSecondary={handleDeletePress}
        />
      )}

      {selectedItem && (
        <ConfirmModal
          visible={deleteModalVisible}
          title="Delete Wish"
          message={`Are you sure you want to permanently delete "${selectedItem.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalVisible(false);
            setSelectedItem(null);
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
    paddingBottom: 16,
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
