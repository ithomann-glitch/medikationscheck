(function () {
  'use strict';

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('site-header');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle (site-nav doubles as the mobile dropdown) ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');
  navToggle.addEventListener('click', function () {
    var isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  siteNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Precise anchor scrolling ---------- */
  // CSS scroll-padding-top uses a fixed guess at the header height, which
  // drifts whenever the header wraps to a taller layout (narrow viewports,
  // font loading, zoom) - the anchor then lands partly under the sticky
  // header or short/past the section. Computing the offset from the
  // header's real, current height on every click keeps every anchor
  // pixel-accurate to the section it points at.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = header.getBoundingClientRect().height + 16;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      if (history.pushState) history.pushState(null, '', '#' + id);
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', String(!expanded));
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + 'px';
    });
  });

  /* ---------- Anspruchscheck (Lead-Qualifizierung) ---------- */
  var widget = document.getElementById('check-widget');
  var progressBar = document.getElementById('check-progress-bar');
  var backBtn = document.getElementById('check-back');
  var answers = {};
  var history = ['1'];

  function showStep(step) {
    widget.querySelectorAll('.check-step').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-step') === step);
    });
    var numericSteps = ['1', '2', '3'];
    var idx = numericSteps.indexOf(step);
    if (idx > -1) {
      progressBar.style.width = ((idx + 1) / numericSteps.length * 100) + '%';
    } else {
      progressBar.style.width = '100%';
    }
    backBtn.hidden = step === '1';
  }

  widget.querySelectorAll('.check-answer').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var step = btn.getAttribute('data-step');
      var value = btn.getAttribute('data-value');
      answers[step] = value;

      // Frage 3 (Versicherungsstatus) entscheidet nur, ob die Beratung
      // kostenlos ist - privat Versicherte können trotzdem buchen.
      if (value === 'no' && step !== '3') {
        history.push('result-no');
        showStep('result-no');
        return;
      }

      var next;
      if (step === '1') next = '2';
      else if (step === '2') next = '3';
      else next = value === 'yes' ? 'result-yes' : 'result-private';

      history.push(next);
      showStep(next);
    });
  });

  backBtn.addEventListener('click', function () {
    if (history.length <= 1) return;
    history.pop();
    var prev = history[history.length - 1];
    showStep(prev);
  });

  /* ---------- Scroll-reveal for the problem section ---------- */
  var revealTargets = document.querySelectorAll('.problem-intro');
  if ('IntersectionObserver' in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Site navigation (scrollspy) ---------- */
  if (siteNav) {
    var siteNavLinks = Array.prototype.slice.call(siteNav.querySelectorAll('a'));
    var sections = siteNavLinks
      .map(function (link) { return document.getElementById(link.getAttribute('data-target')); })
      .filter(Boolean);

    var setActive = function (id) {
      siteNavLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('data-target') === id);
      });
    };

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

      sections.forEach(function (section) { observer.observe(section); });
    }
  }

})();
