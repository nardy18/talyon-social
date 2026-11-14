// ===================== Talyon Reel · schermate e blocchi dei temi =====================
// R03 builder (griglia, duplica settimana, assegna da un modello) · R04 seduta dell'atleta (serie compilate,
// recupero, senza rete) · R05 atleti da seguire · R06 celle «più difficile» e «più facile» con il prescritto.
// Schermate stilizzate come nei caroselli: niente screenshot veri, solo dati demo.
// Stessa forma dei blocchi generici (blocchi.js): { schermo?(tl, d, s, P), disegna(x, F, tl, d, s), eventi(d, s, colpo) }.
// I testi importanti si disegnano dal vivo, fuori dagli sprite, così il controllo delle aree li vede.

// ---------- utilità ----------
// istante del tocco: una frazione del momento, oppure il colpo della musica quando il blocco è il culmine
function istanteTocco(s, P, frazione) { return s.tipo === 'culmine' && P ? P.colpo - s.t0 : (s.t1 - s.t0) * frazione; }
// cella scritta nel copione: «@9,5 ↑» = più difficile, «RIR 3 ↓» = più facile, il resto come prescritto
function leggiCella(v) {
  const s = String(v).trim();
  if (/↑$/.test(s)) return { s: s.replace(/\s*↑$/, ''), k: 'h' };
  if (/↓$/.test(s)) return { s: s.replace(/\s*↓$/, ''), k: 'e' };
  return { s, k: 'n' };
}
const STILE_CELLA = {
  n: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.16)', '#FFFFFF'],
  h: ['rgba(224,86,74,0.20)', 'rgba(224,86,74,0.70)', '#FFD9D4'],
  e: ['rgba(140,190,110,0.16)', 'rgba(150,200,120,0.60)', '#E2F0D6'],
};
// dissolvenza dei pezzi dal vivo alla fine della sezione (il culmine resta)
const restaFino = (tl, s) => (s.tipo === 'culmine' ? 1 : 1 - sm(s.t1 - s.t0 - 0.6, s.t1 - s.t0 - 0.2, tl));
const iniziali = (nome) => String(nome).split(' ').map((p) => p[0] || '').join('').slice(0, 2).toUpperCase();
// alone rame intorno a un rettangolo (riga che arriva, cella attiva)
function aloneRame(x, X, Y, w, h, r, a) {
  if (a <= 0.02) return;
  x.save(); x.globalAlpha *= a; x.strokeStyle = `rgba(${CUc},0.95)`; x.lineWidth = 2.5; x.shadowColor = `rgba(${CUc},0.8)`; x.shadowBlur = 14;
  x.beginPath(); x.roundRect(X, Y, w, h, r); x.stroke(); x.restore();
}

// cella della vista del coach: dal neutro al colore (c da 0 a 1), con freccia e parola nel richiamo
function disegnaCella(x, X, Y, w, h, s, k, c, px, alone) {
  const N = STILE_CELLA.n, Q = STILE_CELLA[k];
  rrect(x, X, Y, w, h, 16, N[0], N[1], 1.5);
  const col = k === 'n' ? 0 : c;
  if (col > 0) {
    x.save(); x.globalAlpha *= col; rrect(x, X, Y, w, h, 16, Q[0], Q[1], 1.5); x.restore();
    if (alone > 0.02) { x.save(); x.globalAlpha *= col * alone; x.strokeStyle = k === 'h' ? HARD : EASY; x.lineWidth = 3; x.shadowColor = k === 'h' ? HARD : EASY; x.shadowBlur = 18; x.beginPath(); x.roundRect(X, Y, w, h, 16); x.stroke(); x.restore(); }
  }
  // il testo si sposta a sinistra per fare posto alla freccia
  const tw = textW(x, s, 600, px, FB), cx = H.lerp(X + w / 2, X + 16 + tw / 2, col), y = Y + h / 2 + px * 0.36;
  if (col < 1) label(x, s, cx, y, 600, px, '#FFFFFF', 'center', 1 - col, FB);
  if (col > 0) {
    label(x, s, cx, y, 600, px, Q[2], 'center', col, FB);
    x.save(); x.globalAlpha *= col; icUpDown(x, X + w - 22, Y + h / 2, px * 0.78, k === 'h', k === 'h' ? HARD : EASY, 3.2); x.restore();
  }
}
// richiamo sotto le celle: filo rame dalla cella, freccia e parola («Più difficile» / «Più facile»)
function richiamoCella(x, A, gx, ly, p, testo, su, a) {
  callout(x, [A, [gx, A[1] + 10], [gx, ly], [gx - 26, ly]], p, testo, null, 'l', { px: 44, alpha: a, gap: 58 });
  if (p > 0.55) { x.save(); x.globalAlpha *= sm(0.55, 1, p) * a; icUpDown(x, gx - 26 - 30, ly, 32, su, su ? HARD : EASY, 4); x.restore(); }
}

// ===================== R04 · seduta dell'atleta sul telefono =====================
// st: { prefill: s dall'inizio della compilazione (<0 = serie vuote), fatte: serie del back-off confermate,
//       tap: { i, p } tocco in corso, rest: s dall'inizio del recupero (<0 = fermo), off: s da «Senza rete» (<0 = in rete) }
const SESSIONE = {
  giorno: 'Martedì · Settimana 3', esercizio: 'Trazioni', top: '+62,5 kg @8', backoff: '3 × 3 @8',
  serie: '3 × +52,5 kg', rpe: '@8', recupero: 120, dopo: ['Dip con fermo', '4 × 3 @7'],
};
const SERIE_Y = (i) => 540 + i * 86;                               // riga della serie i del back-off (texture)
const ANCORA = { off: 143, serie: (i) => SERIE_Y(i) + 44, recupero: 916 };
function texSession(st) {
  const c = texCanvas('session'), g = c.getContext('2d'), th = THEME.talyon, S = SESSIONE;
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  // pillola «Senza rete»
  if (st.off >= 0) {
    g.save(); g.globalAlpha = eo(st.off / 0.4);
    rrect(g, 44, 112, 250, 62, 31, 'rgba(255,255,255,0.10)', `rgba(${CUc},${0.35 + 0.5 * (1 - sm(0.4, 1.6, st.off))})`, 2);
    icCloudOff(g, 92, 143, 40, '#FFFFFF', 3.4);
    label(g, 'Senza rete', 128, 154, 600, 30, '#FFFFFF', 'left', 1, FB);
    g.restore();
  }
  caps(g, S.giorno, 44, 236, 26, th.t2);
  label(g, S.esercizio, 44, 306, 700, 72, '#FFFFFF', 'left', 1, FT);
  // top single già fatta: da lì si calcola il back-off
  rrect(g, 44, 336, TEX_W - 88, 100, 30, th.sup, th.bordo, 2);
  label(g, 'Top single', 80, 398, 600, 31, th.t2, 'left', 1, FB);
  label(g, S.top, 488, 399, 700, 34, '#FFFFFF', 'right', 1, FB);
  rrect(g, 506, 360, 52, 52, 26, th.acc); icCheck(g, 532, 386, 26, '#242B1D', 5);
  // back-off: le serie si compilano da sole (top −10 kg)
  rrect(g, 44, 456, TEX_W - 88, 352, 30, th.sup, th.bordo, 2);
  label(g, 'Back-off', 80, 514, 700, 40, '#FFFFFF', 'left', 1, FT);
  label(g, S.backoff, 560, 514, 500, 34, th.t2, 'right', 1, FB);
  for (let i = 0; i < 3; i++) {
    const y = SERIE_Y(i);
    g.fillStyle = th.bordo; g.fillRect(80, y, TEX_W - 160, 2);
    label(g, `Serie ${i + 1}`, 80, y + 56, 500, 32, th.t2, 'left', 1, FB);
    const pf = st.prefill < 0 ? 0 : eo((st.prefill - i * 0.18) / 0.5);
    label(g, '· · ·', 230, y + 56, 700, 36, th.t2, 'left', 1 - pf, FB);
    if (pf > 0) {
      g.save(); g.globalAlpha = pf;
      label(g, S.serie, 222, y + 56 - (1 - pf) * 10, 700, 36, '#FFFFFF', 'left', 1, FB);
      label(g, S.rpe, 446, y + 56 - (1 - pf) * 10, 500, 32, th.t2, 'left', 1, FB);
      const hl = (1 - sm(0.6, 1.6, st.prefill - i * 0.18)) * pf;
      if (hl > 0.01) { g.globalAlpha = hl; g.fillStyle = `rgb(${CUc})`; g.fillRect(222, y + 68, 196, 3); }
      g.restore();
    }
    const cx = 532, cy = y + 44;
    if (i < st.fatte) { rrect(g, cx - 26, cy - 26, 52, 52, 26, th.acc); icCheck(g, cx, cy, 26, '#242B1D', 5); }
    else rrect(g, cx - 24, cy - 24, 48, 48, 24, null, th.t2, 3);
    if (st.lampo && st.lampo.i === i && st.lampo.a > 0.02) { g.save(); g.globalAlpha = st.lampo.a; g.strokeStyle = `rgba(${CUc},0.95)`; g.lineWidth = 3; g.shadowColor = `rgba(${CUc},0.9)`; g.shadowBlur = 18; g.beginPath(); g.roundRect(64, y + 6, TEX_W - 128, 76, 18); g.stroke(); g.restore(); }
    if (st.tap && st.tap.i === i && st.tap.p > 0 && st.tap.p < 1) {
      const rp = eo(st.tap.p); g.save(); g.globalAlpha = (1 - rp) * 0.55;
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 30 + rp * 70, 0, 7); g.stroke();
      g.globalAlpha = (1 - rp) * 0.18; g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(cx, cy, 30 + rp * 40, 0, 7); g.fill(); g.restore();
    }
  }
  // recupero che parte da solo
  const ra = st.rest >= 0 ? eo(st.rest / 0.35) : 0;
  rrect(g, 44, 828, TEX_W - 88, 176, 30, th.sup, th.bordo, 2);
  const left = Math.max(0, S.recupero - Math.max(0, st.rest)), mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  g.save(); g.globalAlpha = 0.35 + 0.65 * ra;
  g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 10; g.beginPath(); g.arc(140, ANCORA.recupero, 56, 0, 7); g.stroke();
  if (st.rest >= 0) { g.strokeStyle = '#FFFFFF'; g.lineCap = 'round'; g.beginPath(); g.arc(140, ANCORA.recupero, 56, -PI / 2, -PI / 2 + 2 * PI * (left / S.recupero)); g.stroke(); }
  icTimer(g, 140, ANCORA.recupero, 22, '#FFFFFF', 4);
  label(g, 'Recupero', 230, 888, 500, 32, th.t2, 'left', 1, FB);
  label(g, `${mm}:${String(ss).padStart(2, '0')}`, 230, 970, 700, 76, '#FFFFFF', 'left', 1, FT);
  g.restore();
  // esercizio dopo
  rrect(g, 44, 1026, TEX_W - 88, 100, 30, 'rgba(255,255,255,0.05)', 'rgba(217,142,74,0.2)', 2);
  label(g, S.dopo[0], 80, 1090, 700, 34, th.t2, 'left', 1, FB);
  label(g, S.dopo[1], 560, 1090, 500, 30, th.t2, 'right', 1, FB);
  tabBar(g, th, 1);
  return c;
}
// stato iniziale: top single fatta, back-off ancora da compilare
const SESSIONE_INIZIO = { prefill: -1, fatte: 0, tap: null, rest: -1, off: -1 };

// richiami a filo rame dal bordo dello schermo del telefono; ancore in pixel della texture,
// richiami = [[testo, sotto?], ...] dal copione; tempi = quando compare ciascuno (tempo locale)
function richiamiTelefono(x, F, tl, d, s, ancore, tempi, righe) {
  const G = F.eroe; if (!G) return;
  const a = restaFino(tl, s), destra = s.camera === 'telefono-sinistra';
  const ex = destra ? 628 : 452;
  (d.richiami || []).forEach((r, k) => {
    if (k >= ancore.length) return;
    const p = sm(tempi[k], tempi[k] + 0.95, tl); if (p <= 0) return;
    const A = G.uv(destra ? 0.965 : 0.035, ancore[k] / TEX_H), ly = righe[k];
    const lab = Array.isArray(r) ? r[0] : r, sub = Array.isArray(r) ? r[1] : null;
    callout(x, [A, [A[0] + (destra ? 16 : -16), A[1]], [ex + (destra ? -16 : 16), ly], [ex, ly]], p, lab, sub, destra ? 'r' : 'l', { px: 46, subPx: 32, alpha: a });
  });
}
const evRichiami = (tempi, n) => tempi.slice(0, n).map((t) => ({ t: t + 0.3, tipo: 'parola', pan: -0.3 }));

// ===================== R03 · builder: griglia, duplica settimana, assegna da un modello =====================
const COLONNE_BUILDER = ['Esercizio', 'Serie', 'Intensità', 'Carico'];
// colonne della griglia: larghe quanto il testo più lungo, con lo spazio che resta diviso tra le colonne
function colonneBuilder(col, righe) {
  const larg = col.map((cn, j) => Math.max(textW(SCR, cn.toUpperCase(), 600, 24, FB, 24 * 0.18),
    ...righe.map((r) => (r[j] ? (j === 0 ? textW(SCR, r[j], 700, 52, FT) : textW(SCR, r[j], 600, 42, FB)) : 0))));
  const tot = larg.reduce((a, b) => a + b, 0), gap = col.length > 1 ? Math.max(28, Math.min(160, (870 - tot) / (col.length - 1))) : 0;
  const xs = []; let xx = 40; larg.forEach((w) => { xs.push(xx); xx += w + gap; });
  return xs;
}
// istante in cui si scrive la cella j della riga i
const tCellaBuilder = (i, j) => 0.75 + i * 0.8 + j * 0.17;
// settimana successiva: «Settimana 1» → «Settimana 2»
const settimanaDopo = (s, k) => { const m = String(s).match(/^(.*?)(\d+)\s*$/); return m ? m[1] + (Number(m[2]) + k) : `${s} · copia ${k}`; };

// ---------- schede delle settimane (duplica settimana) ----------
const CARTA_W = 445, CARTA_H = 236;
function cartaSettimana(titolo, righe) {
  return (g, w, h) => {
    glass(g, w, h, { r: 28 });
    label(g, titolo, 32, 66, 700, 44, '#FFFFFF', 'left', 1, FT);
    righe.slice(0, 3).forEach((r, i) => {
      label(g, r[0], 32, 122 + i * 40, 500, 30, INK2, 'left', 1, FB);
      if (r[1]) label(g, r[1], w - 32, 122 + i * 40, 500, 28, INK3, 'right', 1, FB);
    });
  };
}

const BLOCCHI_TEMI = {
  // la scheda scritta dal computer, cella per cella, come in palestra
  'builder-griglia': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const col = d.colonne || COLONNE_BUILDER, righe = d.righe.slice(0, 4), RH = 112, CX = colonneBuilder(col, righe);
      const W0 = 950, h = 196 + righe.length * RH, X0 = 65 + m.dx, T0 = topRiq(h);
      drawSprite(x, 'bg' + s.t0, W0, h, (g, w, hh) => {
        glass(g, w, hh, { r: 34 });
        g.fillStyle = `rgba(${CUc},0.35)`; g.fillRect(40, 102, w - 80, 1.5);
        col.forEach((cn, j) => caps(g, cn, CX[j], 150, 24, INK3));
        for (let i = 1; i < righe.length; i++) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(40, 170 + i * RH, w - 80, 1.5); }
      }, 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      caps(x, d.intestazione, X0 + 40, T0 + 70, 28, INK2);
      // cella attiva: l'ultima che ha cominciato a scriversi, finché non parte la successiva
      let attiva = null;
      righe.forEach((r, i) => r.slice(0, 4).forEach((v, j) => {
        const t0 = tCellaBuilder(i, j); if (tl < t0) return;
        const n = Math.ceil(String(v).length * H.clamp((tl - t0) / 0.16)), parte = String(v).slice(0, n);
        const y = T0 + 170 + i * RH + 70, cx = X0 + CX[j];
        if (j === 0) label(x, parte, cx, y, 700, 52, '#FFFFFF', 'left', 1, FT);
        else label(x, parte, cx, y, 600, 42, j === 3 ? '#FFFFFF' : INK2, 'left', 1, FB);
        attiva = { i, j, cx, y, w: j === 0 ? textW(x, parte, 700, 52, FT) : textW(x, parte, 600, 42, FB), t0 };
      }));
      const ultima = tCellaBuilder(righe.length - 1, Math.min(3, righe[righe.length - 1].length - 1)) + 0.5;
      if (attiva && tl < ultima) {
        const cw = (CX[attiva.j + 1] || 926) - CX[attiva.j] - 12;
        aloneRame(x, attiva.cx - 16, attiva.y - 64, cw + 8, 90, 14, 0.9);
        if (Math.floor((tl - attiva.t0) / 0.25) % 2 === 0 || tl - attiva.t0 < 0.2) { x.fillStyle = `rgb(${CUc})`; x.fillRect(attiva.cx + attiva.w + 4, attiva.y - 42, 3, 48); }
      }
      x.restore();
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(
      d.righe.slice(0, 4).flatMap((r, i) => r.slice(0, 4).map((_, j) => ({ t: tCellaBuilder(i, j), tipo: 'parola', pan: -0.4 + j * 0.25 })))),
  },

  // la settimana duplicata: ogni tocco una copia che vola al suo posto
  'duplica-settimana': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const copie = Math.max(1, Math.min(3, d.copie || 3)), W0 = 950, BH = 90;
      const h = 2 * CARTA_H + 28 + 36 + BH, X0 = 65 + m.dx, T0 = topRiq(h);
      const posto = (k) => [X0 + (k % 2) * (W0 - CARTA_W) + CARTA_W / 2, T0 + (k >> 1) * (CARTA_H + 28) + CARTA_H / 2];
      // posti vuoti per le copie
      x.save(); x.globalAlpha *= m.a * 0.6; x.setLineDash([10, 10]); x.strokeStyle = 'rgba(255,255,255,0.16)'; x.lineWidth = 2;
      for (let k = 1; k <= copie; k++) { const [cx, cy] = posto(k); x.beginPath(); x.roundRect(cx - CARTA_W / 2, cy - CARTA_H / 2, CARTA_W, CARTA_H, 28); x.stroke(); }
      x.restore();
      const [c0x, c0y] = posto(0);
      drawSprite(x, 'ds' + s.t0 + '-0', CARTA_W, CARTA_H, cartaSettimana(d.settimana, d.righe), c0x, c0y, 1, m.a, 0, m.blur);
      for (let k = 1; k <= copie; k++) {
        const tk = 1.4 + (k - 1) * 0.75, u = H.clamp((tl - tk - 0.05) / 0.55); if (u <= 0) continue;
        const e = io(u), [px, py] = posto(k);
        const p = bezAt([c0x, c0y], [c0x + (px - c0x) * 0.3, c0y - 90], [px, py - 90], [px, py], e);
        drawSprite(x, 'ds' + s.t0 + '-' + k, CARTA_W, CARTA_H, cartaSettimana(settimanaDopo(d.settimana, k), d.righe), p[0], p[1], H.lerp(0.9, 1, e), m.a * H.lerp(0.5, 1, e), 0, (1 - e) * 7);
        if (u >= 1) aloneRame(x, px - CARTA_W / 2, py - CARTA_H / 2, CARTA_W, CARTA_H, 28, m.a * Math.exp(-(tl - tk - 0.6) * 2.4));
      }
      // il pulsante: un tocco per ogni copia
      const by = T0 + 2 * CARTA_H + 28 + 36, bp = H.clamp((tl - 0.5) / 0.4);
      let press = 0;
      for (let k = 1; k <= copie; k++) { const tk = 1.4 + (k - 1) * 0.75; if (tl > tk && tl < tk + 0.7) { ripple(x, 540 + m.dx, by + BH / 2, eo((tl - tk) / 0.6), 130); press = Math.max(press, 1 - sm(tk, tk + 0.25, tl)); } }
      x.save(); x.globalAlpha *= m.a * eo(bp); x.translate(540 + m.dx, by + BH / 2); x.scale(1 - 0.02 * press, 1 - 0.02 * press); x.translate(-(540 + m.dx), -(by + BH / 2));
      pulsante(x, X0, by, W0, BH, d.pulsante, d.pulsante, false); x.restore();
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(
      Array.from({ length: Math.max(1, Math.min(3, d.copie || 3)) }, (_, i) => [{ t: 1.4 + i * 0.75, tipo: 'tocco', pan: 0 }, { t: 1.45 + i * 0.75, tipo: 'fruscio', pan: (i % 2 ? -0.4 : 0.4) }]).flat()),
  },

  // il modello assegnato agli atleti, uno dopo l'altro
  'assegna-modello': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const atleti = d.atleti.slice(0, 4), RH = 108, W0 = 950, MH = 196;
      const LH = 24 + atleti.length * RH + 8, h = MH + 40 + LH, X0 = 65 + m.dx, T0 = topRiq(h);
      const sett = Number((String(d.modello).match(/(\d+)\s*settiman/) || [])[1] || 0);
      drawSprite(x, 'am' + s.t0, W0, MH, (g, w, hh) => {
        glass(g, w, hh, { r: 34, bd: 0.7 });
        for (let i = 0; i < Math.min(6, sett); i++) { const bx = w - 40 - (Math.min(6, sett) - i) * 54; rrect(g, bx, 72, 44, 44, 10, 'rgba(255,255,255,0.05)', `rgba(${CUc},0.55)`, 1.5); label(g, String(i + 1), bx + 22, 103, 600, 24, INK2, 'center', 1, FB); }
      }, 540 + m.dx, T0 + MH / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      caps(x, 'Modello', X0 + 40, T0 + 62, 26, INK3);
      label(x, d.modello, X0 + 40, T0 + 130, 700, 56, '#FFFFFF', 'left', 1, FT);
      if (d.dettaglio) label(x, d.dettaglio, X0 + 40, T0 + 172, 500, 30, INK3, 'left', 1, FB);
      x.restore();
      // elenco degli atleti
      const le = eo((tl - 0.5) / 0.6), LT = T0 + MH + 40;
      drawSprite(x, 'aml' + s.t0, W0, LH, (g, w, hh) => glass(g, w, hh, { r: 34 }), 540 + m.dx + (1 - le) * 300, LT + LH / 2, 1, m.a * le, 0, (1 - le) * 12);
      atleti.forEach((nome, i) => {
        const a = m.a * eo((tl - 0.7 - i * 0.15) / 0.45); if (a <= 0.003) return;
        const y = LT + 24 + i * RH, tk = 1.5 + i * 0.7, ok = tl >= tk + 0.12;
        x.save(); x.globalAlpha *= a; x.translate((1 - a) * 40, 0);
        if (i) { x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(X0 + 40, y, W0 - 80, 1.5); }
        rrect(x, X0 + 40, y + 20, 68, 68, 34, 'rgba(255,255,255,0.08)', `rgba(${CUc},0.6)`, 1.5);
        label(x, iniziali(nome), X0 + 74, y + 66, 700, 26, '#FFFFFF', 'center', 1, FB);
        label(x, nome, X0 + 132, y + 70, 700, 46, '#FFFFFF', 'left', 1, FT);
        const bw = 250, bx = X0 + W0 - 40 - bw;
        if (ok) {
          rrect(x, bx, y + 20, bw, 68, 34, 'rgba(140,190,110,0.16)', 'rgba(150,200,120,0.60)', 2);
          icCheck(x, bx + 40, y + 54, 22, EASY, 4);
          label(x, d.fatto || 'Assegnata', bx + 66, y + 66, 700, 30, '#E2F0D6', 'left', 1, FB);
        } else {
          rrect(x, bx, y + 20, bw, 68, 34, '#F4F4EF');
          label(x, d.pulsante || 'Assegna', bx + bw / 2, y + 66, 700, 30, '#242B1D', 'center', 1, FB);
        }
        x.restore();
        if (tl > tk && tl < tk + 0.7) ripple(x, bx + bw / 2, y + 54, eo((tl - tk) / 0.6), 90);
        // filo rame dal modello all'atleta
        const fp = sm(tk - 0.35, tk, tl) * (1 - sm(tk + 0.5, tk + 1.1, tl));
        if (fp > 0.01) arrow(x, bez([X0 + 74, T0 + MH - 6], [X0 + 20, T0 + MH + 30], [X0 + 20, y + 54], [X0 + 38, y + 54], 24), sm(tk - 0.35, tk, tl), `rgba(${CUc},${0.9 * fp * m.a})`, 2);
      });
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }, { t: 0.5, tipo: 'fruscio', pan: 0.2 }].concat(
      d.atleti.slice(0, 4).flatMap((_, i) => [{ t: 1.5 + i * 0.7, tipo: 'tocco', pan: 0.3 }, { t: 1.61 + i * 0.7, tipo: 'ok', pan: 0.3 }])),
  },

  // ===================== R04 · la seduta sul telefono dell'atleta =====================
  // le serie del back-off si compilano da sole dalla top single
  'sessione-serie': {
    schermo: (tl) => texSession({ prefill: tl - 0.9, fatte: 0, tap: null, rest: -1, off: -1 }),
    disegna(x, F, tl, d, s) { richiamiTelefono(x, F, tl, d, s, [ANCORA.serie(1)], [1.1], [930]); },
    eventi: (d) => [{ t: 0.9, tipo: 'schermo', pan: 0.3 }].concat(evRichiami([1.1], (d.richiami || []).length)),
  },
  // un tocco conferma la serie e il recupero parte da solo
  recupero: {
    schermo(tl, d, s, P) {
      const tk = istanteTocco(s, P, 0.24);
      return texSession({ prefill: 99, fatte: tl >= tk + 0.12 ? 1 : 0, tap: { i: 0, p: (tl - tk) / 0.55 }, rest: tl >= tk + 0.15 ? tl - tk - 0.15 : -1, off: -1, lampo: { i: 0, a: 0.8 * pulse(tl, tk + 0.12) } });
    },
    disegna(x, F, tl, d, s) {
      const tk = istanteTocco(s, F.P, 0.24);
      richiamiTelefono(x, F, tl, d, s, [ANCORA.serie(0), ANCORA.recupero], [tk + 0.05, tk + 0.6], [880, 1110]);
    },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.24;
      return [{ t: tk, tipo: 'tocco', pan: 0.3 }, { t: tk + 0.11, tipo: 'ok', pan: 0.3 }, { t: tk + 0.15, tipo: 'schermo', pan: 0.3 }].concat(evRichiami([tk + 0.05, tk + 0.6], (d.richiami || []).length));
    },
  },
  // senza rete: compare «Senza rete» e la serie dopo si conferma lo stesso
  'senza-rete': {
    schermo(tl, d, s, P) {
      const tk = istanteTocco(s, P, 0.55);
      return texSession({ prefill: 99, fatte: tl >= tk + 0.12 ? 2 : 1, tap: { i: 1, p: (tl - tk) / 0.55 }, rest: 8 + tl, off: tl - 0.5, lampo: { i: 1, a: s.tipo === 'culmine' ? Math.min(1, 1.2 * Math.exp(-Math.max(0, tl - tk - 0.12) * 1.1)) * sm(tk, tk + 0.15, tl) : 0.8 * pulse(tl, tk + 0.12) } });
    },
    disegna(x, F, tl, d, s) { richiamiTelefono(x, F, tl, d, s, [ANCORA.off], [0.7], [700]); },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.55;
      return [{ t: 0.5, tipo: 'schermo', pan: 0.3 }, { t: tk, tipo: 'tocco', pan: 0.3 }, { t: tk + 0.11, tipo: 'ok', pan: 0.3 }].concat(evRichiami([0.7], (d.richiami || []).length));
    },
  },

  // ===================== R05 · atleti da seguire =====================
  'seguire-lista': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const righe = d.righe.slice(0, 4), RH = 128, W0 = 950, h = 116 + righe.length * RH + 16, X0 = 65 + m.dx, T0 = topRiq(h);
      drawSprite(x, 'sl' + s.t0, W0, h, (g, w, hh) => glass(g, w, hh, { r: 34 }), 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      label(x, d.titolo, X0 + 40, T0 + 80, 700, 52, '#FFFFFF', 'left', 1, FT);
      // quanti sono, in un cerchio rame
      const n = righe.filter((_, i) => tl >= 0.8 + i * 0.4).length;
      if (n > 0) { x.strokeStyle = `rgba(${CUc},0.8)`; x.lineWidth = 2; x.beginPath(); x.arc(X0 + W0 - 76, T0 + 64, 32, 0, 7); x.stroke(); label(x, String(n), X0 + W0 - 76, T0 + 77, 700, 34, '#FFFFFF', 'center', 1, FB); }
      x.restore();
      righe.forEach((r, i) => {
        const t0 = 0.8 + i * 0.4, a = m.a * eo((tl - t0) / 0.45); if (a <= 0.003) return;
        const y = T0 + 116 + i * RH;
        x.save(); x.globalAlpha *= a; x.translate((1 - a) * 30, 0);
        x.fillStyle = 'rgba(255,255,255,0.09)'; x.fillRect(X0 + 40, y, W0 - 80, 1.5);
        label(x, r[0], X0 + 40, y + 60, 700, 46, '#FFFFFF', 'left', 1, FT);
        if (r[3]) label(x, r[3], X0 + 40, y + 102, 500, 30, INK3, 'left', 1, FB);
        pill(x, X0 + W0 - 40, y + 50, r[1], KIND[r[2]] || 'neutra', 28, 'right');
        x.restore();
        // punto rame che si accende quando la riga arriva
        const g = m.a * Math.exp(-Math.max(0, tl - t0 - 0.2) * 2.5) * sm(t0, t0 + 0.2, tl);
        if (g > 0.02) { x.save(); x.globalAlpha *= g; x.fillStyle = `rgb(${CUc})`; x.shadowColor = `rgba(${CUc},0.9)`; x.shadowBlur = 16; x.beginPath(); x.arc(X0 + 18, y + 48, 6, 0, 7); x.fill(); x.restore(); }
      });
    },
    eventi: (d) => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(d.righe.slice(0, 4).map((_, i) => ({ t: 0.8 + i * 0.4, tipo: 'conta', pan: 0.2 }))),
  },

  // ===================== R06 · celle «più difficile» e «più facile» =====================
  'celle-coach': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const righe = d.righe.slice(0, 4), RH = 92, W0 = 950, h = 112 + righe.length * RH + 28, X0 = 65 + m.dx, T0 = topRiq(h);
      const cel = (r, k) => ({ x: X0 + 236 + k * 172, y: T0 + 112 + r * RH, w: 160, h: 72 });
      drawSprite(x, 'cc' + s.t0, W0, h, (g, w, hh) => glass(g, w, hh, { r: 32 }), 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      label(x, 'Seduta di ' + d.atleta, X0 + 36, T0 + 66, 700, 46, '#FFFFFF', 'left', 1, FT);
      if (d.giorno) caps(x, d.giorno, X0 + W0 - 36, T0 + 62, 24, INK3, 'right');
      let dura = null, facile = null;
      righe.forEach((r, i) => {
        const a = eo((tl - 0.7 - i * 0.25) / 0.45); if (a <= 0.003) return;
        x.save(); x.globalAlpha *= a;
        label(x, r[0], X0 + 36, T0 + 112 + i * RH + 34, 600, 32, INK2, 'left', 1, FB);
        if (r[1]) label(x, r[1], X0 + 36, T0 + 112 + i * RH + 66, 500, 26, INK3, 'left', 1, FB);
        r.slice(2, 6).forEach((v, k) => {
          const c = cel(i, k), q = leggiCella(v), tc = q.k === 'h' ? 1.9 : 2.4;
          disegnaCella(x, c.x, c.y, c.w, c.h, q.s, q.k, eo((tl - tc) / 0.35), 30, Math.exp(-Math.max(0, tl - tc) * 1.6) * sm(tc - 0.05, tc + 0.2, tl));
          if (q.k === 'h' && !dura) dura = c;
          if (q.k === 'e' && !facile) facile = c;
        });
        x.restore();
      });
      x.restore();
      // richiami: colore, freccia e parola
      const ca = m.a * restaFino(tl, s), ly = T0 + h + 74;
      if (dura) richiamoCella(x, [dura.x + dura.w - 18, dura.y + dura.h], dura.x + dura.w + 6, ly, sm(1.9, 2.85, tl), 'Più difficile', true, ca);
      if (facile) richiamoCella(x, [facile.x + facile.w / 2, facile.y + facile.h], facile.x + facile.w / 2, dura ? ly + 70 : ly, sm(2.4, 3.35, tl), 'Più facile', false, ca);
    },
    eventi: (d) => {
      const tutte = d.righe.slice(0, 4).flatMap((r) => r.slice(2, 6).map((v) => leggiCella(v).k));
      return [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(d.righe.slice(0, 4).map((_, i) => ({ t: 0.7 + i * 0.25, tipo: 'parola', pan: 0.2 })),
        tutte.includes('h') ? [{ t: 1.9, tipo: 'conta', pan: 0.3 }] : [], tutte.includes('e') ? [{ t: 2.4, tipo: 'conta', pan: -0.2 }] : []);
    },
  },
  // si tocca la cella e si rivede il prescritto accanto a quello che ha fatto
  'cella-prescritto': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const celle = d.celle.slice(0, 3).map(leggiCella), W0 = 950, RH = 230, PH2 = 300, h = RH + 36 + PH2, X0 = 65 + m.dx, T0 = topRiq(h);
      const ti = d.tocco != null ? d.tocco : Math.max(0, celle.findIndex((q) => q.k !== 'n'));
      const cw = 190, chh = 110, cx0 = X0 + W0 - 40 - celle.length * (cw + 16) + 16;
      const cel = (k) => ({ x: cx0 + k * (cw + 16), y: T0 + 60, w: cw, h: chh });
      drawSprite(x, 'cp' + s.t0, W0, RH, (g, w, hh) => glass(g, w, hh, { r: 34 }), 540 + m.dx, T0 + RH / 2, 1, m.a, 0, m.blur);
      const tk = istanteTocco(s, F.P, 0.42), sel = tl >= tk;
      x.save(); x.globalAlpha *= m.a;
      if (d.atleta) caps(x, 'Seduta di ' + d.atleta, X0 + 40, T0 + 58, 24, INK3);
      label(x, d.esercizio, X0 + 40, T0 + 136, 700, 52, '#FFFFFF', 'left', 1, FT);
      if (d.carico) label(x, d.carico, X0 + 40, T0 + 184, 500, 32, INK3, 'left', 1, FB);
      celle.forEach((q, k) => {
        const c = cel(k);
        disegnaCella(x, c.x, c.y, c.w, c.h, q.s, q.k, eo((tl - 0.6 - k * 0.1) / 0.35), 38, 0);
        if (k === ti && sel) { x.save(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 3; x.globalAlpha *= sm(tk, tk + 0.15, tl); x.beginPath(); x.roundRect(c.x - 5, c.y - 5, c.w + 10, c.h + 10, 20); x.stroke(); x.restore(); }
      });
      x.restore();
      const c = cel(ti);
      if (tl > tk && tl < tk + 0.7) ripple(x, c.x + c.w / 2, c.y + c.h / 2, eo((tl - tk) / 0.6), 110);
      // il riquadro del prescritto esce dalla cella toccata
      const pe = H.ease.back(H.clamp((tl - tk - 0.1) / 0.45)), pa = H.clamp((tl - tk - 0.1) / 0.2); if (pa <= 0.003) return;
      const PT = T0 + RH + 36, pcx = H.lerp(c.x + c.w / 2, 540 + m.dx, eo((tl - tk - 0.1) / 0.45)), pcy = H.lerp(c.y + c.h, PT + PH2 / 2, eo((tl - tk - 0.1) / 0.45));
      x.save(); x.globalAlpha *= m.a * pa;
      x.translate(pcx, pcy); x.scale(H.lerp(0.3, 1, pe), H.lerp(0.3, 1, pe)); x.translate(-(540 + m.dx), -(PT + PH2 / 2));
      drawSprite(x, 'cpp' + s.t0, W0, PH2, (g, w, hh) => { glass(g, w, hh, { r: 34, bd: 0.8 }); g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(40, 168, w - 80, 1.5); }, 540 + m.dx, PT + PH2 / 2, 1, 1, 0, 0);
      // punta verso la cella
      x.fillStyle = 'rgba(40,42,44,0.95)'; x.beginPath(); x.moveTo(c.x + c.w / 2 - 18, PT + 1); x.lineTo(c.x + c.w / 2, PT - 18); x.lineTo(c.x + c.w / 2 + 18, PT + 1); x.closePath(); x.fill();
      caps(x, `Prescritto · serie ${ti + 1}`, X0 + 40, PT + 62, 26, INK3);
      const lk = tl > tk ? Math.exp(-(tl - tk - 0.3) * 2.2) : 0;
      x.save(); x.shadowColor = `rgba(255,232,206,${0.5 * H.clamp(lk)})`; x.shadowBlur = 30 * H.clamp(lk);
      label(x, d.prescritto, X0 + 40, PT + 138, 700, 68, '#FFFFFF', 'left', 1, FT); x.restore();
      caps(x, 'Fatto', X0 + 40, PT + 224, 26, INK3);
      label(x, d.fatto, X0 + 40, PT + 272, 600, 40, '#FFFFFF', 'left', 1, FB);
      const q = celle[ti];
      if (q && q.k !== 'n') pill(x, X0 + W0 - 40, PT + 258, q.k === 'h' ? 'Più difficile' : 'Più facile', q.k === 'h' ? 'difficile' : 'facile', 30, 'right');
      x.restore();
    },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.42;
      return [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }, { t: tk, tipo: 'tocco', pan: 0.2 }, { t: tk + 0.12, tipo: 'schermo', pan: 0 }];
    },
  },
};

// schermate per nome usate dai blocchi generici (es. telefono-schermata da 'settimana:luca' a 'sessione')
const SCHERMI_TEMI = {
  sessione: () => texSession(SESSIONE_INIZIO),
};

// ===================== R07–R10: record, inviti, note, EMOM =====================
// ---------- utilità ----------
const temaDi = (palestra) => Object.keys(THEME).find((k) => THEME[k].name === palestra) || 'talyon';
const nomeProprio = (nome) => String(nome).split(' ')[0];
// righe di testo a capo dentro una larghezza (parole intere)
function aCapo(g, s, w, px, peso, fam) {
  const righe = []; let r = '';
  String(s).split(' ').forEach((p) => { const prova = r ? r + ' ' + p : p; if (r && textW(g, prova, peso, px, fam) > w) { righe.push(r); r = p; } else r = prova; });
  if (r) righe.push(r);
  return righe;
}
// pulsante piccolo: chiaro prima del tocco, salvia con la spunta dopo
function pulsantino(x, X, Y, w, h, testo, fatto, ok, px) {
  px = px || 30;
  if (ok) {
    rrect(x, X, Y, w, h, h / 2, 'rgba(140,190,110,0.16)', 'rgba(150,200,120,0.60)', 2);
    const tw = textW(x, fatto, 700, px, FB), x0 = X + w / 2 - (tw + 40) / 2;
    icCheck(x, x0 + 14, Y + h / 2, px * 0.75, EASY, 4);
    label(x, fatto, x0 + 40, Y + h / 2 + px * 0.36, 700, px, '#E2F0D6', 'left', 1, FB);
  } else {
    rrect(x, X, Y, w, h, h / 2, '#F4F4EF');
    label(x, testo, X + w / 2, Y + h / 2 + px * 0.36, 700, px, '#242B1D', 'center', 1, FB);
  }
}
function icPin(g, cx, cy, s, col) {                         // puntina della nota
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * 0.1; g.lineCap = 'round';
  g.beginPath(); g.arc(cx, cy - s * 0.18, s * 0.26, 0, 7); g.fill();
  g.beginPath(); g.moveTo(cx, cy + s * 0.06); g.lineTo(cx, cy + s * 0.5); g.stroke(); g.restore();
}
function icLink(g, cx, cy, s, col, lw) {                    // catena del link
  g.save(); g.strokeStyle = col; g.lineWidth = lw || s * 0.1; g.translate(cx, cy); g.rotate(-PI / 4);
  g.beginPath(); g.roundRect(-s * 0.55, -s * 0.18, s * 0.6, s * 0.36, s * 0.18); g.stroke();
  g.beginPath(); g.roundRect(-s * 0.05, -s * 0.18, s * 0.6, s * 0.36, s * 0.18); g.stroke(); g.restore();
}
// marchio della palestra: cerchio con le iniziali nei suoi colori
function marchio(g, th, cx, cy, r) {
  rrect(g, cx - r, cy - r, 2 * r, 2 * r, r, th.logo);
  label(g, th.mono || 'T', cx, cy + r * 0.3, 800, r * 0.84, th.logoTx, 'center', 1, FB, 1);
}

// ---------- R07 · il record proposto dall'atleta ----------
function texRecordProposto(st, d) {
  const c = texCanvas('record'), g = c.getContext('2d'), th = THEME.talyon;
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  caps(g, 'Martedì · Settimana 3', 44, 236, 26, th.t2);
  label(g, 'Trazioni', 44, 306, 700, 72, '#FFFFFF', 'left', 1, FT);
  rrect(g, 44, 336, TEX_W - 88, 100, 30, th.sup, th.bordo, 2);
  label(g, 'Top single', 80, 398, 600, 31, th.t2, 'left', 1, FB);
  label(g, String(d.record).replace(' kg', '') + ' kg @9', 488, 399, 700, 34, '#FFFFFF', 'right', 1, FB);
  rrect(g, 506, 360, 52, 52, 26, th.acc); icCheck(g, 532, 386, 26, '#242B1D', 5);
  // la scheda del record nuovo
  rrect(g, 44, 470, TEX_W - 88, 470, 36, 'rgba(255,255,255,0.07)', `rgba(${CUc},${0.55 + 0.4 * st.glow})`, 2.5);
  if (st.glow > 0.02) { g.save(); g.globalAlpha = st.glow; g.strokeStyle = `rgba(${CUc},0.95)`; g.lineWidth = 3; g.shadowColor = `rgba(${CUc},0.9)`; g.shadowBlur = 24; g.beginPath(); g.roundRect(44, 470, TEX_W - 88, 470, 36); g.stroke(); g.restore(); }
  caps(g, 'Nuovo record', 84, 534, 26, th.t2);
  pill(g, TEX_W - 84, 526, 'Nuovo', 'rame', 26, 'right');
  label(g, d.record, 84, 668, 700, 108, '#FFFFFF', 'left', 1, FT);
  label(g, `${d.esercizio} in zavorra`, 84, 724, 500, 34, th.t2, 'left', 1, FB);
  g.fillStyle = th.bordo; g.fillRect(84, 762, TEX_W - 168, 2);
  if (st.ok) {
    rrect(g, 84, 792, TEX_W - 168, 100, 34, 'rgba(140,190,110,0.16)', 'rgba(150,200,120,0.60)', 2);
    const tw = textW(g, 'Proposto al coach', 700, 36, FB), x0 = TEX_W / 2 - (tw + 46) / 2;
    icCheck(g, x0 + 16, 842, 26, EASY, 5); label(g, 'Proposto al coach', x0 + 46, 855, 700, 36, '#E2F0D6', 'left', 1, FB);
  } else {
    rrect(g, 84, 792, TEX_W - 168, 100, 34, th.btn);
    label(g, 'Proponi al coach', TEX_W / 2, 855, 700, 38, th.btnTx, 'center', 1, FB);
  }
  if (st.tap > 0 && st.tap < 1) { const rp = eo(st.tap); g.save(); g.globalAlpha = (1 - rp) * 0.55; g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.arc(TEX_W / 2, 842, 30 + rp * 90, 0, 7); g.stroke(); g.restore(); }
  label(g, 'Il coach lo conferma', TEX_W / 2, 1010, 500, 32, th.t2, 'center', 1, FB);
  tabBar(g, th, 1);
  return c;
}

// ---------- R08 · le schermate della palestra (link, richiesta, scheda pronta) ----------
const PALC = {};
function texPalestra(stato, chiave, atleta) {
  const k = `pal-${stato}-${chiave}-${atleta || ''}`;
  if (PALC[k]) return PALC[k];
  const c = H.layer(TEX_W, TEX_H), g = c.getContext('2d'), th = THEME[chiave] || THEME.fs;
  scrBg(g, th);
  marchio(g, th, 92, 172, 48);
  label(g, th.name, 162, 186, 700, 46, th.text, 'left', 1, FT);
  if (stato === 'pronta') {
    caps(g, 'Lunedì', 44, 300, 30, th.t2);
    label(g, `Ciao ${nomeProprio(atleta || 'Marco')}`, 44, 382, 700, 78, th.text, 'left', 1, FT);
    rrect(g, 44, 430, TEX_W - 88, 250, 40, th.sup, th.acc, 2.5);
    caps(g, 'La tua scheda è pronta', 84, 490, 26, th.t2);
    label(g, 'Settimana 1 di 4', 84, 578, 700, 70, th.text, 'left', 1, FT);
    label(g, 'Oggi: giorno 1', 84, 640, 500, 40, th.t2, 'left', 1, FB);
    const card = (y, t1, t2) => { rrect(g, 44, y, TEX_W - 88, 150, 34, th.sup, th.bordo, 2); label(g, t1, 84, y + 66, 700, 46, th.text, 'left', 1, FT); label(g, t2, 84, y + 116, 500, 32, th.t2, 'left', 1, FB); };
    card(704, 'Trazioni', '5 × 3 @7 · +20 kg'); card(874, 'Dip', '4 × 5 · RIR 2');
    rrect(g, 44, 1060, TEX_W - 88, 112, 34, th.btn);
    label(g, 'Inizia l’allenamento', TEX_W / 2, 1130, 700, 42, th.btnTx, 'center', 1, FB);
    tabBar(g, th, 0);
  } else {
    caps(g, 'Invito', 44, 300, 30, th.t2);
    label(g, 'Entra in', 44, 386, 700, 76, th.text, 'left', 1, FT);
    label(g, th.name, 44, 462, 700, 76, th.text, 'left', 1, FT);
    label(g, 'Allenati con le schede', 44, 534, 500, 36, th.t2, 'left', 1, FB);
    label(g, 'del tuo coach.', 44, 578, 500, 36, th.t2, 'left', 1, FB);
    rrect(g, 44, 630, TEX_W - 88, 330, 36, th.sup, th.bordo, 2);
    [['1', 'Chiedi di entrare'], ['2', 'Il coach accetta'], ['3', 'Trovi la tua scheda']].forEach(([n, s], i) => {
      const y = 700 + i * 94;
      rrect(g, 80, y - 34, 56, 56, 28, null, th.acc, 2.5); label(g, n, 108, y + 6, 700, 30, th.text, 'center', 1, FB);
      label(g, s, 164, y + 8, 600, 36, th.text, 'left', 1, FB);
    });
    if (stato === 'inviata') {
      rrect(g, 44, 1060, TEX_W - 88, 112, 34, null, th.acc, 2.5);
      const tw = textW(g, 'Richiesta inviata', 700, 40, FB), x0 = TEX_W / 2 - (tw + 52) / 2;
      icCheck(g, x0 + 18, 1116, 28, th.acc, 5); label(g, 'Richiesta inviata', x0 + 52, 1130, 700, 40, th.text, 'left', 1, FB);
      label(g, 'In attesa del coach', TEX_W / 2, 1226, 500, 32, th.t2, 'center', 1, FB);
    } else {
      rrect(g, 44, 1060, TEX_W - 88, 112, 34, th.btn);
      label(g, 'Chiedi di entrare', TEX_W / 2, 1130, 700, 42, th.btnTx, 'center', 1, FB);
    }
  }
  return (PALC[k] = c);
}
// QR stilizzato: moduli a caso con i tre quadrati d'angolo; non è leggibile e non punta a nessun indirizzo
const QR_N = 25;
let QRM = null;
function moduliQR() {
  if (QRM) return QRM;
  const r = H.rng(731), m = [];
  for (let i = 0; i < QR_N; i++) { m.push([]); for (let j = 0; j < QR_N; j++) m[i].push(r() < 0.5 ? 1 : 0); }
  const angolo = (a, b) => { for (let i = -1; i < 8; i++) for (let j = -1; j < 8; j++) { const y = a + i, xx = b + j; if (y < 0 || xx < 0 || y >= QR_N || xx >= QR_N) continue; m[y][xx] = (i < 0 || j < 0 || i > 6 || j > 6) ? 0 : (Math.max(Math.abs(i - 3), Math.abs(j - 3)) === 2 ? 0 : 1); } };
  angolo(0, 0); angolo(0, QR_N - 7); angolo(QR_N - 7, 0);
  for (let i = 10; i < 15; i++) for (let j = 10; j < 15; j++) m[i][j] = 0;   // posto per il marchio
  return (QRM = m);
}
function disegnaQR(x, X, Y, lato, tl, th) {
  const m = moduliQR(), q = lato / (QR_N + 2), ga = x.globalAlpha;
  rrect(x, X, Y, lato, lato, 20, '#FFFFFF');
  x.fillStyle = '#121212';
  for (let i = 0; i < QR_N; i++) for (let j = 0; j < QR_N; j++) {
    if (!m[i][j]) continue;
    const a = H.clamp((tl - 0.6 - (i + j) / (2 * QR_N) * 0.8) / 0.15); if (a <= 0) continue;
    x.globalAlpha = ga * a; x.fillRect(X + q * (j + 1), Y + q * (i + 1), q + 0.6, q + 0.6);
  }
  x.globalAlpha = ga * sm(1.2, 1.5, tl); marchio(x, th, X + lato / 2, Y + lato / 2, q * 2.2); x.globalAlpha = ga;
  // linea rame che scorre sul QR
  const p = ((tl - 1.6) % 2.2) / 1.1;
  if (tl > 1.6 && p < 1) {
    const y = Y + 14 + (lato - 28) * io(p);
    x.save(); x.globalAlpha = ga * Math.sin(PI * p); x.strokeStyle = `rgba(${CUc},0.95)`; x.lineWidth = 3; x.shadowColor = `rgba(${CUc},0.9)`; x.shadowBlur = 16;
    x.beginPath(); x.moveTo(X + 10, y); x.lineTo(X + lato - 10, y); x.stroke(); x.restore();
  }
}

// ---------- R09 · la nota del coach sull'esercizio ----------
const NOTA_BASE = { esercizio: 'Dip con fermo', dettaglio: '4 × 3 @7 · +30 kg', nota: 'Fermo di 1″ in basso, gomiti stretti.' };
function notaDelCopione() {
  const p = (COPIONE.momenti || []).concat([COPIONE.culmine]).find((m) => m && m.dati && m.dati.nota);
  return p ? Object.assign({}, NOTA_BASE, p.dati) : NOTA_BASE;
}
const NOTA_Y = 360;                                          // scheda della nota nella texture
function texEsercizio(st) {
  const c = texCanvas('esercizio'), g = c.getContext('2d'), th = THEME.talyon, N = notaDelCopione();
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  caps(g, 'Martedì · Settimana 3', 44, 196, 26, th.t2);
  label(g, N.esercizio, 44, 268, 700, 70, '#FFFFFF', 'left', 1, FT);
  label(g, N.dettaglio, 44, 318, 500, 34, th.t2, 'left', 1, FB);
  // la nota in evidenza, in cima all'esercizio
  const righe = aCapo(g, N.nota, TEX_W - 176, 36, 600, FB).slice(0, 3), nh = 96 + righe.length * 46;
  rrect(g, 44, NOTA_Y, TEX_W - 88, nh, 30, 'rgba(217,142,74,0.12)', `rgba(${CUc},${0.6 + 0.35 * st.glow})`, 2.5);
  if (st.glow > 0.02) { g.save(); g.globalAlpha = st.glow; g.strokeStyle = `rgba(${CUc},0.95)`; g.lineWidth = 3; g.shadowColor = `rgba(${CUc},0.9)`; g.shadowBlur = 26; g.beginPath(); g.roundRect(44, NOTA_Y, TEX_W - 88, nh, 30); g.stroke(); g.restore(); }
  icPin(g, 92, NOTA_Y + 50, 34, `rgb(${CUc})`);
  caps(g, 'Nota del coach', 124, NOTA_Y + 58, 26, '#FFFFFF');
  righe.forEach((r, i) => label(g, r, 84, NOTA_Y + 116 + i * 46, 600, 36, '#FFFFFF', 'left', 1, FB));
  // le serie sotto la nota
  const y0 = NOTA_Y + nh + 30;
  rrect(g, 44, y0, TEX_W - 88, 4 * 86 + 30, 30, th.sup, th.bordo, 2);
  for (let i = 0; i < 4; i++) {
    const y = y0 + 15 + i * 86;
    if (i) { g.fillStyle = th.bordo; g.fillRect(80, y, TEX_W - 160, 2); }
    label(g, `Serie ${i + 1}`, 80, y + 56, 500, 32, th.t2, 'left', 1, FB);
    label(g, '3 × +30 kg', 222, y + 56, 700, 36, '#FFFFFF', 'left', 1, FB);
    label(g, '@7', 420, y + 56, 500, 32, th.t2, 'left', 1, FB);
    rrect(g, 508, y + 20, 48, 48, 24, null, th.t2, 3);
  }
  tabBar(g, th, 1);
  return c;
}

// ---------- R10 · l'EMOM con il segnale a ogni minuto ----------
const EMOM = { esercizio: 'Muscle-up', dettaglio: '2 rip a minuto · +5 kg', minuti: 10, y: 640, r: 200 };
// st: { sec: secondi che restano nel minuto, min: minuto in corso, flash: luce del segnale (0..1) }
function texEmom(st) {
  const c = texCanvas('emom'), g = c.getContext('2d'), th = THEME.talyon, E = EMOM;
  g.setTransform(1, 0, 0, 1, 0, 0); scrBg(g, th);
  caps(g, `EMOM · ${E.minuti} minuti`, 44, 196, 26, th.t2);
  label(g, E.esercizio, 44, 268, 700, 72, '#FFFFFF', 'left', 1, FT);
  label(g, E.dettaglio, 44, 318, 500, 34, th.t2, 'left', 1, FB);
  const cx = TEX_W / 2, cy = E.y, f = st.flash;
  if (f > 0.02) { // il segnale: anello rame che si allarga
    g.save(); g.globalAlpha = f; g.strokeStyle = `rgba(${CUc},0.9)`; g.lineWidth = 6; g.shadowColor = `rgba(${CUc},0.9)`; g.shadowBlur = 30;
    g.beginPath(); g.arc(cx, cy, E.r + 30 + (1 - f) * 60, 0, 7); g.stroke(); g.restore();
  }
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 18; g.beginPath(); g.arc(cx, cy, E.r, 0, 7); g.stroke();
  g.save(); g.strokeStyle = f > 0.02 ? `rgb(${Math.round(H.lerp(255, 217, f))},${Math.round(H.lerp(255, 142, f))},${Math.round(H.lerp(255, 74, f))})` : '#FFFFFF'; g.lineCap = 'round'; g.lineWidth = 18;
  g.beginPath(); g.arc(cx, cy, E.r, -PI / 2, -PI / 2 + 2 * PI * H.clamp(st.sec / 60)); g.stroke(); g.restore();
  const s = Math.ceil(st.sec - 1e-6), testo = s >= 60 ? '1:00' : `0:${String(Math.max(0, s)).padStart(2, '0')}`;
  label(g, testo, cx, cy + 50, 700, 150, '#FFFFFF', 'center', 1, FT);
  label(g, `Minuto ${st.min} di ${E.minuti}`, cx, cy + 112, 500, 34, th.t2, 'center', 1, FB);
  rrect(g, 44, 920, TEX_W - 88, 110, 30, th.sup, th.bordo, 2);
  label(g, 'A ogni minuto, il segnale', TEX_W / 2, 988, 600, 34, th.t2, 'center', 1, FB);
  tabBar(g, th, 1);
  return c;
}
// minuto dell'EMOM: il segnale cade a tSig (tempo locale); il tempo corre 12 volte più veloce del vero
const EMOM_VEL = 12;
function statoEmom(tl, tSig, min0) {
  const e = (tl - tSig) * EMOM_VEL;                          // secondi dal segnale (negativi prima)
  if (e < 0) return { sec: Math.min(60, -e), min: min0, flash: 0 };
  return { sec: 60 - (e % 60), min: min0 + 1 + Math.floor(e / 60), flash: Math.exp(-(tl - tSig) * 2.2) };
}
// telefono di Luca alla settimana dell'EMOM
ATH['luca-emom'] = { name: 'Luca', day: 'Martedì', week: 'Settimana 2 di 4', today: 'Oggi: giorno 3', ex: [['Muscle-up', 'EMOM 10′ · 2 rip · +5 kg'], ['Trazioni', 'EMOM 8′ · 3 rip · +30 kg']] };

Object.assign(BLOCCHI_TEMI, {
  // R07 · l'atleta fa il record e lo propone al coach
  'record-proposto': {
    schermo(tl, d, s, P) {
      const tk = istanteTocco(s, P, 0.45);
      return texRecordProposto({ tap: (tl - tk) / 0.55, ok: tl >= tk + 0.12, glow: 0.8 * pulse(tl, 0.9) + 0.6 * pulse(tl, tk + 0.12) }, d);
    },
    disegna(x, F, tl, d, s) { const tk = istanteTocco(s, F.P, 0.45); richiamiTelefono(x, F, tl, d, s, [842], [tk + 0.1], [1080]); },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.45;
      return [{ t: 0.9, tipo: 'schermo', pan: 0.3 }, { t: tk, tipo: 'tocco', pan: 0.3 }, { t: tk + 0.11, tipo: 'ok', pan: 0.3 }].concat(evRichiami([tk + 0.1], (d.richiami || []).length));
    },
  },
  // R07 · il coach conferma il record; la stima resta segnata come stima
  'record-confermato': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const W0 = 950, h = d.stima ? 660 : 580, X0 = 65 + m.dx, T0 = topRiq(h), tk = istanteTocco(s, F.P, 0.5), ok = tl >= tk + 0.12;
      drawSprite(x, 'rc' + s.t0, W0, h, (g, w, hh) => { glass(g, w, hh, { r: 36 }); g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(40, 424, w - 80, 1.5); }, 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      caps(x, `Record di ${d.atleta || 'Luca'}`, X0 + 40, T0 + 64, 26, INK3);
      label(x, d.esercizio, X0 + 40, T0 + 146, 700, 64, '#FFFFFF', 'left', 1, FT);
      pill(x, X0 + 60 + textW(x, d.esercizio, 700, 64, FT), T0 + 124, 'Nuovo', 'rame', 28);
      // il numero grande si accende alla conferma
      const [num, unita] = String(d.record).split(' '), lk = ok ? Math.exp(-(tl - tk - 0.12) * 2.2) : 0;
      x.save(); x.shadowColor = `rgba(255,232,206,${0.35 + 0.5 * lk})`; x.shadowBlur = 30 + 60 * lk;
      label(x, num, X0 + 40, T0 + 330, 700, 190, '#FFFFFF', 'left', 1, FT); x.restore();
      if (unita) label(x, unita, X0 + 56 + textW(x, num, 700, 190, FT), T0 + 330, 700, 64, INK2, 'left', 1, FT);
      if (d.prima) label(x, `Prima: ${d.prima}`, X0 + 40, T0 + 392, 500, 32, INK3, 'left', 1, FB);
      gleam(x, (g) => { setF(g, 700, 190, FT); g.fillText(num, X0 + 40, T0 + 330); }, sm(tk + 0.2, tk + 0.8, tl), X0, X0 + 600, 80, 0.8);
      let yb = T0 + 470;
      if (d.stima) {
        label(x, 'Massimale stimato', X0 + 40, T0 + 488, 500, 34, INK2, 'left', 1, FB);
        label(x, d.stima, X0 + W0 - 200, T0 + 488, 700, 36, '#FFFFFF', 'right', 1, FB);
        pill(x, X0 + W0 - 40, T0 + 476, 'Stima', 'neutra', 26, 'right');
        yb = T0 + 540;
      }
      pulsante(x, X0 + 40, yb, W0 - 80, 90, d.pulsante, d.fatto, ok);
      x.restore();
      if (tl > tk && tl < tk + 0.7) ripple(x, 540 + m.dx, yb + 45, eo((tl - tk) / 0.6), 130);
    },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.5;
      return [{ t: 0.25, tipo: 'fruscio', pan: 0.2 }, { t: tk, tipo: 'tocco', pan: 0 }, { t: tk + 0.12, tipo: 'ok', pan: 0 }];
    },
  },

  // R08 · link e QR della palestra
  'invito-qr': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const th = THEME[temaDi(d.palestra)] || THEME.fs, W0 = 950, h = 540, X0 = 65 + m.dx, T0 = topRiq(h), lato = 330;
      drawSprite(x, 'iq' + s.t0, W0, h, (g, w, hh) => glass(g, w, hh, { r: 36 }), 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      marchio(x, th, X0 + 82, T0 + 82, 42);
      label(x, d.palestra, X0 + 142, T0 + 100, 700, 52, '#FFFFFF', 'left', 1, FT);
      disegnaQR(x, X0 + 40, T0 + 166, lato, tl, th);
      const RX = X0 + 410, RW = W0 - 450;
      caps(x, 'Link d’invito', RX, T0 + 196, 26, INK3);
      rrect(x, RX, T0 + 222, RW, 76, 24, 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.16)', 1.5);
      icLink(x, RX + 44, T0 + 260, 40, '#FFFFFF', 3.5);
      [150, 90, 120].forEach((bw, i) => rrect(x, RX + 82 + [0, 162, 264][i], T0 + 251, bw, 18, 9, 'rgba(255,255,255,0.22)'));
      const tc = 2.9, ok = tl >= tc + 0.12;
      pulsantino(x, RX, T0 + 322, RW, 80, 'Copia link', 'Link copiato', ok, 32);
      label(x, 'Chi lo apre', RX, T0 + 452, 500, 32, INK2, 'left', 1, FB);
      label(x, 'chiede di entrare.', RX, T0 + 492, 500, 32, INK2, 'left', 1, FB);
      x.restore();
      if (tl > tc && tl < tc + 0.7) ripple(x, RX + RW / 2, T0 + 362, eo((tl - tc) / 0.6), 110);
    },
    eventi: () => [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }, { t: 0.6, tipo: 'conta', pan: -0.3 }, { t: 1.6, tipo: 'schermo', pan: -0.3 }, { t: 2.9, tipo: 'tocco', pan: 0.3 }, { t: 3.02, tipo: 'ok', pan: 0.3 }],
  },
  // R08 · il coach accetta la richiesta e assegna la scheda; sul telefono dell'atleta la scheda è pronta
  'richiesta-accetta': {
    schermo(tl, d, s, P) {
      const k = temaDi(d.palestra), ta = istanteTocco(s, P, 0.6) + 0.1;
      if (tl < ta) return texPalestra('inviata', k);
      if (tl < ta + 0.55) return texWipeK('ra' + s.t0, texPalestra('inviata', k), texPalestra('pronta', k, d.atleta), sm(ta, ta + 0.55, tl));
      return texPalestra('pronta', k, d.atleta);
    },
    disegna(x, F, tl, d, s) {
      const tA = istanteTocco(s, F.P, 0.6), tC = Math.max(0.45, tA - 1.0), e = eo((tl - 0.25) / 0.6), a = e * restaFino(tl, s);
      if (a <= 0.003) return;
      const X0 = 65 - (1 - e) * 360, W0 = 382, T0 = 600, h = 560;
      drawSprite(x, 'ra' + s.t0, W0, h, (g, w, hh) => { glass(g, w, hh, { r: 32 }); g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(32, 304, w - 64, 1.5); }, X0 + W0 / 2, T0 + h / 2, 1, a, 0, (1 - e) * 12);
      x.save(); x.globalAlpha *= a;
      caps(x, 'Nuova richiesta', X0 + 32, T0 + 58, 24, INK3);
      label(x, d.atleta, X0 + 32, T0 + 126, 700, 54, '#FFFFFF', 'left', 1, FT);
      label(x, d.palestra, X0 + 32, T0 + 170, 500, 30, INK3, 'left', 1, FB);
      pulsantino(x, X0 + 32, T0 + 200, W0 - 64, 76, d.accetta || 'Accetta', d.accettata || 'Accettata', tl >= tC + 0.12, 30);
      caps(x, 'Scheda', X0 + 32, T0 + 352, 24, INK3);
      label(x, d.modello, X0 + 32, T0 + 406, 700, 38, '#FFFFFF', 'left', 1, FT);
      pulsantino(x, X0 + 32, T0 + 446, W0 - 64, 76, d.assegna || 'Assegna', d.assegnata || 'Assegnata', tl >= tA + 0.12, 30);
      x.restore();
      if (tl > tC && tl < tC + 0.7) ripple(x, X0 + W0 / 2, T0 + 238, eo((tl - tC) / 0.6), 90);
      if (tl > tA && tl < tA + 0.7) ripple(x, X0 + W0 / 2, T0 + 484, eo((tl - tA) / 0.6), 90);
      // filo rame dalla scheda assegnata al telefono dell'atleta
      const G = F.eroe, fp = sm(tA, tA + 0.5, tl);
      if (G && fp > 0) { const B = G.uv(0.04, 0.42); arrow(x, bez([X0 + W0 - 20, T0 + 484], [X0 + W0 + 40, T0 + 484], [B[0] - 60, B[1]], B, 24), fp, `rgba(${CUc},${0.9 * a * (1 - sm(tA + 1.2, tA + 1.8, tl))})`, 2); }
    },
    eventi: (d, s, colpo) => {
      const tA = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.6, tC = Math.max(0.45, tA - 1.0);
      return [{ t: 0.25, tipo: 'fruscio', pan: -0.4 }, { t: tC, tipo: 'tocco', pan: -0.4 }, { t: tC + 0.12, tipo: 'ok', pan: -0.4 }, { t: tA, tipo: 'tocco', pan: -0.4 }, { t: tA + 0.12, tipo: 'ok', pan: -0.4 }, { t: tA + 0.1, tipo: 'schermo', pan: 0.3 }];
    },
  },

  // R09 · il coach scrive la nota sull'esercizio
  'nota-scrivi': {
    disegna(x, F, tl, d, s) {
      const m = moto(tl, s); if (m.a <= 0.003) return;
      const W0 = 950, X0 = 65 + m.dx, righe = aCapo(SCR, d.nota, W0 - 160, 40, 600, FB).slice(0, 3);
      const nh = 60 + righe.length * 52, h = 300 + nh + 40, T0 = topRiq(h);
      drawSprite(x, 'ns' + s.t0, W0, h, (g, w, hh) => { glass(g, w, hh, { r: 34 }); g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(40, 214, w - 80, 1.5); }, 540 + m.dx, T0 + h / 2, 1, m.a, 0, m.blur);
      x.save(); x.globalAlpha *= m.a;
      caps(x, 'Esercizio', X0 + 40, T0 + 62, 26, INK3);
      label(x, d.esercizio, X0 + 40, T0 + 136, 700, 62, '#FFFFFF', 'left', 1, FT);
      if (d.dettaglio) label(x, d.dettaglio, X0 + 40, T0 + 184, 500, 34, INK3, 'left', 1, FB);
      icPin(x, X0 + 56, T0 + 262, 30, `rgb(${CUc})`);
      caps(x, 'Nota per l’atleta', X0 + 84, T0 + 270, 26, INK2);
      const FY = T0 + 300, t0 = 0.9, vel = 0.045, tot = righe.join(' ').length, scritti = Math.floor(H.clamp((tl - t0) / (tot * vel)) * tot);
      rrect(x, X0 + 40, FY, W0 - 80, nh, 22, 'rgba(255,255,255,0.06)', tl > t0 && scritti < tot ? `rgba(${CUc},0.8)` : 'rgba(255,255,255,0.16)', 1.5);
      let resto = scritti, fine = null;
      righe.forEach((r, i) => {
        const n = Math.max(0, Math.min(r.length, resto)); resto -= r.length + 1;
        const parte = r.slice(0, n), y = FY + 66 + i * 52;
        if (parte) label(x, parte, X0 + 76, y, 600, 40, '#FFFFFF', 'left', 1, FB);
        if (n > 0 || i === 0) fine = [X0 + 76 + textW(x, parte, 600, 40, FB), y];
      });
      if (fine && tl > t0 - 0.2 && (scritti < tot || Math.floor(tl / 0.3) % 2 === 0) && tl < t0 + tot * vel + 1.2) { x.fillStyle = `rgb(${CUc})`; x.fillRect(fine[0] + 4, fine[1] - 36, 3, 44); }
      x.restore();
      aloneRame(x, X0 + 40, FY, W0 - 80, nh, 22, m.a * 0.9 * pulse(tl, t0 + tot * vel));
    },
    eventi: (d) => {
      const parole = String(d.nota).split(' '); let n = 0;
      return [{ t: 0.25, tipo: 'fruscio', pan: 0.3 }].concat(parole.map((p) => { const t = 0.9 + n * 0.045; n += p.length + 1; return { t, tipo: 'parola', pan: -0.3 }; }));
    },
  },
  // R09 · la nota in evidenza sul telefono dell'atleta
  'nota-coach': {
    schermo(tl, d, s, P) {
      const tk = istanteTocco(s, P, 0.35);
      const glow = s.tipo === 'culmine' ? Math.min(1, 1.2 * Math.exp(-Math.max(0, tl - tk) * 1.0)) * sm(tk - 0.1, tk + 0.1, tl) : 0.9 * pulse(tl, tk);
      return texEsercizio({ glow });
    },
    disegna(x, F, tl, d, s) { const tk = istanteTocco(s, F.P, 0.35); richiamiTelefono(x, F, tl, d, s, [NOTA_Y + 60], [tk], [830]); },
    eventi: (d, s, colpo) => {
      const tk = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.35;
      return [{ t: tk, tipo: 'schermo', pan: 0.3 }].concat(evRichiami([tk], (d.richiami || []).length));
    },
  },

  // R10 · il minuto dell'EMOM che scorre e il segnale
  'emom-minuto': {
    schermo(tl, d, s, P) { return texEmom(statoEmom(tl, istanteTocco(s, P, 0.6), d.minuto || 3)); },
    disegna(x, F, tl, d, s) { const tS = istanteTocco(s, F.P, 0.6); richiamiTelefono(x, F, tl, d, s, [EMOM.y], [tS], [950]); },
    eventi: (d, s, colpo) => {
      const tS = s.tipo === 'culmine' ? colpo - s.t0 : (s.t1 - s.t0) * 0.6;
      return [{ t: tS, tipo: 'segnale', pan: 0.3 }].concat(evRichiami([tS], (d.richiami || []).length));
    },
  },
});

Object.assign(SCHERMI_TEMI, {
  entra: (tl, d, arg) => texPalestra('entra', arg || 'fs'),
  inviata: (tl, d, arg) => texPalestra('inviata', arg || 'fs'),
  pronta: (tl, d, arg) => texPalestra('pronta', arg || 'fs', 'Marco'),
  esercizio: () => texEsercizio({ glow: 0 }),
  emom: () => texEmom({ sec: 60, min: 1, flash: 0 }),
  record: () => texRecordProposto({ tap: -1, ok: false, glow: 0 }, { record: '+67,5 kg', esercizio: 'Trazione' }),
});
