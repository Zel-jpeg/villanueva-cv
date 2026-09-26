/* Theme and reveal effects use browser APIs, so there are no dependencies. */
(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const printButton = document.getElementById('print-cv');
  const themeKey = 'azel-cv-theme';

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  }

  // Storage can be unavailable for local files or privacy settings; toggling still works.
  let savedTheme;
  try { savedTheme = localStorage.getItem(themeKey); } catch (_) { /* Use light theme. */ }
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem(themeKey, theme); } catch (_) { /* Persistence is optional. */ }
  });
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());

  const sections = [...document.querySelectorAll('.resume-content > section')];
  const links = [...document.querySelectorAll('.section-nav a')];
  function setActive(id) {
    links.forEach(link => {
      const active = link.hash === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  links.forEach(link => link.addEventListener('click', () => setActive(link.hash.slice(1))));

  // Animate each offscreen section once; reduced-motion users see it immediately.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(section => {
      if (section.getBoundingClientRect().top >= window.innerHeight) {
        section.classList.add('is-pending');
        observer.observe(section);
      }
    });
  }

  // Track the section nearest the reading position; a frame prevents excess work.
  let scheduled = false;
  function updateNavigation() {
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) current = sections.at(-1);
    setActive(current.id);
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  updateNavigation();
})();
