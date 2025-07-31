import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Event, Group, User} from '../types';
import {StorageService} from '../services/StorageService';
import {NotificationService} from '../services/NotificationService';
import {generateId, formatDateTime, getTomorrowDate} from '../utils/helpers';

const CreateEventScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState(getTomorrowDate());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserAndGroups();
  }, []);

  const loadUserAndGroups = async () => {
    try {
      const [currentUser, userGroups] = await Promise.all([
        StorageService.getUser(),
        StorageService.getGroups(),
      ]);
      setUser(currentUser);
      setGroups(userGroups);
      
      // Auto-select first group if available
      if (userGroups.length > 0) {
        setSelectedGroup(userGroups[0]);
      }
    } catch (error) {
      console.error('Error loading user and groups:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return false;
    }

    if (scheduledFor <= new Date()) {
      Alert.alert('Error', 'Please select a future date and time');
      return false;
    }

    if (!selectedGroup && groups.length > 0) {
      Alert.alert('Error', 'Please select a group for this event');
      return false;
    }

    if (!user) {
      Alert.alert('Error', 'User information not found');
      return false;
    }

    return true;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newEvent: Event = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        scheduledFor,
        createdAt: new Date(),
        createdBy: user!.id,
        groupId: selectedGroup?.id || 'personal',
        isCompleted: false,
        notificationSent: false,
      };

      await StorageService.saveEvent(newEvent);
      await NotificationService.scheduleEventNotification(newEvent);

      Alert.alert(
        'Success',
        `Event "${newEvent.title}" has been scheduled for ${formatDateTime(scheduledFor)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setScheduledFor(getTomorrowDate());
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGroupSelector = () => {
    if (groups.length === 0) {
      return (
        <View style={styles.noGroupsContainer}>
          <Icon name="info" size={20} color="#FF9800" />
          <Text style={styles.noGroupsText}>
            No groups available. Create a group in the Groups tab to share events.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.groupSelectorContainer}>
        <Text style={styles.label}>Select Group</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.groupOption,
              !selectedGroup && styles.groupOptionSelected,
            ]}
            onPress={() => setSelectedGroup(null)}
          >
            <Icon name="person" size={20} color={!selectedGroup ? '#fff' : '#666'} />
            <Text style={[
              styles.groupOptionText,
              !selectedGroup && styles.groupOptionTextSelected,
            ]}>
              Personal
            </Text>
          </TouchableOpacity>
          
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupOption,
                selectedGroup?.id === group.id && styles.groupOptionSelected,
              ]}
              onPress={() => setSelectedGroup(group)}
            >
              <Icon 
                name="group" 
                size={20} 
                color={selectedGroup?.id === group.id ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.groupOptionText,
                selectedGroup?.id === group.id && styles.groupOptionTextSelected,
              ]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter event description..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Scheduled Date & Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerOpen(true)}
            >
              <Icon name="schedule" size={24} color="#2196F3" />
              <Text style={styles.dateButtonText}>
                {formatDateTime(scheduledFor)}
              </Text>
              <Icon name="keyboard-arrow-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {renderGroupSelector()}

          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateEvent}
            disabled={isLoading}
          >
            <Icon name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          open={datePickerOpen}
          date={scheduledFor}
          mode="datetime"
          minimumDate={new Date()}
          onConfirm={(date) => {
            setDatePickerOpen(false);
            setScheduledFor(date);
          }}
          onCancel={() => {
            setDatePickerOpen(false);
          }}
          title="Select Date & Time"
          confirmText="Confirm"
          cancelText="Cancel"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  groupSelectorContainer: {
    marginBottom: 20,
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  groupOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  groupOptionTextSelected: {
    color: '#fff',
  },
  noGroupsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noGroupsText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreateEventScreen;