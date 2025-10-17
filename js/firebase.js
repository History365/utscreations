/**
 * MusicListener6000 Cloudflare Database Integration
 * 
 * This file handles all database operations for the MusicListener6000 app.
 * For development purposes, we are using mock data instead of actual Firebase/Cloudflare.
 * 
 * All song files, album art, and user data are coming from mock data for easy development.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

import * as mockData from './mockData.js';

// Cloudflare configuration - Using Firebase SDK with Cloudflare backend
const firebaseConfig = {
  apiKey: "CLOUDFLARE_API_TOKEN",
  authDomain: "musiclistener6000.yourdomain.workers.dev",
  projectId: "musiclistener6000",
  storageBucket: "musiclistener6000.workers.dev",
  messagingSenderId: "cloudflare",
  appId: "musiclistener6000-app",
  customEndpoint: "https://musiclistener6000.yourdomain.workers.dev/api"
};

// Initialize Firebase with Cloudflare backend
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Cloudflare D1 API wrapper for database operations
const cloudflareAPI = {
  // Base endpoint for all API requests
  baseUrl: firebaseConfig.customEndpoint,
  
  // Helper method for API calls
  async callAPI(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}/${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Cloudflare API request failed:', error);
      throw error;
    }
  },
  
  // Data access methods to ensure all data comes from Cloudflare
  async getSongs() {
    return this.callAPI('songs');
  },
  
  async getSongById(songId) {
    return this.callAPI(`songs/${songId}`);
  },
  
  async getAlbums() {
    return this.callAPI('albums');
  },
  
  async getAlbumById(albumId) {
    return this.callAPI(`albums/${albumId}`);
  },
  
  async getArtists() {
    return this.callAPI('artists');
  },
  
  async getArtistById(artistId) {
    return this.callAPI(`artists/${artistId}`);
  },
  
  async getPlaylists(userId) {
    return this.callAPI(`playlists?userId=${userId}`);
  },
  
  async getPlaylistById(playlistId) {
    return this.callAPI(`playlists/${playlistId}`);
  },
  
  async getUserData(userId) {
    return this.callAPI(`users/${userId}`);
  }
};

// Current user state
let currentUser = null;

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    currentUser = user;
    console.log("User is signed in:", user.uid);
    localStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));
    
    // Show logged-in UI elements
    document.body.classList.add('logged-in');
    
    // Load user-specific content (if on a page that needs it)
    if (typeof loadUserContent === 'function') {
      loadUserContent();
    }
    
    // Update profile info if on profile page
    updateProfileUI();
    
  } else {
    // User is signed out
    currentUser = null;
    console.log("User is signed out");
    localStorage.removeItem("user");
    
    // Redirect to login if not already there
    if (!window.location.hash.includes('#login')) {
      window.location.hash = '#login';
    }
    
    document.body.classList.remove('logged-in');
  }
});

// Default test credentials - for demo purposes only
const TEST_CREDENTIALS = {
  email: "test@musiclistener6000.com",
  password: "password123"
};

// Email/Password Authentication
async function loginWithEmail(email, password) {
  try {
    // Check for test credentials (easier for demos/testing)
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      console.log("Using test account");
      // Create a mock user credential
      return { 
        success: true, 
        user: {
          uid: "test-user-123",
          email: TEST_CREDENTIALS.email,
          displayName: "Test User",
          photoURL: "img/default-profile.png"
        }
      };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
}

async function signupWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }
}

// Google Authentication
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
}

// Update profile UI if on profile page
function updateProfileUI() {
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');
  const profileImageEl = document.getElementById('profile-image');
  
  if (profileNameEl && profileEmailEl && profileImageEl && currentUser) {
    profileNameEl.textContent = currentUser.displayName || 'User';
    profileEmailEl.textContent = currentUser.email || '';
    
    if (currentUser.photoURL) {
      profileImageEl.src = currentUser.photoURL;
      profileImageEl.alt = currentUser.displayName || 'User';
    } else {
      profileImageEl.src = '../img/default-profile.png';
      profileImageEl.alt = 'Default Profile';
    }
  }
}

// Music data functions
async function getFeaturedContent() {
  try {
    // Using Cloudflare API to get featured content
    const response = await cloudflareAPI.callAPI('featured');
    
    // If the Cloudflare API returns formatted results
    if (response && response.albums && response.playlists) {
      return response;
    }
    
    // Otherwise, process the raw response
    const albums = (response?.albums || []).filter(album => album.featured === true);
    const playlists = (response?.playlists || []).filter(playlist => playlist.featured === true);
    
    return { albums, playlists };
  } catch (error) {
    console.error("Error getting featured content from Cloudflare:", error);
    return { albums: [], playlists: [] };
  }
}

async function searchMusic(searchTerm) {
  try {
    // Use Cloudflare API for search functionality
    const response = await cloudflareAPI.callAPI(`search?q=${encodeURIComponent(searchTerm)}`);
    
    // If the Cloudflare API returns formatted results directly
    if (response && response.songs) {
      return response;
    }
    
    // Fallback if we need to format the results ourselves
    const songs = (response || []).filter(item => 
      item.type === 'song' && (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    return { songs };
  } catch (error) {
    console.error("Error searching music in Cloudflare:", error);
    return { songs: [] };
  }
}

async function getUserLibrary() {
  if (!currentUser) return { liked: [], recentlyPlayed: [], playlists: [] };
  
  try {
    // Using Cloudflare API wrapper to get user data from Cloudflare D1
    const userData = await cloudflareAPI.getUserData(currentUser.uid);
    
    if (userData) {
      // Get liked songs from Cloudflare
      const likedSongsPromises = (userData.likedSongs || []).map(
        songId => cloudflareAPI.getSongById(songId)
      );
      
      // Get recently played songs from Cloudflare
      const recentSongsPromises = (userData.recentlyPlayed || []).map(
        songId => cloudflareAPI.getSongById(songId)
      );
      
      // Get user playlists from Cloudflare
      const userPlaylists = await cloudflareAPI.getPlaylists(currentUser.uid);
      
      // Get all data from Cloudflare
      const [likedSongs, recentlyPlayedSongs] = await Promise.all([
        Promise.all(likedSongsPromises),
        Promise.all(recentSongsPromises)
      ]);
      
      // Filter out any nulls and format data
      const liked = likedSongs.filter(song => song);
      const recentlyPlayed = recentlyPlayedSongs.filter(song => song);
      const playlists = userPlaylists || [];
      
      return { liked, recentlyPlayed, playlists };
    }
    
    return { liked: [], recentlyPlayed: [], playlists: [] };
  } catch (error) {
    console.error("Error getting user library:", error);
    return { liked: [], recentlyPlayed: [], playlists: [] };
  }
}

async function getPlaylistOrAlbum(id, type) {
  try {
    // Using Cloudflare API to get data
    let data;
    
    if (type === 'album') {
      data = await cloudflareAPI.getAlbumById(id);
    } else {
      data = await cloudflareAPI.getPlaylistById(id);
    }
    
    if (data) {
      // Get all songs in the playlist/album from Cloudflare
      let songs = [];
      if (data.songs && data.songs.length) {
        const songPromises = data.songs.map(songId => 
          cloudflareAPI.getSongById(songId)
        );
        
        songs = await Promise.all(songPromises);
        songs = songs.filter(song => song); // Filter out any null results
      }
      
      return {
        id: docSnap.id,
        ...data,
        songs
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting ${type}:`, error);
    return null;
  }
}

async function toggleLikeSong(songId) {
  if (!currentUser) return { success: false, error: "User not logged in" };
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const likedSongs = userData.likedSongs || [];
      
      if (likedSongs.includes(songId)) {
        // Unlike song
        await updateDoc(userDocRef, {
          likedSongs: arrayRemove(songId)
        });
        return { success: true, liked: false };
      } else {
        // Like song
        await updateDoc(userDocRef, {
          likedSongs: arrayUnion(songId)
        });
        return { success: true, liked: true };
      }
    } else {
      // Create user document
      await setDoc(userDocRef, {
        likedSongs: [songId],
        recentlyPlayed: []
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, error: error.message };
  }
}

async function addSongToPlaylist(songId, playlistId) {
  if (!currentUser) return { success: false, error: "User not logged in" };
  
  try {
    const playlistRef = doc(db, "playlists", playlistId);
    const playlistDoc = await getDoc(playlistRef);
    
    // Verify playlist exists and belongs to user
    if (playlistDoc.exists() && playlistDoc.data().userId === currentUser.uid) {
      await updateDoc(playlistRef, {
        songs: arrayUnion(songId)
      });
      return { success: true };
    } else {
      return { success: false, error: "Playlist not found or not owned by user" };
    }
  } catch (error) {
    console.error("Error adding to playlist:", error);
    return { success: false, error: error.message };
  }
}

async function createPlaylist(name) {
  if (!currentUser) return { success: false, error: "User not logged in" };
  
  try {
    const newPlaylistRef = await addDoc(collection(db, "playlists"), {
      name,
      userId: currentUser.uid,
      createdAt: new Date(),
      songs: []
    });
    
    return { 
      success: true, 
      playlist: {
        id: newPlaylistRef.id,
        name,
        songs: []
      }
    };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return { success: false, error: error.message };
  }
}

async function updateRecentlyPlayed(songId) {
  if (!currentUser) return;
  
  try {
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let recentlyPlayed = userData.recentlyPlayed || [];
      
      // Remove the song if it's already in the list
      recentlyPlayed = recentlyPlayed.filter(id => id !== songId);
      
      // Add song to the beginning
      recentlyPlayed.unshift(songId);
      
      // Keep only last 20 songs
      if (recentlyPlayed.length > 20) {
        recentlyPlayed = recentlyPlayed.slice(0, 20);
      }
      
      await updateDoc(userDocRef, { recentlyPlayed });
    } else {
      await setDoc(userDocRef, {
        likedSongs: [],
        recentlyPlayed: [songId]
      });
    }
  } catch (error) {
    console.error("Error updating recently played:", error);
  }
}

async function getSongURL(songId) {
  try {
    // Get song streaming URL directly from Cloudflare
    const response = await cloudflareAPI.callAPI(`songs/${songId}/stream`);
    
    if (response && response.url) {
      // Add analytics tracking for song plays
      try {
        await cloudflareAPI.callAPI(`analytics/play`, 'POST', {
          songId: songId,
          userId: currentUser?.uid || 'anonymous',
          timestamp: new Date().toISOString()
        });
      } catch (analyticsError) {
        // Don't fail the playback if analytics fails
        console.warn("Failed to record play analytics:", analyticsError);
      }
      
      return { success: true, url: response.url };
    }
    
    return { success: false, error: "Song streaming URL not found" };
  } catch (error) {
    console.error("Error getting song streaming URL from Cloudflare:", error);
    return { success: false, error: "Error accessing song data from Cloudflare" };
  }
}

// Mock data functions for development
async function getUserLibrary() {
  // Return mock data instead of fetching from Firebase
  return mockData.mockUserLibrary;
}

async function getFeaturedContent() {
  // Return mock featured content
  return mockData.mockFeaturedContent;
}

async function getPlaylistOrAlbum(type, id) {
  if (type === 'album') {
    return mockData.getAlbumById(id);
  } else {
    return mockData.mockUserLibrary.playlists.find(playlist => playlist.id === id);
  }
}

async function searchMusic(query) {
  // Simple search in mock data
  const allSongs = mockData.getAllSongs();
  const allAlbums = mockData.getAllAlbums();
  
  const songs = allSongs.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  );
  
  const albums = allAlbums.filter(album => 
    album.title.toLowerCase().includes(query.toLowerCase()) ||
    album.artist.toLowerCase().includes(query.toLowerCase())
  );
  
  return { songs, albums };
}

async function getSongURL(songId) {
  const song = mockData.getSongById(songId);
  return { 
    success: true, 
    url: song ? song.audioUrl : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  };
}

// Export functions
export {
  auth,
  getUserLibrary,
  getFeaturedContent,
  getPlaylistOrAlbum,
  searchMusic,
  getSongURL
};