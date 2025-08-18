// Global variables
/* global YT */
let player;
let currentVideoData = null;
let isVideoPlaying = false;
let isMobile = window.innerWidth < 768;
let updateInterval;
let isPlayerReady = false;
let currentVolume = 100;
let isMuted = false;
let currentSpeed = 1;

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

    // We'll add control listeners after player is created
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
    const title = document.getElementById('mobileVideoTitle');
    const description = document.getElementById('mobileVideoDescription');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Create YouTube player with custom controls
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

// Open video in desktop mode
function openDesktopVideo(videoData) {
    const container = document.getElementById('videoPlayerContainer');
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

    // Create YouTube player with custom controls
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
            'quality': 'hd1080',
            'vq': 'hd1080'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    // Scroll to video
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// YouTube player event handlers
function onPlayerReady(event) {
    isPlayerReady = true;
    console.log('Player ready');
    
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
    updateVideoInfo();
    
    // Start progress update interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(updateProgress, 1000);
    
    // Set initial volume
    player.setVolume(currentVolume);
    
    // Initialize custom controls
    initializeCustomControls();
    
    console.log('Player ready with quality:', player.getPlaybackQuality());
}

function onPlayerStateChange(event) {
    // Update desktop play/pause icons
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    // Update mobile play/pause icons
    const mobilePlayIcon = document.getElementById('mobilePlayIcon');
    const mobilePauseIcon = document.getElementById('mobilePauseIcon');

    if (event.data === YT.PlayerState.PLAYING) {
        // Desktop icons
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
        
        // Mobile icons
        mobilePlayIcon?.classList.add('hidden');
        mobilePauseIcon?.classList.remove('hidden');
    } else {
        // Desktop icons
        playIcon?.classList.remove('hidden');
        pauseIcon?.classList.add('hidden');
        
        // Mobile icons
        mobilePlayIcon?.classList.remove('hidden');
        mobilePauseIcon?.classList.add('hidden');
    }
    
    // Ensure best quality is maintained
    setTimeout(() => {
        const currentQuality = player.getPlaybackQuality();
        console.log('Current quality:', currentQuality);
    }, 1000);
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    showError('Video failed to load. Please refresh the page.');
}

function showError(message) {
    console.error(message);
}

// Initialize custom controls after player is ready
function initializeCustomControls() {
    // Desktop Controls
    initializeDesktopControls();
    
    // Mobile Controls
    initializeMobileControls();
    
    console.log('Custom controls initialized for both desktop and mobile');
}

function initializeDesktopControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.removeEventListener('click', togglePlayPause);
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Rewind button
    const rewindBtn = document.getElementById('rewindBtn');
    if (rewindBtn) {
        rewindBtn.removeEventListener('click', rewindHandler);
        rewindBtn.addEventListener('click', rewindHandler);
    }

    // Forward button
    const forwardBtn = document.getElementById('forwardBtn');
    if (forwardBtn) {
        forwardBtn.removeEventListener('click', forwardHandler);
        forwardBtn.addEventListener('click', forwardHandler);
    }

    // Volume button
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
        volumeBtn.removeEventListener('click', toggleMute);
        volumeBtn.addEventListener('click', toggleMute);
    }

    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.removeEventListener('input', handleVolumeChange);
        volumeSlider.addEventListener('input', handleVolumeChange);
    }

    // Progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.removeEventListener('click', handleProgressClick);
        progressBar.addEventListener('click', handleProgressClick);
    }

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.removeEventListener('click', toggleFullscreen);
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Speed control
    const speedBtn = document.getElementById('speedBtn');
    if (speedBtn) {
        speedBtn.removeEventListener('click', toggleSpeedMenu);
        speedBtn.addEventListener('click', toggleSpeedMenu);
    }

    // Quality control
    const qualityBtn = document.getElementById('qualityBtn');
    if (qualityBtn) {
        qualityBtn.removeEventListener('click', toggleQualityMenu);
        qualityBtn.addEventListener('click', toggleQualityMenu);
    }

    // Speed options
    document.querySelectorAll('.speed-option').forEach(option => {
        option.removeEventListener('click', handleSpeedChange);
        option.addEventListener('click', handleSpeedChange);
    });

    // Quality options
    document.querySelectorAll('.quality-option').forEach(option => {
        option.removeEventListener('click', handleQualityChange);
        option.addEventListener('click', handleQualityChange);
    });
}

function initializeMobileControls() {
    // Mobile Play/Pause button
    const mobilePlayPauseBtn = document.getElementById('mobilePlayPauseBtn');
    if (mobilePlayPauseBtn) {
        mobilePlayPauseBtn.removeEventListener('click', togglePlayPause);
        mobilePlayPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Mobile Rewind button
    const mobileRewindBtn = document.getElementById('mobileRewindBtn');
    if (mobileRewindBtn) {
        mobileRewindBtn.removeEventListener('click', rewindHandler);
        mobileRewindBtn.addEventListener('click', rewindHandler);
    }

    // Mobile Forward button
    const mobileForwardBtn = document.getElementById('mobileForwardBtn');
    if (mobileForwardBtn) {
        mobileForwardBtn.removeEventListener('click', forwardHandler);
        mobileForwardBtn.addEventListener('click', forwardHandler);
    }

    // Mobile Volume button
    const mobileVolumeBtn = document.getElementById('mobileVolumeBtn');
    if (mobileVolumeBtn) {
        mobileVolumeBtn.removeEventListener('click', toggleMute);
        mobileVolumeBtn.addEventListener('click', toggleMute);
    }

    // Mobile Volume slider
    const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
    if (mobileVolumeSlider) {
        mobileVolumeSlider.removeEventListener('input', handleVolumeChange);
        mobileVolumeSlider.addEventListener('input', handleVolumeChange);
    }

    // Mobile Progress bar
    const mobileProgressBar = document.getElementById('mobileProgressBar');
    if (mobileProgressBar) {
        mobileProgressBar.removeEventListener('click', handleMobileProgressClick);
        mobileProgressBar.addEventListener('click', handleMobileProgressClick);
    }

    // Mobile Fullscreen button
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    if (mobileFullscreenBtn) {
        mobileFullscreenBtn.removeEventListener('click', toggleFullscreen);
        mobileFullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Mobile Speed control
    const mobileSpeedBtn = document.getElementById('mobileSpeedBtn');
    if (mobileSpeedBtn) {
        mobileSpeedBtn.removeEventListener('click', toggleMobileSpeedMenu);
        mobileSpeedBtn.addEventListener('click', toggleMobileSpeedMenu);
    }

    // Mobile Quality control
    const mobileQualityBtn = document.getElementById('mobileQualityBtn');
    if (mobileQualityBtn) {
        mobileQualityBtn.removeEventListener('click', toggleMobileQualityMenu);
        mobileQualityBtn.addEventListener('click', toggleMobileQualityMenu);
    }

    // Mobile Speed options
    document.querySelectorAll('.mobile-speed-option').forEach(option => {
        option.removeEventListener('click', handleMobileSpeedChange);
        option.addEventListener('click', handleMobileSpeedChange);
    });

    // Mobile Quality options
    document.querySelectorAll('.mobile-quality-option').forEach(option => {
        option.removeEventListener('click', handleMobileQualityChange);
        option.addEventListener('click', handleMobileQualityChange);
    });

    // Close mobile menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#mobileSpeedBtn') && !e.target.closest('#mobileSpeedMenu')) {
            document.getElementById('mobileSpeedMenu')?.classList.add('hidden');
        }
        if (!e.target.closest('#mobileQualityBtn') && !e.target.closest('#mobileQualityMenu')) {
            document.getElementById('mobileQualityMenu')?.classList.add('hidden');
        }
        // Desktop menus
        if (!e.target.closest('#speedBtn') && !e.target.closest('#speedMenu')) {
            document.getElementById('speedMenu')?.classList.add('hidden');
        }
        if (!e.target.closest('#qualityBtn') && !e.target.closest('#qualityMenu')) {
            document.getElementById('qualityMenu')?.classList.add('hidden');
        }
    });
}

// Handler functions
function rewindHandler() {
    seekRelative(-10);
}

function forwardHandler() {
    seekRelative(10);
}

// Close video and restore original layout
function closeVideo() {
    isVideoPlaying = false;
    currentVideoData = null;
    isPlayerReady = false;

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

// Custom control functions
function togglePlayPause() {
    if (!isPlayerReady || !player) return;
    
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function seekRelative(seconds) {
    if (!isPlayerReady || !player) return;
    
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    player.seekTo(newTime, true);
}

function toggleMute() {
    if (!isPlayerReady || !player) return;
    
    // Desktop volume icons
    const volumeOnIcon = document.getElementById('volumeOnIcon');
    const volumeOffIcon = document.getElementById('volumeOffIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // Mobile volume icons
    const mobileVolumeOnIcon = document.getElementById('mobileVolumeOnIcon');
    const mobileVolumeOffIcon = document.getElementById('mobileVolumeOffIcon');
    const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
    
    if (isMuted) {
        player.unMute();
        player.setVolume(currentVolume);
        
        // Desktop icons
        volumeOnIcon?.classList.remove('hidden');
        volumeOffIcon?.classList.add('hidden');
        if (volumeSlider) volumeSlider.value = currentVolume;
        
        // Mobile icons
        mobileVolumeOnIcon?.classList.remove('hidden');
        mobileVolumeOffIcon?.classList.add('hidden');
        if (mobileVolumeSlider) mobileVolumeSlider.value = currentVolume;
        
        isMuted = false;
    } else {
        player.mute();
        
        // Desktop icons
        volumeOnIcon?.classList.add('hidden');
        volumeOffIcon?.classList.remove('hidden');
        if (volumeSlider) volumeSlider.value = 0;
        
        // Mobile icons
        mobileVolumeOnIcon?.classList.add('hidden');
        mobileVolumeOffIcon?.classList.remove('hidden');
        if (mobileVolumeSlider) mobileVolumeSlider.value = 0;
        
        isMuted = true;
    }
}

function handleVolumeChange(event) {
    if (!isPlayerReady || !player) return;
    
    const volume = parseInt(event.target.value);
    currentVolume = volume;
    player.setVolume(volume);
    
    // Desktop volume icons
    const volumeOnIcon = document.getElementById('volumeOnIcon');
    const volumeOffIcon = document.getElementById('volumeOffIcon');
    
    // Mobile volume icons  
    const mobileVolumeOnIcon = document.getElementById('mobileVolumeOnIcon');
    const mobileVolumeOffIcon = document.getElementById('mobileVolumeOffIcon');
    
    // Sync sliders
    const volumeSlider = document.getElementById('volumeSlider');
    const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
    
    if (volumeSlider && event.target.id !== 'volumeSlider') volumeSlider.value = volume;
    if (mobileVolumeSlider && event.target.id !== 'mobileVolumeSlider') mobileVolumeSlider.value = volume;
    
    if (volume === 0) {
        // Desktop icons
        volumeOnIcon?.classList.add('hidden');
        volumeOffIcon?.classList.remove('hidden');
        
        // Mobile icons
        mobileVolumeOnIcon?.classList.add('hidden');
        mobileVolumeOffIcon?.classList.remove('hidden');
        
        isMuted = true;
    } else {
        // Desktop icons
        volumeOnIcon?.classList.remove('hidden');
        volumeOffIcon?.classList.add('hidden');
        
        // Mobile icons
        mobileVolumeOnIcon?.classList.remove('hidden');
        mobileVolumeOffIcon?.classList.add('hidden');
        
        isMuted = false;
    }
}

function toggleFullscreen() {
    const playerWrapper = isMobile ? document.getElementById('mobileVideoModal') : document.getElementById('videoPlayerWrapper');
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        playerWrapper?.requestFullscreen();
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

function toggleMobileSpeedMenu() {
    const menu = document.getElementById('mobileSpeedMenu');
    menu?.classList.toggle('hidden');
}

function toggleMobileQualityMenu() {
    const menu = document.getElementById('mobileQualityMenu');
    menu?.classList.toggle('hidden');
}

function handleMobileSpeedChange(event) {
    if (!isPlayerReady || !player) return;
    
    const speed = parseFloat(event.target.dataset.speed);
    currentSpeed = speed;
    player.setPlaybackRate(speed);
    
    const mobileSpeedText = document.getElementById('mobileSpeedText');
    if (mobileSpeedText) mobileSpeedText.textContent = speed + 'x';
    
    // Also update desktop speed text
    const speedText = document.getElementById('speedText');
    if (speedText) speedText.textContent = speed + 'x';
    
    // Update active state
    document.querySelectorAll('.mobile-speed-option').forEach(opt => opt.classList.remove('active'));
    document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('mobileSpeedMenu')?.classList.add('hidden');
}

function handleMobileQualityChange(event) {
    if (!isPlayerReady || !player) return;
    
    const quality = event.target.dataset.quality;
    let ytQuality;
    
    switch(quality) {
        case 'auto':
            // Select the highest available quality
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
    
    // Update active state for both mobile and desktop
    document.querySelectorAll('.mobile-quality-option').forEach(opt => opt.classList.remove('active'));
    document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('mobileQualityMenu')?.classList.add('hidden');
    
    console.log('Quality set to:', ytQuality);
}

function handleMobileProgressClick(event) {
    if (!isPlayerReady || !player) return;
    
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const duration = player.getDuration();
    const newTime = duration * percentage;
    
    player.seekTo(newTime, true);
}

function handleSpeedChange(event) {
    if (!isPlayerReady || !player) return;
    
    const speed = parseFloat(event.target.dataset.speed);
    currentSpeed = speed;
    player.setPlaybackRate(speed);
    
    const speedText = document.getElementById('speedText');
    if (speedText) speedText.textContent = speed + 'x';
    
    // Update active state
    document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('speedMenu')?.classList.add('hidden');
}

function handleQualityChange(event) {
    if (!isPlayerReady || !player) return;
    
    const quality = event.target.dataset.quality;
    let ytQuality;
    
    switch(quality) {
        case 'auto':
            // Select the highest available quality
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
    
    // Update active state
    document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('qualityMenu')?.classList.add('hidden');
    
    console.log('Quality set to:', ytQuality);
}

function handleProgressClick(event) {
    if (!isPlayerReady || !player) return;
    
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const duration = player.getDuration();
    const newTime = duration * percentage;
    
    player.seekTo(newTime, true);
}

// Update progress bar and time for both desktop and mobile
function updateProgress() {
    if (!isPlayerReady || !player) return;
    
    try {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;

            // Update desktop progress
            const progressFill = document.getElementById('progressFill');
            const currentTimeElement = document.getElementById('currentTime');
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            if (currentTimeElement) {
                currentTimeElement.textContent = formatTime(currentTime);
            }

            // Update mobile progress
            const mobileProgressFill = document.getElementById('mobileProgressFill');
            const mobileCurrentTimeElement = document.getElementById('mobileCurrentTime');
            
            if (mobileProgressFill) {
                mobileProgressFill.style.width = progress + '%';
            }
            if (mobileCurrentTimeElement) {
                mobileCurrentTimeElement.textContent = formatTime(currentTime);
            }
        }
    } catch (e) {
        console.warn('Progress update error:', e);
    }
}

// Update video information for both desktop and mobile
function updateVideoInfo() {
    if (!isPlayerReady || !player || !currentVideoData) return;
    
    try {
        const duration = player.getDuration();
        
        // Update desktop duration
        const durationElement = document.getElementById('duration');
        if (durationElement && duration) {
            durationElement.textContent = formatTime(duration);
        }
        
        // Update mobile duration
        const mobileDurationElement = document.getElementById('mobileDuration');
        if (mobileDurationElement && duration) {
            mobileDurationElement.textContent = formatTime(duration);
        }
    } catch (e) {
        console.warn('Duration update error:', e);
    }
}

// Format time in MM:SS or HH:MM:SS format
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Enhanced HD quality management
function ensureHDQuality() {
    if (!isPlayerReady || !player) return;
    
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
}

// Check quality every 5 seconds to ensure best quality
setInterval(() => {
    if (isPlayerReady) {
        ensureHDQuality();
    }
}, 5000);

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (!isVideoPlaying || !isPlayerReady || document.activeElement.tagName === 'INPUT') return;

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
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) volumeSlider.value = newVolume;
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (player) {
                const newVolume = Math.max(0, player.getVolume() - 10);
                player.setVolume(newVolume);
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) volumeSlider.value = newVolume;
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

// Console log for debugging
console.log('ZeroMA Premium Video Player Loaded - HD Quality Optimization Enabled');
