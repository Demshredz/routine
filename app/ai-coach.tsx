import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore } from '@/store/useRoutineStore';
import { MotiView, AnimatePresence } from 'moti';
import { Sparkles, X, ChevronRight, Send, Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AiCoachScreen() {
  const router = useRouter();
  const { isDark, theme: appTheme, themeColor } = useAppTheme();
  
  const theme = { bg: appTheme.background, card: appTheme.card, text: appTheme.text, tint: appTheme.tint };
  
  const addRoutine = useRoutineStore(s => s.addRoutine);

  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [result, setResult] = useState<{title: string, routines: {title: string, type: any, dosage?: string}[]} | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTyping(true);
    setResult(null);

    // Mock AI Generation delay
    setTimeout(() => {
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult({
        title: "Dein Anti-Stress Protokoll",
        routines: [
          { title: "Digital Detox (Kein Handy nach 21 Uhr)", type: "evening" },
          { title: "Ashwagandha (Stress-Reduktion)", type: "supplement", dosage: "500mg" },
          { title: "Box Breathing (4-4-4-4 Atemzug)", type: "morning" }
        ]
      });
      setPrompt('');
    }, 2500);
  };

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (result) {
      result.routines.forEach(r => addRoutine(r));
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Routine AI</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {!result && !isTyping && (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.welcomeState}>
             <View style={[styles.aiIconBadge, { backgroundColor: theme.card }]}>
               <Sparkles size={48} color={theme.tint} />
             </View>
             <Text style={[styles.welcomeTitle, { color: theme.text }]}>Was ist dein aktuelles Ziel?</Text>
             <Text style={[styles.welcomeDesc, { color: theme.text }]}>Beschreibe mir deine Situation oder dein Problem. Ich generiere dir ein hochwirksames Protokoll, basierend auf aktuellen Studien.</Text>
             
             <View style={styles.suggestionRow}>
               <Text style={{ color: theme.text, opacity: 0.5, marginBottom: 8, fontSize: 13 }}>Beispiele:</Text>
               <TouchableOpacity style={[styles.suggestionBubble, { borderColor: theme.tint }]} onPress={() => setPrompt('Ich schlafe schlecht und wache gerädert auf.')}>
                 <Text style={[styles.suggestionText, { color: theme.text }]}>Ich schlafe schlecht...</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.suggestionBubble, { borderColor: theme.tint }]} onPress={() => setPrompt('Ich brauche einen hyper-fokussierten Arbeitsmorgen.')}>
                 <Text style={[styles.suggestionText, { color: theme.text }]}>Fokus am Morgen...</Text>
               </TouchableOpacity>
             </View>
          </MotiView>
        )}

        {isTyping && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingState}>
             <Loader2 size={48} color={theme.tint} />
             <Text style={[styles.loadingText, { color: theme.text }]}>AI analysiert dein Ziel...</Text>
          </MotiView>
        )}

        <AnimatePresence>
          {result && !isTyping && (
            <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={[styles.resultCard, { backgroundColor: theme.card }]}>
               <View style={styles.resultHeader}>
                 <Sparkles size={20} color={theme.tint} />
                 <Text style={[styles.resultTitle, { color: theme.text }]}>{result.title}</Text>
               </View>

               <View style={styles.routinePreview}>
                 {result.routines.map((r, i) => (
                   <MotiView key={i} from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: i * 150 }} style={[styles.previewItem, { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}>
                     <Text style={[styles.previewText, { color: theme.text }]}>{r.title}</Text>
                     {r.type === 'supplement' && <Text style={{ color: theme.tint, fontSize: 11, fontWeight: '700' }}>{r.dosage}</Text>}
                   </MotiView>
                 ))}
               </View>

               <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.tint }]} onPress={handleApply}>
                 <Text style={styles.applyBtnText}>Protokoll übernehmen</Text>
               </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>

      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.bg, borderTopColor: isDark ? '#333' : '#E2E8F0' }]}>
        <TextInput 
          style={[styles.inputBox, { backgroundColor: theme.card, color: theme.text }]}
          placeholder="Ich möchte produktiver sein..."
          placeholderTextColor={isDark ? '#888' : '#94A3B8'}
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: prompt.length > 0 ? theme.tint : theme.card }]}
          onPress={handleGenerate}
          disabled={prompt.length === 0 || isTyping}
        >
           <Send color={prompt.length > 0 ? '#FFF' : (isDark ? '#555' : '#CCC')} size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  
  welcomeState: { alignItems: 'center', marginTop: -40 },
  aiIconBadge: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  welcomeDesc: { fontSize: 15, textAlign: 'center', opacity: 0.7, lineHeight: 22, paddingHorizontal: 10, marginBottom: 40 },
  suggestionRow: { width: '100%', alignItems: 'flex-start' },
  suggestionBubble: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 10 },
  suggestionText: { fontSize: 14, fontWeight: '600' },

  loadingState: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  loadingText: { marginTop: 24, fontSize: 16, fontWeight: '600', opacity: 0.7 },

  resultCard: { padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  resultTitle: { fontSize: 20, fontWeight: '800' },
  routinePreview: { gap: 10, marginBottom: 30 },
  previewItem: { padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewText: { fontSize: 15, fontWeight: '600' },
  applyBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

  inputContainer: { padding: 16, borderTopWidth: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  inputBox: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});
