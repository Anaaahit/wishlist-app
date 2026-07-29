import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WishlistProvider } from '@/context/WishlistContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function RootLayout() {
  return (
    <WishlistProvider>
      <SettingsProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsProvider>
    </WishlistProvider>
  );
}
