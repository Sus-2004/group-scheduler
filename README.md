# Scheduling App

A comprehensive React Native scheduling application with voice notifications and group sharing capabilities. Never miss important events with intelligent voice alerts and seamless group collaboration.

## Features

### 🔔 Smart Voice Notifications
- **Text-to-Speech**: Get spoken notifications when events are due
- **Multiple Languages**: Support for various voice languages
- **Customizable Settings**: Control voice, sound, and vibration preferences
- **Real-time Alerts**: Automatic notifications when events become due

### 📅 Event Scheduling
- **Date & Time Picker**: Intuitive scheduling interface
- **Tomorrow Focus**: Optimized for scheduling events for the next day
- **Event Management**: Create, edit, complete, and delete events
- **Status Tracking**: Visual indicators for upcoming, due, overdue, and completed events

### 👥 Group Sharing
- **Create Groups**: Form groups with friends, family, or colleagues
- **Email-based Invites**: Add members using email addresses
- **Shared Events**: Events are visible to all group members
- **Group Management**: Full control over group membership

### 📱 Mobile-First Design
- **Android APK**: Ready for distribution on Android devices
- **Responsive UI**: Beautiful, modern interface optimized for mobile
- **Offline Support**: Local storage ensures data persistence
- **Cross-platform**: Built with React Native for future iOS support

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- Java Development Kit (JDK 11 or higher)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd SchedulingApp
   npm install
   ```

2. **Install Dependencies**
   ```bash
   # Install React Native CLI globally
   npm install -g @react-native-community/cli

   # Install iOS dependencies (if developing for iOS)
   cd ios && pod install && cd ..
   ```

3. **Android Setup**
   ```bash
   # Ensure Android SDK is installed and ANDROID_HOME is set
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Run the Application**
   ```bash
   # Start Metro bundler
   npm start

   # Run on Android (in a new terminal)
   npm run android

   # Or run on iOS (macOS only)
   npm run ios
   ```

### Building APK for Distribution

1. **Generate Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **Find APK**
   The APK will be generated at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Install on Device**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

## Usage Guide

### Getting Started

1. **First Launch**: Enter your name and email to create your profile
2. **Create Events**: Use the "Add Event" tab to schedule new events
3. **Manage Groups**: Create groups in the "Groups" tab to share events
4. **Configure Settings**: Customize notifications in the "Settings" tab

### Creating Events

1. Navigate to the "Add Event" tab
2. Enter event title and description
3. Select date and time (defaults to tomorrow)
4. Choose a group or keep as personal
5. Tap "Create Event" to schedule

### Managing Groups

1. Go to the "Groups" tab
2. Tap the "+" button to create a new group
3. Enter group name and add member emails
4. Tap "Create Group" to finalize
5. Group members can now see shared events

### Voice Notifications

1. Open "Settings" tab
2. Toggle "Voice Notifications" on/off
3. Select preferred voice language
4. Test voice with "Test Voice Notification"
5. Configure sound and vibration preferences

## Technical Architecture

### Frontend (React Native)
- **TypeScript**: Type-safe development
- **React Navigation**: Screen navigation and routing
- **AsyncStorage**: Local data persistence
- **React Native TTS**: Text-to-speech functionality
- **Push Notifications**: Local notification system
- **Date Picker**: Native date/time selection
- **Vector Icons**: Material Design icons

### Data Management
- **Local Storage**: AsyncStorage for offline functionality
- **Type Safety**: Comprehensive TypeScript interfaces
- **Service Layer**: Organized business logic
- **Real-time Updates**: Automatic event status checking

### Android Integration
- **Native Permissions**: Notification and alarm permissions
- **Background Processing**: Persistent notification checking
- **APK Generation**: Release build configuration
- **Material Design**: Android-native UI components

## Project Structure

```
SchedulingApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main application screens
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CreateEventScreen.tsx
│   │   ├── GroupManagementScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Business logic services
│   │   ├── StorageService.ts
│   │   └── NotificationService.ts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── App.tsx             # Main application component
├── android/                # Android-specific code
├── ios/                    # iOS-specific code (future)
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Key Features in Detail

### Event Management
- **Smart Scheduling**: Optimized for next-day planning
- **Status Tracking**: Visual indicators for event states
- **Completion Tracking**: Mark events as completed
- **Automatic Cleanup**: Remove old completed events

### Notification System
- **Voice Alerts**: Spoken notifications using device TTS
- **Visual Notifications**: Standard push notifications
- **Customizable**: Control all notification preferences
- **Persistent**: Notifications work even when app is closed

### Group Collaboration
- **Email-based**: Simple group creation using email addresses
- **Shared Visibility**: All group members see shared events
- **Owner Controls**: Group creators have full management rights
- **Privacy Options**: Personal events remain private

## Troubleshooting

### Common Issues

1. **Voice Not Working**
   - Check device TTS settings
   - Ensure voice notifications are enabled
   - Test with "Test Voice Notification" button

2. **Notifications Not Appearing**
   - Grant notification permissions
   - Check Do Not Disturb settings
   - Verify app has background permissions

3. **APK Installation Failed**
   - Enable "Unknown Sources" in Android settings
   - Check APK signature and build process
   - Use `adb install` for debugging

### Performance Tips

- **Regular Cleanup**: Delete old completed events
- **Group Management**: Remove unused groups
- **Storage Monitoring**: Check app storage usage
- **Background Optimization**: Configure battery optimization settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Android device
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the technical documentation

## Future Enhancements

- **iOS Support**: Full iOS compatibility
- **Cloud Sync**: Real-time synchronization across devices
- **Advanced Scheduling**: Recurring events and reminders
- **Team Features**: Enhanced group collaboration tools
- **Analytics**: Event completion tracking and insights
