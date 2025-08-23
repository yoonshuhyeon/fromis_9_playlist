document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const createPlaylistBtn = document.createElement('button');
    createPlaylistBtn.id = 'create-playlist-btn';
    createPlaylistBtn.textContent = 'like you better 플레이리스트 생성';

    fetch('/is_authenticated')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                loginBtn.style.display = 'none';
                const appContainer = document.getElementById('app-container');
                appContainer.insertBefore(createPlaylistBtn, appContainer.firstChild);
            } else {
                createPlaylistBtn.style.display = 'none';
            }
        });

    createPlaylistBtn.addEventListener('click', () => {
        fetch('/create_playlist', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Playlist created! View it here: https://www.youtube.com/playlist?list=${data.playlist_id}`);
                } else {
                    alert('Error: ' + data.error);
                }
            });
    });
    const howaboutBtn = document.getElementById('how_about');
    const q1Card = document.getElementById('q1-card');
    const q2Card = document.getElementById('q2-card');
    const controlButtons = document.getElementById('control-buttons');
    const generateBtn = document.getElementById('generate-btn');
    const backBtn = document.getElementById('back-btn');
    
    const resultArea = document.getElementById('playlist-result');
    const songList = document.getElementById('song-list');
    const youtubeLink = document.getElementById('youtube-link');
    const returnBtn = document.getElementById('return-btn');
    const shareBtn = document.getElementById('share-btn');

    const howaboutresult = document.getElementById('how_about_result');
    const howaboutSongList = document.getElementById('howabout-song-list');
    const howaboutYoutubeLink = document.getElementById('howabout-youtube-link');
    const howaboutReturnBtn = document.getElementById('howabout-return-btn');
    const howaboutShareBtn = document.getElementById('howabout-share-btn');


    function updateViewState(state) {
        // Hide all view components first
        q1Card.style.display = 'none';
        q2Card.style.display = 'none';
        controlButtons.style.display = 'none';
        generateBtn.style.display = 'none';
        backBtn.style.display = 'none';
        resultArea.style.display = 'none';
        howaboutBtn.style.display = 'none';
        howaboutresult.style.display = 'none';

        // Show components based on the state
        switch (state) {
            case 'Q1':
                howaboutBtn.style.display = 'block';
                q1Card.style.display = 'block';
                break;
            case 'Q2':
                q2Card.style.display = 'block';
                controlButtons.style.display = 'flex';
                backBtn.style.display = 'block';
                break;
            case 'GENERATE':
                q2Card.style.display = 'block';
                controlButtons.style.display = 'flex';
                generateBtn.style.display = 'block';
                backBtn.style.display = 'block'; // Keep back button visible
                break;
            case 'RESULT':
                resultArea.style.display = 'block';
                break;
            case 'HOWABOUT':
                howaboutresult.style.display = 'block';
                break;
        }
    }

    function createSongList(playlist, songListElement, youtubeLinkElement) {
        songListElement.innerHTML = '';
        playlist.forEach(song => {
            const li = document.createElement('li');
            const songTitleSpan = document.createElement('span');
            songTitleSpan.textContent = song.title;
            const copyButton = document.createElement('button');
            copyButton.textContent = '복사';
            copyButton.className = 'mini-copy-btn';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(song.title).then(() => {
                    copyButton.textContent = '완료!';
                    copyButton.disabled = true;
                    setTimeout(() => {
                        copyButton.textContent = '복사';
                        copyButton.disabled = false;
                    }, 2000);
                }).catch(err => console.error('클립보드 복사 실패: ', err));
            });
            li.appendChild(songTitleSpan);
            li.appendChild(copyButton);
            songListElement.appendChild(li);
        });

        const youtubeIds = playlist.map(song => song.youtubeId).join(',');
        const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${youtubeIds}`;
        youtubeLinkElement.href = playlistUrl;
        const CHUNK_SIZE = 4;
        const youtubeIdChunks = [];
        for (let i = 0; i < playlist.length; i += CHUNK_SIZE) {
            youtubeIdChunks.push(playlist.slice(i, i + CHUNK_SIZE));
        }

        const youtubeLink = document.createElement('a');
        youtubeLink.href = '#';
        const youtubeButton = document.createElement('button');
        youtubeButton.textContent = '▶️ 유튜브에서 전체 듣기';
        youtubeLink.appendChild(youtubeButton);

        youtubeLink.addEventListener('click', (event) => {
            event.preventDefault();
            youtubeIdChunks.forEach((chunk, index) => {
                setTimeout(() => {
                    const youtubeIds = chunk.map(song => song.youtubeId).join(',');
                    const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${youtubeIds}`;
                    window.open(playlistUrl, '_blank');
                }, index * 200);
            });
        });

        const youtubeLinksContainer = document.createElement('div');
        youtubeLinkElement.parentElement.insertBefore(youtubeLinksContainer, youtubeLinkElement);
        youtubeLinkElement.style.display = 'none';
        youtubeLinksContainer.appendChild(youtubeLink);
    }

    // Event Listener for "Like you better" Playlist
    document.querySelectorAll('input[name="streaming"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            fetch(`/api/playlist/${selectedValue}`)
                .then(response => response.json())
                .then(playlist => {
                    if (playlist.length > 0) {
                        createSongList(playlist, howaboutSongList, howaboutYoutubeLink);
                        updateViewState('HOWABOUT');
                    } else {
                        alert('아쉽지만 조건에 맞는 노래를 찾지 못했어요. 😥');
                        updateViewState('Q1');
                    }
                });
        });
    });

    // Event Listeners for Q1 (Mood)
    document.querySelectorAll('input[name="mood"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateViewState('Q2');
        });
    });

    // Event Listeners for Q2 (Time)
    document.querySelectorAll('input[name="time"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateViewState('GENERATE');
        });
    });

    // Event Listener for Back Button
    backBtn.addEventListener('click', () => {
        // Clear all selections for a clean reset
        document.querySelectorAll('input[name="mood"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="time"]').forEach(r => r.checked = false);
        updateViewState('Q1');
    });


    const likeYouBetterBtn = document.getElementById('like-you-better-btn');

    likeYouBetterBtn.addEventListener('click', () => {
        fetch('/api/playlist/likeyoubetter')
            .then(response => response.json())
            .then(playlist => {
                if (playlist.length > 0) {
                    createSongList(playlist, songList, youtubeLink);
                    updateViewState('RESULT');
                } else {
                    alert('아쉽지만 조건에 맞는 노래를 찾지 못했어요. 😥');
                }
            });
    });

    // Event Listener for Generate Button
    generateBtn.addEventListener('click', () => {
        const selectedMood = document.querySelector('input[name="mood"]:checked');
        const selectedTime = document.querySelector('input[name="time"]:checked');

        if (!selectedMood || !selectedTime) { return; }

        const mood = selectedMood.value;
        const time = selectedTime.value;

        fetch(`/api/songs?mood=${mood}&time=${time}`)
            .then(response => response.json())
            .then(filteredSongs => {
                let playlist = [];
                if (filteredSongs.length <= 3) {
                    playlist = filteredSongs;
                } else {
                    const shuffled = filteredSongs.sort(() => 0.5 - Math.random());
                    playlist = shuffled.slice(0, 3);
                }

                if (playlist.length > 0) {
                    createSongList(playlist, songList, youtubeLink);
                    updateViewState('RESULT');
                } else {
                    alert('아쉽지만 조건에 맞는 노래를 찾지 못했어요. 😥 다른 조합을 시도해보세요!');
                    document.querySelectorAll('input[name="time"]').forEach(r => r.checked = false);
                    updateViewState('Q2');
                }
            });
    });

    function resetSelections() {
        document.querySelectorAll('input[name="mood"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="time"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="streaming"]').forEach(r => r.checked = false);
        updateViewState('Q1');
    }

    returnBtn.addEventListener('click', resetSelections);
    howaboutReturnBtn.addEventListener('click', resetSelections);

    function shareLink(button, link) {
        navigator.clipboard.writeText(link.href).then(() => {
            button.textContent = '링크 복사 완료!';
            button.disabled = true;
            setTimeout(() => {
                button.textContent = '공유하기';
                button.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('클립보드 복사 실패: ', err);
            alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
        });
    }

    shareBtn.addEventListener('click', () => shareLink(shareBtn, youtubeLink));
    howaboutShareBtn.addEventListener('click', () => shareLink(howaboutShareBtn, howaboutYoutubeLink));
    
    // Initial call to set the first state
    updateViewState('Q1');
});
