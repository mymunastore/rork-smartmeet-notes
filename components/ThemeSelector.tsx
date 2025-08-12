import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/hooks/use-theme';

interface ThemeSelectorProps {
  testID?: string;
}

export default function ThemeSelector({ testID }: ThemeSelectorProps) {
  const { themeMode, setThemeMode, colors } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: <Sun size={20} color={colors.primary} />,
      description: 'Always use light theme',
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: <Moon size={20} color={colors.primary} />,
      description: 'Always use dark theme',
    },
    {
      mode: 'auto',
      label: 'Auto',
      icon: <Smartphone size={20} color={colors.primary} />,
      description: 'Follow system setting',
    },
  ];

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: colors.text }]}>Theme Mode</Text>
      <Text style={[styles.subtitle, { color: colors.gray[600] }]}>
        Choose how the app should appear
      </Text>
      
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor: themeMode === option.mode ? colors.primary + '15' : colors.card,
                borderColor: themeMode === option.mode ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setThemeMode(option.mode)}
            testID={`theme-option-${option.mode}`}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionHeader}>
                {option.icon}
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                {themeMode === option.mode && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text style={[styles.optionDescription, { color: colors.gray[600] }]}>
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  optionContent: {
    gap: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    marginLeft: 32,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});