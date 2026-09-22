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
    widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  widget.querySelectorAll('.check-answer').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var step = btn.getAttribute('data-step');
      var value = btn.getAttribute('data-value');
      answers[step] = value;

      if (value === 'no') {
        history.push('result-no');
        showStep('result-no');
        return;
      }

      var next;
      if (step === '1') next = '2';
      else if (step === '2') next = '3';
      else next = 'result-yes';

      history.push(next);
      showStep(next);

      if (next === 'result-yes') {
        // Direkte Weiterleitung zur Terminbuchung, ausgelöst innerhalb des
        // Klick-Handlers, damit Browser das Öffnen nicht als Popup blockieren.
        window.open('https://termin.skapo.de', '_blank', 'noopener');
      }
    });
  });

  backBtn.addEventListener('click', function () {
    if (history.length <= 1) return;
    history.pop();
    var prev = history[history.length - 1];
    showStep(prev);
  });

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
