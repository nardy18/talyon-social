// ===================== Talyon Reel · effetti dal piano =====================
// Gli effetti si calcolano dal copione e dal piano: la scena del gancio, il drop con il logo, gli eventi dei titoli e
// dei blocchi (piano.eventi), il colpo, la passata di luce e l'invito della chiusura. Stesse ricette del Reel 2.
// scoreSound(k) suona musica ed effetti; window.__SCORE_PARTS = 'music' | 'sfx' serve solo per misurarli separati.

function scoreSound(k0) {
  // Dal vivo, partendo a metà, un suono lungo già iniziato prima del punto di partenza può cadere a un tempo negativo
  // del contesto audio, e Web Audio lo rifiuta con un errore: quel suono si salta, tutti gli altri restano in programma.
  const safe = (fn) => function () { try { return fn.apply(null, arguments); } catch (e) { return undefined; } };
  const k = Object.assign({}, k0, { tone: safe(k0.tone), noise: safe(k0.noise), play: safe(k0.play) });
  const parts = (typeof window !== 'undefined' && window.__SCORE_PARTS) || 'all', P = PP();
  if (parts !== 'sfx') scoreMusic(k, P);
  if (parts !== 'music') scoreSfx(k, P);
}

function scoreSfx(k, P) {
  const V = variante(), ton = voci(V.tonica), dom = voci(V.dominante);
  const bwoom = (t, g, dur = 1.4, f = 58) => {
    k.tone(t, { f: [[0, f * 1.7], [0.1, f], [dur, f * 0.72]], dur, gain: 0.32 * g, a: 0.012, hold: dur * 0.15 });
    k.tone(t, { f: f * 2, dur: dur * 0.45, gain: 0.08 * g, a: 0.012 });
    k.tone(t, { f: [[0, 260], [0.12, 140]], type: 'triangle', dur: 0.24, gain: 0.16 * g, a: 0.004 });     // corpo udibile dal telefono
    k.noise(t, { dur: 0.6, color: 'brown', filter: 'lowpass', f: [[0, 420], [0.6, 80]], gain: 0.22 * g, a: 0.008, verb: 0.25 });
  };
  const air = (t, dur, g) => { k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 450], [dur, 4200]], q: 0.7, gain: 0.13 * g, a: dur * 0.92, verb: 0.35 }); k.tone(t, { f: [[0, ton.basso * 4], [dur, ton.basso * 8]], type: 'triangle', dur, gain: 0.025 * g, a: dur * 0.9, filter: 'lowpass', f2: 900 }); };
  const click = (t, g = 1, pan = 0) => { k.noise(t, { dur: 0.014, filter: 'bandpass', f: 2300, q: 1.6, gain: 0.2 * g, pan }); k.tone(t, { f: [[0, 420], [0.03, 260]], dur: 0.04, gain: 0.07 * g, pan }); };
  const glide = (t, dur, g, pan = 0) => k.noise(t, { dur, color: 'pink', filter: 'lowpass', f: [[0, 160], [dur * 0.5, 720], [dur, 190]], q: 0.9, gain: 0.26 * g, a: dur * 0.45, pan, verb: 0.15 });
  const chord = (t, freqs, dur, g) => freqs.forEach((f, i) => {
    const pan = (i - (freqs.length - 1) / 2) * 0.22;
    k.tone(t, { f, type: 'triangle', dur, gain: 0.05 * g, a: 0.03, hold: dur * 0.3, filter: 'lowpass', f2: [[0, 2200], [dur, 700]], pan, verb: 0.4 });
    k.tone(t, { f: f * 1.003, dur, gain: 0.04 * g, a: 0.05, hold: dur * 0.3, pan: -pan, verb: 0.4 });
  });
  const shimmer = (t, dur, g, pan = 0) => k.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 1400], [dur * 0.5, 2800], [dur, 1500]], q: 1.5, gain: 0.05 * g, a: dur * 0.4, pan, verb: 0.2 });
  const tap = (t, g = 1, pan = 0) => { k.play('tock', t, { f: 430, gain: 0.55 * g, pan }); k.tone(t, { f: [[0, 190], [0.06, 95]], dur: 0.09, gain: 0.16 * g, pan }); };
  const ok2 = (t, g = 1, pan = 0) => { k.tone(t, { f: ton.alte[0], dur: 0.22, gain: 0.07 * g, a: 0.003, verb: 0.3, pan }); k.tone(t + 0.08, { f: ton.alte[1], dur: 0.4, gain: 0.07 * g, a: 0.003, verb: 0.35, pan }); };
  const swish = (t, dur, g, pan = 0) => k.play('swish', t, { dur, gain: g, pan });
  const tick = (t, g = 0.6, pan = 0.2) => k.play('tick', t, { f: 4200, gain: g, pan });
  // il segnale dell'EMOM: due bip brevi e chiari
  const bip = (t, g = 1, pan = 0) => [0, 0.16].forEach((d) => { k.tone(t + d, { f: 1760, dur: 0.11, gain: 0.07 * g, a: 0.002, hold: 0.06, pan, nome: 'segnale' }); k.tone(t + d, { f: 880, type: 'square', dur: 0.11, gain: 0.018 * g, a: 0.002, hold: 0.06, filter: 'lowpass', f2: 2600, pan }); });

  // ---- gancio (0–2,85): la scena, le parole della domanda, il buio
  bwoom(0.0, 0.35, 0.9, 64);
  const scena = COPIONE.gancio.scena;
  if (scena === 'fogli') {
    k.play('paper', 0.02, { dur: 0.4, gain: 0.45, pan: -0.1 });
    FILE_GANCIO.forEach((f, i) => { const pan = (f.x - 540) / 540 * 0.6; k.play('pop', f.t, { f: 520 + i * 45, gain: 0.45, pan }); k.play('tock', f.t + 0.02, { f: 700 - i * 18, gain: 0.3, pan }); });
  } else if (scena === 'notifiche') {
    NOTES.forEach((n, i) => { const t = 0.2 + i * 0.24, pan = (n.x - 540) / 540 * 0.6; k.play('pop', t, { f: 560 + i * 40, gain: 0.42, pan }); if (n.k === 'chat') k.play('tock', t + 0.03, { f: 820, gain: 0.22, pan }); });
  } else if (scena === 'griglia') {
    k.play('paper', 0.02, { dur: 0.35, gain: 0.4, pan: 0.1 });
    for (let t = 0.45; t < USCITA_GANCIO[0]; t += 0.45) tick(t, 0.45, 0.15);
  } else if (scena === 'cronometro') {
    for (let t = 0.0; t < USCITA_GANCIO[0]; t += 0.5) k.play('tick', t, { f: Math.round(t * 2) % 2 ? 3300 : 4200, gain: 0.5, pan: 0 });
  }
  W2(COPIONE.gancio.righe, -0.42, 0.11).flat().forEach((p, i) => { if (p.t >= 0) click(p.t, 0.65, -0.25 + i * 0.04); });
  glide(USCITA_GANCIO[0], 0.7, 0.6);
  air(2.0, 0.95, 0.9);

  // ---- drop: luce, logo, promessa (2,8–6,25)
  bwoom(3.0, 1.0, 1.6, 56);
  k.tone(3.25, { f: [[0, 220], [0.45, 880]], dur: 0.5, gain: 0.035, a: 0.3 });
  chord(3.6, [dom.arp[0], dom.arp[2]], 1.0, 0.55);
  shimmer(4.3, 0.9, 0.9, 0.2);

  // ---- eventi dei titoli e dei blocchi
  for (const e of P.eventi) {
    const t = e.t, pan = e.pan || 0;
    if (e.tipo === 'parola') click(t, 0.6, pan);
    else if (e.tipo === 'fruscio') swish(t, 0.42, 0.45, pan);
    else if (e.tipo === 'conta') tick(t, 0.6, pan);
    else if (e.tipo === 'tocco') tap(t, 1.0, pan);
    else if (e.tipo === 'ok') ok2(t, 0.9, pan);
    else if (e.tipo === 'schermo') shimmer(t, 0.55, 0.8, pan);
    else if (e.tipo === 'segnale') bip(t, 1.0, pan);
  }

  // ---- il colpo: la salita nella pausa e l'accordo pieno
  const colpo = P.colpo;
  air(colpo - 1.0, 0.95, 1.1);
  bwoom(colpo, 1.35, 2.2, 52);
  chord(colpo, ton.pad, 1.8, 1.0);
  k.noise(colpo, { dur: 0.9, color: 'pink', filter: 'lowpass', f: [[0, 2400], [0.9, 200]], gain: 0.16, a: 0.01, verb: 0.4 });
  shimmer(colpo + 0.2, 0.6, 1.1, 0);

  // ---- passata di luce, video del simbolo, invito
  const s0 = P.sezioni[P.sezioni.length - 1].t0, ris = s0 + 1.5;
  k.noise(s0, { dur: 0.5, color: 'pink', filter: 'bandpass', f: [[0, 380], [0.25, 3000], [0.5, 900]], q: 0.8, gain: 0.26, a: 0.22, pan: -0.4, verb: 0.3 });
  k.noise(s0 + 0.12, { dur: 0.4, color: 'pink', filter: 'bandpass', f: [[0, 600], [0.2, 2600], [0.4, 900]], q: 0.8, gain: 0.18, a: 0.15, pan: 0.5, verb: 0.3 });
  bwoom(s0 + 0.25, 0.55, 1.2, 60);
  for (let i = 0; i < 6; i++) if (s0 + 0.45 + i * 0.45 < P.durata - 0.3) shimmer(s0 + 0.45 + i * 0.45, 0.55, 0.55, -0.6 + i * 0.24);
  W2(CHIUSURA_RIGHE, s0 + 0.75, 0.1).flat().forEach((p, i) => click(p.t, 0.55, -0.1 + i * 0.03));
  bwoom(ris, 0.75, Math.min(2.0, P.durata - ris), 55);
  chord(ris, ton.chiusura, Math.min(2.4, P.durata - ris), 0.9);
  click(s0 + 1.75, 0.7);
  k.play('ding', s0 + 1.8, { f: ton.arp[2], gain: 0.35 });
}

ESPORTA.scoreSound = scoreSound;
