// Global variables
let player;
let isPlayerReady = false;
let currentVolume = 100;
let isMuted = false;
let currentSpeed = 1;
let currentVideoData = {};
let isDesktop = window.innerWidth >= 1024;

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    console.log('YouTube IFrame API Ready');
}

function openVideo(videoId, title, duration, description) {
    currentVideoData = { videoId, title, duration, description };
    
    // Update video info
    document.getElementById('videoTitle').textContent = title;
    document.getElementById('videoDuration').textContent = duration;
    document.getElementById('videoDescription').textContent = description;
    
    // Show loading state
    document.getElementById('loadingState').style.display = 'flex';
    
    // Check if desktop or mobile
    isDesktop = window.innerWidth >= 1024;
    
    if (isDesktop) {
        // Desktop behavior: move cards to right, show video on left
        document.body.classList.add('desktop-layout');
        document.getElementById('cardsContainer').classList.add('shifted');
    }
    
    // Show video player container
    document.getElementById('videoPlayerContainer').classList.add('show');
    
    // Initialize YouTube player
    initializePlayer(videoId);
}

function closeVideo() {
    // Destroy existing player
    if (player && typeof player.destroy === 'function') {
        player.destroy();
        player = null;
        isPlayerReady = false;
    }
    
    // Hide video player
    document.getElementById('videoPlayerContainer').classList.remove('show');
    
    // Reset desktop layout
    if (isDesktop) {
        document.body.classList.remove('desktop-layout');
        document.getElementById('cardsContainer').classList.remove('shifted');
    }
    
    // Reset iframe src
    document.getElementById('youtube-player').src = '';
}

function initializePlayer(videoId) {
    // Destroy existing player first
    if (player && typeof player.destroy === 'function') {
        player.destroy();
    }
    
    player = new YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'fs': 1,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'playsinline': 1,
            'rel': 0,
            'showinfo': 0,
            'quality': 'hd1080',
            'vq': 'hd1080'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    hideLoading();
    
    // Set HD quality immediately
    const availableQualities = player.getAvailableQualityLevels();
    if (availableQualities.includes('hd1080')) {
        player.setPlaybackQuality('hd1080');
    } else if (availableQualities.includes('hd720')) {
        player.setPlaybackQuality('hd720');
    } else if (availableQualities.includes('large')) {
        player.setPlaybackQuality('large');
    }
    
    // Update duration
    updateDuration();
    
    // Start progress update interval
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    window.progressInterval = setInterval(updateProgress, 1000);
    
    // Set initial volume
    player.setVolume(currentVolume);
    
    console.log('Player ready with quality:', player.getPlaybackQuality());
}

function onPlayerStateChange(event) {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (event.data === YT.PlayerState.PLAYING) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
    
    // Ensure best quality is maintained
    setTimeout(() => {
        if (isPlayerReady && player && typeof player.getPlaybackQuality === 'function') {
            const currentQuality = player.getPlaybackQuality();
            console.log('Current quality:', currentQuality);
        }
    }, 1000);
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    showError('Video failed to load. Please refresh the page.');
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
}

function showError(message) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.innerHTML = `<div style="text-align: center; color: white;"><p>⚠️ ${message}</p></div>`;
    }
}

function updateProgress() {
    if (!isPlayerReady || !player || typeof player.getCurrentTime !== 'function') return;
    
    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progressPercent = (currentTime / duration) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');
        
        if (progressFill) progressFill.style.width = progressPercent + '%';
        if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    } catch (e) {
        console.warn('Progress update error:', e);
    }
}

function updateDuration() {
    if (!isPlayerReady || !player || typeof player.getDuration !== 'function') return;
    
    try {
        const duration = player.getDuration();
        const durationEl = document.getElementById('duration');
        if (durationEl) durationEl.textContent = formatTime(duration);
    } catch (e) {
        console.warn('Duration update error:', e);
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Control Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Play/Pause Button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!isPlayerReady || !player) return;
            
            try {
                const state = player.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                    player.pauseVideo();
                } else {
                    player.playVideo();
                }
            } catch (e) {
                console.error('Play/Pause error:', e);
            }
        });
    }

    // Backward Button
    const backwardBtn = document.getElementById('backwardBtn');
    if (backwardBtn) {
        backwardBtn.addEventListener('click', () => {
            if (!isPlayerReady || !player) return;
            
            try {
                const currentTime = player.getCurrentTime();
                player.seekTo(Math.max(0, currentTime - 10), true);
            } catch (e) {
                console.error('Backward error:', e);
            }
        });
    }

    // Forward Button
    const forwardBtn = document.getElementById('forwardBtn');
    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            if (!isPlayerReady || !player) return;
            
            try {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                player.seekTo(Math.min(duration, currentTime + 10), true);
            } catch (e) {
                console.error('Forward error:', e);
            }
        });
    }

    // Volume Button
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            if (!isPlayerReady || !player) return;
            
            try {
                const volumeOnIcon = document.getElementById('volumeOnIcon');
                const volumeOffIcon = document.getElementById('volumeOffIcon');
                const volumeSlider = document.getElementById('volumeSlider');
                
                if (isMuted) {
                    player.unMute();
                    player.setVolume(currentVolume);
                    if (volumeOnIcon) volumeOnIcon.style.display = 'block';
                    if (volumeOffIcon) volumeOffIcon.style.display = 'none';
                    if (volumeSlider) volumeSlider.value = currentVolume;
                    isMuted = false;
                } else {
                    player.mute();
                    if (volumeOnIcon) volumeOnIcon.style.display = 'none';
                    if (volumeOffIcon) volumeOffIcon.style.display = 'block';
                    if (volumeSlider) volumeSlider.value = 0;
                    isMuted = true;
                }
            } catch (e) {
                console.error('Volume toggle error:', e);
            }
        });
    }

    // Volume Slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (!isPlayerReady || !player) return;
            
            try {
                const volume = parseInt(e.target.value);
                currentVolume = volume;
                player.setVolume(volume);
                
                const volumeOnIcon = document.getElementById('volumeOnIcon');
                const volumeOffIcon = document.getElementById('volumeOffIcon');
                
                if (volume === 0) {
                    if (volumeOnIcon) volumeOnIcon.style.display = 'none';
                    if (volumeOffIcon) volumeOffIcon.style.display = 'block';
                    isMuted = true;
                } else {
                    if (volumeOnIcon) volumeOnIcon.style.display = 'block';
                    if (volumeOffIcon) volumeOffIcon.style.display = 'none';
                    isMuted = false;
                }
            } catch (e) {
                console.error('Volume slider error:', e);
            }
        });
    }

    // Progress Bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            if (!isPlayerReady || !player) return;
            
            try {
                const rect = e.target.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const percentage = clickX / width;
                const duration = player.getDuration();
                const newTime = duration * percentage;
                
                player.seekTo(newTime, true);
            } catch (e) {
                console.error('Progress bar error:', e);
            }
        });
    }

    // Fullscreen Button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const videoContainer = document.getElementById('videoContainer');
            
            try {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (videoContainer) {
                    videoContainer.requestFullscreen();
                }
            } catch (e) {
                console.error('Fullscreen error:', e);
            }
        });
    }

    // Speed Control
    const speedBtn = document.getElementById('speedBtn');
    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            const speedMenu = document.getElementById('speedMenu');
            if (speedMenu) {
                speedMenu.classList.toggle('show');
            }
        });
    }

    // Speed Options
    document.querySelectorAll('.dropdown-option[data-speed]').forEach(option => {
        option.addEventListener('click', (e) => {
            if (!isPlayerReady || !player) return;
            
            try {
                const speed = parseFloat(e.target.dataset.speed);
                currentSpeed = speed;
                player.setPlaybackRate(speed);
                
                const speedText = document.getElementById('speedText');
                if (speedText) speedText.textContent = speed + 'x';
                
                document.querySelectorAll('.dropdown-option[data-speed]').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                
                const speedMenu = document.getElementById('speedMenu');
                if (speedMenu) speedMenu.classList.remove('show');
            } catch (e) {
                console.error('Speed control error:', e);
            }
        });
    });

    // Quality Control
    const qualityBtn = document.getElementById('qualityBtn');
    if (qualityBtn) {
        qualityBtn.addEventListener('click', () => {
            const qualityMenu = document.getElementById('qualityMenu');
            if (qualityMenu) {
                qualityMenu.classList.toggle('show');
            }
        });
    }

    // Quality Options
    document.querySelectorAll('.dropdown-option[data-quality]').forEach(option => {
        option.addEventListener('click', (e) => {
            if (!isPlayerReady || !player) return;
            
            try {
                const quality = e.target.dataset.quality;
                let ytQuality;
                
                switch(quality) {
                    case 'auto':
                        const availableQualities = player.getAvailableQualityLevels();
                        if (availableQualities.includes('hd1080')) {
                            ytQuality = 'hd1080';
                        } else if (availableQualities.includes('hd720')) {
                            ytQuality = 'hd720';
                        } else if (availableQualities.includes('large')) {
                            ytQuality = 'large';
                        } else {
                            ytQuality = 'medium';
                        }
                        break;
                    case '1080':
                        ytQuality = 'hd1080';
                        break;
                    case '720':
                        ytQuality = 'hd720';
                        break;
                    case '480':
                        ytQuality = 'large';
                        break;
                    case '360':
                        ytQuality = 'medium';
                        break;
                    default:
                        ytQuality = 'auto';
                }
                
                player.setPlaybackQuality(ytQuality);
                
                document.querySelectorAll('.dropdown-option[data-quality]').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                
                const qualityMenu = document.getElementById('qualityMenu');
                if (qualityMenu) qualityMenu.classList.remove('show');
                
                console.log('Quality set to:', ytQuality);
            } catch (e) {
                console.error('Quality control error:', e);
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!isPlayerReady || !player) return;
        
        // Only handle shortcuts when video player is open
        const videoPlayerContainer = document.getElementById('videoPlayerContainer');
        if (!videoPlayerContainer || !videoPlayerContainer.classList.contains('show')) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                const playPauseBtn = document.getElementById('playPauseBtn');
                if (playPauseBtn) playPauseBtn.click();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                const backwardBtn = document.getElementById('backwardBtn');
                if (backwardBtn) backwardBtn.click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                const forwardBtn = document.getElementById('forwardBtn');
                if (forwardBtn) forwardBtn.click();
                break;
            case 'KeyM':
                e.preventDefault();
                const volumeBtn = document.getElementById('volumeBtn');
                if (volumeBtn) volumeBtn.click();
                break;
            case 'KeyF':
                e.preventDefault();
                const fullscreenBtn = document.getElementById('fullscreenBtn');
                if (fullscreenBtn) fullscreenBtn.click();
                break;
            case 'Escape':
                e.preventDefault();
                closeVideo();
                break;
        }
    });
});

// Enhanced video loading and quality management
function ensureHDQuality() {
    if (!isPlayerReady || !player || typeof player.getPlaybackQuality !== 'function') return;
    
    try {
        const currentQuality = player.getPlaybackQuality();
        const availableQualities = player.getAvailableQualityLevels();
        
        console.log('Available qualities:', availableQualities);
        console.log('Current quality:', currentQuality);
        
        // Force HD if available
        if (currentQuality !== 'hd1080' && availableQualities.includes('hd1080')) {
            player.setPlaybackQuality('hd1080');
            console.log('Forcing HD 1080p');
        } else if (currentQuality !== 'hd720' && availableQualities.includes('hd720') && !availableQualities.includes('hd1080')) {
            player.setPlaybackQuality('hd720');
            console.log('Forcing HD 720p');
        }
    } catch (e) {
        console.warn('Quality check error:', e);
    }
}

// Check quality periodically
setInterval(ensureHDQuality, 5000);

// Window resize handler
window.addEventListener('resize', () => {
    isDesktop = window.innerWidth >= 1024;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    if (player && typeof player.destroy === 'function') {
        player.destroy();
    }
});

console.log('ZeroMA Premium Video Player Script Loaded - HD Quality Optimization Enabled');
