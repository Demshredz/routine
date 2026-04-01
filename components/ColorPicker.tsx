import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

export const THEME_COLORS = [
  { value: '#10B981', label: 'Emerald' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#F43F5E', label: 'Rose' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#6366F1', label: 'Indigo' },
];

interface ColorPickerProps {
  selectedColor?: string;
  isDark: boolean;
  textColor: string;
  onSelect: (color: string) => void;
}

export const ColorPicker = React.memo(({
  selectedColor,
  isDark,
  textColor,
  onSelect,
}: ColorPickerProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>Farbe wählen</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {THEME_COLORS.map((opt) => {
          const isSelected = selectedColor === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.colorButton,
                {
                  backgroundColor: opt.value,
                  borderColor: isSelected ? (isDark ? '#FFF' : '#000') : 'transparent',
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(opt.value);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Farbe: ${opt.label}`}
            >
              {isSelected && (
                <View style={styles.innerCircle} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 8,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    opacity: 0.9,
  },
});
