// Zeroma Free - Typing Animation Script
class TypewriterEffect {
    constructor() {
        this.lines = [
            {
                text: "Wanna get free Classes of ACS and other platforms?",
                className: "hero-large font-highmount",
                delay: 1500
            },
            {
                text: "Invite Your friends. Share this page link to your friends to get Free Classes.",
                className: "body-large font-matey",
                delay: 1200
            },
            {
                text: "Full Free! No paid! High Quality Video.",
                className: "body-regular font-redgois",
                delay: 1000
            },
            {
                text: "Share and share and share. Otherwise free class won't be given.",
                className: "body-regular font-redgois",
                delay: 1000
            },
            {
                text: "Stay With Us. Share this page link to your friends.",
                className: "body-large font-matey",
                delay: 1000
            },
            {
                text: "At least Share this to your 10+ Friends. When you will fulfill our demand, we will add classes on this website!!!",
                className: "heading-1 font-highmount font-bold",
                delay: 800
            }
        ];
        
        this.container = document.getElementById('typing-container');
        this.ctaSection = document.getElementById('cta-section');
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        // Start typing after a brief delay
        setTimeout(() => {
            this.startTyping();
        }, 500);
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    async startTyping() {
        this.isTyping = true;
        
        for (let i = 0; i < this.lines.length; i++) {
            await this.typeLine(i);
            await this.delay(this.lines[i].delay);
        }
        
        // Show CTA section after all lines are typed
        this.showCTASection();
        this.isTyping = false;
    }
    
    async typeLine(lineIndex) {
        const line = this.lines[lineIndex];
        const lineElement = this.createLineElement(line.className, lineIndex);
        
        this.container.appendChild(lineElement);
        
        // Animate line appearance
        setTimeout(() => {
            lineElement.classList.add('show');
        }, 50);
        
        const textElement = lineElement.querySelector('.typing-text');
        
        // Type each character
        for (let charIndex = 0; charIndex < line.text.length; charIndex++) {
            textElement.textContent = line.text.substring(0, charIndex + 1);
            await this.delay(this.getTypingSpeed());
        }
        
        // Remove cursor from completed line
        textElement.classList.add('no-cursor');
        
        return Promise.resolve();
    }
    
    createLineElement(className, index) {
        const lineDiv = document.createElement('div');
        lineDiv.className = `typing-line ${className}`;
        lineDiv.setAttribute('data-line', index);
        
        const textSpan = document.createElement('span');
        textSpan.className = 'typing-text';
        
        lineDiv.appendChild(textSpan);
        
        return lineDiv;
    }
    
    getTypingSpeed() {
        // Variable typing speed for more natural effect
        return Math.random() * 80 + 30; // 30-110ms
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showCTASection() {
        setTimeout(() => {
            this.ctaSection.style.opacity = '1';
            this.ctaSection.style.transform = 'translateY(0)';
        }, 500);
    }
    
    initEventListeners() {
        // Share button functionality
        const shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', this.handleShare.bind(this));
        
        // Icon interactions
        this.initIconInteractions();
        
        // Mobile menu
        this.initMobileMenu();
        
        // Copy link functionality
        this.initCopyLink();
    }
    
    async handleShare() {
        const shareData = {
            title: 'Zeroma Free - Get Free Classes',
            text: 'Get exclusive free classes by sharing with friends. Premium quality education for everyone!',
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                this.showNotification('Link copied to clipboard!');
            }
        } catch (error) {
            console.log('Error sharing:', error);
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                this.showNotification('Link copied to clipboard!');
            } catch (clipboardError) {
                this.showNotification('Unable to share. Please copy link manually.');
            }
        }
    }
    
    initIconInteractions() {
        const icons = document.querySelectorAll('.group');
        
        icons.forEach((icon, index) => {
            icon.addEventListener('click', () => {
                switch(index) {
                    case 0: // Share
                        this.handleShare();
                        break;
                    case 1: // Copy Link
                        this.copyToClipboard();
                        break;
                    case 2: // Get Link
                        this.showCurrentURL();
                        break;
                    case 3: // Forward
                        this.openShareModal();
                        break;
                }
            });
        });
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showNotification('Link copied successfully!');
        } catch (error) {
            this.showNotification('Unable to copy link');
        }
    }
    
    showCurrentURL() {
        const url = window.location.href;
        this.showNotification(`Current URL: ${url}`, 3000);
    }
    
    openShareModal() {
        // Simple share functionality
        const message = encodeURIComponent('Check out Zeroma Free for exclusive classes: ' + window.location.href);
        const whatsappURL = `https://wa.me/?text=${message}`;
        window.open(whatsappURL, '_blank');
    }
    
    showNotification(message, duration = 2000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gray-900 text-white px-6 py-3 shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.style.borderRadius = '0px'; // Sharp edges following Aesop style
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
    
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
        });
        
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
        
        // Close menu when clicking outside
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
    
    initCopyLink() {
        // Add click handler for easy link copying
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'c' && !window.getSelection().toString()) {
                this.copyToClipboard();
            }
        });
    }
}

// Smooth scroll enhancement
class SmoothScrollEnhancer {
    constructor() {
        this.initSmoothScrolling();
    }
    
    initSmoothScrolling() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.initLazyLoading();
        this.initImageOptimization();
    }
    
    initLazyLoading() {
        // Lazy load images when they come into view
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    initImageOptimization() {
        // Preload critical resources
        const criticalResources = [
            // Add any critical images or fonts here
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypewriterEffect();
    new SmoothScrollEnhancer();
    new PerformanceOptimizer();
    
    // Add some entrance animations
    const animatedElements = document.querySelectorAll('.group, nav');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// PWA-like functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here for PWA functionality
        console.log('Static site ready for PWA enhancement');
    });
}
