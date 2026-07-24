import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CATEGORIES } from '@/types/wishlist';

interface CategoryTagsProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function CategoryTags({ selected, onChange }: CategoryTagsProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const accent = useThemeColor({}, 'accent');
  const text = useThemeColor({}, 'text');

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: text }]}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.row}>
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? accent : surface,
                    borderColor: isSelected ? accent : border,
                  },
                ]}
                onPress={() => toggle(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isSelected ? '#FFFFFF' : text },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    marginHorizontal: -4,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 4,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
