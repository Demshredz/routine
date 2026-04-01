import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { format, getHours, getMinutes } from 'date-fns';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Routine } from '@/store/useRoutineStore';
import { TimelineCard } from './TimelineCard';
import { NowIndicator } from './NowIndicator';

const HOUR_HEIGHT = 72; // Height per hour slot in pixels
const TIMELINE_START_HOUR = 5;  // Timeline starts at 5 AM
const TIMELINE_END_HOUR = 23;   // Timeline ends at 11 PM

interface TimelineViewProps {
  routines: Routine[];
  completions: string[];
  theme: { background: string; card: string; text: string; tint: string; mute: string };
  themeColor: string;
  isDark: boolean;
  isToday?: boolean;
  onToggle: (id: string, isCompleted: boolean) => void;
  onAddAtTime?: (hour: number) => void;
}

const parseTime = (timeStr?: string): { hours: number; minutes: number } | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  return { hours: parseInt(parts[0], 10), minutes: parseInt(parts[1], 10) };
};

const getTimePosition = (timeStr?: string): number | null => {
  const parsed = parseTime(timeStr);
  if (!parsed) return null;
  const hourOffset = parsed.hours - TIMELINE_START_HOUR;
  const minuteOffset = parsed.minutes / 60;
  return (hourOffset + minuteOffset) * HOUR_HEIGHT;
};

export const TimelineView = React.memo(({
  routines,
  completions,
  theme,
  themeColor,
  isDark,
  isToday = true,
  onToggle,
  onAddAtTime,
}: TimelineViewProps) => {
  const now = new Date();
  const currentHour = getHours(now);
  const currentMinute = getMinutes(now);
  const nowPosition = ((currentHour - TIMELINE_START_HOUR) + (currentMinute / 60)) * HOUR_HEIGHT;

  // Sort routines by time, then unscheduled at end
  const { scheduled, unscheduled } = useMemo(() => {
    const sched: Routine[] = [];
    const unsched: Routine[] = [];
    routines.forEach(r => {
      if (r.time) sched.push(r);
      else unsched.push(r);
    });
    sched.sort((a, b) => {
      const timeA = parseTime(a.time);
      const timeB = parseTime(b.time);
      if (!timeA || !timeB) return 0;
      return (timeA.hours * 60 + timeA.minutes) - (timeB.hours * 60 + timeB.minutes);
    });
    return { scheduled: sched, unscheduled: unsched };
  }, [routines]);

  const totalHeight = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * HOUR_HEIGHT;

  // Build hour labels
  const hourSlots = useMemo(() => {
    const slots = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      slots.push(h);
    }
    return slots;
  }, []);

  return (
    <View style={styles.container}>
      {/* TIMELINE SECTION */}
      <View style={[styles.timelineContainer, { minHeight: totalHeight }]}>
        {/* Hour rows (grid lines) */}
        {hourSlots.map((hour) => {
          const top = (hour - TIMELINE_START_HOUR) * HOUR_HEIGHT;
          return (
            <TouchableOpacity
              key={`hour-${hour}`}
              style={[styles.hourRow, { top }]}
              onPress={() => {
                if (onAddAtTime) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onAddAtTime(hour);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.hourLabel, { color: theme.text }]}>
                {`${hour.toString().padStart(2, '0')}:00`}
              </Text>
              <View style={[styles.hourLine, { backgroundColor: isDark ? '#1F1F23' : '#F1F5F9' }]} />
            </TouchableOpacity>
          );
        })}

        {/* Now indicator */}
        {isToday && currentHour >= TIMELINE_START_HOUR && currentHour <= TIMELINE_END_HOUR && (
          <View style={[styles.nowIndicatorWrapper, { top: nowPosition }]}>
            <NowIndicator themeColor={themeColor} />
          </View>
        )}

        {/* Scheduled routine cards */}
        {scheduled.map((routine) => {
          const position = getTimePosition(routine.time);
          if (position === null) return null;
          const isCompleted = completions.includes(routine.id);
          const cardHeight = routine.duration
            ? Math.max((routine.duration / 60) * HOUR_HEIGHT, 56)
            : 56;

          return (
            <View
              key={routine.id}
              style={[styles.scheduledCard, { top: position, marginLeft: 60 }]}
            >
              <TimelineCard
                id={routine.id}
                title={routine.title}
                type={routine.type}
                time={routine.time}
                endTime={routine.endTime}
                duration={routine.duration}
                dosage={routine.dosage}
                icon={routine.icon}
                color={routine.color}
                isCompleted={isCompleted}
                themeColor={themeColor}
                theme={theme}
                onToggle={onToggle}
              />
            </View>
          );
        })}
      </View>

      {/* UNSCHEDULED SECTION */}
      {unscheduled.length > 0 && (
        <View style={styles.unscheduledSection}>
          <Text style={[styles.unscheduledTitle, { color: theme.text }]}>
            Ohne Uhrzeit
          </Text>
          {unscheduled.map((routine) => {
            const isCompleted = completions.includes(routine.id);
            return (
              <TimelineCard
                key={routine.id}
                id={routine.id}
                title={routine.title}
                type={routine.type}
                dosage={routine.dosage}
                icon={routine.icon}
                color={routine.color}
                isCompleted={isCompleted}
                themeColor={themeColor}
                theme={theme}
                onToggle={onToggle}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timelineContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.4,
    paddingTop: 0,
    textAlign: 'right',
    paddingRight: 8,
  },
  hourLine: {
    flex: 1,
    height: 1,
    marginTop: 7,
  },
  nowIndicatorWrapper: {
    position: 'absolute',
    left: 46,
    right: 0,
    zIndex: 10,
  },
  scheduledCard: {
    position: 'absolute',
    right: 0,
    left: 0,
    zIndex: 5,
  },
  unscheduledSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  unscheduledTitle: {
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
