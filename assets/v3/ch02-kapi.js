// CH 02 · Kapi Online: the glass wedge over the trailer, its inked edges, and frost (geada) that
// grows from the edges, is wiped by the cursor, and depends on the temperature in São Joaquim.
import { $, $$, clamp, reduced, rng, t, langListeners } from './core.js';

export function initKapi() {
  const kapi = $('#kapi');
  const video = $('#kapi-video');

  function wedgePolygon() {
    const cs = getComputedStyle(kapi);
    const w = kapi.clientWidth; const h = kapi.clientHeight;
    const px = (v) => { v = (v || '').trim(); return v.endsWith('px') ? parseFloat(v) : (parseFloat(v) / 100) * h; };
    return [[0, px(cs.getPropertyValue('--lt'))], [w, px(cs.getPropertyValue('--rt'))], [w, h - px(cs.getPropertyValue('--rb'))], [0, h - px(cs.getPropertyValue('--lb'))]];
  }
  function syncEdges() {
    const h = kapi.clientHeight || 1; const p = wedgePolygon(); const y = (v) => (v / h) * 100;
    $$('[data-edge="top"]', kapi).forEach((l) => { l.setAttribute('y1', y(p[0][1])); l.setAttribute('y2', y(p[1][1])); });
    $$('[data-edge="bottom"]', kapi).forEach((l) => { l.setAttribute('y1', y(p[3][1])); l.setAttribute('y2', y(p[2][1])); });
  }
  syncEdges();
  new ResizeObserver(syncEdges).observe(kapi);

  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { kapi.classList.add('is-open'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(kapi);
  } else kapi.classList.add('is-open');
  kapi.addEventListener('focusin', () => kapi.classList.add('is-open'));

  const pauseBtn = $('.kapi-pause', kapi);
  function setPaused(paused) {
    if (paused) video.pause(); else { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
    pauseBtn.setAttribute('aria-pressed', String(paused));
  }
  if (reduced) { video.removeAttribute('autoplay'); setPaused(true); }
  pauseBtn.addEventListener('click', () => setPaused(!video.paused));
  new IntersectionObserver((entries) => {
    if (pauseBtn.getAttribute('aria-pressed') === 'true') return;
    entries.forEach((e) => { if (e.isIntersecting) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } else video.pause(); });
  }).observe(kapi);

  /* ---------- frost ---------- */
  const cv = $('#frost'); const ctx = cv.getContext('2d');
  const tex = document.createElement('canvas'); const tctx = tex.getContext('2d');
  const mask = document.createElement('canvas'); const mctx = mask.getContext('2d');
  let W = 0; let H = 0; let S = 1; let poly = []; let amount = 0.55;
  let visible = false; let energy = 0; let running = false; let last = null; let frames = 0;

  const inside = (x, y) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  function dendrite(gc, x, y, a, len, depth, r) {
    const steps = Math.max(3, Math.round(len / (7 * S))); const seg = len / steps;
    const style = `rgba(232, 245, 250, ${0.16 + depth * 0.15})`; const width = (0.5 + depth * 0.45) * S;
    let px = x; let py = y; let ang = a;
    for (let s = 1; s <= steps; s++) {
      ang += (r() - 0.5) * 0.22;
      const nx = px + Math.cos(ang) * seg; const ny = py + Math.sin(ang) * seg;
      gc.strokeStyle = style; gc.lineWidth = width;
      gc.beginPath(); gc.moveTo(px, py); gc.lineTo(nx, ny); gc.stroke();
      if (depth > 0 && s % 2 === 0 && r() < 0.75) {
        const side = (s / 2) % 2 === 0 ? 1 : -1;
        dendrite(gc, nx, ny, ang + side * (0.9 + r() * 0.35), len * (0.42 - (0.25 * s) / steps), depth - 1, r);
      }
      px = nx; py = ny;
    }
  }
  function generate() {
    const gc = tctx;
    gc.clearRect(0, 0, W, H);
    if (!poly.length) return;
    gc.save();
    gc.beginPath(); poly.forEach(([x, y], i) => (i ? gc.lineTo(x, y) : gc.moveTo(x, y))); gc.closePath(); gc.clip();
    const r = rng(1979);
    const edges = [[poly[0], poly[1]], [poly[3], poly[2]]];
    const cx = poly.reduce((s, p) => s + p[0], 0) / 4; const cy = poly.reduce((s, p) => s + p[1], 0) / 4;
    gc.lineCap = 'round';
    edges.forEach(([a, b]) => {
      for (let k = 0; k < 4; k++) {
        gc.strokeStyle = `rgba(226, 240, 246, ${0.05 + 0.03 * amount})`;
        gc.lineWidth = (24 + k * 30) * S * (0.5 + amount * 0.7);
        gc.beginPath(); gc.moveTo(a[0], a[1]); gc.lineTo(b[0], b[1]); gc.stroke();
      }
    });
    const count = Math.round((50 + 120 * amount) * clamp(W / (1400 * S), 0.45, 1.3));
    for (let i = 0; i < count; i++) {
      const [a, b] = edges[r() < 0.5 ? 0 : 1]; const k = r();
      const x = a[0] + (b[0] - a[0]) * k; const y = a[1] + (b[1] - a[1]) * k;
      const ex = b[0] - a[0]; const ey = b[1] - a[1]; const el = Math.hypot(ex, ey) || 1;
      let nx = -ey / el; let ny = ex / el;
      if ((cx - x) * nx + (cy - y) * ny < 0) { nx = -nx; ny = -ny; }
      dendrite(gc, x, y, Math.atan2(ny, nx) + (r() - 0.5) * 1.2, (34 + r() * 120) * S * (0.45 + amount * 0.75), 2, r);
    }
    const sparks = Math.round(1100 * amount * clamp((W * H) / (1400 * 900 * S * S), 0.3, 1.4));
    for (let i = 0; i < sparks; i++) {
      const [a, b] = edges[r() < 0.5 ? 0 : 1]; const k = r();
      const x = a[0] + (b[0] - a[0]) * k; const y = a[1] + (b[1] - a[1]) * k;
      const dist = Math.pow(r(), 2.2) * 170 * S * amount; const toward = Math.sign(cy - y) || 1;
      gc.fillStyle = `rgba(240, 250, 255, ${0.12 + r() * 0.45})`;
      gc.fillRect(x + (r() - 0.5) * 10 * S, y + toward * dist, r() < 0.85 ? S : 2 * S, S);
    }
    const seedEl = $('.seed-frozen', kapi);
    if (seedEl && !seedEl.hidden) {
      const kr = kapi.getBoundingClientRect(); const sr = seedEl.getBoundingClientRect();
      const sx = (sr.left + sr.width / 2 - kr.left) * S; const sy = (sr.top + sr.height / 2 - kr.top) * S; const R = 48 * S;
      const haze = gc.createRadialGradient(sx, sy, 0, sx, sy, R);
      haze.addColorStop(0, 'rgba(228, 241, 246, 0.95)'); haze.addColorStop(0.55, 'rgba(228, 241, 246, 0.75)'); haze.addColorStop(1, 'rgba(228, 241, 246, 0)');
      gc.fillStyle = haze; gc.beginPath(); gc.arc(sx, sy, R, 0, Math.PI * 2); gc.fill();
      for (let i = 0; i < 10; i++) dendrite(gc, sx, sy, (i / 10) * Math.PI * 2 + r() * 0.3, (44 + r() * 36) * S, 2, r);
    }
    gc.restore();
  }
  function render() {
    ctx.clearRect(0, 0, W, H); ctx.drawImage(tex, 0, 0);
    ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(mask, 0, 0); ctx.globalCompositeOperation = 'source-over';
  }
  function frame() {
    running = false;
    if (!reduced && energy > 0) {
      frames += 1;
      if (frames % 2 === 0) { mctx.globalCompositeOperation = 'destination-out'; mctx.fillStyle = 'rgba(0, 0, 0, 0.035)'; mctx.fillRect(0, 0, W, H); mctx.globalCompositeOperation = 'source-over'; }
      energy -= 0.0028;
      if (energy <= 0) { energy = 0; mctx.clearRect(0, 0, W, H); }
    }
    render();
    if (visible && energy > 0 && !reduced) start();
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  function wipeAt(x, y) {
    const R = 74 * S;
    const blob = (bx, by) => {
      const gr = mctx.createRadialGradient(bx, by, 0, bx, by, R);
      gr.addColorStop(0, 'rgba(0, 0, 0, 0.95)'); gr.addColorStop(0.55, 'rgba(0, 0, 0, 0.55)'); gr.addColorStop(1, 'rgba(0, 0, 0, 0)');
      mctx.fillStyle = gr; mctx.beginPath(); mctx.arc(bx, by, R, 0, Math.PI * 2); mctx.fill();
    };
    if (last) {
      const dx = x - last[0]; const dy = y - last[1]; const n = Math.min(14, Math.ceil(Math.hypot(dx, dy) / (R * 0.3)));
      for (let i = 1; i <= n; i++) blob(last[0] + (dx * i) / n, last[1] + (dy * i) / n);
    } else blob(x, y);
    last = [x, y]; energy = 1; start();
  }
  const toCanvas = (e) => { const rect = cv.getBoundingClientRect(); return [((e.clientX - rect.left) * W) / rect.width, ((e.clientY - rect.top) * H) / rect.height]; };
  function onPointer(e) {
    if (!kapi.classList.contains('is-open')) return;
    const [x, y] = toCanvas(e);
    if (inside(x, y)) wipeAt(x, y); else last = null;
  }
  kapi.addEventListener('pointermove', onPointer, { passive: true });
  kapi.addEventListener('pointerdown', onPointer, { passive: true });
  kapi.addEventListener('pointerleave', () => { last = null; });
  $('#frost-melt').addEventListener('click', () => { mctx.fillStyle = 'rgba(0, 0, 0, 1)'; mctx.fillRect(0, 0, W, H); energy = 1; if (reduced) render(); else start(); });
  function size() {
    const w = kapi.clientWidth; const h = kapi.clientHeight;
    if (!w || !h) return;
    S = Math.min(1.25, window.devicePixelRatio || 1) * 0.8;
    W = Math.round(w * S); H = Math.round(h * S);
    [cv, tex, mask].forEach((c) => { c.width = W; c.height = H; });
    poly = wedgePolygon().map(([x, y]) => [x * S, y * S]);
    generate(); mctx.clearRect(0, 0, W, H); render();
  }
  new ResizeObserver(size).observe(kapi);
  new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); if (visible && energy > 0) start(); }).observe(kapi);

  /* ---------- live temperature in São Joaquim (Open-Meteo: free, no key, no personal data) ---------- */
  const label = $('#frost-temp');
  let state = { kind: 'loading', temp: null };
  const paint = () => { label.textContent = state.kind === 'ok' ? t('temp', state.temp) : t(state.kind === 'fail' ? 'tempFail' : 'tempLoading'); };
  langListeners.add(paint); paint();
  const ctrl = 'AbortController' in window ? new AbortController() : null;
  const timer = setTimeout(() => ctrl && ctrl.abort(), 5000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=-28.29&longitude=-49.93&current=temperature_2m&timezone=America%2FSao_Paulo', ctrl ? { signal: ctrl.signal } : undefined)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data) => {
      clearTimeout(timer);
      const temp = data && data.current && typeof data.current.temperature_2m === 'number' ? data.current.temperature_2m : null;
      if (temp === null) throw new Error('no temperature');
      state = { kind: 'ok', temp: Math.round(temp) };
      amount = clamp((24 - temp) / 24, 0.32, 1); generate(); render(); paint();
    })
    .catch(() => { clearTimeout(timer); state = { kind: 'fail', temp: null }; paint(); });
}
