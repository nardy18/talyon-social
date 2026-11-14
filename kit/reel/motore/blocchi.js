// ===================== Talyon Reel · blocchi: scene del gancio e blocchi generici =====================
// Ogni blocco: { scena?(x, F, tl, d, s), schermo?(tl, d, s), disegna(x, F, tl, d, s), eventi(d, s, colpo) }.
// tl = tempo locale dall'inizio della sezione s; d = dati del copione; F = fotogramma (camera, luci, piano, telefoni).

// ---------- fogli generici (dal Reel 1 e dal Reel 2) ----------
let SHEET = null;
const SH_W = 900, SH_H = 1120;
function sheetTex() {
  if (SHEET) return SHEET;
  const c = H.layer(SH_W, SH_H), g = c.getContext('2d');
  g.fillStyle = '#F3F4F1'; g.fillRect(0, 0, SH_W, SH_H);
  const cols = [70, 250, 175, 150, 120, 135], rowH = 74, top = 64;
  const X = [0]; cols.forEach((w, i) => X.push(X[i] + w));
  // intestazioni A..F e numeri di riga
  g.fillStyle = '#E3E6E0'; g.fillRect(0, 0, SH_W, top); g.fillRect(0, 0, cols[0], SH_H);
  ['', 'A', 'B', 'C', 'D', 'E'].forEach((s, i) => label(g, s, X[i] + cols[i] / 2, 44, 500, 28, '#8B9086', 'center', 1, FB));
  const R = 13;
  for (let r = 0; r < R; r++) label(g, String(r + 1), cols[0] / 2, top + r * rowH + 48, 500, 26, '#8B9086', 'center', 1, FB);
  // contenuti (dati demo, volutamente disordinati)
  const cell = (r, ci, s, o) => { o = o || {}; label(g, s, X[ci] + 14, top + r * rowH + 49, o.w || 500, o.px || 30, o.c || '#2E332B', 'left', 1, FB); };
  const fillRow = (r, col) => { g.fillStyle = col; g.fillRect(cols[0], top + r * rowH, SH_W - cols[0], rowH); };
  const fillCell = (r, ci, col) => { g.fillStyle = col; g.fillRect(X[ci], top + r * rowH, cols[ci], rowH); };
  fillRow(7, '#DDEBD2'); fillCell(5, 5, '#F7D6D0');
  cell(0, 1, 'Luca · sett. 3', { w: 700 });
  cell(1, 1, 'Esercizio', { w: 700, c: '#5D6358' }); cell(1, 2, 'Serie', { w: 700, c: '#5D6358' }); cell(1, 3, 'Carico', { w: 700, c: '#5D6358' }); cell(1, 4, 'RPE', { w: 700, c: '#5D6358' }); cell(1, 5, 'Note', { w: 700, c: '#5D6358' });
  cell(2, 1, 'Trazioni'); cell(2, 2, 'top'); cell(2, 3, '+60 ?'); cell(2, 4, '9');
  cell(3, 1, 'Trazioni'); cell(3, 2, '3x3'); cell(3, 3, '-10%??'); cell(3, 4, '8'); cell(3, 5, 'vedi tab', { px: 24 });
  cell(4, 1, 'Dip'); cell(4, 2, '4x5'); cell(4, 3, '+60'); cell(4, 4, 'RIR2');
  cell(5, 1, 'Muscle-up'); cell(5, 2, 'EMOM 10'); cell(5, 5, '??', { w: 700, c: '#C0392B' });
  cell(6, 1, 'Front lever'); cell(6, 2, '5x6"'); cell(6, 3, '8"', { c: '#2E332B' });
  g.strokeStyle = '#C0392B'; g.lineWidth = 3; g.beginPath(); g.moveTo(X[2] + 10, top + 6 * rowH + 38); g.lineTo(X[2] + 90, top + 6 * rowH + 38); g.stroke();
  cell(7, 1, 'Squat'); cell(7, 2, '5x3'); cell(7, 3, '140'); cell(7, 4, '8'); cell(7, 5, 'fatto', { w: 700, c: '#3F6B2A' });
  cell(8, 1, 'Dip'); cell(8, 2, '3x?'); cell(8, 3, '?');
  cell(9, 1, 'Trazioni'); cell(9, 4, '8,5?');
  cell(10, 2, 'chiedi'); cell(11, 1, 'Muscle-up?');
  // griglia
  g.strokeStyle = '#CDD1C9'; g.lineWidth = 1.5;
  for (let r = 0; r <= R; r++) { g.beginPath(); g.moveTo(0, top + r * rowH); g.lineTo(SH_W, top + r * rowH); g.stroke(); }
  X.forEach((xx) => { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, SH_H); g.stroke(); });
  // linguette in basso
  const ty = SH_H - 70; g.fillStyle = '#E3E6E0'; g.fillRect(0, ty, SH_W, 70);
  let tx = 20; ['Marco', 'Marco R', 'Teo', 'Teo (vecchio)', 'Luca'].forEach((s, i) => { const tw = textW(g, s, 500, 26, FB) + 40; rrect(g, tx, ty + 10, tw, 50, 8, i === 4 ? '#FFFFFF' : '#D5D9D1'); label(g, s, tx + tw / 2, ty + 44, i === 4 ? 700 : 500, 26, '#4A5045', 'center', 1, FB); tx += tw + 10; });
  return (SHEET = c);
}
// biglietti e messaggi che si accumulano sul foglio (momento 1)
const SHEETV = {};
function sheetGrid(title, rows, o) {
  const c = H.layer(SH_W, SH_H), g = c.getContext('2d');
  g.fillStyle = '#F3F4F1'; g.fillRect(0, 0, SH_W, SH_H);
  const cols = [70, 250, 175, 150, 120, 135], rowH = 74, top = 64;
  const X = [0]; cols.forEach((w, i) => X.push(X[i] + w));
  g.fillStyle = '#E3E6E0'; g.fillRect(0, 0, SH_W, top); g.fillRect(0, 0, cols[0], SH_H);
  ['', 'A', 'B', 'C', 'D', 'E'].forEach((s, i) => label(g, s, X[i] + cols[i] / 2, 44, 500, 28, '#8B9086', 'center', 1, FB));
  const R = 13;
  for (let r = 0; r < R; r++) label(g, String(r + 1), cols[0] / 2, top + r * rowH + 48, 500, 26, '#8B9086', 'center', 1, FB);
  (o.fills || []).forEach(([r, ci, col]) => { g.fillStyle = col; if (ci < 0) g.fillRect(cols[0], top + r * rowH, SH_W - cols[0], rowH); else g.fillRect(X[ci], top + r * rowH, cols[ci], rowH); });
  label(g, title, X[1] + 14, top + 49, 700, 30, '#2E332B', 'left', 1, FB);
  ['Esercizio', 'Serie', 'Carico', 'RPE', 'Note'].forEach((s, i) => label(g, s, X[i + 1] + 14, top + rowH + 49, 700, 30, '#5D6358', 'left', 1, FB));
  rows.forEach((row, r) => row.forEach((s, ci) => { if (s) label(g, s, X[ci + 1] + 14, top + (r + 2) * rowH + 49, 500, 30, /\?/.test(s) ? '#C0392B' : '#2E332B', 'left', 1, FB); }));
  g.strokeStyle = '#CDD1C9'; g.lineWidth = 1.5;
  for (let r = 0; r <= R; r++) { g.beginPath(); g.moveTo(0, top + r * rowH); g.lineTo(SH_W, top + r * rowH); g.stroke(); }
  X.forEach((xx) => { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, SH_H); g.stroke(); });
  const ty = SH_H - 70; g.fillStyle = '#E3E6E0'; g.fillRect(0, ty, SH_W, 70);
  let tx = 20; o.tabs.forEach((s, i) => { const tw = textW(g, s, 500, 26, FB) + 40; rrect(g, tx, ty + 10, tw, 50, 8, i === o.active ? '#FFFFFF' : '#D5D9D1'); label(g, s, tx + tw / 2, ty + 44, i === o.active ? 700 : 500, 26, '#4A5045', 'center', 1, FB); tx += tw + 10; });
  return c;
}
function sheetTexV(v) {
  if (v === 0) return sheetTex();
  if (SHEETV[v]) return SHEETV[v];
  if (v === 1) SHEETV[v] = sheetGrid('Anna · prep gara', [
    ['Muscle-up', 'top', '+20?', '9'], ['Muscle-up', '3x1', '+15', '8'], ['Trazioni', '4x2', '+40', '8,5'], ['Dip', '4x3', '+55', 'RIR2'],
    ['Squat', '5x2', '120', '8'], ['Dip', '3x5', '+30', ''], ['Trazioni', 'max', '', '??'],
  ], { fills: [[4, -1, '#DDEBD2'], [8, 5, '#F7D6D0']], tabs: ['Sett 1', 'Sett 2', 'Sett 3', 'Gara'], active: 1 });
  if (v === 2) SHEETV[v] = sheetGrid('Teo · blocco 2', [
    ['Front lever', '5x8"', '', ''], ['Planche', '6x6"', '', ''], ['Trazioni', '4x4', '+30', '8'], ['Dip', '3x6', '+40', 'RIR1'],
    ['Muscle-up', 'EMOM 8', '', '??'], ['Squat', '4x5', '100', '7'], ['Trazioni', '3x?', '', ''],
  ], { fills: [[5, -1, '#DDEBD2'], [6, 3, '#F7D6D0']], tabs: ['Teo', 'Teo (vecchio)', 'Note'], active: 0 });
  return SHEETV[v];
}


// ---------- biglietti e messaggi (dal Reel 1) ----------
const NOTES = [
  { k: 'chat', who: 'Luca', s: ['Coach, il dip oggi', 'con quanto?'], x: 760, y: 960, rot: 0.03 },
  { k: 'post', s: ['vedi tab', 'vecchia'], x: 300, y: 1130, rot: -0.07 },
  { k: 'chat', who: 'Luca', s: ['Ho fatto 4 serie su 5,', 'lo scrivo dove?'], x: 650, y: 1400, rot: -0.025 },
  { k: 'file', s: ['Schede ottobre - copia (2).xlsx'], x: 430, y: 820, rot: 0.02 },
  { k: 'post', s: ['RPE??'], x: 820, y: 1210, rot: 0.08 },
  { k: 'chat', who: 'Teo', s: ['Coach, quale foglio', 'apro oggi?'], x: 330, y: 1570, rot: 0.035 },
  { k: 'red', s: ['chiedi a Teo'], x: 840, y: 1660, rot: -0.04 },
];
function noteSize(n) {
  const c = H.layer(10, 10).getContext('2d');
  if (n.k === 'chat') { const w = Math.max(...n.s.map((s) => textW(c, s, 500, 36, FB))) + 64; return [Math.max(300, w), 66 + n.s.length * 46]; }
  if (n.k === 'post') { const w = Math.max(...n.s.map((s) => textW(c, s, 700, 38, FB))) + 60; return [Math.max(200, w), 40 + n.s.length * 48]; }
  if (n.k === 'file') return [textW(c, n.s[0], 600, 30, FB) + 120, 84];
  return [textW(c, n.s[0], 700, 36, FB) + 64, 78];
}
function noteDraw(n) {
  return (g, w, h) => {
    if (n.k === 'chat') {
      g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
      g.beginPath(); g.roundRect(0, 0, w, h, 30); g.fillStyle = 'rgba(38,40,43,0.97)'; g.fill(); g.restore();
      g.beginPath(); g.moveTo(26, h - 2); g.lineTo(6, h + 18); g.lineTo(58, h - 2); g.closePath(); g.fillStyle = 'rgba(38,40,43,0.97)'; g.fill();
      caps(g, n.who, 32, 44, 22, 'rgba(255,255,255,0.58)');
      n.s.forEach((s, i) => label(g, s, 32, 94 + i * 46, 500, 36, '#FFFFFF', 'left', 1, FB));
    } else if (n.k === 'post') {
      g.save(); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 12; g.fillStyle = '#EFE6BC'; g.fillRect(0, 0, w, h); g.restore();
      g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(0, 0, w, 18);
      n.s.forEach((s, i) => label(g, s, 30, 64 + i * 48, 700, 38, '#3A3524', 'left', 1, FB));
    } else if (n.k === 'file') {
      g.save(); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 26; g.shadowOffsetY = 12; g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fillStyle = '#FFFFFF'; g.fill(); g.restore();
      rrect(g, 30, 20, 34, 44, 6, '#D5D9D1'); g.fillStyle = '#9AA095'; g.fillRect(38, 34, 18, 3); g.fillRect(38, 42, 18, 3); g.fillRect(38, 50, 12, 3);
      label(g, n.s[0], 84, 54, 600, 30, '#2E332B', 'left', 1, FB);
    } else {
      g.save(); g.strokeStyle = '#E0564A'; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 4, -0.03, 0, 7); g.stroke(); g.restore();
      label(g, n.s[0], w / 2, h / 2 + 13, 700, 36, '#F3A398', 'center', 1, FB);
    }
  };
}

// ===================== scene del gancio (0–2,85 s) =====================
// La camera dei fogli spinge piano; da 2,22 a 2,8 s le luci si spengono e gli oggetti cadono nel buio.
const KEYS_GANCIO = [
  { t: 0, cx: 610, cy: 1560, s: 0.96, yaw: -0.2, pitch: 0.2 },
  { t: 2.9, cx: 600, cy: 1525, s: 1.08, yaw: -0.08, pitch: 0.22 },
];
const USCITA_GANCIO = [2.22, 2.8];
const FOGLI = [
  { v: 1, x: -0.66, y: 1.36, z: -0.6, w: 2.0, h: 2.5, rx: -0.2, ry: 0.42, t: -0.35 },
  { v: 2, x: 0.7, y: 1.42, z: -0.45, w: 2.0, h: 2.5, rx: -0.24, ry: -0.12, t: -0.2 },
  { v: 0, x: 0.02, y: 1.3, z: 0.05, w: 2.15, h: 2.68, rx: -0.22, ry: 0.16, t: -0.05 },
];
const FILE_GANCIO = [
  { s: 'Luca – forza.xlsx', x: 690, y: 830, rot: 0.03, t: 0.35 },
  { s: 'Anna – prep gara.xlsx', x: 360, y: 965, rot: -0.04, t: 0.55 },
  { s: 'Teo.ods', x: 830, y: 1095, rot: 0.05, t: 0.75 },
  { s: 'Marco R – blocco 2.xlsx', x: 420, y: 1235, rot: -0.02, t: 0.95 },
  { s: 'Schede ottobre.zip', x: 760, y: 1385, rot: 0.04, t: 1.15 },
  { s: 'Gara marzo – copia.xlsx', x: 340, y: 1525, rot: -0.05, t: 1.35 },
];
function luceGancio(t) { return 1 - sm(USCITA_GANCIO[0], USCITA_GANCIO[1], t); }
// oggetti che arrivano uno dopo l'altro e poi cadono nel buio
function oggettiGancio(x, t, voci, chiave, dim, disegno) {
  const zoom = H.lerp(1, 1.05, io(t / 2.9));
  voci.forEach((f, i) => {
    if (t < f.t) return;
    const e = H.ease.back(H.clamp((t - f.t) / 0.3)), a = H.clamp((t - f.t) / 0.12);
    const fall = ei(sm(USCITA_GANCIO[0] + i * 0.03, USCITA_GANCIO[1], t));
    const cx = 540 + (f.x - 540) * zoom, cy = 960 + (f.y - 960) * zoom + fall * 260;
    const [w, h] = dim(f);
    drawSprite(x, chiave + i, w, h, disegno(f), cx, cy, 0.7 + 0.3 * e, a * (1 - fall), f.rot + fall * 0.1 * (i % 2 ? 1 : -1), fall * 12);
  });
}
const GANCI = {
  // fogli di calcolo uno sull'altro e file che si accumulano (Reel 2)
  fogli(x, t) {
    const c = cam(keyed(KEYS_GANCIO, t)), k = luceGancio(t);
    stage(x, c, { key: k * 0.9, green: COPIONE.palco === 'verde' ? 1 : 0 }, t);
    libero(() => {
      FOGLI.forEach((S, i) => {
        const e = eo((t - S.t) / 0.4); if (e <= 0) return;
        plane(x, c, sheetTexV(S.v), { x: S.x, y: S.y + (1 - e) * 0.35, z: S.z, w: S.w, h: S.h, rx: S.rx, ry: S.ry, alpha: e, dark: (1 - k) * 0.9 + (i < 2 ? 0.18 : 0) });
      });
      oggettiGancio(x, t, FILE_GANCIO, 'gf', (f) => [fileW(f.s), FILE_H], (f) => fileDraw(f.s));
    });
  },
  // messaggi e biglietti che si accumulano nel buio (Reel 1)
  notifiche(x, t) {
    const c = cam(keyed(KEYS_GANCIO, t)), k = luceGancio(t);
    stage(x, c, { key: k * 0.7, green: COPIONE.palco === 'verde' ? 1 : 0 }, t);
    const voci = NOTES.map((n, i) => Object.assign({}, n, { t: 0.2 + i * 0.24 }));
    libero(() => oggettiGancio(x, t, voci, 'gn', (n) => noteSize(n), (n) => noteDraw(n)));
  },
  // la scheda di un foglio in prospettiva, con la cella che cambia evidenziata
  griglia(x, t) {
    const c = cam(keyed(KEYS_GANCIO, t)), k = luceGancio(t);
    stage(x, c, { key: k * 0.9, green: COPIONE.palco === 'verde' ? 1 : 0 }, t);
    libero(() => {
      const e = eo((t + 0.3) / 0.5);
      const cs = plane(x, c, sheetTex(), { x: 0.05, y: 1.32, z: 0, w: 2.3, h: 2.86, rx: -0.24, ry: 0.22, alpha: e, dark: (1 - k) * 0.9 });
      // cursore in rame che scorre sulle righe
      const r = Math.floor(H.clamp(t / 0.45, 0, 7)), f = (t / 0.45) % 1;
      const lerp2 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      const top = 64 / SH_H + (r + 2) * 74 / SH_H, bot = top + 74 / SH_H;
      const L0 = lerp2(cs[0], cs[3], top), R0 = lerp2(cs[1], cs[2], top), L1 = lerp2(cs[0], cs[3], bot), R1 = lerp2(cs[1], cs[2], bot);
      x.save(); x.globalAlpha = e * k * (0.55 + 0.45 * Math.sin(f * PI));
      x.strokeStyle = `rgba(${CUc},0.95)`; x.lineWidth = 3; poly(x, [L0, R0, R1, L1]); x.stroke(); x.restore();
    });
  },
  // un cronometro di vetro con i secondi che scorrono
  cronometro(x, t) {
    const c = cam(keyed(KEYS_GANCIO, t)), k = luceGancio(t);
    stage(x, c, { key: k * 0.9, green: COPIONE.palco === 'verde' ? 1 : 0 }, t);
    const cx = 540, cy = 1060, R = 250, a = eo((t + 0.4) / 0.5) * k;
    if (a <= 0.003) return;
    x.save(); x.globalAlpha = a;
    x.fillStyle = 'rgba(26,28,30,0.85)'; x.beginPath(); x.arc(cx, cy, R + 40, 0, 7); x.fill();
    x.strokeStyle = `rgba(${CUc},0.5)`; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R + 40, 0, 7); x.stroke();
    for (let i = 0; i < 60; i++) {
      const an = -PI / 2 + i / 60 * 2 * PI, l = i % 5 === 0 ? 26 : 12;
      x.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'; x.lineWidth = i % 5 === 0 ? 4 : 2;
      x.beginPath(); x.moveTo(cx + Math.cos(an) * (R - l), cy + Math.sin(an) * (R - l)); x.lineTo(cx + Math.cos(an) * R, cy + Math.sin(an) * R); x.stroke();
    }
    const sec = 60 - Math.floor(t * 6) % 60, p = (t * 6) % 60 / 60;
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 12; x.lineCap = 'round';
    x.beginPath(); x.arc(cx, cy, R - 46, -PI / 2, -PI / 2 + 2 * PI * (1 - p)); x.stroke();
    x.restore();
    label(x, sec === 60 ? '1:00' : `0:${String(sec).padStart(2, '0')}`, cx, cy + 46, 700, 130, '#FFFFFF', 'center', a, FT);
  },
};

// ===================== blocchi generici =====================
// entrata da destra, uscita a sinistra negli ultimi 0,6 s della sezione (come i riquadri del Reel 2)
const TOP_RIQ = 540;
function moto(tl, s) {
  const dur = s.t1 - s.t0, e = eo((tl - 0.25) / 0.6), out = s.tipo === 'culmine' ? 0 : sm(dur - 0.6, dur - 0.05, tl);
  return { e, out, a: e * (1 - out), dx: (1 - e) * 620 - out * 900, blur: (1 - e) * 12 };
}
const RIGA = 112;
// riquadri più bassi stanno più al centro dello spazio libero sotto il titolo
const topRiq = (h) => TOP_RIQ + Math.max(0, (680 - h) * 0.35);
// riga di un riquadro, disegnata dal vivo con una piccola salita
function rigaRiquadro(x, X0, y, w, sx, dx, a) {
  if (a <= 0.003) return;
  x.save(); x.globalAlpha *= a; x.translate(0, (1 - a) * 14);
  rrect(x, X0 + 36, y, w - 72, RIGA - 18, 24, 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.14)', 1.5);
  label(x, sx, X0 + 66, y + 62, 700, 46, '#FFFFFF', 'left', 1, FT);
  if (dx) label(x, dx, X0 + w - 66, y + 60, 500, 36, INK2, 'right', 1, FB);
  x.restore();
}
const KIND = { rame: 'rame', difficile: 'difficile', facile: 'facile', neutra: 'neutra' };
// pulsante chiaro → riquadro salvia con la spunta dopo il tocco
function pulsante(x, X0, y, w, h, testo, fatto, ok) {
  entra(x, testo, 700, 40, FB, w - 48, 'non entra nel pulsante');
  entra(x, fatto, 700, 36, FB, w - 96, 'non entra nel pulsante');
  if (ok) {
    rrect(x, X0, y, w, h, 26, 'rgba(140,190,110,0.16)', 'rgba(150,200,120,0.60)', 2);
    const tw = textW(x, fatto, 700, 36, FB), x0 = X0 + w / 2 - (tw + 48) / 2;
    icCheck(x, x0 + 16, y + h / 2, 26, EASY, 5);
    label(x, fatto, x0 + 48, y + h / 2 + 13, 700, 36, '#E2F0D6', 'left', 1, FB);
  } else {
    rrect(x, X0, y, w, h, 26, '#F4F4EF');
    label(x, testo, X0 + w / 2, y + h / 2 + 14, 700, 40, '#242B1D', 'center', 1, FB);
  }
}
const evRighe = (n, t0) => Array.from({ length: n }, (_, i) => ({ t: t0 + i * 0.25, tipo: 'parola', pan: 0.25 }));

const BLOCCHI_JS = {
  // vetro con intestazione e righe «testo · valore»
  'pannello-righe': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const W0 = 950, h = 130 + d.righe.length * RIGA, X0 = 65 + m.dx, T0 = topRiq(h);
      drawSprite(x, 'pr' + s.t0, W0, h, (g, w, hh) => { glass(g, w, hh, { r: 34 }); caps(g, d.intestazione, 40, 72, 30, INK3); }, 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      d.righe.forEach((r, i) => rigaRiquadro(x, X0, T0 + 108 + i * RIGA, W0, r[0], r[1], m.a * eo((tl - 0.7 - i * 0.25) / 0.45)));
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(evRighe(d.righe.length, 0.7)),
  },
  // contatore che sale e righe con lo stato (come l'elenco del Reel 2)
  'elenco-contatore': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const W0 = 950, h = 300 + d.righe.length * 100, X0 = 65 + m.dx, T0 = topRiq(h);
      drawSprite(x, 'ec' + s.t0, W0, h, (g, w, hh) => glass(g, w, hh, { r: 34 }), 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      const N = Number(d.numero), n = Math.max(1, Math.round(N * eo(sm(0.5, 1.6, tl))));
      label(x, String(n), X0 + 40, T0 + 196, 700, 170, '#FFFFFF', 'left', m.a * sm(0.4, 0.7, tl), FT);
      // l'etichetta al plurale arriva quando il conto ha superato 1 (niente «1 atleti»)
      label(x, d.etichetta, X0 + 40, T0 + 252, 500, 38, INK2, 'left', m.a * (n > 1 || N <= 1 ? sm(0.62, 0.9, tl) : 0), FB);
      d.righe.forEach((r, i) => {
        const a = m.a * eo((tl - 0.8 - i * 0.25) / 0.45); if (a <= 0.003) return;
        const top = T0 + 290 + i * 100;
        x.save(); x.globalAlpha *= a; x.translate(0, (1 - a) * 14);
        x.fillStyle = 'rgba(255,255,255,0.09)'; x.fillRect(X0 + 40, top, W0 - 80, 1.5);
        label(x, r[0], X0 + 40, top + 50, 700, 42, '#FFFFFF', 'left', 1, FB);
        label(x, r[1], X0 + 40, top + 86, 500, 32, INK3, 'left', 1, FB);
        if (r[3]) pill(x, X0 + W0 - 40, top + 50, r[3], KIND[r[2]] || 'neutra', 28, 'right');
        else { x.fillStyle = r[2] === 'difficile' ? HARD : r[2] === 'facile' ? EASY : `rgb(${CUc})`; x.beginPath(); x.arc(X0 + W0 - 58, top + 50, 11, 0, 7); x.fill(); }
        x.restore();
      });
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }]
      .concat(Array.from({ length: Math.max(0, Number(d.numero) - 1) }, (_, i) => ({ t: 0.5 + 1.1 * Math.sqrt((i + 1) / Math.max(1, Number(d.numero))), tipo: 'conta', pan: 0.2 })))
      .concat(evRighe(d.righe.length, 0.8)),
  },
  // scheda da confermare con un tocco, poi la conferma in salvia
  'scheda-conferma': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const dur = s.t1 - s.t0, tap = dur * 0.5, ok = tl >= tap + 0.12;
      const W0 = 950, h = 250 + d.righe.length * RIGA, X0 = 65 + m.dx, T0 = topRiq(h);
      drawSprite(x, 'sc' + s.t0, W0, h, (g, w, hh) => { glass(g, w, hh, { r: 34 }); caps(g, d.intestazione, 40, 72, 30, INK3); }, 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      d.righe.forEach((r, i) => rigaRiquadro(x, X0, T0 + 108 + i * RIGA, W0, r[0], r[1], m.a * eo((tl - 0.7 - i * 0.25) / 0.45)));
      const by = T0 + h - 124;
      x.save(); x.globalAlpha *= m.a; pulsante(x, X0 + 40, by, W0 - 80, 90, d.pulsante, d.fatto, ok); x.restore();
      if (tl > tap && tl < tap + 0.7) ripple(x, 540 + m.dx, by + 45, eo((tl - tap) / 0.6), 120);
    },
    eventi: (d, s) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(evRighe(d.righe.length, 0.7),
      [{ t: (s.t1 - s.t0) * 0.5, tipo: 'tocco', pan: 0 }, { t: (s.t1 - s.t0) * 0.5 + 0.11, tipo: 'ok', pan: 0 }]),
  },
  // numero grande che si accende sul colpo (il culmine)
  numero: {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const tc = F.P.colpo - s.t0, ok = tl >= tc + 0.12, W0 = 720, h = d.pulsante ? 560 : 420;
      const cy = 820 + (1 - m.e) * 60, sc = H.lerp(0.9, 1, H.ease.back(H.clamp((tl - 0.25) / 0.6))), cx = 540 + Math.min(0, m.dx);
      drawSprite(x, 'nu' + s.t0 + (ok ? 'ok' : ''), W0, h, (g, w, hh) => {
        glass(g, w, hh, { r: 36 });
        if (d.intestazione) caps(g, d.intestazione, w / 2, 72, 30, INK3, 'center');
        label(g, d.etichetta, w / 2, 330, 500, 40, INK2, 'center', 1, FB);
        if (d.pulsante) pulsante(g, 60, hh - 150, w - 120, 100, d.pulsante, d.fatto || d.pulsante, ok);
      }, cx, cy, sc, m.a, 0, 0);
      if (d.pulsante && tl > tc && tl < tc + 0.7) ripple(x, cx, cy + h / 2 - 100, eo((tl - tc) / 0.6), 130);
      const lk = tl > tc ? Math.exp(-(tl - tc) * 2.2) : 0, zoom = 1 + 0.06 * sm(tc, tc + 0.5, tl) + 0.04 * lk;
      const ny = cy - h / 2 + 262, s2 = String(d.numero);
      x.save(); x.globalAlpha *= m.a; x.translate(cx, ny); x.scale(zoom * sc, zoom * sc); setF(x, 700, 210, FT);
      x.textAlign = 'center'; x.shadowColor = `rgba(255,232,206,${0.35 + 0.45 * lk + 0.15 * sm(tc, tc + 0.3, tl)})`; x.shadowBlur = 40 + 70 * lk;
      x.fillStyle = '#FFFFFF'; registraTesto(x, s2, 0, 0, 210, 'center'); x.fillText(s2, 0, 0); x.shadowBlur = 0; x.fillText(s2, 0, 0); x.restore();
      gleam(x, (g) => { g.save(); g.translate(cx, ny); g.scale(zoom * sc, zoom * sc); setF(g, 700, 210, FT); g.textAlign = 'center'; g.fillText(s2, 0, 0); g.restore(); }, sm(tc + 0.2, tc + 0.8, tl), 380, 700, 80, 0.8);
    },
    eventi: (d, s, colpo) => [{ t: 0.25, tipo: 'fruscio', pan: 0.2 }].concat(d.pulsante ? [{ t: colpo - s.t0, tipo: 'tocco', pan: 0 }] : []),
  },
  // il telefono principale passa da una schermata all'altra
  'telefono-schermata': {
    schermo(tl, d, s) {
      const dur = s.t1 - s.t0, a = dur * 0.45;
      if (tl < a) return schermoNome(d.da, tl, d);
      if (tl < a + 0.55) return texWipeK('ts' + s.t0, schermoNome(d.da, tl, d), schermoNome(d.a, tl, d), sm(a, a + 0.55, tl));
      return schermoNome(d.a, tl, d);
    },
    disegna() {},
    eventi: (d, s) => [{ t: 0.25, tipo: 'fruscio', pan: 0 }, { t: (s.t1 - s.t0) * 0.45, tipo: 'schermo', pan: 0 }],
  },
  // tre telefoni: le schede volano dentro e i nomi arrivano sopra
  'tre-telefoni': {
    scena(x, F, tl, d, s) {
      const m = io(sm(0, 1.0, tl));
      F.lati = [-1, 1].map((side) => {
        const i = side < 0 ? 0 : 2, at = d.atleti[i] || d.atleti[0], arr = 0.75 + i * 0.18 + 0.7;
        const tex = tl < arr ? texIdle() : tl < arr + 0.55 ? texWipeK('tt' + i, texIdle(), schermoNome(at.schermo, tl, d), sm(arr, arr + 0.55, tl)) : schermoNome(at.schermo, tl, d);
        const S = { x: side * H.lerp(2.7, 1.16, m), y: 0.1 + 0.012 * Math.sin(F.t * 1.2 + side), z: -0.05, ry: side * H.lerp(-0.6, -0.16, m), tex, scrA: 1,
          ring: 0.4 * m + 0.6 * (tl > arr ? Math.exp(-(tl - arr) * 4) : 0), ringRot: F.t * 0.3 + side, spec: H.map(tl, 2.6 + (side + 1) * 0.25, 3.4 + (side + 1) * 0.25, -0.25, 1.25) };
        const p = F.c.P(S.x, 1, S.z);
        return p[0] > -F.c.unit * 0.8 && p[0] < W + F.c.unit * 0.8 ? phoneFull(x, F.c, S, F.L) : null;
      });
    },
    schermo(tl, d) {
      const at = d.atleti[1] || d.atleti[0], arr = 0.75 + 0.18 + 0.7;
      if (tl < arr) return texIdle();
      if (tl < arr + 0.55) return texWipeK('tt1', texIdle(), schermoNome(at.schermo, tl, d), sm(arr, arr + 0.55, tl));
      return schermoNome(at.schermo, tl, d);
    },
    disegna(x, F, tl, d, s) {
      const GG = [F.lati && F.lati[0], F.eroe, F.lati && F.lati[1]], dur = s.t1 - s.t0, fade = 1 - sm(dur - 0.6, dur - 0.2, tl);
      for (let i = 0; i < 3; i++) {
        const G = GG[i], at = d.atleti[i]; if (!G || !at) continue;
        const u = H.clamp((tl - 0.75 - i * 0.18) / 0.7);
        if (u > 0 && u < 1) {
          const P0 = [540, 760], P3 = G.uv(0.5, 0.36), p = bezAt(P0, [P0[0] + (i - 1) * 140, P0[1] - 150], [P3[0], P3[1] - 240], P3, io(u));
          const testo = 'Scheda di ' + at.nome, w = textW(x, testo, 600, 28, FB) + 48;
          drawSprite(x, 'sd' + i + at.nome, w, 52, chipDraw(testo), p[0], p[1], H.lerp(1, 0.5, u), Math.min(1, u * 5) * (1 - sm(0.82, 1, u)), 0, 0);
        }
        const A = G.uv(0.5, 0.0), pn = sm(1.8 + i * 0.2, 2.7 + i * 0.2, tl);
        if (fade > 0.003) nameTag(x, [A[0], A[1] - 22], 660, pn, at.nome, at.sotto || '', fade);
      }
    },
    eventi: (d) => [0, 1, 2].flatMap((i) => [{ t: 0.75 + i * 0.18, tipo: 'fruscio', pan: (i - 1) * 0.5 }, { t: 1.45 + i * 0.18, tipo: 'schermo', pan: (i - 1) * 0.5 }, { t: 2.3 + i * 0.2, tipo: 'parola', pan: (i - 1) * 0.5 }]),
  },
};

// blocchi dei temi (schermate.js), con la stessa forma dei blocchi generici
if (typeof BLOCCHI_TEMI !== 'undefined') Object.assign(BLOCCHI_JS, BLOCCHI_TEMI);

// ---------- schermate per nome: 'vuoto', 'logo', 'settimana:<atleta>', 'home:<palestra>' e quelle dei temi ----------
const SCHERMI = Object.assign({
  vuoto: () => texIdle(),
  logo: () => texBoot(1),
}, typeof SCHERMI_TEMI !== 'undefined' ? SCHERMI_TEMI : {});
function schermoNome(nome, tl, d) {
  const [tipo, arg] = String(nome || 'vuoto').split(':');
  if (tipo === 'settimana' && ATH[arg]) return weekTex('wk-' + arg, ATH[arg]);
  if (tipo === 'home' && THEME[arg]) return texHome('home-' + arg, arg);
  const f = SCHERMI[tipo];
  return f ? f(tl, d, arg) : texIdle();
}
// per il controllo del catalogo (blocchi.json, voce «schermi»): le schermate che il motore sa disegnare,
// e se un nome darebbe il telefono vuoto
ESPORTA.schermate = {
  motore: () => Object.keys(SCHERMI).concat(Object.keys(ATH).map((k) => 'settimana:' + k),
    Object.keys(THEME).filter((k) => THEME[k].name).map((k) => 'home:' + k)),
  vuota: (nome) => nome !== 'vuoto' && schermoNome(nome, 1, {}) === texIdle(),
};
