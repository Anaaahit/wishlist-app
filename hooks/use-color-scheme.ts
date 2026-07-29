import { useColorScheme as useRNColorScheme } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export function useColorScheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const systemScheme = useRNColorScheme() ?? 'light';

  if (settings.theme === 'system') return systemScheme;
  return settings.theme;
}
