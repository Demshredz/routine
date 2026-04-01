import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore } from '@/store/useRoutineStore';
import { MotiView } from 'moti';
import { PaintBucket, Download, Crown, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { format, differenceInDays } from 'date-fns';

const { width } = Dimensions.get('window');

const PRESET_THEMES = [
  { id: 'blue', name: 'Focus Blue', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'rose', name: 'Cherry Blossom', color: '#E11D48', bg: '#FFE4E6' },
  { id: 'emerald', name: 'Zen Garden', color: '#059669', bg: '#D1FAE5' },
  { id: 'amber', name: 'Sunset Glow', color: '#D97706', bg: '#FEF3C7' },
  { id: 'purple', name: 'Deep Space', color: '#7C3AED', bg: '#EDE9FE' },
];

const EXPERT_ROUTINES = [
  {
    id: 'huberman',
    title: 'Huberman Morning',
    author: 'Stanford Prof. Protokoll',
    routines: [
      { title: 'Sonnenlicht (10 Min)', type: 'morning' },
      { title: 'Wasser mit Salz', type: 'morning' },
      { title: 'Delay Caffeine (90m)', type: 'morning' },
    ],
    color: '#0EA5E9'
  },
  {
    id: 'sleep',
    title: 'Deep Sleep Formula',
    author: 'Sleep Foundation',
    routines: [
      { title: 'Zimmer kühlen (18°)', type: 'evening' },
      { title: 'Magnesium', type: 'supplement', dosage: '300mg' },
      { title: 'Kein Screen (30m)', type: 'evening' },
    ],
    color: '#6366F1'
  }
];

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, theme: currentTheme, themeColor } = useAppTheme();
  
  const setThemeColor = useRoutineStore(s => s.setThemeColor);
  const addRoutine = useRoutineStore(s => s.addRoutine);
  
  const isPro = useRoutineStore(state => state.isPro);
  const trialStartDate = useRoutineStore(state => state.trialStartDate);
  const isTrialActive = differenceInDays(new Date(), new Date(trialStartDate)) < 7;
  const hasFullAccess = isPro || isTrialActive;

  const handleApplyTheme = (color: string) => {
    if (!hasFullAccess) {
      router.push('/paywall');
      return;
    }
    Haptics.selectionAsync();
    setThemeColor(color);
  };

  const handleImportRoutine = (routinePack: typeof EXPERT_ROUTINES[0]) => {
    if (!hasFullAccess) {
      router.push('/paywall');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    routinePack.routines.forEach(r => {
      addRoutine(r as any);
    });
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Entdecken</Text>
        <Text style={[styles.subtitle, { color: currentTheme.text, opacity: 0.6 }]}>Premium Themes & Expert Protcolls</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* AI Generator Hero */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => {
          if (!hasFullAccess) return router.push('/paywall');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/ai-coach');
        }}>
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.aiHeroCard, { backgroundColor: currentTheme.tint }]}
          >
            <View style={styles.aiHeroContent}>
               <Text style={[styles.aiHeroTitle, { color: '#FFF' }]}>Smart AI Coach</Text>
               <Text style={[styles.aiHeroDesc, { color: 'rgba(255,255,255,0.8)' }]}>Sag mir dein Problem, ich baue dir die perfekte Routine.</Text>
            </View>
            <View style={styles.aiIconWrapper}>
               <Sparkles color={currentTheme.tint} size={24} />
               {!hasFullAccess && <View style={styles.proBadge}><Crown size={10} color="#FFF" /></View>}
            </View>
          </MotiView>
        </TouchableOpacity>

        {/* Premium Themes */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>App Design (Pro)</Text>
             <PaintBucket color={currentTheme.tint} size={20} />
           </View>
           <Text style={[styles.desc, { color: currentTheme.text }]}>Wähle deine Akzentfarbe aus. Wirkt sich auf alle Charts und UI-Elemente aus.</Text>
           
           <View style={styles.themeGrid}>
             {PRESET_THEMES.map((t) => (
               <TouchableOpacity 
                 key={t.id} 
                 style={[styles.themePill, { borderColor: themeColor === t.color ? t.color : (isDark ? '#333' : '#E2E8F0') }]}
                 onPress={() => handleApplyTheme(t.color)}
               >
                 <View style={[styles.colorCircle, { backgroundColor: t.color }]} />
                 <Text style={[styles.themeName, { color: currentTheme.text }]}>{t.name}</Text>
                 {!hasFullAccess && <Crown size={12} color="#F59E0B" style={{ marginLeft: 'auto' }} />}
               </TouchableOpacity>
             ))}
           </View>
        </View>

        {/* Expert Routines */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Expert Protokolle</Text>
             <Sparkles color="#F59E0B" size={20} />
           </View>
           <Text style={[styles.desc, { color: currentTheme.text }]}>Importiere fertige Routinen von Top-Performern direkt in deine Liste.</Text>

           {EXPERT_ROUTINES.map((pack, index) => (
             <MotiView 
               key={pack.id} 
               from={{ opacity: 0, translateY: 10 }} 
               animate={{ opacity: 1, translateY: 0 }} 
               transition={{ delay: index * 100 }}
               style={[styles.expertCard, { backgroundColor: currentTheme.card }]}
             >
               <View style={styles.expertHeader}>
                 <View>
                   <Text style={[styles.expertTitle, { color: currentTheme.text }]}>{pack.title}</Text>
                   <Text style={[styles.expertAuthor, { color: currentTheme.text, opacity: 0.5 }]}>{pack.author}</Text>
                 </View>
                 <TouchableOpacity 
                   style={[styles.importBtn, { backgroundColor: pack.color }]} 
                   onPress={() => handleImportRoutine(pack)}
                 >
                   <Download color="#FFF" size={16} />
                   <Text style={styles.importBtnText}>Hinzufügen</Text>
                 </TouchableOpacity>
               </View>

               <View style={styles.routinePreview}>
                 {pack.routines.map((r, i) => (
                   <View key={i} style={[styles.previewItem, { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}>
                     <Text style={[styles.previewText, { color: currentTheme.text }]}>• {r.title}</Text>
                   </View>
                 ))}
               </View>
             </MotiView>
           ))}
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
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  desc: { fontSize: 13, opacity: 0.6, marginBottom: 16, lineHeight: 18 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 2, width: '47%' },
  colorCircle: { width: 16, height: 16, borderRadius: 8, marginRight: 10 },
  themeName: { fontSize: 13, fontWeight: '600' },
  expertCard: { padding: 20, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  expertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  expertTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  expertAuthor: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  importBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  importBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  routinePreview: { gap: 8 },
  previewItem: { padding: 12, borderRadius: 10 },
  previewText: { fontSize: 14, fontWeight: '500' },
  
  aiHeroCard: { flexDirection: 'row', alignItems: 'center', padding: 24, borderRadius: 24, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  aiHeroContent: { flex: 1, paddingRight: 16 },
  aiHeroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  aiHeroDesc: { fontSize: 14, lineHeight: 20 },
  aiIconWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  proBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#F59E0B', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' }
});
