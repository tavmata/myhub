// CH 09 · Ficha: a 16-bit RPG status screen (tabs, the pointing hand, a live character from the
// Kapi Online renderer, a play-time clock) and the same CV as a Swiss document, which is what prints.
import { $, $$, reduced, t, onVisible } from './core.js';

export function initFicha(hunt) {
  const sec = $('#curriculo');
  const tabs = $$('[role="tab"]', sec);
  const hand = $('.rpg-hand', sec);
  const cmd = $('.win-cmd', sec);

  /* ---------- the pointing hand ---------- */
  const point = (tab) => {
    if (!tab || !hand) return;
    const r = tab.getBoundingClientRect(); const c = cmd.getBoundingClientRect();
    hand.style.top = `${r.top - c.top + r.height / 2 - 12}px`;
    hand.style.left = `${r.left - c.left - 34}px`;
  };
  const selected = () => tabs.find((x) => x.getAttribute('aria-selected') === 'true');

  /* ---------- tabs ---------- */
  function select(tab, focus) {
    tabs.forEach((x) => {
      const on = x === tab;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $(`#${x.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (focus) tab.focus();
    point(tab);
    if (tab.id === 'tab-status') hero.start();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('mouseenter', () => point(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
  cmd.addEventListener('mouseleave', () => point(selected()));
  new ResizeObserver(() => point(selected())).observe(cmd);

  /* ---------- RPG menu or Swiss document ---------- */
  const views = $$('[data-view]', sec);
  views.forEach((b) => b.addEventListener('click', () => {
    const doc = b.dataset.view === 'doc';
    views.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#rpg-panel').hidden = doc;
    $('#doc-panel').hidden = !doc;
    sec.classList.toggle('is-doc', doc);
    if (!doc) { point(selected()); hero.start(); }
  }));
  $('#print-cv').addEventListener('click', () => window.print());

  /* ---------- play time ---------- */
  const born = Date.now(); const clock = $('.js-playtime', sec);
  let visible = false;
  setInterval(() => {
    if (!visible || !clock) return;
    const s = Math.floor((Date.now() - born) / 1000);
    clock.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  }, 1000);

  /* ---------- the live character (Kapi Online's own renderer) ---------- */
  const hero = (() => {
    const canvas = $('#hero-canvas'); const ctx = canvas.getContext('2d');
    let ctrl = null; let loading = false; let looping = false; let last = 0;
    const draw = (dt) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath(); ctx.ellipse(canvas.width / 2, canvas.height * 0.83, 54, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctrl.update(dt);
      ctrl.draw(ctx, canvas.width / 2, canvas.height * 0.58, 4.7);
    };
    const loop = (now) => {
      looping = false;
      if (!visible || $('#rpg-panel').hidden || $('#pane-status').hidden) return;
      draw(Math.min(0.05, (now - last) / 1000 || 0.016)); last = now;
      looping = true; requestAnimationFrame(loop);
    };
    const run = () => { if (reduced) { draw(0.016); return; } if (!looping) { looping = true; last = performance.now(); requestAnimationFrame(loop); } };
    async function start() {
      if (ctrl) { run(); return; }
      if (loading) return;
      loading = true;
      try {
        const mod = await import('../js/character-renderer.js');
        const preset = mod.CHARACTER_PRESETS.find((p) => p.id === 'frost_champion') || mod.CHARACTER_PRESETS[0];
        ctrl = new mod.CharacterController(preset);
        run();
        const act = (kind) => { if (kind === 'roll') ctrl.triggerRoll(); else ctrl.triggerAttack(); if (reduced) draw(0.2); };
        canvas.addEventListener('click', () => act('attack'));
        $$('[data-hero]', sec).forEach((b) => b.addEventListener('click', () => act(b.dataset.hero)));
      } catch (e) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.font = '16px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
        ctx.fillText(t('sheetFail'), canvas.width / 2, canvas.height / 2);
      }
    }
    return { start, run: () => ctrl && run() };
  })();

  onVisible(sec, (v) => { visible = v; if (v) { point(selected()); if (!$('#rpg-panel').hidden) hero.start(); } });
}
