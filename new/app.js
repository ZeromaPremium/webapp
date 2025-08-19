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
let isDesktop = window.innerWidth > 768;
let progressInterval = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    renderClassCards();
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        isDesktop = window.innerWidth > 768;
    });
}

function renderClassCards() {
    const cardsContainer = document.getElementById('cards-container');
    const mobileCardsGrid = document.getElementById('mobile-cards-grid');
    const desktopCardsGrid = document.getElementById('desktop-cards-grid');
    
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
    
    // Render cards in all containers
    if (cardsContainer) cardsContainer.innerHTML = cardHTML;
    if (mobileCardsGrid) mobileCardsGrid.innerHTML = cardHTML;
    if (desktopCardsGrid) desktopCardsGrid.innerHTML = cardHTML;
}

function playVideo(index) {
    currentVideoIndex = index;
    const classItem = classesData[index];
    
    // Hide cards container and show video player
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    if (cardsContainer) cardsContainer.classList.add('hidden');
    if (videoPlayerContainer) videoPlayerContainer.classList.remove('hidden');
    
    // Set video title for both mobile and desktop
    const videoTitle = document.getElementById('video-title');
    const videoTitleDesktop = document.getElementById('video-title-desktop');
    if (videoTitle) videoTitle.textContent = classItem.title;
    if (videoTitleDesktop) videoTitleDesktop.textContent = classItem.title;
    
    // Initialize YouTube player with unified approach
    initYouTubePlayer(classItem.videoId);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeVideo() {
    // Stop and destroy player
    if (player) {
        player.destroy();
        player = null;
    }
    
    // Hide video player and show cards
    const cardsContainer = document.getElementById('cards-container');
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    if (videoPlayerContainer) videoPlayerContainer.classList.add('hidden');
    if (cardsContainer) cardsContainer.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextVideo() {
    if (currentVideoIndex < classesData.length - 1) {
        playVideo(currentVideoIndex + 1);
    }
}

function prevVideo() {
    if (currentVideoIndex > 0) {
        playVideo(currentVideoIndex - 1);
    }
}

function openNote(noteLink) {
    window.open(noteLink, '_blank');
}

// YouTube API callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Global YouTube API reference
/* global YT */

function initYouTubePlayer(videoId) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
    
    // Destroy existing player if it exists
    if (player) {
        player.destroy();
    }
    
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'controls': 0,          // Hide native controls
            'disablekb': 1,         // Disable keyboard controls
            'modestbranding': 1,    // Remove YouTube logo
            'showinfo': 0,          // Hide video info
            'rel': 0,               // Disable related videos
            'fs': 0,                // Disable fullscreen button
            'cc_load_policy': 0,    // Disable closed captions
            'iv_load_policy': 3,    // Hide annotations
            'autohide': 0,          // Always show controls
            'playsinline': 1        // Play inline on mobile
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Hide loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    // Show custom controls initially
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');
    
    if (videoContainer && customControls) {
        videoContainer.classList.add('show-controls');
        customControls.classList.add('show-controls');
    }
    
    // Set up custom controls
    setupCustomControls();
    
    // Auto-optimize quality
    setTimeout(() => {
        optimizeQuality();
    }, 1000);
}

function onPlayerStateChange(event) {
    const isDesktop = window.innerWidth > 768;
    
    if (event.data === YT.PlayerState.PLAYING) {
        // Update play/pause icons for both mobile and desktop
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const playIconDesktop = document.getElementById('playIconDesktop');
        const pauseIconDesktop = document.getElementById('pauseIconDesktop');
        
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        if (playIconDesktop) playIconDesktop.style.display = 'none';
        if (pauseIconDesktop) pauseIconDesktop.style.display = 'block';
        
        startProgressUpdate();
    } else {
        // Update play/pause icons for both mobile and desktop
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        const playIconDesktop = document.getElementById('playIconDesktop');
        const pauseIconDesktop = document.getElementById('pauseIconDesktop');
        
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (playIconDesktop) playIconDesktop.style.display = 'block';
        if (pauseIconDesktop) pauseIconDesktop.style.display = 'none';
        
        stopProgressUpdate();
    }
}

function setupControlsVisibility() {
    const videoContainer = document.querySelector('.video-container');
    const customControls = document.getElementById('customControls');
    const videoOverlay = document.getElementById('videoOverlay');
    
    if (!videoContainer || !customControls || !videoOverlay) return;
    
    // Show controls when clicking on video overlay
    videoOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        customControls.classList.add('show-controls');
        videoContainer.classList.add('show-controls');
    });
    
    // Hide controls when clicking outside video
    document.addEventListener('click', (e) => {
        if (!videoContainer.contains(e.target)) {
            customControls.classList.remove('show-controls');
            videoContainer.classList.remove('show-controls');
        }
    });
    
    // Prevent controls from hiding when clicking on controls themselves
    customControls.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Show controls on hover (desktop)
    if (window.innerWidth > 768) {
        videoContainer.addEventListener('mouseenter', () => {
            customControls.classList.add('show-controls');
            videoContainer.classList.add('show-controls');
        });
        
        // Auto-hide controls after 3 seconds of no activity
        let hideControlsTimeout;
        const resetHideTimer = () => {
            clearTimeout(hideControlsTimeout);
            hideControlsTimeout = setTimeout(() => {
                if (!videoContainer.matches(':hover') && !document.querySelector('.dropdown-menu.show')) {
                    customControls.classList.remove('show-controls');
                    videoContainer.classList.remove('show-controls');
                }
            }, 3000);
        };
        
        // Reset timer on mouse move
        videoContainer.addEventListener('mousemove', resetHideTimer);
    }
}

function setupCustomControls() {
    if (!player) return;
    
    // Set up controls visibility behavior
    setupControlsVisibility();
    
    // Get current screen size to determine which controls to use
    const isDesktop = window.innerWidth > 768;
    
    // Play/Pause buttons (both mobile and desktop)
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseBtnDesktop = document.getElementById('playPauseBtnDesktop');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
    }
    
    if (playPauseBtnDesktop) {
        playPauseBtnDesktop.addEventListener('click', () => {
            if (player.getPlayerState() === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
    }
    
    // Skip buttons
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipBackBtnDesktop = document.getElementById('skipBackBtnDesktop');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const skipForwardBtnDesktop = document.getElementById('skipForwardBtnDesktop');
    
    [skipBackBtn, skipBackBtnDesktop].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const currentTime = player.getCurrentTime();
                player.seekTo(Math.max(0, currentTime - 10));
            });
        }
    });
    
    [skipForwardBtn, skipForwardBtnDesktop].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                player.seekTo(Math.min(duration, currentTime + 10));
            });
        }
    });
    
    // Progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const duration = player.getDuration();
            player.seekTo(duration * percent);
        });
    }
    
    // Volume controls
    const muteBtn = document.getElementById('muteBtn');
    const muteBtnDesktop = document.getElementById('muteBtnDesktop');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeSliderDesktop = document.getElementById('volumeSliderDesktop');
    
    [muteBtn, muteBtnDesktop].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (player.isMuted()) {
                    player.unMute();
                    updateVolumeIcons(false);
                } else {
                    player.mute();
                    updateVolumeIcons(true);
                }
            });
        }
    });
    
    [volumeSlider, volumeSliderDesktop].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', (e) => {
                player.setVolume(e.target.value);
            });
        }
    });
    
    // Speed controls
    setupSpeedControls();
    
    // Quality controls
    setupQualityControls();
    
    // Fullscreen controls
    setupFullscreenControls();
    
    // Navigation buttons
    setupNavigationButtons();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('[id*="speedBtn"]') && !e.target.closest('[id*="qualityBtn"]')) {
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
}

function updateVolumeIcons(isMuted) {
    const volumeIcon = document.getElementById('volumeIcon');
    const muteIcon = document.getElementById('muteIcon');
    const volumeIconDesktop = document.getElementById('volumeIconDesktop');
    const muteIconDesktop = document.getElementById('muteIconDesktop');
    
    if (isMuted) {
        if (volumeIcon) volumeIcon.style.display = 'none';
        if (muteIcon) muteIcon.style.display = 'block';
        if (volumeIconDesktop) volumeIconDesktop.style.display = 'none';
        if (muteIconDesktop) muteIconDesktop.style.display = 'block';
    } else {
        if (volumeIcon) volumeIcon.style.display = 'block';
        if (muteIcon) muteIcon.style.display = 'none';
        if (volumeIconDesktop) volumeIconDesktop.style.display = 'block';
        if (muteIconDesktop) muteIconDesktop.style.display = 'none';
    }
}

function setupSpeedControls() {
    const speedBtn = document.getElementById('speedBtn');
    const speedBtnDesktop = document.getElementById('speedBtnDesktop');
    const speedDropdown = document.getElementById('speedDropdown');
    const speedDropdownDesktop = document.getElementById('speedDropdownDesktop');
    
    [speedBtn, speedBtnDesktop].forEach((btn, index) => {
        const dropdown = index === 0 ? speedDropdown : speedDropdownDesktop;
        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const speed = parseFloat(e.target.dataset.speed);
                    player.setPlaybackRate(speed);
                    btn.textContent = speed + 'x';
                    dropdown.classList.remove('show');
                });
            });
        }
    });
}

function setupQualityControls() {
    const qualityBtn = document.getElementById('qualityBtn');
    const qualityBtnDesktop = document.getElementById('qualityBtnDesktop');
    const qualityDropdown = document.getElementById('qualityDropdown');
    const qualityDropdownDesktop = document.getElementById('qualityDropdownDesktop');
    
    [qualityBtn, qualityBtnDesktop].forEach((btn, index) => {
        const dropdown = index === 0 ? qualityDropdown : qualityDropdownDesktop;
        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const quality = e.target.dataset.quality;
                    if (quality === 'auto') {
                        optimizeQuality();
                    } else {
                        player.setPlaybackQuality(quality);
                    }
                    btn.textContent = e.target.textContent;
                    dropdown.classList.remove('show');
                });
            });
        }
    });
}

function setupFullscreenControls() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenBtnDesktop = document.getElementById('fullscreenBtnDesktop');
    
    [fullscreenBtn, fullscreenBtnDesktop].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                const videoContainer = document.querySelector('.video-container');
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen().catch(err => {
                        console.error('Error attempting to enable fullscreen:', err);
                    });
                } else if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                }
            });
        }
    });
}

function setupNavigationButtons() {
    // Mobile navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const notePdfBtn = document.getElementById('notePdfBtn');
    
    // Desktop navigation buttons
    const prevBtnDesktop = document.getElementById('prevBtnDesktop');
    const nextBtnDesktop = document.getElementById('nextBtnDesktop');
    const closeVideoBtnDesktop = document.getElementById('closeVideoBtnDesktop');
    const notePdfBtnDesktop = document.getElementById('notePdfBtnDesktop');
    
    [prevBtn, prevBtnDesktop].forEach(btn => {
        if (btn) btn.addEventListener('click', prevVideo);
    });
    
    [nextBtn, nextBtnDesktop].forEach(btn => {
        if (btn) btn.addEventListener('click', nextVideo);
    });
    
    [closeVideoBtn, closeVideoBtnDesktop].forEach(btn => {
        if (btn) btn.addEventListener('click', closeVideo);
    });
    
    [notePdfBtn, notePdfBtnDesktop].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                openNote(classesData[currentVideoIndex].noteLink);
            });
        }
    });
}

function startProgressUpdate() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (!player) return;
        
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const percentage = (currentTime / duration) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const timeDisplay = document.getElementById('timeDisplay');
        const timeDisplayDesktop = document.getElementById('timeDisplayDesktop');
        
        if (progressFill) progressFill.style.width = percentage + '%';
        
        const timeString = formatTime(currentTime) + ' / ' + formatTime(duration);
        if (timeDisplay) timeDisplay.textContent = timeString;
        if (timeDisplayDesktop) timeDisplayDesktop.textContent = timeString;
    }, 1000);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function optimizeQuality() {
    if (!player) return;
    
    setTimeout(() => {
        const availableQualities = player.getAvailableQualityLevels();
        let selectedQuality = 'large';
        
        if (availableQualities.includes('hd1080')) {
            selectedQuality = 'hd1080';
            updateQualityBadge('HD 1080p');
        } else if (availableQualities.includes('hd720')) {
            selectedQuality = 'hd720';
            updateQualityBadge('HD 720p');
        } else if (availableQualities.includes('large')) {
            selectedQuality = 'large';
            updateQualityBadge('HD 480p');
        }
        
        player.setPlaybackQuality(selectedQuality);
        
        // Continue checking quality every 5 seconds
        setTimeout(() => optimizeQuality(), 5000);
    }, 1000);
}

function updateQualityBadge(text) {
    const qualityBadge = document.getElementById('qualityBadge');
    if (qualityBadge) {
        qualityBadge.textContent = text;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (document.getElementById('video-player-container').classList.contains('hidden')) {
        return;
    }
    
    const currentPlayer = isDesktop ? playerDesktop : player;
    if (!currentPlayer) return;
    
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            if (currentPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                currentPlayer.pauseVideo();
            } else {
                currentPlayer.playVideo();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            const currentTime = currentPlayer.getCurrentTime();
            currentPlayer.seekTo(Math.max(0, currentTime - 10));
            break;
        case 'ArrowRight':
            e.preventDefault();
            const currentTimeRight = currentPlayer.getCurrentTime();
            const duration = currentPlayer.getDuration();
            currentPlayer.seekTo(Math.min(duration, currentTimeRight + 10));
            break;
        case 'KeyM':
            e.preventDefault();
            if (currentPlayer.isMuted()) {
                currentPlayer.unMute();
            } else {
                currentPlayer.mute();
            }
            break;
        case 'KeyF':
            e.preventDefault();
            const container = currentPlayer.getIframe().parentElement;
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
            break;
    }
});

// Prevent context menu on video
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.video-container')) {
        e.preventDefault();
    }
});

// Add smooth scrolling for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Enhanced Mobile Fullscreen with Orientation Support
function setupMobileFullscreen() {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) return;
    
    // Handle orientation change
    const handleOrientationChange = () => {
        const currentPlayer = isDesktop ? playerDesktop : player;
        if (!currentPlayer || document.getElementById('video-player-container').classList.contains('hidden')) {
            return;
        }
        
        setTimeout(() => {
            const orientation = screen.orientation?.type || 
                             (window.orientation === 90 || window.orientation === -90 ? 'landscape' : 'portrait');
            
            if (orientation.includes('landscape')) {
                // Auto-fullscreen on landscape rotation
                const videoContainer = currentPlayer.getIframe().parentElement;
                if (!document.fullscreenElement && videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen().catch(err => {
                        console.log('Fullscreen request failed:', err);
                    });
                }
            }
        }, 100);
    };
    
    // Listen for orientation changes
    if (screen.orientation) {
        screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
        window.addEventListener('orientationchange', handleOrientationChange);
    }
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => {
        const currentPlayer = isDesktop ? playerDesktop : player;
        if (!currentPlayer) return;
        
        const videoContainer = currentPlayer.getIframe().parentElement;
        if (document.fullscreenElement) {
            // Entering fullscreen
            videoContainer.style.position = 'fixed';
            videoContainer.style.top = '0';
            videoContainer.style.left = '0';
            videoContainer.style.width = '100vw';
            videoContainer.style.height = '100vh';
            videoContainer.style.zIndex = '9999';
        } else {
            // Exiting fullscreen
            videoContainer.style.position = '';
            videoContainer.style.top = '';
            videoContainer.style.left = '';
            videoContainer.style.width = '';
            videoContainer.style.height = '';
            videoContainer.style.zIndex = '';
        }
    });
}

// Initialize mobile fullscreen support
document.addEventListener('DOMContentLoaded', () => {
    setupMobileFullscreen();
});