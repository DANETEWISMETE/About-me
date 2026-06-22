const experienceContainer = document.querySelector('.experiencia-container');
const experienceItems = Array.from(document.querySelectorAll('.experiencia-item'));
const AUTOPLAY_DELAY = 4500;

let currentExperience = 0;
let experienceTrack = null;
let dragStartY = 0;
let dragOffsetY = 0;
let isDraggingExperience = false;
let autoplayTimer = null;

function buildExperienceTrack() {
    if (!experienceContainer) return null;

    const track = document.createElement('div');
    track.className = 'experiencia-track';
    experienceItems.forEach((item) => track.appendChild(item));
    experienceContainer.appendChild(track);
    return track;
}

function createExperienceControls() {
    const controls = document.createElement('div');
    controls.className = 'experiencia-controls';
    controls.setAttribute('aria-label', 'Seleccionar experiencia laboral');

    const dots = experienceItems.map((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'experiencia-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ver experiencia ${index + 1}`);
        dot.addEventListener('click', () => {
            showExperience(index, dots);
            restartAutoplay(dots);
        });
        controls.appendChild(dot);
        return dot;
    });

    experienceContainer.appendChild(controls);
    return dots;
}

function getActiveExperienceHeight() {
    return experienceItems[currentExperience].offsetHeight;
}

function setExperienceHeight() {
    if (!experienceContainer || experienceItems.length === 0) return;
    experienceContainer.style.height = `${getActiveExperienceHeight()}px`;
}

function getTranslateYFor(index) {
    return experienceItems.slice(0, index).reduce((height, item) => height + item.offsetHeight, 0);
}

function moveExperienceTrack(offset = 0) {
    if (!experienceTrack) return;

    const translateY = -getTranslateYFor(currentExperience) + offset;
    experienceTrack.style.transform = `translateY(${translateY}px)`;
}

function showExperience(index, dots) {
    const total = experienceItems.length;
    currentExperience = (index + total) % total;
    setExperienceHeight();
    moveExperienceTrack();

    experienceItems.forEach((item, itemIndex) => {
        item.setAttribute('aria-hidden', String(itemIndex !== currentExperience));
    });

    dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentExperience;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
}

function startAutoplay(dots) {
    if (experienceItems.length < 2) return;

    autoplayTimer = window.setInterval(() => {
        showExperience(currentExperience + 1, dots);
    }, AUTOPLAY_DELAY);
}

function stopAutoplay() {
    if (!autoplayTimer) return;

    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
}

function restartAutoplay(dots) {
    stopAutoplay();
    startAutoplay(dots);
}

function endExperienceDrag(pointerId, dots) {
    if (!isDraggingExperience) return;

    const dragThreshold = Math.min(80, getActiveExperienceHeight() * 0.25);
    isDraggingExperience = false;
    experienceContainer.classList.remove('is-dragging');

    if (experienceContainer.hasPointerCapture(pointerId)) {
        experienceContainer.releasePointerCapture(pointerId);
    }

    if (dragOffsetY < -dragThreshold) {
        showExperience(currentExperience + 1, dots);
    } else if (dragOffsetY > dragThreshold) {
        showExperience(currentExperience - 1, dots);
    } else {
        moveExperienceTrack();
    }

    restartAutoplay(dots);
}

if (experienceContainer && experienceItems.length > 0) {
    experienceContainer.classList.add('is-drag-ready');
    experienceContainer.setAttribute('tabindex', '0');

    experienceTrack = buildExperienceTrack();
    const dots = createExperienceControls();

    experienceContainer.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.experiencia-controls')) return;

        stopAutoplay();
        isDraggingExperience = true;
        dragStartY = event.clientY;
        dragOffsetY = 0;
        experienceContainer.classList.add('is-dragging');
        experienceContainer.setPointerCapture(event.pointerId);
    });

    experienceContainer.addEventListener('pointermove', (event) => {
        if (!isDraggingExperience) return;

        dragOffsetY = event.clientY - dragStartY;
        moveExperienceTrack(dragOffsetY);
    });

    experienceContainer.addEventListener('pointerup', (event) => {
        endExperienceDrag(event.pointerId, dots);
    });

    experienceContainer.addEventListener('pointercancel', (event) => {
        endExperienceDrag(event.pointerId, dots);
    });

    experienceContainer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            showExperience(currentExperience - 1, dots);
            restartAutoplay(dots);
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            showExperience(currentExperience + 1, dots);
            restartAutoplay(dots);
        }
    });

    window.addEventListener('resize', () => {
        setExperienceHeight();
        moveExperienceTrack();
    });

    experienceItems.forEach((item) => {
        item.querySelectorAll('img').forEach((image) => {
            if (image.complete) return;
            image.addEventListener('load', () => showExperience(currentExperience, dots), { once: true });
        });
    });

    showExperience(currentExperience, dots);
    startAutoplay(dots);
}
