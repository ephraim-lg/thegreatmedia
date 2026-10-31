// One-off patch: need-selection step, website-only branch, faster start option, dynamic budget labels.
const fs = require('fs');
const p = 'src/pages/apply.html';
let h = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('missing: ' + a.slice(0, 60)); h = h.replace(a, b); };

rep("Seven short steps, about four minutes.", "A few short steps, about four minutes.");
rep('<span id="prog-label">Step 1 of 7</span><span id="prog-pct">14%</span>', '<span id="prog-label">Step 1 of 7</span><span id="prog-pct">0%</span>');

rep('          <!-- STEP 1 · BUSINESS -->\n          <div class="step active" id="step-1" data-step="1">',
`          <!-- STEP 0 · NEED -->
          <div class="step active" id="step-need" data-step="need">
            <h2>What do you need?</h2>
            <p class="why">Pick the closest. If you're not sure, choose the last option and we'll tell you honestly what makes sense.</p>
            <div class="q">
              <div class="opts" style="grid-template-columns:1fr" role="radiogroup" aria-label="What you need">
                <label class="opt"><input type="radio" name="need" value="system"><span class="t">The full customer acquisition system</span><span class="s">Ads + landing page + qualification + follow-up + tracking, managed monthly. From K10,000/month.</span></label>
                <label class="opt"><input type="radio" name="need" value="website"><span class="t">A website or landing page only</span><span class="s">A conversion-built site, one-off project. From K7,500. You run the traffic (or add the system later).</span></label>
                <label class="opt"><input type="radio" name="need" value="unsure"><span class="t">Not sure — tell me what I need</span><span class="s">Answer the questions and we'll recommend the right route on the diagnostic call.</span></label>
              </div>
            </div>
            <div class="step-error" id="err-need"></div>
            <div class="step-nav"><button type="button" class="btn btn-primary" data-next="need">Continue <span class="arrow">→</span></button></div>
          </div>

          <!-- STEP 1 · BUSINESS -->
          <div class="step" id="step-1" data-step="1">`);

rep('<div class="step-nav"><button type="button" class="btn btn-primary" data-next="1">Continue <span class="arrow">→</span></button></div>',
    '<div class="step-nav"><button type="button" class="btn btn-ghost" data-prev="1">Back</button><button type="button" class="btn btn-primary" data-next="1">Continue <span class="arrow">→</span></button></div>');

rep('          <!-- STEP 5 · GOAL -->',
`          <!-- STEP W · WEBSITE SCOPE (website-only flow) -->
          <div class="step" id="step-web" data-step="web">
            <h2>What should the website do?</h2>
            <p class="why">A site has one job. Tell us the job and roughly what it needs to contain.</p>
            <div class="q">
              <span class="lbl">Main job of the site</span>
              <div class="opts two">
                <label class="opt"><input type="radio" name="site_job" value="Generate enquiries / quotes"><span class="t">Generate enquiries &amp; quotes</span></label>
                <label class="opt"><input type="radio" name="site_job" value="Take bookings"><span class="t">Take bookings</span></label>
                <label class="opt"><input type="radio" name="site_job" value="Sell products online"><span class="t">Sell products online</span></label>
                <label class="opt"><input type="radio" name="site_job" value="Credibility / corporate presence"><span class="t">Credibility &amp; corporate presence</span></label>
              </div>
            </div>
            <div class="q"><label for="f-pages">What pages or features do you need? <span class="hint">rough is fine</span></label><textarea class="field" id="f-pages" name="site_pages" placeholder="e.g. Home, services, gallery of past jobs, quote form, WhatsApp button, Google Maps"></textarea></div>
            <div class="q">
              <span class="lbl">Do you have content ready? <span class="hint">photos, text, logo</span></span>
              <div class="opts">
                <label class="opt"><input type="radio" name="site_content" value="Yes, most of it"><span class="t">Yes, most of it</span></label>
                <label class="opt"><input type="radio" name="site_content" value="Some"><span class="t">Some</span></label>
                <label class="opt"><input type="radio" name="site_content" value="No, need help"><span class="t">No — I need help with it</span></label>
              </div>
            </div>
            <div class="step-error" id="err-web"></div>
            <div class="step-nav"><button type="button" class="btn btn-ghost" data-prev="web">Back</button><button type="button" class="btn btn-primary" data-next="web">Continue <span class="arrow">→</span></button></div>
          </div>

          <!-- STEP 5 · GOAL -->`);

rep("<h2>What's a realistic monthly budget for acquisition?</h2>", '<h2 id="budget-title">What\'s a realistic monthly budget for acquisition?</h2>');
rep('<p class="why">This is the management fee. Ad spend is separate and paid directly to the platforms.', '<p class="why" id="budget-why">This is the management fee. Ad spend is separate and paid directly to the platforms.');
rep('<span class="lbl">Monthly management budget</span>', '<span class="lbl" id="budget-lbl">Monthly management budget</span>');

rep('<span class="t">Under K10,000</span><span class="s">Below our minimum', '<span class="t" data-b="low">Under K10,000</span><span class="s" data-bs="low">Below our minimum');
rep('<span class="t">K10,000 – K20,000</span><span class="s">Growth tier</span>', '<span class="t" data-b="starter">K10,000 – K20,000</span><span class="s" data-bs="starter">Growth tier</span>');
rep('<span class="t">K20,000 – K50,000</span><span class="s">Scale tier</span>', '<span class="t" data-b="growth">K20,000 – K50,000</span><span class="s" data-bs="growth">Scale tier</span>');
rep('<span class="t">K50,000+</span><span class="s">Scale or Custom</span>', '<span class="t" data-b="premium">K50,000+</span><span class="s" data-bs="premium">Scale or Custom</span>');

rep('<label class="opt"><input type="radio" name="timeline" value="asap"><span class="t">This month</span></label>',
    '<label class="opt"><input type="radio" name="timeline" value="now"><span class="t">Right now — this week</span><span class="s">Priority slot if one is open</span></label>\n                <label class="opt"><input type="radio" name="timeline" value="asap"><span class="t">This month</span></label>');

rep('<li><div><b>What the system needs to work</b><span>A customer worth K5,000 or more, a management budget of K10,000+ a month, ad spend on top, and a commitment of at least 90 days.</span></div></li>',
    '<li><div><b>What it takes to work with us</b><span id="nofit-req">A customer worth K5,000 or more, a management budget of K10,000+ a month, ad spend on top, and a commitment of at least 90 days.</span></div></li>');

rep('<div class="req"><b>To be a fit</b> you need a customer worth K5,000+, a management budget of K10,000+/month plus ad spend, and 90 days.</div>',
    '<div class="req"><b>To be a fit</b> you need a customer worth K5,000+, a management budget of K10,000+/month plus ad spend, and 90 days. Website only: from K7,500.</div>\n          <div class="req"><b>Capacity:</b> <span data-slots-line></span></div>');

fs.writeFileSync(p, h);
console.log('apply.html patched');
