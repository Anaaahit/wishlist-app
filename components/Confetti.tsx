import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const CONFETTI_COUNT = 40;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  delay: number;
}

export function Confetti({ onComplete }: { onComplete?: () => void }) {
  const colors = [
    useThemeColor({}, 'confetti1'),
    useThemeColor({}, 'confetti2'),
    useThemeColor({}, 'confetti3'),
    useThemeColor({}, 'confetti4'),
    useThemeColor({}, 'confetti5'),
  ];

  const particles = useRef<Particle[]>(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 300,
    }))
  ).current;

  useEffect(() => {
    const animations = particles.map((p) =>
      Animated.parallel([
        Animated.timing(p.x, {
          toValue: (Math.random() - 0.5) * SCREEN_WIDTH * 0.8,
          duration: 1200,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: SCREEN_HEIGHT * 0.6 + Math.random() * SCREEN_HEIGHT * 0.4,
          duration: 1200,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotation, {
          toValue: Math.random() * 720 - 360,
          duration: 1200,
          delay: p.delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 400,
          delay: p.delay + 800,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate: p.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
