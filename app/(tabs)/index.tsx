import React, { useState, useRef, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView as RNScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format, getHours, differenceInDays } from 'date-fns';
import { useRoutineStore, RoutineType, Routine } from '@/store/useRoutineStore';
import { Check, Circle, Plus, Bell, Crown, Flame, LayoutList, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, ScrollView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { RoutineCard } from '@/components/RoutineCard';
import { TimelineView } from '@/components/TimelineView';
import { IconPicker } from '@/components/IconPicker';
import { ColorPicker, THEME_COLORS } from '@/components/ColorPicker';
import { Repeat } from 'lucide-react-native';
import { scheduleDailyRoutineNotification, cancelNotification } from '@/utils/notifications';

export type ViewMode = 'list' | 'timeline';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, theme, themeColor } = useAppTheme();
  
  const routines = useRoutineStore((state) => state.routines);
  const completions = useRoutineStore((state) => state.completions);
  const streak = useRoutineStore((state) => state.streak);
  const toggleCompletion = useRoutineStore((state) => state.toggleCompletion);
  const addRoutine = useRoutineStore((state) => state.addRoutine);
  const removeRoutine = useRoutineStore((state) => state.removeRoutine);
  const showConfetti = useRoutineStore((state) => state.showConfetti);
  const resetConfetti = useRoutineStore((state) => state.resetConfetti);
  const moods = useRoutineStore((state) => state.moods);
  const setMood = useRoutineStore((state) => state.setMood);
  const selectedDate = useRoutineStore((state) => state.selectedDate);
  const setSelectedDate = useRoutineStore((state) => state.setSelectedDate);
  
  const isPro = useRoutineStore((state) => state.isPro);
  const trialStartDate = useRoutineStore((state) => state.trialStartDate);
  const setIsPro = useRoutineStore((state) => state.setIsPro);
  const resetTrial = useRoutineStore((state) => state.resetTrial);
  const isTrialActive = differenceInDays(new Date(), new Date(trialStartDate)) < 7;
  const hasFullAccess = isPro || isTrialActive;

  const [activeTab, setActiveTab] = useState<RoutineType | 'all'>('morning');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  const actualTodayKey = format(new Date(), 'yyyy-MM-dd');
  const isToday = selectedDate === actualTodayKey;
  
  const dateCompletions = completions[selectedDate] || [];
  const currentHour = getHours(new Date());

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<RoutineType>('morning');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newIcon, setNewIcon] = useState<string>('Activity');
  const [newColor, setNewColor] = useState<string>(THEME_COLORS[0].value);
  const [newRecurrence, setNewRecurrence] = useState<'daily' | 'weekdays' | 'weekends'>('daily');

  const handleToggle = (id: string, isCompleted: boolean) => {
    Haptics.impactAsync(isCompleted ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleCompletion(id, selectedDate);
  };

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  };

  const handleAddRoutine = async () => {
    if (!newTitle.trim()) return;

    if (!hasFullAccess) {
       if (routines.length >= 3 || newType === 'supplement') {
         bottomSheetModalRef.current?.dismiss();
         setTimeout(() => router.push('/paywall'), 300);
         return;
       }
    }

    let notificationId;
    if (newTime) {
      const parts = newTime.split(':');
      if (parts.length === 2) {
         const h = parseInt(parts[0], 10);
         const m = parseInt(parts[1], 10);
         if (!isNaN(h) && !isNaN(m)) {
           notificationId = await scheduleDailyRoutineNotification(newTitle.trim(), "Es ist Zeit für deine Routine!", h, m);
         }
      }
    }

    addRoutine({ 
      title: newTitle.trim(), 
      type: newType,
      time: newTime.trim() || undefined,
      dosage: newType === 'supplement' ? newDosage.trim() : undefined,
      icon: newIcon,
      color: newColor,
      recurrence: { type: newRecurrence },
      notificationId
    });

    setNewTitle('');
    setNewDosage('');
    setNewTime('');
    setNewType('morning');
    setNewIcon('Activity');
    setNewColor(THEME_COLORS[0].value);
    setNewRecurrence('daily');
    bottomSheetModalRef.current?.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const sortedRoutines = [...routines].filter(r => activeTab === 'all' || r.type === activeTab).sort((a, b) => {
    const aCompleted = dateCompletions.includes(a.id);
    const bCompleted = dateCompletions.includes(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    // Manual order applies within completed/uncompleted sections
    return 0; 
  });

  const greeting = currentHour < 5 ? 'Gute Nacht' : currentHour < 12 ? 'Guten Morgen' : currentHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const shouldAskMood = isToday && dateCompletions.length > 0 && typeof moods[selectedDate] === 'undefined';

  const renderHeader = () => (
    <View style={{ paddingBottom: 20 }}>
      {/* Dev Toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 10 }}>
        <TouchableOpacity 
          style={{ backgroundColor: isPro ? '#F59E0B' : isTrialActive ? '#10B981' : '#6B7280', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}
          onPress={() => {
            if (isPro) { setIsPro(false); resetTrial(); }
            else if (isTrialActive) { useRoutineStore.setState({ trialStartDate: Date.now() - 8 * 24 * 60 * 60 * 1000 }); }
            else { setIsPro(true); }
          }}
          accessibilityRole="button"
          accessibilityLabel="Entwickler-Modus umschalten"
        >
          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>DEV: {isPro ? 'PRO' : isTrialActive ? 'TRIAL' : 'FREE'}</Text>
        </TouchableOpacity>
      </View>

      {/* Mood Tracker */}
      {shouldAskMood && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.moodContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC' }]}
        >
          <Text style={[styles.moodTitle, { color: theme.text }]}>Wie ist dein Energielevel?</Text>
          <View style={styles.moodOptions}>
            {[1, 2, 3, 4, 5].map(score => (
              <TouchableOpacity
                key={score}
                style={[styles.moodBtn, { borderColor: themeColor }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setMood(selectedDate, score);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Energielevel ${score}`}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>{score}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>
      )}

      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingLabel, { color: themeColor }]}>{greeting},</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Mach dich bereit.</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* View Mode Toggle */}
          <View style={[styles.viewToggle, { backgroundColor: isDark ? '#1C1C1E' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'list' && { backgroundColor: themeColor },
              ]}
              onPress={() => { Haptics.selectionAsync(); setViewMode('list'); }}
            >
              <LayoutList size={16} color={viewMode === 'list' ? '#FFF' : theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'timeline' && { backgroundColor: themeColor },
              ]}
              onPress={() => { Haptics.selectionAsync(); setViewMode('timeline'); }}
            >
              <Clock size={16} color={viewMode === 'timeline' ? '#FFF' : theme.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={20} color="#F59E0B" fill={streak > 0 ? "#F59E0B" : "transparent"} />
            <Text style={styles.streakCount}>{streak}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {(['all', 'morning', 'afternoon', 'evening', 'supplement'] as (RoutineType | 'all')[]).map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[ styles.tabBtn, activeTab === tab ? { backgroundColor: themeColor } : { backgroundColor: isDark ? '#333' : '#E2E8F0' } ]} 
              onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab }}
              accessibilityLabel={`Filter: ${tab === 'all' ? 'Alle' : t(tab)}`}
            >
              <Text style={[styles.tabText, activeTab === tab ? { color: '#FFF' } : { color: theme.text }]}>{tab === 'all' ? 'Alle' : t(tab)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Routine>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive || activeTab !== 'all'}
          style={isActive && {
            shadowColor: themeColor,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 15,
            zIndex: 999
          }}
        >
          <Animated.View key={item.id} layout={LinearTransition.springify()}>
            <RoutineCard
              {...item}
              isCompleted={dateCompletions.includes(item.id)}
              themeColor={themeColor}
              theme={theme}
              onToggle={handleToggle}
              onRemove={(id) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                const target = routines.find(r => r.id === id);
                if (target?.notificationId) {
                  cancelNotification(target.notificationId);
                }
                removeRoutine(id);
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon count={200} origin={{x: width / 2, y: -20}} fadeOut fallSpeed={2500} onAnimationEnd={resetConfetti} />
        </View>
      )}

      {viewMode === 'list' ? (
        <>
          <DraggableFlatList
            data={sortedRoutines}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            itemLayoutAnimation={LinearTransition.springify()}
            onDragEnd={({ data }) => {
              // Extract the new IDs order
              const newOrder = data.map(r => r.id);
              // Store action to handle persistent reorder
              useRoutineStore.getState().reorderRoutines(newOrder);
            }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
                <Text style={{ color: theme.text }}>Keine Gewohnheiten für diese Ansicht.</Text>
              </View>
            )}
          />
        </>
      ) : (
        <RNScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          <TimelineView
            routines={routines}
            completions={dateCompletions}
            theme={theme}
            themeColor={themeColor}
            isDark={isDark}
            isToday={isToday}
            onToggle={handleToggle}
            onAddAtTime={(hour) => {
              setNewTime(`${hour.toString().padStart(2, '0')}:00`);
              handleOpenModal();
            }}
          />
        </RNScrollView>
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: themeColor }]} 
        onPress={handleOpenModal}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Neue Routine erstellen"
      >
        <Plus color="#FFF" size={32} />
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['90%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: isDark ? '#555' : '#CCC' }}
      >
        <BottomSheetScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sheetTitle, { color: theme.text }]}>Neue Routine</Text>
          <BottomSheetTextInput
            style={[styles.input, { backgroundColor: isDark ? '#333' : '#F1F5F9', color: theme.text }]}
            placeholder="z.B. Ashwagandha oder Lesen..."
            placeholderTextColor={isDark ? '#888' : '#94A3B8'}
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600', marginBottom: 6, opacity: 0.6 }}>
                <Clock size={12} color={theme.text} /> Uhrzeit (optional)
              </Text>
              <BottomSheetTextInput
                style={[styles.input, { backgroundColor: isDark ? '#333' : '#F1F5F9', color: theme.text, marginBottom: 0 }]}
                placeholder="z.B. 08:00"
                placeholderTextColor={isDark ? '#888' : '#94A3B8'}
                value={newTime}
                onChangeText={setNewTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <IconPicker selectedIcon={newIcon} onSelect={setNewIcon} accentColor={themeColor} isDark={isDark} textColor={theme.text} />
          <ColorPicker selectedColor={newColor} onSelect={setNewColor} isDark={isDark} textColor={theme.text} />

          {/* Recurrence Selector */}
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600', marginBottom: 8, opacity: 0.6 }}>
            <Repeat size={12} color={theme.text} /> Wiederholung
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['daily', 'weekdays', 'weekends'] as const).map(rec => (
              <TouchableOpacity
                key={rec}
                style={[
                  styles.recurrenceBtn,
                  { backgroundColor: newRecurrence === rec ? themeColor : (isDark ? '#333' : '#F1F5F9') }
                ]}
                onPress={() => setNewRecurrence(rec)}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: newRecurrence === rec ? '#FFF' : theme.text }}>
                  {rec === 'daily' ? 'Täglich' : rec === 'weekdays' ? 'Wochentags' : 'Wochenende'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600', marginBottom: 8, opacity: 0.6 }}>Tageszeit & Typ</Text>
          <View style={styles.typeSelector}>
            {(['morning', 'afternoon', 'evening', 'supplement'] as const).map(type => (
              <TouchableOpacity 
                key={type} 
                style={[styles.typeButton, newType === type ? { backgroundColor: themeColor } : { backgroundColor: isDark ? '#444' : '#E2E8F0' }]}
                onPress={() => setNewType(type)}
                accessibilityRole="radio"
                accessibilityState={{ checked: newType === type }}
                accessibilityLabel={`Typ: ${t(type)}`}
              >
                <Text style={[styles.typeButtonText, newType === type ? { color: '#FFF' } : { color: theme.text }]}>{t(type)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {newType === 'supplement' && (
            <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <View style={styles.dosageBanner}>
                <Bell size={16} color={themeColor} style={{ marginRight: 8 }} />
                <Text style={{ color: themeColor, fontSize: 13, flex: 1 }}>Wir senden dir einen Reminder für diese Dosis.</Text>
              </View>
              <BottomSheetTextInput
                style={[styles.input, { backgroundColor: isDark ? '#333' : '#F1F5F9', color: theme.text }]}
                placeholder="Dosis (z.B. 500mg, 1 Scoop)"
                placeholderTextColor={isDark ? '#888' : '#94A3B8'}
                value={newDosage}
                onChangeText={setNewDosage}
              />
            </MotiView>
          )}
          
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: themeColor }]} 
            onPress={handleAddRoutine}
            accessibilityRole="button"
            accessibilityLabel="Routine speichern"
          >
            <Text style={styles.submitButtonText}>Speichern</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { marginTop: 10, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingLabel: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 6 },
  streakCount: { color: '#F59E0B', fontSize: 18, fontWeight: '800' },
  tabsWrapper: { marginBottom: 20 },
  tabsContainer: { gap: 10 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  viewToggle: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 2 },
  viewToggleBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { flex: 1, padding: 24, paddingBottom: 100 },
  sheetTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 16 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  typeButtonText: { fontSize: 14, fontWeight: '600' },
  recurrenceBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  dosageBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: 12, marginBottom: 16 },
  submitButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 20 },
  submitButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  moodContainer: { paddingHorizontal: 0, marginBottom: 16, justifyContent: 'center' },
  moodTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, opacity: 0.8 },
  moodOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
