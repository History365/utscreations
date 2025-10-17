// Music app router and global player logic
// Global state
const state = {
  currentSong: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  volume: 0.8,
  repeatMode: 'none', // none, one, all
  shuffleMode: false,
  queueVisible: false,
  savedPosition: 0,
  expandedPlayer: false,
};

// DOM Elements
let audioElement;
let miniPlayer;
let fullscreenPlayer;
let progressBar;
let volumeSlider;
let nowPlayingImg;
let nowPlayingTitle;
let nowPlayingArtist;
let playPauseBtn;
let fullPlayPauseBtn;

// Routes configuration
const routes = {
  '#login': {
    page: 'pages/login.html',
    title: 'Login - MusicListener6000',
    requireAuth: false,
    init: initLoginPage
  },
  '#home': {
    page: 'pages/home.html',
    title: 'Home - MusicListener6000',
    requireAuth: true,
    init: initHomePage
  },
  '#new': {
    page: 'pages/new.html',
    title: 'New - MusicListener6000',
    requireAuth: true,
    init: initNewPage
  },
  '#radio': {
    page: 'pages/radio.html',
    title: 'Radio - MusicListener6000',
    requireAuth: true,
    init: initRadioPage
  },
  '#search': {
    page: 'pages/search.html',
    title: 'Search - MusicListener6000',
    requireAuth: true,
    init: initSearchPage
  },
  '#library': {
    page: 'pages/library.html',
    title: 'Library - MusicListener6000',
    requireAuth: true,
    init: initLibraryPage
  },
  '#playlist': {
    page: 'pages/playlist.html',
    title: 'Playlist - MusicListener6000',
    requireAuth: true,
    init: initPlaylistPage
  },
  '#album': {
    page: 'pages/album.html',
    title: 'Album - MusicListener6000',
    requireAuth: true,
    init: initAlbumPage
  },
  '#now-playing': {
    page: 'pages/now-playing.html',
    title: 'Now Playing - MusicListener6000',
    requireAuth: true,
    init: initNowPlayingPage
  },
  '#profile': {
    page: 'pages/profile.html',
    title: 'Profile - MusicListener6000',
    requireAuth: true,
    init: initProfilePage
  },
};

// Default route
const defaultRoute = '#home';

// Utility Functions
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Initialize App
function initApp() {
  // Setup audio element
  setupAudio();
  
  // Setup router
  setupRouter();
  
  // Bypass authentication for development
  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });
  
  // Navigate to initial route
  if (!window.location.hash) {
    window.location.hash = '#home';
  } else {
    navigateTo(window.location.hash);
  }
  
  // Restore last played song
  restorePlayerState();
}

// Setup audio element
function setupAudio() {
  // Create audio element if it doesn't exist
  if (!document.getElementById('music-player')) {
    audioElement = document.createElement('audio');
    audioElement.id = 'music-player';
    audioElement.preload = 'auto';
    document.body.appendChild(audioElement);
  } else {
    audioElement = document.getElementById('music-player');
  }
  
  // Audio event listeners
  audioElement.addEventListener('timeupdate', updateProgress);
  audioElement.addEventListener('ended', handleSongEnd);
  audioElement.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayerUI();
  });
  audioElement.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayerUI();
  });
  audioElement.addEventListener('loadedmetadata', () => {
    updateDuration();
  });
}

// Setup router
function setupRouter() {
  // Intercept link clicks for SPA behavior
  document.body.addEventListener('click', (e) => {
    // Find closest anchor element (works even if user clicks on an image or text inside the link)
    const link = e.target.closest('a');
    
    if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
      e.preventDefault();
      window.location.hash = link.getAttribute('href');
    }
  });
}

// Navigate to route
async function navigateTo(hash) {
  // Extract route and query params
  let [route, queryParams] = hash.split('?');
  const params = new URLSearchParams(queryParams || '');
  
  // Check if route exists
  if (!routes[route]) {
    route = '#home';
  }
  
  const routeInfo = routes[route];
  
  // Bypass auth check for development
  // if (routeInfo.requireAuth && !firebase.auth.currentUser) {
  //   window.location.hash = '#login';
  //   return;
  // }
  
  try {
    // Fetch the page content
    const response = await fetch(routeInfo.page);
    if (!response.ok) throw new Error(`Failed to fetch page: ${response.status}`);
    
    const html = await response.text();
    
    // Update the content
    const contentDiv = document.getElementById('app-content');
    contentDiv.innerHTML = html;
    
    // Update the title
    document.title = routeInfo.title;
    
    // Highlight active navigation
    highlightActiveNavItem(route);
    
    // Call the init function for the route
    if (routeInfo.init) {
      routeInfo.init(params);
    }
    
    // Update active navigation state
    updateNavigation(route);
    
  } catch (error) {
    console.error('Navigation error:', error);
    document.getElementById('app-content').innerHTML = `<div class="error-container"><h2>Error</h2><p>Failed to load page content. Please try again.</p></div>`;
  }
}

// Update navigation active states
function updateNavigation(currentRoute) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkHash = link.getAttribute('href');
    if (linkHash === currentRoute) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Highlight active navigation item with visual indicator
function highlightActiveNavItem(route) {
  // Get just the main route without parameters
  const mainRoute = route.split('?')[0];
  
  // Reset all navigation items
  document.querySelectorAll('.nav-link').forEach(item => {
    item.classList.remove('active-nav');
    const icon = item.querySelector('.nav-icon, .nav-icon-mobile');
    if (icon) {
      icon.style.filter = 'invert(70%)';
    }
  });
  
  // Reset all library navigation items
  document.querySelectorAll('.library-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Find and highlight the active navigation items (both desktop and mobile)
  document.querySelectorAll(`.nav-link[href="${mainRoute}"]`).forEach(activeItem => {
    activeItem.classList.add('active-nav');
    const icon = activeItem.querySelector('.nav-icon, .nav-icon-mobile');
    if (icon) {
      // Just change class, no direct style manipulation
      // The CSS will handle the styling
    }
  });
  
  // Handle library tabs if we're on the library page
  if (mainRoute === '#library') {
    const queryParams = new URLSearchParams(route.split('?')[1] || '');
    const tab = queryParams.get('tab') || 'playlists';
    
    // Find and highlight the active tab
    const selector = tab === 'playlists' 
      ? '.library-nav-item[href="#library"]' 
      : `.library-nav-item[href="#library?tab=${tab}"]`;
    
    const activeTab = document.querySelector(selector);
    if (activeTab) {
      activeTab.classList.add('active');
    }
  }
}

// Route initialization functions
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const googleBtn = document.getElementById('google-signin-btn');
  const switchToSignupBtn = document.getElementById('switch-to-signup');
  const switchToLoginBtn = document.getElementById('switch-to-login');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const result = await firebase.loginWithEmail(email, password);
      if (!result.success) {
        showError('login-error', result.error);
      }
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      const result = await firebase.signupWithEmail(email, password);
      if (!result.success) {
        showError('signup-error', result.error);
      }
    });
  }
  
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      await firebase.loginWithGoogle();
    });
  }
  
  if (switchToSignupBtn) {
    switchToSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-container').classList.add('hidden');
      document.getElementById('signup-container').classList.remove('hidden');
    });
  }
  
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-container').classList.add('hidden');
      document.getElementById('login-container').classList.remove('hidden');
    });
  }
}

async function initHomePage() {
  try {
    // Use mockData directly instead of Firebase
    const featuredContent = mockFeaturedContent;
    
    // Render featured albums
    const albumsContainer = document.getElementById('featured-albums');
    if (albumsContainer && featuredContent.albums.length) {
      albumsContainer.innerHTML = featuredContent.albums.map(album => `
        <div class="album-card" data-id="${album.id}">
          <img src="${album.coverUrl}" alt="${album.title}" class="album-cover">
          <h4>${album.title}</h4>
          <p>${album.artist}</p>
        </div>
      `).join('');
      
      // Add click listeners to album cards
      document.querySelectorAll('.album-card').forEach(card => {
        card.addEventListener('click', () => {
          window.location.hash = `#album?id=${card.dataset.id}`;
        });
      });
    }
    
    // Render featured playlists
    const playlistsContainer = document.getElementById('featured-playlists');
    if (playlistsContainer && featuredContent.playlists.length) {
      playlistsContainer.innerHTML = featuredContent.playlists.map(playlist => `
        <div class="playlist-card" data-id="${playlist.id}">
          <img src="${playlist.coverUrl}" alt="${playlist.name}" class="playlist-cover">
          <h4>${playlist.name}</h4>
          <p>${playlist.songs ? playlist.songs.length : 0} songs</p>
        </div>
      `).join('');
      
      // Add click listeners to playlist cards
      document.querySelectorAll('.playlist-card').forEach(card => {
        card.addEventListener('click', () => {
          window.location.hash = `#playlist?id=${card.dataset.id}`;
        });
      });
    }
    
  } catch (error) {
    console.error('Error initializing home page:', error);
  }
}

function initNewPage() {
  try {
    // Set up the new releases section
    const newReleasesContainer = document.getElementById('new-releases');
    
    // Display a loading message until content is ready
    if (newReleasesContainer) {
      newReleasesContainer.innerHTML = '<div class="loading-indicator">Loading new releases...</div>';
      
      // Simulate fetching new releases (would be replaced with actual API call)
      setTimeout(async () => {
        try {
          // In a real application, this would be an API call
          const newReleases = await firebase.getNewReleases();
          
          if (newReleases && newReleases.length) {
            newReleasesContainer.innerHTML = newReleases.map(release => `
              <div class="release-card" data-id="${release.id}">
                <img src="${release.coverUrl}" alt="${release.title}" class="release-cover">
                <h4>${release.title}</h4>
                <p>${release.artist}</p>
                <span class="release-date">${release.releaseDate}</span>
              </div>
            `).join('');
            
            // Add click listeners to release cards
            document.querySelectorAll('.release-card').forEach(card => {
              card.addEventListener('click', () => {
                window.location.hash = `#album?id=${card.dataset.id}`;
              });
            });
          } else {
            newReleasesContainer.innerHTML = '<p>No new releases found</p>';
          }
        } catch (error) {
          console.error('Error loading new releases:', error);
          newReleasesContainer.innerHTML = '<p>Unable to load new releases</p>';
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error initializing New page:', error);
  }
}

function initRadioPage() {
  try {
    // Set up the radio stations section
    const radioStationsContainer = document.getElementById('radio-stations');
    
    // Display a loading message until content is ready
    if (radioStationsContainer) {
      radioStationsContainer.innerHTML = '<div class="loading-indicator">Loading radio stations...</div>';
      
      // Simulate fetching radio stations (would be replaced with actual API call)
      setTimeout(async () => {
        try {
          // In a real application, this would be an API call
          const stations = await firebase.getRadioStations();
          
          if (stations && stations.length) {
            radioStationsContainer.innerHTML = stations.map(station => `
              <div class="station-card" data-id="${station.id}">
                <div class="station-logo">
                  <img src="${station.logoUrl}" alt="${station.name}">
                </div>
                <div class="station-info">
                  <h4>${station.name}</h4>
                  <p>${station.genre}</p>
                  <button class="btn btn-sm btn-play-station" data-station-id="${station.id}">
                    <i class="fas fa-play"></i> Play
                  </button>
                </div>
              </div>
            `).join('');
            
            // Add play listeners to station cards
            document.querySelectorAll('.btn-play-station').forEach(button => {
              button.addEventListener('click', (e) => {
                e.preventDefault();
                const stationId = button.dataset.stationId;
                playRadioStation(stationId);
              });
            });
          } else {
            radioStationsContainer.innerHTML = '<p>No radio stations found</p>';
          }
        } catch (error) {
          console.error('Error loading radio stations:', error);
          radioStationsContainer.innerHTML = '<p>Unable to load radio stations</p>';
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error initializing Radio page:', error);
  }
}

function initSearchPage() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  
  if (searchForm && searchInput && resultsContainer) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const searchTerm = searchInput.value.trim();
      
      if (searchTerm.length > 1) {
        resultsContainer.innerHTML = '<p>Searching...</p>';
        
        try {
          const results = await firebase.searchMusic(searchTerm);
          
          if (results.songs.length) {
            resultsContainer.innerHTML = `
              <h3>Search Results</h3>
              <div class="songs-list">
                ${results.songs.map((song, index) => `
                  <div class="song-item" data-id="${song.id}">
                    <div class="song-info">
                      <img src="${song.coverUrl}" alt="${song.title}" class="song-cover-small">
                      <div class="song-details">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                      </div>
                    </div>
                    <button class="play-song-btn" data-index="${index}">
                      <i class="fas fa-play"></i>
                    </button>
                  </div>
                `).join('')}
              </div>
            `;
            
            // Add event listeners to play buttons
            document.querySelectorAll('.play-song-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index, 10);
                playSongsList(results.songs, index);
              });
            });
            
          } else {
            resultsContainer.innerHTML = '<p>No results found for your search.</p>';
          }
          
        } catch (error) {
          console.error('Search error:', error);
          resultsContainer.innerHTML = '<p>Error searching. Please try again.</p>';
        }
      }
    });
  }
}

async function initLibraryPage(params) {
  try {
    // Use mockData directly instead of Firebase
    const library = mockUserLibrary;
    
    // Handle library tabs
    const activeTab = params ? params.get('tab') || 'playlists' : 'playlists';
    
    // Highlight the active tab
    document.querySelectorAll('.library-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const currentTabElement = document.querySelector(`.library-nav-item[href="#library${activeTab === 'playlists' ? '' : '?tab=' + activeTab}"]`);
    if (currentTabElement) {
      currentTabElement.classList.add('active');
    }
    
    // Render liked songs
    const likedContainer = document.getElementById('liked-songs');
    if (likedContainer) {
      if (library.liked.length) {
        likedContainer.innerHTML = `
          <div class="section-header">
            <h3>Liked Songs</h3>
            <button id="play-liked" class="btn-play-all">Play All</button>
          </div>
          <div class="songs-list">
            ${library.liked.map((song, index) => `
              <div class="song-item" data-id="${song.id}">
                <div class="song-info">
                  <img src="${song.coverUrl}" alt="${song.title}" class="song-cover-small">
                  <div class="song-details">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                  </div>
                </div>
                <button class="play-song-btn" data-index="${index}">
                  <i class="fas fa-play"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `;
        
        // Add event listener to play all button
        document.getElementById('play-liked').addEventListener('click', () => {
          playSongsList(library.liked, 0);
        });
        
        // Add event listeners to play buttons
        document.querySelectorAll('#liked-songs .play-song-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index, 10);
            playSongsList(library.liked, index);
          });
        });
      } else {
        likedContainer.innerHTML = '<p>You haven\'t liked any songs yet.</p>';
      }
    }
    
    // Render recently played
    const recentContainer = document.getElementById('recently-played');
    if (recentContainer) {
      if (library.recentlyPlayed.length) {
        recentContainer.innerHTML = `
          <div class="section-header">
            <h3>Recently Played</h3>
            <button id="play-recent" class="btn-play-all">Play All</button>
          </div>
          <div class="songs-list">
            ${library.recentlyPlayed.map((song, index) => `
              <div class="song-item" data-id="${song.id}">
                <div class="song-info">
                  <img src="${song.coverUrl}" alt="${song.title}" class="song-cover-small">
                  <div class="song-details">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                  </div>
                </div>
                <button class="play-song-btn" data-index="${index}">
                  <i class="fas fa-play"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `;
        
        // Add event listener to play all button
        document.getElementById('play-recent').addEventListener('click', () => {
          playSongsList(library.recentlyPlayed, 0);
        });
        
        // Add event listeners to play buttons
        document.querySelectorAll('#recently-played .play-song-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index, 10);
            playSongsList(library.recentlyPlayed, index);
          });
        });
      } else {
        recentContainer.innerHTML = '<p>No recently played songs.</p>';
      }
    }
    
    // Render playlists
    const playlistsContainer = document.getElementById('user-playlists');
    if (playlistsContainer) {
      let playlistsHtml = '';
      
      // Add create playlist button
      playlistsHtml += `
        <div class="create-playlist">
          <button id="create-playlist-btn" class="btn btn-outline-light">
            <i class="fas fa-plus"></i> Create Playlist
          </button>
        </div>
      `;
      
      if (library.playlists.length) {
        playlistsHtml += `
          <div class="playlists-grid">
            ${library.playlists.map(playlist => `
              <div class="playlist-card" data-id="${playlist.id}">
                <img src="${playlist.coverUrl || '../img/default-playlist.png'}" alt="${playlist.name}" class="playlist-cover">
                <h4>${playlist.name}</h4>
                <p>${playlist.songs ? playlist.songs.length : 0} songs</p>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        playlistsHtml += '<p>You haven\'t created any playlists yet.</p>';
      }
      
      playlistsContainer.innerHTML = playlistsHtml;
      
      // Add event listener to create playlist button
      document.getElementById('create-playlist-btn').addEventListener('click', () => {
        showCreatePlaylistModal();
      });
      
      // Add event listeners to playlist cards
      document.querySelectorAll('.playlist-card').forEach(card => {
        card.addEventListener('click', () => {
          window.location.hash = `#playlist?id=${card.dataset.id}`;
        });
      });
    }
    
  } catch (error) {
    console.error('Error initializing library page:', error);
  }
}

async function initPlaylistPage(params) {
  const playlistId = params.get('id');
  
  if (!playlistId) {
    window.location.hash = '#library';
    return;
  }
  
  try {
    const playlist = await firebase.getPlaylistOrAlbum(playlistId, 'playlist');
    
    if (!playlist) {
      document.getElementById('playlist-container').innerHTML = '<p>Playlist not found.</p>';
      return;
    }
    
    // Render playlist header
    const headerEl = document.getElementById('playlist-header');
    if (headerEl) {
      headerEl.innerHTML = `
        <img src="${playlist.coverUrl || '../img/default-playlist.png'}" alt="${playlist.name}" class="playlist-cover-large">
        <div class="playlist-header-info">
          <h2>${playlist.name}</h2>
          <p>${playlist.songs.length} songs</p>
          <div class="playlist-actions">
            <button id="play-playlist" class="btn btn-success">Play</button>
            <button id="shuffle-playlist" class="btn btn-outline-light">Shuffle</button>
          </div>
        </div>
      `;
    }
    
    // Render playlist songs
    const songsEl = document.getElementById('playlist-songs');
    if (songsEl) {
      if (playlist.songs.length) {
        songsEl.innerHTML = `
          <div class="songs-list">
            ${playlist.songs.map((song, index) => `
              <div class="song-item" data-id="${song.id}">
                <div class="song-number">${index + 1}</div>
                <div class="song-info">
                  <img src="${song.coverUrl}" alt="${song.title}" class="song-cover-small">
                  <div class="song-details">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                  </div>
                </div>
                <div class="song-actions">
                  <button class="like-btn ${song.isLiked ? 'liked' : ''}" data-id="${song.id}">
                    <i class="fas fa-heart"></i>
                  </button>
                  <button class="play-song-btn" data-index="${index}">
                    <i class="fas fa-play"></i>
                  </button>
                  <button class="options-btn" data-id="${song.id}">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        
        // Add event listeners
        document.getElementById('play-playlist').addEventListener('click', () => {
          playSongsList(playlist.songs, 0);
        });
        
        document.getElementById('shuffle-playlist').addEventListener('click', () => {
          const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
          playSongsList(shuffled, 0);
        });
        
        document.querySelectorAll('.play-song-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index, 10);
            playSongsList(playlist.songs, index);
          });
        });
        
        document.querySelectorAll('.like-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const songId = btn.dataset.id;
            const result = await firebase.toggleLikeSong(songId);
            
            if (result.success) {
              if (result.liked) {
                btn.classList.add('liked');
              } else {
                btn.classList.remove('liked');
              }
            }
          });
        });
        
        document.querySelectorAll('.options-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const songId = btn.dataset.id;
            showSongOptionsMenu(e, songId);
          });
        });
      } else {
        songsEl.innerHTML = '<p>This playlist is empty.</p>';
      }
    }
    
  } catch (error) {
    console.error('Error initializing playlist page:', error);
  }
}

async function initAlbumPage(params) {
  const albumId = params.get('id');
  
  if (!albumId) {
    window.location.hash = '#home';
    return;
  }
  
  try {
    // Use mockData directly instead of Firebase
    const album = getAlbumById(albumId);
    
    if (!album) {
      document.getElementById('album-container').innerHTML = '<p>Album not found.</p>';
      return;
    }
    
    // Render album header
    const headerEl = document.getElementById('album-header');
    if (headerEl) {
      // Update album cover
      document.getElementById('album-cover').src = album.coverUrl;
      document.getElementById('album-cover').alt = album.title;
      
      // Update album details
      document.getElementById('album-title').textContent = album.title;
      document.getElementById('album-artist').textContent = album.artist;
      document.getElementById('album-year').textContent = album.year || 'Unknown Year';
      document.getElementById('album-tracks').textContent = `${album.songs.length} tracks`;
    }
    
    // Render album songs
    const songsContainer = document.getElementById('songs-container');
    if (songsContainer) {
      songsContainer.innerHTML = album.songs.map((song, index) => `
        <div class="track-item" data-id="${song.id}">
          <div class="track-number">${index + 1}</div>
          <div class="track-info">
            <h4 class="track-title">${song.title}</h4>
            <p class="track-artist">${song.artist}</p>
          </div>
          <div class="track-duration">${formatDuration(song.duration)}</div>
          <div class="track-actions">
            <button class="track-action-btn play-song-btn" data-id="${song.id}">
              <i class="fas fa-play"></i>
            </button>
          </div>
        </div>
      `).join('');
      
      // Add event listeners
      document.getElementById('play-album').addEventListener('click', () => {
        playSongsList(album.songs, 0);
      });
      
      document.getElementById('shuffle-album').addEventListener('click', () => {
        const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
        playSongsList(shuffled, 0);
      });
      
      document.querySelectorAll('.play-song-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const songId = btn.dataset.id;
          const songIndex = album.songs.findIndex(s => s.id === songId);
          if (songIndex !== -1) {
            playSongsList(album.songs, songIndex);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('Error initializing album page:', error);
  }
}

function initNowPlayingPage() {
  fullscreenPlayer = document.getElementById('fullscreen-player');
  
  if (fullscreenPlayer) {
    // Update UI elements
    updatePlayerUI();
    
    // Add event listeners
    const seekBar = document.getElementById('seek-bar');
    if (seekBar) {
      seekBar.addEventListener('input', () => {
        const seekTime = (seekBar.value / 100) * audioElement.duration;
        audioElement.currentTime = seekTime;
      });
    }
    
    const playBtn = document.getElementById('play-btn-large');
    if (playBtn) {
      playBtn.addEventListener('click', togglePlayback);
    }
    
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', previousSong);
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSong);
    }
    
    const repeatBtn = document.getElementById('repeat-btn');
    if (repeatBtn) {
      repeatBtn.addEventListener('click', toggleRepeat);
    }
    
    const shuffleBtn = document.getElementById('shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', toggleShuffle);
    }
    
    const volumeControl = document.getElementById('volume-control');
    if (volumeControl) {
      volumeControl.value = state.volume * 100;
      volumeControl.addEventListener('input', () => {
        const newVolume = volumeControl.value / 100;
        audioElement.volume = newVolume;
        state.volume = newVolume;
        state.isMuted = newVolume === 0;
        updateVolumeUI();
      });
    }
    
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', toggleMute);
    }
    
    const queueBtn = document.getElementById('queue-btn');
    const queueContainer = document.getElementById('queue-container');
    if (queueBtn && queueContainer) {
      queueBtn.addEventListener('click', () => {
        state.queueVisible = !state.queueVisible;
        if (state.queueVisible) {
          queueContainer.classList.remove('hidden');
          renderQueue();
        } else {
          queueContainer.classList.add('hidden');
        }
      });
    }
    
    const closeBtn = document.getElementById('close-player-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        state.expandedPlayer = false;
        window.history.back();
      });
    }
  }
}

function initProfilePage() {
  const user = firebase.auth.currentUser;
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');
  const profileImageEl = document.getElementById('profile-image');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (user) {
    if (profileNameEl) profileNameEl.textContent = user.displayName || 'User';
    if (profileEmailEl) profileEmailEl.textContent = user.email;
    
    if (profileImageEl) {
      if (user.photoURL) {
        profileImageEl.src = user.photoURL;
      } else {
        profileImageEl.src = '../img/default-profile.png';
      }
    }
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await firebase.logoutUser();
    });
  }
}

// Helper functions
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function showCreatePlaylistModal() {
  // Create modal if it doesn't exist
  let modal = document.getElementById('create-playlist-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'create-playlist-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Create New Playlist</h3>
        <input type="text" id="playlist-name" placeholder="Playlist Name" class="form-control">
        <div class="modal-actions">
          <button id="cancel-playlist" class="btn btn-outline-light">Cancel</button>
          <button id="confirm-playlist" class="btn btn-success">Create</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-playlist').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('confirm-playlist').addEventListener('click', async () => {
      const playlistName = document.getElementById('playlist-name').value.trim();
      if (playlistName) {
        const result = await firebase.createPlaylist(playlistName);
        if (result.success) {
          modal.style.display = 'none';
          window.location.hash = `#playlist?id=${result.playlist.id}`;
        } else {
          alert('Failed to create playlist: ' + result.error);
        }
      }
    });
  }
  
  // Show modal
  modal.style.display = 'flex';
  document.getElementById('playlist-name').value = '';
  document.getElementById('playlist-name').focus();
}

function showSongOptionsMenu(event, songId) {
  event.stopPropagation();
  
  // Remove existing menu if there is one
  const existingMenu = document.getElementById('song-options-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  // Create options menu
  const optionsMenu = document.createElement('div');
  optionsMenu.id = 'song-options-menu';
  optionsMenu.className = 'options-menu';
  
  // Position menu
  const rect = event.target.getBoundingClientRect();
  optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;
  optionsMenu.style.left = `${rect.left + window.scrollX - 150}px`;
  
  // Add menu items
  optionsMenu.innerHTML = `
    <div class="option-item" data-action="add-to-playlist" data-id="${songId}">
      <i class="fas fa-plus"></i> Add to Playlist
    </div>
    <div class="option-item" data-action="like" data-id="${songId}">
      <i class="fas fa-heart"></i> Like Song
    </div>
  `;
  
  document.body.appendChild(optionsMenu);
  
  // Add event listeners
  document.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', async () => {
      const action = item.dataset.action;
      const id = item.dataset.id;
      
      if (action === 'add-to-playlist') {
        showAddToPlaylistModal(id);
      } else if (action === 'like') {
        await firebase.toggleLikeSong(id);
      }
      
      // Close menu
      optionsMenu.remove();
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function closeMenu(e) {
    if (!optionsMenu.contains(e.target) && e.target !== event.target) {
      optionsMenu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

async function showAddToPlaylistModal(songId) {
  try {
    // Get user playlists
    const library = await firebase.getUserLibrary();
    const playlists = library.playlists;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add to Playlist</h3>
        <div class="playlist-list">
          ${playlists.length ? playlists.map(playlist => `
            <div class="playlist-option" data-id="${playlist.id}">
              <img src="${playlist.coverUrl || '../img/default-playlist.png'}" alt="${playlist.name}" class="playlist-cover-small">
              <span>${playlist.name}</span>
            </div>
          `).join('') : '<p>You don\'t have any playlists yet.</p>'}
          <div class="playlist-option new-playlist">
            <i class="fas fa-plus"></i>
            <span>Create New Playlist</span>
          </div>
        </div>
        <button class="btn btn-outline-light close-modal">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.new-playlist').addEventListener('click', () => {
      modal.remove();
      showCreatePlaylistWithSongModal(songId);
    });
    
    modal.querySelectorAll('.playlist-option:not(.new-playlist)').forEach(option => {
      option.addEventListener('click', async () => {
        const playlistId = option.dataset.id;
        const result = await firebase.addSongToPlaylist(songId, playlistId);
        
        if (result.success) {
          modal.remove();
          showToast('Added to playlist');
        } else {
          showToast('Failed to add song: ' + result.error);
        }
      });
    });
    
  } catch (error) {
    console.error('Error showing add to playlist modal:', error);
  }
}

async function showCreatePlaylistWithSongModal(songId) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Create New Playlist</h3>
      <input type="text" id="new-playlist-name" placeholder="Playlist Name" class="form-control">
      <div class="modal-actions">
        <button class="btn btn-outline-light cancel-btn">Cancel</button>
        <button class="btn btn-success create-btn">Create</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.cancel-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('.create-btn').addEventListener('click', async () => {
    const playlistName = document.getElementById('new-playlist-name').value.trim();
    
    if (playlistName) {
      // Create playlist
      const result = await firebase.createPlaylist(playlistName);
      
      if (result.success) {
        // Add song to the new playlist
        await firebase.addSongToPlaylist(songId, result.playlist.id);
        modal.remove();
        showToast(`Added to new playlist: ${playlistName}`);
      } else {
        showToast('Failed to create playlist: ' + result.error);
      }
    }
  });
  
  // Focus on input
  document.getElementById('new-playlist-name').focus();
}

function showToast(message) {
  // Remove existing toast if there is one
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Player functions
async function playSong(song) {
  try {
    state.currentSong = song;
    
    // Use local song files for development
    const songUrl = `songs/${song.id}.mp3`;
    
    // Update audio source
    audioElement.src = songUrl;
    audioElement.load();
    audioElement.play();
    state.isPlaying = true;
    
    // Update player UI
    updatePlayerUI();
    
    // Save player state to localStorage
    savePlayerState();
    
    // Update Media Session API metadata
    updateMediaSession();
    
  } catch (error) {
    console.error('Error playing song:', error);
  }
}

function playSongsList(songs, startIndex) {
  if (!songs || !songs.length) return;
  
  state.playlist = [...songs];
  state.currentIndex = startIndex;
  
  playSong(state.playlist[state.currentIndex]);
}

function togglePlayback() {
  if (!state.currentSong) {
    // Nothing is loaded, try to restore last played
    restorePlayerState();
    return;
  }
  
  if (state.isPlaying) {
    audioElement.pause();
  } else {
    audioElement.play();
  }
}

function nextSong() {
  if (!state.playlist || !state.playlist.length) return;
  
  if (state.shuffleMode) {
    // Random song excluding current
    const availableIndices = [...Array(state.playlist.length).keys()].filter(i => i !== state.currentIndex);
    if (availableIndices.length) {
      state.currentIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      state.currentIndex = 0;
    }
  } else {
    // Next song in list
    state.currentIndex = (state.currentIndex + 1) % state.playlist.length;
  }
  
  playSong(state.playlist[state.currentIndex]);
}

function previousSong() {
  if (!state.playlist || !state.playlist.length) return;
  
  // If we're more than 3 seconds into the song, restart it
  if (audioElement.currentTime > 3) {
    audioElement.currentTime = 0;
    return;
  }
  
  if (state.shuffleMode) {
    // Random song excluding current
    const availableIndices = [...Array(state.playlist.length).keys()].filter(i => i !== state.currentIndex);
    if (availableIndices.length) {
      state.currentIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      state.currentIndex = 0;
    }
  } else {
    // Previous song in list
    state.currentIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
  }
  
  playSong(state.playlist[state.currentIndex]);
}

function toggleRepeat() {
  const modes = ['none', 'one', 'all'];
  const currentIndex = modes.indexOf(state.repeatMode);
  state.repeatMode = modes[(currentIndex + 1) % modes.length];
  updateRepeatUI();
}

function toggleShuffle() {
  state.shuffleMode = !state.shuffleMode;
  updateShuffleUI();
}

function toggleMute() {
  if (state.isMuted) {
    audioElement.volume = state.volume;
    state.isMuted = false;
  } else {
    audioElement.volume = 0;
    state.isMuted = true;
  }
  updateVolumeUI();
}

function handleSongEnd() {
  if (state.repeatMode === 'one') {
    audioElement.currentTime = 0;
    audioElement.play();
  } else if (state.repeatMode === 'all' || state.currentIndex < state.playlist.length - 1) {
    nextSong();
  } else {
    // End of playlist and not repeating
    state.isPlaying = false;
    updatePlayerUI();
  }
}

function updateProgress() {
  if (!audioElement.duration) return;
  
  const progress = (audioElement.currentTime / audioElement.duration) * 100;
  
  // Update mini player progress bar
  const miniProgress = document.getElementById('mini-progress-bar');
  if (miniProgress) {
    miniProgress.style.width = `${progress}%`;
  }
  
  // Update fullscreen player progress
  const seekBar = document.getElementById('seek-bar');
  if (seekBar) {
    seekBar.value = progress;
  }
  
  // Update time displays
  updateTimeDisplays();
}

function updateTimeDisplays() {
  const currentTime = formatTime(audioElement.currentTime);
  const duration = formatTime(audioElement.duration || 0);
  
  // Update fullscreen player time displays
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  
  if (currentTimeEl) currentTimeEl.textContent = currentTime;
  if (durationEl) durationEl.textContent = duration;
  
  // Update mini player time display (if it exists)
  const miniTimeEl = document.getElementById('mini-time');
  if (miniTimeEl) {
    miniTimeEl.textContent = currentTime;
  }
}

function updateDuration() {
  const durationEl = document.getElementById('duration');
  if (durationEl) {
    durationEl.textContent = formatTime(audioElement.duration);
  }
}

function updateMediaSession() {
  if ('mediaSession' in navigator && state.currentSong) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.currentSong.title,
      artist: state.currentSong.artist,
      album: state.currentSong.album,
      artwork: [
        { src: state.currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    });
    
    navigator.mediaSession.setActionHandler('play', () => {
      audioElement.play();
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
      audioElement.pause();
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', previousSong);
    navigator.mediaSession.setActionHandler('nexttrack', nextSong);
  }
}

function updatePlayerUI() {
  // Update mini player if it exists
  miniPlayer = document.getElementById('mini-player');
  if (miniPlayer) {
    updateMiniPlayerUI();
  }
  
  // Update fullscreen player if it exists
  fullscreenPlayer = document.getElementById('fullscreen-player');
  if (fullscreenPlayer) {
    updateFullscreenPlayerUI();
  }
}

function updateMiniPlayerUI() {
  const songTitleEl = document.getElementById('mini-song-title');
  const artistEl = document.getElementById('mini-artist-name');
  const coverEl = document.getElementById('mini-cover');
  const playPauseBtn = document.getElementById('mini-play-btn');
  
  if (state.currentSong) {
    // Show mini player
    miniPlayer.classList.remove('hidden');
    
    // Update song info
    if (songTitleEl) songTitleEl.textContent = state.currentSong.title;
    if (artistEl) artistEl.textContent = state.currentSong.artist;
    if (coverEl) coverEl.src = state.currentSong.coverUrl;
    
    // Update play/pause button
    if (playPauseBtn) {
      playPauseBtn.innerHTML = state.isPlaying ? 
        '<i class="fas fa-pause"></i>' : 
        '<i class="fas fa-play"></i>';
    }
  } else {
    // Hide mini player if no song is loaded
    miniPlayer.classList.add('hidden');
  }
}

function updateFullscreenPlayerUI() {
  if (!fullscreenPlayer) return;
  
  const songTitleEl = document.getElementById('song-title');
  const artistEl = document.getElementById('artist-name');
  const albumEl = document.getElementById('album-name');
  const coverEl = document.getElementById('cover-art-large');
  const playPauseBtn = document.getElementById('play-btn-large');
  
  if (state.currentSong) {
    // Update song info
    if (songTitleEl) songTitleEl.textContent = state.currentSong.title;
    if (artistEl) artistEl.textContent = state.currentSong.artist;
    if (albumEl) albumEl.textContent = state.currentSong.album;
    if (coverEl) coverEl.src = state.currentSong.coverUrl;
    
    // Update play/pause button
    if (playPauseBtn) {
      playPauseBtn.innerHTML = state.isPlaying ? 
        '<i class="fas fa-pause"></i>' : 
        '<i class="fas fa-play"></i>';
    }
    
    // Update repeat button
    updateRepeatUI();
    
    // Update shuffle button
    updateShuffleUI();
    
    // Update volume button and slider
    updateVolumeUI();
    
    // Update time displays
    updateTimeDisplays();
  }
}

function updateRepeatUI() {
  const repeatBtn = document.getElementById('repeat-btn');
  if (!repeatBtn) return;
  
  // Remove all classes
  repeatBtn.classList.remove('repeat-none', 'repeat-one', 'repeat-all');
  
  // Add appropriate class
  repeatBtn.classList.add(`repeat-${state.repeatMode}`);
  
  // Update icon
  if (state.repeatMode === 'one') {
    repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
  } else {
    repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
  }
}

function updateShuffleUI() {
  const shuffleBtn = document.getElementById('shuffle-btn');
  if (!shuffleBtn) return;
  
  if (state.shuffleMode) {
    shuffleBtn.classList.add('active');
  } else {
    shuffleBtn.classList.remove('active');
  }
}

function updateVolumeUI() {
  const volumeBtn = document.getElementById('mute-btn');
  const volumeSlider = document.getElementById('volume-control');
  
  if (volumeBtn) {
    if (state.isMuted || state.volume === 0) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (state.volume < 0.5) {
      volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  }
  
  if (volumeSlider) {
    volumeSlider.value = state.isMuted ? 0 : state.volume * 100;
  }
}

function renderQueue() {
  const queueList = document.getElementById('queue-list');
  if (!queueList || !state.playlist || !state.playlist.length) return;
  
  queueList.innerHTML = state.playlist.map((song, index) => `
    <div class="queue-item ${index === state.currentIndex ? 'current' : ''}" data-index="${index}">
      <img src="${song.coverUrl}" alt="${song.title}" class="queue-cover">
      <div class="queue-info">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
      </div>
      <button class="queue-play-btn" data-index="${index}">
        ${index === state.currentIndex ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-play"></i>'}
      </button>
    </div>
  `).join('');
  
  // Add event listeners to queue items
  document.querySelectorAll('.queue-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      state.currentIndex = index;
      playSong(state.playlist[index]);
    });
  });
}

// Save and restore player state
function savePlayerState() {
  if (!state.currentSong) return;
  
  const playerState = {
    currentSong: state.currentSong,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    position: audioElement.currentTime,
    volume: state.volume,
    repeatMode: state.repeatMode,
    shuffleMode: state.shuffleMode
  };
  
  localStorage.setItem('musicPlayerState', JSON.stringify(playerState));
}

function restorePlayerState() {
  const savedState = localStorage.getItem('musicPlayerState');
  if (!savedState) return;
  
  try {
    const playerState = JSON.parse(savedState);
    
    state.currentSong = playerState.currentSong;
    state.playlist = playerState.playlist;
    state.currentIndex = playerState.currentIndex;
    state.savedPosition = playerState.position;
    state.volume = playerState.volume || 0.8;
    state.repeatMode = playerState.repeatMode || 'none';
    state.shuffleMode = playerState.shuffleMode || false;
    
    // If we have a saved song, try to resume it
    if (state.currentSong) {
      firebase.getSongURL(state.currentSong.id).then(result => {
        if (result.success) {
          audioElement.src = result.url;
          audioElement.load();
          audioElement.volume = state.volume;
          
          // Seek to saved position
          audioElement.addEventListener('canplay', () => {
            audioElement.currentTime = state.savedPosition;
            updatePlayerUI();
            updateMediaSession();
          }, { once: true });
        }
      });
    }
    
    updatePlayerUI();
    
  } catch (error) {
    console.error('Error restoring player state:', error);
  }
}

// Set up event listener to save player state before unload
window.addEventListener('beforeunload', savePlayerState);

// Setup mini player click handler to expand player
document.addEventListener('click', (e) => {
  const miniPlayer = document.getElementById('mini-player');
  if (miniPlayer && e.target.closest('#mini-player') && 
      !e.target.closest('#mini-play-btn') && 
      !e.target.closest('#mini-prev-btn') && 
      !e.target.closest('#mini-next-btn')) {
    state.expandedPlayer = true;
    window.location.hash = '#now-playing';
  }
});

// Export functions for global access
window.playSongsList = playSongsList;
window.togglePlayback = togglePlayback;
window.nextSong = nextSong;
window.previousSong = previousSong;

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);