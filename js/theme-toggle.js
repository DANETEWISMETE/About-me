const THEME_COOKIE_NAME = 'theme-preference';
const COOKIE_DURATION_DAYS = 365;
const LIGHT_ICON = '\u2600\uFE0F';
const DARK_ICON = '\uD83C\uDF19';

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

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

function updateThemeIcon(isDarkMode) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = isDarkMode ? DARK_ICON : LIGHT_ICON;
    }
}

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

function toggleTheme() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark-mode');
    const theme = isDarkMode ? 'dark' : 'light';
    const themeButton = document.querySelector('.theme-toggle');

    setCookie(THEME_COOKIE_NAME, theme, COOKIE_DURATION_DAYS);
    updateThemeIcon(isDarkMode);

    if (themeButton) {
        const label = isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        themeButton.setAttribute('aria-label', label);
    }
}

function initializeThemeToggle() {
    initializeTheme();

    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeToggle);
} else {
    initializeThemeToggle();
}
