import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const ICON_OPTIONS = [
  { name: 'Pill', label: 'Pille' },
  { name: 'Activity', label: 'Aktivität' },
  { name: 'Sun', label: 'Sonne' },
  { name: 'Moon', label: 'Mond' },
  { name: 'Coffee', label: 'Kaffee' },
  { name: 'Dumbbell', label: 'Hantel' },
  { name: 'BookOpen', label: 'Buch' },
  { name: 'Brain', label: 'Gehirn' },
  { name: 'Heart', label: 'Herz' },
  { name: 'Droplet', label: 'Wasser' },
  { name: 'Wind', label: 'Atmen' },
  { name: 'Apple', label: 'Apfel' },
  { name: 'Bike', label: 'Fahrrad' },
  { name: 'Bed', label: 'Schlaf' },
  { name: 'Pencil', label: 'Schreiben' },
  { name: 'Music', label: 'Musik' },
  { name: 'Eye', label: 'Meditation' },
  { name: 'Leaf', label: 'Natur' },
  { name: 'Zap', label: 'Energie' },
  { name: 'Shield', label: 'Schutz' },
  { name: 'Smartphone', label: 'Digital' },
  { name: 'Timer', label: 'Timer' },
  { name: 'Salad', label: 'Ernährung' },
  { name: 'Sparkles', label: 'Ritual' },
];

interface IconPickerProps {
  selectedIcon?: string;
  accentColor: string;
  isDark: boolean;
  textColor: string;
  onSelect: (iconName: string) => void;
}

export const IconPicker = React.memo(({
  selectedIcon,
  accentColor,
  isDark,
  textColor,
  onSelect,
}: IconPickerProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>Icon wählen</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ICON_OPTIONS.map((opt) => {
          const isSelected = selectedIcon === opt.name;
          const IconComponent = (LucideIcons as any)[opt.name];
          if (!IconComponent) return null;

          return (
            <TouchableOpacity
              key={opt.name}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isSelected
                    ? `${accentColor}20`
                    : isDark ? '#2C2C2E' : '#F1F5F9',
                  borderColor: isSelected ? accentColor : 'transparent',
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(opt.name);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={opt.label}
            >
              <IconComponent
                size={22}
                color={isSelected ? accentColor : (isDark ? '#AAA' : '#666')}
              />
              <Text
                style={[
                  styles.iconLabel,
                  { color: isSelected ? accentColor : (isDark ? '#888' : '#94A3B8') },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
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
    gap: 8,
    paddingRight: 16,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 4,
  },
  iconLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
