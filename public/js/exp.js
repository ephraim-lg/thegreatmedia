/* THE GREAT MEDIA — the 3D scroll story.
   One particle system (the "leads") sits behind the page and changes shape as the visitor scrolls:
   0 a galaxy of potential customers → 1 a funnel that leaks → 2 an ordered system (three rings)
   → 3 a rising graph → 4 a quiet star field → 5 a single sun behind the closing call to action.
   Sections declare which shape they want with data-exp="n". A page can pin one shape with
   <body data-exp-fixed="4">. Without WebGL or with reduced motion the page simply stays dark. */
import * as THREE from '/js/vendor/three.module.min.js';

const canvas = document.getElementById('exp-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;

function start() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { document.body.classList.add('no-gl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const N = small ? 7000 : 18000;
  const rnd = Math.random, TAU = Math.PI * 2;
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  const F = [0, 1, 2, 3, 4, 5].map(() => new Float32Array(N * 3));
  const seed = new Float32Array(N), tone = new Float32Array(N), leak = new Float32Array(N);
  const set = (f, i, x, y, z) => { F[f][i * 3] = x; F[f][i * 3 + 1] = y; F[f][i * 3 + 2] = z; };
  const bars = [0.7, 1.1, 1.6, 2.3, 3.1, 4.0];

  for (let i = 0; i < N; i++) {
    seed[i] = rnd(); tone[i] = Math.pow(rnd(), 1.6);
    // 0 — galaxy: three spiral arms seen at an angle
    {
      const r = Math.pow(rnd(), 0.62) * 3.4, arm = Math.floor(rnd() * 3) * (TAU / 3);
      const a = arm + r * 1.15 + gauss() * 0.42;
      const x = Math.cos(a) * r, z = Math.sin(a) * r, y = gauss() * 0.22 * (1.2 - r / 3.6);
      const t = 1.05, c = Math.cos(t), s = Math.sin(t);
      set(0, i, x, y * c - z * s, y * s + z * c);
    }
    // 1 — funnel: a cone, a thin stream that makes it through, and everything that leaks away
    {
      const u = rnd();
      if (u < 0.4) { const h = rnd(), rad = 3.1 * Math.pow(1 - h, 1.4) + 0.22, a = rnd() * TAU; set(1, i, Math.cos(a) * rad, 3.1 - h * 3.6, Math.sin(a) * rad * 0.55); }
      else if (u < 0.54) set(1, i, gauss() * 0.1, -0.5 - rnd() * 3.2, gauss() * 0.1);
      else { leak[i] = 1; const side = rnd() < 0.5 ? -1 : 1, d = 0.5 + Math.pow(rnd(), 0.7) * 5.2; set(1, i, side * d, -0.6 - Math.pow(rnd(), 1.4) * 3.4 + gauss() * 0.3, gauss() * 1.4); }
    }
    // 2 — the system: three rings joined by one line
    {
      const u = rnd();
      if (u < 0.66) { const k = Math.floor(rnd() * 3), a = rnd() * TAU, tube = gauss() * 0.07, R = 1.02 + tube; set(2, i, (k - 1) * 3.1 + Math.cos(a) * R, Math.sin(a) * R, gauss() * 0.07); }
      else { const x = -6 + rnd() * 12; set(2, i, x, Math.sin(x * 1.1) * 0.08 + gauss() * 0.035, gauss() * 0.035); }
    }
    // 3 — a rising graph and the line above it
    {
      const u = rnd();
      if (u < 0.74) { const k = Math.floor(Math.pow(rnd(), 0.75) * 6); set(3, i, (k - 2.5) * 1.15 + (rnd() - 0.5) * 0.62, -2.3 + rnd() * bars[k], (rnd() - 0.5) * 0.62); }
      else { const t = rnd(); set(3, i, -3.4 + t * 6.9 + gauss() * 0.03, -1.5 + Math.pow(t, 1.5) * 4.4 + gauss() * 0.03, 0.5 + gauss() * 0.03); }
    }
    // 4 — a far, quiet field
    set(4, i, gauss() * 13, gauss() * 7, -2 - rnd() * 9);
    // 5 — one sun
    {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963, R = 2.25 + gauss() * 0.06 + (rnd() < 0.12 ? rnd() * 1.4 : 0);
      set(5, i, Math.cos(a) * r * R, y * R, Math.sin(a) * r * R);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(F[0], 3));
  for (let k = 1; k < 6; k++) geo.setAttribute('p' + k, new THREE.BufferAttribute(F[k], 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('tone', new THREE.BufferAttribute(tone, 1));
  geo.setAttribute('leak', new THREE.BufferAttribute(leak, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

  const uniforms = { uP: { value: 0 }, uTime: { value: 0 }, uSize: { value: small ? 36 : 36 }, uFade: { value: 1 }, uShift: { value: new THREE.Vector2() }, uO1: { value: new THREE.Vector2() }, uO2: { value: new THREE.Vector2() }, uO3: { value: new THREE.Vector3(0, 0, 1) }, uDim: { value: new THREE.Vector3(1, 1, 1) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4; attribute vec3 p5;
      attribute float seed; attribute float tone; attribute float leak;
      uniform float uP; uniform float uTime; uniform float uSize; uniform float uFade; uniform vec2 uShift; uniform vec2 uO1; uniform vec2 uO2; uniform vec3 uO3; uniform vec3 uDim;
      varying vec3 vCol; varying float vA;
      float ease(float t){ return t*t*t*(t*(t*6.-15.)+10.); }
      float st(float k){ return ease(clamp((uP-(k-1.))*1.5 - seed*.5, 0., 1.)); }
      vec3 ry(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(p.x*c+p.z*s, p.y, -p.x*s+p.z*c); }
      void main(){
        float t1=st(1.), t2=st(2.), t3=st(3.), t4=st(4.), t5=st(5.);
        vec3 a = position; a.xy = mat2(cos(uTime*.05), -sin(uTime*.05), sin(uTime*.05), cos(uTime*.05)) * a.xy;
        // leaked particles keep drifting outward and down while the funnel is on screen
        vec3 b = p1; b.x += leak * sign(b.x) * fract(uTime*.05 + seed) * 1.6; b.y -= leak * fract(uTime*.05 + seed) * 1.2;
        b.y -= (1.-leak) * step(b.y, -.45) * fract(uTime*.25 + seed) * .6;
        // the system flows: particles on the line travel left to right
        vec3 c = p2;
        float onLine = step(abs(c.y), .16) * step(1.12, length(vec2(mod(c.x+1.55, 3.1)-1.55, c.y)));
        c.x = mix(c.x, mod(c.x + 6. + uTime*.55 + seed*3., 12.) - 6., onLine);
        float ring = 1. - onLine; float ang = uTime*.22*(seed*.6+.7);
        vec2 ctr = vec2(floor((p2.x+4.65)/3.1)*3.1 - 3.1, 0.);
        vec2 rel = p2.xy - ctr; c.xy = mix(c.xy, ctr + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * rel, ring);
        b.xy += uO1; c.xy += uO2;
        vec3 d = p3; d.y += sin(uTime*.9 + p3.x*1.3) * .035; d = d * uO3.z + vec3(uO3.xy, 0.);
        vec3 e = p4; e.x += sin(uTime*.07 + seed*30.) * .6;
        vec3 f = ry(p5, uTime*.16 + seed*.15);
        vec3 pos = mix(a, b, t1); pos = mix(pos, c, t2); pos = mix(pos, d, t3); pos = mix(pos, e, t4); pos = mix(pos, f, t5);
        // in-between turbulence so every change of shape is a swirl, not a slide
        float mid = sin(t1*3.1416)+sin(t2*3.1416)+sin(t3*3.1416)+sin(t4*3.1416)+sin(t5*3.1416);
        pos += vec3(sin(seed*90.+uTime*.7), cos(seed*70.+uTime*.6), sin(seed*50.+uTime*.5)) * (.05 + mid*.75*(.3+seed));
        pos.xy += uShift * (1. - t1);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        float tw = .75 + .25*sin(uTime*2.2 + seed*80.);
        gl_PointSize = uSize * (.35 + seed*.95) * tw / -mv.z;
        vec3 hot = vec3(1., .36, .12), pale = vec3(1., .92, .84);
        vCol = mix(hot, pale, tone);
        float leaking = leak * t1 * (1. - t2);
        vCol = mix(vCol, vec3(.55,.56,.6), leaking*.9);
        float far = t4*(1.-t5);
        vA = uFade * mix(1., .28, leaking) * mix(1., .55, far) * (.55 + .45*tone);
        vA *= mix(1., uDim.x, t1*(1.-t2)) * mix(1., uDim.y, t3*(1.-t4)) * mix(1., uDim.z, t5);
      }`,
    fragmentShader: `
      varying vec3 vCol; varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .08, d); gl_FragColor = vec4(vCol, a*a*vA); }`,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // which shape does the scroll position ask for?
  const fixed = document.body.getAttribute('data-exp-fixed');
  let marks = [];
  const measure = () => { marks = [...document.querySelectorAll('[data-exp]')].map((el) => { const r = el.getBoundingClientRect(); return { y: r.top + scrollY + r.height * (parseFloat(el.getAttribute('data-exp-at')) || 0.5), v: parseFloat(el.getAttribute('data-exp')) }; }).sort((a, b) => a.y - b.y); };
  const target = () => {
    if (fixed !== null) return parseFloat(fixed);
    if (!marks.length) return 0;
    const y = scrollY + innerHeight * 0.5;
    if (y <= marks[0].y) return marks[0].v;
    for (let i = 0; i < marks.length - 1; i++) { const a = marks[i], b = marks[i + 1]; if (y <= b.y) return a.v + (b.v - a.v) * ((y - a.y) / (b.y - a.y)); }
    return marks[marks.length - 1].v;
  };

  let W = 0, H = 0;
  const resize = () => {
    W = innerWidth; H = innerHeight; renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const s = Math.min(1, (W / H) / 1.45); points.scale.setScalar(Math.max(0.5, s));
    uniforms.uSize.value = 36 * renderer.getPixelRatio() * (H / 900);
    // hero: the galaxy sits to the right of the headline on wide screens, below it on phones
    const wide = W / H > 1.2, k = 1 / points.scale.x;
    uniforms.uShift.value.set(wide ? 3.2 * k : 0, wide ? 0.1 : -1.9);
    uniforms.uO1.value.set(wide ? -3.3 * k : 0, wide ? 0 : -0.4);       // funnel sits left of the text
    uniforms.uO2.value.set(0, wide ? -0.35 : 0.5);                       // rings sit between heading and labels
    uniforms.uO3.value.set(wide ? 3.5 * k : 0, wide ? 2.15 : 0, wide ? 0.52 : 1); // graph sits beside the heading
    uniforms.uDim.value.set(wide ? 1 : 0.5, wide ? 1 : 0.32, wide ? 0.8 : 0.6);
    measure();
  };
  addEventListener('resize', resize); resize();
  addEventListener('load', measure); setTimeout(measure, 1200);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / W - 0.5; my = e.clientY / H - 0.5; }, { passive: true });

  let p = target(), t0 = performance.now(), visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const time = (now - t0) / 1000;
    p += (target() - p) * (reduce ? 1 : 0.075);
    uniforms.uP.value = p; uniforms.uTime.value = reduce ? 0 : time;
    camera.position.x += (mx * 1.1 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.7 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    points.rotation.y = mx * 0.18;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  document.body.classList.add('gl-on');
  window.__exp = { uniforms, measure };
}
if (canvas) start();

/* ── Cinematic gallery: vertical scroll drives a horizontal run of tilting cards ── */
const gal = document.querySelector('[data-gallery]');
if (gal) {
  const track = gal.querySelector('.g-track'), pin = gal.querySelector('.g-pin'), bar = gal.querySelector('.g-bar i'), count = gal.querySelector('.g-count');
  const desktop = () => innerWidth >= 900 && !reduce;
  let over = 0;
  const cards = () => [...track.querySelectorAll('.g-card:not([hidden])')];
  const layout = () => {
    if (desktop()) { over = Math.max(0, track.scrollWidth - innerWidth); gal.style.height = (innerHeight + over) + 'px'; gal.classList.add('pinned'); }
    else { gal.style.height = ''; gal.classList.remove('pinned'); track.style.transform = ''; }
    if (window.__exp) window.__exp.measure();
    tick();
  };
  let cur = 0;
  const tick = () => {
    const list = cards(), mid = innerWidth / 2;
    let prog = 0;
    if (desktop()) {
      const r = gal.getBoundingClientRect();
      prog = over ? Math.min(1, Math.max(0, -r.top / over)) : 0;
      cur += (prog * over - cur) * 0.12;
      track.style.transform = 'translate3d(' + (-cur) + 'px,0,0)';
    } else { prog = track.scrollWidth > track.clientWidth ? track.scrollLeft / (track.scrollWidth - track.clientWidth) : 0; }
    let nearest = 0, best = 1e9;
    list.forEach((c, i) => {
      const b = c.getBoundingClientRect(), off = (b.left + b.width / 2 - mid) / innerWidth;
      if (Math.abs(off) < best) { best = Math.abs(off); nearest = i; }
      if (desktop()) { const o = Math.max(-1, Math.min(1, off)); c.style.setProperty('--ry', (-o * 26) + 'deg'); c.style.setProperty('--tz', (-Math.abs(o) * 220) + 'px'); c.style.setProperty('--op', String(1 - Math.min(0.72, Math.abs(o) * 0.9))); }
    });
    if (bar) bar.style.transform = 'scaleX(' + Math.max(0.04, prog) + ')';
    if (count) count.textContent = String(nearest + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
  };
  const loop = () => { tick(); requestAnimationFrame(loop); };
  addEventListener('resize', layout); addEventListener('load', layout);
  track.addEventListener('scroll', tick, { passive: true });
  // a card leans toward the pointer
  track.querySelectorAll('.g-card').forEach((c) => {
    c.addEventListener('pointermove', (e) => { const b = c.getBoundingClientRect(); c.style.setProperty('--mx', ((e.clientX - b.left) / b.width - 0.5).toFixed(3)); c.style.setProperty('--my', ((e.clientY - b.top) / b.height - 0.5).toFixed(3)); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--mx', 0); c.style.setProperty('--my', 0); });
  });
  document.querySelectorAll('[data-gfilter]').forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.getAttribute('data-gfilter');
    document.querySelectorAll('[data-gfilter]').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
    track.querySelectorAll('.g-card').forEach((c) => { c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f; });
    cur = 0; if (!desktop()) track.scrollLeft = 0; else scrollTo({ top: gal.offsetTop, behavior: 'instant' });
    layout();
  }));
  layout(); requestAnimationFrame(loop);
}

/* ── Scroll-linked words: each [data-lines] block lights its lines one after another ── */
document.querySelectorAll('[data-lines]').forEach((box) => {
  const lines = [...box.children];
  const upd = () => { const r = box.getBoundingClientRect(), t = 1 - (r.top - innerHeight * 0.25) / (innerHeight * 0.55); lines.forEach((l, i) => l.classList.toggle('on', t > i / lines.length)); };
  addEventListener('scroll', upd, { passive: true }); upd();
});

/* ── Buttons pull toward the pointer ── */
if (!reduce && matchMedia('(pointer: fine)').matches) document.querySelectorAll('.e-btn').forEach((b) => {
  b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)'; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; });
});
