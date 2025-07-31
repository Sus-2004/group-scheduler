import AsyncStorage from '@react-native-async-storage/async-storage';
import {Event, Group, User, NotificationSettings} from '../types';

export class StorageService {
  private static readonly EVENTS_KEY = 'scheduling_app_events';
  private static readonly GROUPS_KEY = 'scheduling_app_groups';
  private static readonly USER_KEY = 'scheduling_app_user';
  private static readonly SETTINGS_KEY = 'scheduling_app_settings';

  // Event management
  static async saveEvent(event: Event): Promise<void> {
    try {
      const events = await this.getEvents();
      const updatedEvents = [...events.filter(e => e.id !== event.id), event];
      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  static async getEvents(): Promise<Event[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(this.EVENTS_KEY);
      if (!eventsJson) return [];
      const events = JSON.parse(eventsJson);
      return events.map((event: any) => ({
        ...event,
        scheduledFor: new Date(event.scheduledFor),
        createdAt: new Date(event.createdAt),
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const events = await this.getEvents();
      const filteredEvents = events.filter(e => e.id !== eventId);
      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(filteredEvents));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Group management
  static async saveGroup(group: Group): Promise<void> {
    try {
      const groups = await this.getGroups();
      const updatedGroups = [...groups.filter(g => g.id !== group.id), group];
      await AsyncStorage.setItem(this.GROUPS_KEY, JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('Error saving group:', error);
      throw error;
    }
  }

  static async getGroups(): Promise<Group[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(this.GROUPS_KEY);
      if (!groupsJson) return [];
      const groups = JSON.parse(groupsJson);
      return groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      }));
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  // User management
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Settings management
  static async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  static async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (!settingsJson) {
        const defaultSettings: NotificationSettings = {
          voiceEnabled: true,
          soundEnabled: true,
          vibrationEnabled: true,
          voiceLanguage: 'en-US',
        };
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        voiceEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        voiceLanguage: 'en-US',
      };
    }
  }
}