// Theme Toggle with Cookie Support

const THEME_COOKIE_NAME = 'theme-preference';
const COOKIE_DURATION_DAYS = 365;

/**
 * Set a cookie with the given name, value and expiration days
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

/**
 * Initialize theme based on saved preference or default to light mode
 */
function initializeTheme() {
    const savedTheme = getCookie(THEME_COOKIE_NAME);
    const isDarkMode = savedTheme === 'dark';
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark-mode');
        updateThemeIcon(false);
    }
}

/**
 * Update the theme icon based on current mode
 */
function updateThemeIcon(isDarkMode) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = isDarkMode ? '🌙' : '☀️';
    }
}

/**
 * Toggle between dark and light mode
 */
function toggleTheme() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark-mode');
    
    // Save preference to cookie
    const theme = isDarkMode ? 'dark' : 'light';
    setCookie(THEME_COOKIE_NAME, theme, COOKIE_DURATION_DAYS);
    
    // Update icon
    updateThemeIcon(isDarkMode);
    
    // Update aria-label
    const themeButton = document.querySelector('.theme-toggle');
    if (themeButton) {
        const label = isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        themeButton.setAttribute('aria-label', label);
    }
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}

// Add click listener to theme toggle button
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
