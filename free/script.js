// Preloader functionality
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // Add a small delay to ensure the animation is seen
    setTimeout(function() {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Remove from DOM after animation completes
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    }, 1000); // Show preloader for at least 1 second
});

// Show preloader when page is about to unload (for navigation)
window.addEventListener('beforeunload', function() {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '1';
    preloader.style.visibility = 'visible';
    preloader.style.display = 'flex';
});

const dataFileMap = {
    'all': 'videos.json',
    'bangla': 'bangla.json',
    'english': 'english.json',
    'math': 'math.json',
    'chemistry': 'chemistry.json',
    'physics': 'physics.json',
    'biology': 'biology.json',
    'ict': 'ict.json'
};

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const typingTextElement = document.getElementById('typing-text');
    const cursorElement = document.getElementById('cursor');
    const subjectButtons = document.querySelectorAll('.subject-filter-nav .list');
    const videoGridSection = document.getElementById('video-grid-section');
    const videoGrid = document.getElementById('video-grid');
    const videoModal = document.getElementById('video-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const structuredDataElement = document.getElementById('structured-data');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Navigation elements
    const navItems = document.querySelectorAll('.navigation .list');
    const pages = document.querySelectorAll('.page');
    const mainIndicator = document.querySelector('.navigation .indicator');
    const subjectIndicator = document.querySelector('.subject-indicator');

    // Typing animation messages
    const messages = [
        "Wanna get free Classes of ACS and other platforms?",
        "Invite Your friends. Share this page link to your friends to get Free Classes.",
        "Full Free! No paid! High Quality Video.",
        "Share and share and share. Otherwise free class won't be given.",
        "Stay With Us. Share this page link to your friends.",
        "At least Share this to your 10+ Friends."
    ];
    
    // Active subject state
    let activeSubject = null;
    
    // Initialize typing animation
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let deleteSpeed = 50;
    let pauseBetweenMessages = 2000;
    
    function type() {
        const currentMessage = messages[messageIndex];
        
        if (isDeleting) {
            // Delete text
            typingTextElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = deleteSpeed;
        } else {
            // Type text
            typingTextElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = charIndex % 4 === 0 ? 150 : 100; // Randomize speed slightly
        }
        
        // Check if current message is complete
        if (!isDeleting && charIndex === currentMessage.length) {
            typingSpeed = pauseBetweenMessages;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex++;
            if (messageIndex === messages.length) messageIndex = 0;
            typingSpeed = 500; // Pause before starting next message
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start the typing animation
    setTimeout(type, 1000);
    
    // Theme toggle functionality
    function toggleTheme() {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeButtonIcon(isDarkMode);
        updateIndicatorBorder();
    }

    function updateIndicatorBorder() {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const navIndicator = document.querySelector('.navigation .indicator');
        const subjectIndicator = document.querySelector('.subject-indicator');
        const newColor = isDarkMode ? '#0D1117' : '#F4F0E0';
        navIndicator.style.borderColor = newColor;
        navIndicator.style.boxShadow = `1px -10px 0 0 ${newColor}, -1px -10px 0 0 ${newColor}`;
        
        subjectIndicator.style.borderColor = newColor;
        subjectIndicator.style.boxShadow = `1px -10px 0 0 ${newColor}, -1px -10px 0 0 ${newColor}`;
    }

    function updateThemeButtonIcon(isDarkMode) {
        const icon = themeToggleBtn.querySelector('svg');
        if (isDarkMode) {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
        } else {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
        }
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        updateThemeButtonIcon(true);
    }
    
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Fetch video data from JSON files
    async function fetchVideos(subject) {
        const fileName = dataFileMap[subject];
        if (!fileName) {
            console.error('Invalid subject provided:', subject);
            return [];
        }
        
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${fileName}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    }

    // Initialize Intersection Observer for lazy loading
    const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const maxResSrc = `https://i.ytimg.com/vi/${img.dataset.videoId}/maxresdefault.jpg`;
                const hqDefaultSrc = `https://i.ytimg.com/vi/${img.dataset.videoId}/hqdefault.jpg`;
                
                const testImage = new Image();
                testImage.onload = function() {
                    if (this.naturalWidth > 120) {
                        img.src = maxResSrc;
                    } else {
                        img.src = hqDefaultSrc;
                    }
                    img.removeAttribute('data-video-id');
                };
                testImage.onerror = function() {
                    img.src = hqDefaultSrc;
                    img.removeAttribute('data-video-id');
                };
                testImage.src = maxResSrc;
                
                lazyLoadObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '200px 0px',
        threshold: 0
    });
    
    // Subject filter functionality
    subjectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const subject = this.dataset.subject;
            
            subjectButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            filterVideosBySubject(subject);
            activeSubject = subject;
            updateSubjectIndicator(this);
        });
    });
    
    // Filter videos by subject
    async function filterVideosBySubject(subject) {
        videoGrid.innerHTML = '';
        
        const videos = await fetchVideos(subject);
        
        updateStructuredData(videos);
        
        if (videos.length === 0) {
            videoGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="font-redgois text-primary-light dark:text-text-dark text-lg">No videos found for this subject. Please check back later.</p>
                </div>
            `;
            return;
        }
        
        videos.forEach((video, index) => {
            const videoCard = createVideoCard(video, index + 1);
            videoGrid.appendChild(videoCard);
            
            const thumbnailImg = videoCard.querySelector('img[data-video-id]');
            if (thumbnailImg) {
                lazyLoadObserver.observe(thumbnailImg);
            }
        });
    }
    
    // Create video card HTML
    function createVideoCard(video, serialNumber) {
        const card = document.createElement('article');
        card.className = 'video-card bg-white dark:bg-secondary-dark rounded-xl overflow-hidden transition-colors duration-500';
        card.innerHTML = `
            <div class="relative">
                <span class="absolute top-2 left-2 bg-primary-light dark:bg-accent-dark text-white rounded-full w-8 h-8 flex items-center justify-center font-redgois text-sm z-10">${serialNumber}</span>
                <a href="https://www.youtube.com/watch?v=${video.youtubeId}" aria-label="Watch ${video.title}" class="block">
                    <figure class="relative">
                        <picture>
                            <source srcset="https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg" media="(min-width: 1280px)">
                            <img data-video-id="${video.youtubeId}" 
                                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180' fill='%23ddd'%3E%3Crect width='320' height='180' fill='%23f5f5f5'/%3E%3Cpath d='M120 70L200 120L120 170Z' fill='%2392400e'/%3E%3C/svg%3E"
                                 alt="${video.title} YouTube thumbnail" 
                                 class="w-full h-48 object-cover" loading="lazy"
                                 onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg'">
                        </picture>
                        <noscript>
                            <a href="https://www.youtube.com/watch?v=${video.youtubeId}">
                                <img src="https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg" 
                                     alt="${video.title} YouTube thumbnail" 
                                     class="w-full h-48 object-cover">
                            </a>
                        </noscript>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="play-button bg-primary-light dark:bg-accent-dark bg-opacity-80 rounded-full p-3 transition-colors duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </figure>
                    <div class="p-4">
                        <h3 class="font-matey text-primary-light dark:text-text-dark font-semibold mb-2 text-lg transition-colors duration-500">${video.title}</h3>
                        <p class="font-redgois text-sm text-primary-light dark:text-text-dark mb-4 transition-colors duration-500">${video.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="inline-flex items-center font-redgois text-xs text-primary-light dark:text-text-dark transition-colors duration-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                </svg>
                                ${video.duration}
                            </span>
                            <span class="px-3 py-1 bg-secondary-light dark:bg-secondary-dark text-primary-light dark:text-text-dark rounded-full font-redgois text-xs transition-colors duration-500">${video.category}</span>
                        </div>
                    </div>
                </a>
                <div class="px-4 pb-4">
                    <div class="video-summary" id="summary-${video.id}">
                        <p class="font-redgois text-sm text-primary-light dark:text-text-dark mt-2 transition-colors duration-500">${video.summary}</p>
                    </div>
                    <div class="toggle-summary font-redgois text-xs text-primary-light dark:text-text-dark mt-2 transition-colors duration-500" data-target="summary-${video.id}">
                        <span>Show summary</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div class="px-4 pb-4 flex gap-2">
                    <a href="https://www.youtube.com/watch?v=${video.youtubeId}" class="flex-grow py-2 bg-primary-light dark:bg-accent-dark hover:bg-primary-light/80 text-white text-center rounded-lg font-matey transition-colors" aria-label="Watch ${video.title} on YouTube">
                        Watch Now
                    </a>
                    <button class="play-in-site py-2 px-4 bg-accent-light dark:bg-accent-dark hover:bg-accent-light/80 text-white rounded-lg font-matey transition-colors" 
                            data-video-id="${video.youtubeId}" data-video-title="${video.title}" aria-label="Play ${video.title} on this site">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for summary toggle
        const toggleSummary = card.querySelector('.toggle-summary');
        toggleSummary.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const summary = card.querySelector(`#${targetId}`);
            const isExpanded = summary.classList.contains('expanded');
            
            if (isExpanded) {
                summary.classList.remove('expanded');
                this.querySelector('span').textContent = 'Show summary';
                this.querySelector('svg').style.transform = 'rotate(0deg)';
            } else {
                summary.classList.add('expanded');
                this.querySelector('span').textContent = 'Hide summary';
                this.querySelector('svg').style.transform = 'rotate(180deg)';
            }
        });
        
        // Add event listener for "Play in site" button
        const playInSiteBtn = card.querySelector('.play-in-site');
        playInSiteBtn.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            const videoTitle = this.getAttribute('data-video-title');
            openVideoModal(videoId, videoTitle);
        });
        
        return card;
    }
    
    // Update structured data
    function updateStructuredData(videos) {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": videos.map((video, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "VideoObject",
                    "name": video.title,
                    "description": video.description,
                    "thumbnailUrl": [
                        `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
                        `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
                    ],
                    "uploadDate": video.uploadDate,
                    "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`
                }
            }))
        };
        
        structuredDataElement.textContent = JSON.stringify(structuredData);
    }
    
    // Open video modal
    function openVideoModal(videoId, videoTitle) {
        modalTitle.textContent = videoTitle;
        videoPlayerContainer.innerHTML = `
            <iframe width="100%" height="100%" src="about:blank" data-src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen loading="lazy" class="w-full h-full"></iframe>
        `;
        
        const iframe = videoPlayerContainer.querySelector('iframe');
        iframe.src = iframe.dataset.src;
        
        videoModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => closeModal.focus(), 100);
    }
    
    // Close video modal
    function closeVideoModal() {
        videoModal.classList.remove('open');
        document.body.style.overflow = '';
        
        const iframe = videoPlayerContainer.querySelector('iframe');
        if (iframe) {
            iframe.src = 'about:blank';
        }
    }
    
    // Event listeners for modal
    closeModal.addEventListener('click', closeVideoModal);
    
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('open')) {
            closeVideoModal();
        }
    });
    
    // Navigation functionality
    function changePage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(pageId).classList.add('active');
        
        if (pageId === 'classes-page' && activeSubject === null) {
            filterVideosBySubject('all');
        }
    }

    function updateMainIndicator(target) {
        const indicator = document.querySelector('.navigation .indicator');
        const navRect = document.querySelector('.navigation ul').getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const indicatorLeft = targetRect.left - navRect.left + (targetRect.width / 2) - (indicator.offsetWidth / 2);
        indicator.style.transform = `translateX(${indicatorLeft}px)`;
    }

    function updateSubjectIndicator(target) {
        const indicator = document.querySelector('.subject-indicator');
        const navRect = document.querySelector('.subject-filter-nav').getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const indicatorLeft = targetRect.left - navRect.left + (targetRect.width / 2) - (indicator.offsetWidth / 2);
        indicator.style.transform = `translateX(${indicatorLeft}px)`;
    }

    // Add click event listeners to main navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
            
            changePage(pageId);
            updateMainIndicator(this);
        });
    });

    // Initialize navigation and indicators
    const activeNav = document.querySelector('.navigation .list.active');
    if(activeNav) {
        updateMainIndicator(activeNav);
    }

    const activeSubjectButton = document.querySelector('.subject-filter-nav .list.active');
    if(activeSubjectButton) {
        updateSubjectIndicator(activeSubjectButton);
    }
    
    // Initialize classes page with videos when page loads
    filterVideosBySubject('all');
});