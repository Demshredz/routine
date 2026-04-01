import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore } from '@/store/useRoutineStore';
import { Share, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import { format, subDays } from 'date-fns';
import { Sprout, TreePine, TreeDeciduous, HeartPulse, Smartphone, Droplet } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const RADIUS = width * 0.25;
const STROKE_WIDTH = 20;

// === MEMOIZED COMPONENTS (Phase 23) ===

const ProgressRing = React.memo(({ progressPercent, theme }: { progressPercent: number, theme: any }) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progressPercent, {
      duration: 1500,
      easing: Easing.inOut(Easing.cubic)
    });
  }, [progressPercent]);

  const circlePath = Skia.Path.Make();
  circlePath.addCircle(width / 2, RADIUS + STROKE_WIDTH, RADIUS);

  return (
    <Canvas style={{ width: width, height: RADIUS * 2 + STROKE_WIDTH * 2 }}>
      <Path path={circlePath} color={theme.ringBg} style="stroke" strokeWidth={STROKE_WIDTH} strokeCap="round" />
      <Path path={circlePath} color={theme.tint} style="stroke" strokeWidth={STROKE_WIDTH} strokeCap="round" start={0} end={progressValue} />
    </Canvas>
  );
});

const HeatmapChart = React.memo(({ completions, totalRoutines, theme, isDark, heatmapWeeks }: { completions: any, totalRoutines: number, theme: any, isDark: boolean, heatmapWeeks: string[][] }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heatmapScroll}>
      {heatmapWeeks.map((week, wIndex) => (
        <View key={`week-${wIndex}`} style={styles.heatmapWeek}>
          {week.map((dayKey) => {
            const completedCount = (completions[dayKey] || []).length;
            const ratio = totalRoutines > 0 ? completedCount / totalRoutines : 0;
            
            let boxStyle = { backgroundColor: theme.ringBg, borderWidth: 1, borderColor: isDark ? '#333' : '#E2E8F0' };
            if (ratio > 0) {
               boxStyle = { 
                 backgroundColor: theme.tint, borderColor: theme.tint, opacity: Math.max(0.3, ratio)
               } as any;
            }
            return <View key={dayKey} style={[styles.heatmapBox, boxStyle]} />;
          })}
        </View>
      ))}
    </ScrollView>
  );
});

// ===================================

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { isDark, theme } = useAppTheme();
  const router = useRouter();

  const routines = useRoutineStore((s) => s.routines);
  const completions = useRoutineStore((s) => s.completions);
  const streak = useRoutineStore((s) => s.streak);
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  
  const todayCompleted = (completions[todayKey] || []).length;
  const totalRoutines = routines.length;
  const progressPercent = totalRoutines > 0 ? todayCompleted / totalRoutines : 0;
  
  // Health Mock States
  const [appleHealthEnabled, setAppleHealthEnabled] = useState(false);
  const [googleFitEnabled, setGoogleFitEnabled] = useState(false);

  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    let currentDate = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekDays = [];
      for (let d = 6; d >= 0; d--) {
        const dayDate = subDays(currentDate, w * 7 + d);
        weekDays.push(format(dayDate, 'yyyy-MM-dd'));
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, []);

  const renderGardenState = () => {
    if (streak < 3) return <Sprout size={64} color="#10B981" />;
    if (streak < 14) return <TreePine size={64} color="#059669" />;
    return <TreeDeciduous size={64} color="#047857" />;
  };

  const gardenLevelName = streak < 3 ? 'Zarter Keimling' : streak < 14 ? 'Starke Kiefer' : 'Uralter Baum';
  const gardenMessage = streak === 0 
    ? 'Dein Garten braucht Wasser. Erledige Routinen!' 
    : `Dein Garten wächst dank deines ${streak}-Tage Streaks!`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('insights')}</Text>
          <Text style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}>{t('streak_label')}: {streak} {t('days')}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.push('/export')}>
          <Shield color={theme.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <ProgressRing progressPercent={progressPercent} theme={theme} />
          
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.centerTextContainer}>
              <Text style={[styles.percentText, { color: theme.text }]}>{Math.round(progressPercent * 100)}%</Text>
              <Text style={[styles.completedText, { color: theme.text, opacity: 0.5 }]}>
                {todayCompleted} von {totalRoutines}
              </Text>
            </View>
          </View>
        </View>

        {/* The Garden (Phase 9) */}
        <View style={styles.gardenSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dein Zen-Garten</Text>
          <View style={[styles.gardenCard, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#065F46' : '#D1FAE5', borderWidth: 1 }]}>
            <View style={styles.gardenHeader}>
              <View>
                <Text style={[styles.gardenTitle, { color: isDark ? '#34D399' : '#059669' }]}>{gardenLevelName}</Text>
                <Text style={[styles.gardenSubtitle, { color: isDark ? '#A7F3D0' : '#10B981', marginTop: 4 }]}>{gardenMessage}</Text>
              </View>
              {streak > 0 && (
                <MotiView
                  from={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: 'timing', duration: 1500, loop: true }}
                >
                  <Droplet size={20} color="#3B82F6" fill="#60A5FA" />
                </MotiView>
              )}
            </View>
            <View style={styles.gardenStage}>
               <MotiView
                  from={{ translateY: 5, scale: 0.95 }}
                  animate={{ translateY: 0, scale: 1 }}
                  transition={{ type: 'timing', duration: 3000, loop: true }}
               >
                 {renderGardenState()}
               </MotiView>
            </View>
            {/* Ground line */}
            <View style={{ height: 4, width: '60%', backgroundColor: '#059669', opacity: 0.2, marginTop: 10, borderRadius: 2 }} />
          </View>
        </View>

        <View style={styles.heatmapSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Heatmap (90 Tage)</Text>
          <HeatmapChart 
            completions={completions} 
            totalRoutines={totalRoutines} 
            theme={theme} 
            isDark={isDark} 
            heatmapWeeks={heatmapWeeks} 
          />
        </View>

        {/* Breakdown Analysis (Phase 16) */}
        <View style={styles.breakdownSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Insights</Text>
          <View style={[styles.breakdownCard, { backgroundColor: theme.card }]}>
             {(['morning', 'afternoon', 'evening', 'supplement'] as const).map((type) => {
               // Calculate stats for this type
               const routinesOfType = routines.filter(r => r.type === type);
               if (routinesOfType.length === 0) return null;
               
               const completedOfType = routinesOfType.filter(r => (completions[todayKey] || []).includes(r.id)).length;
               const ratio = completedOfType / routinesOfType.length;
               
               return (
                 <View key={type} style={styles.breakdownRow}>
                   <View style={styles.breakdownTextRow}>
                     <Text style={[styles.breakdownLabel, { color: theme.text }]}>{t(type)}</Text>
                     <Text style={[styles.breakdownVal, { color: theme.text, opacity: 0.6 }]}>{completedOfType} / {routinesOfType.length}</Text>
                   </View>
                   <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#333' : '#E2E8F0' }]}>
                     <MotiView 
                       from={{ width: '0%' }}
                       animate={{ width: `${ratio * 100}%` }}
                       transition={{ type: 'timing', duration: 1500 }}
                       style={[styles.progressBarFill, { backgroundColor: theme.tint }]}
                     />
                   </View>
                 </View>
               );
             })}
             {routines.length === 0 && <Text style={{ color: theme.text, opacity: 0.5, textAlign: 'center' }}>Lege Routinen an, um Insights zu sammeln.</Text>}
          </View>
        </View>

        {/* OS Integration & Health (Phase 9 & 10 Mock) */}
        <View style={styles.healthSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Smart Sync & Health</Text>
          <View style={[styles.healthCard, { backgroundColor: theme.card }]}>
             <View style={styles.healthRow}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                   <HeartPulse color="#EF4444" size={24} />
                </View>
                <View style={styles.healthTextCol}>
                   <Text style={[styles.healthTitle, { color: theme.text }]}>Apple Health</Text>
                   <Text style={[styles.healthDesc, { color: theme.text, opacity: 0.6 }]}>Workouts automatisch synchronisieren.</Text>
                </View>
                <Switch 
                   value={appleHealthEnabled} 
                   onValueChange={(val) => {
                      Haptics.impactAsync();
                      setAppleHealthEnabled(val);
                   }} 
                />
             </View>
             
             <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#F1F5F9' }]} />

             <View style={styles.healthRow}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                   <Smartphone color="#3B82F6" size={24} />
                </View>
                <View style={styles.healthTextCol}>
                   <Text style={[styles.healthTitle, { color: theme.text }]}>Google Fit</Text>
                   <Text style={[styles.healthDesc, { color: theme.text, opacity: 0.6 }]}>Aktivitäten automatisch synchronisieren.</Text>
                </View>
                <Switch 
                   value={googleFitEnabled} 
                   onValueChange={(val) => {
                      Haptics.impactAsync();
                      setGoogleFitEnabled(val);
                   }} 
                />
             </View>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 16, fontWeight: '500' },
  chartContainer: { 
    alignItems: 'center', justifyContent: 'center', marginVertical: 30,
    height: RADIUS * 2 + STROKE_WIDTH * 2 
  },
  centerTextContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  percentText: { fontSize: 44, fontWeight: '900' },
  completedText: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  
  gardenSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  gardenCard: { 
    borderRadius: 24, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  gardenHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  gardenTitle: { fontSize: 20, fontWeight: '800' },
  gardenSubtitle: { fontSize: 13, fontWeight: '600', maxWidth: '90%' },
  gardenStage: { height: 80, alignItems: 'center', justifyContent: 'center' },

  heatmapSection: { paddingHorizontal: 20, marginBottom: 30 },
  heatmapScroll: { flexDirection: 'row', gap: 6, paddingRight: 20 },
  heatmapWeek: { gap: 6, flexDirection: 'column' },
  heatmapBox: { width: 14, height: 14, borderRadius: 4 },

  healthSection: { paddingHorizontal: 20, marginBottom: 20 },
  healthCard: {
    borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  healthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  healthTextCol: { flex: 1, marginRight: 16 },
  healthTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  healthDesc: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, width: '100%', marginVertical: 16 },

  breakdownSection: { paddingHorizontal: 20, marginBottom: 30 },
  breakdownCard: {
    padding: 24, borderRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 3,
  },
  breakdownRow: { marginBottom: 16 },
  breakdownTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownLabel: { fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  breakdownVal: { fontSize: 13, fontWeight: '700' },
  progressBarBg: { height: 10, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 }
});
