// Function to update all song cover URLs with their parent album's cover
function updateSongCovers() {
  mockAlbums.forEach(album => {
    if (album.songs && album.songs.length > 0) {
      album.songs.forEach(song => {
        song.coverUrl = album.coverUrl;
      });
    }
  });
}

// Call this function when mockData.js is loaded
updateSongCovers();