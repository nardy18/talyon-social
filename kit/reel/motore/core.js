// ===================== Talyon Reel · core =====================
// Product Launch Reveal, adattato a Talyon: 1080×1920 (9:16), Saira, grafite e verde militare, rame solo per linee e dettagli.
// Ogni fotogramma è una funzione pura di t: tutta la casualità viene da H.rng / H.makeNoise.
const PI = Math.PI;
const sm = (a, b, x) => H.smooth(a, b, x);
const io = (x) => H.ease.inOut(H.clamp(x));
const eo = (x) => H.ease.out(H.clamp(x));
const ei = (x) => H.ease.in(H.clamp(x));
const W = 1080, HH = 1920;
// zone di Instagram: niente testi importanti nel 14% in alto, nel 35% in basso e nel 6% ai lati
const SAFE = { l: 65, r: 1015, t: 269, b: 1248 };
const INK = '#FFFFFF', INK2 = 'rgba(255,255,255,0.80)', INK3 = 'rgba(255,255,255,0.62)', INK4 = 'rgba(255,255,255,0.40)';
const CUc = '217,142,74';                       // rame di base (#D98E4A) per le rgba
const HARD = '#F3A398', EASY = '#B5D69A';        // più difficile / più facile (kit dei caroselli)
const FT = 'SairaT', FB = 'SairaB';              // titoli (larghezza 82%) e testi (100%)

// ---------- testo ----------
function setF(x, w, px, fam, track) {
  fam = fam || FT;
  x.font = `${w} ${px}px "${fam}"`;
  const tr = track != null ? track : (fam === FT && px >= 56 ? -px * 0.012 : 0);
  try { x.letterSpacing = tr.toFixed(2) + 'px'; } catch (e) { /* vecchi browser */ }
}
function textW(x, s, w, px, fam, track) { x.save(); setF(x, w, px, fam, track); const v = x.measureText(s).width; x.restore(); return v; }
function label(x, s, X, Y, w, px, fill, align, a, fam, track) {
  if (a != null && a <= 0.002) return;
  x.save(); setF(x, w, px, fam || FB, track); x.globalAlpha *= a == null ? 1 : a;
  x.fillStyle = fill; x.textAlign = align || 'left'; x.textBaseline = 'alphabetic'; x.fillText(s, X, Y); x.restore();
}
// etichetta maiuscola spaziata (come .etichetta dei caroselli)
function caps(x, s, X, Y, px, fill, align, a) { label(x, s.toUpperCase(), X, Y, 600, px, fill || INK3, align, a, FB, px * 0.18); }

// Parole che arrivano una alla volta: messa a fuoco dalla sfocatura, salita e dissolvenza.
// lines: [[{s, t, fill?, a?}, ...], ...]. o: {align, fam, dur, blur, out, outDur, alpha, lh}
function wordsBlock(x, lines, X, Y, w, px, t, o) {
  o = o || {};
  const fam = o.fam || FT, dur = o.dur || 0.55, bl = o.blur == null ? 12 : o.blur, lh = o.lh || 1.0;
  x.save(); setF(x, w, px, fam);
  const sp = x.measureText(' ').width;
  const boxes = [];
  lines.forEach((line, li) => {
    let tot = 0;
    line.forEach((it, i) => { it._w = x.measureText(it.s).width; if (!it.stay) tot += it._w + (i ? sp : 0); });
    let cx = o.align === 'center' ? X - tot / 2 : o.align === 'right' ? X - tot : X;
    const y = Y + li * px * lh;
    line.forEach((it, i) => {
      boxes.push({ s: it.s, x: cx, y, w: it._w, line: li });
      const e = eo((t - it.t) / dur);
      let a = e * (o.alpha == null ? 1 : o.alpha) * (it.a == null ? 1 : it.a);
      let b = (1 - e) * bl, dy = (1 - e) * px * 0.28;
      if (o.out != null) {
        const k = sm(o.out + i * 0.035 + li * 0.07, o.out + i * 0.035 + li * 0.07 + (o.outDur || 0.42), t);
        a *= 1 - k; b += k * bl * 0.8; dy -= k * px * 0.25;
      }
      if (a > 0.003) {
        x.save(); x.globalAlpha *= a; x.filter = b > 0.4 ? `blur(${b.toFixed(1)}px)` : 'none';
        x.fillStyle = it.fill || o.fill || INK; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
        x.fillText(it.s, cx, y + dy); x.restore();
      }
      if (!it.stay) cx += it._w + sp;
    });
  });
  x.restore();
  return boxes;
}
// testo semplice → righe di parole con tempi a scalare
function W2(lines, t0, step) {
  let i = 0;
  return lines.map((ln) => ln.split(' ').map((s) => ({ s, t: t0 + (i++) * (step || 0.11) })));
}

// ---------- richiami a filo rame (punto, filo che si disegna, etichetta) ----------
function callout(x, pts, p, lab, sub, side, o) {
  o = o || {};
  if (p <= 0) return;
  x.save();
  const A = pts[0], e = eo(p / 0.3), al = o.alpha == null ? 1 : o.alpha;
  x.globalAlpha *= al;
  x.fillStyle = `rgba(${CUc},${0.95 * e})`; x.beginPath(); x.arc(A[0], A[1], 6.5, 0, 7); x.fill();
  x.strokeStyle = `rgba(${CUc},${0.5 * e})`; x.lineWidth = 2; x.beginPath(); x.arc(A[0], A[1], 10 + 9 * e, 0, 7); x.stroke();
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let rem = len * io(sm(0.08, 0.7, p));
  x.strokeStyle = `rgba(${CUc},0.92)`; x.lineWidth = 2; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(A[0], A[1]);
  for (let i = 1; i < pts.length && rem > 0; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, f = Math.min(1, rem / d);
    x.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); rem -= d;
  }
  x.stroke();
  const la = sm(0.55, 1, p), E = pts[pts.length - 1];
  if (la > 0) {
    const px = o.px || 46, spx = o.subPx || 32, gap = o.gap == null ? 18 : o.gap;
    const dx = (1 - la) * 14 * (side === 'r' ? 1 : -1);
    const tx = side === 'r' ? E[0] + gap + dx : E[0] - gap + dx, align = side === 'r' ? 'left' : 'right';
    const ls = lab.split('\n'), lhp = px * 1.02;
    let y = o.top ? E[1] + px * 0.78 : E[1] + px * 0.36 - (ls.length - 1) * lhp / 2;
    if (o.above) y = E[1] - 16 - (ls.length - 1) * lhp - (sub ? spx * 1.25 : 0);
    ls.forEach((s, i) => label(x, s, tx, y + i * lhp, 700, px, o.fill || INK, align, la, FT));
    if (sub) label(x, sub, tx, y + (ls.length - 1) * lhp + spx * 1.3, 400, spx, o.subFill || INK3, align, la, FB);
  }
  x.restore();
}
// freccia lungo una polilinea campionata, disegnata fino a p
function arrow(x, pts, p, stroke, lw, head) {
  if (p <= 0) return;
  const n = Math.max(2, Math.round(pts.length * H.clamp(p)));
  x.save(); x.strokeStyle = stroke || `rgba(${CUc},0.9)`; x.lineWidth = lw || 2; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
  for (let i = 0; i < n; i++) (i ? x.lineTo : x.moveTo).call(x, pts[i][0], pts[i][1]);
  x.stroke();
  if (head !== false && n >= 2) {
    const a = pts[n - 2], b = pts[n - 1], an = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = 14;
    x.beginPath(); x.moveTo(b[0] - hl * Math.cos(an - 0.45), b[1] - hl * Math.sin(an - 0.45)); x.lineTo(b[0], b[1]); x.lineTo(b[0] - hl * Math.cos(an + 0.45), b[1] - hl * Math.sin(an + 0.45)); x.stroke();
  }
  x.restore();
}
const bez = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });
const bezAt = (p0, p1, p2, p3, u) => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
const poly = (x, pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); };

// ---------- icone vettoriali (il font non ha ✓ → ⏱) ----------
function icCheck(x, cx, cy, r, col, lw) {
  x.save(); x.strokeStyle = col; x.lineWidth = lw || r * 0.24; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(cx - r * 0.46, cy + r * 0.02); x.lineTo(cx - r * 0.13, cy + r * 0.34); x.lineTo(cx + r * 0.5, cy - r * 0.36); x.stroke(); x.restore();
}
function icUpDown(x, cx, cy, s, up, col, lw) {          // freccia su (più difficile) o giù (più facile), come .su/.giu
  x.save(); x.strokeStyle = col; x.lineWidth = lw || s * 0.13; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
  const k = s / 22, d = up ? 1 : -1;
  x.moveTo(cx, cy + 7 * k * d); x.lineTo(cx, cy - 7 * k * d);
  x.moveTo(cx - 6 * k, cy - 1 * k * d); x.lineTo(cx, cy - 7 * k * d); x.lineTo(cx + 6 * k, cy - 1 * k * d); x.stroke(); x.restore();
}
function icArrowR(x, x0, y, len, col, lw) {
  x.save(); x.strokeStyle = col; x.lineWidth = lw || 3; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
  x.moveTo(x0, y); x.lineTo(x0 + len, y); x.moveTo(x0 + len - len * 0.28, y - len * 0.26); x.lineTo(x0 + len, y); x.lineTo(x0 + len - len * 0.28, y + len * 0.26); x.stroke(); x.restore();
}
function icCloudOff(x, cx, cy, s, col, lw) {               // nuvola barrata = senza rete
  x.save(); x.strokeStyle = col; x.lineWidth = lw || s * 0.09; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath();
  x.moveTo(cx - s * 0.36, cy + s * 0.22);
  x.arc(cx - s * 0.26, cy + s * 0.04, s * 0.18, PI * 0.5, PI * 1.35);
  x.arc(cx + s * 0.0, cy - s * 0.08, s * 0.26, PI * 1.15, PI * 1.95);
  x.arc(cx + s * 0.27, cy + s * 0.06, s * 0.16, PI * 1.6, PI * 0.5);
  x.closePath(); x.stroke();
  x.beginPath(); x.moveTo(cx - s * 0.42, cy - s * 0.4); x.lineTo(cx + s * 0.42, cy + s * 0.4); x.stroke(); x.restore();
}
function icTimer(x, cx, cy, r, col, lw) {                  // cronometro
  x.save(); x.strokeStyle = col; x.lineWidth = lw || r * 0.16; x.lineCap = 'round';
  x.beginPath(); x.arc(cx, cy + r * 0.08, r * 0.82, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(cx, cy - r * 0.74); x.lineTo(cx, cy - r * 1.02); x.moveTo(cx - r * 0.22, cy - r * 1.02); x.lineTo(cx + r * 0.22, cy - r * 1.02); x.stroke();
  x.beginPath(); x.moveTo(cx, cy + r * 0.08); x.lineTo(cx + r * 0.32, cy - r * 0.26); x.stroke(); x.restore();
}
function icRamp(x, X, Y, w, h, col, n) {                   // gradini del ramping fino alla top
  x.save(); x.fillStyle = col; n = n || 5;
  const bw = w / n * 0.62;
  for (let i = 0; i < n; i++) { const hh = h * (0.28 + 0.72 * (i / (n - 1))); x.globalAlpha = 0.45 + 0.55 * (i / (n - 1)); x.beginPath(); x.roundRect(X + i * (w / n), Y + h - hh, bw, hh, 3); x.fill(); }
  x.restore();
}

// ---------- logo Talyon (da kit/cornice.js del repo talyon-social) ----------
const LOGO = {
  bar: 'M26.98 22.6L20 22.6A3 3 0 0 0 20 28.6L28.62 28.6ZM40.19 22.6L79.81 22.6L78.68 28.6L41.32 28.6ZM93.02 22.6L100 22.6A3 3 0 0 1 100 28.6L91.38 28.6Z',
  rim: 'M50.5 94.01a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0ZM57.7 94.01a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z',
  face: 'M52.4 94.01a7.6 7.6 0 1 0 15.2 0a7.6 7.6 0 1 0 -15.2 0ZM56.6 94.01a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z',
  body: 'M60 55.55L42.55 43.13L38.13 19.8A5 5 0 0 0 28.39 22.05L35.03 46.36A4 4 0 0 0 36.63 48.73L51.76 59.16L54.66 84.4A11 11 0 0 1 65.34 84.4L68.24 59.16L83.37 48.73A4 4 0 0 0 84.97 46.36L91.61 22.05A5 5 0 0 0 81.87 19.8L77.45 43.13Z',
  wBar: 'M95.16 -5.2L93.09 -5.2A2.6 2.6 0 0 0 93.09 0L96.52 0ZM106.15 -5.2L126.83 -5.2L125.79 0L107.19 0ZM137.82 -5.2L139.89 -5.2A2.6 2.6 0 0 1 139.89 0L136.46 0Z',
  wRim: 'M110.09 46.6a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0ZM114.89 46.6a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z',
  wFace: 'M111.39 46.6a5.1 5.1 0 1 0 10.2 0a5.1 5.1 0 1 0 -10.2 0ZM114.09 46.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z',
  wLet: 'M0 0L36 0L36 6.4L21.6 6.4L21.6 40L14.4 40L14.4 6.4L0 6.4ZM31.85 40L48.15 0L55.55 0L71.85 40L64.29 40L60.87 31.6L42.83 31.6L39.41 40ZM51.85 9.47L58.34 25.4L45.36 25.4ZM76.1 0L83.3 0L83.3 33.6L103.1 33.6L103.1 40L76.1 40ZM187.19 0L195.52 0L213.99 28.78L213.99 0L221.19 0L221.19 40L212.86 40L194.39 11.22L194.39 40L187.19 40ZM138.54 20a20.6 20.6 0 1 0 41.2 0a20.6 20.6 0 1 0 -41.2 0ZM145.94 20a13.2 13.2 0 1 0 26.4 0a13.2 13.2 0 1 0 -26.4 0Z',
  wY: 'M116.49 17.6L108.16 11L104.44 -7.65A4.2 4.2 0 0 0 96.25 -5.76L101.38 13.81A3.6 3.6 0 0 0 102.68 15.84L111.99 23.01L112.79 39.97A7.6 7.6 0 0 1 120.19 39.97L120.99 23.01L130.3 15.84A3.6 3.6 0 0 0 131.6 13.81L136.73 -5.76A4.2 4.2 0 0 0 128.54 -7.65L124.82 11Z',
};
let LP = null;
const lp = () => { if (!LP) { LP = {}; for (const k in LOGO) LP[k] = new Path2D(LOGO[k]); } return LP; };
const ST_BAR = [[0, '#B26A2C'], [0.1, '#F2B879'], [0.24, '#FFE7CC'], [0.4, '#F2B879'], [0.58, '#D98E4A'], [0.76, '#B26A2C'], [0.9, '#6B3A17'], [1, '#9A5A28']];
const ST_RIM = [[0, '#FFE7CC'], [0.28, '#F2B879'], [0.55, '#D98E4A'], [0.8, '#8C5424'], [1, '#5E3414']];
const ST_FACE = [[0, '#7A4520'], [0.38, '#B26A2C'], [0.52, '#E3A265'], [0.57, '#FFE2C0'], [0.63, '#E3A265'], [0.85, '#F2B879'], [1, '#FFE7CC']];
function lgrad(x, x1, y1, x2, y2, stops) { const g = x.createLinearGradient(x1, y1, x2, y2); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
// simbolo (atleta a Y): o.parts = progressione 0..1 della composizione (sbarra, corpo, disco)
function drawMark(x, cx, cy, size, o) {
  o = o || {}; const P = lp(), s = size / 120, pr = o.parts == null ? 1 : o.parts;
  x.save(); x.translate(cx - 60 * s, cy - 60 * s); x.scale(s, s); x.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  const pb = eo(pr / 0.45), pc = eo((pr - 0.25) / 0.45), pd = eo((pr - 0.5) / 0.5);
  if (pc > 0) { x.save(); x.globalAlpha *= pc; x.translate(0, (1 - pc) * 10); x.fillStyle = o.body || '#FFFFFF'; x.fill(P.body); x.restore(); }
  if (pb > 0) { x.save(); x.globalAlpha *= pb; x.translate(60, 25.6); x.scale(0.4 + 0.6 * pb, 1); x.translate(-60, -25.6); x.fillStyle = lgrad(x, 0, 22.6, 0, 28.6, ST_BAR); x.fill(P.bar); x.restore(); }
  if (pd > 0) { x.save(); x.globalAlpha *= pd; x.translate(60, 94); x.scale(0.6 + 0.4 * pd, 0.6 + 0.4 * pd); x.translate(-60, -94);
    x.fillStyle = lgrad(x, 51.5, 85.5, 68.5, 102.5, ST_RIM); x.fill(P.rim, 'evenodd'); x.fillStyle = lgrad(x, 53, 87, 67, 101, ST_FACE); x.fill(P.face, 'evenodd'); x.restore(); }
  x.restore();
}
// scritta TALYON (la Y è l'atleta): centrata in (cx, cy), larga width
function drawWord(x, cx, cy, width, o) {
  o = o || {}; const P = lp(), s = width / 225.2;
  x.save(); x.translate(cx - 110.6 * s, cy - 21.5 * s); x.scale(s, s); x.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  x.fillStyle = o.fill || '#FFFFFF'; x.fill(P.wLet, 'evenodd'); x.fill(P.wY);
  x.fillStyle = lgrad(x, 0, -5.2, 0, 0, ST_BAR); x.fill(P.wBar);
  x.fillStyle = lgrad(x, 110.8, 40.9, 122.2, 52.3, ST_RIM); x.fill(P.wRim, 'evenodd');
  x.fillStyle = lgrad(x, 112, 42.1, 121, 51.1, ST_FACE); x.fill(P.wFace, 'evenodd');
  x.restore();
}
// riflesso che scorre su una forma (come il gleam del 97% nel riferimento)
let GL = null; const gleamLayer = () => GL || (GL = H.layer(W, HH));
function gleam(x, shapeFn, p, x0, x1, wdt, a) {
  if (p <= 0 || p >= 1) return;
  const L = gleamLayer(), g = L.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, HH);
  g.fillStyle = '#fff'; shapeFn(g);
  g.globalCompositeOperation = 'source-in';
  const bx = H.lerp(x0 - wdt, x1 + wdt, p), gg = g.createLinearGradient(bx - wdt, 0, bx + wdt, 0);
  gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, `rgba(255,255,255,${a == null ? 0.85 : a})`); gg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gg; g.fillRect(0, 0, W, HH);
  x.drawImage(L, 0, 0, W, HH);
}

// ---------- camera (dal riferimento, D = 7, F = s·1900) ----------
function cam(c) {
  const cyw = Math.cos(c.yaw), syw = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), D = 7, F = c.s * 1900;
  const P = (x, y, z) => { const X = x * cyw - z * syw, Z = x * syw + z * cyw, up = y * cp - Z * sp, dep = Z * cp + y * sp, k = F / (D - dep); return [c.cx + X * k, c.cy - up * k, dep, k]; };
  return Object.assign({}, c, { P, cyw, syw, cp, sp, unit: F / D });
}
function keyed(keys, t) {
  if (t <= keys[0].t) return Object.assign({}, keys[0]);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) { const e = io((t - a.t) / (b.t - a.t)), o = {}; for (const k in a) o[k] = H.lerp(a[k], b[k], e); return o; }
  }
  return Object.assign({}, keys[keys.length - 1]);
}

// ---------- palco: grafite (o verde) con luce dall'alto, pozza di luce a terra, bokeh ----------
function stage(x, c, L, t) {
  const g = L.green || 0, k = L.key == null ? 1 : L.key, lit = 0.16 + 0.84 * k;
  const C0 = H.mix('#26282A', '#2B3421', g), C1 = H.mix('#1E2022', '#242B1D', g), C2 = H.mix('#111213', '#161A11', g);
  const dk = (col, f) => `rgb(${(col[0] * f) | 0},${(col[1] * f) | 0},${(col[2] * f) | 0})`;
  x.save(); x.fillStyle = dk(C2, lit); x.fillRect(0, 0, W, HH);
  x.translate(540, HH * 0.42); x.scale(1, 1.55);
  let gr = x.createRadialGradient(0, 0, 0, 0, 0, 1000);
  gr.addColorStop(0, dk(C0, lit)); gr.addColorStop(0.52, dk(C1, lit)); gr.addColorStop(1, dk(C2, lit));
  x.fillStyle = gr; x.fillRect(-600, -700, 1200, 1400); x.restore();
  // luce dall'alto (come lo sfondo dei caroselli)
  const tl = H.mix([84, 88, 92], [65, 80, 47], g), ta = (0.6 + 0.1 * g) * k;
  x.save(); x.translate(540, -0.06 * HH); x.scale(1, 0.95);
  gr = x.createRadialGradient(0, 0, 0, 0, 0, 980);
  gr.addColorStop(0, `rgba(${tl[0] | 0},${tl[1] | 0},${tl[2] | 0},${ta})`); gr.addColorStop(0.72, `rgba(${tl[0] | 0},${tl[1] | 0},${tl[2] | 0},0)`);
  x.fillStyle = gr; x.fillRect(-540, 0, 1080, 2100); x.restore();
  if (L.noObj) return;
  // luce chiave che cade sull'oggetto
  const kc = H.mix([92, 97, 104], [104, 122, 78], g);
  gr = x.createRadialGradient(c.cx, c.cy - c.unit * 1.5, 10, c.cx, c.cy - c.unit * 1.1, 900);
  gr.addColorStop(0, `rgba(${kc[0] | 0},${kc[1] | 0},${kc[2] | 0},${0.34 * k})`); gr.addColorStop(0.5, `rgba(${kc[0] | 0},${kc[1] | 0},${kc[2] | 0},${0.12 * k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, W, HH);
  // pozza di luce a terra
  x.save(); x.translate(c.cx, c.cy); x.scale(1, 0.22);
  gr = x.createRadialGradient(0, 0, 0, 0, 0, c.unit * 2.6);
  gr.addColorStop(0, `rgba(${kc[0] + 18 | 0},${kc[1] + 16 | 0},${kc[2] + 12 | 0},${0.36 * k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.beginPath(); x.arc(0, 0, c.unit * 2.6, 0, 7); x.fill(); x.restore();
  // bokeh fuori fuoco (toni rame, salvia, bianco caldo)
  const r = H.rng(404);
  for (let i = 0; i < 7; i++) {
    const bx = r() * W + Math.sin(t * 0.2 + i) * 14 - (c.cx - 540) * 0.12, by = r.range(0.06, 0.62) * HH, rad = r.range(60, 150);
    const hue = r.pick(['217,142,74', '181,214,154', '255,236,214']), a = r.range(0.022, 0.045) * k;
    gr = x.createRadialGradient(bx, by, 0, bx, by, rad);
    gr.addColorStop(0, `rgba(${hue},${a})`); gr.addColorStop(0.6, `rgba(${hue},${a * 0.6})`); gr.addColorStop(1, `rgba(${hue},0)`);
    x.fillStyle = gr; x.beginPath(); x.arc(bx, by, rad, 0, 7); x.fill();
  }
}

// ---------- finitura lucida, senza grana (richiesta di Emanuele: come il primo Reel) ----------
// vignettatura morbida, un velo di luce dall'alto e due riflessi diagonali larghi e tenui che scorrono piano,
// come un vetro lucido davanti alla scena (lo stesso principio del filtro lucido della landing, senza la grana)
function finish(x, t, green, clip) {
  if (clip) { H.vignette(x, W, HH, 0.3); return; }   // sopra il video del simbolo: solo una vignettatura leggera
  H.vignette(x, W, HH, green ? 0.42 : 0.5);
  x.save();
  let g = x.createLinearGradient(0, 0, 0, HH * 0.45);
  g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, HH * 0.45);
  const band = (cx, wdt, a) => {
    x.save(); x.translate(cx, HH * 0.5); x.rotate(-0.42);
    const gg = x.createLinearGradient(-wdt, 0, wdt, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, `rgba(255,255,255,${a})`); gg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gg; x.fillRect(-wdt, -HH * 1.2, wdt * 2, HH * 2.4); x.restore();
  };
  band(250 + Math.sin(t * 0.22) * 40, 240, green ? 0.03 : 0.035);
  band(760 + Math.sin(t * 0.18 + 1.3) * 40, 110, green ? 0.022 : 0.026);
  x.restore();
}

// ---------- mappatura di una texture su un quadrilatero in prospettiva (griglia di triangoli affini) ----------
function tri(x, img, s0, s1, s2, d0, d1, d2) {
  const cx = (d0[0] + d1[0] + d2[0]) / 3, cy = (d0[1] + d1[1] + d2[1]) / 3;
  const ex = (p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * 0.9, p[1] + dy / l * 0.9]; };
  const sx1 = s1[0] - s0[0], sy1 = s1[1] - s0[1], sx2 = s2[0] - s0[0], sy2 = s2[1] - s0[1];
  const dx1 = d1[0] - d0[0], dy1 = d1[1] - d0[1], dx2 = d2[0] - d0[0], dy2 = d2[1] - d0[1];
  const det = sx1 * sy2 - sx2 * sy1; if (Math.abs(det) < 1e-9) return;
  const a = (dx1 * sy2 - dx2 * sy1) / det, c = (sx1 * dx2 - sx2 * dx1) / det;
  const b = (dy1 * sy2 - dy2 * sy1) / det, d = (sx1 * dy2 - sx2 * dy1) / det;
  const e = d0[0] - a * s0[0] - c * s0[1], f = d0[1] - b * s0[0] - d * s0[1];
  const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
  x.save(); x.beginPath(); x.moveTo(e0[0], e0[1]); x.lineTo(e1[0], e1[1]); x.lineTo(e2[0], e2[1]); x.closePath(); x.clip();
  x.transform(a, b, c, d, e, f);
  const mnx = Math.max(0, Math.floor(Math.min(s0[0], s1[0], s2[0]) - 2)), mny = Math.max(0, Math.floor(Math.min(s0[1], s1[1], s2[1]) - 2));
  const mxx = Math.min(img.width, Math.ceil(Math.max(s0[0], s1[0], s2[0]) + 2)), mxy = Math.min(img.height, Math.ceil(Math.max(s0[1], s1[1], s2[1]) + 2));
  if (mxx > mnx && mxy > mny) x.drawImage(img, mnx, mny, mxx - mnx, mxy - mny, mnx, mny, mxx - mnx, mxy - mny);
  x.restore();
}
function texMap(x, img, grid, nx, ny) {
  const iw = img.width, ih = img.height;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const p00 = grid[j * (nx + 1) + i], p10 = grid[j * (nx + 1) + i + 1], p01 = grid[(j + 1) * (nx + 1) + i], p11 = grid[(j + 1) * (nx + 1) + i + 1];
    const u0 = i / nx * iw, u1 = (i + 1) / nx * iw, v0 = j / ny * ih, v1 = (j + 1) / ny * ih;
    tri(x, img, [u0, v0], [u1, v0], [u1, v1], p00, p10, p11);
    tri(x, img, [u0, v0], [u1, v1], [u0, v1], p00, p11, p01);
  }
}

// ---------- il telefono: lastra arrotondata in piedi, vetro, bordo metallico, anello in rame ----------
function rr2(a, b, r, seg) {
  const pts = [], cs = [[a - r, b - r, 0], [-(a - r), b - r, PI / 2], [-(a - r), -(b - r), PI], [a - r, -(b - r), 1.5 * PI]];
  cs.forEach(([cx, cy, a0]) => { for (let i = 0; i <= seg; i++) { const an = a0 + (i / seg) * PI / 2; pts.push([cx + r * Math.cos(an), cy + r * Math.sin(an), an]); } });
  return pts;
}
const PH = { a: 0.5, b: 1.06, r: 0.15, t: 0.078, bez: 0.028, sr: 0.125 };
PH.out = rr2(PH.a, PH.b, PH.r, 10);
PH.scr = rr2(PH.a - PH.bez, PH.b - PH.bez, PH.sr, 8);
PH.isl = rr2(0.105, 0.03, 0.03, 4);
const TEX_W = 640, TEX_H = Math.round(640 * (PH.b - PH.bez) / (PH.a - PH.bez));

// S: { x, y (altezza della base), z, ry, tex, scrA, ring, ringRot, spec }
function phoneGeo(c, S, mirror) {
  const cy0 = S.y + PH.b, cr = Math.cos(S.ry || 0), sr = Math.sin(S.ry || 0);
  const tw = (ox, oy, oz) => [S.x + ox * cr + oz * sr, cy0 + oy, S.z - ox * sr + oz * cr];
  const P = mirror ? (X, Y, Z) => c.P(X, -Y, Z) : c.P;
  const pr = (ox, oy, oz) => P(...tw(ox, oy, oz));
  const camN = (nx, ny, nz) => { const wx = nx * cr + nz * sr, wz = -nx * sr + nz * cr; let wy = ny; if (mirror) wy = -wy; const X = wx * c.cyw - wz * c.syw, Z0 = wx * c.syw + wz * c.cyw; return [X, wy * c.cp - Z0 * c.sp, Z0 * c.cp + wy * c.sp]; };
  const sa = PH.a - PH.bez, sb = PH.b - PH.bez, zf = PH.t / 2;
  // punto dello schermo da coordinate texture (u, v in 0..1, v dall'alto)
  const uv = (u, v) => pr(-sa + 2 * sa * u, sb - 2 * sb * v, zf + 0.0006);
  return { pr, camN, uv, sa, sb, zf };
}
function phone(x, c, S, L, mirror) {
  const G = phoneGeo(c, S, mirror), { pr, camN, sa, sb, zf } = G;
  const O = PH.out, n = O.length, zb = -PH.t / 2;
  const front = O.map((p) => pr(p[0], p[1], zf)), back = O.map((p) => pr(p[0], p[1], zb));
  const key = L.key == null ? 1 : L.key, rimL = L.rim == null ? 1 : L.rim;
  // pareti laterali: metallo grafite lucidato
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let nx = Math.cos(O[i][2]) + Math.cos(O[j][2]), ny = Math.sin(O[i][2]) + Math.sin(O[j][2]); const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const [NX, NU, ND] = camN(nx, ny, 0);
    if (ND <= 0) continue;
    const lam = Math.max(0, -0.45 * NX + 0.42 * NU + 0.79 * ND), sd = Math.max(0, -0.22 * NX + 0.3 * NU + 0.93 * ND);
    const spec = Math.pow(sd, 18), sheen = Math.pow(sd, 4), rim = Math.pow(Math.max(0, 0.86 * NX + 0.3 * NU), 3);
    let v = 15 + lam * 58 * key + Math.min(1, spec * 0.85 + sheen * 0.3) * 132 * key + rim * 128 * rimL;
    if (mirror) v *= 0.85;
    const cc = (m) => `rgb(${Math.min(255, v * m) | 0},${Math.min(255, v * m) | 0},${Math.min(255, (v * 1.03 + 2) * m) | 0})`;
    const f0 = front[i], f1 = front[j], b0 = back[i], b1 = back[j];
    const fm = [(f0[0] + f1[0]) / 2, (f0[1] + f1[1]) / 2], bm = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2];
    if (Math.hypot(bm[0] - fm[0], bm[1] - fm[1]) < 0.3) continue;
    const gr = x.createLinearGradient(fm[0], fm[1], bm[0], bm[1]);
    gr.addColorStop(0, cc(1.45)); gr.addColorStop(0.18, cc(1.05)); gr.addColorStop(0.5, cc(0.62)); gr.addColorStop(0.82, cc(0.9)); gr.addColorStop(1, cc(0.5));
    x.fillStyle = gr; x.strokeStyle = gr; x.lineWidth = 0.8;
    x.beginPath(); x.moveTo(f0[0], f0[1]); x.lineTo(f1[0], f1[1]); x.lineTo(b1[0], b1[1]); x.lineTo(b0[0], b0[1]); x.closePath(); x.fill(); x.stroke();
  }
  const fN = camN(0, 0, 1);
  if (fN[2] <= 0) return G;
  // vetro frontale
  let minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9;
  front.forEach((p) => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); });
  poly(x, front);
  let g = x.createLinearGradient(0, minY, 0, maxY); g.addColorStop(0, '#17191c'); g.addColorStop(1, '#060708');
  x.fillStyle = g; x.fill();
  // schermo
  const scr = PH.scr.map((p) => pr(p[0], p[1], zf + 0.0005));
  x.save(); poly(x, scr); x.clip();
  const sA = (S.scrA == null ? 1 : S.scrA) * (mirror ? 0.75 : 1);
  if (S.tex && sA > 0.003) {
    const nx = mirror ? 3 : 6, ny = mirror ? 6 : 12, grid = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) grid.push(G.uv(i / nx, j / ny));
    x.save(); x.globalAlpha *= sA; texMap(x, S.tex, grid, nx, ny); x.restore();
  }
  if (!mirror) {
    // riflesso del softbox sul vetro
    g = x.createLinearGradient(0, minY, 0, maxY);
    g.addColorStop(0, `rgba(255,255,255,${0.10 * key})`); g.addColorStop(0.3, `rgba(255,255,255,${0.025 * key})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(minX - 10, minY, maxX - minX + 20, maxY - minY);
    { const A = pr(-0.9, 1.3, zf), B = pr(0.9, -0.2, zf), sg = x.createLinearGradient(A[0], A[1], B[0], B[1]);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.36, 'rgba(255,255,255,0)'); sg.addColorStop(0.44, `rgba(255,255,255,${0.07 * key})`); sg.addColorStop(0.47, `rgba(255,255,255,${0.025 * key})`); sg.addColorStop(0.6, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = sg; x.fillRect(minX - 10, minY, maxX - minX + 20, maxY - minY); }
    // riflesso che scorre sul vetro
    if (S.spec != null && S.spec > -0.3 && S.spec < 1.3) {
      const A = pr(-1.0, 1.5, zf), B = pr(1.0, -1.5, zf), u = S.spec;
      g = x.createLinearGradient(A[0], A[1], B[0], B[1]);
      const st = (o, a) => { const q = u + o; if (q > 0 && q < 1) g.addColorStop(q, `rgba(255,255,255,${a})`); };
      g.addColorStop(0, 'rgba(255,255,255,0)'); st(-0.14, 0); st(-0.045, 0.06); st(0, 0.3 * key); st(0.02, 0.12); st(0.09, 0); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(minX - 10, minY, maxX - minX + 20, maxY - minY);
    }
  }
  x.restore();
  // isola in alto
  { const ctr = [0, sb - 0.075], isl = PH.isl.map((p) => pr(ctr[0] + p[0], ctr[1] + p[1], zf + 0.001)); poly(x, isl); x.fillStyle = '#030304'; x.fill(); }
  if (mirror) return G;
  // spigolo frontale: luce di contorno dietro, luce chiave davanti
  x.lineWidth = Math.max(1, 1.6 * c.unit / 420); x.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, an = (O[i][2] + O[j][2]) / 2;
    const [NX, NU] = camN(Math.cos(an), Math.sin(an), 0);
    const a = Math.min(1, Math.pow(Math.max(0, 0.86 * NX + 0.3 * NU), 1.4) * 0.9 * rimL + Math.max(0, -0.5 * NX + 0.5 * NU) * 0.4 * key + 0.06);
    x.strokeStyle = `rgba(236,238,242,${a})`; x.beginPath(); x.moveTo(front[i][0], front[i][1]); x.lineTo(front[j][0], front[j][1]); x.stroke();
  }
  // anello in rame che si accende
  if (S.ring > 0.01) {
    const ctr = pr(0, 0, zf);
    x.save();
    const cg = x.createConicGradient(S.ringRot || 0, ctr[0], ctr[1]);
    ['#F2B879', '#D98E4A', '#8C5424', '#B26A2C', '#FFE7CC', '#D98E4A', '#F2B879'].forEach((s, i, arr) => cg.addColorStop(i / (arr.length - 1), s));
    x.strokeStyle = cg; x.globalAlpha = Math.min(1, S.ring); x.lineWidth = Math.max(2, 3.2 * c.unit / 420);
    x.shadowColor = `rgba(${CUc},0.9)`; x.shadowBlur = 22 * Math.min(1.6, S.ring);
    poly(x, front); x.stroke();
    x.shadowBlur = 0; x.lineWidth = 1; x.strokeStyle = `rgba(255,240,225,${0.45 * Math.min(1, S.ring)})`; poly(x, front); x.stroke();
    x.restore();
  }
  return G;
}
// ombra di contatto, luce colorata a terra e riflesso sul pavimento
let RL = null;
function phoneFull(x, c, S, L) {
  const u = c.unit, fp = c.P(S.x, 0, S.z);
  x.save(); x.translate(fp[0], fp[1]); x.scale(1, Math.max(0.16, Math.sin(c.pitch) * 0.9));
  let g = x.createRadialGradient(0, 0, 0, 0, 0, u * 0.9);
  g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(0.6, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.beginPath(); x.arc(0, 0, u * 0.9, 0, 7); x.fill();
  if (S.ring > 0.01) {
    g = x.createRadialGradient(0, 0, 0, 0, 0, u * 1.5);
    g.addColorStop(0, `rgba(${CUc},${0.16 * Math.min(1.5, S.ring)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.beginPath(); x.arc(0, 0, u * 1.5, 0, 7); x.fill();
  }
  x.restore();
  if (!RL) RL = H.layer(W, HH);
  const r = RL.getContext('2d'); r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, W, HH);
  phone(r, c, S, L, true);
  r.globalCompositeOperation = 'destination-in';
  g = r.createLinearGradient(0, fp[1], 0, fp[1] + u * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  r.fillStyle = g; r.fillRect(0, 0, W, HH);
  x.save(); x.globalAlpha = 0.42 * Math.max(0.2, L.key == null ? 1 : L.key) * (S.alpha == null ? 1 : S.alpha); x.drawImage(RL, 0, 0, W, HH); x.restore();
  if (S.alpha != null && S.alpha < 1) { // telefono che sfuma: lo disegno su un livello
    const P2 = phoneLayer(); const p = P2.getContext('2d'); p.setTransform(1, 0, 0, 1, 0, 0); p.clearRect(0, 0, W, HH);
    const G = phone(p, c, S, L, false); x.save(); x.globalAlpha = S.alpha; x.drawImage(P2, 0, 0, W, HH); x.restore(); return G;
  }
  return phone(x, c, S, L, false);
}
let PL = null; const phoneLayer = () => PL || (PL = H.layer(W, HH));
