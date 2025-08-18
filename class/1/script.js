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
let securityCheckInterval;

// MAXIMUM SECURITY - Block ALL YouTube functionality
const YOUTUBE_LOCK_CONFIG = {
    // Ultra-secure iframe parameters
    playerVars: {
        'autoplay': 0,
        'controls': 0,           // DISABLE all native controls
        'disablekb': 1,         // DISABLE all keyboard shortcuts
        'enablejsapi': 1,       // Enable ONLY our API control
        'fs': 0,                // DISABLE native fullscreen completely
        'iv_load_policy': 3,    // DISABLE annotations/cards
        'modestbranding': 1,    // REMOVE YouTube branding
        'playsinline': 1,       // Force inline play
        'rel': 0,               // NO related videos
        'showinfo': 0,          // NO video info
        'cc_load_policy': 0,    // NO captions UI
        'loop': 0,              // NO loop UI
        'origin': window.location.origin,
        'widget_referrer': window.location.origin,
        'start': 0,
        'end': 0,
        'listType': null,
        'list': null
    }
};

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready - MAXIMUM SECURITY MODE');
}

// Initialize application with enhanced security
document.addEventListener('DOMContentLoaded', function() {
    implementMaximumSecurity();
    initializeEventListeners();
    handleMobileMenu();
    
    // Update mobile status on resize
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            if (isVideoPlaying && player) {
                closeVideo();
                setTimeout(() => {
                    openVideo(currentVideoData);
                }, 200);
            }
        }
    });
});

// CRITICAL: Implement maximum security to prevent ALL YouTube access
function implementMaximumSecurity() {
    // 1. Block ALL potential YouTube keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (isVideoPlaying) {
            // Block EVERYTHING except our custom handlers
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // Only allow OUR custom keyboard controls
            handleSecureKeyboard(e);
            return false;
        }
    }, true); // Use capture to intercept early

    // 2. Block ALL mouse interactions on video areas
    document.addEventListener('click', function(e) {
        if (e.target.matches('iframe[src*="youtube"]') || 
            e.target.closest('.youtube-locked iframe')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // 3. Block ALL context menus on video
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.youtube-locked') || 
            e.target.matches('iframe[src*="youtube"]')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // 4. Block double-click (prevents YouTube fullscreen)
    document.addEventListener('dblclick', function(e) {
        if (e.target.closest('.youtube-locked') || 
            e.target.matches('iframe[src*="youtube"]')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // 5. Block drag operations
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.youtube-locked')) {
            e.preventDefault();
            return false;
        }
    });

    // 6. Block text selection on video areas
    document.addEventListener('selectstart', function(e) {
        if (e.target.closest('.youtube-locked')) {
            e.preventDefault();
            return false;
        }
    });

    // 7. Monitor and block YouTube messages
    window.addEventListener('message', function(e) {
        if (e.origin.includes('youtube.com') || e.origin.includes('googlevideo.com')) {
            // Block any potential redirection attempts
            if (e.data && (typeof e.data === 'string' || typeof e.data === 'object')) {
                e.stopImmediatePropagation();
                return false;
            }
        }
    });

    // 8. Prevent navigation to YouTube
    let originalLocation = window.location.href;
    setInterval(() => {
        if (window.location.href !== originalLocation && 
            (window.location.href.includes('youtube.com') || 
             window.location.href.includes('youtu.be'))) {
            window.location.href = originalLocation;
        }
    }, 100);
}

// Secure keyboard handler - only our functions work
function handleSecureKeyboard(e) {
    if (!isPlayerReady || !player) return;
    
    const allowedKeys = {
        'Space': () => togglePlayPause(),
        'ArrowLeft': () => seekRelative(-10),
        'ArrowRight': () => seekRelative(10),
        'ArrowUp': () => adjustVolume(10),
        'ArrowDown': () => adjustVolume(-10),
        'KeyM': () => toggleMute(),
        'KeyF': () => toggleSecureFullscreen(),
        'Escape': () => { if (isVideoPlaying) closeVideo(); }
    };

    if (allowedKeys[e.code]) {
        allowedKeys[e.code]();
    }
}

// Secure volume adjustment
function adjustVolume(change) {
    if (!player) return;
    
    const currentVol = player.getVolume();
    const newVolume = Math.max(0, Math.min(100, currentVol + change));
    player.setVolume(newVolume);
    currentVolume = newVolume;
    
    // Update sliders
    const volumeSlider = document.getElementById('volumeSlider');
    const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
    if (volumeSlider) volumeSlider.value = newVolume;
    if (mobileVolumeSlider) mobileVolumeSlider.value = newVolume;
    
    // Update mute state
    updateVolumeIcons(newVolume === 0);
}

// Initialize event listeners
function initializeEventListeners() {
    // Watch buttons
    document.querySelectorAll('.watch-btn').forEach(button => {
        button.addEventListener('click', handleWatchClick);
    });

    // Close video buttons
    document.getElementById('closeVideoBtn')?.addEventListener('click', closeVideo);
    document.getElementById('closeMobileVideoBtn')?.addEventListener('click', closeVideo);
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

// Open video with maximum security
function openVideo(videoData) {
    currentVideoData = videoData;
    isVideoPlaying = true;

    if (isMobile) {
        openMobileVideo(videoData);
    } else {
        openDesktopVideo(videoData);
    }
}

// Open mobile video with enhanced security
function openMobileVideo(videoData) {
    const modal = document.getElementById('mobileVideoModal');
    const title = document.getElementById('mobileVideoTitle');
    const description = document.getElementById('mobileVideoDescription');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Destroy existing player
    if (player) {
        player.destroy();
        player = null;
    }

    // Create ultra-secure player
    player = new YT.Player('mobileVideoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: YOUTUBE_LOCK_CONFIG.playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    // Apply security immediately and repeatedly
    setTimeout(() => lockDownYouTube('mobile'), 500);
    setTimeout(() => lockDownYouTube('mobile'), 1000);
    setTimeout(() => lockDownYouTube('mobile'), 2000);
}

// Open desktop video with enhanced security
function openDesktopVideo(videoData) {
    const container = document.getElementById('videoPlayerContainer');
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    const cardsGrid = document.getElementById('cardsGrid');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    container.classList.remove('hidden');
    
    // Transform grid layout
    cardsGrid.classList.add('lg:grid-cols-2', 'lg:w-80', 'lg:fixed', 'lg:right-8', 'lg:top-1/2', 'lg:-translate-y-1/2', 'lg:z-40', 'lg:max-h-[70vh]', 'lg:overflow-y-auto');
    cardsGrid.classList.remove('lg:grid-cols-3');
    container.classList.add('lg:mr-96');
    document.body.classList.add('video-playing');

    // Destroy existing player
    if (player) {
        player.destroy();
        player = null;
    }

    // Create ultra-secure player
    player = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: YOUTUBE_LOCK_CONFIG.playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    // Apply security immediately and repeatedly
    setTimeout(() => lockDownYouTube('desktop'), 500);
    setTimeout(() => lockDownYouTube('desktop'), 1000);
    setTimeout(() => lockDownYouTube('desktop'), 2000);

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// CRITICAL: Maximum YouTube lockdown
function lockDownYouTube(mode) {
    const iframeSelector = mode === 'mobile' ? '#mobileVideoPlayer iframe' : '#videoPlayer iframe';
    const iframe = document.querySelector(iframeSelector);
    
    if (iframe) {
        // DISABLE ALL pointer events on iframe
        iframe.style.pointerEvents = 'none !important';
        iframe.style.userSelect = 'none !important';
        iframe.style.webkitUserSelect = 'none !important';
        iframe.style.mozUserSelect = 'none !important';
        iframe.style.msUserSelect = 'none !important';
        iframe.style.webkitTouchCallout = 'none !important';
        iframe.style.webkitTapHighlightColor = 'transparent !important';
        
        // Remove ALL possible event handlers
        iframe.onclick = null;
        iframe.ondblclick = null;
        iframe.oncontextmenu = null;
        iframe.onmousedown = null;
        iframe.onmouseup = null;
        iframe.ontouchstart = null;
        iframe.ontouchend = null;
        iframe.onkeydown = null;
        iframe.onkeyup = null;
        iframe.onkeypress = null;
        
        // Add restrictive sandbox
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
        iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
        iframe.removeAttribute('allowfullscreen');
        
        // Create invisible overlay to block ALL interactions
        let overlay = document.querySelector(mode === 'mobile' ? '#mobileSecurityOverlay' : '#securityOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = mode === 'mobile' ? 'mobileSecurityOverlay' : 'securityOverlay';
            overlay.style.cssText = `
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: transparent !important;
                z-index: 45 !important;
                pointer-events: none !important;
                user-select: none !important;
            `;
            iframe.parentNode.appendChild(overlay);
        }
    }
}

// YouTube player event handlers
function onPlayerReady(event) {
    isPlayerReady = true;
    console.log('Player ready - MAXIMUM SECURITY ACTIVE');
    
    // Force highest quality
    const qualities = player.getAvailableQualityLevels();
    if (qualities.includes('hd1080')) {
        player.setPlaybackQuality('hd1080');
    } else if (qualities.includes('hd720')) {
        player.setPlaybackQuality('hd720');
    }
    
    // Initialize everything
    updateVideoInfo();
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgress, 1000);
    player.setVolume(currentVolume);
    initializeCustomControls();
    
    // Start continuous security monitoring
    if (securityCheckInterval) clearInterval(securityCheckInterval);
    securityCheckInterval = setInterval(() => {
        lockDownYouTube(isMobile ? 'mobile' : 'desktop');
    }, 1000);
}

function onPlayerStateChange(event) {
    updatePlayPauseIcons(event.data === YT.PlayerState.PLAYING);
    
    // Reapply security on state change
    setTimeout(() => {
        lockDownYouTube(isMobile ? 'mobile' : 'desktop');
    }, 100);
}

function onPlayerError(event) {
    console.error('Player Error:', event.data);
}

// Update play/pause icons
function updatePlayPauseIcons(isPlaying) {
    const elements = [
        { play: 'playIcon', pause: 'pauseIcon' },
        { play: 'mobilePlayIcon', pause: 'mobilePauseIcon' }
    ];
    
    elements.forEach(({play, pause}) => {
        const playEl = document.getElementById(play);
        const pauseEl = document.getElementById(pause);
        
        if (playEl && pauseEl) {
            if (isPlaying) {
                playEl.classList.add('hidden');
                pauseEl.classList.remove('hidden');
            } else {
                playEl.classList.remove('hidden');
                pauseEl.classList.add('hidden');
            }
        }
    });
}

// Initialize custom controls
function initializeCustomControls() {
    initializeDesktopControls();
    initializeMobileControls();
}

function initializeDesktopControls() {
    // Play/Pause
    addSecureListener('playPauseBtn', 'click', togglePlayPause);
    
    // Seek buttons
    addSecureListener('rewindBtn', 'click', () => seekRelative(-10));
    addSecureListener('forwardBtn', 'click', () => seekRelative(10));
    
    // Volume controls
    addSecureListener('volumeBtn', 'click', toggleMute);
    addSecureListener('volumeSlider', 'input', handleVolumeChange);
    
    // Progress bar
    addSecureListener('progressBar', 'click', handleProgressClick);
    
    // Fullscreen (secure)
    addSecureListener('fullscreenBtn', 'click', toggleSecureFullscreen);
    
    // Speed and quality
    addSecureListener('speedBtn', 'click', () => toggleMenu('speedMenu'));
    addSecureListener('qualityBtn', 'click', () => toggleMenu('qualityMenu'));
    
    // Speed options
    document.querySelectorAll('.speed-option').forEach(option => {
        addSecureListener(option, 'click', handleSpeedChange);
    });
    
    // Quality options
    document.querySelectorAll('.quality-option').forEach(option => {
        addSecureListener(option, 'click', handleQualityChange);
    });
}

function initializeMobileControls() {
    // Mobile controls
    addSecureListener('mobilePlayPauseBtn', 'click', togglePlayPause);
    addSecureListener('mobileRewindBtn', 'click', () => seekRelative(-10));
    addSecureListener('mobileForwardBtn', 'click', () => seekRelative(10));
    addSecureListener('mobileVolumeBtn', 'click', toggleMute);
    addSecureListener('mobileVolumeSlider', 'input', handleVolumeChange);
    addSecureListener('mobileProgressBar', 'click', handleMobileProgressClick);
    addSecureListener('mobileFullscreenBtn', 'click', toggleSecureFullscreen);
    addSecureListener('mobileSpeedBtn', 'click', () => toggleMenu('mobileSpeedMenu'));
    addSecureListener('mobileQualityBtn', 'click', () => toggleMenu('mobileQualityMenu'));
    
    // Mobile options
    document.querySelectorAll('.mobile-speed-option').forEach(option => {
        addSecureListener(option, 'click', handleMobileSpeedChange);
    });
    document.querySelectorAll('.mobile-quality-option').forEach(option => {
        addSecureListener(option, 'click', handleMobileQualityChange);
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', closeMenusOnOutsideClick);
}

// Secure event listener helper
function addSecureListener(elementOrId, event, handler) {
    const element = typeof elementOrId === 'string' 
        ? document.getElementById(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);
    }
}

// Close video and cleanup
function closeVideo() {
    isVideoPlaying = false;
    currentVideoData = null;
    isPlayerReady = false;

    // Clear intervals
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    if (securityCheckInterval) {
        clearInterval(securityCheckInterval);
        securityCheckInterval = null;
    }

    if (isMobile) {
        document.getElementById('mobileVideoModal').classList.add('hidden');
        document.body.style.overflow = '';
    } else {
        const container = document.getElementById('videoPlayerContainer');
        const cardsGrid = document.getElementById('cardsGrid');
        
        container.classList.add('hidden');
        container.classList.remove('lg:mr-96');
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
    
    if (isMuted) {
        player.unMute();
        player.setVolume(currentVolume);
        isMuted = false;
    } else {
        player.mute();
        isMuted = true;
    }
    
    updateVolumeIcons(isMuted);
    updateVolumeSliders(isMuted ? 0 : currentVolume);
}

function updateVolumeIcons(muted) {
    const icons = [
        { on: 'volumeOnIcon', off: 'volumeOffIcon' },
        { on: 'mobileVolumeOnIcon', off: 'mobileVolumeOffIcon' }
    ];
    
    icons.forEach(({on, off}) => {
        const onEl = document.getElementById(on);
        const offEl = document.getElementById(off);
        
        if (onEl && offEl) {
            if (muted) {
                onEl.classList.add('hidden');
                offEl.classList.remove('hidden');
            } else {
                onEl.classList.remove('hidden');
                offEl.classList.add('hidden');
            }
        }
    });
}

function updateVolumeSliders(volume) {
    const sliders = ['volumeSlider', 'mobileVolumeSlider'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) slider.value = volume;
    });
}

function handleVolumeChange(event) {
    if (!isPlayerReady || !player) return;
    
    const volume = parseInt(event.target.value);
    currentVolume = volume;
    player.setVolume(volume);
    
    const newMuted = volume === 0;
    if (newMuted !== isMuted) {
        isMuted = newMuted;
        updateVolumeIcons(isMuted);
    }
    
    // Sync other slider
    const otherSlider = event.target.id === 'volumeSlider' 
        ? document.getElementById('mobileVolumeSlider')
        : document.getElementById('volumeSlider');
    if (otherSlider) otherSlider.value = volume;
}

function toggleSecureFullscreen() {
    const element = isMobile 
        ? document.getElementById('mobileVideoModal')
        : document.getElementById('videoPlayerWrapper');
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (element) {
        element.requestFullscreen().then(() => {
            // Maintain security in fullscreen
            setTimeout(() => lockDownYouTube(isMobile ? 'mobile' : 'desktop'), 500);
        });
    }
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('hidden');
}

function closeMenusOnOutsideClick(e) {
    const menus = [
        { btn: 'speedBtn', menu: 'speedMenu' },
        { btn: 'qualityBtn', menu: 'qualityMenu' },
        { btn: 'mobileSpeedBtn', menu: 'mobileSpeedMenu' },
        { btn: 'mobileQualityBtn', menu: 'mobileQualityMenu' }
    ];
    
    menus.forEach(({btn, menu}) => {
        if (!e.target.closest(`#${btn}`) && !e.target.closest(`#${menu}`)) {
            document.getElementById(menu)?.classList.add('hidden');
        }
    });
}

function handleSpeedChange(event) {
    if (!isPlayerReady || !player) return;
    
    const speed = parseFloat(event.target.dataset.speed);
    player.setPlaybackRate(speed);
    
    document.getElementById('speedText').textContent = speed + 'x';
    document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('speedMenu').classList.add('hidden');
}

function handleQualityChange(event) {
    if (!isPlayerReady || !player) return;
    
    const qualityMap = {
        'auto': 'auto',
        '1080': 'hd1080',
        '720': 'hd720',
        '480': 'large',
        '360': 'medium'
    };
    
    const quality = event.target.dataset.quality;
    const ytQuality = qualityMap[quality] || 'auto';
    
    if (ytQuality === 'auto') {
        const available = player.getAvailableQualityLevels();
        const best = available.includes('hd1080') ? 'hd1080' : 
                    available.includes('hd720') ? 'hd720' : 'large';
        player.setPlaybackQuality(best);
    } else {
        player.setPlaybackQuality(ytQuality);
    }
    
    document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('qualityMenu').classList.add('hidden');
}

function handleMobileSpeedChange(event) {
    handleSpeedChange(event);
    document.getElementById('mobileSpeedText').textContent = event.target.dataset.speed + 'x';
    document.getElementById('mobileSpeedMenu').classList.add('hidden');
}

function handleMobileQualityChange(event) {
    handleQualityChange(event);
    document.getElementById('mobileQualityMenu').classList.add('hidden');
}

function handleProgressClick(event) {
    if (!isPlayerReady || !player) return;
    
    const rect = event.target.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = player.getDuration() * percentage;
    player.seekTo(newTime, true);
}

function handleMobileProgressClick(event) {
    handleProgressClick(event);
}

// Update progress and time displays
function updateProgress() {
    if (!isPlayerReady || !player) return;
    
    try {
        const current = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0) {
            const progress = (current / duration) * 100;
            
            // Update progress bars
            const fills = ['progressFill', 'mobileProgressFill'];
            fills.forEach(id => {
                const fill = document.getElementById(id);
                if (fill) fill.style.width = progress + '%';
            });
            
            // Update time displays
            const currentTimes = ['currentTime', 'mobileCurrentTime'];
            currentTimes.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = formatTime(current);
            });
        }
    } catch (e) {
        console.warn('Progress update error:', e);
    }
}

function updateVideoInfo() {
    if (!isPlayerReady || !player) return;
    
    try {
        const duration = player.getDuration();
        if (duration) {
            const durations = ['duration', 'mobileDuration'];
            durations.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = formatTime(duration);
            });
        }
    } catch (e) {
        console.warn('Duration update error:', e);
    }
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m}:${s.toString().padStart(2, '0')}`;
}

console.log('ZeroMA Premium - MAXIMUM SECURITY VIDEO PLAYER LOADED');
console.log('ALL YouTube functions BLOCKED - Only custom controls work!');
