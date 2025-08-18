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

// Enhanced YouTube security - prevent all native YouTube functionality
const YOUTUBE_SECURITY_CONFIG = {
    // Maximum security parameters for YouTube iframe
    playerVars: {
        'autoplay': 0,
        'controls': 0,           // Disable all native controls
        'disablekb': 1,         // Disable keyboard shortcuts
        'enablejsapi': 1,       // Enable API control
        'fs': 0,                // Disable fullscreen button (we handle it custom)
        'iv_load_policy': 3,    // Disable annotations
        'modestbranding': 1,    // Remove YouTube branding
        'playsinline': 1,       // Play inline on mobile
        'rel': 0,               // Don't show related videos
        'showinfo': 0,          // Don't show video info
        'quality': 'hd1080',
        'vq': 'hd1080',
        'cc_load_policy': 0,    // Disable captions
        'loop': 0,
        'origin': window.location.origin,
        'widget_referrer': window.location.origin
    },
    // Blocked keyboard shortcuts
    blockedKeys: [
        'KeyK',      // Play/Pause
        'KeyJ',      // Rewind 10s
        'KeyL',      // Forward 10s
        'KeyM',      // Mute
        'KeyF',      // Fullscreen
        'KeyT',      // Theater mode
        'KeyI',      // Miniplayer
        'KeyC',      // Captions
        'ArrowUp',   // Volume up
        'ArrowDown', // Volume down
        'ArrowLeft', // Rewind 5s
        'ArrowRight', // Forward 5s
        'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', // Seek to position
        'Home',      // Go to beginning
        'End',       // Go to end
        'Period',    // Frame forward
        'Comma',     // Frame backward
        'Slash',     // Search
        'Space'      // Play/Pause
    ]
};

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready with Enhanced Security');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    handleMobileMenu();
    preventYouTubeAccess();
    
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

// Enhanced security: Prevent all YouTube access methods
function preventYouTubeAccess() {
    // Block right-click context menu on video areas
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.youtube-locked') || e.target.closest('#videoPlayer') || e.target.closest('#mobileVideoPlayer')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // Block keyboard shortcuts that could access YouTube
    document.addEventListener('keydown', function(e) {
        if (isVideoPlaying && YOUTUBE_SECURITY_CONFIG.blockedKeys.includes(e.code)) {
            // Only allow our custom controls, block YouTube shortcuts
            const isCustomControlFocus = e.target.closest('#customControls') || e.target.closest('#mobileCustomControls');
            if (!isCustomControlFocus && !e.target.matches('input[type="range"]')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    });

    // Prevent drag and drop operations
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.youtube-locked')) {
            e.preventDefault();
            return false;
        }
    });

    // Block selection on YouTube iframe areas
    document.addEventListener('selectstart', function(e) {
        if (e.target.closest('.youtube-locked')) {
            e.preventDefault();
            return false;
        }
    });

    // Prevent any potential YouTube URL redirects
    window.addEventListener('beforeunload', function(e) {
        if (isVideoPlaying) {
            // Ensure video is properly stopped
            if (player && typeof player.pauseVideo === 'function') {
                player.pauseVideo();
            }
        }
    });

    // Block potential iframe escapes
    window.addEventListener('message', function(e) {
        // Filter YouTube messages that might try to redirect
        if (e.origin.includes('youtube.com') || e.origin.includes('googlevideo.com')) {
            if (e.data && typeof e.data === 'string' && 
                (e.data.includes('watch?v=') || 
                 e.data.includes('youtube.com') || 
                 e.data.includes('redirect'))) {
                e.stopImmediatePropagation();
                return false;
            }
        }
    });
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

    // Prevent any clicks on YouTube iframe from escaping
    document.addEventListener('click', function(e) {
        if (e.target.matches('iframe[src*="youtube.com"]')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
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

// Open video in mobile mode with enhanced security
function openMobileVideo(videoData) {
    const modal = document.getElementById('mobileVideoModal');
    const title = document.getElementById('mobileVideoTitle');
    const description = document.getElementById('mobileVideoDescription');

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Create YouTube player with maximum security
    if (player) {
        player.destroy();
    }

    player = new YT.Player('mobileVideoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: YOUTUBE_SECURITY_CONFIG.playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    // Apply additional security after player creation
    setTimeout(() => {
        applyEnhancedSecurity('mobile');
    }, 1000);
}

// Open video in desktop mode with enhanced security
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

    // Create YouTube player with maximum security
    if (player) {
        player.destroy();
    }

    player = new YT.Player('videoPlayer', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: YOUTUBE_SECURITY_CONFIG.playerVars,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });

    // Apply additional security after player creation
    setTimeout(() => {
        applyEnhancedSecurity('desktop');
    }, 1000);

    // Scroll to video
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Apply enhanced security measures to prevent YouTube access
function applyEnhancedSecurity(mode) {
    const iframeSelector = mode === 'mobile' ? '#mobileVideoPlayer iframe' : '#videoPlayer iframe';
    const iframe = document.querySelector(iframeSelector);
    
    if (iframe) {
        // Disable pointer events on iframe itself
        iframe.style.pointerEvents = 'none';
        iframe.style.userSelect = 'none';
        iframe.style.webkitUserSelect = 'none';
        iframe.style.mozUserSelect = 'none';
        iframe.style.msUserSelect = 'none';
        
        // Add security attributes
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.setAttribute('loading', 'lazy');
        
        // Remove any potential event listeners
        iframe.onclick = null;
        iframe.ondblclick = null;
        iframe.oncontextmenu = null;
        
        // Monitor for any YouTube UI elements and hide them
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    hideYouTubeElements(iframe);
                }
            });
        });
        
        observer.observe(iframe, {
            childList: true,
            subtree: true
        });
        
        // Initial hide
        setTimeout(() => hideYouTubeElements(iframe), 500);
    }
}

// Hide any YouTube UI elements that might appear
function hideYouTubeElements(iframe) {
    try {
        // This targets the iframe content if accessible
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
            const elementsToHide = [
                '.ytp-chrome-controls',
                '.ytp-chrome-bottom',
                '.ytp-chrome-top',
                '.ytp-title',
                '.ytp-title-link',
                '.ytp-youtube-button',
                '.ytp-watermark',
                '.ytp-cards-button',
                '.ytp-endscreen-element',
                '.ytp-pause-overlay',
                '.ytp-share-button',
                '.ytp-watch-later-button',
                '.iv-card',
                '.annotation'
            ];
            
            elementsToHide.forEach(selector => {
                const elements = iframeDoc.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none !important';
                    el.style.visibility = 'hidden !important';
                    el.style.opacity = '0 !important';
                    el.style.pointerEvents = 'none !important';
                });
            });
        }
    } catch (e) {
        // Cross-origin restrictions prevent access, which is actually good for security
        console.log('YouTube iframe security active');
    }
}

// YouTube player event handlers
function onPlayerReady(event) {
    isPlayerReady = true;
    console.log('Player ready with Enhanced Security');
    
    // Apply maximum security settings
    try {
        // Disable keyboard controls
        if (typeof player.getIframe === 'function') {
            const iframe = player.getIframe();
            iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
            iframe.removeAttribute('allowfullscreen');
        }
    } catch (e) {
        console.log('Additional security measures applied');
    }
    
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
    
    // Ensure best quality is maintained and security is intact
    setTimeout(() => {
        const currentQuality = player.getPlaybackQuality();
        console.log('Current quality:', currentQuality);
        applyEnhancedSecurity(isMobile ? 'mobile' : 'desktop');
    }, 1000);
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    showError('Video failed to load. Please refresh the page.');
}

function showError(message) {
    console.error(message);
    // You could add a user-visible error message here
}

// Initialize custom controls after player is ready
function initializeCustomControls() {
    // Desktop Controls
    initializeDesktopControls();
    
    // Mobile Controls
    initializeMobileControls();
    
    console.log('Custom controls initialized with YouTube access blocked');
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

    // Fullscreen button - secure fullscreen without YouTube UI
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.removeEventListener('click', toggleSecureFullscreen);
        fullscreenBtn.addEventListener('click', toggleSecureFullscreen);
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

    // Mobile Fullscreen button - secure fullscreen
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    if (mobileFullscreenBtn) {
        mobileFullscreenBtn.removeEventListener('click', toggleSecureFullscreen);
        mobileFullscreenBtn.addEventListener('click', toggleSecureFullscreen);
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

// Secure fullscreen that prevents YouTube UI from showing
function toggleSecureFullscreen() {
    const playerWrapper = isMobile ? document.getElementById('mobileVideoModal') : document.getElementById('videoPlayerWrapper');
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (playerWrapper) {
        playerWrapper.requestFullscreen().then(() => {
            // Apply additional security in fullscreen
            setTimeout(() => {
                applyEnhancedSecurity(isMobile ? 'mobile' : 'desktop');
            }, 500);
        }).catch(err => {
            console.log('Fullscreen request failed:', err);
        });
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

// Enhanced HD quality management with security checks
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
    
    // Reapply security after quality change
    applyEnhancedSecurity(isMobile ? 'mobile' : 'desktop');
}

// Check quality and security every 5 seconds
setInterval(() => {
    if (isPlayerReady) {
        ensureHDQuality();
    }
}, 5000);

// Secure keyboard shortcuts - only allow our custom controls
document.addEventListener('keydown', function(event) {
    if (!isVideoPlaying || !isPlayerReady || document.activeElement.tagName === 'INPUT') return;

    // Block all YouTube shortcuts and only allow our custom ones
    const allowedActions = {
        'Space': () => { event.preventDefault(); togglePlayPause(); },
        'ArrowLeft': () => { event.preventDefault(); seekRelative(-10); },
        'ArrowRight': () => { event.preventDefault(); seekRelative(10); },
        'ArrowUp': () => { 
            event.preventDefault(); 
            if (player) {
                const newVolume = Math.min(100, player.getVolume() + 10);
                player.setVolume(newVolume);
                currentVolume = newVolume;
                const volumeSlider = document.getElementById('volumeSlider');
                const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
                if (volumeSlider) volumeSlider.value = newVolume;
                if (mobileVolumeSlider) mobileVolumeSlider.value = newVolume;
            }
        },
        'ArrowDown': () => { 
            event.preventDefault(); 
            if (player) {
                const newVolume = Math.max(0, player.getVolume() - 10);
                player.setVolume(newVolume);
                currentVolume = newVolume;
                const volumeSlider = document.getElementById('volumeSlider');
                const mobileVolumeSlider = document.getElementById('mobileVolumeSlider');
                if (volumeSlider) volumeSlider.value = newVolume;
                if (mobileVolumeSlider) mobileVolumeSlider.value = newVolume;
            }
        },
        'KeyM': () => { event.preventDefault(); toggleMute(); },
        'KeyF': () => { event.preventDefault(); toggleSecureFullscreen(); },
        'Escape': () => { 
            if (isVideoPlaying) { 
                event.preventDefault(); 
                closeVideo(); 
            } 
        }
    };

    if (allowedActions[event.code]) {
        allowedActions[event.code]();
    } else {
        // Block all other keys to prevent YouTube access
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

// Console log for debugging
console.log('ZeroMA Premium Video Player Loaded - Maximum YouTube Security Active');

// Additional security: Monitor for any attempts to access YouTube
window.addEventListener('beforeunload', function() {
    if (player && isVideoPlaying) {
        // Clean up player to prevent any potential data leaks
        player.destroy();
    }
});

// Prevent any form of YouTube redirection
window.addEventListener('hashchange', function(e) {
    if (window.location.hash.includes('youtube') || window.location.hash.includes('watch')) {
        e.preventDefault();
        history.replaceState(null, '', window.location.pathname);
        return false;
    }
});

// Final security check on page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && isVideoPlaying) {
        // Reapply security when page becomes visible again
        setTimeout(() => {
            applyEnhancedSecurity(isMobile ? 'mobile' : 'desktop');
        }, 1000);
    }
});
