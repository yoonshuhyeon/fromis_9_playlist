document.addEventListener('DOMContentLoaded', () => {
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const playlistStatus = document.getElementById('playlist-status');

    createPlaylistBtn.addEventListener('click', () => {
        fetch('/create_playlist', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    playlistStatus.textContent = `Playlist created! View it here: https://www.youtube.com/playlist?list=${data.playlist_id}`;
                } else {
                    playlistStatus.textContent = 'Error: ' + data.error;
                }
            });
    });
});