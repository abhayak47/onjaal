/* Onjaal site script. No dependencies. Progressive enhancement only:
   the page is readable without it (see .no-js rules in styles.css). */
(function () {
  'use strict';
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Header state on scroll */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu: toggle, Escape, outside click, focus trap */
  var btn = $('#menuBtn'), nav = $('#navLinks');
  if (btn && nav) {
    var items = function () { return [btn].concat($$('a', nav)); };
    var setMenu = function (open, returnFocus) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
      if (open) { var first = $('a', nav); if (first) first.focus(); }
      else if (returnFocus) btn.focus();
    };
    var isOpen = function () { return btn.getAttribute('aria-expanded') === 'true'; };
    btn.addEventListener('click', function () { setMenu(!isOpen(), false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
    d.addEventListener('click', function (e) {
      if (isOpen() && !e.target.closest('.nav')) setMenu(false, false);
    });
    d.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key !== 'Tab') return;
      var list = items(), first = list[0], last = list[list.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false, false); });
  }

  /* Current section in nav */
  if ('IntersectionObserver' in window && nav) {
    var links = {};
    $$('a[href^="#"]', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        links[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var el = d.getElementById(id); if (el) obs.observe(el); });
  }

  /* Task tabs: each task shows one concept screen and highlights the matching sidebar item */
  var tabs = $$('.task');
  var side = $('#side');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (side) $$('li', side).forEach(function (li, i) { li.classList.toggle('on', i === Number(tab.getAttribute('data-side')) - 1); });
  }
  if (tabs.length) {
    selectTab(tabs[0]);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) {
        var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home') step = -i;
        if (e.key === 'End') step = tabs.length - 1 - i;
        if (step === undefined) return;
        e.preventDefault();
        var next = tabs[(i + step + tabs.length) % tabs.length];
        selectTab(next); next.focus();
      });
    });
  }

  /* Concept window: selectable rows drive the detail panel; filters hide rows */
  $$('[data-select-group]').forEach(function (group) {
    var panel = $('[data-detail]', group);
    var rowsLi = $$('.rows > li', group);
    function show(li) {
      rowsLi.forEach(function (x) { $('.row', x).setAttribute('aria-pressed', String(x === li)); });
      var src = $('.detail-src', li);
      panel.innerHTML = src ? src.innerHTML : '';
    }
    rowsLi.forEach(function (li) { $('.row', li).addEventListener('click', function () { show(li); }); });
    var initial = rowsLi.filter(function (li) { return $('.row', li).getAttribute('aria-pressed') === 'true'; })[0] || rowsLi[0];
    if (initial) show(initial);
    group._show = show; group._rows = rowsLi;
  });

  $$('.filter').forEach(function (f) {
    f.addEventListener('click', function () {
      var wrap = f.closest('.tabpanel');
      $$('.filter', wrap).forEach(function (x) { x.setAttribute('aria-pressed', String(x === f)); });
      var key = f.getAttribute('data-filter');
      var group = $('[data-select-group]', wrap);
      var visible = [];
      group._rows.forEach(function (li) {
        var hide = key !== 'all' && li.getAttribute('data-status') !== key;
        li.hidden = hide;
        if (!hide) visible.push(li);
      });
      var current = group._rows.filter(function (li) { return $('.row', li).getAttribute('aria-pressed') === 'true'; })[0];
      if (visible.length && (!current || current.hidden)) group._show(visible[0]);
      if (!visible.length) $('[data-detail]', group).innerHTML = '<p class="role">No requests match this filter.</p>';
    });
  });

  /* Enquiry form.
     Configure ONE of these on the <form>:
       data-endpoint       a form service URL (e.g. https://formspree.io/f/xxxx) that accepts JSON POST
       data-contact-email  a verified address; opens a pre-filled email draft instead
     With neither set, the form never claims to have sent anything. */
  var form = $('#contactForm');
  if (!form) return;
  var status = $('#formStatus'), submit = $('#submitBtn'), notice = $('#formNotice');
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();
  var email = (form.getAttribute('data-contact-email') || '').trim();
  var busy = false;

  if (endpoint) notice.hidden = true;
  else if (email) $('#noticeText').textContent = 'Sending opens a draft in your email app. Your enquiry is only sent when you press send there.';

  var msgOpt = $('#msgOpt');
  function intentValue() { var c = form.querySelector('input[name=intent]:checked'); return c ? c.value : ''; }
  function needsMessage() { var v = intentValue(); return v === 'Ask a question' || v === 'Something else'; }
  $$('input[name=intent]', form).forEach(function (r) {
    r.addEventListener('change', function () {
      msgOpt.textContent = needsMessage() ? '(required)' : '(optional)';
      var m = form.elements.message.closest('.field'); if (!needsMessage()) m.classList.remove('invalid');
    });
  });

  function setStatus(msg, kind) {
    status.className = 'form-status show' + (kind ? ' ' + kind : '');
    status.textContent = msg;
  }
  function validField(input) {
    var v = input.value.trim();
    var ok = input.name === 'message' ? (!needsMessage() || v.length > 0) : v.length > 0 && input.checkValidity();
    var f = input.closest('.field');
    f.classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }
  ['name', 'email', 'message'].forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener('blur', function () { if (el.value || el.closest('.field').classList.contains('invalid')) validField(el); });
    el.addEventListener('input', function () { if (el.closest('.field').classList.contains('invalid')) validField(el); });
  });

  function copyBlock(text) {
    var ta = d.createElement('textarea');
    ta.readOnly = true; ta.rows = 6; ta.value = text; ta.setAttribute('aria-label', 'Your prepared message');
    var b = d.createElement('button');
    b.type = 'button'; b.className = 'btn btn-secondary btn-sm'; b.textContent = 'Copy message';
    b.addEventListener('click', function () {
      var done = function (ok) { b.textContent = ok ? 'Copied' : 'Select the text and copy it'; if (!ok) { ta.focus(); ta.select(); } };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
    status.appendChild(ta); status.appendChild(b);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var fields = ['name', 'email', 'message'].map(function (n) { return form.elements[n]; });
    var bad = fields.filter(function (el) { return !validField(el); });
    if (bad.length) { setStatus('Please fix the highlighted fields and try again.', 'error'); bad[0].focus(); return; }
    if (form.elements.website.value) return; /* honeypot: bots only */

    var data = {
      name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
      organization: form.elements.organization.value.trim(), intent: intentValue(),
      message: form.elements.message.value.trim()
    };
    var text = 'Name: ' + data.name + '\nEmail: ' + data.email +
      (data.organization ? '\nOrganization: ' + data.organization : '') +
      '\nEnquiry: ' + data.intent + (data.message ? '\n\n' + data.message : '');

    if (endpoint) {
      busy = true; submit.disabled = true; submit.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
      setStatus('Sending your enquiry…');
      var ctl = ('AbortController' in window) ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : null;
      fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        form.hidden = true;
        var ok = $('#success'); ok.classList.add('show'); ok.focus();
      }).catch(function () {
        setStatus('Your enquiry could not be sent. Please check your connection and try again. Nothing has been lost; your details are still in the form.', 'error');
      }).then(function () {
        if (timer) clearTimeout(timer);
        busy = false; submit.disabled = false; submit.textContent = 'Send enquiry'; form.removeAttribute('aria-busy');
      });
      return;
    }

    if (email) {
      setStatus('Opening a draft in your email app. Your enquiry is only sent when you press send there.');
      window.location.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Onjaal enquiry: ' + data.intent) + '&body=' + encodeURIComponent(text);
      return;
    }

    setStatus('Not sent. This form isn’t connected to an inbox yet, so nothing has been delivered. Your message is ready to copy below.');
    copyBlock(text);
  });
})();
