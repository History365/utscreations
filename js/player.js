// Global variables
const audio = document.getElementById('player');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayPauseBtn = document.getElementById('bigPlayPauseBtn');
const albumArt = document.getElementById('albumArt');
const miniAlbumArt = document.getElementById('mini-album-art');

// Sample music library (will be replaced by a more robust solution)
const musicLibrary = {
    albums: [
        {
            id: 1,
            title: "Dirt",
            artist: "Alice In Chains",
            cover: "songs/cover.jpg",
            songs: [
                {
                    id: 1,
                    title: "Them Bones",
                    artist: "Alice In Chains",
                    album: "Dirt",
                    src: "songs/them-bones.mp3",
                    artwork: "songs/cover.jpg",
                    duration: 149
                },
                {
                    id: 2,
                    title: "Dam That River",
                    artist: "Alice In Chains",
                    album: "Dirt",
                    src: "songs/them-bones.mp3", // Replace with actual file
                    artwork: "songs/cover.jpg",
                    duration: 203
                }
            ]
        }
    ]
};

// Current state
let currentSong = musicLibrary.albums[0].songs[0];
let isPlaying = false;
let currentPlaylist = [];
let currentIndex = 0;

// Initialize the player
function initPlayer() {
    // Set current song
    loadSong(currentSong);
    
    // Setup event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    // Initialize tabs
    initAlbumTabs();
    
    // Initialize Media Session API
    initMediaSession();
    
    // Save the player state to localStorage when the page unloads
    window.addEventListener('beforeunload', savePlayerState);
    
    // Try to restore previous session
    restorePlayerState();
}

// Media Session API for lock screen controls
function initMediaSession() {
    if ('mediaSession' in navigator) {
        updateMediaSessionMetadata();
        
        navigator.mediaSession.setActionHandler('play', () => {
            audio.play();
            updatePlayPauseButtons(true);
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            audio.pause();
            updatePlayPauseButtons(false);
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        
        // Additional handlers for seeking
        navigator.mediaSession.setActionHandler('seekbackward', function() {
            audio.currentTime = Math.max(audio.currentTime - 10, 0);
        });
        
        navigator.mediaSession.setActionHandler('seekforward', function() {
            audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
        });
    }
}

// Update Media Session metadata based on current song
function updateMediaSessionMetadata() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.title,
            artist: currentSong.artist,
            album: currentSong.album,
            artwork: [
                { src: currentSong.artwork, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
    }
}

// Load a song into the player
function loadSong(song) {
    currentSong = song;
    
    // Update audio source
    audio.src = song.src;
    audio.load();
    
    // Update UI
    document.getElementById('songTitle').textContent = song.title;
    document.getElementById('artistName').textContent = song.artist;
    document.getElementById('albumName').textContent = song.album;
    document.getElementById('mini-song-title').textContent = song.title;
    document.getElementById('mini-artist-name').textContent = song.artist;
    
    // Update album art
    if (albumArt) albumArt.src = song.artwork;
    if (miniAlbumArt) miniAlbumArt.src = song.artwork;
    
    // Update media session
    updateMediaSessionMetadata();
}

// Toggle play/pause
function togglePlay() {
    if (audio.paused) {
        audio.play();
        isPlaying = true;
    } else {
        audio.pause();
        isPlaying = false;
    }
    
    updatePlayPauseButtons(isPlaying);
}

// Update play/pause button appearance
function updatePlayPauseButtons(playing) {
    if (playing) {
        if (playPauseBtn) playPauseBtn.textContent = "⏸️";
        if (bigPlayPauseBtn) bigPlayPauseBtn.textContent = "⏸️";
    } else {
        if (playPauseBtn) playPauseBtn.textContent = "▶️";
        if (bigPlayPauseBtn) bigPlayPauseBtn.textContent = "▶️";
    }
    
    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }
}

// Go to previous track
function prevTrack() {
    if (currentPlaylist.length === 0) {
        currentPlaylist = musicLibrary.albums[0].songs;
    }
    
    if (audio.currentTime > 3) {
        // If more than 3 seconds into the song, restart the current song
        audio.currentTime = 0;
        return;
    }
    
    // Go to previous track
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadSong(currentPlaylist[currentIndex]);
    
    if (isPlaying) {
        audio.play();
    }
}

// Go to next track
function nextTrack() {
    if (currentPlaylist.length === 0) {
        currentPlaylist = musicLibrary.albums[0].songs;
    }
    
    // Go to next track
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    loadSong(currentPlaylist[currentIndex]);
    
    if (isPlaying) {
        audio.play();
    }
}

// Update progress bar as the song plays
function updateProgress() {
    const percent = (audio.currentTime / audio.duration) * 100;
    if (progressBar) progressBar.style.width = `${percent}%`;
    
    // Update time display
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    }
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update duration display when song is loaded
function updateDuration() {
    if (durationDisplay) {
        durationDisplay.textContent = formatTime(audio.duration);
    }
}

// Initialize album tabs and events
function initAlbumTabs() {
    // Add click handlers for albums
    const albumCards = document.querySelectorAll('.album-card');
    albumCards.forEach(card => {
        card.addEventListener('click', function() {
            const albumId = parseInt(this.dataset.albumId, 10);
            openAlbumDetail(albumId);
        });
    });
}

// Open album detail view
function openAlbumDetail(albumId) {
    // Find the album
    const album = musicLibrary.albums.find(a => a.id === albumId);
    if (!album) return;
    
    // Load the album's songs as current playlist
    currentPlaylist = album.songs;
    
    // Could navigate to an album detail page here
    console.log(`Opening album: ${album.title}`);
    
    // For now, just play the first song
    currentIndex = 0;
    loadSong(currentPlaylist[currentIndex]);
    if (isPlaying) {
        audio.play();
    }
}

// Save player state to localStorage for persistence across pages
function savePlayerState() {
    const playerState = {
        currentSong: currentSong,
        currentTime: audio.currentTime,
        isPlaying: isPlaying,
        currentPlaylist: currentPlaylist,
        currentIndex: currentIndex
    };
    
    localStorage.setItem('musicPlayer', JSON.stringify(playerState));
}

// Restore player state from localStorage
function restorePlayerState() {
    const savedState = localStorage.getItem('musicPlayer');
    if (savedState) {
        try {
            const playerState = JSON.parse(savedState);
            
            // Restore song and playlist
            currentSong = playerState.currentSong;
            currentPlaylist = playerState.currentPlaylist;
            currentIndex = playerState.currentIndex;
            
            // Load the song
            loadSong(currentSong);
            
            // Restore playback position
            audio.currentTime = playerState.currentTime;
            
            // Restore play state
            isPlaying = playerState.isPlaying;
            if (isPlaying) {
                audio.play().catch(() => {
                    // Auto-play may be blocked, update UI accordingly
                    isPlaying = false;
                    updatePlayPauseButtons(false);
                });
            } else {
                updatePlayPauseButtons(false);
            }
        } catch (error) {
            console.error('Error restoring player state:', error);
        }
    }
}

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);