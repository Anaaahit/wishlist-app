import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WishlistItem, PRIORITY_CONFIG } from '@/types/wishlist';
import { DefaultImage } from '@/components/DefaultImage';
import { SavingsGoalBar } from '@/components/SavingsGoalBar';
import { ShareWishSheet } from '@/components/ShareWishSheet';

interface WishlistCardProps {
  item: WishlistItem;
  onToggleComplete: () => void;
  onPress: () => void;
  onAddToSavings?: (amount: number) => void;
  displayPrice?: number | null;
  displayCurrency?: string;
}

export function WishlistCard({ item, onToggleComplete, onPress, onAddToSavings, displayPrice, displayCurrency }: WishlistCardProps) {
  const priceToShow = displayPrice ?? item.price;
  const currencyToShow = displayCurrency ?? item.currency;
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const priceTag = useThemeColor({}, 'priceTag');
  const warning = useThemeColor({}, 'warning');
  const danger = useThemeColor({}, 'danger');

  const [showAddSavings, setShowAddSavings] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [shareVisible, setShareVisible] = useState(false);

  const inputNum = parseFloat(addAmount);
  const exceedsPrice = item.price != null && !isNaN(inputNum) && item.savedAmount + inputNum > item.price;
  const overSaved = item.price != null && item.savedAmount > item.price;

  const priorityConfig = PRIORITY_CONFIG[item.priority];

  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onToggleComplete();
  };

  const handleAddSavings = () => {
    const amount = parseFloat(addAmount);
    if (!isNaN(amount) && amount > 0 && onAddToSavings && !exceedsPrice) {
      onAddToSavings(amount);
      setShowAddSavings(false);
      setAddAmount('');
    }
  };

  return (
    <>
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: accent,
            backgroundColor: 'transparent',
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.6}
      >
        <View style={styles.checkInner} />
      </TouchableOpacity>

      {item.imageUri ? (
        <RNImage source={{ uri: item.imageUri }} style={styles.thumbnail} />
      ) : (
        <DefaultImage size={56} />
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => setShareVisible(true)} hitSlop={8} activeOpacity={0.6}>
            <Ionicons name="share-social-outline" size={16} color={textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.priorityDot, { color: priorityConfig.color }]}>
            {priorityConfig.icon}
          </Text>
        </View>
        {item.categories.length > 0 && (
          <View style={styles.tagRow}>
            {item.categories.slice(0, 3).map((cat) => (
              <View key={cat} style={[styles.miniTag, { backgroundColor: accent + '15' }]}>
                <Text style={[styles.miniTagText, { color: accent }]}>{cat}</Text>
              </View>
            ))}
          </View>
        )}

        {item.price != null && (
          <View style={styles.savingsSection}>
            <SavingsGoalBar
              savedAmount={item.savedAmount}
              targetPrice={item.price}
              currency={item.currency}
            />
            {overSaved && (
              <View style={[styles.exceedWarning, { backgroundColor: danger + '15' }]}>
                <Ionicons name="alert-circle" size={14} color={danger} />
                <Text style={[styles.exceedWarningText, { color: danger }]}>
                  Your savings exceed the item price
                </Text>
              </View>
            )}
            <View style={styles.savingsActions}>
              {item.savedAmount < item.price && (
                showAddSavings ? (
                  <View style={styles.addInputWrap}>
                    <View style={[styles.addInputRow, { backgroundColor: surface, borderColor: exceedsPrice ? warning : border }]}>
                      <TextInput
                        style={[styles.addInput, { color: text }]}
                        value={addAmount}
                        onChangeText={setAddAmount}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={textSecondary}
                        autoFocus
                      />
                      <TouchableOpacity onPress={handleAddSavings} activeOpacity={0.7}>
                        <Ionicons name="checkmark-circle" size={24} color={exceedsPrice ? warning : accent} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setShowAddSavings(false); setAddAmount(''); }} activeOpacity={0.7}>
                        <Ionicons name="close-circle" size={24} color={textSecondary} />
                      </TouchableOpacity>
                    </View>
                    {exceedsPrice && (
                      <View style={[styles.exceedWarning, { backgroundColor: danger + '15' }]}>
                        <Ionicons name="alert-circle" size={14} color={danger} />
                        <Text style={[styles.exceedWarningText, { color: danger }]}>
                          Your savings exceed the item price
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: accent + '12' }]}
                    onPress={() => setShowAddSavings(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={14} color={accent} />
                    <Text style={[styles.addBtnText, { color: accent }]}>Add Saved</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}
      </View>

      {priceToShow != null && (
        <View style={[styles.priceBadge, { backgroundColor: priceTag + '12' }]}>
          <Text style={[styles.price, { color: priceTag }]}>
            {currencyToShow}{priceToShow.toLocaleString()}
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={16} color={textSecondary} style={styles.chevron} />
    </TouchableOpacity>

    <ShareWishSheet
      visible={shareVisible}
      wish={item}
      onClose={() => setShareVisible(false)}
    />
    </>
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
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F0F0F8',
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
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  savingsSection: {
    marginTop: 4,
  },
  savingsActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addInputWrap: {
    gap: 4,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  addInput: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 50,
    paddingVertical: 0,
  },
  exceedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exceedWarningText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 2,
  },
});
