// main.js — Main dashboard interactions
// Theme toggle (default: dark), plus simple GSAP intro animations.

(function () {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');

  function setTheme(mode) {
    if (mode === 'light') {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Default to dark, but respect saved preference
  const saved = localStorage.getItem('theme');
  setTheme(saved === 'light' ? 'light' : 'dark');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = html.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  // GSAP load animation
  if (window.gsap) {
    gsap.to('.animate-on-load', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08
    });
  } else {
    // Fallback: make sure content is visible
    document.querySelectorAll('.animate-on-load').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
})();
