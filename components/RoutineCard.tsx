import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Trash2, PlayCircle, PauseCircle, Check, Circle } from 'lucide-react-native';
import { RoutineType } from '@/store/useRoutineStore';
import { useTranslation } from 'react-i18next';

export interface RoutineCardProps {
  id: string;
  title: string;
  type: RoutineType;
  dosage?: string;
  isCompleted: boolean;
  theme: { card: string; text: string; tint: string };
  themeColor: string;
  onToggle: (id: string, isCompleted: boolean) => void;
  onRemove: (id: string) => void;
}

const areEqual = (prevProps: RoutineCardProps, nextProps: RoutineCardProps) => {
  return (
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.theme.tint === nextProps.theme.tint &&
    prevProps.title === nextProps.title
  );
};

export const RoutineCard = React.memo(({ 
  id, title, type, dosage, isCompleted, theme, themeColor, onToggle, onRemove 
}: RoutineCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isSupplement = type === 'supplement';
  const isAudioRoute = title.toLowerCase().includes('atem') || title.toLowerCase().includes('meditation') || title.toLowerCase().includes('breath');

  const renderRightActions = () => (
    <TouchableOpacity 
      style={[styles.deleteAction, { backgroundColor: '#EF4444' }]} 
      onPress={() => onRemove(id)}
      accessibilityRole="button"
      accessibilityLabel={`Lösche ${title}`}
    >
      <Trash2 color="#FFF" size={24} />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} containerStyle={{ marginBottom: 12, borderRadius: 16 }}>
      <TouchableOpacity 
        style={[ styles.routineItem, { backgroundColor: theme.card, marginBottom: 0 }, isCompleted && { opacity: 0.5 }, isSupplement && { borderLeftWidth: 4, borderLeftColor: themeColor } ]}
        onPress={() => onToggle(id, isCompleted)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`${title}, ${t(type)}`}
        accessibilityHint="Doppeltippen, um den Status umzuschalten"
      >
        <View style={styles.routineHeader}>
          <Text style={[styles.routineTitle, { color: theme.text }, isCompleted && styles.completedText]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.typeBadgeContainer}>
            <Text style={[styles.routineType, { color: themeColor }]}>{t(type)}</Text>
            {isSupplement && dosage && (
              <View style={styles.dosageBadge}>
                <Text style={styles.dosageText}>{dosage}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {isAudioRoute && !isCompleted && (
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              accessibilityRole="button"
              accessibilityLabel="Audio abspielen"
            >
              {isExpanded ? <PauseCircle size={24} color={themeColor} /> : <PlayCircle size={24} color={themeColor} opacity={0.5} />}
            </TouchableOpacity>
          )}
          <MotiView animate={{ scale: isCompleted ? 1.1 : 1 }} transition={{ type: 'spring' }} style={[styles.checkbox, isCompleted && { backgroundColor: themeColor, borderColor: themeColor }]}>
            {isCompleted ? <Check size={16} color="#FFF" /> : <Circle size={16} color={theme.text} opacity={0.3} />}
          </MotiView>
        </View>
      </TouchableOpacity>

      {/* Audio Player Expander */}
      {isExpanded && (
        <MotiView 
          from={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 60 }} 
          style={[styles.audioPlayerBg, { backgroundColor: theme.card }]}
          accessibilityRole="adjustable"
          accessibilityLabel="Audio Player"
        >
          <View style={styles.waveform}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
              <MotiView 
                key={n} 
                from={{ height: 4 }} animate={{ height: Math.random() * 20 + 4 }} 
                transition={{ type: 'timing', duration: 400 + Math.random() * 400, loop: true }}
                style={{ width: 4, borderRadius: 2, backgroundColor: themeColor, marginHorizontal: 2 }}
              />
            ))}
          </View>
          <Text style={{ color: themeColor, fontWeight: '700', fontSize: 13, marginRight: 10 }}>01:24 / 05:00</Text>
        </MotiView>
      )}
    </Swipeable>
  );
}, areEqual);

const styles = StyleSheet.create({
  routineItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  routineHeader: { flex: 1, paddingRight: 16 },
  routineTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  typeBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routineType: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  dosageBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dosageText: { fontSize: 11, fontWeight: '600', color: '#666' },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  deleteAction: { width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginBottom: 2 },
  audioPlayerBg: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40 }
});
