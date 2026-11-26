// CH 01 · Sala: the 72x72 pixel room. It is painted from text rows (pixel-room.js), kept at an
// integer scale, and the TV inside it previews every other channel.
import { PAL, ROOM, DICE, PINHAO, SPOTS } from './pixel-room.js';
import { $, $$, clamp, reduced, finePointer, t, onVisible } from './core.js';

const MINI = { '02': 'mini-kapi', '03': 'mini-deco', '04': 'mini-caderno', '05': 'mini-passaporte', '06': 'mini-riso', '07': 'mini-planta', '08': 'mini-manga', '09': 'mini-ficha', '10': 'mini-cordel', '11': 'mini-fim' };
const MINI_TEXT = { '04': 'oi!', '08': '!!', '09': '▶' };
const ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

export function initSala(hunt) {
  const sec = $('#sala'); const room = $('.room', sec); const fig = $('#scene');
  const cv = $('.scene-canvas', fig); const g = cv.getContext('2d');
  const screen = $('.tv-screen', fig); const art = $('.tv-art', screen); const osd = $('.tv-osd', screen);
  const bubble = $('.bubble', fig);

  /* ---------- painting ---------- */
  const base = document.createElement('canvas'); base.width = 72; base.height = 72;
  const bg = base.getContext('2d');
  ROOM.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = row[x]; if (c !== '.') { bg.fillStyle = PAL[c]; bg.fillRect(x, y, 1, 1); } } });
  const blit = (rows, ox, oy) => rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = row[i]; if (c !== '.') { g.fillStyle = PAL[c]; g.fillRect(ox + i, oy + j, 1, 1); } } });
  const dot = (x, y, c) => { g.fillStyle = PAL[c]; g.fillRect(x, y, 1, 1); };

  const st = { red: 6, yel: 2, capyBlink: false, qqBlink: false, stars: SPOTS.stars.map(() => true) };
  function draw() {
    g.clearRect(0, 0, 72, 72);
    g.drawImage(base, 0, 0);
    blit(DICE.red[st.red], SPOTS.dieRed.x, SPOTS.dieRed.y);
    blit(DICE.yel[st.yel], SPOTS.dieYel.x, SPOTS.dieYel.y);
    if (!hunt.has('sala')) blit(PINHAO, SPOTS.pinhao.x, SPOTS.pinhao.y);
    if (st.capyBlink) SPOTS.capyEye.forEach(([x, y]) => dot(x, y, 'd'));
    if (st.qqBlink) SPOTS.qqEye.forEach(([x, y]) => dot(x, y, 'x'));
    SPOTS.stars.forEach(([x, y], i) => { if (!st.stars[i]) dot(x, y, 'j'); });
  }
  draw();
  hunt.listeners.add((id) => { if (id === 'sala') draw(); });

  /* ---------- integer scale ---------- */
  function fit() {
    const vw = document.documentElement.clientWidth; const vh = window.innerHeight;
    let s;
    if (vw >= 1040) s = clamp(Math.floor(Math.min(vw * 0.5, vh - 52 - 24) / 72), 5, 11);
    else s = clamp(Math.floor((vw - 8) / 72), 3, 7);
    room.style.setProperty('--s', String(s));
  }
  fit();
  window.addEventListener('resize', fit);

  /* ---------- speech bubbles ---------- */
  let bubbleTimer = 0;
  function say(text, x, y) {
    bubble.textContent = text;
    bubble.style.left = `${(x / 72) * 100}%`;
    bubble.style.top = `${(y / 72) * 100}%`;
    bubble.hidden = false;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { bubble.hidden = true; }, 2800);
  }

  /* ---------- the TV ---------- */
  let current = '01'; let tuneTimer = 0; let idleTimer = 0; let touched = false;
  const tiles = $$('.tile', sec);
  function tune(ch) {
    current = ch;
    osd.textContent = `CH ${ch}`;
    tiles.forEach((tl) => tl.classList.toggle('is-tuned', tl.dataset.ch === ch));
    screen.classList.add('is-on', 'is-static');
    art.className = 'tv-art'; art.textContent = '';
    clearTimeout(tuneTimer);
    tuneTimer = setTimeout(() => {
      screen.classList.remove('is-static');
      if (ch === '01') { screen.classList.remove('is-on'); return; }
      art.className = `tv-art mini ${MINI[ch]}`;
      if (MINI_TEXT[ch]) art.innerHTML = `<i>${MINI_TEXT[ch]}</i>`;
    }, reduced ? 0 : 180);
  }
  const next = () => tune(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
  tiles.forEach((tl) => {
    const on = () => { touched = true; tune(tl.dataset.ch); };
    tl.addEventListener('mouseenter', on); tl.addEventListener('focus', on);
  });
  $('.lineup', sec).addEventListener('mouseleave', () => { idleTimer = setTimeout(() => tune('01'), 1400); });
  $('.lineup', sec).addEventListener('mouseenter', () => clearTimeout(idleTimer));
  $('.hot-knob', fig).addEventListener('click', () => { touched = true; next(); });

  /* ---------- dice: War rules, ties go to the defence ---------- */
  let rolling = false;
  $('.hot-dice', fig).addEventListener('click', () => {
    if (rolling) return;
    rolling = true;
    const a = 1 + Math.floor(Math.random() * 6); const d = 1 + Math.floor(Math.random() * 6);
    let n = reduced ? 0 : 9;
    const step = () => {
      if (n-- > 0) { st.red = 1 + Math.floor(Math.random() * 6); st.yel = 1 + Math.floor(Math.random() * 6); draw(); setTimeout(step, 65); return; }
      st.red = a; st.yel = d; draw(); rolling = false;
      say(t('dice', a, d), 45, 56);
    };
    step();
  });

  /* ---------- the animals ---------- */
  let capyLine = 0; let qqLine = 0;
  const blinkCapy = () => { st.capyBlink = true; draw(); setTimeout(() => { st.capyBlink = false; draw(); }, 160); };
  const blinkQQ = () => { st.qqBlink = true; draw(); setTimeout(() => { st.qqBlink = false; draw(); }, 140); };
  $('.hot-capy', fig).addEventListener('click', () => { blinkCapy(); const l = t('capy'); say(l[capyLine++ % l.length], 17, 49); });
  $('.hot-qq', fig).addEventListener('click', () => { blinkQQ(); const l = t('qq'); say(l[qqLine++ % l.length], 57, 26); });
  $('.hot-cuia', fig).addEventListener('click', () => say(t('cuia'), 60, 60));

  /* ---------- idle life: blinking, twinkling, a slow channel surf ---------- */
  let visible = true; let lifeTimer = 0; let surfTimer = 0;
  function life() {
    clearTimeout(lifeTimer);
    if (!visible || reduced) return;
    const r = Math.random();
    if (r < 0.32) blinkCapy();
    else if (r < 0.48) blinkQQ();
    else { const i = Math.floor(Math.random() * st.stars.length); st.stars[i] = !st.stars[i]; draw(); }
    lifeTimer = setTimeout(life, 700 + Math.random() * 1600);
  }
  function surf() {
    clearTimeout(surfTimer);
    if (!visible || reduced || touched) return;
    next();
    surfTimer = setTimeout(surf, current === '01' ? 3600 : 2400);
  }
  onVisible(fig, (v) => {
    visible = v;
    if (v) { life(); surfTimer = setTimeout(surf, 2600); } else { clearTimeout(lifeTimer); clearTimeout(surfTimer); }
  });
  if (!finePointer) touched = false;
}
