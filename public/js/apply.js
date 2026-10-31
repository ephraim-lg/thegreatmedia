/* THE GREAT MEDIA — apply.js
   Qualification form with two flows (full system / website only), inline
   validation (the error appears right above the button that was pressed), an
   honest fit decision shown after a short "reviewing" screen, and a post to the
   leads API. Nothing is ever lost: if the API can't confirm the save, the
   WhatsApp hand-off still carries the whole application. */

(function () {
  var API = 'https://tgm-leads-api.ephraimbanda888.workers.dev/lead';
  var WA_NUMBER = '260964576875';
  var form = document.getElementById('apply-form');
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var plan = params.get('plan') || '';
  var PLAN_BUDGET = { growth: 'starter', scale: 'growth', custom: 'premium' };
  var PLAN_NEED = { website: 'website', growth: 'system', scale: 'system', custom: 'system' };

  /* Step order per flow. "unsure" walks the full system flow so we learn the economics. */
  var FLOWS = {
    system:  ['need', '1', '2', '6', '7'],   // trimmed 2026-11: 5 steps, keeps every field the score + fit gate use
    website: ['need', '1', 'web', '6', '7']
  };
  var flow = 'system', order = FLOWS.system, idx = 0, started = false;

  function $(id) { return document.getElementById(id); }
  function val(name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function vals(name) { return Array.prototype.map.call(form.querySelectorAll('[name="' + name + '"]:checked'), function (el) { return el.value; }); }
  function text(id) { var el = $(id); return el ? el.value.trim() : ''; }
  function current() { return order[idx]; }

  function trackingContext() {
    var t = {};
    try { t = JSON.parse(sessionStorage.getItem('tgm_track') || '{}'); } catch (e) {}
    return {
      utm_source: t.utm_source || null, utm_medium: t.utm_medium || null, utm_campaign: t.utm_campaign || null,
      utm_content: t.utm_content || null, utm_term: t.utm_term || null, fbclid: t.fbclid || null,
      referrer: t.referrer || null, landing_page: t.landing_page || location.href
    };
  }

  /* Budget wording follows the flow: monthly management fee vs one-off project. */
  var BANDS = {
    system:  { low: ['Under K10,000', 'Below our minimum — we’ll be honest about fit'], starter: ['K10,000 – K20,000', 'Growth tier'], growth: ['K20,000 – K50,000', 'Scale tier'], premium: ['K50,000 – K100,000', 'Scale / Custom'], elite: ['K100,000+', 'Custom — dedicated team'] },
    website: { low: ['Under K7,500', 'Below our minimum — we’ll be honest about fit'], starter: ['K7,500 – K15,000', 'Landing page or small site'], growth: ['K15,000 – K35,000', 'Full business website'], premium: ['K35,000 – K75,000', 'Custom build or online store'], elite: ['K75,000+', 'Large custom platform'] }
  };
  var BAND_LABEL = { system: {}, website: {} };
  Object.keys(BANDS).forEach(function (f) { Object.keys(BANDS[f]).forEach(function (k) { BAND_LABEL[f][k] = BANDS[f][k][0] + (f === 'system' ? '/mo' : ' one-off'); }); });
  var TIME_LABEL = { now: 'Right now — this week', asap: 'This month', month: 'In 1–3 months', exploring: 'Just researching' };
  var READY_LABEL = { yes: 'Ready to decide within 7 days', partner: 'Needs a partner/director on the call', notyet: 'Not ready — gathering information' };

  function applyFlow() {
    var web = flow === 'website';
    $('budget-title').textContent = web ? 'What’s a realistic budget for the website?' : 'What’s a realistic monthly budget for acquisition?';
    $('budget-why').textContent = web
      ? 'One-off project fee. Conversion-built websites start at K7,500; full business sites and stores cost more. Hosting and domain are extra.'
      : 'This is the management fee. Ad spend is separate and paid directly to the platforms. Engagements start at K10,000/month — there’s no benefit to picking a band you can’t sustain for 90 days.';
    $('budget-lbl').textContent = web ? 'Project budget' : 'Monthly management budget';
    Object.keys(BANDS[flow]).forEach(function (k) {
      var t = form.querySelector('[data-b="' + k + '"]'), s = form.querySelector('[data-bs="' + k + '"]');
      if (t) t.textContent = BANDS[flow][k][0]; if (s) s.textContent = BANDS[flow][k][1];
    });
  }

  function showStep(id) {
    idx = order.indexOf(id); if (idx < 0) idx = 0;
    form.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('active', s.dataset.step === id); });
    var n = idx + 1, total = order.length, pct = Math.round((idx / (total - 1)) * 100);
    $('prog-label').textContent = 'Step ' + n + ' of ' + total;
    $('prog-pct').textContent = pct + '%';
    $('prog-fill').style.width = pct + '%';
    if (started) { var top = form.getBoundingClientRect().top + window.scrollY - 96; window.scrollTo({ top: top, behavior: 'smooth' }); }
    started = true;
    var first = form.querySelector('#step-' + id + ' input:not([type=radio]):not([type=checkbox]), #step-' + id + ' textarea');
    if (first && window.matchMedia('(min-width: 961px)').matches) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
  }

  function fail(id, msg) {
    var el = $('err-' + id);
    el.textContent = msg; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  function clear(id) { var el = $('err-' + id); if (el) { el.classList.remove('show'); el.textContent = ''; } }

  var validators = {
    need: function () {
      var n = val('need'); if (!n) return fail('need', 'Choose what you need — "not sure" is a valid answer.');
      flow = n === 'website' ? 'website' : 'system'; order = FLOWS[flow]; applyFlow();
      return true;
    },
    1: function () {
      if (!val('industry')) return fail('1', 'Choose the industry closest to your business.');
      if (!text('f-company')) return fail('1', 'Please enter your company name.');
      return true;
    },
    2: function () {
      if (!val('customer_value')) return fail('2', 'Choose roughly what one customer is worth to you.');
      return true;
    },
    3: function () {
      if (!vals('sources').length) return fail('3', 'Choose at least one — "None yet" is a valid answer.');
      if (!val('enquiries')) return fail('3', 'Roughly how many enquiries do you get a month?');
      if (!val('ad_spend')) return fail('3', 'What are you spending on ads today? "Nothing" is fine.');
      return true;
    },
    4: function () {
      if (!val('response_time')) return fail('4', 'How fast do enquiries get a reply today?');
      if (!val('follow_up_owner')) return fail('4', 'Who follows up with enquiries?');
      return true;
    },
    web: function () {
      if (!val('site_job')) return fail('web', 'What is the main job of the site?');
      if (text('f-pages').length < 8) return fail('web', 'List the pages or features you need — rough is fine.');
      if (!val('site_content')) return fail('web', 'Do you have content ready?');
      return true;
    },
    5: function () {
      if (text('f-goal').length < 12) return fail('5', 'Give us a real target — a number of enquiries, projects or revenue in 90 days.');
      return true;
    },
    6: function () {
      if (!val('budget')) return fail('6', 'Choose the budget band you can actually commit to.');
      if (!val('timeline')) return fail('6', 'When do you want to start?');
      if (!val('readiness')) return fail('6', 'Can you decide within 7 days if the plan makes sense?');
      return true;
    },
    7: function () {
      if (!text('f-name')) return fail('7', 'Please enter your name.');
      if (text('f-phone').replace(/\D/g, '').length < 9) return fail('7', 'Enter a WhatsApp number we can actually reach you on.');
      var em = text('f-email'); if (em && !/.+@.+\..+/.test(em)) return fail('7', 'That email address doesn’t look right.');
      return true;
    }
  };

  /* The honest gate. Money, then readiness, then economics. */
  function decideFit(a) {
    var web = a.need === 'website';
    if (a.budget === 'low') return { fit: false, reason: web
      ? 'a budget under K7,500 can’t cover a website built to convert — a cheap site that doesn’t bring enquiries costs more than it saves'
      : 'a management budget under K10,000 a month can’t fund all six stages of the system, so it wouldn’t pay for itself' };
    if (a.timeline === 'exploring') return { fit: false, reason: 'you’re still researching rather than ready to start — and we only open a build slot for businesses that are ready to move' };
    if (a.readiness === 'notyet') return { fit: false, reason: 'you’re not yet in a position to decide — we’d rather you come back when the budget and the decision-maker are ready' };
    if (!web && a.customer_value === 'Under K1,000' && a.budget === 'starter') return { fit: false, reason: 'with a customer worth under K1,000, paid acquisition at this level rarely pays back' };
    return { fit: true };
  }

  function collect() {
    return {
      need: val('need'), industry: val('industry'), company: text('f-company'), location: text('f-location'), website: text('f-website'),
      customer_value: val('customer_value'), revenue: val('revenue'),
      sources: vals('sources'), enquiries: val('enquiries'), ad_spend: val('ad_spend'),
      response_time: val('response_time'), follow_up_owner: val('follow_up_owner'), bottleneck: text('f-bottleneck'),
      site_job: val('site_job'), site_pages: text('f-pages'), site_content: val('site_content'),
      goal: text('f-goal'), budget: val('budget'), timeline: val('timeline'), readiness: val('readiness'),
      name: text('f-name'), role: text('f-role'), phone: text('f-phone'), email: text('f-email'), plan: plan
    };
  }

  function whatsappText(a) {
    var web = a.need === 'website';
    return [
      'Hello Ephraim, I just applied on thegreatmediazm.com.',
      '',
      'Need: ' + (web ? 'Website / landing page only' : a.need === 'unsure' ? 'Not sure — recommend' : 'Full acquisition system'),
      'Name: ' + a.name + (a.role ? ' (' + a.role + ')' : ''),
      'Company: ' + a.company + (a.location ? ' — ' + a.location : ''),
      'Industry: ' + a.industry,
      a.website ? 'Web/social: ' + a.website : null,
      'Customer value: ' + a.customer_value,
      'Monthly revenue: ' + a.revenue,
      web ? 'Site job: ' + a.site_job + ' · Content: ' + a.site_content : 'Lead sources: ' + (a.sources.join(', ') || '—'),
      web ? 'Pages/features: ' + a.site_pages : 'Enquiries/month: ' + a.enquiries + ' · Ad spend: ' + a.ad_spend,
      web ? null : 'Reply time: ' + a.response_time + ' · Follow-up: ' + a.follow_up_owner,
      a.bottleneck ? 'Bottleneck: ' + a.bottleneck : null,
      '90-day goal: ' + a.goal,
      'Budget: ' + (BAND_LABEL[flow][a.budget] || a.budget) + ' · Start: ' + (TIME_LABEL[a.timeline] || a.timeline),
      'Readiness: ' + (READY_LABEL[a.readiness] || a.readiness),
      a.email ? 'Email: ' + a.email : null
    ].filter(Boolean).join('\n');
  }

  /* "Reviewing your application" — a few seconds, each criterion ticks in turn.
     The decision is already made; the pause makes the verdict feel considered,
     and a not-a-fit answer lands better after a visible review than instantly. */
  function runEvaluation(done) {
    var items = document.querySelectorAll('.eval-list li'), i = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stepMs = reduce ? 0 : 750;
    (function next() {
      if (i > 0) items[i - 1].classList.replace('checking', 'done');
      if (i === items.length) return setTimeout(done, reduce ? 0 : 500);
      items[i].classList.add('checking'); i++;
      setTimeout(next, stepMs);
    })();
  }

  var submitting = false;
  async function submit() {
    if (submitting) return; submitting = true;
    var a = collect();
    var fit = decideFit(a);
    var btn = $('submit-btn'); btn.disabled = true; btn.textContent = 'Submitting…';
    var web = a.need === 'website';

    window.tgmTrack('ApplicationComplete', { fit: fit.fit, need: a.need, budget: a.budget, industry: a.industry });
    if (fit.fit) window.tgmTrack('Lead', { content_name: web ? 'Website' : 'System', currency: 'ZMW', value: { elite: 100000, premium: 50000, growth: 20000 }[a.budget] || 10000 });

    form.style.display = 'none';
    $('evaluating').classList.add('show');
    var wrapTop = form.parentNode.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: wrapTop, behavior: 'smooth' });
    var evalDone = new Promise(function (r) { runEvaluation(r); });

    var saved = false;
    try {
      var res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({
          name: a.name, phone: a.phone, email: a.email, businessName: a.company, businessType: a.industry,
          service: web ? 'website' : a.need === 'unsure' ? 'unsure' : 'system',
          goal: a.goal, pages: web ? a.site_pages : a.website, audience: a.location, budget: a.budget, timeline: a.timeline,
          source: a.sources.join(', '),
          customer_value: a.customer_value, revenue: a.revenue, enquiries: a.enquiries, ad_spend: a.ad_spend,
          response_time: a.response_time, follow_up_owner: a.follow_up_owner, bottleneck: a.bottleneck, role: a.role,
          site_job: a.site_job, site_content: a.site_content, website: a.website, readiness: a.readiness,
          plan: a.plan, qualified: fit.fit, fit_reason: fit.reason || null, flow: flow
        }, trackingContext()))
      });
      var out = await res.json().catch(function () { return {}; });
      saved = res.ok && out.ok === true;
      if (!saved) console.error('Application not saved:', res.status, out);
    } catch (e) { console.error('Application not saved (network):', e); }

    await evalDone;
    $('evaluating').classList.remove('show');
    if (fit.fit) {
      $('r-name').textContent = a.name.split(' ')[0] || 'there';
      $('wa-link').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(whatsappText(a));
      if (!saved) $('save-warn').style.display = 'block';
      $('result-fit').classList.add('show');
    } else {
      $('nofit-reason').textContent = fit.reason;
      $('nofit-req').textContent = web
        ? 'A budget of K7,500 or more for a site built to convert, content or the budget to have it produced, and a decision-maker ready to start.'
        : 'A customer worth K5,000 or more, a management budget of K10,000+ a month, ad spend on top, a start within the next 90 days, and a decision-maker ready to commit.';
      $('result-nofit').classList.add('show');
    }
    try { history.replaceState(null, '', location.pathname + (fit.fit ? '?done=fit' : '?done=nofit')); } catch (e) {}
    window.scrollTo({ top: wrapTop, behavior: 'smooth' });
  }

  form.addEventListener('click', function (e) {
    var next = e.target.closest('[data-next]'), prev = e.target.closest('[data-prev]');
    if (next) {
      var id = next.dataset.next; clear(id);
      if (!validators[id]()) return;
      if (id === 'need') window.tgmTrack('ApplicationStart', { need: val('need'), plan: plan || 'none' });
      if (idx === order.length - 1) { submit(); return; }
      showStep(order[idx + 1]);
    } else if (prev) { clear(prev.dataset.prev); showStep(order[Math.max(0, idx - 1)]); }
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); var b = form.querySelector('#step-' + current() + ' [data-next]'); if (b) b.click(); }
  });
  /* Deliberately NOT clearing the error on 'change': change fires on blur, i.e. on
     mousedown of the Continue button, and collapsing the error box then shifts the
     button ~60px before the click lands — the tap misses and the button looks dead. */

  /* Arriving from a pricing tier pre-selects the need and the budget band */
  if (PLAN_NEED[plan]) { var rn = form.querySelector('[name="need"][value="' + PLAN_NEED[plan] + '"]'); if (rn) rn.checked = true; }
  if (PLAN_BUDGET[plan]) { var rb = form.querySelector('[name="budget"][value="' + PLAN_BUDGET[plan] + '"]'); if (rb) rb.checked = true; }
  applyFlow();
  showStep('need');
})();
