// Enhanced YouTube Player with Complete Custom Controls
// Fixed all issues: desktop mode, navigation, controls blocking, cross-browser compatibility

// Mock data for classes
const classesData = [
    {
        id: 1,
        videoId: 'z8xEcK-unFs',
        title: 'Higher Math - সরলরেখা - Cycle 01 - Lecture 01',
        duration: '98:43',
        noteLink: 'https://example.com/notes/class1.pdf'
    },
    {
        id: 2,
        videoId: 'dQw4w9WgXcQ',
        title: 'Physics - Wave Motion - Advanced Concepts',
        duration: '45:20',
        noteLink: 'https://example.com/notes/class2.pdf'
    },
    {
        id: 3,
        videoId: 'jNQXAC9IVRw',
        title: 'Chemistry - Organic Compounds - Part 1',
        duration: '67:15',
        noteLink: 'https://example.com/notes/class3.pdf'
    },
    {
        id: 4,
        videoId: 'M7lc1UVf-VE',
        title: 'Biology - Cell Structure and Functions',
        duration: '52:30',
        noteLink: 'https://example.com/notes/class4.pdf'
    },
    {
        id: 5,
        videoId: 'fJ9rUzIMcZQ',
        title: 'Mathematics - Calculus - Differentiation',
        duration: '78:45',
        noteLink: 'https://example.com/notes/class5.pdf'
    },
    {
        id: 6,
        videoId: 'ZZ5LpwO-An4',
        title: 'English - Grammar - Advanced Topics',
        duration: '42:18',
        noteLink: 'https://example.com/notes/class6.pdf'
    },
    {
        id: 7,
        videoId: 'hFZFjoX2cGg',
        title: 'Computer Science - Data Structures',
        duration: '89:32',
        noteLink: 'https://example.com/notes/class7.pdf'
    },
    {
        id: 8,
        videoId: '2vjPBrBU-TM',
        title: 'Statistics - Probability Theory',
        duration: '56:27',
        noteLink: 'https://example.com/notes/class8.pdf'
    }
];

// Global variables
let player = null;
let currentVideoIndex = 0;
let progressInterval = null;
let controlsHideTimeout = null;
let eventListeners = [];
let qualityCheckInterval = null;
let isPlayerReady = false;
let isDestroying = false;

// Device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isDesktop = !isMobile && window.innerWidth > 768;

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupGlobalEventListeners();
});

function initializeApp() {
    renderClassCards();
    setupMobileMenu();
}

// Render class cards
function renderClassCards() {
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return;

    const cardHTML = classesData.map((classItem, index) => `
        <div class="class-card p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl" style="background-color: #F6EEE3;">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold px-3 py-1 rounded-full" style="background-color: #E7E0D3; color: #8B5A2B;">#${classItem.id}</span>
                        <span class="text-sm" style="color: #8B5A2B;">${classItem.duration}</span>
                    </div>
                    <h3 class="text-lg font-semibold mb-3 line-clamp-2" style="color: #8B5A2B;" title="${classItem.title}">
                        ${classItem.title.length > 50 ? classItem.title.substring(0, 50) + '...' : classItem.title}
                    </h3>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <button onclick="playVideo(${index})" class="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105" style="background-color: #EBE8E2; color: #8B5A2B;">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Watch</span>
                </button>
                <button onclick="openNote('${classItem.noteLink}')" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105" style="background-color: #E8DACC; color: #8B5A2B;">
                    📝 Note/PDF
                </button>
            </div>
        </div>
    `).join('');

    cardsGrid.innerHTML = cardHTML;
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Prevent context menu globally
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    // Prevent text selection
    document.addEventListener('selectstart', (e) => e.preventDefault());
}

// Prevent context menu
function preventContextMenu(e) {
    if (e.target.closest('.video-container') || e.target.closest('#youtube-player')) {
        e.preventDefault();
        return false;
    }
}

// Clean up all event listeners
function cleanupEventListeners() {
    eventListeners.forEach(({ element, event, handler }) => {
        if (element && element.removeEventListener) {
            element.removeEventListener(event, handler);
        }
    });
    eventListeners = [];
}

// Add tracked event listener
function addTrackedEventListener(element, event, handler) {
    if (element && element.addEventListener) {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    }
}

// Play video function
function playVideo(index) {
    if (isDestroying) return;
    
    currentVideoIndex = index;
    const classItem = classesData[index];

    // Show video player and hide cards
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');

    if (cardsContainer) cardsContainer.classList.add('hidden');
    if (videoPlayerContainer) videoPlayerContainer.classList.remove('hidden');

    // Set video title
    const videoTitle = document.getElementById('video-title');
    if (videoTitle) videoTitle.textContent = classItem.title;

    // Clean up previous player completely
    cleanupPlayer();

    // Initialize new player
    initYouTubePlayer(classItem.videoId);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Complete player cleanup
function cleanupPlayer() {
    isDestroying = true;
    isPlayerReady = false;

    // Clear all intervals and timeouts
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    if (controlsHideTimeout) {
        clearTimeout(controlsHideTimeout);
        controlsHideTimeout = null;
    }
    
    if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
        qualityCheckInterval = null;
    }

    // Clean up event listeners
    cleanupEventListeners();

    // Destroy existing player
    if (player && typeof player.destroy === 'function') {
        try {
            player.destroy();
        } catch (e) {
            console.warn('Error destroying player:', e);
        }
    }
    player = null;
    
    // Reset UI elements
    resetProgressBar();
    resetControlIcons();
    
    isDestroying = false;
}

// Reset progress bar
function resetProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (progressFill) progressFill.style.width = '0%';
    if (timeDisplay) timeDisplay.textContent = '0:00 / 0:00';
}

// Reset control icons
function resetControlIcons() {
    // Reset play/pause icons
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
    
    // Reset volume icons
    updateVolumeIcons(false);
}

// Initialize YouTube player with enhanced controls blocking
function initYouTubePlayer(videoId) {
    if (isDestroying) return;
    
    // Show loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    // Enhanced player configuration to block ALL native controls
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'controls': 0,              // Hide all controls
            'disablekb': 1,             // Disable keyboard controls
            'modestbranding': 1,        // Remove YouTube logo
            'showinfo': 0,              // Hide video info
            'rel': 0,                   // No related videos
            'fs': 0,                    // Disable fullscreen button
            'cc_load_policy': 0,        // No closed captions
            'iv_load_policy': 3,        // Hide annotations
            'autohide': 0,              // Never show controls
            'playsinline': 1,           // Play inline on mobile
            'enablejsapi': 1,           // Enable JS API
            'origin': window.location.origin,
            'widget_referrer': window.location.href
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Player ready handler
function onPlayerReady(event) {
    if (isDestroying) return;
    
    isPlayerReady = true;
    
    // Hide loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    // Block native controls completely
    blockNativeControls();
    
    // Setup all custom controls
    setupAllCustomControls();
    
    // Show custom controls initially
    showControls();
    
    // Start quality optimization
    setTimeout(() => {
        if (isPlayerReady && !isDestroying) {
            startQualityOptimization();
        }
    }, 1000);
}

// Block native YouTube controls completely
function blockNativeControls() {
    if (!player || isDestroying) return;
    
    const iframe = player.getIframe();
    if (iframe) {
        // Prevent all mouse events on the iframe
        iframe.style.pointerEvents = 'none';
        
        // Block keyboard events
        iframe.setAttribute('tabindex', '-1');
        
        // Additional CSS to block interactions
        iframe.style.webkitUserSelect = 'none';
        iframe.style.mozUserSelect = 'none';
        iframe.style.msUserSelect = 'none';
        iframe.style.userSelect = 'none';
    }
}

// Player state change handler
function onPlayerStateChange(event) {
    if (isDestroying) return;
    
    const isPlaying = event.data === YT.PlayerState.PLAYING;
    
    // Update play/pause icons
    updatePlayPauseIcons(isPlaying);
    
    if (isPlaying) {
        startProgressUpdate();
    } else {
        stopProgressUpdate();
    }
    
    // Re-block controls after state change
    setTimeout(blockNativeControls, 100);
}

// Player error handler
function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.innerHTML = `
            <div class="text-white text-center">
                <p>Error loading video</p>
                <p class="text-sm opacity-75">Error code: ${event.data}</p>
            </div>
        `;
    }
}

// Update play/pause icons
function updatePlayPauseIcons(isPlaying) {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (playIcon && pauseIcon) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

// Setup all custom controls
function setupAllCustomControls() {
    if (isDestroying) return;
    
    setupControlsVisibility();
    setupPlayPauseControls();
    setupSeekControls();
    setupProgressBar();
    setupVolumeControls();
    setupSpeedControls();
    setupQualityControls();
    setupFullscreenControls();
    setupNavigationControls();
}

// Setup controls visibility
function setupControlsVisibility() {
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');
    const videoOverlay = document.getElementById('videoOverlay');

    if (!videoContainer || !customControls || !videoOverlay) return;

    // Show controls on overlay click
    const overlayClickHandler = (e) => {
        e.stopPropagation();
        showControls();
        
        // Toggle play/pause on click
        if (player && isPlayerReady) {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    };
    
    addTrackedEventListener(videoOverlay, 'click', overlayClickHandler);

    // Desktop hover behavior
    if (!isMobile) {
        const mouseEnterHandler = () => showControls();
        const mouseMoveHandler = () => showControls();
        
        addTrackedEventListener(videoContainer, 'mouseenter', mouseEnterHandler);
        addTrackedEventListener(videoContainer, 'mousemove', mouseMoveHandler);
    }

    // Hide controls when clicking outside
    const documentClickHandler = (e) => {
        if (!videoContainer.contains(e.target)) {
            hideControls();
        }
    };
    
    addTrackedEventListener(document, 'click', documentClickHandler);

    // Prevent controls from hiding when clicking on them
    const controlsClickHandler = (e) => {
        e.stopPropagation();
    };
    
    addTrackedEventListener(customControls, 'click', controlsClickHandler);
}

// Show controls
function showControls() {
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');

    if (videoContainer && customControls) {
        videoContainer.classList.add('show-controls');
        customControls.classList.add('show-controls');
    }

    // Clear existing timeout
    if (controlsHideTimeout) {
        clearTimeout(controlsHideTimeout);
    }

    // Auto-hide after 4 seconds on desktop
    if (!isMobile) {
        controlsHideTimeout = setTimeout(() => {
            hideControls();
        }, 4000);
    }
}

// Hide controls
function hideControls() {
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');

    // Don't hide if dropdown is open
    if (document.querySelector('.dropdown-menu.show')) return;

    if (videoContainer && customControls) {
        videoContainer.classList.remove('show-controls');
        customControls.classList.remove('show-controls');
    }
}

// Setup play/pause controls
function setupPlayPauseControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (playPauseBtn) {
        const clickHandler = () => {
            if (!player || !isPlayerReady) return;
            
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        };
        
        addTrackedEventListener(playPauseBtn, 'click', clickHandler);
    }
}

// Setup seek controls
function setupSeekControls() {
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    
    if (skipBackBtn) {
        const backHandler = () => {
            if (!player || !isPlayerReady) return;
            
            const currentTime = player.getCurrentTime();
            player.seekTo(Math.max(0, currentTime - 10));
        };
        
        addTrackedEventListener(skipBackBtn, 'click', backHandler);
    }
    
    if (skipForwardBtn) {
        const forwardHandler = () => {
            if (!player || !isPlayerReady) return;
            
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            player.seekTo(Math.min(duration, currentTime + 10));
        };
        
        addTrackedEventListener(skipForwardBtn, 'click', forwardHandler);
    }
}

// Setup progress bar
function setupProgressBar() {
    const progressBar = document.getElementById('progressBar');
    
    if (progressBar) {
        const clickHandler = (e) => {
            if (!player || !isPlayerReady) return;
            
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const duration = player.getDuration();
            
            if (duration > 0) {
                player.seekTo(duration * percent);
            }
        };
        
        addTrackedEventListener(progressBar, 'click', clickHandler);
    }
}

// Setup volume controls
function setupVolumeControls() {
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (muteBtn) {
        const muteHandler = () => {
            if (!player || !isPlayerReady) return;
            
            if (player.isMuted()) {
                player.unMute();
                updateVolumeIcons(false);
            } else {
                player.mute();
                updateVolumeIcons(true);
            }
        };
        
        addTrackedEventListener(muteBtn, 'click', muteHandler);
    }
    
    if (volumeSlider) {
        const volumeHandler = (e) => {
            if (!player || !isPlayerReady) return;
            
            player.setVolume(parseInt(e.target.value));
            updateVolumeIcons(parseInt(e.target.value) === 0);
        };
        
        addTrackedEventListener(volumeSlider, 'input', volumeHandler);
    }
}

// Update volume icons
function updateVolumeIcons(isMuted) {
    const volumeIcon = document.getElementById('volumeIcon');
    const muteIcon = document.getElementById('muteIcon');
    
    if (volumeIcon && muteIcon) {
        if (isMuted) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'block';
        } else {
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }
    }
}

// Setup speed controls
function setupSpeedControls() {
    const speedBtn = document.getElementById('speedBtn');
    const speedDropdown = document.getElementById('speedDropdown');
    
    if (speedBtn && speedDropdown) {
        const toggleHandler = (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            speedDropdown.classList.toggle('show');
            showControls(); // Keep controls visible when dropdown is open
        };
        
        addTrackedEventListener(speedBtn, 'click', toggleHandler);
        
        // Handle speed selection
        const speedItems = speedDropdown.querySelectorAll('.dropdown-item');
        speedItems.forEach(item => {
            const itemHandler = (e) => {
                if (!player || !isPlayerReady) return;
                
                const speed = parseFloat(e.target.dataset.speed);
                player.setPlaybackRate(speed);
                speedBtn.textContent = speed + 'x';
                speedDropdown.classList.remove('show');
            };
            
            addTrackedEventListener(item, 'click', itemHandler);
        });
    }
}

// Setup quality controls
function setupQualityControls() {
    const qualityBtn = document.getElementById('qualityBtn');
    const qualityDropdown = document.getElementById('qualityDropdown');
    
    if (qualityBtn && qualityDropdown) {
        const toggleHandler = (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            qualityDropdown.classList.toggle('show');
            showControls(); // Keep controls visible when dropdown is open
        };
        
        addTrackedEventListener(qualityBtn, 'click', toggleHandler);
        
        // Handle quality selection
        const qualityItems = qualityDropdown.querySelectorAll('.dropdown-item');
        qualityItems.forEach(item => {
            const itemHandler = (e) => {
                if (!player || !isPlayerReady) return;
                
                const quality = e.target.dataset.quality;
                
                if (quality === 'auto') {
                    startQualityOptimization();
                    qualityBtn.textContent = 'Auto HD';
                } else {
                    if (qualityCheckInterval) {
                        clearInterval(qualityCheckInterval);
                        qualityCheckInterval = null;
                    }
                    player.setPlaybackQuality(quality);
                    qualityBtn.textContent = e.target.textContent;
                }
                
                qualityDropdown.classList.remove('show');
            };
            
            addTrackedEventListener(item, 'click', itemHandler);
        });
    }
}

// Close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Setup fullscreen controls
function setupFullscreenControls() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (fullscreenBtn) {
        const fullscreenHandler = () => {
            const videoContainer = document.querySelector('.video-container');
            
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement) {
                exitFullscreen();
            } else {
                enterFullscreen(videoContainer);
            }
        };
        
        addTrackedEventListener(fullscreenBtn, 'click', fullscreenHandler);
    }
}

// Enter fullscreen with cross-browser support
function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(console.error);
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// Exit fullscreen with cross-browser support
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Handle fullscreen changes
function handleFullscreenChange() {
    // Re-block controls after fullscreen changes
    setTimeout(blockNativeControls, 100);
}

// Setup navigation controls
function setupNavigationControls() {
    // Mobile buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const notePdfBtn = document.getElementById('notePdfBtn');
    
    // Desktop buttons
    const prevBtnDesktop = document.getElementById('prevBtnDesktop');
    const nextBtnDesktop = document.getElementById('nextBtnDesktop');
    const closeVideoBtnDesktop = document.getElementById('closeVideoBtnDesktop');
    const notePdfBtnDesktop = document.getElementById('notePdfBtnDesktop');
    
    // Previous video handlers
    [prevBtn, prevBtnDesktop].forEach(btn => {
        if (btn) {
            addTrackedEventListener(btn, 'click', () => {
                if (currentVideoIndex > 0) {
                    playVideo(currentVideoIndex - 1);
                }
            });
        }
    });
    
    // Next video handlers
    [nextBtn, nextBtnDesktop].forEach(btn => {
        if (btn) {
            addTrackedEventListener(btn, 'click', () => {
                if (currentVideoIndex < classesData.length - 1) {
                    playVideo(currentVideoIndex + 1);
                }
            });
        }
    });
    
    // Close video handlers
    [closeVideoBtn, closeVideoBtnDesktop].forEach(btn => {
        if (btn) {
            addTrackedEventListener(btn, 'click', closeVideo);
        }
    });
    
    // Note/PDF handlers
    [notePdfBtn, notePdfBtnDesktop].forEach(btn => {
        if (btn) {
            addTrackedEventListener(btn, 'click', () => {
                openNote(classesData[currentVideoIndex].noteLink);
            });
        }
    });
}

// Close video function
function closeVideo() {
    // Clean up player completely
    cleanupPlayer();
    
    // Hide video player and show cards
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    if (videoPlayerContainer) videoPlayerContainer.classList.add('hidden');
    if (cardsContainer) cardsContainer.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open note function
function openNote(noteLink) {
    window.open(noteLink, '_blank', 'noopener,noreferrer');
}

// Progress update functions
function startProgressUpdate() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (!player || !isPlayerReady || isDestroying) return;
        
        try {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            
            if (duration > 0) {
                const percentage = (currentTime / duration) * 100;
                
                const progressFill = document.getElementById('progressFill');
                const timeDisplay = document.getElementById('timeDisplay');
                
                if (progressFill) progressFill.style.width = percentage + '%';
                
                const timeString = formatTime(currentTime) + ' / ' + formatTime(duration);
                if (timeDisplay) timeDisplay.textContent = timeString;
            }
        } catch (e) {
            console.warn('Progress update error:', e);
        }
    }, 1000);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Format time helper
function formatTime(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Quality optimization
function startQualityOptimization() {
    if (qualityCheckInterval) {
        clearInterval(qualityCheckInterval);
    }
    
    qualityCheckInterval = setInterval(() => {
        if (!player || !isPlayerReady || isDestroying) return;
        
        try {
            const availableQualities = player.getAvailableQualityLevels();
            
            if (availableQualities && availableQualities.length > 0) {
                let selectedQuality = 'large';
                let badgeText = 'HD';
                
                if (availableQualities.includes('hd1080')) {
                    selectedQuality = 'hd1080';
                    badgeText = '1080p HD';
                } else if (availableQualities.includes('hd720')) {
                    selectedQuality = 'hd720';
                    badgeText = '720p HD';
                } else if (availableQualities.includes('large')) {
                    selectedQuality = 'large';
                    badgeText = '480p HD';
                }
                
                player.setPlaybackQuality(selectedQuality);
                updateQualityBadge(badgeText);
            }
        } catch (e) {
            console.warn('Quality optimization error:', e);
        }
    }, 3000);
}

// Update quality badge
function updateQualityBadge(text) {
    const qualityBadge = document.getElementById('qualityBadge');
    if (qualityBadge) {
        qualityBadge.textContent = text;
    }
}

// Keyboard shortcuts handler
function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when video is playing
    if (document.getElementById('video-player-container').classList.contains('hidden') || 
        !player || !isPlayerReady || isDestroying) {
        return;
    }
    
    // Don't handle if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    try {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                    player.pauseVideo();
                } else {
                    player.playVideo();
                }
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                const currentTime = player.getCurrentTime();
                player.seekTo(Math.max(0, currentTime - 10));
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                const currentTimeRight = player.getCurrentTime();
                const duration = player.getDuration();
                player.seekTo(Math.min(duration, currentTimeRight + 10));
                break;
                
            case 'KeyM':
                e.preventDefault();
                if (player.isMuted()) {
                    player.unMute();
                    updateVolumeIcons(false);
                } else {
                    player.mute();
                    updateVolumeIcons(true);
                }
                break;
                
            case 'KeyF':
                e.preventDefault();
                const videoContainer = document.querySelector('.video-container');
                if (document.fullscreenElement) {
                    exitFullscreen();
                } else {
                    enterFullscreen(videoContainer);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentVideoIndex > 0) {
                    playVideo(currentVideoIndex - 1);
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (currentVideoIndex < classesData.length - 1) {
                    playVideo(currentVideoIndex + 1);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                closeVideo();
                break;
        }
    } catch (e) {
        console.warn('Keyboard shortcut error:', e);
    }
}

// Window resize handler
function handleWindowResize() {
    // Re-block controls after resize
    setTimeout(blockNativeControls, 100);
}

// Global click handler to close dropdowns
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu') && 
        !e.target.closest('#speedBtn') && 
        !e.target.closest('#qualityBtn')) {
        closeAllDropdowns();
    }
});

// Prevent drag and drop
document.addEventListener('dragstart', (e) => e.preventDefault());

// Enhanced mobile support
if (isMobile) {
    // Handle orientation changes
    const handleOrientationChange = () => {
        setTimeout(() => {
            if (player && isPlayerReady && !document.getElementById('video-player-container').classList.contains('hidden')) {
                const orientation = screen.orientation?.angle || window.orientation || 0;
                
                // Auto-fullscreen on landscape for better experience
                if (Math.abs(orientation) === 90) {
                    const videoContainer = document.querySelector('.video-container');
                    if (!document.fullscreenElement) {
                        enterFullscreen(videoContainer);
                    }
                }
            }
        }, 500);
    };
    
    // Listen for orientation changes
    if (screen.orientation) {
        screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
        window.addEventListener('orientationchange', handleOrientationChange);
    }
    
    // Touch handling for better mobile experience
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchmove', (e) => {
        // Prevent scrolling when video is in fullscreen
        if (document.fullscreenElement && e.target.closest('.video-container')) {
            e.preventDefault();
        }
    });
}

// Page visibility change handler
document.addEventListener('visibilitychange', () => {
    if (document.hidden && player && isPlayerReady) {
        // Optionally pause when page is hidden
        // player.pauseVideo();
    }
});

console.log('Enhanced YouTube Player initialized with complete custom controls');
