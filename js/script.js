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

  /* ---------- Leistung-Karten (Wechselwirkungen etc.) ---------- */
  document.querySelectorAll('.leistung-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var detail = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.firstChild.textContent = expanded ? 'Mehr erfahren' : 'Weniger anzeigen';
      detail.style.maxHeight = expanded ? null : detail.scrollHeight + 'px';
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

  /* ---------- Rotating question headline in the problem section ---------- */
  var problemSlider = document.getElementById('problem-slider');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (problemSlider && !reducedMotion) {
    var sliderQuestions = [
      'Verträgt sich das eigentlich alles?',
      'Wurde etwas doppelt verordnet?',
      'Woher kommt die Müdigkeit?',
      'Wer hat noch den Überblick?'
    ];
    var sliderIndex = 0;
    setInterval(function () {
      sliderIndex = (sliderIndex + 1) % sliderQuestions.length;
      problemSlider.classList.add('is-fading');
      setTimeout(function () {
        problemSlider.textContent = sliderQuestions[sliderIndex];
        problemSlider.classList.remove('is-fading');
      }, 300);
    }, 3200);
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

    // Picks whichever section's top has most recently scrolled past the
    // reference line below the header - i.e. exactly the section we're
    // currently inside. An IntersectionObserver with a fixed-height
    // "detection band" instead marks every section overlapping that band
    // as active independently; for a short section (like Anspruchscheck)
    // that can fire together with the next section right after it, and
    // whichever callback runs last wins the highlight - not necessarily
    // the one actually in view. Comparing against a single line avoids
    // that ambiguity regardless of how tall any given section is.
    var updateActive = function () {
      // Near the very bottom of the page there may not be enough room
      // left to scroll the last section's top past the reference line
      // (nothing below it but the footer) - treat that as "in" the last
      // section rather than leaving the previous one highlighted.
      var atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      var refY = header.getBoundingClientRect().height + 24;
      var current = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= refY) current = section;
      });
      setActive(current.id);
    };

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateActive();
        ticking = false;
      });
    }, { passive: true });
    updateActive();
  }

})();
