// Album detail loading script
document.addEventListener('DOMContentLoaded', function() {
    // Get album ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('id') || 'album1'; // Default to first album if no ID provided
    
    // Load album details from mock data
    const albumDetailCover = document.getElementById('albumDetailCover');
    const albumDetailTitle = document.getElementById('albumDetailTitle');
    const albumDetailArtist = document.getElementById('albumDetailArtist');
    const trackListContainer = document.querySelector('.list-group');
    
    // Find the album in mock data
    const album = mockAlbums.find(a => a.id === albumId);
    
    if (album) {
        // Update album details
        document.title = `${album.title} - ${album.artist} | MusicListener6000`;
        albumDetailCover.src = album.coverUrl;
        albumDetailCover.onload = function() {
            // Remove any loading indicator classes if needed
            albumDetailCover.classList.remove('loading');
        };
        albumDetailTitle.textContent = album.title;
        albumDetailArtist.textContent = album.artist;
        
        // Update release info
        const releaseInfo = document.querySelector('.text-muted');
        if (releaseInfo) {
            releaseInfo.textContent = `Released: ${album.year}`;
        }
        
        // Update track count
        const trackCountInfo = document.querySelectorAll('.text-muted')[1];
        if (trackCountInfo && album.songs) {
            const totalDuration = album.songs.reduce((sum, song) => sum + song.duration, 0);
            const minutes = Math.floor(totalDuration / 60);
            trackCountInfo.textContent = `${album.songs.length} songs • ${minutes} minutes`;
        }
        
        // Clear existing tracks and add new ones from album data
        if (trackListContainer && album.songs && album.songs.length > 0) {
            trackListContainer.innerHTML = ''; // Clear existing tracks
            
            album.songs.forEach((song, index) => {
                const minutes = Math.floor(song.duration / 60);
                const seconds = song.duration % 60;
                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                const trackElement = document.createElement('a');
                trackElement.href = '#';
                trackElement.className = 'list-group-item list-group-item-action bg-dark text-white';
                trackElement.onclick = function() { playSong(album.id, index); return false; };
                
                trackElement.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${index + 1}. ${song.title}</h5>
                        <small>${formattedDuration}</small>
                    </div>
                    <small class="text-muted">${song.artist}</small>
                `;
                
                trackListContainer.appendChild(trackElement);
            });
        }
        
        // Update play buttons to reference correct album ID
        const playButton = document.querySelector('.btn-success');
        if (playButton) {
            playButton.onclick = function() { playAlbum(album.id); };
        }
        
        const shuffleButton = document.querySelector('.btn-outline-light:not(.me-3)');
        if (shuffleButton) {
            shuffleButton.onclick = function() { shuffleAlbum(album.id); };
        }
    }
});