import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image as RNImage } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WishlistItem } from '@/types/wishlist';
import { DefaultImage } from '@/components/DefaultImage';

interface CompletedCardProps {
  item: WishlistItem;
  onPress: () => void;
}

export function CompletedCard({ item, onPress }: CompletedCardProps) {
  const surface = useThemeColor({}, 'surface');
  const textDimmed = useThemeColor({}, 'textDimmed');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const success = useThemeColor({}, 'success');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkCircle, { borderColor: success, backgroundColor: success + '20' }]}>
        <Ionicons name="checkmark" size={14} color={success} />
      </View>

      {item.imageUri ? (
        <RNImage source={{ uri: item.imageUri }} style={[styles.thumbnail, styles.dimmed]} />
      ) : (
        <View style={styles.dimmed}>
          <DefaultImage size={48} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: textDimmed }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.completedAt && (
          <Text style={[styles.date, { color: textSecondary }]}>
            Completed {new Date(item.completedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {item.price != null && (
        <Text style={[styles.price, { color: textDimmed }]}>
          {item.currency}{item.price.toLocaleString()}
        </Text>
      )}

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
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  dimmed: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  ellipsis: {
    marginLeft: 4,
  },
});
