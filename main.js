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
    // FAQ accordion toggle (for FAQs page)
    document.querySelectorAll('.faq-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const content = this.parentElement.querySelector('.faq-content');
        content.classList.toggle('hidden');
        this.querySelector('i').classList.toggle('rotate-180');
      });
    });
  });
}); 