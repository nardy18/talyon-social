# Temi dei reel

Un reel a settimana: **mercoledì alle 18:30** (ora italiana), tra i due caroselli del lunedì e del venerdì. Numero dispari = palco **verde**, numero pari = **grafite**. Musica: variante `(N + 1) % 4`. La scena del gancio cambia da un reel a quello dopo.

Stati, come per i caroselli: `da fare` → `in bozza` (in Metricool, aspetta l'ok di Emanuele) → `programmato` (ok ricevuto) → `pubblicato`; oppure `saltato`.
L'attività del sabato prende sempre il **primo tema «da fare»** dall'alto. Per R04–R10 il copione è già pronto e controllato in `kit/reel/prove/rNN.json`: si parte da lì. I reel mostrano Talyon al lavoro (un momento della settimana di un coach o di un atleta, una funzione per reel); i caroselli insegnano.

**Fuori serie:** le righe con N che inizia per `S` sono reel fatti a mano, fuori dal modello. Occupano il loro mercoledì, non cambiano palco, musica e gancio dei reel numerati, e l'attività del sabato non li tocca.

| N | Palco | Tema | Cosa mostra | Funzione | Gancio | Stato | Data | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | — | Reel di lancio | scrivi la scheda, l'atleta la segue, tu vedi tutto | tutte | notifiche | programmato | mer 18 nov 2026 | fatto a mano |
| 2 | — | Dal foglio a Talyon | import da Google Fogli, Excel e Google Drive: Talyon le legge, tu approvi | import | fogli | programmato | mer 25 nov 2026 | fatto a mano, in `reel/R02-dal-foglio/`; risulta programmato in Metricool (visto il 21 nov) |
| S1 | — | Scrivania del coach | la scrivania di un coach: il portatile si accende, builder e nota, revisione e Atleti da seguire, poi si chiude | builder, revisione, seguire | scrivania | programmato | mer 2 dic 2026 | fuori serie, fatto a mano, in `reel/S01-scrivania/`; riprese generate con l'IA (eccezione voluta da Emanuele), etichetta IA accesa in Metricool |
| 3 | verde | Domenica sera, venti schede | la settimana scritta dal computer, duplicata e assegnata da un modello | builder | griglia | in bozza | mer 9 dic 2026 | prova del modello, in `reel/R03-domenica-sera/`; spostato di una settimana per fare posto alla scrivania (scelta di Emanuele) |
| 4 | grafite | Palestra senza campo | l'allenamento sul telefono dell'atleta: serie già compilate, un tocco, recupero che parte da solo, anche senza rete | sessione | cronometro | in bozza | mer 16 dic 2026 | in `reel/R04-palestra-senza-campo/` |
| 5 | verde | Lunedì mattina, chi seguire | Atleti da seguire: chi non si allena, chi fatica, la scheda in scadenza | seguire | notifiche | da fare | | |
| 6 | grafite | Più difficile, più facile | ogni serie colorata rispetto a quella scritta; tocchi la cella e rivedi il prescritto | celle | fogli | da fare | | |
| 7 | verde | Il record lo confermi tu | l'atleta propone, il coach conferma; record e stima restano separati | record | notifiche | da fare | | |
| 8 | grafite | Dal link alla prima scheda | link e QR della palestra, la richiesta, il sì del coach, la scheda pronta | inviti | fogli | da fare | | |
| 9 | verde | La nota che si vede | la nota del coach sull'esercizio, in evidenza nell'app dell'atleta | note | griglia | da fare | | |
| 10 | grafite | Il minuto che suona | l'EMOM con il segnale a ogni minuto | emom | cronometro | da fare | | |
