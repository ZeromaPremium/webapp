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

// BALANCED SECURITY - Block YouTube but allow custom controls
const YOUTUBE_SECURITY_CONFIG = {
    playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'fs': 0,
        'iv_load_policy': 3,
        'modestbranding': 1,
        'playsinline': 1,
        'rel': 0,
        'showinfo': 0,
        'cc_load_policy': 0,
        'loop': 0,
        'origin': window.location.origin,
        'widget_referrer': window.location.href,
        'html5': 1,
        'wmode': 'opaque'
    }
};

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready - ENHANCED MOBILE/DESKTOP MODE');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing ZeroMA Premium Video Player...');
    
    implementBalancedSecurity();
    initializeEventListeners();
    handleMobileMenu();
    initializeCardDisplay();
    
    // Update mobile status on resize
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            handleCardDisplayOnResize();
            
            if (isVideoPlaying && player) {
                closeVideo();
                setTimeout(() => {
                    openVideo(currentVideoData);
                }, 200);
            }
        }
    });
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', function() {
        if (Math.abs(window.orientation) > 0) {
            handleOrientationChange();
        }
    });
    console.log('ZeroMA Premium Video Player initialized successfully!');
});

// ENHANCED: Initialize card display logic
function initializeCardDisplay() {
    console.log('Initializing card display logic...');
    
    // Set initial card display based on screen size
    updateCardDisplay();
    
    console.log('Card display logic initialized');
}

// ENHANCED: Update card display based on screen size and video state
function updateCardDisplay() {
    const cards = document.querySelectorAll('.video-card');
    
    cards.forEach(card => {
        const desktopContent = card.querySelector('.desktop-card-content');
        const mobileContent = card.querySelector('.mobile-card-content');
        
        if (isMobile) {
            // On mobile: always show mobile cards
            desktopContent.style.display = 'none';
            mobileContent.style.display = 'block';
        } else if (isVideoPlaying) {
            // On desktop with video playing: show mobile cards in sidebar
            desktopContent.style.display = 'none';
            mobileContent.style.display = 'block';
        } else {
            // On desktop without video: show desktop cards
            desktopContent.style.display = 'block';
            mobileContent.style.display = 'none';
        }
    });
}

// ENHANCED: Handle card display on window resize
function handleCardDisplayOnResize() {
    if (!isVideoPlaying) {
        updateCardDisplay();
    }
}

// CRITICAL: Implement balanced security - Block YouTube but allow our controls
function implementBalancedSecurity() {
    console.log('Implementing enhanced balanced security...');
    
    // Only block YouTube-specific keyboard shortcuts when video is playing
    document.addEventListener('keydown', function(e) {
        if (isVideoPlaying) {
            // Block YouTube shortcuts but allow our custom handlers
            const youtubeShortcuts = ['KeyK', 'KeyJ', 'KeyL', 'KeyT', 'KeyI', 'KeyC', 'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Home', 'End', 'Period', 'Comma', 'Slash'];
            
            if (youtubeShortcuts.includes(e.code)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
            
            // Allow our custom keyboard controls
            handleCustomKeyboard(e);
        }
    }, true);

    // Block context menu ONLY on iframe
    document.addEventListener('contextmenu', function(e) {
        if (e.target.matches('iframe[src*="youtube"]')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // Block double-click ONLY on iframe (prevents YouTube fullscreen)
    document.addEventListener('dblclick', function(e) {
        if (e.target.matches('iframe[src*="youtube"]')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // Block drag operations on video areas
    document.addEventListener('dragstart', function(e) {
        if (e.target.closest('.youtube-locked')) {
            e.preventDefault();
            return false;
        }
    });

    // Block text selection on iframe only
    document.addEventListener('selectstart', function(e) {
        if (e.target.matches('iframe[src*="youtube"]')) {
            e.preventDefault();
            return false;
        }
    });
     // Block iframe events
    document.querySelectorAll('.youtube-locked').forEach(container => {
        const blocker = container.querySelector('#youtubeEventBlocker, #mobileYoutubeEventBlocker');
        if (blocker) {
            blocker.addEventListener('click', e => e.stopPropagation());
            blocker.addEventListener('dblclick', e => e.stopPropagation());
            blocker.addEventListener('contextmenu', e => e.stopPropagation());
        }
    });
    console.log('Enhanced balanced security implemented successfully!');
}

// Handle custom keyboard shortcuts
function handleCustomKeyboard(e) {
    if (!isPlayerReady || !player) return;
    
    const customKeys = {
        'Space': () => { e.preventDefault(); togglePlayPause(); },
        'ArrowLeft': () => { e.preventDefault(); seekRelative(-10); },
        'ArrowRight': () => { e.preventDefault(); seekRelative(10); },
        'ArrowUp': () => { e.preventDefault(); adjustVolume(10); },
        'ArrowDown': () => { e.preventDefault(); adjustVolume(-10); },
        'KeyM': () => { e.preventDefault(); toggleMute(); },
        'KeyF': () => { e.preventDefault(); toggleSecureFullscreen(); },
        'Escape': () => { e.preventDefault(); if (isVideoPlaying) closeVideo(); }
    };

    if (customKeys[e.code]) {
        customKeys[e.code]();
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
    updateVolumeSliders(newVolume);
    updateVolumeIcons(newVolume === 0);
}

// ENHANCED: Initialize event listeners for UI elements
function initializeEventListeners() {
    console.log('Setting up enhanced event listeners...');
    
    // Watch buttons - CRITICAL: These must work for both desktop and mobile cards!
    document.querySelectorAll('.watch-btn').forEach((button, index) => {
        console.log(`Setting up watch button ${index + 1}`);
        button.addEventListener('click', function(e) {
            console.log('Watch button clicked!', e.target);
            handleWatchClick(e);
        });
    });

    // Close video buttons
    const closeBtn = document.getElementById('closeVideoBtn');
    const closeMobileBtn = document.getElementById('closeMobileVideoBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('Desktop close button clicked');
            closeVideo();
        });
    }
    
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', function() {
            console.log('Mobile close button clicked');
            closeVideo();
        });
    }
    
    console.log('Enhanced event listeners set up successfully!');
}

// Handle mobile menu
function handleMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// ENHANCED: Handle watch button click
function handleWatchClick(event) {
    console.log('Processing watch button click...');
    
    const card = event.target.closest('.video-card');
    if (!card) {
        console.error('Could not find video card');
        return;
    }
    
    const videoData = {
        id: card.dataset.videoId,
        title: card.dataset.title,
        duration: card.dataset.duration,
        description: card.dataset.description
    };

    console.log('Opening video:', videoData);
    openVideo(videoData);
}

// ENHANCED: Open video with improved mobile/desktop logic
function openVideo(videoData) {
    console.log('Opening video in', isMobile ? 'mobile' : 'desktop', 'mode');
    
    currentVideoData = videoData;
    isVideoPlaying = true;

    if (isMobile) {
        openMobileVideo(videoData);
    } else {
        openDesktopVideo(videoData);
    }
    
    // Update card display after opening video
    setTimeout(() => {
        updateCardDisplay();
    }, 300);
}

// ENHANCED: Open mobile video with improved scrollability and layout
function openMobileVideo(videoData) {
    console.log('Setting up enhanced mobile video player...');
    
    const modal = document.getElementById('mobileVideoModal');
    const title = document.getElementById('mobileVideoTitle');
    const description = document.getElementById('mobileVideoDescription');

    if (!modal || !title || !description) {
        console.error('Mobile video elements not found');
        return;
    }

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    // ENHANCED: Ensure modal appears above everything with scrolling
    modal.style.zIndex = '9999';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Destroy existing player
    if (player) {
        player.destroy();
        player = null;
    }

    // Create player
    setTimeout(() => {
        console.log('Creating enhanced mobile YouTube player...');
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
    }, 100);
}

// ENHANCED: Open desktop video with improved sidebar positioning
function openDesktopVideo(videoData) {
    console.log('Setting up enhanced desktop video player...');
    
    const container = document.getElementById('videoPlayerContainer');
    const title = document.getElementById('videoTitle');
    const description = document.getElementById('videoDescription');
    const cardsGrid = document.getElementById('cardsGrid');

    if (!container || !title || !description || !cardsGrid) {
        console.error('Desktop video elements not found');
        return;
    }

    title.textContent = videoData.title;
    description.textContent = videoData.description;

    container.classList.remove('hidden');
    
    // ENHANCED: Transform grid to sidebar layout with smooth transitions
    cardsGrid.classList.add('transitioning');
    document.body.classList.add('video-playing');

    // ENHANCED: Smooth scroll to prevent positioning issues
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ENHANCED: Apply sidebar styles with transition
    setTimeout(() => {
        cardsGrid.classList.add('ready');
        cardsGrid.classList.remove('transitioning');
        updateCardDisplay(); // Switch to mobile card format
    }, 100);

    // Destroy existing player
    if (player) {
        player.destroy();
        player = null;
    }

    // Create player
    setTimeout(() => {
        console.log('Creating enhanced desktop YouTube player...');
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
    }, 100);

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Apply security after player loads
function applySecurityMeasures(mode) {
    const iframeSelector = mode === 'mobile' 
        ? '#mobileVideoPlayer iframe' 
        : '#videoPlayer iframe';
    
    const iframe = document.querySelector(iframeSelector);
    
    if (iframe) {
        console.log('Applying enhanced security to iframe...');
        
        // Block all iframe interactions
        iframe.style.pointerEvents = 'none';
        iframe.style.userSelect = 'none';
        iframe.style.webkitUserSelect = 'none';
        iframe.style.touchAction = 'none';
        
        // Remove all event handlers
        const clone = iframe.cloneNode(true);
        iframe.parentNode.replaceChild(clone, iframe);
        
        // Add security attributes
        clone.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        clone.setAttribute('allow', 'autoplay');
        clone.removeAttribute('allowfullscreen');
        
        // Block YouTube event listeners
        if (clone.contentWindow) {
            clone.contentWindow.addEventListener = function() {};
        }
        if (clone.contentDocument) {
            clone.contentDocument.addEventListener = function() {};
        }
        
        console.log('Enhanced security applied!');
    }
}

// YouTube player event handlers
function onPlayerReady(event) {
    isPlayerReady = true;
    console.log('YouTube player ready!');
    
    // Set quality
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
    
    // Set up custom controls
    initializeCustomControls();
    
    // Apply security measures
    setTimeout(() => {
        applySecurityMeasures(isMobile ? 'mobile' : 'desktop');
    }, 500);
    
    console.log('Enhanced player setup complete!');
}

function onPlayerStateChange(event) {
    updatePlayPauseIcons(event.data === YT.PlayerState.PLAYING);
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    alert('Video failed to load. Please try another video.');
}

// Update play/pause icons
function updatePlayPauseIcons(isPlaying) {
    const icons = [
        { play: 'playIcon', pause: 'pauseIcon' },
        { play: 'mobilePlayIcon', pause: 'mobilePauseIcon' }
    ];
    
    icons.forEach(({play, pause}) => {
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
    console.log('Setting up enhanced custom controls...');
    
    initializeDesktopControls();
    initializeMobileControls();
    
    console.log('Enhanced custom controls ready!');
}

function initializeDesktopControls() {
    // Play/Pause
    addListener('playPauseBtn', 'click', togglePlayPause);
    
    // Seek buttons
    addListener('rewindBtn', 'click', () => seekRelative(-10));
    addListener('forwardBtn', 'click', () => seekRelative(10));
    
    // Volume controls
    addListener('volumeBtn', 'click', toggleMute);
    addListener('volumeSlider', 'input', handleVolumeChange);
    
    // Progress bar
    addListener('progressBar', 'click', handleProgressClick);
    
    // ENHANCED: Fullscreen with proper z-index
    addListener('fullscreenBtn', 'click', toggleSecureFullscreen);
    
    // Speed and quality
    addListener('speedBtn', 'click', () => toggleMenu('speedMenu'));
    addListener('qualityBtn', 'click', () => toggleMenu('qualityMenu'));
    
    // Speed options
    document.querySelectorAll('.speed-option').forEach(option => {
        addListener(option, 'click', handleSpeedChange);
    });
    
    // Quality options
    document.querySelectorAll('.quality-option').forEach(option => {
        addListener(option, 'click', handleQualityChange);
    });
}

function initializeMobileControls() {
    // Mobile controls
    addListener('mobilePlayPauseBtn', 'click', togglePlayPause);
    addListener('mobileRewindBtn', 'click', () => seekRelative(-10));
    addListener('mobileForwardBtn', 'click', () => seekRelative(10));
    addListener('mobileVolumeBtn', 'click', toggleMute);
    addListener('mobileVolumeSlider', 'input', handleVolumeChange);
    addListener('mobileProgressBar', 'click', handleProgressClick);
    
    // ENHANCED: Mobile fullscreen with proper z-index
    addListener('mobileFullscreenBtn', 'click', toggleSecureFullscreen);
    
    addListener('mobileSpeedBtn', 'click', () => toggleMenu('mobileSpeedMenu'));
    addListener('mobileQualityBtn', 'click', () => toggleMenu('mobileQualityMenu'));
    
    // Mobile options
    document.querySelectorAll('.mobile-speed-option').forEach(option => {
        addListener(option, 'click', handleMobileSpeedChange);
    });
    document.querySelectorAll('.mobile-quality-option').forEach(option => {
        addListener(option, 'click', handleMobileQualityChange);
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', closeMenusOnOutsideClick);
}

// Helper function to add event listeners
function addListener(elementOrId, event, handler) {
    const element = typeof elementOrId === 'string' 
        ? document.getElementById(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);
        console.log(`Event listener added for ${typeof elementOrId === 'string' ? elementOrId : 'element'}:${event}`);
    } else {
        console.warn(`Element not found: ${elementOrId}`);
    }
}

// ENHANCED: Close video with proper card layout restoration
function closeVideo() {
    console.log('Closing enhanced video...');
    
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
        const modal = document.getElementById('mobileVideoModal');
        modal.classList.add('hidden');
        modal.style.zIndex = '';
        document.body.style.overflow = '';
    } else {
        const container = document.getElementById('videoPlayerContainer');
        const cardsGrid = document.getElementById('cardsGrid');
        
        container.classList.add('hidden');
        
        // ENHANCED: Restore original grid layout
        cardsGrid.classList.add('transitioning');
        document.body.classList.remove('video-playing');
        
        setTimeout(() => {
            cardsGrid.classList.remove('ready', 'transitioning');
            updateCardDisplay(); // Switch back to desktop cards
        }, 100);
    }

    // Destroy player
    if (player) {
        player.destroy();
        player = null;
    }
    
    console.log('Enhanced video closed successfully');
}

// Custom control functions
function togglePlayPause() {
    if (!isPlayerReady || !player) return;
    
    console.log('Toggling play/pause...');
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function seekRelative(seconds) {
    if (!isPlayerReady || !player) return;
    
    console.log(`Seeking ${seconds} seconds...`);
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    player.seekTo(newTime, true);
}

function toggleMute() {
    if (!isPlayerReady || !player) return;
    
    console.log('Toggling mute...');
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

// ENHANCED: Secure fullscreen with proper element targeting
function toggleSecureFullscreen() {
    console.log('Toggling secure fullscreen...');
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
            console.warn('Exit fullscreen failed:', err);
        });
    } else {
        let element;
        
        if (isMobile) {
            // For mobile: target only the video container, not the entire modal
            element = document.querySelector('#mobileVideoModal .youtube-locked');
        } else {
            // For desktop: target the video wrapper
            element = document.getElementById('videoPlayerWrapper');
        }
        
        console.log('Requesting fullscreen for:', element);
        
        if (element && element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.warn('Request fullscreen failed:', err);
                // Fallback: try webkit fullscreen
                if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
            });
        }
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
function handleOrientationChange() {
    if (!isPlayerReady || !player || !isVideoPlaying) return;
    
    console.log('Orientation changed - updating player');
    
    // Destroy and recreate player
    const tempVideoData = { ...currentVideoData };
    closeVideo();
    
    setTimeout(() => {
        openVideo(tempVideoData);
        console.log('Player recreated after orientation change');
    }, 300);
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

console.log('ZeroMA Premium - ENHANCED MOBILE/DESKTOP VIDEO PLAYER LOADED');
console.log('✅ Custom controls enabled, ❌ YouTube functions blocked');
console.log('📱 Mobile cards: No thumbnails, responsive layout');
console.log('🖥️ Desktop cards: Sidebar with mobile format during playback');
console.log('🎬 Fixed fullscreen button positioning');
