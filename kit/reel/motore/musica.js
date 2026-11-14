// ===================== Talyon Reel · musica dal piano =====================
// Musica originale a 120 BPM con gli strumenti del Reel 1 e del Reel 2; tonalità e giro dalla variante del copione (0–3).
// Le battute vengono dal piano: la battuta prima del colpo si allunga, così il colpo cade sul battere.
// Intro filtrata fino al drop (3,0 s), musica piena dal drop, più bassa (0,8) sotto i momenti, pausa da colpo − 1 a colpo,
// poi crash, swell e accordo pieno sul colpo; passata di luce all'inizio della chiusura e accordo risolto 1,5 s dopo.
// Per il telefono: il basso ha uno strato a dente di sega filtrato, la cassa un "knock" e un click, gli accordi tra 300 Hz e 3 kHz.

const VARIANTI = [
  { giro: ['D', 'Bm', 'G', 'A'], tonica: 'D', dominante: 'A' },     // 0 · Re
  { giro: ['E', 'B', 'C#m', 'A'], tonica: 'E', dominante: 'B' },    // 1 · Mi (come il Reel 2)
  { giro: ['F#m', 'D', 'A', 'E'], tonica: 'A', dominante: 'E' },    // 2 · La
  { giro: ['Bb', 'F', 'C', 'Dm'], tonica: 'F', dominante: 'C' },    // 3 · Fa
];
const variante = () => VARIANTI[COPIONE.musica] || VARIANTI[1];

// ---------- accordi e voci (stesse regole delle voci del Reel 2) ----------
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function leggiAccordo(n) {
  const m = /^([A-G])([#b]?)(m?)$/.exec(n);
  return { r: (SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12, minore: m[3] === 'm' };
}
const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const daA = (c, lo) => lo + (((c - lo) % 12) + 12) % 12;          // la nota della classe c tra lo e lo + 11
const VOCI = {};
function voci(nome) {
  if (VOCI[nome]) return VOCI[nome];
  const { r, minore } = leggiAccordo(nome), terza = (r + (minore ? 3 : 4)) % 12, quinta = (r + 7) % 12;
  const pr = daA(r, 45), ar = daA(r, 69);
  return (VOCI[nome] = {
    basso: midiHz(daA(r, 33)),
    stab: [r, terza, quinta].map((c) => daA(c, 64)).sort((a, b) => a - b).map(midiHz),
    pad: [pr, pr + 7, pr + 12, daA(terza, pr + 12), daA(quinta, pr + 12)].map(midiHz),
    arp: [ar, daA(terza, ar), daA(quinta, ar), ar + 12].map(midiHz),
    chiusura: [pr - 12, pr - 5, pr, daA(terza, pr), daA(quinta, pr), pr + 14].map(midiHz),
    alte: [daA(r, 86), daA(quinta, 86) + (daA(quinta, 86) < daA(r, 86) ? 12 : 0)].map(midiHz),
  });
}
const inR = (t, a, b) => t >= a - 1e-6 && t < b - 1e-6;

// ---------- linea del tempo musicale dal piano ----------
function tempiMusica(P) {
  const V = variante(), colpo = P.colpo, s0 = P.sezioni[P.sezioni.length - 1].t0, ris = s0 + 1.5;
  const dopo = V.giro.includes(V.tonica) ? V.giro.slice(V.giro.indexOf(V.tonica)).concat(V.giro.slice(0, V.giro.indexOf(V.tonica))) : [V.tonica].concat(V.giro.slice(1));
  const battute = [-1, 1].concat(P.battute.filter((b) => b < ris - 1e-6));
  const accordi = [[-1, 2.0, V.giro[2]], [2.0, 2.5, V.giro[3]], [2.5, 3.0, V.dominante]];
  let i = 0, j = 0;
  P.battute.forEach((b, k) => {
    const fine = P.battute[k + 1] != null ? P.battute[k + 1] : P.durata + 1;
    if (b < colpo - 1e-6) {
      accordi.push([b, Math.min(fine, colpo - 1.0), V.giro[i++ % 4]]);
      if (fine > colpo - 1.0 + 1e-6) accordi.push([colpo - 1.0, colpo, V.dominante]);   // la pausa sospesa
    } else if (b < s0 - 1e-6) accordi.push([b, Math.min(fine, s0), dopo[j++ % 4]]);
  });
  accordi.push([s0, ris, V.dominante], [ris, P.durata + 1, V.tonica]);
  const accordoA = (t) => { for (const c of accordi) if (t >= c[0] && t < c[1]) return c[2]; return V.tonica; };
  return { V, colpo, s0, ris, battute, accordi, accordoA };
}

function scoreMusic(k0, P) {
  // tutta la musica un filo più su (+1 dB) senza toccare i singoli strumenti
  const MG = 1.12, k = Object.assign({}, k0, {
    tone: (t, p) => k0.tone(t, Object.assign({}, p, { gain: p.gain * MG })),
    noise: (t, p) => k0.noise(t, Object.assign({}, p, { gain: p.gain * MG })),
  });
  const MB = 'music', M = tempiMusica(P), { colpo, s0, ris, accordoA } = M;
  const lpF = (lp, o) => (lp ? Object.assign(o, { filter: 'lowpass', f2: lp, q: 0.7 }) : o);
  // ---- strumenti (gli stessi del Reel 1 e del Reel 2)
  const kick = (t, g = 1, lp = 0) => {
    k.tone(t, lpF(lp, { f: [[0, 165], [0.07, 58], [0.3, 46]], dur: 0.3, gain: 0.4 * g, a: 0.002, hold: 0.02, bus: MB, nome: 'cassa' }));
    k.tone(t, lpF(lp, { f: [[0, 250], [0.06, 120]], type: 'triangle', dur: 0.12, gain: 0.32 * g, a: 0.001, bus: MB }));
    if (!lp || lp > 2400) { k.noise(t, { dur: 0.01, filter: 'highpass', f: 3200, gain: 0.15 * g, a: 0.0005, bus: MB }); k.noise(t, { dur: 0.025, filter: 'bandpass', f: 1100, q: 1.2, gain: 0.08 * g, a: 0.001, bus: MB }); }
  };
  const clap = (t, g = 1, pan = 0) => {
    [0, 0.012, 0.024].forEach((d, i) => k.noise(t + d, { dur: 0.016, filter: 'bandpass', f: 1450, q: 1.1, gain: (0.2 - i * 0.03) * g, a: 0.001, pan, bus: MB }));
    k.noise(t + 0.03, { dur: 0.2, filter: 'bandpass', f: [[0, 1600], [0.2, 1100]], q: 0.8, gain: 0.17 * g, a: 0.002, pan, verb: 0.18, bus: MB });
  };
  const hat = (t, g = 1, open = false, pan = 0.18) => k.noise(t, { dur: open ? 0.15 : 0.035, filter: 'highpass', f: open ? 6500 : 8200, q: 0.7, gain: (open ? 0.07 : 0.055) * g, a: 0.001, pan, bus: MB });
  const bass = (t, ch, len, g = 1, lp = 1100) => {
    const f = voci(ch).basso;
    k.tone(t, { f, dur: len, gain: 0.15 * g, a: 0.005, hold: len * 0.5, bus: MB });
    k.tone(t, { f: f * 2, type: 'sawtooth', dur: len, gain: 0.17 * g, a: 0.004, hold: len * 0.3, filter: 'lowpass', f2: [[0, lp * 1.9], [len, lp * 0.55]], q: 2.4, bus: MB });
    k.tone(t, { f: f * 4, type: 'square', dur: len * 0.8, gain: 0.025 * g, a: 0.004, filter: 'lowpass', f2: lp * 1.4, q: 0.8, bus: MB });
  };
  const stab = (t, ch, g = 1, lp = 2600) => voci(ch).stab.forEach((f, i) =>
    k.tone(t, { f, type: 'sawtooth', dur: 0.24, gain: 0.036 * g, a: 0.003, hold: 0.05, filter: 'lowpass', f2: [[0, lp], [0.22, lp * 0.3]], q: 1.4, pan: (i - 1) * 0.3, verb: 0.12, bus: MB }));
  const pad = (t, dur, ch, g = 1, lp = 1200) => voci(ch).pad.forEach((f, i) => {
    const pan = (i - 2) * 0.22, a = Math.min(0.5, dur * 0.3);
    k.tone(t, { f, type: 'sawtooth', dur, gain: 0.018 * g, a, hold: dur * 0.45, filter: 'lowpass', f2: lp, q: 0.7, pan, verb: 0.3, bus: MB });
    k.tone(t, { f: f * 1.004, type: 'triangle', dur, gain: 0.022 * g, a, hold: dur * 0.45, pan: -pan, bus: MB });
  });
  const arp = (t, f, g = 1, pan = 0) => {
    k.tone(t, { f, type: 'triangle', dur: 0.16, gain: 0.03 * g, a: 0.002, filter: 'lowpass', f2: 3200, pan, verb: 0.22, bus: MB });
    k.tone(t, { f: f * 2, dur: 0.07, gain: 0.007 * g, a: 0.002, pan, bus: MB });
  };
  const crash = (t, g = 1) => {
    k.noise(t, { dur: 1.8, filter: 'highpass', f: 4500, q: 0.6, gain: 0.09 * g, a: 0.002, verb: 0.35, bus: MB, nome: 'crash' });
    k.noise(t, { dur: 0.45, filter: 'bandpass', f: 7000, q: 0.5, gain: 0.055 * g, a: 0.001, bus: MB });
  };
  // piatto al contrario che finisce sul colpo
  const swell = (t1, dur, g = 1) => k.noise(t1 - dur * 0.9, { dur, filter: 'highpass', f: [[0, 9000], [dur * 0.9, 3200]], q: 0.6, gain: 0.11 * g, a: dur * 0.9, bus: MB, nome: 'swell' });

  // ---- livello: un poco più bassa sotto i momenti da leggere
  const momenti = P.sezioni.filter((s) => s.tipo === 'momento'), culmine = P.sezioni.find((s) => s.tipo === 'culmine');
  const mg = (t) => (t < 3 ? 0.9 : t < 6.25 ? 1 : momenti.some((s) => t >= s.t0 && t < s.t1 && !(culmine && t >= culmine.t0)) ? 0.8 : t < colpo ? 0.9 : t < s0 ? 1 : 0.95);
  const pieno = (t) => inR(t, 3, colpo - 1.0) || inR(t, colpo, s0);
  const pausa = (t) => inR(t, s0, ris);                                // dopo la passata: solo cassa leggera

  // ---- intro filtrata (0–3): cassa e basso chiusi, il filtro si apre verso il drop
  const lpIntro = (t) => (t < 1 ? 280 : 280 * Math.pow(1500 / 280, Math.min(1, (t - 1) / 1.95)));
  pad(0, 2.0, M.V.giro[2], 0.75, 700); pad(2.0, 0.6, M.V.giro[3], 0.75, 900); pad(2.5, 0.6, M.V.dominante, 0.8, 1100);

  // ---- battito per battito, battuta per battuta
  M.battute.forEach((b, bi) => {
    const fine = M.battute[bi + 1] != null ? M.battute[bi + 1] : ris;
    for (let j = 0; b + j * 0.5 < fine - 1e-6; j++) {
      const t = b + j * 0.5, offT = t + 0.25, chOff = accordoA(offT + 0.01), g = mg(t);
      if (t < 0) continue;
      if (t < 3) kick(t, 0.9, lpIntro(t));
      else if (pieno(t)) kick(t, g);
      else if (pausa(t)) kick(t, 0.8 * g);
      if (pieno(t) && j % 2 === 1) clap(t, 0.95 * g, -0.05);
      if (pieno(t)) {
        hat(offT, 0.95 * g, true);
        if (inR(t, colpo, s0)) { hat(t + 0.125, 0.4 * g); hat(t + 0.375, 0.4 * g); }
      }
      if (t < 3) bass(offT, chOff, 0.22, 0.85, H.lerp(260, 900, H.clamp((t - 1) / 2)));
      else if (pieno(t)) bass(offT, chOff, 0.22, g, 1100);
    }
    // accordi a stab in ritmo 3-3-2
    for (const d of [0, 0.75, 1.5]) {
      const t = b + d; if (t < 0 || t >= fine - 1e-6) continue;
      if (b === 1) stab(t, accordoA(t + 0.01), 0.55, H.lerp(700, 1500, d / 1.5));
      else if (pieno(t)) stab(t, accordoA(t + 0.01), mg(t));
    }
  });
  // tappeto leggero sotto le parti piene
  for (const [a, b2, ch] of M.accordi) {
    if (a >= 3 && b2 <= colpo - 1.0 + 1e-6) pad(a, b2 - a + 0.15, ch, 0.38, 1500);
    if (a >= colpo - 1e-6 && b2 <= s0 + 1e-6) pad(a, b2 - a + 0.15, ch, 0.42, 1700);
  }
  // arpeggio in sedicesimi quando l'energia sale (dopo il colpo, fino alla passata)
  { let i = 0; for (let t = colpo; t < s0 - 1e-6; t += 0.125, i++) { const ch = accordoA(t + 0.01); arp(t, voci(ch).arp[[0, 1, 2, 3, 2, 1, 2, 3][i % 8]], i % 2 ? 0.75 : 1, i % 2 ? 0.35 : -0.35); } }

  // ---- crescendo e colpi
  // verso il drop (2–3)
  for (let i = 0; i < 16; i++) { const t = 2.0 + i * 0.0625; if (i % 2 === 0 || t >= 2.5) hat(t, 0.25 + 0.6 * (i / 15), false, 0.1); }
  for (let i = 0; i < 8; i++) clap(2.0 + i * 0.125, 0.22 + 0.5 * (i / 7), 0);
  swell(3.0, 1.1, 1.0);
  crash(3.0, 1.0);
  // verso il colpo: sedicesimi, poi la pausa con il solo accordo sospeso
  for (let i = 0; i < 8; i++) hat(colpo - 2.0 + i * 0.125, 0.3 + 0.6 * (i / 7), false, 0.1);
  clap(colpo - 1.5, 0.6); clap(colpo - 1.25, 0.75);
  pad(colpo - 1.0, 1.1, M.V.dominante, 0.9, 1800);
  swell(colpo, 0.95, 1.2);
  crash(colpo, 1.25);
  pad(colpo, 1.9, M.V.tonica, 1.0, 2200);
  stab(colpo, M.V.tonica, 1.15);
  // verso la passata di luce
  for (let i = 0; i < 8; i++) hat(s0 - 1.0 + i * 0.125, 0.3 + 0.55 * (i / 7), false, 0.1);
  for (let i = 0; i < 4; i++) clap(s0 - 0.5 + i * 0.125, 0.35 + 0.4 * (i / 3), 0);
  swell(s0, 0.9, 1.0);
  crash(s0, 0.8);
  pad(s0, 1.6, M.V.dominante, 0.7, 1600);
  // chiusura: accordo risolto, niente batteria, arpeggio che si spegne
  const resto = Math.max(0.5, P.durata - ris);
  swell(ris, 0.8, 0.7);
  crash(ris, 0.9);
  kick(ris, 1.1);
  pad(ris, resto - 0.05, M.V.tonica, 1.0, 1900);
  bass(ris, M.V.tonica, resto - 0.2, 0.9, 700);
  stab(ris, M.V.tonica, 1.1);
  { let i = 0; for (let t = ris; t < ris + resto - 0.25; t += 0.25, i++) arp(t, voci(M.V.tonica).arp[[0, 1, 2, 3, 2, 1][i % 6]], 0.95 * (1 - (t - ris) / (resto + 0.1)), i % 2 ? 0.4 : -0.4); }
}
