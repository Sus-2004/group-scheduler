#!/bin/bash

echo "🚀 Setting up Scheduling App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME is not set. Android development may not work."
    echo "   Please install Android Studio and set ANDROID_HOME environment variable."
else
    echo "✅ Android SDK detected at $ANDROID_HOME"
fi

# Make gradlew executable
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
    echo "✅ Made gradlew executable"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 To run the app:"
echo "   npm start          # Start Metro bundler"
echo "   npm run android    # Run on Android (in another terminal)"
echo ""
echo "🏗️  To build APK:"
echo "   cd android && ./gradlew assembleRelease"
echo ""
echo "📖 For more information, check README.md"