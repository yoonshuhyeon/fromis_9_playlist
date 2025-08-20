document.addEventListener('DOMContentLoaded', () => {
    const songs = [
        { title: 'Feel Good (SECRET CODE)', mood: 'upbeat', time: ['morning', 'afternoon'], youtubeId: 'jLmJhjCzOTw', howabout: 'likeyoubetter' },
        { title: 'FUN!', mood: 'upbeat', time: ['morning', 'afternoon'], youtubeId: 'sB_nEtZxPog', howabout: 'likeyoubetter' },
        { title: 'WE GO', mood: 'upbeat', time: ['morning', 'afternoon'], youtubeId: 'InLBvJT4W24', howabout: 'supersonic' },
        { title: 'DM', mood: 'upbeat', time: ['afternoon', 'night'], youtubeId: '4gXmClk8rKI', howabout: 'likeyoubetter' },
        { title: 'Stay This Way', mood: 'upbeat', time: ['morning', 'afternoon'], youtubeId: 'qTjr8n_cwnA', howabout: 'likeyoubetter'},
        { title: '#menow', mood: 'upbeat', time: ['afternoon', 'night'], youtubeId: 'QrYIOjs7K8E', howabout: 'likeyoubetter'},
        { title: 'Starry Night (별의 밤)', mood: 'calm', time: ['night'], youtubeId: 'vA5oAt3oG14',howabout: 'likeyoubetter' },
        { title: 'Mulgogi (물고기)', mood: 'calm', time: ['afternoon'], youtubeId: 'Ipi_kedxeN8',howabout: 'likeyoubetter' },
        { title: 'DKDK (두근두근)', mood: 'sweet', time: ['morning', 'afternoon'], youtubeId: 'Bes-of1_nR8',howabout: 'likeyoubetter' },
        { title: 'LOVE BOMB', mood: 'sweet', time: ['morning', 'afternoon'], youtubeId: 'Z-D8g8g_L9w',howabout: 'likeyoubetter' },
        { title: 'To Heart', mood: 'sweet', time: ['morning', 'afternoon'], youtubeId: 'dbe3w4l_o3Y',howabout: 'likeyoubetter' },
        { title: 'Airplane Mode', mood: 'sweet', time: ['afternoon'], youtubeId: 'N_3tJg2g-O4', howabout: 'likeyoubetter' }
    ];

    const howaboutBtn = document.getElementById('how_about');
    const q1Card = document.getElementById('q1-card');
    const q2Card = document.getElementById('q2-card');
    const controlButtons = document.getElementById('control-buttons');
    const generateBtn = document.getElementById('generate-btn');
    const backBtn = document.getElementById('back-btn');
    const returnBtn = document.getElementById('return-btn');
    const resultArea = document.getElementById('playlist-result');
    const songList = document.getElementById('song-list');
    const youtubeLink = document.getElementById('youtube-link');
    const shareBtn = document.getElementById('share-btn');

    function updateViewState(state) {
        // Hide all view components first
        q1Card.style.display = 'none';
        q2Card.style.display = 'none';
        controlButtons.style.display = 'none';
        generateBtn.style.display = 'none';
        backBtn.style.display = 'none';
        returnBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        resultArea.style.display = 'none';
        howaboutBtn.style.display = 'none';

        // Show components based on the state
        switch (state) {
            case 'Q1':
                howaboutBtn.style.display = 'block';
                q1Card.style.display = 'block';
                break;
            case 'Q2':
                q2Card.style.display = 'block';
                controlButtons.style.display = 'block';
                backBtn.style.display = 'block';
                break;
            case 'GENERATE':
                q2Card.style.display = 'block';
                controlButtons.style.display = 'block';
                generateBtn.style.display = 'block';
                backBtn.style.display = 'block'; // Keep back button visible
                break;
            case 'RESULT':
                resultArea.style.display = 'block';
                returnBtn.style.display = 'block';
                shareBtn.style.display = 'block';
                break;
            case 'howabout':
                resultArea.style.display = 'block'
        }
    }

     

    // Event Listener for "Like you better" Playlist
    document.querySelectorAll('input[name="streaming"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            const playlist = songs.filter(song => song.howabout === selectedValue);

            songList.innerHTML = '';

            if (playlist.length > 0) {
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
                    songList.appendChild(li);
                });

                const youtubeIds = playlist.map(song => song.youtubeId).join(',');
                const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${youtubeIds}`;
                youtubeLink.href = playlistUrl;
                updateViewState('RESULT');
            } else {
                // This case might not be reachable if there's always at least one song
                alert('아쉽지만 조건에 맞는 노래를 찾지 못했어요. 😥');
                updateViewState('Q1');
            }
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


    // Event Listener for Generate Button
    generateBtn.addEventListener('click', () => {
        const selectedMood = document.querySelector('input[name="mood"]:checked');
        const selectedTime = document.querySelector('input[name="time"]:checked');

        if (!selectedMood || !selectedTime) { return; }

        const mood = selectedMood.value;
        const time = selectedTime.value;
        const filteredSongs = songs.filter(song => song.mood === mood && song.time.includes(time));
        
        let playlist = [];
        if (filteredSongs.length <= 3) {
            playlist = filteredSongs;
        } else {
            const shuffled = filteredSongs.sort(() => 0.5 - Math.random());
            playlist = shuffled.slice(0, 3);
        }

        songList.innerHTML = '';

        if (playlist.length > 0) {
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
                songList.appendChild(li);
            });

            const youtubeIds = playlist.map(song => song.youtubeId).join(',');
            const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${youtubeIds}`;
            youtubeLink.href = playlistUrl;
            updateViewState('RESULT');
        } else {
            alert('아쉽지만 조건에 맞는 노래를 찾지 못했어요. 😥 다른 조합을 시도해보세요!');
            document.querySelectorAll('input[name="time"]').forEach(r => r.checked = false);
            updateViewState('Q2');
        
        }
    });
    returnBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="mood"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="time"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="streaming"]').forEach(r => r.checked = false);
        updateViewState('Q1');
    });

    // Event Listener for Share Button
    shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(youtubeLink.href).then(() => {
            shareBtn.textContent = '링크 복사 완료!';
            shareBtn.disabled = true;
            setTimeout(() => {
                shareBtn.textContent = '공유하기';
                shareBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('클립보드 복사 실패: ', err);
            alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
        });
    });
    // Initial call to set the first state
    updateViewState('Q1');
});