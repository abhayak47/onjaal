(function () {
  'use strict';
  var d = document;

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
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 881px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Active nav link
  var navAnchors = links.querySelectorAll('a[href^="#"]');
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

  // Concept-screen tabs (keeps the illustrative sidebar in sync)
  var tabs = d.querySelectorAll('.tab');
  var rail = d.getElementById('rail');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      d.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (rail) {
      var its = rail.querySelectorAll('.item');
      its.forEach(function (li, i) { li.classList.toggle('on', i === Number(tab.getAttribute('data-rail')) - 1); });
    }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') n = -i; if (e.key === 'End') n = tabs.length - 1 - i;
      if (!n) return;
      e.preventDefault();
      var next = tabs[(i + n + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  // Contact form. Never reports a delivery that did not happen.
  // Set data-contact-email on the form to a verified address to enable a mailto draft.
  var form = d.getElementById('contactForm');
  if (!form) return;
  var status = d.getElementById('formStatus');
  var submitBtn = d.getElementById('submitBtn');
  var notice = d.getElementById('formNotice');
  var to = (form.getAttribute('data-contact-email') || '').trim();

  if (to) {
    submitBtn.textContent = 'Open email draft';
    d.getElementById('noticeText').textContent = 'Submitting opens a draft in your email app. Your message is only sent when you press send there.';
  }

  function showStatus(text, withCopy, copyText) {
    status.className = 'form-status show';
    status.textContent = '';
    var p = d.createElement('p');
    p.textContent = text;
    status.appendChild(p);
    if (withCopy) {
      var pre = d.createElement('textarea');
      pre.readOnly = true; pre.value = copyText; pre.rows = 5;
      pre.setAttribute('aria-label', 'Your prepared message');
      pre.style.cssText = 'width:100%;margin-top:10px;padding:10px;border:1px solid #c5cad6;border-radius:8px;font-size:.82rem;background:#fff';
      status.appendChild(pre);
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'btn btn-ghost btn-sm'; b.style.marginTop = '10px'; b.textContent = 'Copy message';
      b.addEventListener('click', function () {
        function done(ok) { b.textContent = ok ? 'Copied' : 'Press Ctrl/Cmd+C to copy'; if (!ok) { pre.focus(); pre.select(); } }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(copyText).then(function () { done(true); }, function () { done(false); });
        } else { done(false); }
      });
      status.appendChild(b);
    }
  }

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

    var body = 'Name: ' + form.elements.name.value.trim() + '\nEmail: ' + form.elements.email.value.trim() +
      '\nInterested in: ' + form.elements.interest.value + '\n\n' + form.elements.message.value.trim();

    if (!to) {
      showStatus('Not sent. This form isn’t connected to email yet, so nothing has been delivered. Your message is ready to copy below.', true, body);
      return;
    }
    showStatus('Opening your email app with a draft. Your message is only sent when you press send there.', false);
    window.location.href = 'mailto:' + encodeURIComponent(to) + '?subject=' +
      encodeURIComponent('Onjaal enquiry: ' + form.elements.interest.value) + '&body=' + encodeURIComponent(body);
  });
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field'); if (f) f.classList.remove('invalid');
  });
})();
