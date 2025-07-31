export interface Event {
  id: string;
  title: string;
  description: string;
  scheduledFor: Date;
  createdAt: Date;
  createdBy: string;
  groupId: string;
  isCompleted: boolean;
  notificationSent: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  groups: string[];
}

export interface NotificationSettings {
  voiceEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceLanguage: string;
}

export type RootStackParamList = {
  Home: undefined;
  CreateEvent: undefined;
  GroupManagement: undefined;
  Settings: undefined;
  Login: undefined;
};