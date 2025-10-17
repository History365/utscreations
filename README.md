# MusicListener6000

A full-featured music streaming app that can be wrapped with Capacitor to create an iOS .ipa for sideloading through AltStore.

## Features

- User authentication (email + Google sign-in)
- Firebase integration (Firestore + Storage)
- Persistent music player across pages
- Background playback with lock screen controls
- Mobile-optimized responsive design
- SPA-like page navigation
- Album, playlist, and song browsing
- User library with liked songs and custom playlists
- Search functionality

## Project Structure

- `/index.html` - Main app shell
- `/js/app.js` - Routing and player logic
- `/js/firebase.js` - Firebase setup and auth
- `/pages/` - Individual HTML templates for each page
- `/css/app.css` - Styles for dark theme UI
- `/img/` - Images and icons

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Set up Authentication with Email/Password and Google providers
4. Create the necessary Firestore collections (see Firebase Data Structure below)
5. Update the Firebase config in `js/firebase.js` with your project details

### 2. Local Development

```bash
# Install a local development server if needed
npm install -g http-server

# Run the server
http-server -p 8080
```

### 3. Capacitor Setup

1. Create a new directory for the Capacitor project:

```bash
mkdir musiclistener6000-app
cd musiclistener6000-app
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init MusicListener6000 com.example.musiclistener6000 --web-dir=../musiclistener6000
```

2. Add necessary plugins:

```bash
npm install @capacitor/app @capacitor/status-bar @capacitor-community/background-mode @capacitor/splash-screen
npx cap sync
```

3. Copy web assets:

```bash
# First build your web app if needed
cd ../musiclistener6000
# Copy files to capacitor www directory
cp -r * ../musiclistener6000-app/www/
cd ../musiclistener6000-app
```

4. Add iOS platform:

```bash
npx cap add ios
```

5. Open the iOS project:

```bash
npx cap open ios
```

6. In Xcode:
   - Update signing settings with your Apple Developer account
   - Enable Background Audio in Capabilities
   - Build the project to create the .ipa file

7. Use AltStore to install the .ipa on your iOS device

## Firebase Data Structure

### Collections:

#### Users
```
users/{userId}
  - email: string
  - displayName: string
  - photoURL: string
  - likedSongs: array<songId>
  - recentlyPlayed: array<songId>
```

#### Songs
```
songs/{songId}
  - title: string
  - artist: string
  - album: string
  - coverUrl: string
  - storagePath: string
  - duration: number
```

#### Albums
```
albums/{albumId}
  - title: string
  - artist: string
  - releaseYear: number
  - coverUrl: string
  - featured: boolean
  - songs: array<songId>
```

#### Playlists
```
playlists/{playlistId}
  - name: string
  - userId: string
  - coverUrl: string
  - featured: boolean
  - createdAt: timestamp
  - songs: array<songId>
```

## License

This project is for educational purposes only.

## Credits

- Built with Capacitor and Firebase
- Icons from Font Awesome
- Inspired by popular music streaming services