import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, FlatList } from 'react-native';
import { Globe, Languages, Settings, ChevronDown, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SUPPORTED_LANGUAGES, AUTO_DETECT_OPTION } from '@/constants/languages';
import { LanguageOption } from '@/types/note';

interface LanguageSettingsProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange: (settings: {
    autoDetectLanguage: boolean;
    defaultLanguage: string;
    autoTranslateToEnglish: boolean;
    enableRealTimeTranscription: boolean;
  }) => void;
  currentSettings: {
    autoDetectLanguage: boolean;
    defaultLanguage: string;
    autoTranslateToEnglish: boolean;
    enableRealTimeTranscription: boolean;
  };
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  visible,
  onClose,
  onSettingsChange,
  currentSettings,
}) => {
  const [settings, setSettings] = useState(currentSettings);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return AUTO_DETECT_OPTION.name;
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    if (code === 'auto') return AUTO_DETECT_OPTION.flag;
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language?.flag || '🌐';
  };

  const handleLanguageSelect = (languageCode: string) => {
    handleSettingChange('defaultLanguage', languageCode);
    setShowLanguageSelector(false);
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageFlag}>{item.flag}</Text>
        <View>
          <Text style={styles.languageName}>{item.name}</Text>
          <Text style={styles.languageNative}>{item.nativeName}</Text>
        </View>
      </View>
      {settings.defaultLanguage === item.code && (
        <Check size={20} color={Colors.light.primary} />
      )}
    </TouchableOpacity>
  );

  const allLanguages = [AUTO_DETECT_OPTION, ...SUPPORTED_LANGUAGES];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Languages size={24} color={Colors.light.primary} />
            <Text style={styles.title}>Language Settings</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Auto-detect Language */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={20} color={Colors.light.nature.sage} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto-detect Language</Text>
                <Text style={styles.settingDescription}>
                  Automatically detect the language being spoken
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoDetectLanguage}
              onValueChange={(value) => handleSettingChange('autoDetectLanguage', value)}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor={settings.autoDetectLanguage ? '#fff' : Colors.light.gray[500]}
            />
          </View>

          {/* Default Language */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.languageFlag}>
                {getLanguageFlag(settings.defaultLanguage)}
              </Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Default Language</Text>
                <Text style={styles.settingDescription}>
                  {settings.autoDetectLanguage 
                    ? 'Fallback language when detection fails'
                    : 'Language to use for transcription'
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.languageSelector}
              onPress={() => setShowLanguageSelector(true)}
            >
              <Text style={styles.languageSelectorText}>
                {getLanguageName(settings.defaultLanguage)}
              </Text>
              <ChevronDown size={16} color={Colors.light.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Auto-translate to English */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Languages size={20} color={Colors.light.nature.ocean} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto-translate to English</Text>
                <Text style={styles.settingDescription}>
                  Automatically translate non-English content to English
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoTranslateToEnglish}
              onValueChange={(value) => handleSettingChange('autoTranslateToEnglish', value)}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor={settings.autoTranslateToEnglish ? '#fff' : Colors.light.gray[500]}
            />
          </View>

          {/* Real-time Transcription */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Settings size={20} color={Colors.light.nature.coral} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Real-time Transcription</Text>
                <Text style={styles.settingDescription}>
                  Show live transcription while recording (Web only)
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enableRealTimeTranscription}
              onValueChange={(value) => handleSettingChange('enableRealTimeTranscription', value)}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor={settings.enableRealTimeTranscription ? '#fff' : Colors.light.gray[500]}
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>🌟 Features</Text>
            <Text style={styles.infoText}>
              • Supports 80+ languages worldwide{'\n'}
              • Real-time language detection{'\n'}
              • Automatic translation to English{'\n'}
              • High-accuracy transcription{'\n'}
              • Offline language fallback
            </Text>
          </View>
        </View>

        {/* Language Selector Modal */}
        <Modal
          visible={showLanguageSelector}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLanguageSelector(false)}
        >
          <View style={styles.languageModalContainer}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={allLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.gray[600],
    lineHeight: 18,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  languageSelectorText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.light.nature.sky,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  languageModalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  languageNative: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
});

export default LanguageSettings;