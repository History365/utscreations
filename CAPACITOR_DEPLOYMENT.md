# Deploying MusicListener6000 to iOS via Capacitor and AltStore

This document provides detailed instructions for deploying MusicListener6000 to iOS devices using Capacitor and sideloading via AltStore.

## Prerequisites

- macOS computer with Xcode 12+ installed
- Apple Developer Account (free account works with AltStore)
- Node.js and npm installed
- AltStore installed on your iOS device
- AltServer running on your Mac or Windows PC

## Step 1: Install Required Tools

```bash
# Install Capacitor CLI and required packages globally
npm install -g @capacitor/cli
```

## Step 2: Create a Capacitor Project

```bash
# Create a directory for the Capacitor project
mkdir musiclistener6000-app
cd musiclistener6000-app

# Initialize a new npm project
npm init -y

# Install Capacitor core packages
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor with your app info
npx cap init MusicListener6000 com.yourname.musiclistener6000 --web-dir=../musiclistener6000
```

## Step 3: Install Required Capacitor Plugins

```bash
# Install essential plugins
npm install @capacitor/app @capacitor/status-bar @capacitor/splash-screen

# Install background audio plugin (important for music playback)
npm install @capacitor-community/background-mode

# Install other useful plugins
npm install @capacitor/haptics @capacitor/keyboard @capacitor/share
```

## Step 4: Configure Capacitor

Create or update `capacitor.config.json` file:

```json
{
  "appId": "com.yourname.musiclistener6000",
  "appName": "MusicListener6000",
  "webDir": "../musiclistener6000",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#121212",
      "androidSplashResourceName": "splash",
      "splashFullScreen": true,
      "splashImmersive": true
    },
    "BackgroundMode": {
      "title": "MusicListener6000",
      "text": "Playing music in background",
      "icon": "notification_icon",
      "color": "#121212",
      "resume": true
    }
  },
  "server": {
    "hostname": "app",
    "androidScheme": "https"
  }
}
```

## Step 5: Create iOS Platform

```bash
# First, make sure your web files are built and ready
cd ../musiclistener6000

# Create www directory in Capacitor project if it doesn't exist
mkdir -p ../musiclistener6000-app/www

# Copy your web files to the Capacitor project
cp -r * ../musiclistener6000-app/www/

# Go back to Capacitor project
cd ../musiclistener6000-app

# Add iOS platform
npx cap add ios

# Sync project (transfers web code to native project)
npx cap sync ios
```

## Step 6: Configure iOS-specific Settings

Open the iOS project in Xcode:

```bash
npx cap open ios
```

In Xcode:

1. Select the project in the Navigator
2. Select "Signing & Capabilities"
3. Sign in with your Apple Developer account
4. Add the following capabilities:
   - Background Modes
     - Enable "Audio, AirPlay, and Picture in Picture"
   - App Groups (if you want to share data between app extensions)

## Step 7: Add App Icons and Splash Screens

1. Use a tool like [MakeAppIcon](https://makeappicon.com/) to generate all required icon sizes
2. Replace the default icons in Xcode
3. Configure splash screen assets

## Step 8: Build the App

1. In Xcode, select "Product" > "Archive"
2. After archiving completes, click "Distribute App"
3. Choose "Development" distribution
4. Follow the prompts to create an .ipa file

## Step 9: Sideload with AltStore

1. Make sure your iOS device and computer are on the same WiFi network
2. AltServer should be running on your computer
3. In AltStore on your device, go to "My Apps" tab
4. Tap the "+" button and select the .ipa file
5. Sign in with your Apple ID when prompted

## Step 10: Test and Debug

1. Launch the app on your device
2. Check for any console errors
3. Test background audio functionality
4. Verify lock screen controls work correctly

## Troubleshooting

- **App crashes on launch**: Check the Xcode logs for detailed error information
- **Background audio stops**: Make sure BackgroundMode plugin is configured correctly
- **AltStore sideloading fails**: Ensure your Apple ID has two-factor authentication enabled and you've generated an app-specific password

## Updating the App

To update the app after making changes to your web code:

```bash
# Update web assets in Capacitor project
cp -r ../musiclistener6000/* www/

# Sync changes to iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build new version and repeat sideloading process
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [AltStore Documentation](https://altstore.io/faq/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)