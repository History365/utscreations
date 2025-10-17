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
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/54/26/62/5426627b-4707-7867-acc0-ce616d250381/074645247526.jpg/600x600bb.jpg",
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
    coverUrl: "https://is2-ssl.mzstatic.com/image/thumb/Music115/v4/3e/22/66/3e22668a-64b0-2d36-cc76-7675e870c4f0/074645248523.jpg/600x600bb.jpg",
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
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Features/v4/bd/1f/35/bd1f3588-5053-589e-7ef6-4a82a8b33be0/mza_10533326683357866598.jpg/600x600bb.jpg",
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
    coverUrl: "https://is2-ssl.mzstatic.com/image/thumb/Music115/v4/93/c4/ae/93c4ae78-4030-2432-d428-2752e5c415b4/mzi.lcigfoax.jpg/600x600bb.jpg",
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