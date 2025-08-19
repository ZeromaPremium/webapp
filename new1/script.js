// Enhanced YouTube Player with Perfect Mobile Controls & Premium Design
// Zeroma Premium - Complete Custom Video Player Solution

// Mock data for classes with enhanced information
const classesData = [
    {
        id: 1,
        videoId: 'z8xEcK-unFs',
        title: 'Higher Math - সরলরেখা - Cycle 01 - Lecture 01',
        duration: '98:43',
        instructor: 'Prof. Rahman',
        category: 'Mathematics',
        noteLink: 'https://example.com/notes/class1.pdf'
    },
    {
        id: 2,
        videoId: 'dQw4w9WgXcQ',
        title: 'Physics - Wave Motion - Advanced Concepts',
        duration: '45:20',
        instructor: 'Dr. Ahmed',
        category: 'Physics',
        noteLink: 'https://example.com/notes/class2.pdf'
    },
    {
        id: 3,
        videoId: 'jNQXAC9IVRw',
        title: 'Chemistry - Organic Compounds - Part 1',
        duration: '67:15',
        instructor: 'Prof. Sultana',
        category: 'Chemistry',
        noteLink: 'https://example.com/notes/class3.pdf'
    },
    {
        id: 4,
        videoId: 'M7lc1UVf-VE',
        title: 'Biology - Cell Structure and Functions',
        duration: '52:30',
        instructor: 'Dr. Khan',
        category: 'Biology',
        noteLink: 'https://example.com/notes/class4.pdf'
    },
    {
        id: 5,
        videoId: 'fJ9rUzIMcZQ',
        title: 'Mathematics - Calculus - Differentiation',
        duration: '78:45',
        instructor: 'Prof. Islam',
        category: 'Mathematics',
        noteLink: 'https://example.com/notes/class5.pdf'
    },
    {
        id: 6,
        videoId: 'ZZ5LpwO-An4',
        title: 'English - Grammar - Advanced Topics',
        duration: '42:18',
        instructor: 'Ms. Begum',
        category: 'English',
        noteLink: 'https://example.com/notes/class6.pdf'
    },
    {
        id: 7,
        videoId: 'hFZFjoX2cGg',
        title: 'Computer Science - Data Structures',
        duration: '89:32',
        instructor: 'Dr. Hassan',
        category: 'Computer Science',
        noteLink: 'https://example.com/notes/class7.pdf'
    },
    {
        id: 8,
        videoId: '2vjPBrBU-TM',
        title: 'Statistics - Probability Theory',
        duration: '56:27',
        instructor: 'Prof. Ali',
        category: 'Statistics',
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
let mobileControlsVisible = false;

// Device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready for Zeroma Premium');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupGlobalEventListeners();
    setupMobileEnhancements();
});

function initializeApp() {
    renderClassCards();
    setupMobileMenu();
    setupLogoReload();
}

// Setup logo reload functionality
function setupLogoReload() {
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
        logoText.addEventListener('click', () => {
            // Add a smooth reload animation
            logoText.style.transform = 'scale(0.95)';
            setTimeout(() => {
                location.reload();
            }, 150);
        });
    }
}

// Enhanced class card rendering with premium design
function renderClassCards() {
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return;

    const cardHTML = classesData.map((classItem, index) => `
        <div class="class-card p-8 rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl group cursor-pointer" onclick="playVideo(${index})">
            <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                    <!-- Class Number and Duration -->
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold px-4 py-2 rounded-full bg-gradient-to-r from-orange-200 to-amber-200" 
                              style="color: var(--color-text-primary); background: var(--color-bg-secondary-element);">
                            #${classItem.id.toString().padStart(2, '0')}
                        </span>
                        <div class="text-right">
                            <span class="text-sm font-semibold block" style="color: var(--color-text-primary);">${classItem.duration}</span>
                            <span class="text-xs opacity-75" style="color: var(--color-text-secondary);">${classItem.category}</span>
                        </div>
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-xl font-bold mb-3 line-clamp-2 group-hover:text-orange-700 transition-colors duration-300" 
                        style="color: var(--color-text-primary);" title="${classItem.title}">
                        ${classItem.title}
                    </h3>
                    
                    <!-- Instructor -->
                    <p class="text-sm mb-4 flex items-center" style="color: var(--color-text-secondary);">
                        <i class="fas fa-user-graduate mr-2"></i>
                        ${classItem.instructor}
                    </p>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-between space-x-3">
                <button onclick="event.stopPropagation(); playVideo(${index})" 
                        class="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:shadow-md"
                        style="background: var(--color-bg-button); color: var(--color-text-primary); border: 2px solid var(--color-bg-secondary-element);">
                    <i class="fas fa-play text-lg"></i>
                    <span>Watch Now</span>
                </button>
                
                <button onclick="event.stopPropagation(); openNote('${classItem.noteLink}')" 
                        class="px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style="background: var(--color-bg-accent); color: var(--color-text-primary); border: 2px solid var(--color-bg-secondary-element);">
                    <i class="fas fa-file-pdf text-lg"></i>
                </button>
            </div>
            
            <!-- Hover Effect Overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
        </div>
    `).join('');

    cardsGrid.innerHTML = cardHTML;
}

// Setup mobile menu with enhanced animations
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
            
            // Animate hamburger icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars text-xl';
            } else {
                icon.className = 'fas fa-times text-xl';
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.className = 'fas fa-bars text-xl';
                }
            }
        });
    }
}

// Setup mobile-specific enhancements
function setupMobileEnhancements() {
    if (isMobile) {
        // Handle orientation changes with better UX
        const handleOrientationChange = () => {
            setTimeout(() => {
                if (player && isPlayerReady && !document.getElementById('video-player-container').classList.contains('hidden')) {
                    showMobileVideoControls();
                    
                    // Auto-fullscreen on landscape for mobile
                    const orientation = screen.orientation?.angle || window.orientation || 0;
                    if (Math.abs(orientation) === 90 && !document.fullscreenElement) {
                        const videoContainer = document.querySelector('.video-container');
                        enterFullscreen(videoContainer);
                    }
                }
            }, 300);
        };
        
        // Listen for orientation changes
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        } else {
            window.addEventListener('orientationchange', handleOrientationChange);
        }
        
        // Enhanced touch handling
        setupMobileTouchHandling();
    }
}

// Setup mobile touch handling
function setupMobileTouchHandling() {
    let touchStartY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    });
    
    document.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = Date.now() - touchStartTime;
        const touchDistance = Math.abs(touchEndY - touchStartY);
        
        // Quick tap on video to toggle controls
        if (touchDuration < 300 && touchDistance < 10 && e.target.closest('.video-container')) {
            e.preventDefault();
            toggleMobileVideoControls();
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        // Prevent scrolling when video is in fullscreen
        if (document.fullscreenElement && e.target.closest('.video-container')) {
            e.preventDefault();
        }
    });
}

// Show mobile video controls
function showMobileVideoControls() {
    if (!isMobile) return;
    
    const mobileControls = document.getElementById('mobileVideoControls');
    if (mobileControls && !document.getElementById('video-player-container').classList.contains('hidden')) {
        mobileControls.classList.add('show');
        mobileControlsVisible = true;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideMobileVideoControls();
        }, 5000);
    }
}

// Hide mobile video controls
function hideMobileVideoControls() {
    if (!isMobile) return;
    
    const mobileControls = document.getElementById('mobileVideoControls');
    if (mobileControls) {
        mobileControls.classList.remove('show');
        mobileControlsVisible = false;
    }
}

// Toggle mobile video controls
function toggleMobileVideoControls() {
    if (mobileControlsVisible) {
        hideMobileVideoControls();
    } else {
        showMobileVideoControls();
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
    
    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => e.preventDefault());
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

// Enhanced play video function
function playVideo(index) {
    if (isDestroying) return;
    
    currentVideoIndex = index;
    const classItem = classesData[index];

    // Show video player and hide cards with smooth transition
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');

    if (cardsContainer) {
        cardsContainer.style.opacity = '0';
        cardsContainer.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            cardsContainer.classList.add('hidden');
            cardsContainer.style.opacity = '';
            cardsContainer.style.transform = '';
        }, 300);
    }
    
    if (videoPlayerContainer) {
        videoPlayerContainer.classList.remove('hidden');
        videoPlayerContainer.style.opacity = '0';
        videoPlayerContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            videoPlayerContainer.style.opacity = '1';
            videoPlayerContainer.style.transform = 'translateY(0)';
        }, 50);
    }

    // Set video title with enhanced display
    const videoTitle = document.getElementById('video-title');
    if (videoTitle) {
        videoTitle.innerHTML = `
            <div class="text-center">
                <span class="text-sm font-semibold px-3 py-1 rounded-full mb-2 inline-block" 
                      style="background: var(--color-bg-accent); color: var(--color-text-primary);">
                    ${classItem.category}
                </span>
                <h2 class="text-2xl md:text-3xl font-bold">${classItem.title}</h2>
                <p class="text-lg mt-2 opacity-75" style="color: var(--color-text-secondary);">
                    <i class="fas fa-user-graduate mr-2"></i>${classItem.instructor}
                </p>
            </div>
        `;
    }

    // Clean up previous player completely
    cleanupPlayer();

    // Initialize new player
    initYouTubePlayer(classItem.videoId);

    // Show mobile controls if on mobile
    if (isMobile) {
        setTimeout(() => {
            showMobileVideoControls();
        }, 1000);
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Complete player cleanup
function cleanupPlayer() {
    isDestroying = true;
    isPlayerReady = false;

    // Hide mobile controls
    hideMobileVideoControls();

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
    
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    
    // Reset volume icons
    updateVolumeIcons(false);
}

// Initialize YouTube player with enhanced controls blocking
function initYouTubePlayer(videoId) {
    if (isDestroying) return;
    
    // Show loading spinner with enhanced animation
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
        loadingSpinner.innerHTML = `
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
            <p class="text-white mt-4 text-lg font-semibold">Loading Premium Content...</p>
            <div class="mt-2 w-32 h-1 bg-white bg-opacity-30 rounded mx-auto overflow-hidden">
                <div class="h-full bg-white animate-pulse"></div>
            </div>
        `;
    }

    // Enhanced player configuration
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
            'widget_referrer': window.location.href,
            'autoplay': 0,              // Don't autoplay
            'start': 0                  // Start from beginning
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
    
    // Hide loading spinner with fade effect
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.opacity = '0';
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            loadingSpinner.style.opacity = '';
        }, 300);
    }

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
    
    // Show mobile controls if on mobile
    if (isMobile) {
        setTimeout(() => {
            showMobileVideoControls();
        }, 500);
    }
}

// Enhanced block native controls
function blockNativeControls() {
    if (!player || isDestroying) return;
    
    const iframe = player.getIframe();
    if (iframe) {
        // Prevent all interactions with the iframe
        iframe.style.pointerEvents = 'none';
        iframe.setAttribute('tabindex', '-1');
        iframe.style.webkitUserSelect = 'none';
        iframe.style.mozUserSelect = 'none';
        iframe.style.msUserSelect = 'none';
        iframe.style.userSelect = 'none';
        iframe.setAttribute('disablePictureInPicture', 'true');
        
        // Additional blocking
        iframe.addEventListener('contextmenu', (e) => e.preventDefault());
        iframe.addEventListener('selectstart', (e) => e.preventDefault());
        iframe.addEventListener('dragstart', (e) => e.preventDefault());
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
        // Show mobile controls briefly when playing starts
        if (isMobile) {
            showMobileVideoControls();
        }
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
                <i class="fas fa-exclamation-triangle text-4xl mb-4 text-red-400"></i>
                <p class="text-lg font-semibold mb-2">Unable to Load Video</p>
                <p class="text-sm opacity-75">Error code: ${event.data}</p>
                <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Retry
                </button>
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
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
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

// Setup controls visibility with enhanced logic
function setupControlsVisibility() {
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');
    const videoOverlay = document.getElementById('videoOverlay');

    if (!videoContainer || !customControls || !videoOverlay) return;

    // Enhanced overlay click handler
    const overlayClickHandler = (e) => {
        e.stopPropagation();
        
        if (isMobile) {
            // On mobile, toggle mobile controls
            toggleMobileVideoControls();
        } else {
            // On desktop, show controls and toggle play/pause
            showControls();
        }
        
        // Toggle play/pause
        if (player && isPlayerReady) {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    };
    
    addTrackedEventListener(videoOverlay, 'click', overlayClickHandler);

    // Desktop-specific behavior
    if (!isMobile) {
        const mouseEnterHandler = () => showControls();
        const mouseMoveHandler = () => showControls();
        
        addTrackedEventListener(videoContainer, 'mouseenter', mouseEnterHandler);
        addTrackedEventListener(videoContainer, 'mousemove', mouseMoveHandler);
        
        // Hide controls when mouse leaves (desktop only)
        const mouseLeaveHandler = () => {
            setTimeout(() => {
                if (!videoContainer.matches(':hover')) {
                    hideControls();
                }
            }, 1000);
        };
        
        addTrackedEventListener(videoContainer, 'mouseleave', mouseLeaveHandler);
    }

    // Hide controls when clicking outside
    const documentClickHandler = (e) => {
        if (!videoContainer.contains(e.target)) {
            hideControls();
            if (isMobile) {
                hideMobileVideoControls();
            }
        }
    };
    
    addTrackedEventListener(document, 'click', documentClickHandler);

    // Prevent controls from hiding when clicking on them
    const controlsClickHandler = (e) => {
        e.stopPropagation();
    };
    
    addTrackedEventListener(customControls, 'click', controlsClickHandler);
}

// Enhanced show controls
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

    // Auto-hide after 4 seconds on desktop (not on mobile)
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
            
            // Show mobile controls briefly after seeking
            if (isMobile) {
                showMobileVideoControls();
            }
        };
        
        addTrackedEventListener(skipBackBtn, 'click', backHandler);
    }
    
    if (skipForwardBtn) {
        const forwardHandler = () => {
            if (!player || !isPlayerReady) return;
            
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            player.seekTo(Math.min(duration, currentTime + 10));
            
            // Show mobile controls briefly after seeking
            if (isMobile) {
                showMobileVideoControls();
            }
        };
        
        addTrackedEventListener(skipForwardBtn, 'click', forwardHandler);
    }
}

// Setup progress bar with enhanced interaction
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
                
                // Show mobile controls briefly after seeking
                if (isMobile) {
                    showMobileVideoControls();
                }
            }
        };
        
        addTrackedEventListener(progressBar, 'click', clickHandler);
        
        // Add hover effect for desktop
        if (!isMobile) {
            addTrackedEventListener(progressBar, 'mouseenter', () => {
                progressBar.style.height = '8px';
            });
            
            addTrackedEventListener(progressBar, 'mouseleave', () => {
                progressBar.style.height = '6px';
            });
        }
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
            
            const volume = parseInt(e.target.value);
            player.setVolume(volume);
            updateVolumeIcons(volume === 0);
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
            volumeIcon.classList.add('hidden');
            muteIcon.classList.remove('hidden');
        } else {
            volumeIcon.classList.remove('hidden');
            muteIcon.classList.add('hidden');
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

// Setup fullscreen controls with enhanced mobile support
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
    
    // Adjust mobile controls visibility in fullscreen
    if (isMobile) {
        if (document.fullscreenElement) {
            // In fullscreen, show mobile controls briefly
            showMobileVideoControls();
        }
    }
}

// Enhanced navigation controls setup
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
            const handler = () => {
                if (currentVideoIndex > 0) {
                    playVideo(currentVideoIndex - 1);
                } else {
                    // Show feedback if at first video
                    showNotification('This is the first video in the series');
                }
            };
            addTrackedEventListener(btn, 'click', handler);
        }
    });
    
    // Next video handlers
    [nextBtn, nextBtnDesktop].forEach(btn => {
        if (btn) {
            const handler = () => {
                if (currentVideoIndex < classesData.length - 1) {
                    playVideo(currentVideoIndex + 1);
                } else {
                    // Show feedback if at last video
                    showNotification('This is the last video in the series');
                }
            };
            addTrackedEventListener(btn, 'click', handler);
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
            const handler = () => {
                openNote(classesData[currentVideoIndex].noteLink);
            };
            addTrackedEventListener(btn, 'click', handler);
        }
    });
}

// Enhanced close video function
function closeVideo() {
    // Clean up player completely
    cleanupPlayer();
    
    // Hide video player and show cards with smooth transition
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    if (videoPlayerContainer) {
        videoPlayerContainer.style.opacity = '0';
        videoPlayerContainer.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            videoPlayerContainer.classList.add('hidden');
            videoPlayerContainer.style.opacity = '';
            videoPlayerContainer.style.transform = '';
        }, 300);
    }
    
    if (cardsContainer) {
        cardsContainer.classList.remove('hidden');
        cardsContainer.style.opacity = '0';
        cardsContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            cardsContainer.style.opacity = '1';
            cardsContainer.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open note function
function openNote(noteLink) {
    // Show loading feedback
    showNotification('Opening PDF/Note...', 'info');
    
    // Open in new tab with enhanced security
    const newWindow = window.open(noteLink, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
        showNotification('Please allow popups to view the note/PDF', 'warning');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-sm';
    
    // Set styles based on type
    switch (type) {
        case 'success':
            notification.style.background = 'var(--color-bg-accent)';
            notification.style.color = 'var(--color-text-primary)';
            notification.style.border = '2px solid var(--color-bg-secondary-element)';
            notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
            break;
        case 'warning':
            notification.style.background = '#FEF3C7';
            notification.style.color = '#92400E';
            notification.style.border = '2px solid #FDE68A';
            notification.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${message}`;
            break;
        case 'error':
            notification.style.background = '#FEE2E2';
            notification.style.color = '#DC2626';
            notification.style.border = '2px solid #FCA5A5';
            notification.innerHTML = `<i class="fas fa-times-circle mr-2"></i>${message}`;
            break;
        default:
            notification.style.background = 'var(--color-bg-button)';
            notification.style.color = 'var(--color-text-primary)';
            notification.style.border = '2px solid var(--color-bg-secondary-element)';
            notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
    }
    
    // Add animation
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
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
                
                if (progressFill) {
                    progressFill.style.width = percentage + '%';
                }
                
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

// Enhanced format time helper
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

// Enhanced quality optimization
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
                
                // Select best available quality
                if (availableQualities.includes('hd1080')) {
                    selectedQuality = 'hd1080';
                    badgeText = '1080p HD';
                } else if (availableQualities.includes('hd720')) {
                    selectedQuality = 'hd720';
                    badgeText = '720p HD';
                } else if (availableQualities.includes('large')) {
                    selectedQuality = 'large';
                    badgeText = '480p HD';
                } else if (availableQualities.includes('medium')) {
                    selectedQuality = 'medium';
                    badgeText = '360p';
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

// Enhanced keyboard shortcuts handler
function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when video is playing
    if (document.getElementById('video-player-container').classList.contains('hidden') || 
        !player || !isPlayerReady || isDestroying) {
        return;
    }
    
    // Don't handle if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
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
                showNotification(player.getPlayerState() === YT.PlayerState.PLAYING ? 'Paused' : 'Playing');
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                const currentTime = player.getCurrentTime();
                player.seekTo(Math.max(0, currentTime - 10));
                showNotification('Rewound 10 seconds');
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                const currentTimeRight = player.getCurrentTime();
                const duration = player.getDuration();
                player.seekTo(Math.min(duration, currentTimeRight + 10));
                showNotification('Fast forwarded 10 seconds');
                break;
                
            case 'KeyM':
                e.preventDefault();
                if (player.isMuted()) {
                    player.unMute();
                    updateVolumeIcons(false);
                    showNotification('Unmuted');
                } else {
                    player.mute();
                    updateVolumeIcons(true);
                    showNotification('Muted');
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
                } else {
                    showNotification('This is the first video');
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (currentVideoIndex < classesData.length - 1) {
                    playVideo(currentVideoIndex + 1);
                } else {
                    showNotification('This is the last video');
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                if (document.fullscreenElement) {
                    exitFullscreen();
                } else {
                    closeVideo();
                }
                break;
        }
        
        // Show mobile controls on any keyboard interaction (if on mobile with keyboard)
        if (isMobile) {
            showMobileVideoControls();
        }
    } catch (e) {
        console.warn('Keyboard shortcut error:', e);
    }
}

// Window resize handler
function handleWindowResize() {
    // Re-block controls after resize
    setTimeout(blockNativeControls, 100);
    
    // Adjust mobile behavior based on new size
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
        // Device type changed, refresh controls
        if (player && isPlayerReady) {
            setupAllCustomControls();
        }
    }
}

// Global click handler to close dropdowns
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu') && 
        !e.target.closest('#speedBtn') && 
        !e.target.closest('#qualityBtn')) {
        closeAllDropdowns();
    }
});

// Page visibility change handler
document.addEventListener('visibilitychange', () => {
    if (document.hidden && player && isPlayerReady) {
        // Optionally pause when page becomes hidden
        // Uncomment the line below if you want to auto-pause when user switches tabs
        // player.pauseVideo();
    }
});

// Enhanced error handling for network issues
window.addEventListener('online', () => {
    if (player && !isPlayerReady) {
        showNotification('Connection restored, reloading video...', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
});

window.addEventListener('offline', () => {
    showNotification('No internet connection', 'error');
});

// Initialize enhanced features
console.log('🎓 Zeroma Premium Video Player initialized successfully!');
console.log('📱 Mobile optimizations:', isMobile ? 'Enabled' : 'Desktop mode');
console.log('🎮 Controls: Custom controls with full YouTube blocking active');
