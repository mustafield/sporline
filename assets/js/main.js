/**
 * Sporline Main - Theme, Music & Core UI
 */

const themeSwitch = document.getElementById('theme-switch');
const htmlEl = document.documentElement;
const themeOverlay = document.getElementById('theme-overlay');

if (localStorage.getItem('theme') === 'light') {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
} else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
}

if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
        const rect = themeSwitch.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        themeOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
        setTimeout(() => {
            themeOverlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;
        }, 10);

        setTimeout(() => {
            if (htmlEl.classList.contains('dark')) {
                htmlEl.classList.remove('dark');
                htmlEl.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                htmlEl.classList.remove('light');
                htmlEl.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
            setTimeout(() => {
                themeOverlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
            }, 50);
        }, 400);
    });
}

const menuToggle = document.getElementById('menu-toggle');
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle) menuToggle.checked = false;
});
