import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import { useAppTheme } from '@/hooks/use-app-theme';
import { useRoutineStore } from '@/store/useRoutineStore';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';

export default function CalendarScreen() {
  const { theme, themeColor, isDark } = useAppTheme();
  const router = useRouter();
  
  const completions = useRoutineStore((state) => state.completions);
  const selectedDate = useRoutineStore((state) => state.selectedDate);
  const setSelectedDate = useRoutineStore((state) => state.setSelectedDate);
  const routines = useRoutineStore((state) => state.routines);

  // Local state for which month the calendar is currently showing
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate));

  const handleDayPress = (dateKey: string) => {
    setSelectedDate(dateKey);
    // Navigate back to the Home tab where the Timeline is
    router.push('/(tabs)');
  };

  // Stats for the currently selected month
  const totalRoutines = routines.length;
  // Calculate how many completions happened in the current month
  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  const monthCompletionsCount = Object.keys(completions).filter(k => k.startsWith(currentMonthStr)).reduce((acc, k) => acc + completions[k].length, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Kalender</Text>
          <Text style={[styles.subtitle, { color: theme.mute }]}>
            Deine Reise im Überblick
          </Text>
        </View>

        <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
          <MonthlyCalendar
            currentDate={currentMonth}
            selectedDateStr={selectedDate}
            completions={completions}
            themeColor={themeColor}
            isDark={isDark}
            theme={theme}
            onDateChange={setCurrentMonth}
            onDayPress={handleDayPress}
          />
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: themeColor }]}>{monthCompletionsCount}</Text>
            <Text style={[styles.statLabel, { color: theme.mute }]}>Abgeschlossen in {format(currentMonth, 'MMMM', { locale: de })}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendarCard: {
    borderRadius: 24,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
