const projectSection = document.querySelector('.projectos_section');
const projectGrid = document.querySelector('.projectos-grid');
const projectCards = Array.from(document.querySelectorAll('.proyecto-card'));
const prevButton = document.querySelector('.projectos-prev');
const nextButton = document.querySelector('.projectos-next');
const counter = document.querySelector('.projectos-counter');

let currentProject = 0;

const showProject = (index) => {
    currentProject = index;

    projectCards.forEach((card, cardIndex) => {
        const isActive = cardIndex === currentProject;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', String(!isActive));
    });

    prevButton.disabled = currentProject === 0;
    nextButton.disabled = currentProject === projectCards.length - 1;
    counter.textContent = `${currentProject + 1} / ${projectCards.length}`;
};

if (projectSection && projectGrid && projectCards.length > 0 && prevButton && nextButton && counter) {
    projectSection.classList.add('projectos-carousel-ready');
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

    showProject(currentProject);
}
