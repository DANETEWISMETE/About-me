const experienceContainer = document.querySelector('.experiencia-container');
const experienceItems = Array.from(document.querySelectorAll('.experiencia-item'));

let currentExperience = 0;
let experienceTrack = null;
let dragStartY = 0;
let dragOffsetY = 0;
let isDraggingExperience = false;

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
    controls.setAttribute('aria-label', 'Controles de experiencia laboral');

    const prevButton = document.createElement('button');
    prevButton.className = 'experiencia-button experiencia-prev';
    prevButton.type = 'button';
    prevButton.setAttribute('aria-label', 'Experiencia anterior');
    prevButton.textContent = '↑';

    const counter = document.createElement('span');
    counter.className = 'experiencia-counter';
    counter.setAttribute('aria-live', 'polite');

    const nextButton = document.createElement('button');
    nextButton.className = 'experiencia-button experiencia-next';
    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', 'Experiencia siguiente');
    nextButton.textContent = '↓';

    controls.append(prevButton, counter, nextButton);
    experienceContainer.insertAdjacentElement('afterend', controls);

    return { prevButton, nextButton, counter };
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

function showExperience(index, controls) {
    currentExperience = Math.max(0, Math.min(index, experienceItems.length - 1));
    setExperienceHeight();
    moveExperienceTrack();

    experienceItems.forEach((item, itemIndex) => {
        item.setAttribute('aria-hidden', String(itemIndex !== currentExperience));
    });

    controls.prevButton.disabled = currentExperience === 0;
    controls.nextButton.disabled = currentExperience === experienceItems.length - 1;
    controls.counter.textContent = `${currentExperience + 1} / ${experienceItems.length}`;
}

function endExperienceDrag(pointerId, controls) {
    if (!isDraggingExperience) return;

    const dragThreshold = Math.min(80, getActiveExperienceHeight() * 0.25);
    isDraggingExperience = false;
    experienceContainer.classList.remove('is-dragging');

    if (experienceContainer.hasPointerCapture(pointerId)) {
        experienceContainer.releasePointerCapture(pointerId);
    }

    if (dragOffsetY < -dragThreshold) {
        showExperience(currentExperience + 1, controls);
        return;
    }

    if (dragOffsetY > dragThreshold) {
        showExperience(currentExperience - 1, controls);
        return;
    }

    moveExperienceTrack();
}

if (experienceContainer && experienceItems.length > 0) {
    experienceContainer.classList.add('is-drag-ready');
    experienceContainer.setAttribute('tabindex', '0');

    experienceTrack = buildExperienceTrack();
    const controls = createExperienceControls();

    controls.prevButton.addEventListener('click', () => showExperience(currentExperience - 1, controls));
    controls.nextButton.addEventListener('click', () => showExperience(currentExperience + 1, controls));

    experienceContainer.addEventListener('pointerdown', (event) => {
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
        endExperienceDrag(event.pointerId, controls);
    });

    experienceContainer.addEventListener('pointercancel', (event) => {
        endExperienceDrag(event.pointerId, controls);
    });

    experienceContainer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            showExperience(currentExperience - 1, controls);
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            showExperience(currentExperience + 1, controls);
        }
    });

    window.addEventListener('resize', () => {
        setExperienceHeight();
        moveExperienceTrack();
    });

    experienceItems.forEach((item) => {
        item.querySelectorAll('img').forEach((image) => {
            if (image.complete) return;
            image.addEventListener('load', () => showExperience(currentExperience, controls), { once: true });
        });
    });

    showExperience(currentExperience, controls);
}
