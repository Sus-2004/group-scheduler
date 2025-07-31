import uuid from 'react-native-uuid';

export const generateId = (): string => {
  return uuid.v4() as string;
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isEventDue = (eventDate: Date, bufferMinutes: number = 1): boolean => {
  const now = new Date();
  const timeDiff = eventDate.getTime() - now.getTime();
  const minutesDiff = timeDiff / (1000 * 60);
  return minutesDiff <= bufferMinutes && minutesDiff >= -bufferMinutes;
};

export const getEventStatus = (event: { scheduledFor: Date; isCompleted: boolean; notificationSent: boolean }): 'upcoming' | 'due' | 'overdue' | 'completed' => {
  if (event.isCompleted) return 'completed';
  
  const now = new Date();
  const eventTime = new Date(event.scheduledFor);
  
  if (eventTime > now) return 'upcoming';
  if (isEventDue(eventTime)) return 'due';
  return 'overdue';
};

export const sortEventsByDate = (events: Array<{ scheduledFor: Date }>): Array<{ scheduledFor: Date }> => {
  return events.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
};

export const filterEventsByDate = (events: Array<{ scheduledFor: Date }>, targetDate: Date): Array<{ scheduledFor: Date }> => {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const nextDay = new Date(target);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return events.filter(event => {
    const eventDate = new Date(event.scheduledFor);
    return eventDate >= target && eventDate < nextDay;
  });
};

export const getTomorrowDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};