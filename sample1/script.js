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
let playerDesktop = null;
let currentVideoIndex = 0;
let isDesktop = window.innerWidth > 768;

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
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

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
    cardsContainer.innerHTML = cardHTML;
    if (mobileCardsGrid) mobileCardsGrid.innerHTML = cardHTML;
    if (desktopCardsGrid) desktopCardsGrid.innerHTML = cardHTML;
}

function playVideo(index) {
    currentVideoIndex = index;
    const classItem = classesData[index];
    
    // Hide cards container and show video player
    document.getElementById('cards-container').classList.add('hidden');
    document.getElementById('video-player-container').classList.remove('hidden');
    
    // Set video title
    const videoTitle = document.getElementById('video-title');
    const videoTitleDesktop = document.getElementById('video-title-desktop');
    if (videoTitle) videoTitle.textContent = classItem.title;
    if (videoTitleDesktop) videoTitleDesktop.textContent = classItem.title;
    
    // Initialize YouTube player
    if (isDesktop) {
        initYouTubePlayerDesktop(classItem.videoId);
    } else {
        initYouTubePlayer(classItem.videoId);
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeVideo() {
    // Stop and destroy player
    if (player) {
        player.destroy();
        player = null;
    }
    if (playerDesktop) {
        playerDesktop.destroy();
        playerDesktop = null;
    }
    
    // Hide video player and show cards
    document.getElementById('video-player-container').classList.add('hidden');
    document.getElementById('cards-container').classList.remove('hidden');
    
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
    loadingSpinner.style.display = 'block';
    
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'showinfo': 0,
            'rel': 0,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'autohide': 0
        },
        events: {
            'onReady': (event) => onPlayerReady(event, 'mobile'),
            'onStateChange': (event) => onPlayerStateChange(event, 'mobile')
        }
    });
}

function initYouTubePlayerDesktop(videoId) {
    const loadingSpinner = document.getElementById('loadingSpinnerDesktop');
    loadingSpinner.style.display = 'block';
    
    playerDesktop = new YT.Player('youtube-player-desktop', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'controls': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'showinfo': 0,
            'rel': 0,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'autohide': 0
        },
        events: {
            'onReady': (event) => onPlayerReady(event, 'desktop'),
            'onStateChange': (event) => onPlayerStateChange(event, 'desktop')
        }
    });
}

function onPlayerReady(event, layout) {
    const suffix = layout === 'desktop' ? 'Desktop' : '';
    const currentPlayer = layout === 'desktop' ? playerDesktop : player;
    
    // Hide loading spinner
    document.getElementById(`loadingSpinner${suffix}`).style.display = 'none';
    
    // Show custom controls on mobile by adding class
    if (layout === 'mobile') {
        const videoContainer = document.querySelector('.video-container');
        videoContainer.classList.add('show-controls');
    }
    
    // Set up custom controls
    setupCustomControls(currentPlayer, layout);
    
    // Auto-optimize quality
    setTimeout(() => {
        optimizeQuality(currentPlayer, layout);
    }, 1000);
}

function onPlayerStateChange(event, layout) {
    const suffix = layout === 'desktop' ? 'Desktop' : '';
    const currentPlayer = layout === 'desktop' ? playerDesktop : player;
    
    if (event.data === YT.PlayerState.PLAYING) {
        document.getElementById(`playIcon${suffix}`).style.display = 'none';
        document.getElementById(`pauseIcon${suffix}`).style.display = 'block';
        startProgressUpdate(currentPlayer, layout);
    } else {
        document.getElementById(`playIcon${suffix}`).style.display = 'block';
        document.getElementById(`pauseIcon${suffix}`).style.display = 'none';
        stopProgressUpdate(layout);
    }
}

function setupCustomControls(currentPlayer, layout) {
    const suffix = layout === 'desktop' ? 'Desktop' : '';
    
    // Play/Pause button
    document.getElementById(`playPauseBtn${suffix}`).addEventListener('click', () => {
        if (currentPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            currentPlayer.pauseVideo();
        } else {
            currentPlayer.playVideo();
        }
    });
    
    // Skip buttons
    document.getElementById(`skipBackBtn${suffix}`).addEventListener('click', () => {
        const currentTime = currentPlayer.getCurrentTime();
        currentPlayer.seekTo(Math.max(0, currentTime - 10));
    });
    
    document.getElementById(`skipForwardBtn${suffix}`).addEventListener('click', () => {
        const currentTime = currentPlayer.getCurrentTime();
        const duration = currentPlayer.getDuration();
        currentPlayer.seekTo(Math.min(duration, currentTime + 10));
    });
    
    // Progress bar
    document.getElementById(`progressBar${suffix}`).addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const duration = currentPlayer.getDuration();
        currentPlayer.seekTo(duration * percent);
    });
    
    // Volume controls
    document.getElementById(`muteBtn${suffix}`).addEventListener('click', () => {
        if (currentPlayer.isMuted()) {
            currentPlayer.unMute();
            document.getElementById(`volumeIcon${suffix}`).style.display = 'block';
            document.getElementById(`muteIcon${suffix}`).style.display = 'none';
        } else {
            currentPlayer.mute();
            document.getElementById(`volumeIcon${suffix}`).style.display = 'none';
            document.getElementById(`muteIcon${suffix}`).style.display = 'block';
        }
    });
    
    document.getElementById(`volumeSlider${suffix}`).addEventListener('input', (e) => {
        currentPlayer.setVolume(e.target.value);
    });
    
    // Speed control
    document.getElementById(`speedBtn${suffix}`).addEventListener('click', () => {
        const dropdown = document.getElementById(`speedDropdown${suffix}`);
        dropdown.classList.toggle('show');
    });
    
    document.querySelectorAll(`#speedDropdown${suffix} .dropdown-item`).forEach(item => {
        item.addEventListener('click', (e) => {
            const speed = parseFloat(e.target.dataset.speed);
            currentPlayer.setPlaybackRate(speed);
            document.getElementById(`speedBtn${suffix}`).textContent = speed + 'x';
            document.getElementById(`speedDropdown${suffix}`).classList.remove('show');
        });
    });
    
    // Quality control
    document.getElementById(`qualityBtn${suffix}`).addEventListener('click', () => {
        const dropdown = document.getElementById(`qualityDropdown${suffix}`);
        dropdown.classList.toggle('show');
    });
    
    document.querySelectorAll(`#qualityDropdown${suffix} .dropdown-item`).forEach(item => {
        item.addEventListener('click', (e) => {
            const quality = e.target.dataset.quality;
            if (quality === 'auto') {
                optimizeQuality(currentPlayer, layout);
            } else {
                currentPlayer.setPlaybackQuality(quality);
            }
            document.getElementById(`qualityBtn${suffix}`).textContent = e.target.textContent;
            document.getElementById(`qualityDropdown${suffix}`).classList.remove('show');
        });
    });
    
    // Fullscreen
    document.getElementById(`fullscreenBtn${suffix}`).addEventListener('click', () => {
        const container = currentPlayer.getIframe().parentElement;
        if (container.requestFullscreen) {
            container.requestFullscreen();
        }
    });
    
    // Navigation buttons
    document.getElementById(`prevBtn${suffix}`).addEventListener('click', prevVideo);
    document.getElementById(`nextBtn${suffix}`).addEventListener('click', nextVideo);
    document.getElementById(`closeVideoBtn${suffix}`).addEventListener('click', closeVideo);
    
    // Note/PDF button
    document.getElementById(`notePdfBtn${suffix}`).addEventListener('click', () => {
        openNote(classesData[currentVideoIndex].noteLink);
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest(`#speedBtn${suffix}`) && !e.target.closest(`#qualityBtn${suffix}`)) {
            document.getElementById(`speedDropdown${suffix}`).classList.remove('show');
            document.getElementById(`qualityDropdown${suffix}`).classList.remove('show');
        }
    });
}

let progressInterval = null;

function startProgressUpdate(currentPlayer, layout) {
    const suffix = layout === 'desktop' ? 'Desktop' : '';
    
    progressInterval = setInterval(() => {
        const currentTime = currentPlayer.getCurrentTime();
        const duration = currentPlayer.getDuration();
        const percentage = (currentTime / duration) * 100;
        
        document.getElementById(`progressFill${suffix}`).style.width = percentage + '%';
        document.getElementById(`timeDisplay${suffix}`).textContent = 
            formatTime(currentTime) + ' / ' + formatTime(duration);
    }, 1000);
}

function stopProgressUpdate(layout) {
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

function optimizeQuality(currentPlayer, layout) {
    const suffix = layout === 'desktop' ? 'Desktop' : '';
    
    setTimeout(() => {
        const availableQualities = currentPlayer.getAvailableQualityLevels();
        let selectedQuality = 'large';
        
        if (availableQualities.includes('hd1080')) {
            selectedQuality = 'hd1080';
            document.getElementById(`qualityBadge${suffix}`).textContent = 'HD 1080p';
        } else if (availableQualities.includes('hd720')) {
            selectedQuality = 'hd720';
            document.getElementById(`qualityBadge${suffix}`).textContent = 'HD 720p';
        } else if (availableQualities.includes('large')) {
            selectedQuality = 'large';
            document.getElementById(`qualityBadge${suffix}`).textContent = 'HD 480p';
        }
        
        currentPlayer.setPlaybackQuality(selectedQuality);
        
        // Continue checking quality every 5 seconds
        setTimeout(() => optimizeQuality(currentPlayer, layout), 5000);
    }, 1000);
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