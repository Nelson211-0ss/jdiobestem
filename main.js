// Dynamically load header and footer
function loadFragment(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback();
    });
}

// Animated Counters Logic (Our Impact section — data-target, optional data-suffix / data-prefix)
function animateCounter(counter, target, duration = 2000) {
  const suffix = counter.getAttribute('data-suffix') || '';
  const prefix = counter.getAttribute('data-prefix') || '';
  let start = 0;
  const increment = target / (duration / 16);
  counter.textContent = prefix + '0' + suffix;
  function update() {
    start += increment;
    if (start < target) {
      counter.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
      requestAnimationFrame(update);
    } else {
      counter.textContent = prefix + target.toLocaleString() + suffix;
    }
  }
  requestAnimationFrame(update);
}

function initImpactCounters() {
  const section = document.getElementById('impact');
  if (!section) return;

  const counters = section.querySelectorAll('.counter');
  if (!counters.length) return;

  function setFinalValues() {
    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (Number.isNaN(target)) return;
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      counter.textContent = prefix + target.toLocaleString() + suffix;
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setFinalValues();
    return;
  }

  let started = false;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || started) return;
        started = true;
        counters.forEach(function (counter) {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          if (!Number.isNaN(target)) {
            animateCounter(counter, target);
          }
        });
        observer.disconnect();
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
  );

  observer.observe(section);
}

function initScrollReveal() {
  const selectors = ['.sr-fade-up', '.sr-fade-left', '.sr-fade-right', '.sr-zoom'];
  const elements = document.querySelectorAll(selectors.join(', '));
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(function (el) {
      el.classList.add('sr-in');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('sr-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

function initHeroSlider() {
  var root = document.getElementById('hero-slider');
  if (!root) return;

  var slides = root.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var intervalMs = 6500;
  var timer = null;

  var dots = document.querySelectorAll('.hero-slider-dot');
  var prevBtn = document.querySelector('[data-hero-slider="prev"]');
  var nextBtn = document.querySelector('[data-hero-slider="next"]');

  function go(index) {
    var next = (index + slides.length) % slides.length;
    current = next;
    slides.forEach(function (el, i) {
      var active = i === next;
      el.classList.toggle('opacity-100', active);
      el.classList.toggle('opacity-0', !active);
      el.classList.toggle('pointer-events-none', !active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('bg-white', i === next);
      dot.classList.toggle('bg-white/35', i !== next);
      dot.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });
  }

  function next() {
    go(current + 1);
  }

  function prev() {
    go(current - 1);
  }

  function resetTimer() {
    if (reduceMotion) return;
    if (timer) clearInterval(timer);
    timer = setInterval(next, intervalMs);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () {
    prev();
    resetTimer();
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    next();
    resetTimer();
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      go(i);
      resetTimer();
    });
  });

  go(0);
  resetTimer();

  var heroSection = root.closest('.hero-parallax');
  if (heroSection) {
    heroSection.setAttribute('tabindex', '-1');
    heroSection.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
        resetTimer();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
        resetTimer();
      }
    });
  }

  if (!reduceMotion) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (timer) clearInterval(timer);
        timer = null;
      } else {
        resetTimer();
      }
    });
  }
}

// Load header and footer, then initialize features
window.addEventListener('DOMContentLoaded', function() {
  initScrollReveal();
  initHeroSlider();
  initImpactCounters();
  if (window.feather) feather.replace();

  loadFragment('header', 'header.html', function() {
    if (window.feather) feather.replace();
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  });
  loadFragment('footer', 'footer.html', function() {
    if (window.feather) feather.replace();
    // FAQ accordion toggle (for FAQs page)
    document.querySelectorAll('.faq-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const content = this.parentElement.querySelector('.faq-content');
        content.classList.toggle('hidden');
        const icon = this.querySelector('svg') || this.querySelector('i');
        if (icon) icon.classList.toggle('rotate-180');
      });
    });
  });
}); 