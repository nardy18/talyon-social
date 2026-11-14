// ===================== Talyon Reel · modello: dal copione alla linea del tempo =====================
// piano(copione) calcola sezioni, camera, battute della musica, colpo del culmine ed eventi per gli effetti.
// Valori fissati dalla spec: gancio 0–2,85 s; logo e promessa 2,8–6,25 s; momenti con 0,6 s di passaggio;
// culmine di almeno 3,5 s; chiusura negli ultimi 4,0 s; drop della musica a 3,0 s; durata totale 30–36 s.

const PASSO = 0.6, DROP = 3.0, BATTITO = 0.5, BATTUTA = 2.0;
const CAMERA = {
  pannelli: { cx: -470, cy: 1580, s: 1.45, yaw: 0.10, pitch: 0.12 },   // telefono fuori campo, riquadri in primo piano
  telefono: { cx: 540, cy: 1515, s: 1.30, yaw: 0.0, pitch: 0.12 },     // un telefono grande al centro
  telefoni: { cx: 540, cy: 1355, s: 1.06, yaw: 0.0, pitch: 0.12 },     // tre telefoni in fila
  'telefono-destra': { cx: 705, cy: 1505, s: 1.62, yaw: -0.24, pitch: 0.12 },   // telefono a destra, richiami a sinistra (Reel 1, momento 4)
  'telefono-sinistra': { cx: 375, cy: 1505, s: 1.62, yaw: 0.24, pitch: 0.12 },  // telefono a sinistra, richiami a destra
};
const CAMERA_LOGO = [
  { t: 2.8, cx: 540, cy: 1590, s: 1.18, yaw: -0.62, pitch: 0.10 },
  { t: 4.8, cx: 540, cy: 1565, s: 1.34, yaw: -0.28, pitch: 0.12 },
  { t: 6.25, cx: 540, cy: 1560, s: 1.38, yaw: -0.18, pitch: 0.12 },
];
const r2 = (v) => Math.round(v * 100) / 100;

// tempi delle parole di un titolo (due righe, una parola ogni 0,11 s)
function paroleTitolo(righe, t0) {
  let i = 0;
  return righe.map((riga) => riga.split(' ').map((s) => ({ s, t: r2(t0 + (i++) * 0.11) })));
}

// colpo: il primo battito dopo `obiettivo`, portato sul battere; la battuta prima si allunga di uno o due battiti
function calcolaColpo(obiettivo) {
  const b = Math.ceil((obiettivo - DROP) / BATTITO - 1e-9);           // indice del battito dal drop
  let colpo = DROP + b * BATTITO;
  const pos = b % 4;                                                   // 0 battere, 1 secondo, 2 terzo, 3 quarto
  let allunga = 0;
  if (pos === 1) allunga = 1;
  else if (pos === 2) allunga = 2;
  else if (pos === 3) colpo += BATTITO;                                // dal quarto battito si passa al battere dopo
  return { colpo: r2(colpo), allunga };
}

function battuteFino(colpo, allunga, durata) {
  const out = [];
  // battute regolari dal drop fino a quella che si allunga
  const nPrima = Math.floor((colpo - DROP) / BATTUTA + 1e-9);
  for (let k = 0; k < nPrima; k++) out.push(r2(DROP + k * BATTUTA));
  if (allunga === 0 && nPrima > 0 && Math.abs(out[out.length - 1] + BATTUTA - colpo) > 1e-6) out.push(r2(colpo - BATTUTA));
  for (let t = colpo; t < durata - 1e-6; t += BATTUTA) out.push(r2(t));
  return [...new Set(out)].sort((a, b) => a - b);
}

function costruisci(c, scala) {
  const sez = [];
  sez.push({ tipo: 'gancio', t0: 0, t1: 2.85 });
  sez.push({ tipo: 'logo', t0: 2.8, t1: 6.25 });
  let t = 6.25;
  c.momenti.forEach((m, i) => {
    const base = m.durata || (BLOCCHI.blocchi[m.blocco] || {}).durata || 5.5;
    const dur = Math.min(7.5, Math.max(4.5, base * scala));
    const t0 = i === 0 ? t : t - PASSO;
    sez.push({ tipo: 'momento', i, blocco: m.blocco, camera: (BLOCCHI.blocchi[m.blocco] || {}).camera || 'pannelli', t0: r2(t0), t1: r2(t0 + dur) });
    t = t0 + dur;
  });
  const cb = BLOCCHI.blocchi[c.culmine.blocco] || {};
  const c0 = r2(t - PASSO);
  const { colpo, allunga } = calcolaColpo(c0 + 1.3);
  // la chiusura parte 1,5 s prima di un battito: lì cade l'accordo risolto (al più 0,5 s dopo il minimo)
  const c1min = Math.max(c0 + Math.max(3.5, cb.durata || 3.5), colpo + 2.2);
  const c1 = r2(colpo + Math.ceil((c1min + 1.5 - colpo) / BATTITO - 1e-9) * BATTITO - 1.5);
  sez.push({ tipo: 'culmine', blocco: c.culmine.blocco, camera: cb.camera || 'pannelli', t0: c0, t1: c1 });
  sez.push({ tipo: 'chiusura', t0: c1, t1: r2(c1 + 4.0) });
  return { sez, colpo, allunga, durata: r2(c1 + 4.0) };
}

function piano(c) {
  c = c || COPIONE;
  // la durata deve stare tra 30 e 36 s: si allungano o si accorciano i momenti (da 4,5 a 7,5 s ciascuno)
  let scala = 1, r = costruisci(c, scala);
  for (let k = 0; k < 6 && (r.durata < 30 || r.durata > 36); k++) {
    const mom = r.sez.filter((s) => s.tipo === 'momento').reduce((a, s) => a + (s.t1 - s.t0), 0);
    const obiettivo = r.durata < 30 ? 30.05 : 35.95;
    scala *= Math.max(0.3, (mom + (obiettivo - r.durata)) / mom);
    r = costruisci(c, scala);
  }
  const { sez, colpo, allunga, durata } = r;
  // titoli: entrano 0,4 s dopo l'inizio della sezione, escono 0,65 s prima della fine
  sez.forEach((s) => {
    if (s.tipo === 'momento' || s.tipo === 'culmine') {
      const parte = s.tipo === 'momento' ? c.momenti[s.i] : c.culmine;
      s.titolo = { parole: paroleTitolo(parte.titolo, s.t0 + 0.4), uscita: r2(s.t1 - 0.65) };
    }
  });
  // promessa: tre righe al massimo, come nel Reel 2
  const promessa = c.promessa.map((riga, li) => riga.split(' ').map((s, i) => ({ s, t: r2(3.6 + li * 0.38 + i * 0.1) })));
  // camera: logo come nel Reel 2, poi l'inquadratura di ogni sezione dopo 0,85 s di movimento
  const camera = CAMERA_LOGO.map((k) => Object.assign({}, k));
  sez.forEach((s) => {
    if (s.tipo !== 'momento' && s.tipo !== 'culmine') return;
    const prima = camera[camera.length - 1];
    camera.push(Object.assign({}, prima, { t: s.t0 }));
    camera.push(Object.assign({ t: r2(s.t0 + 0.85) }, CAMERA[s.camera]));
    // nel culmine la camera continua ad avvicinarsi piano fino alla chiusura
    // (l'alto dell'inquadratura resta fermo, così il telefono non sale verso il titolo)
    if (s.tipo === 'culmine') { const k0 = CAMERA[s.camera]; camera.push(Object.assign({}, k0, { t: s.t1, s: r2(k0.s * 1.06), cy: r2(470 + (k0.cy - 470) * 1.06) })); }
  });
  camera.push(Object.assign({}, camera[camera.length - 1], { t: durata + 1 }));
  // eventi delle sezioni (quelli dei blocchi si aggiungono quando i blocchi ci sono)
  const eventi = [];
  sez.forEach((s) => {
    if (s.tipo === 'momento' || s.tipo === 'culmine') {
      eventi.push({ t: s.t0, tipo: 'fruscio', pan: -0.3 });
      s.titolo.parole.flat().forEach((p, i) => eventi.push({ t: p.t, tipo: 'parola', pan: -0.25 + i * 0.04 }));
      const bj = typeof BLOCCHI_JS !== 'undefined' && BLOCCHI_JS[s.blocco];
      if (bj && bj.eventi) {
        const parte = s.tipo === 'momento' ? c.momenti[s.i] : c.culmine;
        bj.eventi(parte.dati, s, colpo).forEach((e) => eventi.push(Object.assign({}, e, { t: r2(s.t0 + e.t) })));
      }
    }
  });
  promessa.flat().forEach((p) => eventi.push({ t: p.t, tipo: 'parola', pan: 0 }));
  eventi.push({ t: colpo, tipo: 'colpo', pan: 0 });
  eventi.push({ t: sez[sez.length - 1].t0, tipo: 'passaggio', pan: -0.4 });
  eventi.sort((a, b) => a.t - b.t);
  const battute = battuteFino(colpo, allunga, durata);
  // fotogrammi chiave: un momento fermo per ogni sezione
  const fotogrammiChiave = sez.map((s) => {
    if (s.tipo === 'gancio') return 1.9;
    if (s.tipo === 'logo') return 5.0;
    if (s.tipo === 'culmine') return r2(Math.min(s.t1 - 0.3, colpo + 0.9));
    if (s.tipo === 'chiusura') return r2(s.t1 - 0.6);
    return r2(s.t1 - 0.9);
  });
  return { durata, sezioni: sez, camera, eventi, colpo, battute, pausa: [r2(colpo - 1.0), colpo], promessa, fotogrammiChiave };
}
ESPORTA.piano = piano;
