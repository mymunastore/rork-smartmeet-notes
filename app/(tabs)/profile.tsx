import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Stack } from 'expo-router';
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Bell,
  Shield,
  Settings,
  Moon,
  Smartphone,
  Volume2,
  Vibrate,
  Lock,
  Trash2,
  RotateCcw,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import Colors from '@/constants/colors';
import { useUserProfile } from '@/hooks/use-user-profile';

type EditMode = 'none' | 'profile' | 'preferences';

export default function ProfileScreen() {
  const {
    userProfile,
    preferences,
    isLoading,
    updateUserProfile,
    updatePreferences,
    uploadProfilePicture,
    resetToDefaults,
  } = useUserProfile();

  const [editMode, setEditMode] = useState<EditMode>('none');
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [editedPreferences, setEditedPreferences] = useState(preferences);

  React.useEffect(() => {
    if (userProfile) {
      setEditedProfile(userProfile);
    }
  }, [userProfile]);

  React.useEffect(() => {
    setEditedPreferences(preferences);
  }, [preferences]);

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    await updateUserProfile({
      name: editedProfile.name,
      bio: editedProfile.bio,
      phone: editedProfile.phone,
      company: editedProfile.company,
      jobTitle: editedProfile.jobTitle,
    });
    setEditMode('none');
  };

  const handleSavePreferences = async () => {
    await updatePreferences(editedPreferences);
    setEditMode('none');
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setEditedPreferences(preferences);
    setEditMode('none');
  };

  const handleImagePicker = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Image picker is not available on web in this demo');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadProfilePicture(result.assets[0].uri);
    }
  };

  const handleResetPreferences = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  };

  if (isLoading || !userProfile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {userProfile.profilePicture ? (
              <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User color={Colors.light.gray[500]} size={40} />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
              <Camera color={Colors.light.background} size={16} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          {userProfile.bio && <Text style={styles.userBio}>{userProfile.bio}</Text>}
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {editMode === 'profile' ? (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}>
                  <X color={Colors.light.error} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleSaveProfile}>
                  <Save color={Colors.light.success} size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setEditMode('profile')}
              >
                <Edit3 color={Colors.light.primary} size={20} />
              </TouchableOpacity>
            )}
          </View>

          {editMode === 'profile' ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.name || ''}
                  onChangeText={(text) =>
                    setEditedProfile(prev => prev ? { ...prev, name: text } : null)
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.light.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editedProfile?.bio || ''}
                  onChangeText={(text) =>
                    setEditedProfile(prev => prev ? { ...prev, bio: text } : null)
                  }
                  placeholder="Tell us about yourself"
                  placeholderTextColor={Colors.light.gray[400]}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.phone || ''}
                  onChangeText={(text) =>
                    setEditedProfile(prev => prev ? { ...prev, phone: text } : null)
                  }
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.light.gray[400]}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.company || ''}
                  onChangeText={(text) =>
                    setEditedProfile(prev => prev ? { ...prev, company: text } : null)
                  }
                  placeholder="Enter your company"
                  placeholderTextColor={Colors.light.gray[400]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedProfile?.jobTitle || ''}
                  onChangeText={(text) =>
                    setEditedProfile(prev => prev ? { ...prev, jobTitle: text } : null)
                  }
                  placeholder="Enter your job title"
                  placeholderTextColor={Colors.light.gray[400]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <ProfileInfoItem icon={<User size={16} />} label="Phone" value={userProfile.phone} />
              <ProfileInfoItem icon={<User size={16} />} label="Company" value={userProfile.company} />
              <ProfileInfoItem icon={<User size={16} />} label="Job Title" value={userProfile.jobTitle} />
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            {editMode === 'preferences' ? (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}>
                  <X color={Colors.light.error} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleSavePreferences}>
                  <Save color={Colors.light.success} size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setEditMode('preferences')}
              >
                <Settings color={Colors.light.primary} size={20} />
              </TouchableOpacity>
            )}
          </View>

          {editMode === 'preferences' ? (
            <View style={styles.preferencesForm}>
              {/* Theme Settings */}
              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceGroupTitle}>Appearance</Text>
                <View style={styles.preferenceItem}>
                  <View style={styles.preferenceInfo}>
                    <Moon color={Colors.light.text} size={20} />
                    <Text style={styles.preferenceLabel}>Theme</Text>
                  </View>
                  <View style={styles.themeSelector}>
                    {(['light', 'dark', 'auto'] as const).map((theme) => (
                      <TouchableOpacity
                        key={theme}
                        style={[
                          styles.themeOption,
                          editedPreferences.theme === theme && styles.themeOptionActive,
                        ]}
                        onPress={() =>
                          setEditedPreferences(prev => ({ ...prev, theme }))
                        }
                      >
                        <Text
                          style={[
                            styles.themeOptionText,
                            editedPreferences.theme === theme && styles.themeOptionTextActive,
                          ]}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Notification Settings */}
              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceGroupTitle}>Notifications</Text>
                <PreferenceSwitch
                  icon={<Bell size={20} />}
                  label="Transcription Complete"
                  value={editedPreferences.notifications.transcriptionComplete}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, transcriptionComplete: value },
                    }))
                  }
                />
                <PreferenceSwitch
                  icon={<Bell size={20} />}
                  label="Summary Ready"
                  value={editedPreferences.notifications.summaryReady}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, summaryReady: value },
                    }))
                  }
                />
                <PreferenceSwitch
                  icon={<Volume2 size={20} />}
                  label="Sound Enabled"
                  value={editedPreferences.notifications.soundEnabled}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, soundEnabled: value },
                    }))
                  }
                />
                <PreferenceSwitch
                  icon={<Vibrate size={20} />}
                  label="Vibration Enabled"
                  value={editedPreferences.notifications.vibrationEnabled}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, vibrationEnabled: value },
                    }))
                  }
                />
              </View>

              {/* Recording Settings */}
              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceGroupTitle}>Recording</Text>
                <PreferenceSwitch
                  icon={<Smartphone size={20} />}
                  label="Auto Start Recording"
                  value={editedPreferences.recording.autoStart}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      recording: { ...prev.recording, autoStart: value },
                    }))
                  }
                />
                <PreferenceSwitch
                  icon={<Settings size={20} />}
                  label="Auto Summary"
                  value={editedPreferences.recording.autoSummary}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      recording: { ...prev.recording, autoSummary: value },
                    }))
                  }
                />
              </View>

              {/* Privacy Settings */}
              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceGroupTitle}>Privacy & Security</Text>
                <PreferenceSwitch
                  icon={<Lock size={20} />}
                  label="Biometric Lock"
                  value={editedPreferences.privacy.biometricLock}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, biometricLock: value },
                    }))
                  }
                />
                <PreferenceSwitch
                  icon={<Shield size={20} />}
                  label="Share Analytics"
                  value={editedPreferences.privacy.shareAnalytics}
                  onValueChange={(value) =>
                    setEditedPreferences(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, shareAnalytics: value },
                    }))
                  }
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity style={styles.resetButton} onPress={handleResetPreferences}>
                <RotateCcw color={Colors.light.error} size={20} />
                <Text style={styles.resetButtonText}>Reset to Defaults</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.preferencesDisplay}>
              <PreferenceDisplayItem
                icon={<Moon size={16} />}
                label="Theme"
                value={preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}
              />
              <PreferenceDisplayItem
                icon={<Bell size={16} />}
                label="Notifications"
                value={preferences.notifications.transcriptionComplete ? 'Enabled' : 'Disabled'}
              />
              <PreferenceDisplayItem
                icon={<Lock size={16} />}
                label="Biometric Lock"
                value={preferences.privacy.biometricLock ? 'Enabled' : 'Disabled'}
              />
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.dangerButton}>
            <Trash2 color={Colors.light.error} size={20} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

interface ProfileInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

function ProfileInfoItem({ icon, label, value }: ProfileInfoItemProps) {
  if (!value) return null;

  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

interface PreferenceSwitchProps {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function PreferenceSwitch({ icon, label, value, onValueChange }: PreferenceSwitchProps) {
  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <View style={styles.preferenceIcon}>{icon}</View>
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
        thumbColor={value ? Colors.light.background : Colors.light.gray[100]}
      />
    </View>
  );
}

interface PreferenceDisplayItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PreferenceDisplayItem({ icon, label, value }: PreferenceDisplayItemProps) {
  return (
    <View style={styles.displayItem}>
      <View style={styles.displayIcon}>{icon}</View>
      <View style={styles.displayContent}>
        <Text style={styles.displayLabel}>{label}</Text>
        <Text style={styles.displayValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.gray[600],
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.gray[200],
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.light.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.gray[600],
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    color: Colors.light.gray[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    backgroundColor: Colors.light.card,
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  profileInfo: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.gray[600],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  preferencesForm: {
    gap: 24,
  },
  preferenceGroup: {
    gap: 12,
  },
  preferenceGroupTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  preferenceIcon: {
    color: Colors.light.gray[600],
  },
  preferenceLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.gray[100],
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  themeOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  themeOptionText: {
    fontSize: 12,
    color: Colors.light.gray[700],
  },
  themeOptionTextActive: {
    color: Colors.light.background,
    fontWeight: '500' as const,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: '500' as const,
  },
  preferencesDisplay: {
    gap: 12,
  },
  displayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  displayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayContent: {
    flex: 1,
  },
  displayLabel: {
    fontSize: 12,
    color: Colors.light.gray[600],
    marginBottom: 2,
  },
  displayValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  dangerButtonText: {
    fontSize: 16,
    color: Colors.light.error,
    fontWeight: '500' as const,
  },
  bottomSpacing: {
    height: 32,
  },
});