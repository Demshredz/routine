import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRoutineStore } from '@/store/useRoutineStore';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themeColor = useRoutineStore(s => s.themeColor);
  const isDark = colorScheme === 'dark';

  const lightTheme = {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    tint: themeColor,
    mute: '#E2E8F0',
    ringBg: '#E2E8F0',
  };

  const darkTheme = {
    background: '#000000',
    card: '#1C1C1E',
    text: '#F9FAFB',
    tint: themeColor,
    mute: '#333333',
    ringBg: '#1A1A1E',
  };

  const theme = isDark ? darkTheme : lightTheme;

  return { isDark, theme, themeColor };
}
