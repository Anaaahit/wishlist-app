import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettings, ThemeMode } from '@/context/SettingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { CURRENCIES } from '@/types/wishlist';
import { DeletedWishesModal } from '@/components/DeletedWishesModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const { deletedItems } = useWishlist();
  const [deletedWishesVisible, setDeletedWishesVisible] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');

  const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  ];

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
              <Text style={[styles.headerTitle, { color: text }]}>Settings</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={[styles.sectionTitle, { color: textSecondary }]}>Appearance</Text>
              <View style={styles.optionRow}>
                {themeOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: settings.theme === opt.value ? accent + '18' : 'transparent',
                        borderColor: settings.theme === opt.value ? accent : border,
                      },
                    ]}
                    onPress={() => updateSettings({ theme: opt.value })}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={18}
                      color={settings.theme === opt.value ? accent : textSecondary}
                    />
                    <Text
                      style={[
                        styles.chipLabel,
                        {
                          color: settings.theme === opt.value ? accent : textSecondary,
                          fontWeight: settings.theme === opt.value ? '600' : '400',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: textSecondary }]}>Default Currency</Text>
              <View style={[styles.optionRow, styles.currencyRow]}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.currencyChip,
                      {
                        backgroundColor: settings.defaultCurrency === c ? accent : 'transparent',
                        borderColor: settings.defaultCurrency === c ? accent : border,
                      },
                    ]}
                    onPress={() => updateSettings({ defaultCurrency: c })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        {
                          color: settings.defaultCurrency === c ? '#FFFFFF' : text,
                        },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.divider, { backgroundColor: border }]} />

              <TouchableOpacity
                style={styles.deletedRow}
                onPress={() => setDeletedWishesVisible(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.deletedIcon, { backgroundColor: danger + '15' }]}>
                  <Ionicons name="trash-outline" size={20} color={danger} />
                </View>
                <View style={styles.deletedContent}>
                  <Text style={[styles.deletedLabel, { color: text }]}>Deleted Wishes</Text>
                  {deletedItems.length > 0 && (
                    <Text style={[styles.deletedCount, { color: textSecondary }]}>
                      {deletedItems.length} {deletedItems.length === 1 ? 'wish' : 'wishes'}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={textSecondary} />
              </TouchableOpacity>
          </View>
          </View>
        </KeyboardAvoidingView>
      </View>
      <DeletedWishesModal
        visible={deletedWishesVisible}
        onClose={() => setDeletedWishesVisible(false)}
      />
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  currencyRow: {
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
  },
  currencyChip: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  deletedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletedContent: {
    flex: 1,
  },
  deletedLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  deletedCount: {
    fontSize: 12,
    marginTop: 1,
  },
});
