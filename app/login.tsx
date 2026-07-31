import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';

type Mode = 'login' | 'register';

const PIN_LENGTH = 4;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, register, verifyPin, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinStep, setPinStep] = useState(false);

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const danger = useThemeColor({}, 'danger');

  const switchMode = (next: Mode) => {
    setMode(next);
    setPinStep(false);
    setPin('');
    setError(null);
  };

  const errorMessage = (e: unknown): string => {
    if (e instanceof Error && e.message) return e.message;
    if (typeof e === 'string' && e) return e;
    if (e && typeof e === 'object' && 'message' in e && (e as { message?: unknown }).message) {
      return String((e as { message: unknown }).message);
    }
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        setError('Please choose a 4-digit passkey.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register(trimmedEmail, password, pin);
      } else {
        const needsPin = await login(trimmedEmail, password);
        if (needsPin) {
          setPinStep(true);
        }
      }
    } catch (e) {
      console.error('Auth error:', e);
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPin = async () => {
    if (submitting) return;
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError('Please enter your 4-digit passkey.');
      return;
    }
    setSubmitting(true);
    try {
      await verifyPin(pin);
    } catch (e) {
      console.error('PIN verify error:', e);
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setPinStep(false);
    setPin('');
    setError(null);
  };

  const handleGuest = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await loginAsGuest();
    } catch (e) {
      console.error('Guest login error:', e);
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const renderPinField = (label: string, value: string, onChange: (value: string) => void) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: surfaceElevated, borderColor: border }]}>
        <Ionicons name="keypad-outline" size={18} color={textSecondary} />
        <TextInput
          style={[styles.input, { color: text }]}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))}
          placeholder="Enter 4 digits"
          placeholderTextColor={textSecondary}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={PIN_LENGTH}
        />
      </View>
    </View>
  );

  const subtitle = pinStep
    ? 'Enter your 4-digit passkey to finish logging in'
    : mode === 'login'
      ? 'Welcome back, log in to continue'
      : 'Set a password and a 4-digit passkey';

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={[styles.brandIcon, { backgroundColor: accent + '18' }]}>
            <Ionicons name="heart" size={44} color={accent} />
          </View>
          <Text style={[styles.brandTitle, { color: text }]}>Wishlist</Text>
          <Text style={[styles.brandSubtitle, { color: textSecondary }]}>{subtitle}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          {pinStep ? (
            <>
              <View style={styles.pinHeader}>
                <View style={[styles.pinIcon, { backgroundColor: accent + '18' }]}>
                  <Ionicons name="shield-checkmark" size={28} color={accent} />
                </View>
                <Text style={[styles.pinTitle, { color: text }]}>Passkey required</Text>
                <Text style={[styles.pinSubtitle, { color: textSecondary }]}>
                  Password verified. Enter your 4-digit passkey to finish logging in.
                </Text>
              </View>

              {renderPinField('Passkey', pin, setPin)}

              {error && (
                <View style={[styles.errorWrap, { backgroundColor: danger + '12' }]}>
                  <Ionicons name="alert-circle" size={16} color={danger} />
                  <Text style={[styles.errorText, { color: danger }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accent, opacity: submitting ? 0.6 : 1 }]}
                onPress={handleVerifyPin}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>Verify</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                <Text style={[styles.backText, { color: textSecondary }]}>Back to log in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.segment, { backgroundColor: surfaceElevated, borderColor: border }]}>
                {(['login', 'register'] as Mode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.segmentBtn, mode === m && { backgroundColor: accent }]}
                    onPress={() => switchMode(m)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: mode === m ? '#FFFFFF' : textSecondary, fontWeight: mode === m ? '700' : '500' },
                      ]}
                    >
                      {m === 'login' ? 'Log In' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: textSecondary }]}>Email</Text>
                <View style={[styles.inputWrap, { backgroundColor: surfaceElevated, borderColor: border }]}>
                  <Ionicons name="mail-outline" size={18} color={textSecondary} />
                  <TextInput
                    style={[styles.input, { color: text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: textSecondary }]}>Password</Text>
                <View style={[styles.inputWrap, { backgroundColor: surfaceElevated, borderColor: border }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={textSecondary} />
                  <TextInput
                    style={[styles.input, { color: text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={mode === 'register' ? 'new-password' : 'password'}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {mode === 'register' && renderPinField('Passkey (4 digits)', pin, setPin)}

              {error && (
                <View style={[styles.errorWrap, { backgroundColor: danger + '12' }]}>
                  <Ionicons name="alert-circle" size={16} color={danger} />
                  <Text style={[styles.errorText, { color: danger }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: accent, opacity: submitting ? 0.6 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>{mode === 'login' ? 'Log In' : 'Create Account'}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.guestRow}>
          <View style={[styles.guestLine, { backgroundColor: border }]} />
          <Text style={[styles.guestOr, { color: textSecondary }]}>or</Text>
          <View style={[styles.guestLine, { backgroundColor: border }]} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} disabled={submitting} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={18} color={textSecondary} />
          <Text style={[styles.guestText, { color: textSecondary }]}>Continue without an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
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
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 16,
  },
  pinHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pinIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  pinSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
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
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  guestLine: {
    flex: 1,
    height: 1,
  },
  guestOr: {
    fontSize: 13,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  guestText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
