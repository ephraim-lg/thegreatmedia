/* THE GREAT MEDIA — site.js
   Global behaviour: nav, drawer, reveal-on-scroll, hero flow animation,
   sticky mobile CTA, funnel event tracking, campaign capture. No frameworks. */

/* ── Campaign capture ───────────────────────────────────────────────────────
   Paid traffic lands on whatever page the ad points at and only reaches the
   application later, by which time the ?utm_* parameters are gone. Stash them
   on first arrival so every application can be traced back to the ad that
   paid for it. First touch wins. */
(function captureCampaign() {
  try {
    var existing = JSON.parse(sessionStorage.getItem('tgm_track') || 'null');
    if (existing && existing.landing_page) return;
    var q = new URLSearchParams(location.search);
    sessionStorage.setItem('tgm_track', JSON.stringify({
      utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'),
      utm_content: q.get('utm_content'), utm_term: q.get('utm_term'), fbclid: q.get('fbclid'),
      referrer: document.referrer || null, landing_page: location.href
    }));
  } catch (e) { /* private mode — attribution is a nice-to-have, never a blocker */ }
})();

/* ── Funnel events ──────────────────────────────────────────────────────────
   One helper so every stage of the funnel is named consistently in Meta:
   PageView (pixel base) → ApplyClick → ApplicationStart → ApplicationComplete
   → Lead (qualified only). Contact = WhatsApp click. */
window.tgmTrack = function (name, data) {
  try {
    if (typeof fbq !== 'function') return;
    var std = { Lead: 1, Contact: 1, ViewContent: 1 };
    fbq(std[name] ? 'track' : 'trackCustom', name, data || {});
  } catch (e) {}
};

/* ── Capacity (real scarcity) ──────────────────────────────────────────────
   A lean agency can only build a few systems a month properly. Update this
   at the start of every month — it drives every "slots" line on the site.
   Set left to 0 to show a waitlist message instead of a countdown. */
window.TGM_CAPACITY = { max: 3, month: 'October 2026', left: 2 };

document.addEventListener('DOMContentLoaded', function () {
  var cap = window.TGM_CAPACITY;
  var line = cap.left > 0
    ? 'We onboard a maximum of ' + cap.max + ' new systems a month so every build gets done properly. ' + cap.month + ': ' + cap.left + ' of ' + cap.max + ' build slots still open.'
    : 'We onboard a maximum of ' + cap.max + ' new systems a month. ' + cap.month + ' is full — apply now for the next slot.';
  document.querySelectorAll('[data-slots-line]').forEach(function (el) { el.textContent = line; });
  document.querySelectorAll('[data-slots-pill]').forEach(function (el) { el.textContent = cap.left > 0 ? cap.left + ' build slot' + (cap.left === 1 ? '' : 's') + ' left for ' + cap.month : cap.month + ' is full — next slot on application'; });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Active nav link */
  var path = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').replace(/\.html$/, '');
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === path) a.classList.add('active');
  });

  /* Drawer */
  var burger = document.getElementById('burger'), drawer = document.getElementById('drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { drawer.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; });
    });
  }

  /* Reveal on scroll */
  var rv = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) { rv.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* Hero flow — light travels Ad → … → Measurement */
  var steps = document.querySelectorAll('.flow-step');
  if (steps.length) {
    var i = 0;
    var tick = function () {
      steps.forEach(function (s, k) { s.classList.toggle('on', k <= i); });
      i = (i + 1) % (steps.length + 2);
    };
    tick();
    if (!reduce) setInterval(tick, 900);
    else steps.forEach(function (s) { s.classList.add('on'); });
  }

  /* Count-up numbers: <span data-count="100000" data-prefix="K" data-suffix="+"> */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = Number(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '', suffix = el.getAttribute('data-suffix') || '';
    var fmt = function (n) { return prefix + Math.round(n).toLocaleString('en-US') + suffix; };
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = fmt(target); return; }
    var seen = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function frame(now) {
        var p = Math.min(1, (now - t0) / dur); p = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * p);
        if (p < 1) requestAnimationFrame(frame);
      })(t0);
    }, { threshold: 0.5 });
    seen.observe(el);
  });

  /* Sticky mobile CTA appears once the hero CTA has scrolled away */
  var sticky = document.getElementById('sticky-cta'), heroCta = document.querySelector('[data-hero-cta]');
  if (sticky) {
    document.body.classList.add('has-sticky');
    if (heroCta && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { sticky.classList.toggle('show', !en[0].isIntersecting); }, { threshold: 0 }).observe(heroCta);
    } else { sticky.classList.add('show'); }
  }

  /* Track every route into the application + WhatsApp taps */
  document.querySelectorAll('a[href*="apply"]').forEach(function (a) {
    a.addEventListener('click', function () { window.tgmTrack('ApplyClick', { placement: a.getAttribute('data-place') || a.closest('section')?.id || 'unknown' }); });
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener('click', function () { window.tgmTrack('Contact', { content_name: 'WhatsApp' }); });
  });

  /* Cookie notice — one line, dismissable, remembered */
  var ck = document.getElementById('cookie');
  if (ck) {
    /* Never cover the first screen's CTA: show only once the visitor has scrolled. */
    var dismissed = false; try { dismissed = !!localStorage.getItem('tgm_cookie'); } catch (e) {}
    if (!dismissed) {
      var onScroll = function () { if (window.scrollY > 500) { ck.classList.add('show'); window.removeEventListener('scroll', onScroll); } };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    ck.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem('tgm_cookie', '1'); } catch (e) {}
      ck.classList.remove('show');
    });
  }
});
