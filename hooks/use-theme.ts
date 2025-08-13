import { useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance } from 'react-native';
import { safeStorage } from '@/utils/safe-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'default' | 'nature' | 'ocean' | 'sunset' | 'forest';



const THEME_STORAGE_KEY = '@scribe_theme_mode';
const COLOR_SCHEME_STORAGE_KEY = '@scribe_color_scheme';

const getSystemTheme = (): boolean => {
  try {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark';
  } catch (error) {
    console.warn('Failed to get system theme:', error);
    return false;
  }
};

const generateColorScheme = (scheme: ColorScheme, baseColors: typeof Colors.light | typeof Colors.dark) => {
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
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Load saved preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedThemeMode = await safeStorage.getItem(THEME_STORAGE_KEY);
        const savedColorScheme = await safeStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
        
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
      const systemIsDark = getSystemTheme();
      setIsDark(systemIsDark);
      
      // Listen for system theme changes
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setIsDark(colorScheme === 'dark');
      });
      
      return () => subscription?.remove();
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await safeStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  const setColorScheme = useCallback(async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await safeStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    } catch (error) {
      console.error('Failed to save color scheme:', error);
    }
  }, []);

  // Generate colors based on current theme and color scheme
  const colors = useMemo(() => {
    const baseColors = isDark ? Colors.dark : Colors.light;
    return generateColorScheme(colorScheme, baseColors);
  }, [colorScheme, isDark]);

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