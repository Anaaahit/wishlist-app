import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image as RNImage,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WishlistItem, Priority, CURRENCIES } from '@/types/wishlist';
import { PrioritySelector } from '@/components/PrioritySelector';
import { CategoryTags } from '@/components/CategoryTags';
import { DefaultImage } from '@/components/DefaultImage';

interface ItemFormModalProps {
  visible: boolean;
  item: WishlistItem | null;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

export function ItemFormModal({ visible, item, onClose, onSave, onDelete }: ItemFormModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categories, setCategories] = useState<string[]>([]);

  const surface = useThemeColor({}, 'surface');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setPrice(item.price != null ? item.price.toString() : '');
      setCurrency(item.currency);
      setImageUri(item.imageUri);
      setLink(item.link);
      setNotes(item.notes);
      setPriority(item.priority);
      setCategories(item.categories);
    } else {
      resetForm();
    }
  }, [item, visible]);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCurrency('$');
    setImageUri(null);
    setLink('');
    setNotes('');
    setPriority('medium');
    setCategories([]);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      price: price ? parseFloat(price) : null,
      currency,
      imageUri,
      link: link.trim(),
      notes: notes.trim(),
      priority,
      categories,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: surface }]}>
            <View style={[styles.handle, { backgroundColor: border }]} />

            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: text }]}>
                {isEditing ? 'Edit Wish' : 'New Wish'}
              </Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.imageSection}>
                {imageUri ? (
                  <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                    <RNImage source={{ uri: imageUri }} style={styles.imagePreview} />
                    <View style={[styles.imageOverlay, { backgroundColor: overlay }]}>
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.imagePlaceholder, { backgroundColor: surfaceElevated, borderColor: border }]}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    <DefaultImage size={64} />
                    <Text style={[styles.imagePlaceholderText, { color: textSecondary }]}>
                      Add Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What do you wish for?"
                  placeholderTextColor={textSecondary}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Price</Text>
                <View style={styles.priceRow}>
                  <TouchableOpacity
                    style={[styles.currencyBtn, { backgroundColor: surfaceElevated, borderColor: border }]}
                    onPress={() => {
                      const idx = CURRENCIES.indexOf(currency as any);
                      setCurrency(CURRENCIES[(idx + 1) % CURRENCIES.length]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.currencyText, { color: accent }]}>{currency}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.priceInput, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor={textSecondary}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Link</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                  value={link}
                  onChangeText={setLink}
                  placeholder="https://..."
                  placeholderTextColor={textSecondary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: text }]}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, { backgroundColor: surfaceElevated, borderColor: border, color: text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any additional notes..."
                  placeholderTextColor={textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <PrioritySelector value={priority} onChange={setPriority} />
              <CategoryTags selected={categories} onChange={setCategories} />
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: border }]}>
              {isEditing && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: danger + '15' }]}
                  onPress={() => {
                    onClose();
                    setTimeout(onDelete, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={danger} />
                  <Text style={[styles.deleteText, { color: danger }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: accent, opacity: title.trim() ? 1 : 0.5 }]}
                onPress={handleSave}
                disabled={!title.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.saveText}>{isEditing ? 'Update' : 'Add to Wishlist'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
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
  scroll: {
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceInput: {
    flex: 1,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
