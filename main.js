// Solid brand icons for social links ([data-social-icon] on span placeholders)
var SOCIAL_ICONS = {
  facebook:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.558-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  youtube:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
};

function replaceFeatherIcons() {
  if (!window.feather) return;
  feather.replace({ width: 24, height: 24, 'stroke-width': 2.5 });
}

function initSocialIcons() {
  document.querySelectorAll('[data-social-icon]').forEach(function (el) {
    var key = el.getAttribute('data-social-icon');
    var html = SOCIAL_ICONS[key];
    if (!html) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var svg = wrap.firstElementChild;
    if (el.className) svg.setAttribute('class', el.className + ' block');
    el.replaceWith(svg);
  });
}

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
  initSocialIcons();
  replaceFeatherIcons();

  loadFragment('header', 'header.html', function() {
    initSocialIcons();
    replaceFeatherIcons();
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
    // Transparent-over-hero header that turns solid brand orange on scroll.
    const siteNav = document.getElementById('site-nav');
    if (siteNav) {
      const onNavScroll = function () {
        siteNav.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      onNavScroll();
      window.addEventListener('scroll', onNavScroll, { passive: true });
    }
  });
  loadFragment('footer', 'footer.html', function() {
    initSocialIcons();
    replaceFeatherIcons();
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