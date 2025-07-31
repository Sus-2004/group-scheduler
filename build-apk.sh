#!/bin/bash

echo "🏗️  Building Android APK for Scheduling App..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo "❌ Android directory not found"
    exit 1
fi

# Navigate to android directory
cd android

# Make gradlew executable
chmod +x gradlew

echo "📦 Building release APK..."

# Build the APK
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 APK built successfully!"
    echo ""
    echo "📱 APK Location:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "📲 To install on device:"
    echo "   adb install app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "📤 To share the APK:"
    echo "   The APK file can be copied and installed on any Android device"
    echo "   Make sure 'Unknown Sources' is enabled in device settings"
else
    echo "❌ APK build failed"
    exit 1
fi