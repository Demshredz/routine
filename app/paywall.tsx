import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Crown, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRoutineStore } from '@/store/useRoutineStore';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const setIsPro = useRoutineStore(s => s.setIsPro);

  const handlePurchase = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsPro(true);
    router.back();
  };

  const features = [
    'Unbegrenzte Routinen anlegen',
    'Exklusiver Supplement-Tracker',
    'GitHub-Style Konsistenz-Heatmap',
    'Fortgeschrittene Gamification (Der Garten)',
    'Cloud-Backup & OS Widgets (Demnächst)'
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Decorative Glow */}
      <View style={[styles.glow, { backgroundColor: theme.tint, top: -70, right: -50 }]} />
      <View style={[styles.glow, { backgroundColor: '#8B5CF6', bottom: -100, left: -100 }]} />

      <SafeAreaView style={{ flex: 1, padding: 24 }} edges={['top', 'bottom']}>
        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <ChevronLeft color={theme.text} size={28} />
          </TouchableOpacity>
        </MotiView>

        {/* Hero Section */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ type: 'spring', delay: 100 }}
          style={styles.hero}
        >
          <View style={styles.iconWrapper}>
             <Crown color="#F59E0B" size={48} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Werde die beste Version deiner selbst.</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>Entsperre das volle Potenzial deines Lebens mit Routine Pro.</Text>
        </MotiView>

        {/* Features List */}
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <MotiView 
              key={index}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 300 + index * 100 }}
              style={styles.featureItem}
            >
              <CheckCircle2 color={theme.tint} size={20} />
              <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
            </MotiView>
          ))}
        </View>

        {/* Pricing & CTA */}
        <MotiView 
          from={{ opacity: 0, translateY: 30 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ delay: 800 }}
          style={styles.ctaContainer}
        >
          <View style={[styles.planCard, { borderColor: theme.tint, backgroundColor: isDark ? '#111827' : '#EFF6FF' }]}>
             <View style={styles.planHeader}>
               <Text style={[styles.planName, { color: theme.tint }]}>Lifetime Access</Text>
               <View style={styles.badge}><Text style={styles.badgeText}>BEST DEAL</Text></View>
             </View>
             <Text style={[styles.planPrice, { color: theme.text }]}>49,99 € <Text style={{ fontSize: 16, opacity: 0.6 }}>/ einmaling</Text></Text>
          </View>

          <TouchableOpacity 
            style={[styles.buyButton, { backgroundColor: theme.text }]} 
            onPress={handlePurchase}
            activeOpacity={0.8}
          >
            <Text style={[styles.buyButtonText, { color: theme.background }]}>Jetzt Freischalten</Text>
          </TouchableOpacity>
          <Text style={[styles.terms, { color: theme.text }]}>
            Dies ist ein Mockup für Testing (`isPro` wird auf `true` gesetzt).
          </Text>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

const lightTheme = { background: '#F8FAFC', text: '#0F172A', tint: '#3B82F6' };
const darkTheme = { background: '#0F172A', text: '#F8FAFC', tint: '#60A5FA' };

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, filter: 'blur(80px)', opacity: 0.3 },
  header: { marginBottom: 30 },
  hero: { alignItems: 'center', marginBottom: 40 },
  iconWrapper: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20
  },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 16, textAlign: 'center', opacity: 0.7, paddingHorizontal: 20, lineHeight: 22 },
  featuresList: { paddingHorizontal: 20, gap: 16, flex: 1 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, fontWeight: '500' },
  ctaContainer: { paddingHorizontal: 10, marginTop: 'auto' },
  planCard: { 
    borderWidth: 2, borderRadius: 20, padding: 20, marginBottom: 20 
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planName: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase' },
  planPrice: { fontSize: 32, fontWeight: '800' },
  badge: { backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  buyButton: { height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  buyButtonText: { fontSize: 18, fontWeight: '800' },
  terms: { textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 16 }
});
