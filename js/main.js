/**
 * Gabriel Boutin Portfolio - Main JavaScript
 * Handles navigation, smooth scroll, progress bar, and interactions
 */

(function() {
  'use strict';

  // DOM Elements
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');
  const scrollProgress = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scroll-top');
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Theme Toggle
  function setTheme(theme) {
    if (theme === 'light') {
      htmlElement.setAttribute('data-theme', 'light');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  // Load saved theme (default: dark)
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    setTheme('light');
  }

  // Mobile Navigation Toggle
  function toggleMobileNav() {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  }

  // Close mobile nav when clicking a link
  function closeMobileNav() {
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  // Update active nav link based on scroll position
  function updateActiveLink() {
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('is-active');
          }
        });
      }
    });
  }

  // Update scroll progress bar
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }

  // Update scroll-to-top button visibility
  function updateScrollTopButton() {
    if (scrollTopBtn) {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }
  }

  // Scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Smooth scroll to section
  function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  // Handle nav link clicks
  function handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(href);
      closeMobileNav();
      history.pushState(null, '', href);
    }
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Scroll handler with all updates
  function handleScroll() {
    updateActiveLink();
    updateScrollProgress();
    updateScrollTopButton();
  }

  // Event Listeners
  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileNav);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', scrollToTop);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Throttled scroll handler (16ms = ~60fps)
  const throttledScrollHandler = throttle(handleScroll, 16);
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navMenu.classList.contains('is-open')) {
      closeMobileNav();
    }
  });

  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMobileNav();
      navToggle.focus();
    }
  });

  // Animate elements on scroll (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  // Observe cards and timeline items for animation
  document.querySelectorAll('.card, .timeline__item, .patent-card, .award-card').forEach(el => {
    el.classList.add('animate-on-scroll');
    animateOnScroll.observe(el);
  });

  // ==========================================================================
  // Expandable Cards - In-Place Content Expansion
  // ==========================================================================

  const expandables = document.querySelectorAll('.expandable');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Collapse all expandable cards
  function collapseAllExpandables(except) {
    expandables.forEach(card => {
      if (card !== except) {
        card.classList.remove('is-expanded');
      }
    });
  }

  expandables.forEach(card => {
    if (!isTouchDevice) {
      // Desktop: hover to expand
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-expanded');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-expanded');
      });
    } else {
      // Mobile/Touch: two-tap behavior
      card.addEventListener('click', (e) => {
        const isLink = card.tagName === 'A';
        const isExpanded = card.classList.contains('is-expanded');

        if (isExpanded && isLink) {
          // Already expanded and is a link - allow navigation
          return;
        }

        // First tap - expand and prevent link navigation
        e.preventDefault();
        collapseAllExpandables(card);
        card.classList.toggle('is-expanded');
      });
    }
  });

  // Close expanded cards when clicking outside (touch devices)
  if (isTouchDevice) {
    document.addEventListener('click', (e) => {
      const clickedExpandable = e.target.closest('.expandable');
      if (!clickedExpandable) {
        collapseAllExpandables();
      }
    });
  }

  // Initial state
  handleScroll();

  // ==========================================================================
  // Word-by-Word Reveal Animation for About Me Section
  // ==========================================================================

  function initWordReveal() {
    const profileText = document.querySelector('.profile__text');
    if (!profileText) return;

    const paragraphs = profileText.querySelectorAll('p');
    let wordIndex = 0;

    paragraphs.forEach(p => {
      const html = p.innerHTML;
      // Split by words while preserving HTML tags
      const words = html.split(/(\s+)/).filter(word => word.trim() !== '');

      p.innerHTML = words.map(word => {
        // Check if it's whitespace
        if (/^\s+$/.test(word)) return word;

        const delay = wordIndex * 30; // 30ms between each word
        wordIndex++;
        return `<span class="word-reveal" style="animation-delay: ${delay}ms">${word}</span>`;
      }).join(' ');
    });

    // Trigger animation when section is in view
    const profileSection = document.getElementById('profile');
    const wordRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          profileText.classList.add('words-animate');
          wordRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    if (profileSection) {
      wordRevealObserver.observe(profileSection);
    }
  }

  initWordReveal();

  // ==========================================================================
  // Subtle Hue Shift Animation (Pastel tones)
  // ==========================================================================

  const baseSaturation = 55;
  let hue = 165; // Starting teal hue
  let frameCount = 0;

  function updateHue() {
    frameCount++;
    if (frameCount % 2 !== 0) {
      requestAnimationFrame(updateHue);
      return;
    }
    hue = (hue + 0.03) % 360;
    // Adjust lightness and saturation based on theme
    const isLightMode = htmlElement.getAttribute('data-theme') === 'light';
    const lightness = isLightMode ? 35 : 75;
    const saturation = isLightMode ? 65 : baseSaturation;
    // Only update the primary color - alpha variants use color-mix() in CSS
    document.documentElement.style.setProperty(
      '--color-accent-primary',
      `hsl(${hue}, ${saturation}%, ${lightness}%)`
    );
    requestAnimationFrame(updateHue);
  }

  updateHue();

})();
