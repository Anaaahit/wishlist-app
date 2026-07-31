import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { WishlistProvider } from '@/context/WishlistContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const background = useThemeColor({}, 'background');
  const accent = useThemeColor({}, 'accent');

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: background }}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <SettingsProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SettingsProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
