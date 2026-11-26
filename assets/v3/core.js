// Shared helpers for every channel: selectors, language, toast, visibility.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* ---------------- Language ---------------- */
const root = document.documentElement;
export const lang = () => (root.dataset.lang === 'en' ? 'en' : 'pt');

const T = {
  pt: {
    temp: (n) => `Agora faz ${n} °C em São Joaquim, na serra catarinense. Quanto mais frio, mais geada no vidro.`,
    tempLoading: 'Medindo o frio em São Joaquim…',
    tempFail: 'Sem resposta da previsão de São Joaquim; a geada ficou no nível médio.',
    seedFound: (n, total) => `Pinhão ${n} de ${total}.`,
    seedAll: 'Mata completa: você achou os 11 pinhões. A conquista secreta da ficha (canal 09) foi liberada.',
    colophon: (found, total) => `Pinhões achados: ${found} de ${total}.`,
    dice: (a, d) => `Ataque ${a} × ${d} defesa: ${a > d ? 'o ataque leva' : 'a defesa segura'}.`,
    capy: ['Sua vez.', 'Vou atacar a Ásia.', 'zzz'],
    qq: ['Quero-quero!', 'Quero-quero! Quero-quero!', 'É meu nome e meu grito.'],
    cuia: 'Chimarrão, pra partida longa.',
    sheetFail: 'O personagem não carregou.',
    powerOn: 'Clique para ligar de novo',
    clockTip: (h, me, ag) => `${h}h · <b>${me}</b> meus · <b>${ag}</b> de agentes`,
    peakMe: 'meu pico', peakAg: 'pico da IA', now: 'agora',
  },
  en: {
    temp: (n) => `It is ${n} °C in São Joaquim right now, up in the Santa Catarina highlands. The colder it is, the more frost on the glass.`,
    tempLoading: 'Checking the cold in São Joaquim…',
    tempFail: 'No answer from the São Joaquim forecast; the frost is set to medium.',
    seedFound: (n, total) => `Pinhão ${n} of ${total}.`,
    seedAll: 'Full forest: you found all 11 pinhões. The secret feat on the character sheet (channel 09) is unlocked.',
    colophon: (found, total) => `Pinhões found: ${found} of ${total}.`,
    dice: (a, d) => `Attack ${a} × ${d} defence: ${a > d ? 'the attack wins' : 'the defence holds'}.`,
    capy: ['Your turn.', 'I am attacking Asia.', 'zzz'],
    qq: ['Quero-quero!', 'Quero-quero! Quero-quero!', 'It is my name and my call.'],
    cuia: 'Chimarrão, for a long game.',
    sheetFail: 'The character did not load.',
    powerOn: 'Click to switch it back on',
    clockTip: (h, me, ag) => `${h}:00 · <b>${me}</b> mine · <b>${ag}</b> agents`,
    peakMe: 'my peak', peakAg: 'AI peak', now: 'now',
  },
};
export const t = (key, ...args) => { const v = T[lang()][key]; return typeof v === 'function' ? v(...args) : v; };
export const langListeners = new Set();

export function setLang(next) {
  if (next !== 'pt' && next !== 'en') return;
  root.dataset.lang = next;
  root.lang = next === 'en' ? 'en' : 'pt-BR';
  try { localStorage.setItem('kich-lang', next); } catch (e) { /* private mode */ }
  $$('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === next)));
  langListeners.forEach((fn) => fn(next));
}

/* ---------------- Toast ---------------- */
let toastTimer = 0;
export function toast(text, ms = 3400) {
  const el = $('.toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), ms);
}

/* ---------------- Visibility ---------------- */
export function onVisible(el, cb, options = {}) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { cb(true); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), options);
  io.observe(el);
  return io;
}
export function once(el, cb, threshold = 0.25) {
  if (!el) return;
  if (!('IntersectionObserver' in window) || reduced) { cb(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { threshold });
  io.observe(el);
}
