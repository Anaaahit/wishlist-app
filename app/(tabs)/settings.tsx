import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettings, ThemeMode } from '@/context/SettingsContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { CURRENCIES } from '@/types/wishlist';
import { DeletedWishesModal } from '@/components/DeletedWishesModal';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettings();
  const { deletedItems } = useWishlist();
  const { user, logout } = useAuth();
  const [deletedWishesVisible, setDeletedWishesVisible] = useState(false);

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const danger = useThemeColor({}, 'danger');

  const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
    { label: 'Light', value: 'light', icon: 'sunny-outline' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  ];

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.headerTitle, { color: text }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: textSecondary }]}>Appearance</Text>
          <View style={styles.optionRow}>
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: settings.theme === opt.value ? accent + '18' : surfaceElevated,
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
                    backgroundColor: settings.defaultCurrency === c ? accent : surfaceElevated,
                    borderColor: settings.defaultCurrency === c ? accent : border,
                  },
                ]}
                onPress={() => updateSettings({ defaultCurrency: c })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.currencyText,
                    { color: settings.defaultCurrency === c ? '#FFFFFF' : text },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: border }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => setDeletedWishesVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: danger + '15' }]}>
              <Ionicons name="trash-outline" size={20} color={danger} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: text }]}>Deleted Wishes</Text>
              {deletedItems.length > 0 && (
                <Text style={[styles.rowDetail, { color: textSecondary }]}>
                  {deletedItems.length} {deletedItems.length === 1 ? 'wish' : 'wishes'}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: textSecondary }]}>Account</Text>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: accent + '15' }]}>
              <Ionicons name="person-outline" size={20} color={accent} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: text }]} numberOfLines={1}>
                {user?.isGuest ? 'Guest' : user?.email}
              </Text>
              <Text style={[styles.rowDetail, { color: textSecondary }]}>
                {user?.isGuest ? 'Continue without an account' : 'Logged in'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: danger }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={danger} />
            <Text style={[styles.logoutText, { color: danger }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeletedWishesModal
        visible={deletedWishesVisible}
        onClose={() => setDeletedWishesVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowDetail: {
    fontSize: 12,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
