import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {NotificationSettings, User} from '../types';
import {StorageService} from '../services/StorageService';
import {NotificationService} from '../services/NotificationService';

interface VoiceOption {
  id: string;
  name: string;
  language: string;
}

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    voiceEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    voiceLanguage: 'en-US',
  });
  const [user, setUser] = useState<User | null>(null);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettingsAndUser();
    loadAvailableVoices();
  }, []);

  const loadSettingsAndUser = async () => {
    try {
      const [currentSettings, currentUser] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getUser(),
      ]);
      setSettings(currentSettings);
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading settings and user:', error);
    }
  };

  const loadAvailableVoices = async () => {
    try {
      const voices = await NotificationService.getAvailableVoices();
      const voiceOptions: VoiceOption[] = voices.map((voice: any, index: number) => ({
        id: voice.id || `voice-${index}`,
        name: voice.name || `Voice ${index + 1}`,
        language: voice.language || 'en-US',
      }));
      
      // Add default options if no voices available
      if (voiceOptions.length === 0) {
        voiceOptions.push(
          { id: 'en-US', name: 'English (US)', language: 'en-US' },
          { id: 'en-GB', name: 'English (UK)', language: 'en-GB' },
          { id: 'es-ES', name: 'Spanish', language: 'es-ES' },
          { id: 'fr-FR', name: 'French', language: 'fr-FR' },
          { id: 'de-DE', name: 'German', language: 'de-DE' },
        );
      }
      
      setAvailableVoices(voiceOptions);
    } catch (error) {
      console.error('Error loading available voices:', error);
      // Set default voices if loading fails
      setAvailableVoices([
        { id: 'en-US', name: 'English (US)', language: 'en-US' },
        { id: 'en-GB', name: 'English (UK)', language: 'en-GB' },
      ]);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await StorageService.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleTestVoice = async () => {
    try {
      await NotificationService.testVoiceNotification();
    } catch (error) {
      console.error('Error testing voice:', error);
      Alert.alert('Error', 'Failed to test voice notification');
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your events, groups, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all storage
              await Promise.all([
                StorageService.saveUser({} as User),
                StorageService.getEvents().then(events => 
                  Promise.all(events.map(event => StorageService.deleteEvent(event.id)))
                ),
                StorageService.getGroups().then(groups => 
                  Promise.all(groups.map(() => StorageService.saveGroup({} as any)))
                ),
              ]);
              
              Alert.alert('Success', 'App has been reset. Please restart the app.');
            } catch (error) {
              console.error('Error resetting app:', error);
              Alert.alert('Error', 'Failed to reset app');
            }
          },
        },
      ]
    );
  };

  const renderVoiceOption = ({item}: {item: VoiceOption}) => (
    <TouchableOpacity
      style={[
        styles.voiceOption,
        settings.voiceLanguage === item.language && styles.voiceOptionSelected,
      ]}
      onPress={() => {
        updateSetting('voiceLanguage', item.language);
        setVoiceModalVisible(false);
      }}
    >
      <View style={styles.voiceOptionInfo}>
        <Text style={[
          styles.voiceOptionName,
          settings.voiceLanguage === item.language && styles.voiceOptionNameSelected,
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.voiceOptionLanguage,
          settings.voiceLanguage === item.language && styles.voiceOptionLanguageSelected,
        ]}>
          {item.language}
        </Text>
      </View>
      {settings.voiceLanguage === item.language && (
        <Icon name="check" size={24} color="#2196F3" />
      )}
    </TouchableOpacity>
  );

  const getSelectedVoiceName = () => {
    const selectedVoice = availableVoices.find(voice => voice.language === settings.voiceLanguage);
    return selectedVoice ? selectedVoice.name : 'English (US)';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Information</Text>
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.userInfoItem}>
              <Icon name="person" size={24} color="#666" />
              <Text style={styles.userInfoText}>{user.name}</Text>
            </View>
            <View style={styles.userInfoItem}>
              <Icon name="email" size={24} color="#666" />
              <Text style={styles.userInfoText}>{user.email}</Text>
            </View>
            <View style={styles.userInfoItem}>
              <Icon name="group" size={24} color="#666" />
              <Text style={styles.userInfoText}>{user.groups.length} groups</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="volume-up" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Voice Notifications</Text>
              <Text style={styles.settingDescription}>
                Hear spoken notifications when events are due
              </Text>
            </View>
          </View>
          <Switch
            value={settings.voiceEnabled}
            onValueChange={(value) => updateSetting('voiceEnabled', value)}
            trackColor={{ false: '#ccc', true: '#2196F3' }}
            thumbColor={settings.voiceEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {settings.voiceEnabled && (
          <TouchableOpacity
            style={styles.voiceLanguageSelector}
            onPress={() => setVoiceModalVisible(true)}
          >
            <View style={styles.settingInfo}>
              <Icon name="translate" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Voice Language</Text>
                <Text style={styles.settingDescription}>
                  {getSelectedVoiceName()}
                </Text>
              </View>
            </View>
            <Icon name="keyboard-arrow-right" size={24} color="#666" />
          </TouchableOpacity>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound Notifications</Text>
              <Text style={styles.settingDescription}>
                Play sound when notifications appear
              </Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{ false: '#ccc', true: '#2196F3' }}
            thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="vibration" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Vibrate device when notifications appear
              </Text>
            </View>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            trackColor={{ false: '#ccc', true: '#2196F3' }}
            thumbColor={settings.vibrationEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleTestVoice}
        >
          <Icon name="play-arrow" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>Test Voice Notification</Text>
          <Icon name="keyboard-arrow-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleResetApp}
        >
          <Icon name="refresh" size={24} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            Reset App Data
          </Text>
          <Icon name="keyboard-arrow-right" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutText}>Scheduling App v1.0.0</Text>
          <Text style={styles.aboutText}>
            Never miss important events with voice notifications and group sharing.
          </Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={voiceModalVisible}
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Voice Language</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVoiceModalVisible(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableVoices}
              renderItem={renderVoiceOption}
              keyExtractor={(item) => item.id}
              style={styles.voiceList}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userInfo: {
    paddingHorizontal: 16,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  voiceLanguageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 12,
    flex: 1,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    color: '#F44336',
  },
  aboutContainer: {
    paddingHorizontal: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  voiceList: {
    maxHeight: 400,
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voiceOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  voiceOptionInfo: {
    flex: 1,
  },
  voiceOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  voiceOptionNameSelected: {
    color: '#2196F3',
  },
  voiceOptionLanguage: {
    fontSize: 14,
    color: '#666',
  },
  voiceOptionLanguageSelected: {
    color: '#1976D2',
  },
});

export default SettingsScreen;