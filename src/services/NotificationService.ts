import PushNotification, {Importance} from 'react-native-push-notification';
import Tts from 'react-native-tts';
import {Event, NotificationSettings} from '../types';
import {StorageService} from './StorageService';

export class NotificationService {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    // Configure push notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (notification.userInteraction) {
          // Handle notification tap
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channel for Android
    PushNotification.createChannel(
      {
        channelId: 'scheduling-app-channel',
        channelName: 'Scheduling App Notifications',
        channelDescription: 'Notifications for scheduled events',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );

    // Initialize Text-to-Speech
    try {
      await Tts.getInitStatus();
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.error('TTS initialization error:', error);
    }

    this.initialized = true;
  }

  static async scheduleEventNotification(event: Event): Promise<void> {
    const settings = await StorageService.getSettings();
    const notificationTime = new Date(event.scheduledFor.getTime());

    // Schedule local notification
    PushNotification.localNotificationSchedule({
      id: event.id,
      channelId: 'scheduling-app-channel',
      title: 'Scheduled Event',
      message: `${event.title} - ${event.description}`,
      date: notificationTime,
      soundName: settings.soundEnabled ? 'default' : undefined,
      vibrate: settings.vibrationEnabled,
      playSound: settings.soundEnabled,
      userInfo: {
        eventId: event.id,
        voiceEnabled: settings.voiceEnabled,
        voiceMessage: `Attention! Your scheduled event "${event.title}" is now due. ${event.description}`,
      },
    });

    console.log(`Notification scheduled for event: ${event.title} at ${notificationTime}`);
  }

  static async cancelEventNotification(eventId: string): Promise<void> {
    PushNotification.cancelLocalNotification(eventId);
  }

  static async playVoiceNotification(message: string, language?: string): Promise<void> {
    try {
      const settings = await StorageService.getSettings();
      if (!settings.voiceEnabled) return;

      await Tts.stop();
      
      if (language) {
        await Tts.setDefaultLanguage(language);
      } else {
        await Tts.setDefaultLanguage(settings.voiceLanguage);
      }

      await Tts.speak(message);
    } catch (error) {
      console.error('Error playing voice notification:', error);
    }
  }

  static async testVoiceNotification(): Promise<void> {
    await this.playVoiceNotification('This is a test voice notification from your scheduling app.');
  }

  static async checkAndNotifyDueEvents(): Promise<void> {
    try {
      const events = await StorageService.getEvents();
      const now = new Date();
      
      const dueEvents = events.filter(event => {
        const eventTime = new Date(event.scheduledFor);
        const timeDiff = Math.abs(now.getTime() - eventTime.getTime());
        // Notify if event is due within 1 minute and hasn't been notified yet
        return timeDiff <= 60000 && !event.notificationSent && !event.isCompleted;
      });

      for (const event of dueEvents) {
        // Show immediate notification
        PushNotification.localNotification({
          id: `immediate-${event.id}`,
          channelId: 'scheduling-app-channel',
          title: 'Event Due Now!',
          message: `${event.title} - ${event.description}`,
          playSound: true,
          vibrate: true,
        });

        // Play voice notification
        const voiceMessage = `Attention! Your scheduled event "${event.title}" is now due. ${event.description}`;
        await this.playVoiceNotification(voiceMessage);

        // Mark as notified
        const updatedEvent = { ...event, notificationSent: true };
        await StorageService.saveEvent(updatedEvent);
      }
    } catch (error) {
      console.error('Error checking due events:', error);
    }
  }

  static startPeriodicCheck(): void {
    // Check for due events every 30 seconds
    setInterval(() => {
      this.checkAndNotifyDueEvents();
    }, 30000);
  }

  static async getAvailableVoices(): Promise<any[]> {
    try {
      return await Tts.voices();
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }
}