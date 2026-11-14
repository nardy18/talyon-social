// ===================== Talyon Reel · interfaccia comune (dal Reel 1 e dal Reel 2) =====================
// Schermate stilizzate come nei caroselli: niente screenshot veri, solo dati demo.
// Palestre demo come nei caroselli: Ferro Street (nero e giallo) e Barra Alta (chiaro e blu).

const THEME = {
  talyon: { grad: true, text: '#FFFFFF', sup: 'rgba(255,255,255,0.08)', bordo: 'rgba(217,142,74,0.35)', t2: 'rgba(255,255,255,0.66)', btn: '#F4F4EF', btnTx: '#242B1D', acc: '#F4F4EF', logo: '#303A26', logoTx: '#FFFFFF' },
  fs: { bg: '#0E0E0E', text: '#FFFFFF', sup: '#1B1B1B', bordo: '#2A2A2A', t2: 'rgba(255,255,255,0.62)', btn: '#FFD21F', btnTx: '#111111', acc: '#FFD21F', logo: '#FFD21F', logoTx: '#111111', name: 'Ferro Street', mono: 'FS' },
  ba: { bg: '#F2F5F9', text: '#0F1E36', sup: '#FFFFFF', bordo: '#DCE3EC', t2: '#5B6B82', btn: '#2563EB', btnTx: '#FFFFFF', acc: '#2563EB', logo: '#2563EB', logoTx: '#FFFFFF', name: 'Barra Alta', mono: 'BA' },
};
const TEXC = {};
// ogni schermata si ridisegna tutta a ogni chiamata: i testi registrati ripartono da zero
const texCanvas = (name) => {
  const c = TEXC[name] || (TEXC[name] = superficie(H.layer(TEX_W, TEX_H), 'schermata', [0, 0, TEX_W, TEX_H], 8));
  c.__superficie.testi = [];
  return c;
};
function scrBg(g, th) {
  if (th.grad) {
    g.fillStyle = '#161A11'; g.fillRect(0, 0, TEX_W, TEX_H);
    g.save(); g.translate(TEX_W / 2, -0.1 * TEX_H); g.scale(1, (0.6 * TEX_H) / (1.2 * TEX_W));
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1.2 * TEX_W);
    gr.addColorStop(0, '#3A4630'); gr.addColorStop(0.55, '#242B1D'); gr.addColorStop(1, '#161A11');
    g.fillStyle = gr; g.fillRect(-700, -200, 1400, 4000); g.restore();
  } else { g.fillStyle = th.bg; g.fillRect(0, 0, TEX_W, TEX_H); }
}
function rrect(g, X, Y, w, h, r, fill, stroke, lw) {
  g.beginPath(); g.roundRect(X, Y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
}
function tabBar(g, th, active) {
  const y = TEX_H - 120;
  g.fillStyle = th.bordo; g.fillRect(44, y - 24, TEX_W - 88, 2);
  for (let i = 0; i < 4; i++) { const cx = 110 + i * 140; rrect(g, cx - 26, y, 52, 52, 14, i === active ? th.acc : th.t2); }
  g.save(); g.globalAlpha = 0.5; for (let i = 0; i < 4; i++) if (i !== active) { const cx = 110 + i * 140; rrect(g, cx - 26, y, 52, 52, 14, th.bg || '#242B1D'); } g.restore();
}

// --- schermata di avvio con il simbolo e la scritta (momento 2)
function texBoot(p) {
  const c = texCanvas('boot'), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, THEME.talyon);
  const gl = g.createRadialGradient(320, 560, 0, 320, 560, 360);
  gl.addColorStop(0, `rgba(255,236,214,${0.10 * p})`); gl.addColorStop(1, 'rgba(255,236,214,0)');
  g.fillStyle = gl; g.fillRect(0, 0, TEX_W, TEX_H);
  drawMark(g, 320, 560, 330, { parts: p });
  drawWord(g, 320, 860, 360, { alpha: sm(0.55, 1, p) });
  return c;
}
// --- home dell'atleta nei colori di una palestra (momento 6)
function texHome(key, themeName) {
  const c = texCanvas(key), g = c.getContext('2d'), th = THEME[themeName];
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  rrect(g, 44, 124, 96, 96, 48, th.logo);
  label(g, th.mono, 92, 186, 800, 40, th.logoTx, 'center', 1, FB, 1);
  label(g, th.name, 162, 186, 700, 46, th.text, 'left', 1, FT);
  caps(g, 'Giovedì', 44, 300, 30, th.t2);
  label(g, 'Ciao Luca', 44, 382, 700, 78, th.text, 'left', 1, FT);
  const card = (y, t1, t2) => { rrect(g, 44, y, TEX_W - 88, 170, 40, th.sup, th.bordo, 2); label(g, t1, 84, y + 72, 700, 50, th.text, 'left', 1, FT); label(g, t2, 84, y + 128, 500, 36, th.t2, 'left', 1, FB); };
  card(430, 'Dip con fermo', '4 × 3 @7 · +30 kg');
  card(630, 'Muscle-up', '4 × 2 @6 · +5 kg');
  card(830, 'Record', 'Dip +90 kg · nuovo');
  rrect(g, 44, 1060, TEX_W - 88, 112, 34, th.btn);
  label(g, 'Apri la scheda', TEX_W / 2, 1130, 700, 42, th.btnTx, 'center', 1, FB);
  tabBar(g, th, 0);
  return c;
}
// --- schermo in attesa (momento 3): fondo del tema con un velo di luce
function texIdle() {
  const c = texCanvas('idle'), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, THEME.talyon);
  return c;
}

// ===================== sprite delle schede di vetro (con livelli di sfocatura per la profondità di campo) =====================
const SPR = {}, SPS = 1.5, SPP = 60;
CACHE_DISEGNI.push(SPR);
function sprite(key, w, h, draw, blur) {
  const k = key + '|' + blur;
  if (SPR[k]) return SPR[k];
  const c = H.layer(Math.ceil((w + SPP * 2) * SPS), Math.ceil((h + SPP * 2) * SPS)), g = c.getContext('2d');
  if (blur) { const b = sprite(key, w, h, draw, 0); g.filter = `blur(${(blur * SPS).toFixed(1)}px)`; g.drawImage(b, 0, 0); g.filter = 'none'; }
  else { superficie(c, 'riquadro', [SPP * SPS, SPP * SPS, (SPP + w) * SPS, (SPP + h) * SPS], 8 * SPS); g.scale(SPS, SPS); g.translate(SPP, SPP); draw(g, w, h); }
  c._w = w; c._h = h;
  return (SPR[k] = c);
}
// disegna uno sprite con il centro in (cx, cy), scala s, rotazione rot, sfocatura (livelli 0/3/7/12)
function drawSprite(x, key, w, h, draw, cx, cy, s, a, rot, blur) {
  if (a <= 0.003) return;
  const lv = [0, 3, 7, 12]; let bi = 0; for (let i = 0; i < lv.length; i++) if (Math.abs(lv[i] - (blur || 0)) < Math.abs(lv[bi] - (blur || 0))) bi = i;
  const sp = sprite(key, w, h, draw, lv[bi]);
  registraRiquadro(x, key, cx, cy, w * s, h * s, a);
  x.save(); x.globalAlpha *= a; x.translate(cx, cy); if (rot) x.rotate(rot); x.scale(s / SPS, s / SPS);
  x.drawImage(sp, -sp.width / 2, -sp.height / 2); x.restore();
}
// vetro Talyon: fondo scuro traslucido, luce in alto, bordo rame sottile, ombra morbida
function glass(g, w, h, o) {
  o = o || {}; const r = o.r == null ? 30 : o.r;
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 44; g.shadowOffsetY = 20;
  g.beginPath(); g.roundRect(0, 0, w, h, r); g.fillStyle = o.base || 'rgba(26,28,30,0.9)'; g.fill();
  g.shadowColor = 'transparent';
  let gr = g.createLinearGradient(0, 0, w * 0.35, h);
  gr.addColorStop(0, 'rgba(255,255,255,0.11)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.035)'); gr.addColorStop(1, 'rgba(255,255,255,0.02)');
  g.fillStyle = gr; g.fill();
  g.save(); g.clip(); gr = g.createLinearGradient(0, 0, 0, 3); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, 3); g.restore();
  g.save(); g.beginPath(); g.roundRect(0, 0, w, h, r); g.clip();
  gr = g.createLinearGradient(0, 0, w, h * 1.4);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.16, 'rgba(255,255,255,0.075)'); gr.addColorStop(0.26, 'rgba(255,255,255,0.02)'); gr.addColorStop(0.34, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore();
  g.lineWidth = 1.5; g.strokeStyle = `rgba(${CUc},${o.bd == null ? 0.42 : o.bd})`; g.beginPath(); g.roundRect(0.75, 0.75, w - 1.5, h - 1.5, r); g.stroke();
  g.restore();
}
function pill(g, X, Y, s, kind, px, align) {   // pillole neutra / difficile / facile (kit .pill)
  px = px || 28; g.save(); setF(g, 600, px, FB); const tw = g.measureText(s).width, ic = (kind === 'neutra' || kind === 'rame') ? 0 : px * 0.95;
  const w = tw + 44 + ic, h = px * 1.75, x0 = align === 'right' ? X - w : X;
  const st = { neutra: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.82)'], difficile: ['rgba(224,86,74,0.18)', 'rgba(224,86,74,0.65)', '#FFD9D4'], facile: ['rgba(140,190,110,0.14)', 'rgba(150,200,120,0.55)', '#E2F0D6'], rame: ['rgba(255,255,255,0.07)', `rgba(${CUc},0.6)`, '#FFFFFF'] }[kind];
  rrect(g, x0, Y - h / 2, w, h, h / 2, st[0], st[1], 1.5);
  if (kind === 'difficile') icUpDown(g, x0 + 22 + ic * 0.4, Y, px * 0.8, true, HARD, 3);
  if (kind === 'facile') icUpDown(g, x0 + 22 + ic * 0.4, Y, px * 0.8, false, EASY, 3);
  g.fillStyle = st[2]; g.textAlign = 'left'; g.textBaseline = 'middle'; registraTesto(g, s, x0 + 22 + ic, Y + 1, px, 'left'); g.fillText(s, x0 + 22 + ic, Y + 1); g.restore();
  return w;
}


// ---------- icone e file (dal Reel 2) ----------
const SCR = H.layer(16, 16).getContext('2d');   // per misurare i testi fuori dagli sprite

// ---------- icone ----------
function icUpload(x, cx, cy, s, col, lw) {        // vassoio con freccia in su
  x.save(); x.strokeStyle = col; x.lineWidth = lw || s * 0.08; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(cx - s * 0.42, cy + s * 0.05); x.lineTo(cx - s * 0.42, cy + s * 0.38); x.lineTo(cx + s * 0.42, cy + s * 0.38); x.lineTo(cx + s * 0.42, cy + s * 0.05); x.stroke();
  x.strokeStyle = `rgba(${CUc},0.95)`;
  x.beginPath(); x.moveTo(cx, cy + s * 0.18); x.lineTo(cx, cy - s * 0.4); x.moveTo(cx - s * 0.2, cy - s * 0.2); x.lineTo(cx, cy - s * 0.4); x.lineTo(cx + s * 0.2, cy - s * 0.2); x.stroke();
  x.restore();
}
function icSheet(g, X, Y) {                        // icona generica di un foglio di calcolo (34×44)
  rrect(g, X, Y, 34, 44, 6, '#D5D9D1');
  g.fillStyle = '#9AA095'; g.fillRect(X + 8, Y + 14, 18, 3); g.fillRect(X + 8, Y + 22, 18, 3); g.fillRect(X + 8, Y + 30, 12, 3);
}

// ---------- file che si accumulano (momento 1) e che volano nel riquadro (momento 3) ----------
const FILE_H = 84;
const fileW = (s) => textW(SCR, s, 600, 30, FB) + 120;
function fileDraw(s) {
  return (g, w, h) => {
    g.save(); g.shadowColor = 'rgba(0,0,0,0.42)'; g.shadowBlur = 26; g.shadowOffsetY = 12; g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fillStyle = '#FFFFFF'; g.fill(); g.restore();
    icSheet(g, 30, 20);
    label(g, s, 84, 54, 600, 30, '#2E332B', 'left', 1, FB);
  };
}


// ---------- home dell'atleta alla settimana in corso (dal Reel 2) ----------
// ---------- momento 7: la home dell'atleta, già alla settimana giusta ----------
function texWeek(key, o) {
  const c = texCanvas(key), g = c.getContext('2d'), th = THEME.talyon;
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  drawMark(g, 92, 172, 84, {});
  caps(g, o.day, 44, 300, 30, th.t2);
  label(g, `Ciao ${o.name}`, 44, 382, 700, 78, '#FFFFFF', 'left', 1, FT);
  // la scheda importata, alla settimana in corso
  rrect(g, 44, 430, TEX_W - 88, 250, 40, th.sup, `rgba(${CUc},0.55)`, 2.5);
  caps(g, o.isNew ? 'La tua scheda è pronta' : 'La tua scheda', 84, 490, 26, th.t2);
  label(g, o.week, 84, 578, 700, 74, '#FFFFFF', 'left', 1, FT);
  label(g, o.today, 84, 640, 500, 40, th.t2, 'left', 1, FB);
  const card = (y, t1, t2) => { rrect(g, 44, y, TEX_W - 88, 150, 34, th.sup, th.bordo, 2); label(g, t1, 84, y + 66, 700, 46, '#FFFFFF', 'left', 1, FT); label(g, t2, 84, y + 116, 500, 32, th.t2, 'left', 1, FB); };
  card(704, o.ex[0][0], o.ex[0][1]);
  card(874, o.ex[1][0], o.ex[1][1]);
  rrect(g, 44, 1060, TEX_W - 88, 112, 34, th.btn);
  label(g, 'Inizia l’allenamento', TEX_W / 2, 1130, 700, 42, th.btnTx, 'center', 1, FB);
  tabBar(g, th, 0);
  return c;
}
const ATH = {
  anna: { name: 'Anna', day: 'Martedì', week: 'Settimana 2 di 4', today: 'Oggi: giorno 2', ex: [['Muscle-up', '3 × 1 @8 · +15 kg'], ['Trazioni', '4 × 2 @8,5 · +40 kg']] },
  luca: { name: 'Luca', day: 'Martedì', week: 'Settimana 3 di 5', today: 'Oggi: giorno 2', ex: [['Trazioni', 'top single @8'], ['Dip con fermo', '4 × 3 @7 · +30 kg']] },
  matteo: { name: 'Matteo', day: 'Martedì', week: 'Settimana 4 di 5', today: 'Oggi: giorno 2', ex: [['Dip', '5 × 2 @8 · +55 kg'], ['Squat', '4 × 3 @7,5 · 140 kg']] },
  marco: { name: 'Marco', day: 'Martedì', week: 'Settimana 1 di 4', today: 'Oggi: giorno 1', isNew: true, ex: [['Trazioni', '5 × 3 @7 · +20 kg'], ['Dip', '4 × 5 · RIR 2']] },
};

// ---------- momento 8: l'atleta nuovo apre l'invito ----------
function icMail(g, cx, cy, s, col, lw) {          // busta: contorno bianco, piega in rame
  g.save(); g.strokeStyle = col; g.lineWidth = lw || s * 0.06; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.roundRect(cx - s * 0.5, cy - s * 0.34, s, s * 0.68, s * 0.09); g.stroke();
  g.strokeStyle = `rgba(${CUc},0.95)`;
  g.beginPath(); g.moveTo(cx - s * 0.4, cy - s * 0.22); g.lineTo(cx, cy + s * 0.08); g.lineTo(cx + s * 0.4, cy - s * 0.22); g.stroke();
  g.restore();
}

// ---------- utilità delle scene (dal Reel 2) ----------
// ---------- utilità ----------
const pulse = (t, p) => (t > p ? Math.exp(-(t - p) * 4) : 0);
function ripple(x, cx, cy, rp, R) { x.save(); x.globalAlpha = (1 - rp) * 0.5; x.strokeStyle = '#FFFFFF'; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy, 30 + rp * R, 0, 7); x.stroke(); x.globalAlpha = (1 - rp) * 0.14; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(cx, cy, 30 + rp * R * 0.5, 0, 7); x.fill(); x.restore(); }
function chipDraw(s) { return (g, w, h) => { g.save(); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fillStyle = 'rgba(30,32,35,0.95)'; g.fill(); g.restore(); g.lineWidth = 1.5; g.strokeStyle = `rgba(${CUc},0.55)`; g.beginPath(); g.roundRect(0.75, 0.75, w - 1.5, h - 1.5, h / 2); g.stroke(); label(g, s, 24, h / 2 + 10, 600, 28, '#FFFFFF', 'left', 1, FB); }; }
// passaggio da una schermata all'altra con una banda di luce, un livello per telefono
const MIXK = {};
function texWipeK(k, a, b, p) {
  const M = MIXK[k] || (MIXK[k] = H.layer(TEX_W, TEX_H));
  const g = M.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  g.drawImage(a, 0, 0);
  const bx = H.lerp(-300, TEX_W + 300, p);
  g.save(); g.beginPath(); g.moveTo(-200, -1); g.lineTo(bx + 200, -1); g.lineTo(bx - 200, TEX_H + 1); g.lineTo(-600, TEX_H + 1); g.closePath(); g.clip(); g.drawImage(b, 0, 0); g.restore();
  const gr = g.createLinearGradient(bx - 120, 0, bx + 120, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.save(); g.translate(bx, TEX_H / 2); g.transform(1, 0, -0.3, 1, 0, 0); g.translate(-bx, -TEX_H / 2); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(bx - 120, 0, 240, TEX_H); g.restore();
  return M;
}
// schermo che si abbassa di luce (un velo scuro sopra la texture, senza giunture)
const DIMC = {};
function dimTex(k, tex, a) {
  if (a <= 0.003) return tex;
  const c = DIMC[k] || (DIMC[k] = H.layer(TEX_W, TEX_H)), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  g.drawImage(tex, 0, 0); g.fillStyle = `rgba(6,7,8,${a.toFixed(3)})`; g.fillRect(0, 0, TEX_W, TEX_H);
  return c;
}
const WEEKC = {};
CACHE_DISEGNI.push(WEEKC);
const weekTex = (k, o) => WEEKC[k] || (WEEKC[k] = texWeek(k, o));

// ---------- foglio in prospettiva ----------
function plane(x, c, img, o) {
  const crx = Math.cos(o.rx), srx = Math.sin(o.rx), cry = Math.cos(o.ry), sry = Math.sin(o.ry);
  const tw = (u, v) => { const ox = u * o.w, oy = -v * o.h, y1 = oy * crx, z1 = oy * srx; return c.P(o.x + ox * cry + z1 * sry, o.y + y1, o.z - ox * sry + z1 * cry); };
  const nx = o.nx || 6, ny = o.ny || 8, grid = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) grid.push(tw(i / nx - 0.5, j / ny - 0.5));
  const cs = [tw(-0.5, -0.5), tw(0.5, -0.5), tw(0.5, 0.5), tw(-0.5, 0.5)];
  x.save(); x.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  x.save(); x.shadowColor = 'rgba(0,0,0,0.55)'; x.shadowBlur = 60; x.shadowOffsetY = 30; poly(x, cs); x.fillStyle = '#2a2c2e'; x.fill(); x.restore();
  texMap(x, img, grid, nx, ny);
  poly(x, cs);
  const g = x.createLinearGradient(0, cs[0][1], 0, cs[2][1]); g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(10,12,14,0.32)');
  x.fillStyle = g; x.fill();
  if (o.dark) { x.fillStyle = `rgba(8,9,10,${Math.min(0.95, o.dark)})`; x.fill(); }
  x.restore();
  return cs;
}

function nameTag(x, A, yEnd, p, name, sub, alpha) {
  if (p <= 0) return;
  x.save(); x.globalAlpha *= alpha;
  const e = eo(p / 0.3);
  x.fillStyle = `rgba(${CUc},${0.95 * e})`; x.beginPath(); x.arc(A[0], A[1], 6.5, 0, 7); x.fill();
  x.strokeStyle = `rgba(${CUc},${0.5 * e})`; x.lineWidth = 2; x.beginPath(); x.arc(A[0], A[1], 10 + 9 * e, 0, 7); x.stroke();
  const L = io(sm(0.08, 0.7, p)); x.strokeStyle = `rgba(${CUc},0.92)`; x.lineWidth = 2; x.lineCap = 'round';
  x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(A[0], A[1] + (yEnd - A[1]) * L); x.stroke();
  const la = sm(0.55, 1, p), dy = (1 - la) * 10;
  label(x, name, A[0], yEnd - 58 + dy, 700, 42, '#FFFFFF', 'center', la, FT);
  label(x, sub, A[0], yEnd - 18 + dy, 500, 28, INK2, 'center', la, FB);
  x.restore();
}

// ---------- controllo delle aree coperte da Instagram ----------
// libero(fn): quello che si disegna dentro fn è decorativo e non conta per il controllo (come data-libero nei caroselli)
function libero(fn) {
  const R = window.__AREE, prima = R ? R.pausa : false;
  if (R) R.pausa = true;
  try { return fn(); } finally { if (R) R.pausa = prima; }
}
// riquadro di vetro centrato in (cx, cy): lo stesso degli sprite delle scene
function riquadro(x, key, w, h, cx, cy, draw) { drawSprite(x, key, w, h, draw || glass, cx, cy, 1, 1, 0, 0); }
// disegna i tempi indicati su un canvas a parte e restituisce i testi e i riquadri fuori dall'area sicura,
// poi i testi che si coprono e quelli che escono dal loro riquadro o dalla schermata del telefono (con il motivo)
function controllaAree(tempi, disegna, o) {
  disegna = disegna || ESPORTA.disegna; o = o || {};
  const cv = H.layer(W, HH), x = cv.getContext('2d'), fuori = [], problemi = [];
  CACHE_DISEGNI.forEach((c) => { for (const k in c) delete c[k]; });
  for (const t of tempi) {
    const R = []; R.canvas = cv; R.pausa = false; R.problemi = problemi; R.t = t; window.__AREE = R;
    try { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, HH); disegna(x, t); } finally { window.__AREE = null; }
    for (const v of R) {
      const [x0, y0, x1, y1] = v.box;
      const esce = x0 < SAFE.l - 0.5 || x1 > SAFE.r + 0.5 || y0 < SAFE.t - 0.5 || y1 > SAFE.b + 0.5;
      if (esce || o.tutti) fuori.push({ t, testo: v.testo, box: v.box.map(Math.round), fuori: esce });
    }
    const testi = R.filter((v) => v.ink);
    testi.forEach((a, i) => testi.slice(0, i).forEach((b) => {
      if (!(a.testo === b.testo && _stessoPosto(a.ink, b.ink)) && _sovrapposti(a.ink, b.ink)) problemi.push({ t, testo: a.testo, motivo: `si sovrappone a «${b.testo}»` });
    }));
  }
  const visti = new Set();
  for (const p of problemi) {
    const k = p.testo + '|' + p.motivo;
    if (!visti.has(k)) { visti.add(k); fuori.push({ t: p.t, testo: p.testo, motivo: p.motivo, box: [], fuori: true }); }
  }
  return fuori;
}
ESPORTA.controllaAree = controllaAree;
ESPORTA.libero = libero;
ESPORTA.riquadro = riquadro;
ESPORTA.testo = { label, caps, wordsBlock, W2 };
