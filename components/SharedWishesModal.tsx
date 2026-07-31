import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  fetchSharedWishByCode,
  listMySharedWishes,
  deleteSharedWishByCode,
  isSupabaseConfigured,
  SharedWish,
} from '@/services/supabase';

interface SharedWishesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SharedWishesModal({ visible, onClose }: SharedWishesModalProps) {
  const { user } = useAuth();
  const { addItem } = useWishlist();

  const [tab, setTab] = useState<'add' | 'mine'>('add');
  const [codeInput, setCodeInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [myShares, setMyShares] = useState<SharedWish[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const success = useThemeColor({}, 'success');

  const canShare = !!user && !user.isGuest && isSupabaseConfigured;

  const loadMine = useCallback(async () => {
    if (!user || user.isGuest || !isSupabaseConfigured) return;
    setLoadingMine(true);
    try {
      setMyShares(await listMySharedWishes(user.id!));
    } catch (e) {
      console.error('Failed to load shared wishes:', e);
    } finally {
      setLoadingMine(false);
    }
  }, [user]);

  useEffect(() => {
    if (visible) {
      setMessage(null);
      setCodeInput('');
      if (tab === 'mine') loadMine();
    }
  }, [visible, tab, loadMine]);

  const reset = () => {
    setMessage(null);
    setCodeInput('');
    setMyShares([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = async () => {
    if (busy) return;
    setMessage(null);
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      setMessage({ type: 'error', text: 'Enter a share code.' });
      return;
    }
    if (!canShare) {
      setMessage({ type: 'error', text: 'Log in with an account to add shared wishes.' });
      return;
    }
    setBusy(true);
    try {
      const shared = await fetchSharedWishByCode(code);
      if (!shared) {
        setMessage({ type: 'error', text: 'No wish found with that code.' });
        return;
      }
      addItem({
        title: shared.title,
        price: shared.price,
        currency: shared.currency,
        imageUri: shared.imageUri,
        link: shared.link,
        notes: shared.notes,
        priority: shared.priority,
        categories: shared.categories,
        savedAmount: 0,
      });
      setCodeInput('');
      setMessage({ type: 'success', text: `"${shared.title}" added to your wishlist!` });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Could not add the shared wish.' });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setMessage({ type: 'success', text: `Code ${code} copied!` });
  };

  const handleDeleteShare = (shared: SharedWish) => {
    Alert.alert('Remove share code', `Stop sharing "${shared.title}"? Friends with this code won't be able to add it anymore.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSharedWishByCode(shared.code);
            setMyShares((prev) => prev.filter((s) => s.code !== shared.code));
          } catch (e) {
            console.error('Failed to remove share code:', e);
          }
        },
      },
    ]);
  };

  const renderShared = ({ item }: { item: SharedWish }) => (
    <View style={[styles.sharedCard, { backgroundColor: surfaceElevated, borderColor: border }]}>
      <View style={styles.sharedContent}>
        <Text style={[styles.sharedTitle, { color: text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.sharedCodeRow}>
          <Text style={[styles.sharedCode, { color: accent }]}>{item.code}</Text>
          <Text style={[styles.sharedPrice, { color: textSecondary }]}>
            {item.price != null ? `${item.currency}${item.price.toLocaleString()}` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleCopy(item.code)} hitSlop={6} activeOpacity={0.6}>
        <Ionicons name="copy-outline" size={20} color={textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteShare(item)} hitSlop={6} activeOpacity={0.6}>
        <Ionicons name="trash-outline" size={20} color={danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: surface }]}>
            <View style={[styles.handle, { backgroundColor: border }]} />

            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: text }]}>Shared Wishes</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.segment, { backgroundColor: surfaceElevated, borderColor: border }]}>
              {(['add', 'mine'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.segmentBtn, tab === t && { backgroundColor: accent }]}
                  onPress={() => setTab(t)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: tab === t ? '#FFFFFF' : textSecondary, fontWeight: tab === t ? '700' : '500' },
                    ]}
                  >
                    {t === 'add' ? 'Add by Code' : 'My Codes'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!canShare ? (
              <View style={styles.empty}>
                <Ionicons name="log-in-outline" size={44} color={textSecondary} />
                <Text style={[styles.emptyTitle, { color: text }]}>Log in to share wishes</Text>
                <Text style={[styles.emptyText, { color: textSecondary }]}>
                  Create an account or log in to add wishes shared by friends and share your own.
                </Text>
              </View>
            ) : tab === 'add' ? (
              <View style={styles.body}>
                <Text style={[styles.bodyHint, { color: textSecondary }]}>
                  Enter the code a friend shared with you to add their wish to your list.
                </Text>
                <View style={[styles.inputWrap, { backgroundColor: surfaceElevated, borderColor: border }]}>
                  <Ionicons name="key-outline" size={18} color={textSecondary} />
                  <TextInput
                    style={[styles.input, { color: text }]}
                    value={codeInput}
                    onChangeText={(t) => setCodeInput(t.toUpperCase())}
                    placeholder="ABCDEF"
                    placeholderTextColor={textSecondary}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={10}
                  />
                  {busy && <ActivityIndicator size="small" color={accent} />}
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: accent, opacity: busy ? 0.6 : 1 }]}
                  onPress={handleAdd}
                  disabled={busy}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add Wish</Text>
                </TouchableOpacity>
                {message && (
                  <View
                    style={[
                      styles.messageWrap,
                      { backgroundColor: (message.type === 'success' ? success : danger) + '12' },
                    ]}
                  >
                    <Ionicons
                      name={message.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={message.type === 'success' ? success : danger}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        { color: message.type === 'success' ? success : danger },
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.mineBody}>
                {message && (
                  <View
                    style={[
                      styles.messageWrap,
                      { backgroundColor: (message.type === 'success' ? success : danger) + '12' },
                    ]}
                  >
                    <Ionicons
                      name={message.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={message.type === 'success' ? success : danger}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        { color: message.type === 'success' ? success : danger },
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                )}
                {loadingMine ? (
                  <View style={styles.empty}>
                    <ActivityIndicator size="large" color={accent} />
                  </View>
                ) : myShares.length === 0 ? (
                  <View style={styles.empty}>
                    <Ionicons name="gift-outline" size={44} color={textSecondary} />
                    <Text style={[styles.emptyTitle, { color: text }]}>No codes yet</Text>
                    <Text style={[styles.emptyText, { color: textSecondary }]}>
                      Tap the share icon on a wish card and choose “Share with code”.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={myShares}
                    keyExtractor={(item) => item.code}
                    renderItem={renderShared}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            )}
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
    maxHeight: '85%',
    paddingBottom: 28,
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
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 15,
  },
  body: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bodyHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  mineBody: {
    paddingHorizontal: 20,
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  sharedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  sharedContent: {
    flex: 1,
  },
  sharedTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sharedCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  sharedCode: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sharedPrice: {
    fontSize: 13,
  },
});
