// kich.dev.br v3: the page is a TV with eleven channels. This file runs what crosses channels
// (the OSD, the static, the lineup, the pinhão hunt, the lightbox) and starts each channel's module.
import { $, $$, reduced, finePointer, t, lang, langListeners, setLang, toast, onVisible, once } from './core.js';
import { initSala } from './ch01-sala.js';
import { initKapi } from './ch02-kapi.js';
import { initRelogio } from './ch03-relogio.js';
import { initPassaporte } from './ch05-passaporte.js';
import { initFicha } from './ch09-ficha.js';

/* ---------------- Language buttons ---------------- */
$$('[data-set-lang]').forEach((b) => {
  b.setAttribute('aria-pressed', String(b.dataset.setLang === lang()));
  b.addEventListener('click', () => setLang(b.dataset.setLang));
});

/* ---------------- The pinhão hunt: one seed per channel ---------------- */
const SEEDS = ['sala', 'geada', 'relogio', 'papel', 'passaporte', 'riso', 'planta', 'jogo', 'ficha', 'cordel', 'fim'];
const KEY = 'kich-seeds-v3';
const found = new Set();
try { JSON.parse(localStorage.getItem(KEY) || '[]').forEach((id) => { if (SEEDS.includes(id)) found.add(id); }); } catch (e) { /* ignore */ }

const hunt = {
  total: SEEDS.length,
  has: (id) => found.has(id),
  size: () => found.size,
  listeners: new Set(),
  collect(id, el) {
    if (found.has(id)) return;
    found.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch (e) { /* ignore */ }
    if (el) { fly(el); el.hidden = true; }
    render();
    toast(found.size === SEEDS.length ? t('seedAll') : t('seedFound', found.size, SEEDS.length), found.size === SEEDS.length ? 6000 : 2600);
    hunt.listeners.forEach((fn) => fn(id));
  },
};

function fly(el) {
  const target = $('.hunt');
  if (!target || reduced) return;
  const a = el.getBoundingClientRect(); const b = target.getBoundingClientRect();
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 36'); s.setAttribute('class', 'seed-fly');
  s.innerHTML = '<use href="#i-pinhao"/>';
  s.style.left = `${a.left + a.width / 2 - 8}px`; s.style.top = `${a.top + a.height / 2 - 12}px`;
  document.body.appendChild(s);
  const dx = b.left + 14 - (a.left + a.width / 2); const dy = b.top + 8 - (a.top + a.height / 2);
  const anim = s.animate([
    { transform: 'translate(0, 0) scale(1.4) rotate(0deg)' },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.6) rotate(200deg)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(360deg)` },
  ], { duration: 900, easing: 'cubic-bezier(.4, 0, .2, 1)' });
  anim.onfinish = () => { s.remove(); target.classList.remove('is-bump'); void target.offsetWidth; target.classList.add('is-bump'); };
}

function render() {
  const n = found.size;
  $$('.hunt-count b').forEach((b) => { b.textContent = String(n); });
  $$('.js-seeds').forEach((b) => { b.textContent = `${n}/${SEEDS.length}`; });
  const feat = $('#feat-mata');
  if (feat) feat.classList.toggle('is-open', n === SEEDS.length);
  const col = $('#colophon-stats');
  if (col) col.textContent = t('colophon', n, SEEDS.length);
}
$$('[data-seed]').forEach((b) => {
  if (found.has(b.dataset.seed)) b.hidden = true;
  b.addEventListener('click', () => hunt.collect(b.dataset.seed, b));
});
render();
langListeners.add(render);

const huntBtn = $('.hunt'); const huntTip = $('#hunt-tip');
huntBtn.addEventListener('click', () => {
  const open = huntTip.hidden;
  huntTip.hidden = !open;
  huntBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (e) => {
  if (!huntTip.hidden && !e.target.closest('.hunt-wrap')) { huntTip.hidden = true; huntBtn.setAttribute('aria-expanded', 'false'); }
});

/* ---------------- OSD: which channel is on screen ---------------- */
const osdNum = $('.osd-num'); const osdName = $('.osd-name'); const osd = $('.osd-ch');
let onAir = null;
function paintOsd(sec) {
  if (!sec) return;
  osdNum.textContent = `CH ${sec.dataset.ch}`;
  osdName.textContent = sec.dataset[lang() === 'en' ? 'osdEn' : 'osdPt'] || '';
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.target !== onAir) {
        onAir = e.target;
        paintOsd(onAir);
        osd.classList.remove('is-switching'); void osd.offsetWidth; osd.classList.add('is-switching');
      }
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  $$('.ch').forEach((s) => io.observe(s));
}
langListeners.add(() => paintOsd(onAir || $('#sala')));

/* ---------------- Static between channels ---------------- */
if (!reduced) $$('.zap').forEach((z) => onVisible(z, (v) => z.classList.toggle('is-live', v)));

/* ---------------- The lineup (newspaper TV guide) ---------------- */
const guide = $('#guia');
$('.osd-guide').addEventListener('click', () => { if (guide.showModal) guide.showModal(); else guide.setAttribute('open', ''); });
$$('[data-close]', guide).forEach((b) => b.addEventListener('click', () => guide.close()));
$$('.np-list a', guide).forEach((a) => a.addEventListener('click', () => guide.close()));
guide.addEventListener('click', (e) => { if (e.target === guide) guide.close(); });

/* ---------------- Lightbox for the gameplay videos ---------------- */
const box = $('#lightbox'); const boxVideo = $('video', box);
$$('[data-video]').forEach((b) => b.addEventListener('click', () => {
  $('#lightbox-title').textContent = b.dataset[lang() === 'en' ? 'titleEn' : 'titlePt'] || '';
  boxVideo.src = b.dataset.video;
  if (box.showModal) box.showModal(); else box.setAttribute('open', '');
  const p = boxVideo.play(); if (p && p.catch) p.catch(() => {});
}));
$$('[data-close]', box).forEach((b) => b.addEventListener('click', () => box.close()));
box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
box.addEventListener('close', () => { boxVideo.pause(); boxVideo.removeAttribute('src'); boxVideo.load(); });

/* ---------------- E-mail, assembled here so it is not in the HTML ---------------- */
let mail = '';
$$('.js-email').forEach((a) => { mail = `${a.dataset.u}@${a.dataset.d}`; a.href = `mailto:${mail}`; a.textContent = mail; });
$$('.js-email-text').forEach((s) => { s.textContent = mail; });

/* ---------------- CH 04: the date on the page, the pen strokes and the stamps ---------------- */
function paintToday() {
  const f = new Intl.DateTimeFormat(lang() === 'en' ? 'en-GB' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  $$('.js-today').forEach((s) => { s.textContent = f.format(new Date()); });
}
paintToday(); langListeners.add(paintToday);
once($('#pesquisa .notebook'), () => $('#pesquisa').classList.add('is-drawn'), 0.2);

/* ---------------- CH 06: the Global South criterion swaps the ink drums ---------------- */
$$('[data-crit]').forEach((b) => b.addEventListener('click', () => {
  $('#painel').dataset.crit = b.dataset.crit;
  $$('[data-crit]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
}));

/* ---------------- CH 08: panels play on hover, in colour ---------------- */
if (finePointer && !reduced) {
  $$('.manga-media').forEach((m) => {
    const v = $('video', m);
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    m.addEventListener('mouseenter', play); m.addEventListener('focus', play);
    m.addEventListener('mouseleave', () => v.pause()); m.addEventListener('blur', () => v.pause());
  });
}

/* ---------------- CH 11: switch the tube off ---------------- */
const off = $('.power-off');
$('.tc-off').addEventListener('click', () => {
  off.innerHTML = `<p>${t('powerOn')}</p>`;
  off.classList.add('is-on');
});
off.addEventListener('click', () => off.classList.remove('is-on'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') off.classList.remove('is-on'); });

/* ---------------- Channels with their own engines ---------------- */
initSala(hunt);
initKapi();
initRelogio();
initPassaporte();
initFicha(hunt);
