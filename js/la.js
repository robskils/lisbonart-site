/* ================================================================
   LisbonArt.pt — la.js
   ================================================================ */

(function () {
  'use strict';

  /* ── Scroll header ─────────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav link ───────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.site-nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === '/' + location.pathname.split('/')[1] + '/') {
      link.classList.add('active');
    }
    if (location.pathname === '/' && link.getAttribute('href') === '/') {
      link.classList.add('active');
    }
  });

  /* ── Mobile nav ────────────────────────────────────────────── */
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Fade-up on scroll ─────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

    // Stagger resets per section so delays don't compound across the whole page
    document.querySelectorAll('section, .artist-spotlight, .events-section, .trust-pillars, .email-capture, .browse-bar').forEach(section => {
      section.querySelectorAll('.fade-up').forEach((el, i) => {
        el.style.transitionDelay = (i * 0.08) + 's';
      });
    });

    fadeEls.forEach(el => observer.observe(el));

    // Fallback: force visible after 1.5s in case observer doesn't fire
    setTimeout(() => {
      fadeEls.forEach(el => el.classList.add('visible'));
    }, 1500);
  }

  /* ── Scroll track arrows ───────────────────────────────────── */
  document.querySelectorAll('.scroll-track-wrap').forEach(wrap => {
    const track = wrap.querySelector('.scroll-track');
    const prev  = wrap.querySelector('.scroll-arrow.prev');
    const next  = wrap.querySelector('.scroll-arrow.next');
    if (!track) return;

    const scroll = dir => {
      track.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };
    prev && prev.addEventListener('click', () => scroll(-1));
    next && next.addEventListener('click', () => scroll(1));

    // Show/hide arrows
    const updateArrows = () => {
      if (!prev || !next) return;
      prev.style.opacity = track.scrollLeft < 20 ? '0.3' : '1';
      next.style.opacity = track.scrollLeft + track.clientWidth >= track.scrollWidth - 20 ? '0.3' : '1';
    };
    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
  });

  /* ── Gallery filter ────────────────────────────────────────── */
  const filterSearch   = document.getElementById('filter-search');
  const filterArtist   = document.getElementById('filter-artist');
  const filterGenre    = document.getElementById('filter-genre');
  const filterCountEl  = document.getElementById('filter-count');
  const artworkCards   = document.querySelectorAll('.artwork-grid .artwork-card');
  const noResults      = document.querySelector('.no-results');

  function applyFilters() {
    if (!artworkCards.length) return;
    const q      = filterSearch  ? filterSearch.value.trim().toLowerCase() : '';
    const artist = filterArtist  ? filterArtist.value  : '';
    const genre  = filterGenre   ? filterGenre.value   : '';

    let visible = 0;
    artworkCards.forEach(card => {
      const title    = (card.dataset.title  || '').toLowerCase();
      const cardArtist = card.dataset.artist || '';
      const cardGenre  = card.dataset.genre  || '';

      const matchQ      = !q      || title.includes(q) || cardArtist.toLowerCase().includes(q);
      const matchArtist = !artist || cardArtist === artist;
      const matchGenre  = !genre  || cardGenre === genre;

      const show = matchQ && matchArtist && matchGenre;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (filterCountEl) filterCountEl.textContent = visible + ' piece' + (visible !== 1 ? 's' : '');
    if (noResults) noResults.classList.toggle('visible', visible === 0);
  }

  [filterSearch, filterArtist, filterGenre].forEach(el => {
    if (el) el.addEventListener('input', applyFilters);
  });

  /* ── Reserve / cart ────────────────────────────────────────── */
  let cart = JSON.parse(sessionStorage.getItem('la-cart') || '[]');

  function updateCartUI() {
    document.querySelectorAll('.reserve-count').forEach(el => {
      el.textContent = cart.length;
      el.dataset.count = cart.length;
    });
  }
  updateCartUI();

  document.querySelectorAll('[data-reserve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.reserve;
      if (!cart.includes(id)) {
        cart.push(id);
        sessionStorage.setItem('la-cart', JSON.stringify(cart));
        updateCartUI();
        btn.textContent = 'Reserved ✓';
        btn.disabled = true;
      }
    });
  });

  /* ── Email form ────────────────────────────────────────────── */
  document.querySelectorAll('.email-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button[type="submit"]');
      if (!input || !input.value) return;
      // In production: POST to a Cloudflare Worker
      btn.textContent = 'You\'re on the list ✓';
      btn.disabled = true;
      input.disabled = true;
      input.value = '';
    });
  });

  /* ── Artwork card links ────────────────────────────────────── */
  document.querySelectorAll('.artwork-card[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });

})();
