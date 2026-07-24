import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WishlistProvider } from "@/context/WishlistContext";

export default function RootLayout() {
  return (
    <WishlistProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </WishlistProvider>
  );
}
