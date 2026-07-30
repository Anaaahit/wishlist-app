import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useWishlist } from '@/context/WishlistContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WishlistCard } from '@/components/WishlistCard';
import { ItemFormModal } from '@/components/ItemFormModal';
import { FAB } from '@/components/FAB';
import { SortSelector } from '@/components/SortSelector';
import { Confetti } from '@/components/Confetti';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Snackbar } from '@/components/Snackbar';
import { useSettings } from '@/context/SettingsContext';
import { WishlistItem } from '@/types/wishlist';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeItems,
    items,
    totalActiveValue,
    sortBy,
    setSortBy,
    addItem,
    updateItem,
    deleteItem,
    completeItem,
    restoreFromTrash,
  } = useWishlist();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WishlistItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarItem, setSnackbarItem] = useState<WishlistItem | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { settings } = useSettings();

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return activeItems;
    const q = searchQuery.toLowerCase().trim();
    return activeItems.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.categories.some((c) => c.toLowerCase().includes(q)) ||
        i.notes.toLowerCase().includes(q)
    );
  }, [activeItems, searchQuery]);

  const handleToggleComplete = (item: WishlistItem) => {
    completeItem(item.id);
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowConfetti(true);
  };

  const handleCardPress = (item: WishlistItem) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleCardLongPress = (item: WishlistItem) => {
    setDeleteTarget(item);
  };

  const showSnackbar = (item: WishlistItem) => {
    setSnackbarItem(item);
    setSnackbarVisible(true);
  };

  const handleUndoDelete = () => {
    if (snackbarItem) {
      restoreFromTrash(snackbarItem.id);
      setSnackbarItem(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      const item = deleteTarget;
      deleteItem(item.id);
      setDeleteTarget(null);
      showSnackbar(item);
    }
  };

  const handleSave = (data: any) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (editingItem) {
      const item = editingItem;
      deleteItem(item.id);
      setEditingItem(null);
      setFormVisible(false);
      showSnackbar(item);
    }
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <WishlistCard
      item={item}
      onToggleComplete={() => handleToggleComplete(item)}
      onPress={() => handleCardPress(item)}
      onLongPress={() => handleCardLongPress(item)}
      onAddToSavings={(amount) => updateItem(item.id, { savedAmount: item.savedAmount + amount })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: textSecondary }]}>My Wishlist</Text>
            <Text style={[styles.totalValue, { color: accent }]}>
              {settings.defaultCurrency}{totalActiveValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
            <Ionicons name="heart" size={16} color={accent} />
            <Text style={[styles.countText, { color: accent }]}>{activeItems.length}</Text>
          </View>
        </View>
        <SortSelector value={sortBy} onChange={setSortBy} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: useThemeColor({}, 'surfaceElevated'), borderColor: useThemeColor({}, 'border') }]}>
        <Ionicons name="search" size={16} color={textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search wishes..."
          placeholderTextColor={textSecondary}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={searchQuery.trim() ? 'search-outline' : 'heart-outline'}
              size={64}
              color={textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: text }]}>
              {searchQuery.trim() ? 'No results' : 'No wishes yet'}
            </Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Tap the + button to add your first wish'}
            </Text>
          </View>
        }
      />

      <FAB onPress={() => { setEditingItem(null); setFormVisible(true); }} />

      <ItemFormModal
        visible={formVisible}
        item={editingItem}
        items={items}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        onDelete={editingItem ? handleDelete : undefined}
      />

      {deleteTarget && (
        <ConfirmModal
          visible={!!deleteTarget}
          title="Delete Wish"
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        message="Wish deleted"
        actionLabel="Undo"
        onAction={handleUndoDelete}
        onDismiss={() => setSnackbarVisible(false)}
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
  totalValue: {
    fontSize: 28,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
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
