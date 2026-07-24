import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
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
import { SavingsGoalBar } from '@/components/SavingsGoalBar';
import { Confetti } from '@/components/Confetti';
import { WishlistItem, CURRENCIES } from '@/types/wishlist';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeItems,
    totalActiveValue,
    sortBy,
    setSortBy,
    addItem,
    updateItem,
    deleteItem,
    completeItem,
  } = useWishlist();

  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');

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
      deleteItem(editingItem.id);
      setEditingItem(null);
    }
  };

  const highTicketItems = activeItems.filter(
    (item) => item.price != null && item.price >= 100
  );

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <WishlistCard
      item={item}
      onToggleComplete={() => handleToggleComplete(item)}
      onPress={() => handleCardPress(item)}
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
              {CURRENCIES[0]}{totalActiveValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
            <Ionicons name="heart" size={16} color={accent} />
            <Text style={[styles.countText, { color: accent }]}>{activeItems.length}</Text>
          </View>
        </View>
        <SortSelector value={sortBy} onChange={setSortBy} />
      </View>

      {highTicketItems.length > 0 && (
        <View style={styles.savingsSection}>
          <Text style={[styles.savingsTitle, { color: text }]}>Savings Goals</Text>
          {highTicketItems.slice(0, 3).map((item) => (
            <SavingsGoalBar
              key={item.id}
              price={item.price!}
              targetPrice={item.price!}
              currency={item.currency}
            />
          ))}
        </View>
      )}

      <FlatList
        data={activeItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: text }]}>No wishes yet</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              Tap the + button to add your first wish
            </Text>
          </View>
        }
      />

      <FAB onPress={() => { setEditingItem(null); setFormVisible(true); }} />

      <ItemFormModal
        visible={formVisible}
        item={editingItem}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        onDelete={editingItem ? handleDelete : undefined}
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
  savingsSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
