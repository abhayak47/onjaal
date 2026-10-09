(function () {
  'use strict';
  var d = document;

  // Dynamic year
  var y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header shadow on scroll
  var header = d.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var btn = d.getElementById('menuBtn');
  var links = d.getElementById('navLinks');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    links.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () {
    setMenu(btn.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 821px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  // Scroll reveal
  var items = d.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Active nav link (single-page sections)
  var navAnchors = links.querySelectorAll('a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window && navAnchors.length) {
    var map = {};
    navAnchors.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navAnchors.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['products', 'solutions', 'about', 'contact'].forEach(function (id) {
      var el = d.getElementById(id); if (el) so.observe(el);
    });
  }

  // Tabs
  var tabs = d.querySelectorAll('.tab');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      d.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var next = tabs[(i + n + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  // Contact form: validates, never fakes a submission.
  // Set data-contact-email on the form to a verified address to enable a mailto draft.
  var form = d.getElementById('contactForm');
  if (form) {
    var status = d.getElementById('formStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'email'].forEach(function (id) {
        var input = form.elements[id];
        var valid = input.value.trim() !== '' && input.checkValidity();
        input.closest('.field').classList.toggle('invalid', !valid);
        input.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { input.focus(); ok = false; }
      });
      if (!ok) { status.className = 'form-status'; status.textContent = ''; return; }

      var to = (form.getAttribute('data-contact-email') || '').trim();
      status.className = 'form-status show';
      if (!to) {
        status.textContent = 'Thanks for your interest. This form is not connected to a submission service yet, so your message has not been sent.';
        return;
      }
      var body = 'Name: ' + form.elements.name.value + '\nEmail: ' + form.elements.email.value +
        '\nInterest: ' + form.elements.interest.value + '\n\n' + form.elements.message.value;
      status.textContent = 'Opening your email app with a draft. Please press send there to deliver your message.';
      window.location.href = 'mailto:' + encodeURIComponent(to) + '?subject=' +
        encodeURIComponent('Onjaal enquiry: ' + form.elements.interest.value) + '&body=' + encodeURIComponent(body);
    });
    form.addEventListener('input', function (e) {
      var f = e.target.closest('.field'); if (f) f.classList.remove('invalid');
    });
  }
})();
