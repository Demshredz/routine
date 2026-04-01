import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40; // 20 padding on each side
const CELL_SIZE = CALENDAR_WIDTH / 7;

interface MonthlyCalendarProps {
  currentDate: Date; // The month being viewed
  selectedDateStr: string; // The active date (YYYY-MM-DD)
  completions: Record<string, string[]>; // dateKey -> array of completed routine IDs
  themeColor: string;
  isDark: boolean;
  theme: { text: string; card: string; mute: string };
  onDateChange: (newMonth: Date) => void;
  onDayPress: (dateKey: string) => void;
}

export const MonthlyCalendar = React.memo(({
  currentDate,
  selectedDateStr,
  completions,
  themeColor,
  isDark,
  theme,
  onDateChange,
  onDayPress,
}: MonthlyCalendarProps) => {
  const selectedDate = new Date(selectedDateStr);
  const actualToday = new Date();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateChange(addMonths(currentDate, 1));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: theme.text }]}>
          {format(currentDate, 'MMMM yyyy', { locale: de })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
          <ChevronRight size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Week Day Headers */}
      <View style={styles.weekRow}>
        {weekDays.map((day, idx) => (
          <View key={idx} style={styles.weekDayCell}>
            <Text style={[styles.weekDayText, { color: theme.mute }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, actualToday);
          const dayCompletions = completions[dateKey] || [];
          const hasActivity = dayCompletions.length > 0;

          return (
            <TouchableOpacity
              key={dateKey}
              style={styles.dayCell}
              onPress={() => {
                Haptics.selectionAsync();
                onDayPress(dateKey);
              }}
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.dayCircle,
                  isSelected && { backgroundColor: themeColor },
                  !isSelected && isToday && { borderWidth: 1, borderColor: themeColor }
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? '#FFF' : isCurrentMonth ? theme.text : theme.mute },
                    isSelected && { fontWeight: '700' }
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>

              {/* Activity Dot */}
              {hasActivity && !isSelected && (
                <View style={[styles.activityDot, { backgroundColor: themeColor }]} />
              )}
              {hasActivity && isSelected && (
                <View style={[styles.activityDot, { backgroundColor: '#FFF' }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navBtn: {
    padding: 8,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
});
