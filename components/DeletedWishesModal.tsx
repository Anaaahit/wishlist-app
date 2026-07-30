import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useWishlist } from '@/context/WishlistContext';
import { DefaultImage } from '@/components/DefaultImage';
import { ConfirmModal } from '@/components/ConfirmModal';
import { WishlistItem } from '@/types/wishlist';

interface DeletedWishesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DeletedWishesModal({ visible, onClose }: DeletedWishesModalProps) {
  const { deletedItems, restoreFromTrash, permanentDeleteItem } = useWishlist();

  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');

  const [confirmTarget, setConfirmTarget] = useState<WishlistItem | null>(null);

  const handleRestore = (item: WishlistItem) => {
    restoreFromTrash(item.id);
  };

  const handlePermanentDelete = () => {
    if (confirmTarget) {
      permanentDeleteItem(confirmTarget.id);
      setConfirmTarget(null);
    }
  };

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      {item.imageUri ? (
        <View style={styles.imagePlaceholder} />
      ) : (
        <DefaultImage size={44} />
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.price != null && (
          <Text style={[styles.price, { color: textSecondary }]}>
            {item.currency}{item.price.toLocaleString()}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: accent + '15' }]}
        onPress={() => handleRestore(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh-outline" size={16} color={accent} />
        <Text style={[styles.actionText, { color: accent }]}>Restore</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: danger + '15' }]}
        onPress={() => setConfirmTarget(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color={danger} />
        <Text style={[styles.actionText, { color: danger }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: overlay }]}>
        <View style={[styles.container, { backgroundColor: surface }]}>
          <View style={[styles.handle, { backgroundColor: border }]} />

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: text }]}>Deleted Wishes</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={28} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={deletedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="trash-outline" size={48} color={textSecondary} />
                <Text style={[styles.emptyTitle, { color: text }]}>No deleted wishes</Text>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  Deleted wishes will appear here
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {confirmTarget && (
        <ConfirmModal
          visible={!!confirmTarget}
          title="Delete Permanently"
          message={`Are you sure you want to permanently delete "${confirmTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete Forever"
          onConfirm={handlePermanentDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  imagePlaceholder: {
    width: 6,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  price: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
});
