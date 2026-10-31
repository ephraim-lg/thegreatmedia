/* Free ad audit form → tgm-leads-api /lead (flow "audit"). Every response is readable, so a failed save is shown, not hidden. */
(function () {
  var API = 'https://tgm-leads-api.ephraimbanda888.workers.dev/lead', WA_NUMBER = '260964576875';
  var form = document.getElementById('audit-form'); if (!form) return;
  var err = document.getElementById('audit-err'), btn = document.getElementById('audit-btn');
  function v(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function tracking() { var t = {}; try { t = JSON.parse(sessionStorage.getItem('tgm_track') || '{}'); } catch (e) {}
    return { utm_source: t.utm_source || null, utm_medium: t.utm_medium || null, utm_campaign: t.utm_campaign || null, utm_content: t.utm_content || null, utm_term: t.utm_term || null,
             fbclid: t.fbclid || null, referrer: t.referrer || null, landing_page: t.landing_page || location.href }; }
  form.addEventListener('submit', async function (e) {
    e.preventDefault(); err.textContent = '';
    var missing = ['name', 'company', 'phone', 'link', 'country', 'ads', 'value'].filter(function (n) { return !v(n); });
    if (missing.length) { err.textContent = 'Almost — please fill in every field except the last one.'; return; }
    if (v('phone').replace(/\D/g, '').length < 9) { err.textContent = 'That phone number looks short. Include your country code, e.g. +44 or +1.'; return; }
    btn.disabled = true; btn.textContent = 'Sending…';
    var notes = ['FREE AD AUDIT REQUEST', 'Link: ' + v('link'), 'Based in: ' + v('country'), 'Running ads: ' + v('ads'), 'Customer value: ' + v('value'), v('notes') ? 'Notes: ' + v('notes') : ''].filter(Boolean).join('\n');
    var ok = false;
    try {
      var res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({
        name: v('name'), phone: v('phone'), email: v('email') || null, businessName: v('company'), service: 'audit', audience: v('country'),
        pages: v('link'), customer_value: v('value'), ad_spend: v('ads'), flow: 'audit', qualified: true, notes_override: notes
      }, tracking())) });
      var out = await res.json().catch(function () { return {}; }); ok = res.ok && out.ok === true;
    } catch (x) { ok = false; }
    if (window.tgmTrack) window.tgmTrack('Lead', { content_name: 'Free ad audit', country: v('country') });
    if (!ok) { btn.disabled = false; btn.innerHTML = 'Send me my free audit <span class="arrow">→</span>';
      err.innerHTML = 'That didn\'t save on our side. Please <a class="link" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hi! I want a free ad audit for ' + v('company') + ': ' + v('link')) + '" target="_blank" rel="noopener">send it on WhatsApp</a> instead.'; return; }
    document.getElementById('audit-name').textContent = v('name').split(' ')[0] || 'friend';
    document.getElementById('audit-wa').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hi Ephraim, I just requested a free ad audit for ' + v('company') + '.');
    form.style.display = 'none'; document.getElementById('audit-done').classList.add('show');
  });
})();
