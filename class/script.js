// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Global Variables
let isDark = false;
let isScrolled = false;
let mockClasses = [];
let filteredClasses = [];
let selectedGrades = ['All Grade/Level'];
let selectedCourse = 'All Course';
let selectedSubjects = ['All Subject'];
let observer;
let currentUser = null;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.getElementById('header');
const coursesGrid = document.getElementById('coursesGrid');

// Initialize App
function initApp() {
    // Initialize Firebase first
    initializeFirebase();

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }

    // Start typing animation
    startTypingAnimation();

    // Load classes data
    loadClasses();

    // Generate footer particles
    generateFooterParticles();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize event listeners
    initEventListeners();
}

// Firebase Configuration and Authentication
async function initializeFirebase() {
    try {
        // Import Firebase SDKs
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
        const { getAuth, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
        const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');

        // Firebase configuration - User's provided config
        const firebaseConfig = {
            apiKey: "AIzaSyDE3NgCRddjLGL_dfd3eHREqngfDwUNpXo",
            authDomain: "course-auth-f4165.firebaseapp.com",
            projectId: "course-auth-f4165",
            storageBucket: "course-auth-f4165.firebasestorage.app",
            messagingSenderId: "287739198986",
            appId: "1:287739198986:web:9c32348cad210c15b4e9f3"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Make auth and db available globally
        window.firebaseAuth = auth;
        window.firebaseDb = db;

        // Auth state observer
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is signed in:', user.email);
                currentUser = user;
                updateUserInterface(user);
                // Check user access to classes
                checkUserAccess(user.email);
            } else {
                console.log('User is signed out');
                currentUser = null;
                redirectToLogin();
            }
        });

    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showAuthAlert('Failed to initialize authentication. Please refresh the page.', 'error');
    }
}

// Check if user has access to classes
async function checkUserAccess(userEmail) {
    try {
        if (!window.firebaseDb) {
            throw new Error('Database not initialized');
        }

        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');
        const docRef = doc(window.firebaseDb, 'whitelist', userEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            let accessArray = [];

            if (userData && userData.access) {
                if (Array.isArray(userData.access)) {
                    accessArray = userData.access;
                } else if (typeof userData.access === 'string') {
                    accessArray = userData.access.split(',').map(s => s.trim());
                }
            }

            if (accessArray.length > 0) {
                console.log('User has access to:', accessArray);
                showAuthAlert(`Welcome! You have access to: ${accessArray.join(', ')}`, 'success');
                // Filter classes based on user access
                filterClassesByAccess(accessArray);
                return accessArray;
            } else {
                showAuthAlert('You do not have access to any classes. Please contact administrator.', 'error');
                setTimeout(() => redirectToLogin(), 3000);
                return [];
            }
        } else {
            showAuthAlert('Your email is not authorized. Please contact administrator.', 'error');
            setTimeout(() => redirectToLogin(), 3000);
            return [];
        }
    } catch (error) {
        console.error('Error checking user access:', error);
        showAuthAlert('Error verifying access. Please try again.', 'error');
        return [];
    }
}

// Filter classes based on user access
function filterClassesByAccess(accessArray) {
    // This function can be customized based on how you want to match access with classes
    // For now, showing all classes as the access control is handled by the class links
    filteredClasses = [...mockClasses];
    renderClasses();
}

// Update user interface when logged in
function updateUserInterface(user) {
    // Update login buttons to show user info
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(btn => {
        btn.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/32'}" alt="User" class="w-6 h-6 rounded-full mr-2">
            <span class="truncate">${user.displayName || user.email}</span>
        `;
        btn.onclick = showUserMenu;
        btn.classList.add('user-logged-in');
    });

    // Add logout functionality
    addLogoutMenu();
}

// Show user menu
function showUserMenu() {
    if (currentUser) {
        const userMenu = `
            <div id="userMenu" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
                    <div class="text-center mb-6">
                        <img src="${currentUser.photoURL || 'https://via.placeholder.com/64'}" alt="User" class="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-amber-200">
                        <h3 class="font-display font-semibold text-xl text-gray-800">${currentUser.displayName || 'User'}</h3>
                        <p class="text-gray-600 text-sm mt-1">${currentUser.email}</p>
                    </div>
                    <div class="space-y-3">
                        <button onclick="handleLogout()" class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium">
                            Logout
                        </button>
                        <button onclick="closeUserMenu()" class="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', userMenu);
    }
}

// Close user menu
function closeUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.remove();
    }
}

// Handle logout
async function handleLogout() {
    try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
        await signOut(window.firebaseAuth);
        showAuthAlert('Logged out successfully', 'success');
        closeUserMenu();
    } catch (error) {
        console.error('Error signing out:', error);
        showAuthAlert('Error logging out', 'error');
    }
}

// Add logout menu
function addLogoutMenu() {
    // This function can be expanded to add more user-specific UI elements
    console.log('User interface updated for authenticated user');
}

// Redirect to login page
function redirectToLogin() {
    showAuthAlert('Please login to access the class portal', 'info');
    setTimeout(() => {
        window.location.href = 'https://zeromapremium.github.io/webapp/login';
    }, 2000);
}

// Show authentication alerts
function showAuthAlert(message, type = 'info') {
    // Remove existing alert
    const existingAlert = document.getElementById('authAlert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const alertIcons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    const alert = document.createElement('div');
    alert.id = 'authAlert';
    alert.className = `fixed top-20 right-4 ${alertColors[type]} text-white p-4 rounded-xl shadow-lg z-50 max-w-sm transform transition-all duration-300 translate-x-full`;
    alert.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="text-xl">${alertIcons[type]}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(alert);

    // Animate in
    setTimeout(() => {
        alert.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.classList.add('translate-x-full');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

// Typing Animation
function startTypingAnimation() {
    const text = "Welcome to Premium's Class Portal";
    const typingElement = document.getElementById('typingText');
    const cursor = document.getElementById('cursor');

    if (!typingElement) return;

    let index = 0;

    function typeCharacter() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            setTimeout(typeCharacter, 100);
        } else {
            // Start cursor blinking after typing is complete
            if (cursor) {
                cursor.style.animation = 'cursorBlink 1s ease-in-out infinite';
            }
        }
    }

    // Start typing after a short delay
    setTimeout(typeCharacter, 500);
}

// Load classes from data structure
async function loadClasses() {
    try {
        // Class data structure with your specified classes
        mockClasses = [
            {
                id: 1,
                title: "ACS Physics HSC 27 By Apurbo Mashrur Apar (Cycle-1)",
                subject: "Physics",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/1",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 2,
                title: "ACS Physics HSC 27 By Apurbo Mashrur Apar (Cycle-2)",
                subject: "Physics",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/2",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 3,
                title: "ACS Physics HSC 27 By Apurbo Mashrur Apar (Cycle-3)",
                subject: "Physics",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/3",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 4,
                title: "ACS HSC 27 Higher Math Academic (Cycle-1)",
                subject: "Mathematics",
                grade: "HSC 27",  
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/4",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 5,
                title: "ACS HSC 27 Chemistry by Mottasin Pahlovi (Cycle-1)",
                subject: "Chemistry",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/5",
                image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 6,
                title: "ACS Biology Cycle for HSC 27 by DMC Dreamers(Cycle-1)",
                subject: "Biology",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/6",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 7,
                title: "BIOLOGY HATERS BIOLOGY Cycle -1",
                subject: "Biology",
                grade: "HSC 27",
                courseType: "Biology Haters",
                link: "https://wakilbd.github.io/ps/class/7",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 8,
                title: "ACS ICT BATCH DECODER HSC 27",
                subject: "ICT",
                grade: "HSC 27",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/8",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 9,
                title: "ACS Higher Math 1st Paper (HSC 26) (Cycle-1)",
                subject: "Mathematics",
                grade: "HSC 26",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/9",
                image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 10,
                title: "ACS Physics HSC 26 By Apurbo Mashrur Apar (Cycle-1)",
                subject: "Physics",
                grade: "HSC 26",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/10",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 11,
                title: "HSC'26 (বাংলা ১ম পত্র সম্পূর্ণ)- ACS",
                subject: "Bangla",
                grade: "HSC 26",
                courseType: "ACS",
                link: "https://wakilbd.github.io/ps/class/11",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 12,
                title: "ALPHA 6 Medical Admission Full Course",
                subject: "Biology",
                grade: "Admission 25",
                courseType: "Battle of Biology",
                link: "https://wakilbd.github.io/ps/class/12",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 13,
                title: "প্রত্যাবর্তন ৪.০ সম্পূর্ণ - Admission 2024/25",
                subject: "Physics",
                grade: "Admission 25",
                courseType: "Physics Hunters",
                link: "https://wakilbd.github.io/ps/class/13",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 14,
                title: "দ্রুত প্রয়াস 5.0s Restart ( 2nd Timer Medical Batch )",
                subject: "Physics",
                grade: "Admission 25",
                courseType: "RTDS",
                link: "https://wakilbd.github.io/ps/class/14",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            },
            {
                id: 15,
                title: "Target DU 5.0",
                subject: "Physics",
                grade: "Admission 25",
                courseType: "Bondi Pathshala",
                link: "https://wakilbd.github.io/ps/class/15",
                image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            }
        ];

        filteredClasses = [...mockClasses];

        // Simulate loading delay
        setTimeout(() => {
            renderClasses();
        }, 1000);
    } catch (error) {
        console.error('Error loading classes:', error);
        if (coursesGrid) {
            coursesGrid.innerHTML = '<div class="loading">Error loading classes. Please try again later.</div>';
        }
    }
}

// Theme Toggle
function toggleTheme() {
    isDark = !isDark;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Update theme toggle icon
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Update mobile menu toggle color
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        if (isDark) {
            mobileMenuToggle.classList.add('text-gray-300', 'hover:text-white', 'hover:bg-gray-800');
            mobileMenuToggle.classList.remove('hover:bg-gray-100');
        } else {
            mobileMenuToggle.classList.add('hover:bg-gray-100');
            mobileMenuToggle.classList.remove('text-gray-300', 'hover:text-white', 'hover:bg-gray-800');
        }
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    if (!mobileMenu || !mobileMenuToggle) return;

    const isOpen = !mobileMenu.classList.contains('hidden');

    if (isOpen) {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.querySelector('i')?.setAttribute('data-lucide', 'menu');
    } else {
        mobileMenu.classList.remove('hidden');
        mobileMenuToggle.querySelector('i')?.setAttribute('data-lucide', 'x');
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Header Scroll Effect
function handleScroll() {
    if (!header) return;

    const scrollY = window.scrollY;
    const newIsScrolled = scrollY > 50;

    if (newIsScrolled !== isScrolled) {
        isScrolled = newIsScrolled;

        if (isScrolled) {
            header.className = `fixed w-full top-0 z-50 transition-all duration-300 ${
                isDark
                    ? 'bg-gray-900/95 glass-effect border-b border-amber-500/20 shadow-2xl shadow-amber-500/10'
                    : 'bg-white/95 glass-effect border-b border-custom-warm/50 shadow-2xl'
            }`;
        } else {
            header.className = 'fixed w-full top-0 z-50 transition-all duration-300 bg-transparent';
        }
    }
}

// Check if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Function to toggle dropdown - modified for mobile popup
function toggleDropdown(type) {
    if (isMobile()) {
        const popup = document.getElementById(type + 'Popup');
        if (popup) {
            popup.classList.add('active');
            updatePopupSelections(type);
        }
    } else {
        const dropdown = document.getElementById(type + 'Dropdown');
        if (!dropdown) return;

        const button = dropdown.previousElementSibling;
        const arrow = button?.querySelector('.dropdown-arrow');

        // Close other dropdowns
        const dropdownTypes = ['grade', 'course', 'subject'];
        dropdownTypes.forEach(otherType => {
            if (otherType !== type) {
                const otherDropdown = document.getElementById(otherType + 'Dropdown');
                if (otherDropdown) {
                    const otherButton = otherDropdown.previousElementSibling;
                    const otherArrow = otherButton?.querySelector('.dropdown-arrow');
                    otherDropdown.classList.remove('active');
                    otherButton?.classList.remove('active');
                    otherArrow?.classList.remove('rotated');
                }
            }
        });

        // Toggle current
        dropdown.classList.toggle('active');
        button?.classList.toggle('active');
        arrow?.classList.toggle('rotated');
    }
}

// Function to close popup
function closePopup(type) {
    const popup = document.getElementById(type + 'Popup');
    if (popup) {
        popup.classList.remove('active');
    }
}

// Function to update popup selections
function updatePopupSelections(type) {
    const popup = document.getElementById(type + 'Popup');
    if (!popup) return;

    const items = popup.querySelectorAll('.popup-item');
    let currentSelections;
    if (type === 'grade') currentSelections = selectedGrades;
    else if (type === 'course') currentSelections = [selectedCourse];
    else if (type === 'subject') currentSelections = selectedSubjects;

    items.forEach(item => {
        item.classList.remove('selected');
        if (currentSelections && currentSelections.includes(item.textContent)) {
            item.classList.add('selected');
        }
    });
}

// Selection functions for mobile popups
function selectGradeFromPopup(grade) {
    if (grade === 'All Grade/Level') {
        selectedGrades = ['All Grade/Level'];
    } else {
        if (selectedGrades.includes('All Grade/Level')) {
            selectedGrades = selectedGrades.filter(g => g !== 'All Grade/Level');
        }
        if (selectedGrades.includes(grade)) {
            selectedGrades = selectedGrades.filter(g => g !== grade);
            if (selectedGrades.length === 0) {
                selectedGrades = ['All Grade/Level'];
            }
        } else {
            selectedGrades.push(grade);
        }
    }
    updateGradeDisplay();
    closePopup('grade');
    filterClasses();
}

function selectCourseFromPopup(course) {
    selectedCourse = course;
    updateCourseDisplay();
    closePopup('course');
    filterClasses();
}

function selectSubjectFromPopup(subject) {
    if (subject === 'All Subject') {
        selectedSubjects = ['All Subject'];
    } else {
        if (selectedSubjects.includes('All Subject')) {
            selectedSubjects = selectedSubjects.filter(s => s !== 'All Subject');
        }
        if (selectedSubjects.includes(subject)) {
            selectedSubjects = selectedSubjects.filter(s => s !== subject);
            if (selectedSubjects.length === 0) {
                selectedSubjects = ['All Subject'];
            }
        } else {
            selectedSubjects.push(subject);
        }
    }
    updateSubjectDisplay();
    closePopup('subject');
    filterClasses();
}

// Desktop selection functions
function selectGrade(grade) {
    if (grade === 'All Grade/Level') {
        selectedGrades = ['All Grade/Level'];
    } else {
        if (selectedGrades.includes('All Grade/Level')) {
            selectedGrades = selectedGrades.filter(g => g !== 'All Grade/Level');
        }
        if (selectedGrades.includes(grade)) {
            selectedGrades = selectedGrades.filter(g => g !== grade);
            if (selectedGrades.length === 0) {
                selectedGrades = ['All Grade/Level'];
            }
        } else {
            selectedGrades.push(grade);
        }
    }
    updateGradeDisplay();
    closeDropdown('gradeDropdown');
    updateSelectedDropdownItems('#gradeDropdown');
    filterClasses();
}

function selectCourse(course) {
    selectedCourse = course;
    updateCourseDisplay();
    closeDropdown('courseDropdown');
    updateSelectedDropdownItem('#courseDropdown', course);
    filterClasses();
}

function selectSubject(subject) {
    if (subject === 'All Subject') {
        selectedSubjects = ['All Subject'];
    } else {
        if (selectedSubjects.includes('All Subject')) {
            selectedSubjects = selectedSubjects.filter(s => s !== 'All Subject');
        }
        if (selectedSubjects.includes(subject)) {
            selectedSubjects = selectedSubjects.filter(s => s !== subject);
            if (selectedSubjects.length === 0) {
                selectedSubjects = ['All Subject'];
            }
        } else {
            selectedSubjects.push(subject);
        }
    }
    updateSubjectDisplay();
    closeDropdown('subjectDropdown');
    updateSelectedDropdownItems('#subjectDropdown');
    filterClasses();
}

// Helper functions to update display
function updateGradeDisplay() {
    const displayText = selectedGrades.includes('All Grade/Level') ? 'All Grade/Level' : selectedGrades.join(', ');
    const gradeSelected = document.getElementById('gradeSelected');
    const gradeSelectedMobile = document.getElementById('gradeSelectedMobile');
    if (gradeSelected) gradeSelected.textContent = displayText;
    if (gradeSelectedMobile) gradeSelectedMobile.textContent = displayText;
}

function updateCourseDisplay() {
    const courseSelected = document.getElementById('courseSelected');
    const courseSelectedMobile = document.getElementById('courseSelectedMobile');
    if (courseSelected) courseSelected.textContent = selectedCourse;  
    if (courseSelectedMobile) courseSelectedMobile.textContent = selectedCourse;
}

function updateSubjectDisplay() {
    const displayText = selectedSubjects.includes('All Subject') ? 'All Subject' : selectedSubjects.join(', ');
    const subjectSelected = document.getElementById('subjectSelected');
    const subjectSelectedMobile = document.getElementById('subjectSelectedMobile');
    if (subjectSelected) subjectSelected.textContent = displayText;
    if (subjectSelectedMobile) subjectSelectedMobile.textContent = displayText;
}

// Utility functions
function closeDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    dropdown.classList.remove('active');
    const button = dropdown.previousElementSibling;
    button?.classList.remove('active');
    button?.querySelector('.dropdown-arrow')?.classList.remove('rotated');
}

function updateSelectedDropdownItem(selector, value) {
    const items = document.querySelectorAll(`${selector} .dropdown-item`);
    items.forEach(item => {
        item.classList.remove('selected');
        if (item.textContent === value) {
            item.classList.add('selected');
        }
    });
}

function updateSelectedDropdownItems(selector) {
    const items = document.querySelectorAll(`${selector} .dropdown-item`);
    items.forEach(item => {
        item.classList.remove('selected');
        let currentSelections;
        if (selector.includes('grade')) currentSelections = selectedGrades;
        else if (selector.includes('subject')) currentSelections = selectedSubjects;

        if (currentSelections && currentSelections.includes(item.textContent)) {
            item.classList.add('selected');
        }
    });
}

// Filter classes function
function filterClasses() {
    let filtered = [...mockClasses];

    // Grade filtering
    if (!selectedGrades.includes('All Grade/Level')) {
        filtered = filtered.filter(classItem => selectedGrades.includes(classItem.grade));
    }

    // CourseType filtering
    if (selectedCourse !== 'All Course') {
        filtered = filtered.filter(classItem => classItem.courseType === selectedCourse);
    }

    // Subject filtering
    if (!selectedSubjects.includes('All Subject')) {
        filtered = filtered.filter(classItem => selectedSubjects.includes(classItem.subject));
    }

    filteredClasses = filtered;
    renderClasses();
}

// Function to create class card
function createClassCard(classItem) {
    const defaultImage = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
    
    return `
        <div class="course-card">
            <img
                class="course-image"
                src="${classItem.image || defaultImage}"
                alt="${classItem.title}"
                loading="lazy"
                onerror="this.src='${defaultImage}'"
            />
            <div class="course-content">
                <div class="course-category">${classItem.subject}</div>
                <h3 class="course-title">${classItem.title}</h3>
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-graduation-cap meta-icon"></i>
                        <span>${classItem.grade}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-bookmark meta-icon"></i>
                        <span>${classItem.courseType}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-book meta-icon"></i>
                        <span>${classItem.subject}</span>
                    </div>
                </div>
                <div class="course-footer">
                    <button class="enroll-btn" onclick="enrollInClass(${classItem.id})">
                        Visit Class Page
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to render classes
function renderClasses() {
    if (!coursesGrid) return;

    if (filteredClasses.length === 0) {
        coursesGrid.innerHTML = '<div class="loading">No classes found for the selected filters.</div>';
        return;
    }

    const classesHTML = filteredClasses.map(classItem => createClassCard(classItem)).join('');
    coursesGrid.innerHTML = classesHTML;
}

// Function to handle class enrollment
function enrollInClass(classId) {
    // Check if user is authenticated
    if (!currentUser) {
        showAuthAlert('Please login to join classes', 'error');
        redirectToLogin();
        return;
    }

    const classItem = mockClasses.find(c => c.id === classId);
    if (classItem && classItem.link) {
        showAuthAlert(`Opening ${classItem.title}...`, 'success');
        setTimeout(() => {
            window.open(classItem.link, '_blank');
        }, 1000);
    } else {
        showAuthAlert("No link provided for this class.", 'error');
    }
}

// Generate Footer Particles
function generateFooterParticles() {
    const container = document.getElementById('footerParticles');
    if (!container) return;

    const particles = 20;

    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        const colors = ['bg-amber-400', 'bg-orange-400', 'bg-yellow-400', 'bg-red-400'];

        particle.className = `absolute w-1 h-1 rounded-full animate-float opacity-30 ${colors[i % colors.length]}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 3 + 4}s`;

        container.appendChild(particle);
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe fade-in elements
    document.querySelectorAll('.fade-in-element').forEach(element => {
        scrollObserver.observe(element);
    });
}

// Event Listeners
function initEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Scroll handling
    window.addEventListener('scroll', handleScroll);

    // Button click effects
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Scale animation
            if (!this.id.includes('Toggle')) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    // Updated auth button actions - now handled by Firebase
    document.querySelectorAll('.login-btn').forEach(btn => {
        if (!btn.classList.contains('user-logged-in')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentUser) {
                    redirectToLogin();
                }
            });
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenuToggle) {
            if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        }
    });

    // Close dropdowns when clicking outside (desktop only)
    document.addEventListener('click', function(e) {
        if (!isMobile()) {
            const dropdowns = document.querySelectorAll('.filter-dropdown');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    const menu = dropdown.querySelector('.dropdown-menu');
                    const button = dropdown.querySelector('.dropdown-button');
                    const arrow = dropdown.querySelector('.dropdown-arrow');
                    if (menu && button && arrow) {
                        menu.classList.remove('active');
                        button.classList.remove('active');
                        arrow.classList.remove('rotated');
                    }
                }
            });
        }
    });

    // Close popups when clicking outside (mobile only)
    document.addEventListener('click', function(e) {
        if (isMobile()) {
            const gradePopup = document.getElementById('gradePopup');
            const coursePopup = document.getElementById('coursePopup');
            const subjectPopup = document.getElementById('subjectPopup');

            if (gradePopup && gradePopup.classList.contains('active') && e.target === gradePopup) {
                closePopup('grade');
            }
            if (coursePopup && coursePopup.classList.contains('active') && e.target === coursePopup) {
                closePopup('course');
            }
            if (subjectPopup && subjectPopup.classList.contains('active') && e.target === subjectPopup) {
                closePopup('subject');
            }
        }
    });

    // Contact info interactions
    document.querySelectorAll('.group').forEach(group => {
        const phoneIcon = group.querySelector('[data-lucide="phone"]');
        const mailIcon = group.querySelector('[data-lucide="mail"]');
        const mapIcon = group.querySelector('[data-lucide="map-pin"]');

        if (phoneIcon) {
            group.addEventListener('click', () => {
                showAuthAlert('Phone: +880 1234-567890', 'info');
            });
            group.style.cursor = 'pointer';
        }

        if (mailIcon) {
            group.addEventListener('click', () => {
                window.location.href = 'mailto:help.infodesk.premium@gmail.com';
            });
            group.style.cursor = 'pointer';
        }

        if (mapIcon) {
            group.addEventListener('click', () => {
                showAuthAlert('Location: Dhaka, Bangladesh', 'info');
            });
            group.style.cursor = 'pointer';
        }
    });

    // Initialize dropdown selections
    setTimeout(() => {
        updateSelectedDropdownItems('#gradeDropdown');
        updateSelectedDropdownItems('#subjectDropdown');

        // Initialize course dropdown
        document.querySelectorAll('#courseDropdown .dropdown-item').forEach(item => {
            if (item.textContent === 'All Course') {
                item.classList.add('selected');
            }
        });
    }, 100);
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

// Window resize handling
window.addEventListener('resize', function() {
    // Re-render on resize if needed
    if (filteredClasses.length > 0) {
        renderClasses();
    }
});

// Make functions available globally
window.toggleDropdown = toggleDropdown;
window.closePopup = closePopup;
window.selectGrade = selectGrade;
window.selectCourse = selectCourse;
window.selectSubject = selectSubject;
window.selectGradeFromPopup = selectGradeFromPopup;
window.selectCourseFromPopup = selectCourseFromPopup;
window.selectSubjectFromPopup = selectSubjectFromPopup;
window.enrollInClass = enrollInClass;
window.handleLogout = handleLogout;
window.closeUserMenu = closeUserMenu;
window.showUserMenu = showUserMenu;