export function initFadeInOnScroll(selector = '.js-fade-in', options: IntersectionObserverInit = { threshold: 0.1 }) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  elements.forEach(el => observer.observe(el));
}
