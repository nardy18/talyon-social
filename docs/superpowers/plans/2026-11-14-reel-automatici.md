# Reel automatici — piano di lavoro

> **Per chi esegue:** passi con le caselle (`- [ ]`). Si eseguono in ordine, un task alla volta, con il test prima del codice.

**Obiettivo:** un modello di reel nel repository `nardy18/talyon-social`. Con un copione scritto ogni sabato, il modello produce un reel animato nello stile del Reel 1 e del Reel 2. Il giro del sabato lo usa per mettere in bozza su Metricool un reel a settimana, insieme ai due caroselli.

**Architettura:**
- Il motore del Reel 2 (canvas 2D in Chrome senza schermo) diventa una libreria: motore, interfaccia, schermate, blocchi.
- Un modulo «modello» trasforma il copione JSON in una linea del tempo: sezioni, camera, eventi e colpo musicale. Su quella linea si disegnano i blocchi e si generano musica ed effetti.
- Uno script Python, `reel.py`, fa tutto il resto con Playwright e ffmpeg, come `kit/genera.py`: pagina, controlli, fotogrammi, video, audio e copertina.

**Strumenti:** JavaScript nel browser (Chromium di Playwright), Python 3 con `playwright.sync_api` e Pillow, ffmpeg e ffprobe, `unittest` di Python per i test. Niente Node e niente npm nel giro del sabato.

**Spec:** `claude/reel-automatici.md` (progetto Talyon), approvata da Emanuele il 14 novembre 2026.

## Vincoli globali

- **Formato:** video 1080×1920 a 30 fps, durata da 30 a 36 s.
- **Video:** H.264 High, `yuv420p`, BT.709 tv-range (`scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int`), `-preset slow -crf 17 -x264-params aq-mode=3:aq-strength=0.9`.
- **Audio:** AAC 192k a 48 kHz stereo; −14 LUFS integrati (±0,5) e picco vero ≤ −1,0 dBTP.
- **Area sicura per i testi:** `SAFE = {l: 65, r: 1015, t: 269, b: 1248}`. Fa eccezione la chiusura, uguale a quella di Reel 1 e Reel 2.
- **Font:** `SairaT` (stretch 82%) per i titoli e `SairaB` (100%) per i testi, dallo stesso woff2 in `kit/reel/risorse/saira.woff2`.
- **Colori:**
  - rame `#D98E4A` solo per linee e dettagli, mai per testi o pulsanti;
  - più difficile `#F3A398` con freccia su; più facile `#B5D69A` con freccia giù;
  - palco grafite o verde militare; finitura lucida senza grana.
- **Contenuti:**
  - solo le funzioni dell'elenco «Esistono» in `kit/LEGGIMI.md`;
  - niente prezzi, niente urgenza finta, mai confronti;
  - solo dati demo: Luca, Marco R, Anna, Teo/Matteo, Ferro Street, Barra Alta.
- **Didascalia:** al massimo 5 hashtag (`#streetlifting #calisthenics #weightedcalisthenics #coach` più uno). Chiusura con «Seguici per non perdere l'anteprima gratuita.».
- **Metricool:** brand `8059629`, fuso `Europe/Rome`. Solo bozze (`draft: true`), `instagramData.type: "REEL"`, `isAiGenerated: false`. URL dei file `raw.githubusercontent.com/nardy18/talyon-social/<SHA>/…`. Non si toccano altri post.
- **Calendario:** martedì 18:30 carosello, mercoledì 18:30 reel, giovedì 9:00 carosello.
- **Repository pubblico:** mai dati dell'app.
- **Commit:** il messaggio termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_01AkVL8UTymcJa1aMPA9h49k`.
- **Messaggi a Emanuele:** in italiano, frasi brevi, niente gergo tecnico.

## Punti da sorvegliare

1. **Un titolo che esce dall'area sicura** perché la larghezza dipende dalle lettere, non solo dal loro numero. Il controllo delle aree deve segnalarlo; test `test_titolo_lungo_segnalato` nel Task 2.
2. **Il mercoledì già occupato** da un reel programmato o in bozza (Reel 1 il 18, Reel 2 il 25, R03 il 2 dicembre). Lo spazio libero va calcolato su tutti i post; test `test_mercoledi_occupato` nel Task 9.
3. **Il giro del sabato senza Node né cache del font.** Pagina, font e video del simbolo devono venire solo dal repository; test `test_pagina_senza_node` nel Task 1.
4. **Volume fuori misura** con una variante di musica diversa da quella provata. Test `test_volume_varianti` nel Task 7, su tutte e 4 le varianti.
5. **Un copione con una funzione non elencata** o un dato inventato. Il validatore accetta solo le funzioni di `blocchi.json` e i nomi demo; test `test_funzione_sconosciuta` nel Task 1.

---

### Task 1: struttura del kit, pagina e copione

**File:**
- Crea `kit/reel/motore/harness.js`, `sound.js` e `core.js` (copie di `harness.js`, `sound.js` e `reel-core.js` del Reel 2).
- Crea `kit/reel/risorse/saira.woff2` (da `build/saira.b64`) e `kit/reel/risorse/simbolo.mp4`: i 120 fotogrammi di `build/clip30/` in H.264 CRF 12, 30 fps, 1080×1920.
- Crea `kit/reel/blocchi.json`, `kit/reel/strumenti/reel.py` e `kit/reel/strumenti/test_copione.py`.
- Crea `kit/reel/prove/minimo.json`, un copione di prova con solo blocchi generici.

**Interfacce prodotte:**
- `reel.py valida <copione.json>`: esce con 0 se il copione è valido, con 2 se ci sono errori, uno per riga.
- `valida_copione(c: dict) -> list[str]`.
- `pagina(copione: dict, clip: str) -> str`: HTML autosufficiente.
- `apri(copione_path, clip='chiave'|'tutti') -> (browser, page)`: la pagina espone `window.TALYON`.
  - In questo task `TALYON.disegna(ctx, t)` disegna solo palco e finitura. Le altre parti si aggiungono nei task successivi: `controllaAree` nel Task 2, `piano` nel Task 3, la regia completa di `disegna` nel Task 4, `scoreSound` nel Task 7.
- `blocchi.json`: `{"funzioni": [...], "scene_gancio": [...], "blocchi": {nome: {"camera": "pannelli|telefono|telefoni", "durata": s, "dati": [campi obbligatori]}}}`.
- Copione:
  - `n`, `slug`, `titolo`;
  - `funzione` (una di `blocchi.json`), `palco` (`grafite|verde`), `musica` (0–3);
  - `gancio {scena, righe[2..3]}` e `promessa [2..3 righe]`;
  - `momenti [3..4] {titolo[2], blocco, dati}`;
  - `culmine {titolo[2], blocco, dati}`;
  - `didascalia`, `alt`.

- [ ] **Passo 1: scrivi i test che falliscono** (`test_copione.py`):
  - `test_minimo_valido`: `valida_copione(minimo) == []`.
  - `test_funzione_sconosciuta`: con `funzione: "progressione"` → errore che contiene `funzione`.
  - `test_righe_gancio`: con 4 righe nel gancio → errore.
  - `test_titolo_tre_righe`: con un titolo di 3 righe → errore.
  - `test_hashtag`: con 6 hashtag nella didascalia → errore.
  - `test_nome_non_demo`: con «Giuseppe» nei `dati` → errore. I nomi ammessi sono Luca, Marco R, Marco, Anna, Teo, Matteo, Ferro Street e Barra Alta.
  - `test_pagina_senza_node`: con `PATH` senza `node` e `npm`, `apri()` carica la pagina; `document.fonts.check('700 84px SairaT')` è vero; `TALYON.disegna` a t=0 non dà errori in console.
- [ ] **Passo 2:** `python3 -m unittest discover -s kit/reel/strumenti -p 'test_*.py' -v` deve fallire, perché `reel.py` non esiste.
- [ ] **Passo 3: implementa.**
  - `reel.py` con Playwright `chromium.launch()` senza percorsi fissi, come `genera.py`.
  - Il font è incorporato in base64 come `SairaT` (stretch 82%) e `SairaB` (100%).
  - I fotogrammi del simbolo si estraggono una volta in `~/.cache/talyon-reel/simbolo/` con ffmpeg (`-q:v 2`). La pagina li carica in un `<img>` per ciascuno: `clip='chiave'` carica solo il fotogramma 60, `'tutti'` tutti e 120.
- [ ] **Passo 4:** gli stessi test devono passare.
- [ ] **Passo 5:** commit «Reel: struttura del kit, pagina e copione».

### Task 2: interfaccia comune e controllo delle aree

**File:**
- Crea `kit/reel/motore/ui.js`. Unisce le parti comuni di `reel-ui.js` e `reel2-ui.js`:
  - `THEME`, `texCanvas`, `scrBg`, `rrect`, `tabBar`, `texBoot`, `texIdle`;
  - `sprite`, `drawSprite`, `glass`, `pill`;
  - le icone (`icCheck`, `icArrowR`, `icUpload`, `icMail`, `icSheet`);
  - `chipDraw`, `ripple`, `callout`, `nameTag`, `texWipeK`, `dimTex`, `fileW`, `fileDraw`.
- Modifica `core.js`: `label` e `wordsBlock` registrano il riquadro di ogni testo quando `window.__AREE` è un array.
- Test: `kit/reel/strumenti/test_aree.py`.

**Interfacce prodotte:** `TALYON.controllaAree(tempi: number[]) -> [{t, testo, box: [x0, y0, x1, y1]}]`. Restituisce i testi fuori da `SAFE`, chiusura esclusa.

- [ ] **Passo 1: scrivi i test.**
  - `test_minimo_aree_pulite`: nessun testo fuori area nei fotogrammi chiave di `minimo.json`.
  - `test_titolo_lungo_segnalato`: con il titolo «Scrivi la settimana intera come in palestra» → almeno un elemento con quel testo.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3: implementa** registro dei riquadri e `controllaAree`. Per ogni tempo: disegno su un canvas fuori schermo, poi confronto dei riquadri con `SAFE`.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** commit.

### Task 3: il modello (linea del tempo dal copione)

**File:**
- Crea `kit/reel/motore/modello.js`.
- Test: `kit/reel/strumenti/test_modello.py`, che valuta `TALYON.piano` nella pagina.

**Interfacce:**
- Usa: `blocchi.json` (incorporato nella pagina come `BLOCCHI`).
- Produce `piano(copione) -> {durata, sezioni, camera, eventi, colpo, battute, fotogrammiChiave}`:
  - `sezioni: [{tipo: 'gancio'|'logo'|'momento'|'culmine'|'chiusura', t0, t1, i}]`;
  - `camera`: chiavi `{t, cx, cy, s, yaw, pitch}`;
  - `eventi: [{t, tipo, pan}]` con tipo `parola|fruscio|tocco|ok|conta|colpo|passaggio`;
  - `colpo`: tempo del colpo del culmine;
  - `battute`: tempi d'inizio di ogni battuta;
  - `fotogrammiChiave`: un tempo per sezione, per il foglio di controllo.

**Valori fissati dalla spec:**
- gancio da 0 a 2,85 s; logo e promessa da 2,8 a 6,25 s;
- poi i momenti, ciascuno della durata del suo blocco, con 0,6 s di passaggio;
- il culmine dura almeno 3,5 s;
- la chiusura sono gli ultimi 4,0 s;
- il drop musicale cade a 3,0 s.

- [ ] **Passo 1: scrivi i test.**
  - `test_durata`: `30 <= piano(minimo).durata <= 36`.
  - `test_ordine`: le sezioni sono in ordine, senza buchi né sovrapposizioni oltre 0,6 s.
  - `test_colpo_in_battere`: `colpo` è in `battute` e cade almeno 1,0 s dopo l'inizio del culmine.
  - `test_chiusura`: `sezioni[-1].tipo == 'chiusura'` e dura 4,0 s.
  - `test_momenti_minimi`: ogni momento dura almeno 4,5 s.
  - `test_quattro_momenti`: con 4 momenti la durata resta ≤ 36, accorciando i blocchi fino al minimo di 4,5 s.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3: implementa.**
  - Le battute partono da 3,0 s e durano 2 s.
  - La battuta che contiene il colpo si allunga di un battito (0,5 s), come la battuta da 5/4 del Reel 2, così il colpo cade sul battere.
  - La pausa musicale va da `colpo − 1,0` a `colpo`.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** commit.

### Task 4: blocchi generici e regia

**File:**
- Crea `kit/reel/motore/blocchi.js` e `kit/reel/motore/regia.js`.
- `regia.js` contiene `disegna(ctx, t)`. Compone palco, camera, telefoni, blocchi, titoli e finitura in base al `piano`, con la chiusura del Reel 2 (passata di luce e video del simbolo).

**Scene del gancio:**
- `fogli`: fogli in prospettiva e file che arrivano, dal Reel 2;
- `notifiche`: telefono scuro con notifiche che si accumulano;
- `griglia`: griglia di una scheda in prospettiva;
- `cronometro`: quadrante con i secondi.

**Blocchi generici:**
- `pannello-righe`: vetro con intestazione e 3–4 righe;
- `elenco-contatore`: contatore e righe con stato, dal Reel 2;
- `scheda-conferma`: titolo, due righe e un pulsante con tocco, poi «Confermata» in salvia;
- `numero`: numero grande con alone, zoom e riflesso, per il culmine;
- `telefono-schermata`: telefono in primo piano con passaggio da una texture a un'altra;
- `tre-telefoni`: tre telefoni con schede che volano e nomi sopra.

**Interfacce:**
- Ogni blocco è `BLOCCHI_JS[nome] = {disegna(x, tl, d, piano), eventi(d) -> [{t, tipo, pan}]}`.
  - `tl` è il tempo locale da 0 alla durata del blocco.
  - `d` sono i `dati` del copione.
- La camera di ogni blocco viene da `blocchi.json`.
- Varietà:
  - `palco: 'verde'` usa `stage(..., {green: 1})`;
  - i titoli sono in alto a sinistra (`HX = 80`, `HY = 372`, 84 px) come nel Reel 2;
  - la promessa è centrata a 92 px.
- Tutto è deterministico: nessun `Math.random`, solo `H.rng(seme)`.

- [ ] **Passo 1: scrivi i test** (`test_regia.py`):
  - `test_nessun_errore`: `disegna` a ogni secondo di `minimo.json` senza errori in console.
  - `test_deterministico`: lo stesso tempo, disegnato due volte, dà gli stessi pixel (hash del PNG).
  - `test_aree`: `controllaAree(piano.fotogrammiChiave)` restituisce un elenco vuoto.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3: implementa**, riusando il codice delle scene del Reel 1 e del Reel 2.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5: controllo a vista.**
  - Esegui `reel.py controlla kit/reel/prove/minimo.json`: crea `controllo.jpg` (un fotogramma al secondo) e `chiave/` (un fotogramma per sezione a grandezza piena).
  - Guardali tutti. Cerca testi tagliati, sovrapposizioni, vuoti, testi piccoli e zone coperte.
  - Correggi finché sono puliti.
- [ ] **Passo 6:** commit.

### Task 5: schermate R03–R06

**File:**
- Crea `kit/reel/motore/schermate.js` e aggiorna `blocchi.json` e `blocchi.js`.
- Crea i copioni di prova `kit/reel/prove/r03.json` … `r06.json`.

**Blocchi:**
- R03: `builder-griglia` (griglia della scheda con serie, ripetizioni, RPE e carico; cursore che scrive), `duplica-settimana` (settimane 1 → 2, 3, 4) e `assegna-modello` (modello «Forza · 4 settimane» assegnato a 3 atleti).
- R04: `sessione-serie` (scheda del giorno sul telefono, serie già compilate, un tocco su ogni serie), `recupero` (anello del recupero che parte da solo) e `senza-rete` (icona senza rete, serie salvate lo stesso).
- R05: `seguire-lista` (Atleti da seguire, con motivo e ultimo allenamento; dal pannello P6 del Reel 1).
- R06: `celle-coach` (griglia con celle «più difficile» e «più facile», con colore, icona e parola; dal pannello P5 del Reel 1) e `cella-prescritto` (cella toccata che mostra il prescritto).

**Dati demo:** solo nomi e numeri ammessi. Luca ha i massimali trazione +65, dip +90, muscle-up +20 e squat 170; i carichi dei momenti stanno sotto questi massimali.

- [ ] **Passo 1: scrivi i test.** `test_r03_r06`: per ogni copione, `valida_copione` dà `[]`, `controllaAree(fotogrammiChiave)` dà `[]` e non ci sono errori in console.
- [ ] **Passo 2:** il test deve fallire, perché i blocchi non esistono.
- [ ] **Passo 3:** implementa le schermate e i blocchi.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** controllo a vista con `reel.py controlla` su tutti e quattro i copioni.
- [ ] **Passo 6:** commit.

### Task 6: schermate R07–R10

**File:** come il Task 5, con i copioni `r07.json` … `r10.json`.

**Blocchi:**
- R07: `record-proposto` (l'atleta propone trazione +67,5 «nuovo») e `record-confermato` (il coach conferma; la stima resta segnata come stima).
- R08: `invito-qr` (link e QR della palestra Ferro Street) e `richiesta-accetta` (richiesta di Marco R, il tocco del coach, poi la scheda pronta; riusa `texInvite` e `texWeek` del Reel 2).
- R09: `nota-coach` (la nota del coach sulla scheda dell'esercizio, in evidenza sul telefono dell'atleta).
- R10: `emom-minuto` (EMOM con il minuto che scorre e il segnale a ogni minuto).

Il QR è un disegno stilizzato, non leggibile, e non punta a nessun indirizzo.

- [ ] **Passo 1: scrivi i test.** `test_r07_r10`: gli stessi controlli del Task 5.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3:** implementa.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** controllo a vista.
- [ ] **Passo 6:** commit.

### Task 7: musica ed effetti dal piano

**File:**
- Crea `kit/reel/motore/musica.js` e `kit/reel/motore/effetti.js`.
- Aggiungi `audio` a `reel.py`.
- Test: `kit/reel/strumenti/test_audio.py`.

**Interfacce:**
- `scoreSound(k)` legge `piano` e `copione.musica`.
- `reel.py audio <copione> <out.wav>`:
  - registra con `SOUND.renderOffline` a 48 kHz;
  - misura con `ffmpeg -af ebur128=peak=true`;
  - applica `highpass=f=28,lowshelf=f=70:g=-2.5:t=s:w=0.7,volume=<G>dB,alimiter=limit=0.78:attack=3:release=90:asc=1:level=0`;
  - G parte da `−14 − I_grezzo + 0,3` e si corregge una volta.
  - Poi compensa i 143 campioni di ritardo del limitatore e porta la durata esatta a `piano.durata`.

**Varianti di musica:** stessi strumenti del Reel 2, 120 BPM.

| Variante | Tonalità | Giro |
|---|---|---|
| 0 | Re | Re, Si m, Sol, La |
| 1 | Mi | Mi, Si, Do# m, La |
| 2 | La | Fa# m, Re, La, Mi |
| 3 | Fa | Si♭, Fa, Do, Re m |

**Struttura della musica:**
- inizio filtrato fino a 3,0 s;
- musica piena dal drop;
- a 0,8 sotto le sezioni `momento`;
- pausa da `colpo − 1,0` a `colpo`, poi `crash`, `swell` e accordo pieno sul colpo;
- passata di luce all'inizio della chiusura e accordo risolto 1,5 s dopo.

Gli effetti si generano da `piano.eventi`, con le stesse ricette del Reel 2.

- [ ] **Passo 1: scrivi i test.**
  - `test_colpo_suonato`: con un kit finto che registra le chiamate, c'è un `crash` a `piano.colpo` ± 0,01 s.
  - `test_volume_varianti`: per le varianti 0–3 su `minimo.json`, il master è a −14 ± 0,5 LUFS con picco vero ≤ −1,0 dB, e la durata è uguale a `piano.durata` ± 1 campione.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3:** implementa.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** commit.

### Task 8: video, copertina e controllo finale

**File:**
- Aggiungi a `reel.py` i comandi `video` e `copertina`.
- Test: `kit/reel/strumenti/test_video.py`.

**Interfacce:** `reel.py video <cartella del reel>` legge `copione.json` e scrive nella cartella:
- `talyon-reelNN.mp4`;
- `copertina.jpg` (fotogramma di fine promessa, 6,0 s, JPG qualità 96);
- `controllo.jpg`.

Il render va a parti, una per sezione:
- fotogrammi JPEG q92 dal canvas, mandati a ffmpeg;
- ogni parte si scrive in `*.tmp.mp4` e si rinomina quando ffmpeg esce con 0;
- concat con `-c copy`;
- audio con `-c:v copy -c:a aac -b:a 192k -movflags +faststart`.

Alla fine il controllo con ffprobe stampa una riga di riepilogo ed esce con 2 se qualcosa non va:
- 1080×1920, 30/1, `yuv420p`, `bt709`;
- numero di fotogrammi `round(durata*30)`;
- audio presente;
- −14 ± 0,5 LUFS, picco ≤ −1,0;
- file sotto i 30 MB.

- [ ] **Passo 1: scrivi il test.** `test_video_breve`: `reel.py video` su `minimo.json` con `--fino 7` (rende solo i primi 7 s). Il file deve avere 210 fotogrammi, 1080×1920, 30 fps e audio di 7,0 s.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3:** implementa.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** commit.

### Task 9: calendario, dati e giro del sabato

**File:**
- Crea `kit/spazi.py`, `kit/test_spazi.py` e `kit/risultati.md` (tabella vuota con le colonne).
- Crea `reel/temi.md`, con R03–R10 «da fare» e gli stessi stati dei caroselli.
- Modifica `kit/LEGGIMI.md` (passi nuovi, sotto) e `kit/temi.md` (togli C09 e C12, con una nota).

**Interfacce:**
- `spazi.py prossimo <carosello|reel> <oggi AAAA-MM-GG> <post.json> [<temi.md>]` stampa la data e l'ora ISO del prossimo spazio libero ad almeno 3 giorni:
  - caroselli: martedì 18:30 e giovedì 9:00;
  - reel: mercoledì 18:30.
- Uno spazio è occupato se in `post.json` (output di `getScheduledPosts`, bozze comprese) c'è un post dello stesso tipo a quella data, oppure se `temi.md` ha una riga con quella data.

**Passi nuovi in `kit/LEGGIMI.md`:**
- **Dati:** `getAnalyticsDataByMetrics` con IGPO02, IGPO04, IGPO14, IGPO15, IGPO27, IGPO28, IGPO29 (caroselli) e IGRE02, IGRE04, IGRE11, IGRE12, IGRE21, IGRE23, IGRE24, IGRE30 (reel). Si aggiunge una riga per ogni post con almeno 3 giorni e non ancora registrato.
- **Giorni:** si comincia dopo 12 post registrati; al massimo una proposta al mese; si applica solo dopo il sì di Emanuele.
- **Reel:** i passi della spec, con `reel.py valida`, `controlla` e `video`, e la bozza REEL con `videoThumbnailUrl`.
- **Messaggio:** un solo messaggio per tre post. Approvazioni «ok», «ok ai caroselli», «ok al reel», «ok al primo» e «ok al secondo».
- **Se il reel fallisce:** i caroselli escono lo stesso.
- **Temi nuovi dei reel:** quando ne restano meno di 3, il giro ne propone 4.

- [ ] **Passo 1: scrivi i test** (`test_spazi.py`), con le date reali:
  - `test_mercoledi_occupato`: oggi 2026-11-21, con post REEL il 25 novembre (bozza) e il 2 dicembre → reel `2026-12-09T18:30`.
  - `test_carosello`: oggi 2026-11-14, con C05 martedì 17 → carosello `2026-11-19T09:00`.
  - `test_tre_giorni`: oggi 2026-11-15 (domenica) e nessun post → reel `2026-11-18T18:30`.
- [ ] **Passo 2:** il test deve fallire.
- [ ] **Passo 3:** implementa `spazi.py` e aggiorna i documenti.
- [ ] **Passo 4:** il test deve passare.
- [ ] **Passo 5:** commit e push, con l'ok già dato da Emanuele sul progetto.

### Task 10: Reel 2 in bozza e prova del modello con il R03

**File:**
- Crea `reel/R02-dal-foglio/`: video, copertina e didascalia già consegnati.
- Crea `reel/R03-domenica-sera/copione.json` e le uscite di `reel.py video`.
- Aggiorna `reel/temi.md`.

- [ ] **Passo 1: Reel 2.**
  - Commit e push di `reel/R02-dal-foglio/`.
  - Con `spazi.py` verifica che mercoledì 25 novembre alle 18:30 sia libero.
  - Crea la bozza REEL con gli URL fissati allo SHA del commit e `getScheduledPosts` per controllarla.
- [ ] **Passo 2: R03.**
  - Scrivi il copione da `reel/temi.md` e passalo a `reel.py valida`.
  - `reel.py controlla`: guarda tutto e correggi.
  - `reel.py video`: guarda `controllo.jpg` e 5 fotogrammi del video finito.
- [ ] **Passo 3: salva su GitHub e crea la bozza.** Commit e push, poi la bozza REEL per mercoledì 2 dicembre alle 18:30.
- [ ] **Passo 4: messaggio a Emanuele** (SendUserFile e SendUserMessage). Contiene il R03 da approvare e la bozza del Reel 2 da approvare, con le date.

### Task 11: attività programmata e documenti

- [ ] **Passo 1: aggiorna l'attività** `trig_01BjUMMqhaDoZBCCt2yMUEcb` con `update_trigger`.
  - Nome: «Post Talyon della settimana».
  - Il prompt dice: due caroselli e un reel, segui `kit/LEGGIMI.md`, le regole di sempre, il reel solo come bozza.
  - Restano invariati: orario (sabato alle 9:45), connettori e notifiche.
- [ ] **Passo 2:** aggiorna `claude/caroselli-automatici.md` e `claude/reel-automatici.md` nel progetto, con lo stato «in funzione da sabato 21 novembre».
- [ ] **Passo 3: verifica finale.**
  - Esegui tutti i test.
  - `list_triggers` per controllare il prompt nuovo e la prossima esecuzione (21 novembre, 8:45 UTC).
  - `getScheduledPosts` per controllare le bozze.
- [ ] **Passo 4: messaggio a Emanuele.** Una riga su cosa arriverà sabato 21.
