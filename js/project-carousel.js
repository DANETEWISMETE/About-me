const projectSection = document.querySelector('.projectos_section');
const projectGrid = document.querySelector('.projectos-grid');
const projectCards = Array.from(document.querySelectorAll('.proyecto-card'));
const prevButton = document.querySelector('.projectos-prev');
const nextButton = document.querySelector('.projectos-next');
const counter = document.querySelector('.projectos-counter');

let currentProject = 0;
let track = null;

function buildTrack() {
    if (!projectGrid) return null;
    // create a track and move cards inside it
    const trackEl = document.createElement('div');
    trackEl.className = 'projectos-track';
    projectCards.forEach(card => trackEl.appendChild(card));
    projectGrid.appendChild(trackEl);
    return trackEl;
}

const showProject = (index) => {
    currentProject = index;
    const total = projectCards.length;
    if (!track) return;
    const pct = -(index * 100);
    track.style.transform = `translateX(${pct}%)`;

    projectCards.forEach((card, i) => {
        const isActive = i === currentProject;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', String(!isActive));
    });
    prevButton.disabled = currentProject === 0;
    nextButton.disabled = currentProject === total - 1;
    counter.textContent = `${currentProject + 1} / ${total}`;
};

if (projectSection && projectGrid && projectCards.length > 0 && prevButton && nextButton && counter) {
    projectSection.classList.add('projectos-carousel-ready');
    // build track
    track = buildTrack();
    projectGrid.setAttribute('tabindex', '0');

    prevButton.addEventListener('click', () => {
        showProject(Math.max(currentProject - 1, 0));
    });

    nextButton.addEventListener('click', () => {
        showProject(Math.min(currentProject + 1, projectCards.length - 1));
    });

    projectGrid.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showProject(Math.max(currentProject - 1, 0));
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showProject(Math.min(currentProject + 1, projectCards.length - 1));
        }
    });

    // ensure correct initial sizing
    showProject(currentProject);
}
