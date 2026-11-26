// CH 05 · Passaporte: guilloché security print drawn from hypotrochoids, stamps that land when the
// spread comes into view, and a split-flap departures board that flips letter by letter.
import { $, $$, reduced, lang, langListeners, once } from './core.js';

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÁÂÃÇÉÊÍÓÔÕÚ0123456789·-';

function guilloche(canvas, seed) {
  const box = canvas.parentElement;
  const paint = () => {
    const w = box.clientWidth; const h = box.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // Wave bands across the page
    g.lineWidth = 0.6;
    for (let k = 0; k < 46; k++) {
      g.strokeStyle = k % 2 ? 'rgba(120, 170, 140, 0.35)' : 'rgba(210, 140, 160, 0.28)';
      g.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = (k / 46) * h + Math.sin(x * 0.025 + k * 0.42 + seed) * 7 + Math.sin(x * 0.007 + seed) * 10;
        if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    // Rosettes (hypotrochoids), the classic engine-turned pattern
    // R = p·u and r = q·u with whole p, q, so the curve closes after q turns and shows p lobes.
    const rosette = (cx, cy, u, p, q, ds, color) => {
      const R = p * u; const r = q * u; const steps = 420 * q;
      g.strokeStyle = color; g.lineWidth = 0.55;
      ds.forEach((d) => {
        g.beginPath();
        for (let i = 0; i <= steps; i++) {
          const tt = (i / steps) * Math.PI * 2 * q;
          const x = cx + (R - r) * Math.cos(tt) + d * Math.cos(((R - r) / r) * tt);
          const y = cy + (R - r) * Math.sin(tt) - d * Math.sin(((R - r) / r) * tt);
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      });
    };
    const s = Math.min(w, h);
    rosette(w * 0.6, h * 0.4, s * 0.022, 15, 4, [s * 0.06, s * 0.075, s * 0.09, s * 0.105], 'rgba(70, 140, 110, 0.34)');
    rosette(w * 0.6, h * 0.4, s * 0.02, 9, 2, [s * 0.02, s * 0.032, s * 0.044], 'rgba(200, 110, 140, 0.32)');
    rosette(w * 0.28, h * 0.84, s * 0.018, 11, 3, [s * 0.035, s * 0.05, s * 0.065], 'rgba(70, 140, 110, 0.28)');
  };
  paint();
  new ResizeObserver(paint).observe(box);
}

function flapBoard() {
  const cells = $$('.flaps');
  const build = (el) => {
    const n = Math.max(el.dataset.pt.length, el.dataset.en.length);
    el.innerHTML = '';
    for (let i = 0; i < n; i++) { const c = document.createElement('span'); c.className = 'flap-c'; c.textContent = ' '; el.appendChild(c); }
    el.setAttribute('aria-label', el.dataset[lang()]);
  };
  cells.forEach(build);
  const show = (el, instant) => {
    const text = el.dataset[lang()].padEnd(el.children.length, ' ');
    el.setAttribute('aria-label', el.dataset[lang()]);
    el.classList.remove('is-done');
    let pending = 0;
    [...el.children].forEach((c, i) => {
      const target = text[i];
      if (instant || reduced) { c.textContent = target; return; }
      let turns = 4 + Math.floor(Math.random() * 7) + i;
      pending += 1;
      const spin = () => {
        if (turns-- > 0) {
          c.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
          setTimeout(spin, 55);
        } else { c.textContent = target; c.classList.remove('is-flip'); if (--pending === 0) el.classList.add('is-done'); }
      };
      setTimeout(spin, i * 25);
    });
    if (instant || reduced) el.classList.add('is-done');
  };
  let started = false;
  once($('.board'), () => { started = true; cells.forEach((el, k) => setTimeout(() => show(el), k * 90)); }, 0.3);
  langListeners.add(() => { if (started) cells.forEach((el, k) => setTimeout(() => show(el), k * 40)); });
}

export function initPassaporte() {
  $$('.guilloche').forEach((c, i) => guilloche(c, i * 1.7 + 0.4));
  once($('.passport'), () => $('#passaporte').classList.add('is-stamped'), 0.35);
  flapBoard();
}
