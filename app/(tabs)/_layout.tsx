import { Tabs } from 'expo-router';
import React from 'react';
import { Home, BarChart2, Sparkles, CalendarDays } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { useRoutineStore } from '@/store/useRoutineStore';

export default function TabLayout() {
  const { isDark, theme, themeColor } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
          },
          android: {
            backgroundColor: theme.card,
            elevation: 8,
            borderTopWidth: 0,
          },
          default: {
            backgroundColor: theme.card,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home_tab'),
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('stats_tab'),
          tabBarIcon: ({ color }) => <BarChart2 size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Entdecken',
          tabBarIcon: ({ color }) => <Sparkles size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color }) => <CalendarDays size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
