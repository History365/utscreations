/**
 * DEM Music Mock Data
 * 
 * This file provides mock data for development and testing.
 */

// Mock album covers for development (replace with real images in production)
const mockAlbums = [
  {
    id: "album1",
    title: "Dirt",
    artist: "Alice In Chains",
    coverUrl: "img/default-cover.png",
    year: 1992,
    songs: [
      {
        id: "song1",
        title: "Them Bones",
        artist: "Alice In Chains",
        album: "Dirt",
        coverUrl: "img/default-cover.png",
        duration: 148,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      },
      {
        id: "song2",
        title: "Dam That River",
        artist: "Alice In Chains",
        album: "Dirt",
        coverUrl: "img/default-cover.png",
        duration: 183,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      },
      {
        id: "song3",
        title: "Rain When I Die",
        artist: "Alice In Chains",
        album: "Dirt",
        coverUrl: "img/default-cover.png",
        duration: 374,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
      }
    ]
  },
  {
    id: "album2",
    title: "Jar of Flies",
    artist: "Alice In Chains",
    coverUrl: "img/default-cover.png",
    year: 1994,
    songs: [
      {
        id: "song4",
        title: "Rotten Apple",
        artist: "Alice In Chains",
        album: "Jar of Flies",
        coverUrl: "img/default-cover.png",
        duration: 334,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
      },
      {
        id: "song5",
        title: "Nutshell",
        artist: "Alice In Chains",
        album: "Jar of Flies",
        coverUrl: "img/default-cover.png",
        duration: 260,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
      }
    ]
  },
  {
    id: "album3",
    title: "The Dark Side of the Moon",
    artist: "Pink Floyd",
    coverUrl: "img/default-cover.png",
    year: 1973,
    songs: [
      {
        id: "song6",
        title: "Speak to Me/Breathe",
        artist: "Pink Floyd",
        album: "The Dark Side of the Moon",
        coverUrl: "img/default-cover.png",
        duration: 254,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
      },
      {
        id: "song7",
        title: "Time",
        artist: "Pink Floyd",
        album: "The Dark Side of the Moon",
        coverUrl: "img/default-cover.png",
        duration: 421,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
      }
    ]
  },
  {
    id: "album4",
    title: "Ten",
    artist: "Pearl Jam",
    coverUrl: "img/default-cover.png",
    year: 1991,
    songs: [
      {
        id: "song8",
        title: "Even Flow",
        artist: "Pearl Jam",
        album: "Ten",
        coverUrl: "img/default-cover.png",
        duration: 297,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
      },
      {
        id: "song9",
        title: "Alive",
        artist: "Pearl Jam",
        album: "Ten",
        coverUrl: "img/default-cover.png",
        duration: 341,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
      }
    ]
  }
];

// Get all albums with all data
function getAllAlbums() {
  return mockAlbums;
}

// Get album by ID
function getAlbumById(albumId) {
  return mockAlbums.find(album => album.id === albumId);
}

// Get all songs from all albums
function getAllSongs() {
  return mockAlbums.flatMap(album => album.songs);
}

// Get song by ID
function getSongById(songId) {
  for (const album of mockAlbums) {
    const song = album.songs.find(song => song.id === songId);
    if (song) return song;
  }
  return null;
}

// Mock user library
const mockUserLibrary = {
  liked: getAllSongs().slice(0, 5),
  recentlyPlayed: getAllSongs().slice(3, 8),
  playlists: [
    {
      id: "playlist1",
      name: "Favorites",
      coverUrl: "img/default-cover.png",
      songs: getAllSongs().slice(0, 3)
    },
    {
      id: "playlist2",
      name: "Rock Classics",
      coverUrl: "img/default-cover.png",
      songs: getAllSongs().slice(2, 5)
    }
  ]
};

// Mock featured content
const mockFeaturedContent = {
  albums: mockAlbums,
  playlists: [
    {
      id: "featured1",
      name: "Top Hits 2025",
      coverUrl: "img/default-cover.png",
      songs: getAllSongs().slice(0, 10)
    },
    {
      id: "featured2",
      name: "Rock Legends",
      coverUrl: "img/default-cover.png",
      songs: getAllSongs().slice(2, 8)
    }
  ]
};

// Format duration to minutes:seconds
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}