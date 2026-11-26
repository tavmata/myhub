// CH 03 · Relógio: a 24-hour art deco dial. Each hour holds two stepped towers, my commits (copper)
// and the AI agents' (blue), from 28 Jul to 25 Nov 2026. The hands show the time now.
import { $, t, lang, langListeners } from './core.js';

const ME = [70, 50, 40, 26, 17, 18, 23, 7, 42, 50, 57, 47, 32, 3, 27, 46, 60, 47, 26, 28, 46, 59, 34, 67];
const AG = [17, 0, 2, 1, 1, 149, 93, 37, 100, 35, 78, 35, 63, 2, 6, 14, 108, 27, 1, 2, 39, 27, 1, 27];
const NS = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
const R0 = 96; const K = 124 / 149; const STEP = 11.5; const SEG = 9;

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
};
const pt = (r, a) => [r * Math.sin(a * D), -r * Math.cos(a * D)];
function sector(r1, r2, a1, a2) {
  const [x1, y1] = pt(r2, a1); const [x2, y2] = pt(r2, a2); const [x3, y3] = pt(r1, a2); const [x4, y4] = pt(r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r2} ${r2} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}L${x3.toFixed(2)} ${y3.toFixed(2)}A${r1} ${r1} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}Z`;
}

export function initRelogio() {
  const svg = $('#clock-svg'); const fig = svg.closest('figure'); const tip = $('#clock-tip');
  if (!svg) return;

  const defs = el('defs', {}, svg);
  const gold = el('linearGradient', { id: 'deco-gold', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  [['0', '#F3DC9A'], ['0.48', '#D9B45A'], ['0.52', '#8C6A1F'], ['1', '#D9B45A']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gold));
  const medal = el('radialGradient', { id: 'deco-medal' }, defs);
  [['0', '#12393D'], ['1', '#071B1E']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, medal));

  // Dial and rings
  el('circle', { r: 252, fill: '#0A2427', stroke: 'url(#deco-gold)', 'stroke-width': 4 }, svg);
  el('circle', { r: 243, fill: 'none', stroke: '#8C6A1F', 'stroke-width': 1 }, svg);
  el('circle', { r: 236, fill: 'none', stroke: 'rgba(217,180,90,.45)', 'stroke-width': 1, 'stroke-dasharray': '1.5 5' }, svg);
  el('circle', { r: R0 - 6, fill: 'none', stroke: 'rgba(217,180,90,.35)', 'stroke-width': 1 }, svg);

  // Ticks and numerals: 0h at the top, a full day around
  for (let h = 0; h < 24; h++) {
    const a = h * 15; const major = h % 6 === 0;
    const [x1, y1] = pt(major ? 226 : 232, a); const [x2, y2] = pt(244, a);
    el('line', { x1, y1, x2, y2, stroke: '#D9B45A', 'stroke-width': major ? 4 : 1.6 }, svg);
    if (major) { const [x, y] = pt(205, a); el('text', { x, y, class: 'num' }, svg).textContent = String(h); }
    else if (h % 3 === 0) { const [x, y] = pt(207, a); el('text', { x, y, class: 'num-sm' }, svg).textContent = String(h); }
  }

  // Bars: stepped towers that taper as they climb
  const bars = el('g', {}, svg);
  const groups = [];
  function tower(parent, v, a1, a2, fill) {
    const L = v * K; const n = Math.floor(L / STEP); const rem = L - n * STEP;
    const mid = (a1 + a2) / 2; const half0 = (a2 - a1) / 2;
    const segs = n + (rem > 2 ? 1 : 0);
    for (let i = 0; i < segs; i++) {
      const half = half0 * Math.pow(0.93, i);
      const r1 = R0 + i * STEP; const r2 = r1 + (i < n ? SEG : Math.min(SEG, rem));
      el('path', { d: sector(r1, r2, mid - half, mid + half), fill, class: 'blk' }, parent);
    }
    return R0 + L;
  }
  const tops = [];
  for (let h = 0; h < 24; h++) {
    const g = el('g', { 'data-h': h }, bars);
    const a = h * 15;
    const topMe = tower(g, ME[h], a + 1.3, a + 7.1, '#C9713F');
    const topAg = tower(g, AG[h], a + 7.9, a + 13.7, '#4C8DFF');
    tops.push([topMe, topAg]);
    groups.push(g);
  }

  // Peak notes
  const notes = el('g', {}, svg);
  function paintNotes() {
    notes.textContent = '';
    const note = (r, a, text, color, anchor) => {
      const [x, y] = pt(r, a);
      const e = el('text', { x, y, class: 'peak', fill: color, 'text-anchor': anchor, 'dominant-baseline': 'central' }, notes);
      e.textContent = text;
    };
    note(tops[0][0] + 14, 4.2, t('peakMe'), '#E9A271', 'start');
    note(226, 69, t('peakAg'), '#8DB6FF', 'end');
  }
  paintNotes(); langListeners.add(paintNotes);

  // Medallion with a sunburst and the gralha
  el('circle', { r: 84, fill: 'url(#deco-medal)', stroke: 'url(#deco-gold)', 'stroke-width': 3 }, svg);
  for (let i = 0; i < 48; i++) {
    const a = i * 7.5; const [x1, y1] = pt(40, a); const [x2, y2] = pt(i % 2 ? 66 : 78, a);
    el('line', { x1, y1, x2, y2, stroke: 'rgba(217,180,90,.55)', 'stroke-width': i % 2 ? 0.8 : 1.4 }, svg);
  }
  el('circle', { r: 38, fill: '#071B1E', stroke: '#D9B45A', 'stroke-width': 1.5 }, svg);
  el('use', { href: '#i-gralha', x: -30, y: -15, width: 60, height: 30, fill: 'url(#deco-gold)', stroke: 'url(#deco-gold)' }, svg);

  // Hands
  const hourHand = el('g', {}, svg);
  el('path', { d: 'M0 -196 L10 -168 L4 -160 L4 22 L-4 22 L-4 -160 L-10 -168 Z', fill: 'url(#deco-gold)', stroke: '#071B1E', 'stroke-width': 1.5 }, hourHand);
  el('path', { d: 'M0 -150 L6 -138 L0 -126 L-6 -138 Z', fill: '#071B1E' }, hourHand);
  const minHand = el('g', {}, svg);
  el('path', { d: 'M0 -234 L2.6 -60 L0 30 L-2.6 -60 Z', fill: '#F3E9D2', stroke: '#071B1E', 'stroke-width': 1 }, minHand);
  el('circle', { r: 10, fill: 'url(#deco-gold)', stroke: '#071B1E', 'stroke-width': 1.5 }, svg);
  function tick() {
    const now = new Date(); const h = now.getHours(); const m = now.getMinutes();
    hourHand.setAttribute('transform', `rotate(${(h + m / 60) * 15})`);
    minHand.setAttribute('transform', `rotate(${m * 6})`);
  }
  tick(); setInterval(tick, 20000);

  // Hover: one invisible sector per hour
  const slots = el('g', {}, svg);
  for (let h = 0; h < 24; h++) {
    const s = el('path', { d: sector(R0 - 6, 236, h * 15, h * 15 + 15), class: 'slot' }, slots);
    s.addEventListener('pointerenter', () => {
      groups.forEach((g, i) => g.classList.toggle('is-hot', i === h));
      const [x, y] = pt(150, h * 15 + 7.5);
      const box = fig.getBoundingClientRect(); const sc = box.width / 520;
      tip.style.left = `${(x + 260) * sc}px`; tip.style.top = `${(y + 260) * sc}px`;
      tip.innerHTML = t('clockTip', String(h).padStart(2, '0'), ME[h], AG[h]);
      tip.hidden = false;
    });
    s.addEventListener('pointerleave', () => { tip.hidden = true; groups[h].classList.remove('is-hot'); });
  }

  // The same numbers as a table
  const rows = $('#clock-rows');
  const paintRows = () => {
    rows.innerHTML = ME.map((m, h) => `<tr><td>${lang() === 'en' ? `${String(h).padStart(2, '0')}:00` : `${String(h).padStart(2, '0')}h`}</td><td>${m}</td><td>${AG[h]}</td></tr>`).join('');
  };
  paintRows(); langListeners.add(paintRows);
}
