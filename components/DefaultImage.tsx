import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export function DefaultImage({ size = 56 }: { size?: number }) {
  const bg = useThemeColor({}, 'progressTrack');
  const icon = useThemeColor({}, 'textDimmed');

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size * 0.18, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.icon, { color: icon, fontSize: size * 0.35 }]}>♡</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontWeight: '300',
  },
});
