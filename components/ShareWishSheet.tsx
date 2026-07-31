import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Share,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';
import { WishlistItem } from '@/types/wishlist';
import { createSharedWish, isSupabaseConfigured } from '@/services/supabase';

interface ShareWishSheetProps {
  visible: boolean;
  wish: WishlistItem;
  onClose: () => void;
}

function shareTextFor(wish: WishlistItem): string {
  const lines: string[] = [];
  lines.push(`I'm wishing for: ${wish.title}`);
  if (wish.price != null) {
    lines.push(`Price: ${wish.currency}${wish.price.toLocaleString()}`);
  }
  if (wish.link) {
    lines.push(`\n${wish.link}`);
  }
  if (wish.notes) {
    lines.push(`\n${wish.notes}`);
  }
  return lines.join('\n');
}

export function ShareWishSheet({ visible, wish, onClose }: ShareWishSheetProps) {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const overlay = useThemeColor({}, 'overlay');
  const danger = useThemeColor({}, 'danger');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');

  const reset = () => {
    setCreating(false);
    setCode(null);
    setError(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleShareViaApps = () => {
    Share.share({ message: shareTextFor(wish) });
    handleClose();
  };

  const handleShareWithCode = async () => {
    if (creating) return;
    setError(null);
    setCopied(false);
    if (!isSupabaseConfigured) {
      setError('In-app sharing is not set up yet. Add your Supabase URL and key in constants/supabase.ts');
      return;
    }
    if (!user || user.isGuest) {
      setError('Log in with an account to share wishes with a code.');
      return;
    }
    setCreating(true);
    try {
      const newCode = await createSharedWish(user.id!, user.email, wish);
      setCode(newCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create a share code.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
  };

  const handleSendCode = () => {
    if (!code) return;
    Share.share({
      message: `I shared a wish with you on Wishlist!\n\n${wish.title}${wish.price != null ? ` (${wish.currency}${wish.price.toLocaleString()})` : ''}\n\nAdd it with this code:\n${code}\n\nOpen Settings → Shared Wishes → Add by code.`,
    });
  };

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
              <Text style={[styles.headerTitle, { color: text }]}>Share Wish</Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={28} color={textSecondary} />
              </TouchableOpacity>
            </View>

            {code ? (
              <View style={styles.body}>
                <Text style={[styles.codeLabel, { color: textSecondary }]}>Share code for “{wish.title}”</Text>
                <View style={[styles.codeBox, { backgroundColor: surfaceElevated, borderColor: border }]}>
                  <Text style={[styles.codeText, { color: accent }]}>{code}</Text>
                </View>
                <Text style={[styles.codeHint, { color: textSecondary }]}>
                  Send this code to a friend. They can add the wish in Settings → Shared Wishes.
                </Text>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: accent }]}
                  onPress={handleSendCode}
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Send Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryBtn, { backgroundColor: surfaceElevated, borderColor: border }]}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={18}
                    color={copied ? accent : textSecondary}
                  />
                  <Text style={[styles.secondaryBtnText, { color: copied ? accent : textSecondary }]}>
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.body}>
                <TouchableOpacity
                  style={[styles.optionRow, { backgroundColor: surfaceElevated, borderColor: border }]}
                  onPress={handleShareViaApps}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: accent + '15' }]}>
                    <Ionicons name="share-social-outline" size={22} color={accent} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: text }]}>Share via apps</Text>
                    <Text style={[styles.optionDetail, { color: textSecondary }]}>
                      Send via WhatsApp, Messages, email, etc.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionRow, { backgroundColor: surfaceElevated, borderColor: border }]}
                  onPress={handleShareWithCode}
                  disabled={creating}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: danger + '15' }]}>
                    {creating ? (
                      <ActivityIndicator size="small" color={danger} />
                    ) : (
                      <Ionicons name="code-slash-outline" size={22} color={danger} />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: text }]}>Share with code</Text>
                    <Text style={[styles.optionDetail, { color: textSecondary }]}>
                      Give a friend a code to add this wish in-app
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={textSecondary} />
                </TouchableOpacity>

                {error && (
                  <View style={[styles.errorWrap, { backgroundColor: danger + '12' }]}>
                    <Ionicons name="alert-circle" size={16} color={danger} />
                    <Text style={[styles.errorText, { color: danger }]}>{error}</Text>
                  </View>
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
  body: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  codeLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  codeBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 6,
  },
  codeHint: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
