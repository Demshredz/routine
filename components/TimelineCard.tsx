import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Check, Circle } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { RoutineType } from '@/store/useRoutineStore';

export interface TimelineCardProps {
  id: string;
  title: string;
  type: RoutineType;
  time?: string;
  endTime?: string;
  duration?: number;
  dosage?: string;
  icon?: string;
  color?: string;
  isCompleted: boolean;
  themeColor: string;
  theme: { card: string; text: string; tint: string; mute: string };
  onToggle: (id: string, isCompleted: boolean) => void;
}

const areEqual = (prev: TimelineCardProps, next: TimelineCardProps) => {
  return (
    prev.isCompleted === next.isCompleted &&
    prev.title === next.title &&
    prev.time === next.time &&
    prev.theme.tint === next.theme.tint
  );
};

const getRoutineIcon = (iconName?: string, color?: string, size: number = 20) => {
  if (!iconName) return null;
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color || '#666'} />;
};

const formatDuration = (duration?: number): string => {
  if (!duration) return '';
  if (duration < 60) return `${duration} Min`;
  const hrs = Math.floor(duration / 60);
  const mins = duration % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const TimelineCard = React.memo(({
  id, title, type, time, endTime, duration, dosage, icon, color,
  isCompleted, themeColor, theme, onToggle
}: TimelineCardProps) => {
  const routineColor = color || themeColor;
  const timeLabel = time
    ? endTime
      ? `${time} – ${endTime}`
      : duration
        ? `${time} (${formatDuration(duration)})`
        : time
    : null;

  const swipeableRef = React.useRef<Swipeable>(null);

  const renderLeftActions = () => (
    <View style={{ backgroundColor: routineColor, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 24, borderRadius: 16, marginBottom: 8, flex: 1 }}>
      <Check color="#FFF" size={28} />
    </View>
  );

  return (
    <Swipeable 
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableLeftOpen={() => {
        onToggle(id, isCompleted);
        setTimeout(() => swipeableRef.current?.close(), 300);
      }}
      containerStyle={{ flex: 1 }}
    >
      <TouchableOpacity
        style={[
        styles.card,
        { backgroundColor: theme.card },
        isCompleted && { opacity: 0.5 },
      ]}
      onPress={() => onToggle(id, isCompleted)}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
    >
      {/* Left color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: routineColor }]} />

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${routineColor}15` }]}>
          {getRoutineIcon(icon, routineColor) || (
            <View style={[styles.iconFallback, { backgroundColor: routineColor }]} />
          )}
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          {timeLabel && (
            <Text style={[styles.timeLabel, { color: routineColor }]}>{timeLabel}</Text>
          )}
          <Text
            style={[
              styles.title,
              { color: theme.text },
              isCompleted && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {dosage && (
            <View style={styles.dosageBadge}>
              <Text style={[styles.dosageText, { color: routineColor }]}>{dosage}</Text>
            </View>
          )}
        </View>

        {/* Checkbox */}
        <MotiView
          animate={{ scale: isCompleted ? 1.1 : 1 }}
          transition={{ type: 'spring' }}
          style={[
            styles.checkbox,
            isCompleted
              ? { backgroundColor: routineColor, borderColor: routineColor }
              : { borderColor: theme.mute },
          ]}
        >
          {isCompleted ? (
            <Check size={14} color="#FFF" />
          ) : (
            <Circle size={14} color={theme.text} opacity={0.3} />
          )}
        </MotiView>
      </View>
    </TouchableOpacity>
    </Swipeable>
  );
}, areEqual);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dosageBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  dosageText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
