import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'default' | 'nature' | 'ocean' | 'sunset' | 'forest';



const THEME_STORAGE_KEY = '@scribe_theme_mode';
const COLOR_SCHEME_STORAGE_KEY = '@scribe_color_scheme';

const getSystemTheme = (): boolean => {
  // In a real app, you'd use Appearance.getColorScheme() from react-native
  // For now, we'll default to light mode
  return false;
};

const generateColorScheme = (scheme: ColorScheme, baseColors: typeof Colors.light) => {
  switch (scheme) {
    case 'nature':
      return {
        ...baseColors,
        primary: baseColors.nature.sage,
        secondary: baseColors.nature.moss,
        accent: baseColors.nature.earth,
      };
    case 'ocean':
      return {
        ...baseColors,
        primary: baseColors.nature.ocean,
        secondary: baseColors.nature.sky,
        accent: baseColors.secondary,
      };
    case 'sunset':
      return {
        ...baseColors,
        primary: baseColors.accent,
        secondary: baseColors.nature.coral,
        accent: baseColors.warning,
      };
    case 'forest':
      return {
        ...baseColors,
        primary: baseColors.primary,
        secondary: baseColors.nature.moss,
        accent: baseColors.nature.earth,
      };
    default:
      return baseColors;
  }
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Load saved preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const savedColorScheme = await AsyncStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
        
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
        
        if (savedColorScheme) {
          setColorSchemeState(savedColorScheme as ColorScheme);
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreferences();
  }, []);

  // Update isDark based on theme mode
  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(getSystemTheme());
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await AsyncStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.error('Failed to save color scheme:', error);
    }
  }, []);

  // Generate colors based on current theme and color scheme
  const colors = useMemo(() => generateColorScheme(colorScheme, Colors.light), [colorScheme]);

  return useMemo(() => ({
    themeMode,
    colorScheme,
    isDark,
    colors,
    setThemeMode,
    setColorScheme,
    isLoading,
  }), [themeMode, colorScheme, isDark, colors, setThemeMode, setColorScheme, isLoading]);
});