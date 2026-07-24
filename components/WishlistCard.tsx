import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image as RNImage, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WishlistItem, PRIORITY_CONFIG } from '@/types/wishlist';
import { DefaultImage } from '@/components/DefaultImage';

interface WishlistCardProps {
  item: WishlistItem;
  onToggleComplete: () => void;
  onPress: () => void;
}

export function WishlistCard({ item, onToggleComplete, onPress }: WishlistCardProps) {
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const priceTag = useThemeColor({}, 'priceTag');

  const priorityConfig = PRIORITY_CONFIG[item.priority];

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
      </View>

      {item.price != null && (
        <View style={[styles.priceBadge, { backgroundColor: priceTag + '12' }]}>
          <Text style={[styles.price, { color: priceTag }]}>
            {item.currency}{item.price.toLocaleString()}
          </Text>
        </View>
      )}

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
