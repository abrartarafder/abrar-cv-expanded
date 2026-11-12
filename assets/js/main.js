const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = [...document.querySelectorAll('.nav__link')];

function closeMenu() {
    navMenu.classList.remove('show-menu');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
}

navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('show-menu');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navMenu.classList.contains('show-menu')) {
        closeMenu();
        navToggle.focus();
    }
});
document.addEventListener('click', event => {
    if (!event.target.closest('#header')) closeMenu();
});

// Read the saved theme when storage is available; the toggle also works without it.
const themeButton = document.getElementById('theme-button');
const themeIcon = themeButton.querySelector('i');
const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme;

try {
    savedTheme = localStorage.getItem('selected-theme');
} catch {
    // Some private browsing and embedded contexts restrict local storage.
}

function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    themeIcon.classList.toggle('bx-sun', isDark);
    themeIcon.classList.toggle('bx-moon', !isDark);
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
    themeButton.title = `Switch to ${isDark ? 'light' : 'dark'} theme`;
}

applyTheme(savedTheme === 'dark' || (savedTheme !== 'light' && colorPreference.matches));

themeButton.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-theme');
    applyTheme(isDark);
    savedTheme = isDark ? 'dark' : 'light';
    try {
        localStorage.setItem('selected-theme', savedTheme);
    } catch {
        // Keep the current theme usable even when it cannot be persisted.
    }
});

colorPreference.addEventListener('change', event => {
    if (savedTheme !== 'light' && savedTheme !== 'dark') applyTheme(event.matches);
});

const skillsButton = document.getElementById('skills-button');
const moreSkills = document.getElementById('more-skills');
moreSkills.hidden = true;
skillsButton.hidden = false;

skillsButton.addEventListener('click', () => {
    moreSkills.hidden = !moreSkills.hidden;
    skillsButton.setAttribute('aria-expanded', String(!moreSkills.hidden));
    skillsButton.textContent = moreSkills.hidden ? 'More tools' : 'Fewer tools';
});

// Only track sections represented in navigation, including sections in either column.
const linkedSections = navLinks.map(link => ({
    link,
    section: document.querySelector(link.getAttribute('href'))
})).filter(item => item.section);
const scrollTopLink = document.getElementById('scroll-top');

function updateScrollState() {
    const readingLine = 100;
    let activeItem;
    let nearestDistance = Infinity;

    linkedSections.forEach(item => {
        const bounds = item.section.getBoundingClientRect();
        if (bounds.top <= readingLine && bounds.bottom > readingLine) {
            const distance = Math.abs(bounds.top - readingLine);
            if (distance < nearestDistance) {
                activeItem = item;
                nearestDistance = distance;
            }
        }
    });

    linkedSections.forEach(item => {
        const isActive = item === activeItem;
        item.link.classList.toggle('active-link', isActive);
        if (isActive) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
    });

    scrollTopLink.classList.toggle('show-scroll', window.scrollY >= 200);
}

let scrollPending = false;
window.addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
        updateScrollState();
        scrollPending = false;
    });
}, { passive: true });
window.addEventListener('resize', () => {
    if (window.innerWidth >= 968) closeMenu();
    updateScrollState();
});

// A printed CV includes every role and tool, then restores the screen view.
let printDetails = [];
window.addEventListener('beforeprint', () => {
    printDetails = [...document.querySelectorAll('details:not([open])')];
    printDetails.forEach(details => { details.open = true; });
});
window.addEventListener('afterprint', () => {
    printDetails.forEach(details => { details.open = false; });
    printDetails = [];
    updateScrollState();
});
updateScrollState();
