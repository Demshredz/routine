import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useRoutineStore } from '@/store/useRoutineStore';
import { View, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import '../i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function AppLayout() {
  const hasHydrated = useRoutineStore(s => s.hasHydrated);
  const colorScheme = useColorScheme();

  useEffect(() => {
    registerForPushNotificationsAsync().catch(err => console.log('Push Registration Errr:', err));
  }, []);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="paywall" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="ai-coach" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="export" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
