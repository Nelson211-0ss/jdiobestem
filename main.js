// Dynamically load header and footer
function loadFragment(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (callback) callback();
    });
}

// Animated Counters Logic
function animateCounter(counter, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  function update() {
    start += increment;
    if (start < target) {
      counter.textContent = Math.floor(start).toLocaleString();
      requestAnimationFrame(update);
    } else {
      counter.textContent = target.toLocaleString();
    }
  }
  update();
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

function initHeroParallax() {
  var hero = document.querySelector('.hero-parallax');
  var bg = document.querySelector('.hero-parallax-bg');
  if (!hero || !bg) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bg.style.removeProperty('--hero-parallax-y');
    return;
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY * 0.42;
    bg.style.setProperty('--hero-parallax-y', y + 'px');
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
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

function handleCountersOnScroll() {
  const counters = document.querySelectorAll('.counter');
  let animated = false;
  function checkAndAnimate() {
    if (animated) return;
    const section = document.querySelector('.counter')?.parentElement?.parentElement?.parentElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        animateCounter(counter, target);
      });
      animated = true;
      window.removeEventListener('scroll', checkAndAnimate);
    }
  }
  window.addEventListener('scroll', checkAndAnimate);
  checkAndAnimate();
}

// Load header and footer, then initialize features
window.addEventListener('DOMContentLoaded', function() {
  initScrollReveal();
  initHeroParallax();
  initHeroSlider();
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
    // Sticky header fix: ensure parent is positioned
    const headerDiv = document.getElementById('header');
    if (headerDiv && headerDiv.parentElement) {
      const parent = headerDiv.parentElement;
      const style = window.getComputedStyle(parent);
      if (style.position === 'static') {
        parent.style.position = 'relative';
      }
    }
    handleCountersOnScroll();
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