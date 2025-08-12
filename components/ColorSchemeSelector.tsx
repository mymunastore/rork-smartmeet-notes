import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ColorScheme } from '@/hooks/use-theme';

interface ColorSchemeSelectorProps {
  testID?: string;
}

export default function ColorSchemeSelector({ testID }: ColorSchemeSelectorProps) {
  const { colorScheme, setColorScheme, colors } = useTheme();

  const colorSchemeOptions: { 
    scheme: ColorScheme; 
    label: string; 
    description: string;
    previewColors: string[];
  }[] = [
    {
      scheme: 'default',
      label: 'Default',
      description: 'Classic green theme',
      previewColors: ['#38A169', '#4299E1', '#ED8936'],
    },
    {
      scheme: 'nature',
      label: 'Nature',
      description: 'Earthy sage and moss tones',
      previewColors: ['#9CAF88', '#8FBC8F', '#8B4513'],
    },
    {
      scheme: 'ocean',
      label: 'Ocean',
      description: 'Cool blues and sky tones',
      previewColors: ['#4682B4', '#87CEEB', '#4299E1'],
    },
    {
      scheme: 'sunset',
      label: 'Sunset',
      description: 'Warm oranges and corals',
      previewColors: ['#ED8936', '#FF7F7F', '#ED8936'],
    },
    {
      scheme: 'forest',
      label: 'Forest',
      description: 'Deep greens and earth',
      previewColors: ['#38A169', '#8FBC8F', '#8B4513'],
    },
  ];

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: colors.text }]}>Color Scheme</Text>
      <Text style={[styles.subtitle, { color: colors.gray[600] }]}>
        Choose your preferred color palette
      </Text>
      
      <View style={styles.optionsContainer}>
        {colorSchemeOptions.map((option) => (
          <TouchableOpacity
            key={option.scheme}
            style={[
              styles.option,
              {
                backgroundColor: colorScheme === option.scheme ? colors.primary + '15' : colors.card,
                borderColor: colorScheme === option.scheme ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setColorScheme(option.scheme)}
            testID={`color-scheme-option-${option.scheme}`}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionHeader}>
                <View style={styles.colorPreview}>
                  {option.previewColors.map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        { backgroundColor: color },
                        index > 0 && styles.colorDotOverlap,
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.gray[600] }]}>
                    {option.description}
                  </Text>
                </View>
                {colorScheme === option.scheme && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                )}
              </View>
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
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorDotOverlap: {
    marginLeft: -6,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});