const experienceContainer = document.querySelector('.experiencia-container');
const experienceItems = Array.from(document.querySelectorAll('.experiencia-item'));

if (experienceContainer && experienceItems.length > 0) {
    let resizeFrame = null;

    const getItemHeight = (item) => {
        const styles = window.getComputedStyle(item);
        const marginTop = parseFloat(styles.marginTop) || 0;
        const marginBottom = parseFloat(styles.marginBottom) || 0;

        return Math.ceil(item.getBoundingClientRect().height + marginTop + marginBottom);
    };

    const getActiveItem = () => {
        const containerTop = experienceContainer.getBoundingClientRect().top;
        let activeItem = experienceItems[0];
        let shortestDistance = Number.POSITIVE_INFINITY;

        experienceItems.forEach((item) => {
            const distance = Math.abs(item.getBoundingClientRect().top - containerTop);

            if (distance < shortestDistance) {
                shortestDistance = distance;
                activeItem = item;
            }
        });

        return activeItem;
    };

    const updateContainerHeight = () => {
        const activeItem = getActiveItem();
        experienceContainer.style.setProperty('--experiencia-active-height', `${getItemHeight(activeItem)}px`);
    };

    const requestHeightUpdate = () => {
        if (resizeFrame) {
            window.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = window.requestAnimationFrame(() => {
            updateContainerHeight();
            resizeFrame = null;
        });
    };

    experienceContainer.classList.add('is-carousel-ready');
    updateContainerHeight();

    experienceContainer.addEventListener('scroll', requestHeightUpdate, { passive: true });
    window.addEventListener('resize', requestHeightUpdate);

    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(requestHeightUpdate);
        experienceItems.forEach((item) => resizeObserver.observe(item));
    }
}
