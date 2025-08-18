// Global variables
let player;
let currentVideoData = null;
let isVideoPlaying = false;
let isMobile = window.innerWidth < 768;
let updateInterval;

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    handleMobileMenu();
    
    // Update mobile status on resize
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            if (isVideoPlaying && player) {
                closeVideo();
                // Reopen video in appropriate mode
                setTimeout(() => {
                    openVideo(currentVideoData);
                }, 100);
            }
        }
    });
});

// Initialize event listeners
function initializeEventListeners() {
    // Watch buttons
    document.querySelectorAll('.watch-btn').forEach(button => {
        button.addEventListener('click', handleWatchClick);
    });

    // Close video buttons
    document.getElementById('closeVideoBtn')?.addEventListener('click', closeVideo);
    document.getElementById('closeMobileVideoBtn')?.addEventListener('click', closeVideo);

    // Custom controls
    document.getElementById('playPauseBtn')?.addEventListener('click', togglePlayPause);
    document.getElementById('rewindBtn')?.addEventListener('click', () => seekRelative(-10));
    document.getElementById('forwardBtn')?.addEventListener('click', () => seekRelative(10));
    document.getElementById('volumeBtn')?.addEventListener('click', toggleMute);
    document.getElementById('volumeSlider')?.addEventListener('input', handleVolumeChange);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    document.getElementById('speedBtn')?.addEventListener('click', toggleSpeedMenu);
    document.getElementById('qualityBtn')?.addEventListener('click', toggleQualityMenu);
    document.getElementById('progressBar')?.addEventListener('click', handleProgressClick);

    // Speed and quality options
    document.querySelectorAll('.speed-option').forEach(option => {
        option.addEventListener('click', handleSpeedChange);
    });

    document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', handleQualityChange);
    });

    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#speedBtn') && !e.target.closest('#speedMenu')) {
            document.getElementById('speedMenu')?.classList.add('hidden');
        }
        if (!e.target.closest('#qualityBtn') && !e.target.closest('#qualityMenu')) {
            document.getElementById('qualityMenu')?.classList.add('hidden');
        }
    });
}

// Handle mobile menu
function handleMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    mobileMenuBtn?.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
}

// Handle watch button click
function handleWatchClick(event) {
    const card = event.target.closest('.video-card');
    const videoData = {
        id: card.dataset.videoId,
        title: card.dataset.title,
        duration: card.dataset.duration,
        description: card.dataset.description
    };

    openVideo(videoData);
}

// Open video in appropriate mode
function openVideo(videoData) {
    currentVideoData = videoData;
    isVideoPlaying = true;

    if (isMobile) {
        openMobileVideo(videoData);
    } else {
        openDesktopVideo(videoData);
    }
}

// Open video in mobile mode
function openMobileVideo(videoData) {
    const modal = document.getElementById('mobileVideoModal');
    const playerDiv = document.getElementById('mobileVideoPlayer');
    const title = document.getElementById('mobileVideoTitle');
    const description = document.getElementById('mobileVideoDescription');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Create YouTube player
    if (player) {
        player.destroy();
    }

    player = new YT.Player('mobileVideoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
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
                    'quality': 'hd1080', // Force HD quality
                    'vq': 'hd1080' // Video quality parameter
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Open video in desktop mode
function openDesktopVideo(videoData) {
    const container = document.getElementById('videoPlayerContainer');
    const playerDiv = document.getElementById('videoPlayer');
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    const cardsGrid = document.getElementById('cardsGrid');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    // Show video player
    container.classList.remove('hidden');
    
    // Transform grid layout
    cardsGrid.classList.add('lg:grid-cols-2', 'lg:w-80', 'lg:fixed', 'lg:right-8', 'lg:top-1/2', 'lg:-translate-y-1/2', 'lg:z-40', 'lg:max-h-[70vh]', 'lg:overflow-y-auto');
    cardsGrid.classList.remove('lg:grid-cols-3');

    // Add margin to video container
    container.classList.add('lg:mr-96');

    document.body.classList.add('video-playing');

    // Create YouTube player
    if (player) {
        player.destroy();
    }

    player = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
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
                    'quality': 'hd1080', // Force HD quality
                    'vq': 'hd1080' // Video quality parameter
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    // Scroll to video
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Close video and restore original layout
function closeVideo() {
    isVideoPlaying = false;
    currentVideoData = null;

    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    if (isMobile) {
        const modal = document.getElementById('mobileVideoModal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    } else {
        const container = document.getElementById('videoPlayerContainer');
        const cardsGrid = document.getElementById('cardsGrid');

        container.classList.add('hidden');
        container.classList.remove('lg:mr-96');
        
        // Restore grid layout
        cardsGrid.classList.remove('lg:grid-cols-2', 'lg:w-80', 'lg:fixed', 'lg:right-8', 'lg:top-1/2', 'lg:-translate-y-1/2', 'lg:z-40', 'lg:max-h-[70vh]', 'lg:overflow-y-auto');
        cardsGrid.classList.add('lg:grid-cols-3');

        document.body.classList.remove('video-playing');
    }

    // Destroy player
    if (player) {
        player.destroy();
        player = null;
    }
}

// YouTube player event handlers
function onPlayerReady(event) {
    updateVideoInfo();
    
    // Start updating progress
    updateInterval = setInterval(updateProgress, 1000);
}

function onPlayerStateChange(event) {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');

    if (event.data === YT.PlayerState.PLAYING) {
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
    } else {
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
    }
}

// Custom control functions
function togglePlayPause() {
    if (player) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
}

function seekRelative(seconds) {
    if (player) {
        const currentTime = player.getCurrentTime();
        const newTime = Math.max(0, Math.min(player.getDuration(), currentTime + seconds));
        player.seekTo(newTime);
    }
}

function toggleMute() {
    if (player) {
        if (player.isMuted()) {
            player.unMute();
            document.getElementById('volumeOnIcon')?.classList.remove('hidden');
            document.getElementById('volumeOffIcon')?.classList.add('hidden');
        } else {
            player.mute();
            document.getElementById('volumeOnIcon')?.classList.add('hidden');
            document.getElementById('volumeOffIcon')?.classList.remove('hidden');
        }
    }
}

function handleVolumeChange(event) {
    if (player) {
        player.setVolume(event.target.value);
    }
}

function toggleFullscreen() {
    const playerWrapper = isMobile ? document.getElementById('mobileVideoModal') : document.getElementById('videoPlayerWrapper');
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        playerWrapper.requestFullscreen();
    }
}

function toggleSpeedMenu() {
    const menu = document.getElementById('speedMenu');
    menu?.classList.toggle('hidden');
}

function toggleQualityMenu() {
    const menu = document.getElementById('qualityMenu');
    menu?.classList.toggle('hidden');
}

function handleSpeedChange(event) {
    const speed = parseFloat(event.target.dataset.speed);
    if (player) {
        player.setPlaybackRate(speed);
        document.getElementById('speedText').textContent = speed + 'x';
        
        // Update active state
        document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
        event.target.classList.add('active');
        
        document.getElementById('speedMenu')?.classList.add('hidden');
    }
}

function handleQualityChange(event) {
    const quality = event.target.dataset.quality;
    if (player) {
        if (quality === 'auto') {
            player.setPlaybackQuality('default');
        } else {
            player.setPlaybackQuality(quality + 'p');
        }
        
        // Update active state
        document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('active'));
        event.target.classList.add('active');
        
        document.getElementById('qualityMenu')?.classList.add('hidden');
    }
}

function handleProgressClick(event) {
    if (player) {
        const rect = event.target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progress = clickX / rect.width;
        const newTime = progress * player.getDuration();
        player.seekTo(newTime);
    }
}

// Update video information
function updateVideoInfo() {
    if (player && currentVideoData) {
        const duration = player.getDuration();
        const durationElement = document.getElementById('duration');
        if (durationElement) {
            durationElement.textContent = formatTime(duration);
        }
    }
}

// Update progress bar and time
function updateProgress() {
    if (player) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progress = (currentTime / duration) * 100;

        const progressFill = document.getElementById('progressFill');
        const currentTimeElement = document.getElementById('currentTime');

        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        if (currentTimeElement) {
            currentTimeElement.textContent = formatTime(currentTime);
        }
    }
}

// Format time in MM:SS or HH:MM:SS format
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (!isVideoPlaying || document.activeElement.tagName === 'INPUT') return;

    switch (event.code) {
        case 'Space':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            seekRelative(-10);
            break;
        case 'ArrowRight':
            event.preventDefault();
            seekRelative(10);
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (player) {
                const newVolume = Math.min(100, player.getVolume() + 10);
                player.setVolume(newVolume);
                document.getElementById('volumeSlider').value = newVolume;
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (player) {
                const newVolume = Math.max(0, player.getVolume() - 10);
                player.setVolume(newVolume);
                document.getElementById('volumeSlider').value = newVolume;
            }
            break;
        case 'KeyM':
            event.preventDefault();
            toggleMute();
            break;
        case 'KeyF':
            event.preventDefault();
            toggleFullscreen();
            break;
        case 'Escape':
            if (isVideoPlaying) {
                event.preventDefault();
                closeVideo();
            }
            break;
    }
});
