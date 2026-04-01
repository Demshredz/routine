import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineStore } from '@/store/useRoutineStore';
import { ShieldCheck, Download, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ExportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColor = useRoutineStore(s => s.themeColor);
  
  // Wir ziehen den globalen Zustand
  const appState = useRoutineStore(s => s);
  
  const theme = isDark 
    ? { bg: '#000000', card: '#1C1C1E', text: '#F9FAFB', tint: themeColor } 
    : { bg: '#F9FAFB', card: '#FFFFFF', text: '#111827', tint: themeColor };

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Filtere Actions und Functions aus dem State heraus für den Export
      const exportData = JSON.stringify({
        routines: appState.routines,
        completions: appState.completions,
        moods: appState.moods,
        streak: appState.streak
      }, null, 2);

      await Share.share({
        message: exportData,
        title: 'RoutineApp Health Export'
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Vault</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.shieldBadge, { backgroundColor: theme.card }]}>
          <ShieldCheck size={56} color="#10B981" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Deine Daten. Deine Regeln.</Text>
        <Text style={[styles.desc, { color: theme.text }]}>
          Im Gegensatz zu anderen Apps liegen deine Gesundheits- und Routine-Daten ausschließlich lokal auf diesem Gerät. 
          Wir analysieren nichts auf externen Servern.
        </Text>
        <Text style={[styles.desc, { color: theme.text, marginTop: 10 }]}>
          Möchtest du deine Streaks, Energy-Level (Mood) und absolvierten Routinen für deinen Arzt oder Coach auswerten?
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.tint }]} onPress={handleExport}>
          <Download size={20} color="#FFF" />
          <Text style={styles.exportText}>Datenpaket exportieren (JSON)</Text>
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
  content: { padding: 24, flex: 1, alignItems: 'center', marginTop: 40 },
  shieldBadge: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 15, textAlign: 'center', opacity: 0.7, lineHeight: 22 },
  exportBtn: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  exportText: { color: '#FFF', fontSize: 17, fontWeight: '700' }
});
