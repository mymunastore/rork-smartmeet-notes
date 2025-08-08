import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Languages, Globe, ToggleLeft, ToggleRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

interface TranslationViewProps {
  originalText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  isTranslated?: boolean;
  confidence?: number;
}

const TranslationView: React.FC<TranslationViewProps> = ({
  originalText,
  translatedText,
  detectedLanguage,
  isTranslated,
  confidence,
}) => {
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  if (!isTranslated || !originalText || !translatedText || !detectedLanguage) {
    return null;
  }

  const getLanguageName = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language?.flag || '🌐';
  };

  const toggleView = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Languages size={16} color={Colors.light.nature.sage} />
          <Text style={styles.headerTitle}>Translation</Text>
          {confidence && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
          <Text style={styles.toggleLabel}>
            {showOriginal ? 'Original' : 'English'}
          </Text>
          {showOriginal ? (
            <ToggleRight size={20} color={Colors.light.primary} />
          ) : (
            <ToggleLeft size={20} color={Colors.light.gray[400]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Language Info */}
      <View style={styles.languageInfo}>
        <View style={styles.languageItem}>
          <Globe size={14} color={Colors.light.nature.sage} />
          <Text style={styles.languageText}>
            {getLanguageFlag(detectedLanguage)} {getLanguageName(detectedLanguage)}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={styles.languageItem}>
          <Globe size={14} color={Colors.light.nature.ocean} />
          <Text style={styles.languageText}>
            🇺🇸 English
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.contentLabel}>
          {showOriginal ? `Original (${getLanguageName(detectedLanguage)})` : 'English Translation'}
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            {showOriginal ? originalText : translatedText}
          </Text>
        </View>
      </View>

      {/* Footer note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Automatically translated using AI • Tap toggle to switch views
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.nature.sand,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  confidenceBadge: {
    backgroundColor: Colors.light.nature.sage,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  arrow: {
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: 16,
    color: Colors.light.gray[500],
    fontWeight: '600',
  },
  contentContainer: {
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.gray[600],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
    fontWeight: '400',
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerText: {
    fontSize: 11,
    color: Colors.light.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TranslationView;