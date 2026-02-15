// Authentication System - Initialize after DOM loads
let authModal, mainApp, signupForm, loginForm, showLogin, showSignup, authTitle, authSubtitle;

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('hackerx_user');
    if (user) {
        showApp();
    } else {
        showAuth();
    }
}

// Play welcome voice message
function playWelcomeVoice() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Welcome to Hacker X');
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to use a better voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Play ad voice message
function playAdVoice() {
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        speechSynthesis.cancel();
        
        const speakMessage = () => {
            const utterance = new SpeechSynthesisUtterance('Welcome to Hacker X, this app almost free, master cyber');
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to use a better voice if available
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                const preferredVoice = voices.find(voice => 
                    voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
                );
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
            }
            
            speechSynthesis.speak(utterance);
        };
        
        // Ensure voices are loaded
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            speakMessage();
        } else {
            // Wait for voices to load
            speechSynthesis.onvoiceschanged = () => {
                speakMessage();
                speechSynthesis.onvoiceschanged = null;
            };
        }
    }
}

function showApp(playWelcome = false) {
    if (authModal) authModal.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Play welcome voice message only on fresh login/signup
    if (playWelcome) {
        playWelcomeVoice();
    }
    
    // Setup video handlers and logout button after app is shown
    setTimeout(() => {
        setupVideoHandlers();
        addLogoutButton();
    }, 100);
}

function showAuth() {
    if (authModal) authModal.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

// Initialize auth elements
function initAuth() {
    authModal = document.getElementById('authModal');
    mainApp = document.getElementById('mainApp');
    signupForm = document.getElementById('signupForm');
    loginForm = document.getElementById('loginForm');
    showLogin = document.getElementById('showLogin');
    showSignup = document.getElementById('showSignup');
    authTitle = document.getElementById('authTitle');
    authSubtitle = document.getElementById('authSubtitle');
    
    if (!authModal || !mainApp || !signupForm || !loginForm) {
        console.error('Auth elements not found!');
        return false;
    }
    return true;
}

// Show login form
function setupAuthSwitchers() {
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupForm) signupForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'flex';
            if (authTitle) authTitle.textContent = 'Welcome Back';
            if (authSubtitle) authSubtitle.textContent = 'Login to continue your learning journey';
        });
    }

    // Show signup form
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'flex';
            if (authTitle) authTitle.textContent = 'Welcome to HackerX';
            if (authSubtitle) authSubtitle.textContent = 'Start your ethical hacking journey today';
        });
    }
}

// Signup form handler
function setupSignupForm() {
    if (!signupForm) {
        console.error('Signup form not found!');
        return;
    }
    
    // Also handle button click directly as backup
    const signupButton = signupForm.querySelector('button[type="submit"]');
    if (signupButton) {
        signupButton.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
    }
    
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Signup form submitted');
        
        const nameInput = document.getElementById('signupName');
        const emailInput = document.getElementById('signupEmail');
        const passwordInput = document.getElementById('signupPassword');
        const confirmPasswordInput = document.getElementById('signupConfirmPassword');
        
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            showError(signupForm, 'Form fields not found! Please refresh the page.');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Remove existing error/success messages
        const existingError = signupForm.querySelector('.auth-error');
        const existingSuccess = signupForm.querySelector('.auth-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
        
        // Validation
        if (!name) {
            showError(signupForm, 'Please enter your name!');
            nameInput.focus();
            return;
        }
        
        if (!email) {
            showError(signupForm, 'Please enter your email!');
            emailInput.focus();
            return;
        }
        
        if (!email.includes('@')) {
            showError(signupForm, 'Please enter a valid email address!');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError(signupForm, 'Please enter a password!');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            showError(signupForm, 'Password must be at least 6 characters!');
            passwordInput.focus();
            return;
        }
        
        if (password !== confirmPassword) {
            showError(signupForm, 'Passwords do not match!');
            confirmPasswordInput.focus();
            return;
        }
        
        // Check if user already exists
        try {
            const existingUsers = JSON.parse(localStorage.getItem('hackerx_users') || '[]');
            if (existingUsers.find(u => u.email === email)) {
                showError(signupForm, 'Email already registered! Please login.');
                return;
            }
            
            // Create user
            const user = {
                name: name,
                email: email,
                password: password, // In real app, hash this!
                createdAt: new Date().toISOString()
            };
            
            existingUsers.push(user);
            localStorage.setItem('hackerx_users', JSON.stringify(existingUsers));
            localStorage.setItem('hackerx_user', JSON.stringify(user));
            
            console.log('User created successfully:', user.email);
            
            showSuccess(signupForm, 'Account created successfully! Redirecting...');
            
            // Clear form
            signupForm.reset();
            
            setTimeout(() => {
                showApp(true); // Play welcome voice on account creation
            }, 1500);
        } catch (error) {
            console.error('Error creating user:', error);
            showError(signupForm, 'An error occurred. Please try again.');
        }
    });
}

// Login form handler
function setupLoginForm() {
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }
    
    // Also handle button click directly as backup
    const loginButton = loginForm.querySelector('button[type="submit"]');
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Login form submitted');
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const rememberMeInput = document.getElementById('rememberMe');
        
        if (!emailInput || !passwordInput) {
            showError(loginForm, 'Form fields not found! Please refresh the page.');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
        
        // Remove existing error/success messages
        const existingError = loginForm.querySelector('.auth-error');
        const existingSuccess = loginForm.querySelector('.auth-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
        
        // Validation
        if (!email) {
            showError(loginForm, 'Please enter your email!');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError(loginForm, 'Please enter your password!');
            passwordInput.focus();
            return;
        }
        
        // Check credentials
        try {
            const users = JSON.parse(localStorage.getItem('hackerx_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                showError(loginForm, 'Invalid email or password!');
                return;
            }
            
            // Save user session
            localStorage.setItem('hackerx_user', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('hackerx_remember', 'true');
            }
            
            console.log('User logged in successfully:', user.email);
            
            showSuccess(loginForm, 'Login successful! Redirecting...');
            
            // Clear form
            loginForm.reset();
            
            setTimeout(() => {
                showApp(true); // Play welcome voice on login
            }, 1500);
        } catch (error) {
            console.error('Error during login:', error);
            showError(loginForm, 'An error occurred. Please try again.');
        }
    });
}

function showError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(form, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Logout functionality (add to navbar later)
function logout() {
    localStorage.removeItem('hackerx_user');
    showAuth();
    signupForm.style.display = 'flex';
    loginForm.style.display = 'none';
    authTitle.textContent = 'Welcome to HackerX';
    authSubtitle.textContent = 'Start your ethical hacking journey today';
}

// Add logout button to navbar
function addLogoutButton() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        const user = JSON.parse(localStorage.getItem('hackerx_user') || 'null');
        if (user) {
            // Remove existing logout button if any
            const existingLogout = document.querySelector('.logout-btn');
            if (existingLogout) existingLogout.remove();
            
            const logoutBtn = document.createElement('li');
            logoutBtn.className = 'logout-btn';
            logoutBtn.innerHTML = `<a href="#" id="logoutLink" style="color: #f85149;">Logout (${user.name})</a>`;
            navMenu.appendChild(logoutBtn);
            
            document.getElementById('logoutLink').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing auth...');
    
    // Initialize auth elements
    if (initAuth()) {
        // Setup form handlers
        setupSignupForm();
        setupLoginForm();
        setupAuthSwitchers();
        
        // Check authentication status
        checkAuth();
    } else {
        console.error('Failed to initialize auth system!');
        // Show app anyway if auth fails to initialize
        if (mainApp) mainApp.style.display = 'block';
        if (authModal) authModal.style.display = 'none';
    }
    
    // Update all ad progress displays
    setTimeout(() => {
        const allCourses = [
            'Complete Ethical Hacking Bootcamp',
            'Advanced Network Security',
            'Web Application Security',
            'Linux Hacking & Security',
            'Python for Ethical Hacking',
            'WiFi Hacking & Security',
            'SQL Injection Mastery',
            'Metasploit Framework',
            'Advanced Cryptography & Encryption',
            'Reverse Engineering & Malware Analysis',
            'Digital Forensics & Investigation'
        ];
        
        allCourses.forEach(course => {
            updateAdProgress(course);
        });
    }, 500);
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// Smooth Scroll for Navigation Links
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

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll(
        '.category-card, .course-card, .instructor-card, .testimonial-card'
    );
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
});

// Course Card Hover Effects
const courseCards = document.querySelectorAll('.course-card');
courseCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Course Filtering Functions
function filterCourses(category) {
    console.log('Filtering courses for:', category);
    
    // Hide featured courses section
    const featuredSection = document.querySelector('.featured-courses');
    if (featuredSection) {
        featuredSection.style.display = 'none';
    }
    
    // Show filtered courses section
    const filteredSection = document.getElementById('filteredCourses');
    const filteredGrid = document.getElementById('filteredCoursesGrid');
    const filterTitle = document.getElementById('filterTitle');
    
    if (filteredSection && filteredGrid && filterTitle) {
        // Update title
        filterTitle.textContent = `${category} Courses`;
        
        // Get all course cards
        const allCourses = document.querySelectorAll('.course-card[data-category]');
        
        // Clear existing filtered courses
        filteredGrid.innerHTML = '';
        
        // Filter and add matching courses
        let foundCourses = 0;
        allCourses.forEach(course => {
            const courseCategory = course.getAttribute('data-category');
            if (courseCategory === category) {
                // Clone the course card
                const clonedCourse = course.cloneNode(true);
                filteredGrid.appendChild(clonedCourse);
                foundCourses++;
            }
        });
        
        // If no courses found, show message
        if (foundCourses === 0) {
            filteredGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <h3>No courses found in this category</h3>
                    <p>More courses coming soon!</p>
                </div>
            `;
        }
        
        // Show filtered section and scroll to it
        filteredSection.style.display = 'block';
        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight active category card
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            if (card.getAttribute('data-category') === category) {
                card.classList.add('active');
            }
        });
    }
}

function showAllCourses() {
    // Hide filtered section
    const filteredSection = document.getElementById('filteredCourses');
    if (filteredSection) {
        filteredSection.style.display = 'none';
    }
    
    // Show featured courses section
    const featuredSection = document.querySelector('.featured-courses');
    if (featuredSection) {
        featuredSection.style.display = 'block';
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Remove active class from category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
}

// Ad System Configuration
const AD_CONFIG = {
    enabled: true,
    adsRequired: 5, // Minimum 5 ads to unlock course
    adUnitIds: {
        banner: 'ca-app-pub-9163384302583891/8436690226',
        interstitial: 'ca-app-pub-9163384302583891/5810526885'
    }
};

// Track ads watched per course
function getAdCount(courseName) {
    const key = `hackerx_ads_${courseName.replace(/\s+/g, '_')}`;
    return parseInt(localStorage.getItem(key) || '0');
}

function setAdCount(courseName, count) {
    const key = `hackerx_ads_${courseName.replace(/\s+/g, '_')}`;
    localStorage.setItem(key, count.toString());
    updateAdProgress(courseName);
}

function updateAdProgress(courseName) {
    const count = getAdCount(courseName);
    const progress = (count / AD_CONFIG.adsRequired) * 100;
    
    // Update display
    const display = document.querySelector(`.ad-count-display[data-course="${courseName}"]`);
    if (display) {
        display.textContent = `${count}/${AD_CONFIG.adsRequired}`;
    }
    
    // Update progress bar
    const progressBar = document.querySelector(`.ad-progress-fill[data-course="${courseName}"]`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Update button
    const button = document.getElementById(`btn-${courseName}`);
    if (button) {
        if (count >= AD_CONFIG.adsRequired) {
            button.textContent = 'Unlock Course';
            button.classList.add('unlocked');
        } else {
            button.textContent = `Watch Ads to Unlock (${AD_CONFIG.adsRequired - count} left)`;
            button.classList.remove('unlocked');
        }
    }
}

// Track ad views
function trackAdView() {
    if (!AD_CONFIG.enabled) return;
    
    let adCount = parseInt(localStorage.getItem(AD_CONFIG.adCountKey) || '0');
    adCount++;
    localStorage.setItem(AD_CONFIG.adCountKey, adCount.toString());
    
    return adCount;
}

// Check if user can enroll (ads watched requirement)
function canEnrollCourse() {
    if (!AD_CONFIG.enabled) return true; // If ads not enabled, allow enrollment
    
    const adCount = parseInt(localStorage.getItem(AD_CONFIG.adCountKey) || '0');
    return adCount >= AD_CONFIG.adsRequired;
}

// Show ads before enrollment (placeholder - will be implemented with AdMob)
function showAdsBeforeEnrollment(callback) {
    if (!AD_CONFIG.enabled) {
        callback(); // If ads disabled, proceed directly
        return;
    }
    
    // TODO: Implement AdMob ads here when key is provided
    // For now, just proceed with enrollment
    callback();
}

// Show Ad Modal
function showAdModal(courseName, adIndex, totalAds) {
    const modal = document.createElement('div');
    modal.className = 'ad-modal';
    modal.id = 'adModal';
    
    modal.innerHTML = `
        <div class="ad-modal-content">
            <div class="ad-modal-header">
                <h3>Watch Ad ${adIndex}/${totalAds}</h3>
                <p>Watch ads to unlock this course for free!</p>
            </div>
            <div class="ad-container" id="adContainer">
                <div class="ad-placeholder">
                    <div class="ad-loading">
                        <div class="spinner"></div>
                        <p>Loading Ad...</p>
                    </div>
                </div>
            </div>
            <div class="ad-modal-footer">
                <button class="btn btn-secondary" onclick="skipAd('${courseName}', ${adIndex}, ${totalAds})">Skip (Not Recommended)</button>
                <div class="ad-progress-info">
                    <span>Ad ${adIndex} of ${totalAds}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Play voice message when main ad (first ad) starts
    if (adIndex === 1) {
        playAdVoice();
    }
    
    // Load AdMob ad
    loadAdMobAd(courseName, adIndex, totalAds);
}

// Load AdMob Ad
function loadAdMobAd(courseName, adIndex, totalAds) {
    try {
        // Create ad element
        const adContainer = document.getElementById('adContainer');
        adContainer.innerHTML = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-9163384302583891"
                 data-ad-slot="${adIndex % 2 === 0 ? '8436690226' : '5810526885'}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        `;
        
        // Push ad to AdSense
        (adsbygoogle = window.adsbygoogle || []).push({});
        
        // Simulate ad completion after 5 seconds (for testing)
        // In production, this should be handled by AdMob callbacks
        setTimeout(() => {
            onAdCompleted(courseName, adIndex, totalAds);
        }, 5000);
        
    } catch (error) {
        console.error('Error loading ad:', error);
        // Simulate ad completion for testing
        setTimeout(() => {
            onAdCompleted(courseName, adIndex, totalAds);
        }, 3000);
    }
}

// Ad completed callback
function onAdCompleted(courseName, adIndex, totalAds) {
    const currentCount = getAdCount(courseName);
    setAdCount(courseName, currentCount + 1);
    
    // Close current ad modal
    const modal = document.getElementById('adModal');
    if (modal) {
        modal.remove();
    }
    
    // Check if more ads needed
    const newCount = getAdCount(courseName);
    if (newCount < AD_CONFIG.adsRequired) {
        // Show next ad
        setTimeout(() => {
            showAdModal(courseName, adIndex + 1, totalAds);
        }, 500);
    } else {
        // All ads watched, unlock course
        unlockCourse(courseName);
    }
}

// Skip ad (not recommended)
function skipAd(courseName, adIndex, totalAds) {
    if (confirm('Skipping ads will not unlock the course. Are you sure?')) {
        const modal = document.getElementById('adModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Unlock course after ads
function unlockCourse(courseName) {
    const user = JSON.parse(localStorage.getItem('hackerx_user') || 'null');
    
    if (!user) {
        showEnrollmentModal('Please login to enroll in courses!', 'error');
        return;
    }
    
    // Get enrolled courses
    let enrolledCourses = JSON.parse(localStorage.getItem('hackerx_enrolled_courses') || '[]');
    
    // Check if already enrolled
    if (enrolledCourses.includes(courseName)) {
        showEnrollmentModal(`You are already enrolled in "${courseName}"!`, 'info');
        return;
    }
    
    // Add to enrolled courses
    enrolledCourses.push(courseName);
    localStorage.setItem('hackerx_enrolled_courses', JSON.stringify(enrolledCourses));
    
    // Show success message
    showEnrollmentModal(`🎉 Congratulations! You have successfully unlocked "${courseName}"!\n\nYou watched ${AD_CONFIG.adsRequired} ads. You can now access all course materials, videos, and resources.`, 'success', courseName);
    
    // Update button
    const button = document.getElementById(`btn-${courseName}`);
    if (button) {
        button.textContent = 'Enrolled ✓';
        button.style.background = 'var(--primary-color)';
        button.style.color = 'var(--bg-dark)';
        button.disabled = true;
        button.onclick = null;
    }
}

// Enroll Course Function
function enrollCourse(courseName) {
    const user = JSON.parse(localStorage.getItem('hackerx_user') || 'null');
    
    if (!user) {
        showEnrollmentModal('Please login to enroll in courses!', 'error');
        return;
    }
    
    // Check if already enrolled
    const enrolledCourses = JSON.parse(localStorage.getItem('hackerx_enrolled_courses') || '[]');
    if (enrolledCourses.includes(courseName)) {
        showEnrollmentModal(`You are already enrolled in "${courseName}"!`, 'info');
        return;
    }
    
    // Check ad count
    const adCount = getAdCount(courseName);
    
    if (adCount >= AD_CONFIG.adsRequired) {
        // Already watched enough ads, unlock directly
        unlockCourse(courseName);
    } else {
        // Show ads
        const remaining = AD_CONFIG.adsRequired - adCount;
        showAdModal(courseName, adCount + 1, AD_CONFIG.adsRequired);
    }
}

// Function to enable ads system (call this when AdMob key is provided)
function enableAdSystem(admobKey) {
    AD_CONFIG.enabled = true;
    AD_CONFIG.admobKey = admobKey;
    console.log('Ad system enabled with AdMob key');
    // TODO: Initialize AdMob SDK here
}

// Custom Enrollment Modal
function showEnrollmentModal(message, type = 'success', courseName = '') {
    // Remove existing modal if any
    const existingModal = document.getElementById('enrollmentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'enrollmentModal';
    modal.className = 'enrollment-modal';
    
    const icon = type === 'success' ? '🎉' : type === 'error' ? '❌' : 'ℹ️';
    const title = type === 'success' ? 'Enrollment Successful!' : type === 'error' ? 'Enrollment Failed' : 'Information';
    
    modal.innerHTML = `
        <div class="enrollment-modal-content">
            <div class="enrollment-modal-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="closeEnrollmentModal()">Continue Learning</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEnrollmentModal();
        }
    });
    
    // Auto close after 4 seconds for success
    if (type === 'success') {
        setTimeout(() => {
            closeEnrollmentModal();
        }, 4000);
    }
}

function closeEnrollmentModal() {
    const modal = document.getElementById('enrollmentModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Category Card Click Handler
document.addEventListener('DOMContentLoaded', () => {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';
        // onclick is already in HTML, but we can add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
});

// Enroll Button Handler
const enrollButtons = document.querySelectorAll('.btn-outline');
enrollButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const courseTitle = this.closest('.course-card').querySelector('h3').textContent;
        
        // Create a simple modal or alert
        const message = `You are enrolling in: ${courseTitle}`;
        
        // You can replace this with a proper modal
        if (confirm(message + '\n\nWould you like to proceed?')) {
            // Add enrollment logic here
            this.textContent = 'Enrolled!';
            this.style.background = 'var(--primary-color)';
            this.style.color = 'var(--bg-dark)';
            this.disabled = true;
        }
    });
});

// CTA Button Handlers
const ctaButtons = document.querySelectorAll('.btn-primary.btn-large');
ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        // Scroll to courses section or handle signup
        const coursesSection = document.querySelector('#courses');
        if (coursesSection) {
            coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    }
});

// Dynamic Particle Animation
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.opacity = Math.random();
    particle.style.animation = `float ${3 + Math.random() * 3}s ease-in-out infinite`;
    
    const particlesContainer = document.querySelector('.particles');
    if (particlesContainer) {
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 6000);
    }
}

// Create particles periodically
setInterval(createParticle, 2000);

// Counter Animation for Stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(start));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
}

// Animate stats when they come into view
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.dataset.animated) {
                const text = statNumber.textContent;
                const number = parseInt(text.replace(/[^\d]/g, ''));
                if (!isNaN(number)) {
                    statNumber.dataset.animated = 'true';
                    statNumber.textContent = '0';
                    animateCounter(statNumber, number);
                }
            }
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statObserver.observe(stat);
});

// Instructor Card Hover Effect
const instructorCards = document.querySelectorAll('.instructor-card');
instructorCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const img = this.querySelector('.instructor-image img');
        if (img) {
            img.style.transform = 'scale(1.1)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const img = this.querySelector('.instructor-image img');
        if (img) {
            img.style.transform = 'scale(1)';
        }
    });
});

// Testimonial Rotation (Optional - can be enhanced)
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');

// Add active class to first testimonial
if (testimonialCards.length > 0) {
    testimonialCards[0].classList.add('active');
}

// Search Functionality (if needed)
function searchCourses(query) {
    const courses = document.querySelectorAll('.course-card');
    courses.forEach(course => {
        const title = course.querySelector('h3').textContent.toLowerCase();
        const category = course.querySelector('.course-category').textContent.toLowerCase();
        const description = course.querySelector('p').textContent.toLowerCase();
        
        const searchTerm = query.toLowerCase();
        
        if (title.includes(searchTerm) || category.includes(searchTerm) || description.includes(searchTerm)) {
            course.style.display = 'block';
        } else {
            course.style.display = 'none';
        }
    });
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100);
        }, index * 200);
    });
});

// Form Validation (if forms are added later)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--accent-color)';
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    return isValid;
}

// Add ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: var(--bg-card);
            padding: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);

// Terminal Functionality
const terminalInput = document.getElementById('terminalInput');
const terminalSubmit = document.getElementById('terminalSubmit');
const terminalBody = document.getElementById('terminalBody');
let terminalHistory = [];
let historyIndex = -1;

// Terminal commands
const terminalCommands = {
    help: () => {
        return `Available Commands:
  help          - Show this help message
  nmap          - Network scanning tool demo
  whoami        - Display current user
  ls            - List directory contents
  pwd           - Print working directory
  ifconfig      - Network interface configuration
  netstat       - Network connections
  ping          - Test network connectivity
  clear         - Clear terminal screen
  hack          - Simulate hacking process
  scan          - Network scan simulation`;
    },
    nmap: () => {
        return `Starting Nmap scan...
Nmap scan report for 192.168.1.1
Host is up (0.001s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
443/tcp open https

Nmap done: 1 IP address (1 host up) scanned in 2.45 seconds`;
    },
    whoami: () => {
        return 'hackerx';
    },
    ls: () => {
        return `Desktop  Documents  Downloads  hacking-tools  scripts
vulnerabilities  exploits  reports`;
    },
    pwd: () => {
        return '/home/hackerx';
    },
    ifconfig: () => {
        return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 12345  bytes 12345678 (12.3 MB)
        TX packets 9876  bytes 9876543 (9.8 MB)`;
    },
    netstat: () => {
        return `Active Internet connections
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.100:443       192.168.1.1:54321       ESTABLISHED`;
    },
    ping: () => {
        return `PING google.com (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=64 time=12.345 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=64 time=11.234 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=64 time=10.123 ms

--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
    },
    clear: () => {
        terminalBody.innerHTML = '<div class="terminal-line"><span class="terminal-prompt">hackerx@terminal:~$</span><span class="terminal-cursor">_</span></div>';
        return null;
    },
    hack: () => {
        return `[!] Initializing hack sequence...
[*] Scanning target network...
[*] Found vulnerable service on port 80
[*] Exploiting vulnerability...
[+] Successfully gained access!
[*] Extracting sensitive data...
[+] Hack completed successfully!

Note: This is a simulation. Always practice ethical hacking with proper authorization.`;
    },
    scan: () => {
        return `[*] Starting network scan...
[*] Scanning 192.168.1.0/24
[+] Found 15 active hosts
[*] Scanning ports on 192.168.1.1...
[+] Open ports: 22, 80, 443, 8080
[*] Scanning complete!`;
    }
};

function executeCommand(command) {
    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'clear') {
        const result = terminalCommands.clear();
        return result;
    }
    
    if (terminalCommands[cmd]) {
        return terminalCommands[cmd]();
    } else if (cmd === '') {
        return null;
    } else {
        return `Command not found: ${command}\nType 'help' for available commands.`;
    }
}

function addTerminalLine(prompt, output = '', isError = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (prompt) {
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = prompt;
        line.appendChild(promptSpan);
    }
    
    if (output) {
        const outputSpan = document.createElement('span');
        outputSpan.className = isError ? 'terminal-error' : 'terminal-output';
        outputSpan.textContent = output;
        line.appendChild(outputSpan);
    } else {
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursor.textContent = '_';
        line.appendChild(cursor);
    }
    
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function handleTerminalInput() {
    const command = terminalInput.value.trim();
    
    if (command) {
        terminalHistory.push(command);
        historyIndex = terminalHistory.length;
        
        // Add command line
        addTerminalLine('hackerx@terminal:~$ ', command);
        
        // Execute command
        const result = executeCommand(command);
        
        if (result !== null) {
            addTerminalLine('', result);
        }
        
        // Add new prompt
        addTerminalLine('hackerx@terminal:~$ ');
    } else {
        addTerminalLine('hackerx@terminal:~$ ');
    }
    
    terminalInput.value = '';
}

if (terminalSubmit) {
    terminalSubmit.addEventListener('click', handleTerminalInput);
}

if (terminalInput) {
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTerminalInput();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = terminalHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < terminalHistory.length - 1) {
                historyIndex++;
                terminalInput.value = terminalHistory[historyIndex];
            } else {
                terminalInput.value = '';
                historyIndex = terminalHistory.length;
            }
        }
    });
    
    // Focus terminal input on load
    terminalInput.focus();
}

// Command item click handler
document.querySelectorAll('.command-item').forEach(item => {
    item.addEventListener('click', () => {
        const command = item.textContent.trim();
        terminalInput.value = command;
        terminalInput.focus();
    });
});

// Video Player Functionality
const videoItems = document.querySelectorAll('.video-item');
const mainVideo = document.getElementById('mainVideo');
const videoFrame = document.getElementById('videoFrame');
const playMainVideo = document.getElementById('playMainVideo');
const mainVideoTitle = document.getElementById('mainVideoTitle');
const mainVideoDesc = document.getElementById('mainVideoDesc');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const currentVideoDescription = document.getElementById('currentVideoDescription');

let currentVideoId = null;

// Valid YouTube video IDs for educational content
const validVideoIds = {
    '3Kq1MIfTWCE': true,
    'bWEl6_PKZqY': true,
    'ciNHn38sR6Y': true,
    'WnN6dbos5u8': true,
    '7wLkk7_QPXM': true,
    'dc6q04o8Y6o': true,
    'ug8W0sFiVJo': true
};

function loadVideo(videoId, title, description) {
    currentVideoId = videoId;
    
    // Check if it's a valid YouTube video ID
    if (validVideoIds[videoId]) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        videoFrame.src = embedUrl;
        videoFrame.style.display = 'block';
        mainVideo.style.display = 'none';
    } else {
        // Show placeholder for non-YouTube videos
        mainVideo.style.display = 'flex';
        videoFrame.style.display = 'none';
        mainVideoTitle.textContent = title;
        mainVideoDesc.textContent = description + ' (Video coming soon)';
    }
    
    currentVideoTitle.textContent = title;
    currentVideoDescription.textContent = description;
    
    // Update active state
    videoItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.video === videoId) {
            item.classList.add('active');
        }
    });
}

// Video item click handler (will be set up after DOM loads)
function setupVideoHandlers() {
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
        // Remove existing listeners by cloning
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', () => {
            const videoId = newItem.dataset.video;
            const title = newItem.dataset.title;
            const desc = newItem.dataset.desc;
            loadVideo(videoId, title, desc);
        });
    });
}

// Play button handler
if (playMainVideo) {
    playMainVideo.addEventListener('click', () => {
        const firstVideo = videoItems[0];
        if (firstVideo) {
            const videoId = firstVideo.dataset.video;
            const title = firstVideo.dataset.title;
            const desc = firstVideo.dataset.desc;
            loadVideo(videoId, title, desc);
        }
    });
}


// Initialize first video (optional - can be set to auto-play)
// Uncomment to auto-play first video on load
// if (videoItems.length > 0) {
//     const firstVideo = videoItems[0];
//     loadVideo(firstVideo.dataset.video, firstVideo.dataset.title, firstVideo.dataset.desc);
// }

// Invite Link Functionality
function generateInviteLink() {
    const user = JSON.parse(localStorage.getItem('hackerx_user') || 'null');
    const baseUrl = window.location.origin + window.location.pathname;
    
    if (user) {
        // Generate unique invite code based on user email
        const inviteCode = btoa(user.email).substring(0, 8);
        return `${baseUrl}?ref=${inviteCode}`;
    } else {
        // Generic invite link
        return baseUrl;
    }
}

// Make function globally accessible
window.showInviteModal = function() {
    const inviteLink = generateInviteLink();
    const shareText = encodeURIComponent(`🚀 Join me on HackerX - Learn Ethical Hacking & Cybersecurity!\n\nMaster penetration testing, network security, and cybersecurity from industry experts.\n\nJoin 500K+ students and start your hacking journey today!\n\n👉 ${inviteLink}`);
    
    // Remove existing modal if any
    const existingModal = document.getElementById('inviteModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'inviteModal';
    modal.className = 'invite-modal';
    
    modal.innerHTML = `
        <div class="invite-modal-content">
            <div class="invite-modal-header">
                <h3>📤 Invite Friends to HackerX</h3>
                <p>Share HackerX with your friends and help them start their cybersecurity journey!</p>
            </div>
            <div class="invite-link-container">
                <input type="text" id="inviteLinkInput" class="invite-link-input" value="${inviteLink}" readonly>
                <button class="btn btn-primary" id="copyInviteLink">📋 Copy Link</button>
            </div>
            <div class="share-buttons">
                <button class="btn btn-whatsapp" id="shareWhatsApp">
                    <span>📱</span> Share on WhatsApp
                </button>
                <button class="btn btn-secondary" id="shareOther">
                    <span>🔗</span> Share via Other Apps
                </button>
            </div>
            <button class="btn btn-outline" id="closeInviteModal" style="margin-top: 1rem; width: 100%;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Copy link functionality
    const copyBtn = document.getElementById('copyInviteLink');
    const inviteInput = document.getElementById('inviteLinkInput');
    
    copyBtn.addEventListener('click', async () => {
        try {
            // Use modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(inviteLink);
            } else {
                // Fallback for older browsers
                inviteInput.select();
                inviteInput.setSelectionRange(0, 99999);
                document.execCommand('copy');
            }
            
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = 'var(--primary-color)';
            
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy Link';
                copyBtn.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback
            inviteInput.select();
            inviteInput.setSelectionRange(0, 99999);
            document.execCommand('copy');
            alert('Link copied to clipboard!');
        }
    });
    
    // WhatsApp share
    const whatsappBtn = document.getElementById('shareWhatsApp');
    whatsappBtn.addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/?text=${shareText}`;
        window.open(whatsappUrl, '_blank');
    });
    
    // Other apps share
    const shareOtherBtn = document.getElementById('shareOther');
    shareOtherBtn.addEventListener('click', async () => {
        if (navigator.share) {
            navigator.share({
                title: 'HackerX - Learn Ethical Hacking & Cybersecurity',
                text: `🚀 Join me on HackerX - Learn Ethical Hacking & Cybersecurity!\n\nMaster penetration testing, network security, and cybersecurity from industry experts.\n\nJoin 500K+ students and start your hacking journey today!`,
                url: inviteLink
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(inviteLink);
                    alert('Link copied to clipboard!');
                } else {
                    inviteInput.select();
                    document.execCommand('copy');
                    alert('Link copied to clipboard!');
                }
            } catch (err) {
                inviteInput.select();
                document.execCommand('copy');
                alert('Link copied to clipboard!');
            }
        }
    });
    
    // Close modal
    const closeBtn = document.getElementById('closeInviteModal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Setup invite button handlers
document.addEventListener('DOMContentLoaded', () => {
    // Navbar invite button
    const inviteBtn = document.getElementById('inviteLinkBtn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showInviteModal();
        });
    }
    
    // CTA invite button
    const ctaInviteBtn = document.getElementById('ctaInviteBtn');
    if (ctaInviteBtn) {
        ctaInviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showInviteModal();
        });
    }
    
    // Footer invite buttons
    const footerInviteBtn = document.getElementById('footerInviteBtn');
    if (footerInviteBtn) {
        footerInviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showInviteModal();
        });
    }
    
    const footerShareBtn = document.getElementById('footerShareBtn');
    if (footerShareBtn) {
        footerShareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showInviteModal();
        });
    }
});

console.log('HackerX App Loaded Successfully! 🚀');


