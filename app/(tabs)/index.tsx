import React, { useState, useEffect, useCallback } from 'react';
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
import { Confetti } from '@/components/Confetti';
import { useSettings } from '@/context/SettingsContext';
import { WishlistItem } from '@/types/wishlist';
import { fetchRates, convertAmount } from '@/services/currencyRates';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeItems,
    items,
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
  const { settings } = useSettings();

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

  const convertedTotal = activeItems.reduce((sum, item) => {
    if (item.price == null) return sum;
    return sum + convert(item.price, item.currency);
  }, 0);

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

  const renderItem = ({ item }: { item: WishlistItem }) => {
    const displayPrice = item.price != null ? convert(item.price, item.currency) : null;
    return (
      <WishlistCard
        item={item}
        displayPrice={displayPrice}
        displayCurrency={settings.defaultCurrency}
        onToggleComplete={() => handleToggleComplete(item)}
        onPress={() => handleCardPress(item)}
        onAddToSavings={(amount) => updateItem(item.id, { savedAmount: item.savedAmount + amount })}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: useThemeColor({}, 'background') }]}>
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: textSecondary }]}>My Wishlist</Text>
            <Text style={[styles.totalValue, { color: accent }]}>
              {settings.defaultCurrency}{convertedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
            <Ionicons name="heart" size={16} color={accent} />
            <Text style={[styles.countText, { color: accent }]}>{activeItems.length}</Text>
          </View>
        </View>
        <SortSelector value={sortBy} onChange={setSortBy} />
      </View>

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
        items={items}
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
