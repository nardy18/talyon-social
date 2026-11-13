// ===================== Talyon Reel · regia: il reel disegnato dal piano =====================
// Gancio (scena + domanda), logo e promessa sul telefono, momenti con titolo e blocco, culmine, chiusura con il simbolo.
const HX = SAFE.l + 15, HY = 372, HPX = 84;          // titoli dei momenti: in alto a sinistra, 84 px, due righe
const CHIUSURA_RIGHE = ['Seguici per non perdere', 'l’anteprima gratuita'];
let _PIANO = null;
const PP = () => _PIANO || (_PIANO = piano(COPIONE));
const verde = () => COPIONE.palco === 'verde';
const parteDi = (s) => (s.tipo === 'momento' ? COPIONE.momenti[s.i] : COPIONE.culmine);
const attive = (P, t) => P.sezioni.filter((s) => (s.tipo === 'momento' || s.tipo === 'culmine') && t >= s.t0 - 0.02 && t <= s.t1 + 0.02);

// ---------- telefono principale ----------
function eroeTex(t, A) {
  if (t < 6.25 + 0.9) {
    const c = texBoot(H.clamp((t - 3.25) / 0.9));
    if (t > 6.25) { const g = c.getContext('2d'); g.fillStyle = `rgba(22,26,17,${sm(6.25, 6.95, t)})`; g.fillRect(0, 0, TEX_W, TEX_H); }
    return c;
  }
  for (const s of A) { const b = BLOCCHI_JS[s.blocco]; if (b && b.schermo) return b.schermo(t - s.t0, parteDi(s).dati, s); }
  return texIdle();
}
function eroeS(t, A) {
  let ring = t >= 3.6 ? (sm(3.6, 4.05, t) * 0.9 + 0.9 * Math.exp(-(t - 3.6) * 3)) * (1 - 0.4 * sm(6.0, 7.0, t)) : 0;
  let spec = H.map(t, 4.1, 5.4, -0.25, 1.25), z = 0;
  const tel = A.find((s) => s.camera === 'telefono' || s.camera === 'telefoni');
  if (tel) {
    const tl = t - tel.t0;
    spec = H.map(tl, 1.2, 2.2, -0.25, 1.25);
    ring = Math.max(ring, 0.5 * sm(0, 0.8, tl));
    if (tel.camera === 'telefoni') z = 0.12 * io(sm(0, 1.0, tl));
  }
  return { x: 0, y: 0.1 + 0.012 * Math.sin(t * 1.2), z, ry: 0, tex: eroeTex(t, A), scrA: t < 6.25 ? sm(3.25, 4.15, t) : 1, ring, ringRot: t * 0.3, spec };
}

// ---------- titoli: promessa centrata, poi un titolo per sezione ----------
function titoli(x, P, t) {
  if (t > 3.4 && t < 6.25 + 0.8) wordsBlock(x, P.promessa, 540, 404, 700, 92, t, { align: 'center', out: 6.2 });
  P.sezioni.forEach((s) => {
    if (!s.titolo) return;
    const t0 = s.titolo.parole[0][0].t;
    if (t > t0 - 0.1 && t < s.titolo.uscita + 0.9) wordsBlock(x, s.titolo.parole, HX, HY, 700, HPX, t, { out: s.titolo.uscita });
  });
}

function gancio(x, t) {
  (GANCI[COPIONE.gancio.scena] || GANCI.fogli)(x, t);
  wordsBlock(x, W2(COPIONE.gancio.righe, -0.42, 0.11), HX, 392, 700, 108, t, { out: USCITA_GANCIO[0] });
}

function principale(x, t) {
  const P = PP(), A = attive(P, t);
  const c = cam(keyed(P.camera, t));
  const L = { key: sm(3.1, 4.4, t), rim: sm(2.8, 3.45, t), green: verde() ? 1 : 0 };
  stage(x, c, L, t);
  const F = { t, c, L, P, eroe: null, lati: null };
  A.forEach((s) => { const b = BLOCCHI_JS[s.blocco]; if (b && b.scena) b.scena(x, F, t - s.t0, parteDi(s).dati, s); });
  const S = eroeS(t, A), p = c.P(S.x, 1, S.z);
  if (p[0] > -c.unit * 0.8 && p[0] < W + c.unit * 0.8) F.eroe = phoneFull(x, c, S, L);
  A.forEach((s) => { const b = BLOCCHI_JS[s.blocco]; if (b) b.disegna(x, F, t - s.t0, parteDi(s).dati, s); });
  titoli(x, P, t);
}

// ---------- chiusura con il video del simbolo (come nel Reel 1 e nel Reel 2) ----------
function clipFrame(ct) {
  const C = window.TALYON_CLIP;
  if (!C || !C.frames || !C.frames.length) return null;
  if (C.single) return C.frames[0];
  return C.frames[Math.max(0, Math.min(C.frames.length - 1, Math.round(ct * (C.fps || 30))))];
}
function chiusura(x, t, s0) {
  const img = clipFrame(t - s0), inv = s0 + 0.75, handle = s0 + 1.75;
  if (img && img.width) x.drawImage(img, 0, 0, W, HH);
  else stage(x, { cx: 540, cy: 1500, unit: 360 }, { key: 1, green: 1, noObj: true }, t);
  x.save(); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 26; x.shadowOffsetY = 2;
  wordsBlock(x, W2(CHIUSURA_RIGHE, inv, 0.1), 540, 336, 700, 60, t, { align: 'center' });
  const lp2 = sm(handle - 0.3, handle + 0.3, t);
  x.shadowColor = 'transparent';
  x.globalAlpha = lp2; x.fillStyle = `rgb(${CUc})`; x.fillRect(540 - 60 * lp2, 428, 120 * lp2, 1.5); x.globalAlpha = 1;
  x.shadowColor = 'rgba(0,0,0,0.6)';
  wordsBlock(x, [[{ s: '@talyon.app', t: handle }]], 540, 486, 600, 48, t, { align: 'center', fam: FB });
  x.restore();
}

ESPORTA.disegna = function (ctx, t) {
  const P = PP(), s0 = P.sezioni[P.sezioni.length - 1].t0, s1 = s0 + 0.5;
  if (t < 2.85) gancio(ctx, t);
  else {
    if (t < s1) principale(ctx, t);
    if (t >= s0) {
      const bx = H.lerp(-300, W + 300, io(sm(s0, s1, t)));
      ctx.save();
      if (t < s1) { ctx.beginPath(); ctx.rect(0, 0, Math.max(0, bx), HH); ctx.clip(); }
      chiusura(ctx, t, s0);
      ctx.restore();
      if (t < s1 + 0.05) {
        const g = ctx.createLinearGradient(bx - 300, 0, bx + 140, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,240,225,0.85)'); g.addColorStop(0.86, 'rgba(255,240,225,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(bx - 300, 0, 440, HH); ctx.restore();
      }
    }
  }
  finish(ctx, t, t >= s1 || verde(), t >= s1);
};
