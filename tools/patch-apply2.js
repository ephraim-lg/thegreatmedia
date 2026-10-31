// Patch 2: readiness question, higher top budget band, "evaluating" screen.
const fs = require('fs');
const p = 'src/pages/apply.html';
let h = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!h.includes(a)) throw new Error('missing: ' + a.slice(0, 70)); h = h.replace(a, b); };

// Budget bands: five, top is K100,000+
rep(`                <label class="opt"><input type="radio" name="budget" value="premium"><span class="t" data-b="premium">K50,000+</span><span class="s" data-bs="premium">Scale or Custom</span></label>`,
`                <label class="opt"><input type="radio" name="budget" value="premium"><span class="t" data-b="premium">K50,000 – K100,000</span><span class="s" data-bs="premium">Scale / Custom</span></label>
                <label class="opt"><input type="radio" name="budget" value="elite"><span class="t" data-b="elite">K100,000+</span><span class="s" data-bs="elite">Custom — dedicated team</span></label>`);

// Readiness question on the budget step, after the timeline
rep(`            <div class="step-error" id="err-6"></div>`,
`            <div class="q">
              <span class="lbl">If the plan makes sense on the call, can you decide and start within 7 days?</span>
              <div class="opts" style="grid-template-columns:1fr">
                <label class="opt"><input type="radio" name="readiness" value="yes"><span class="t">Yes — I'm the decision-maker and the budget is ready</span></label>
                <label class="opt"><input type="radio" name="readiness" value="partner"><span class="t">I'd need to bring in a partner or director first</span><span class="s">Fine — bring them to the call</span></label>
                <label class="opt"><input type="radio" name="readiness" value="notyet"><span class="t">Not yet — I'm gathering information</span></label>
              </div>
            </div>
            <div class="step-error" id="err-6"></div>`);

// Evaluating screen between the form and the result
rep(`        <!-- RESULT · QUALIFIED -->`,
`        <!-- EVALUATING -->
        <div class="result" id="evaluating">
          <div class="eval-ring" aria-hidden="true"><i></i></div>
          <h2>Reviewing your application…</h2>
          <p class="lead">We check every application against the same criteria we use for paying clients.</p>
          <ul class="eval-list">
            <li data-eval="1">Customer value and margin</li>
            <li data-eval="2">Enquiry flow and follow-up</li>
            <li data-eval="3">Budget vs. system required</li>
            <li data-eval="4">Timing and readiness to start</li>
          </ul>
        </div>

        <!-- RESULT · QUALIFIED -->`);

fs.writeFileSync(p, h);
console.log('apply.html patched (2)');

// CSS for the evaluating screen
const c = 'public/css/site.css';
let css = fs.readFileSync(c, 'utf8');
if (!css.includes('.eval-ring')) {
  css += `
/* ---------- Evaluating screen ---------- */
.eval-ring { width: 64px; height: 64px; border-radius: 50%; border: 3px solid var(--ink-4); border-top-color: var(--gold); margin-bottom: 22px; animation: spin 1s linear infinite; position: relative; }
@keyframes spin { to { transform: rotate(360deg); } }
.eval-list { list-style: none; margin: 24px 0 0; padding: 0; display: grid; gap: 0; }
.eval-list li { display: grid; grid-template-columns: 28px 1fr; gap: 14px; align-items: center; padding: 14px 0; border-top: 1px solid var(--line); color: var(--text-faint); transition: color .4s; }
.eval-list li:last-child { border-bottom: 1px solid var(--line); }
.eval-list li::before { content: ""; width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--ink-4); transition: background .3s, border-color .3s; }
.eval-list li.checking { color: var(--text); }
.eval-list li.checking::before { border-color: var(--gold); border-top-color: transparent; animation: spin .8s linear infinite; }
.eval-list li.done { color: var(--text); }
.eval-list li.done::before { background: var(--gold) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1400' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 6 9 17l-5-5'/></svg>") center/12px no-repeat; border-color: var(--gold); animation: none; }
@media (prefers-reduced-motion: reduce) { .eval-ring, .eval-list li.checking::before { animation: none; } }
`;
  fs.writeFileSync(c, css);
  console.log('css patched');
}
