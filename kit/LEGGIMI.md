# Post Talyon: istruzioni per l'attività settimanale

Questo file è per Claude. Ogni sabato un'attività programmata prepara i post Instagram della settimana per @talyon.app: **due caroselli** (martedì alle 18:30 e giovedì alle 9:00) e **un reel** (mercoledì alle 18:30). Li mette in **bozza** su Metricool e chiede l'ok a Emanuele con un solo messaggio. **Non si pubblica mai niente senza il suo ok.**

Il reel entra nel giro **da sabato 21 novembre 2026**: prima di quel giorno salta i passi del reel (6) e prepara solo i caroselli.

Emanuele scrive in italiano e vuole frasi brevi e semplici: capisce poco di codice. Ai messaggi per lui niente gergo tecnico (niente «repo», «commit», «SHA», «API»).

## I passi, in ordine

1. **Ambiente.** Il repository `nardy18/talyon-social` deve essere nella sessione con permesso di scrittura (strumento `add_repo`, access `push`) e clonato. Lavora dentro la sua cartella.
   Per il reel serve anche ffmpeg (`ffmpeg -version`); il browser è lo stesso del generatore dei caroselli. Se mancano e non si installano, i caroselli escono lo stesso, il reel no, e il messaggio lo dice.
2. **Bozze in sospeso e post in calendario.** Leggi `kit/temi.md` e `reel/temi.md`. Se un post è ancora `in bozza` e la sua data è passata o manca meno di 2 giorni, ricordalo a Emanuele nel messaggio finale (non ripubblicarlo, non cancellarlo).
   Poi salva la risposta di `getScheduledPosts` (brand `8059629`, fuso `Europe/Rome`, da oggi a 60 giorni, comprese le bozze) in `/tmp/post.json`: serve per le date dei caroselli (passo 5) e del reel (passo 6), anche quando non ci sono caroselli da fare.
3. **Dati.** `getAnalyticsDataByMetrics` (brand `8059629`, fuso `Europe/Rome`, ultimi 30 giorni):
   - caroselli, rete `instagram`, connettore `posts`: IGPO02 (data e ora), IGPO04 (id), IGPO14 (copertura), IGPO15 (salvataggi), IGPO27 (condivisioni), IGPO28 (visualizzazioni), IGPO29 (nuovi follower);
   - reel, connettore `reels`: IGRE02 (data e ora), IGRE04 (id), IGRE11 (copertura), IGRE12 (salvataggi), IGRE21 (condivisioni), IGRE23 (visualizzazioni), IGRE24 (durata media guardata), IGRE30 (chi scorre via nei primi 3 secondi).
   Per ogni post uscito da almeno 3 giorni e non ancora registrato aggiungi una riga in fondo a `kit/risultati.md` (titolo e numero da `kit/temi.md` o `reel/temi.md`, confrontando data e ora). Le impression non si usano più: al loro posto ci sono le visualizzazioni.
4. **Giorni.** Si comincia quando `kit/risultati.md` ha almeno **12 post**. Confronta i tre spazi tra loro e con le ore di maggiore attività del pubblico (`getBestTimeToPostByNetwork`, rete `instagram`). Se un altro giorno o un'altra ora è chiaramente migliore, proponilo nel messaggio: **al massimo una proposta al mese**, e si applica solo dopo il sì di Emanuele (allora aggiorna gli spazi in `kit/spazi.py`, in questo file e in `kit/temi.md` o `reel/temi.md`).
5. **Caroselli.** Prendi i primi due temi `da fare` in `kit/temi.md`. Se ne resta uno solo, fai quello; se non ce ne sono più, non creare caroselli. Quando ne restano meno di 4, proponi a Emanuele 6 temi nuovi nel messaggio finale (stesso stile della tabella).
   - **Date:** con `/tmp/post.json` del passo 2 lancia `python3 kit/spazi.py prossimo carosello <oggi AAAA-MM-GG> /tmp/post.json kit/temi.md --quanti 2`: sono i due spazi (martedì 18:30 e giovedì 9:00, almeno 3 giorni dopo oggi, liberi). Il primo tema va nella data più vicina.
   - Poi, per ogni carosello, uno dopo l'altro, i passi da 5a a 5f.
   - **5a. Scrivi il carosello** in `caroselli/CNN-slug/carosello.html` (NN a due cifre, slug corto in minuscolo con trattini, es. `C06-opener`). Parti da una copia di `caroselli/C05-la-tua-palestra/carosello.html` e rispetta le regole qui sotto. 8 slide: copertina, 6 slide di contenuto o di solo testo, chiusura.
   - **5b. Genera:** `python3 kit/genera.py caroselli/CNN-slug/carosello.html`. Se stampa elementi fuori dall'area, correggi e rigenera finché esce pulito. Poi **guarda tutte le slide** (strumento Read sui JPG, una per una): testi tagliati, sovrapposizioni, parole sole a capo, visual troppo vuoti o troppo pieni, contrasto. Correggi e rigenera. Questo controllo è obbligatorio.
   - **5c. Didascalia e alt.** Scrivi `didascalia.txt` (regole sotto) e `alt.txt` (una riga per slide, descrizione semplice per chi non vede l'immagine).
   - **5d. Salva su GitHub.** `git add` della cartella del carosello (non `pagina.html`, è ignorata) e commit su `main`, poi push. Annota lo SHA del commit (`git rev-parse HEAD`).
   - **5e. Bozza in Metricool** con `createScheduledPost` (dettagli sotto). Gli URL delle immagini usano lo SHA del commit, così non cambiano mai: `https://raw.githubusercontent.com/nardy18/talyon-social/<SHA>/caroselli/CNN-slug/slide-01.jpg` … `slide-08.jpg`.
   - **5f. Aggiorna `kit/temi.md`:** stato `in bozza`, data. Commit e push. Se hai lo strumento Projects (progetto Talyon), aggiungi il carosello in fondo a `claude/caroselli-instagram.md` (titolo, sfondo, una riga per slide), leggendo prima il documento e riscrivendolo intero.
6. **Reel** (da sabato 21 novembre 2026). Se uno di questi passi fallisce, vedi «Se il reel non viene bene» più sotto: i caroselli escono lo stesso. Le correzioni hanno un limite: **al massimo 3 giri** in tutto tra 6c, 6d e 6e (ogni giro di `controlla` e `video` dura qualche minuto). Se dopo il terzo giro il reel non va ancora, fermati e applica «Se il reel non viene bene».
   - **6a. Tema e data.** Il primo tema `da fare` in `reel/temi.md`. La data: `python3 kit/spazi.py prossimo reel <oggi> /tmp/post.json reel/temi.md`, con `/tmp/post.json` del passo 2 (il primo mercoledì alle 18:30 libero, almeno 3 giorni dopo oggi). Se non ci sono temi `da fare`, niente reel.
   - **6b. Copione** in `reel/RNN-slug/copione.json` (NN a due cifre, es. `R04-palestra-senza-campo`). Se esiste `kit/reel/prove/rNN.json` parti da quello (è già scritto e controllato); altrimenti scrivilo con le «Regole dei reel» qui sotto, partendo da un copione già fatto.
   - **6c. Valida:** `python3 kit/reel/strumenti/reel.py valida reel/RNN-slug/copione.json`. Correggi finché stampa «copione valido», dentro il limite dei 3 giri.
   - **6d. Controlla:** `python3 kit/reel/strumenti/reel.py controlla reel/RNN-slug/copione.json`. Deve finire pulito: nessun testo fuori area, nessun testo che esce dal suo riquadro o dalla schermata del telefono, che ne copre un altro o che non entra nel suo spazio, nessun errore. Poi **guarda** `controllo.jpg` (un fotogramma al secondo) e i fotogrammi chiave a grandezza piena, nella cartella che il comando stampa: testi tagliati o sovrapposti, zone coperte da Instagram, parole troppo piccole, schermate vuote. Correggi il copione e ripeti, dentro il limite dei 3 giri. Questo controllo è obbligatorio.
   - **6e. Video:** `python3 kit/reel/strumenti/reel.py video reel/RNN-slug` (3–5 minuti). Crea `talyon-reelNN.mp4`, `copertina.jpg`, `controllo.jpg` e `didascalia.txt` ed esce con 0 solo se formato, fotogrammi, audio, volume (−14 LUFS), picco e peso vanno bene. Poi guarda `copertina.jpg` e almeno 5 fotogrammi del video finito (es. `ffmpeg -ss 12 -i talyon-reelNN.mp4 -frames:v 1 f12.jpg`), compreso il culmine e la chiusura.
   - **6f. Salva su GitHub:** `git add reel/RNN-slug` e commit su `main`, push, SHA.
   - **6g. Bozza REEL in Metricool** (dettagli sotto), con il video e la copertina allo SHA del commit e il testo di `didascalia.txt`. Controlla con `getScheduledPosts` che la bozza ci sia, con la data giusta.
   - **6h. Aggiorna `reel/temi.md`:** stato `in bozza`, data. Commit e push.
7. **Un solo messaggio per tutti e tre i post** (modello sotto): per ogni carosello invia `anteprima.jpg` e le 8 slide, per il reel il video e la copertina, tutto con `SendUserFile` (status `proactive`); poi un solo messaggio con `SendUserMessage`.
8. **Se Emanuele risponde in questa chat:**
   - «ok» (o simile) vale per tutti e tre. Si può approvare anche solo una parte: «ok ai caroselli», «ok al reel», «ok al primo», «ok al secondo». Per ogni post approvato: `getScheduledPosts` per trovare `id` e `uuid` della bozza, poi `updateScheduledPost` con lo stesso contenuto (gli URL dei file come li restituisce `getScheduledPosts`) e `draft: false`. Stato `programmato` in `kit/temi.md` o `reel/temi.md`, commit e push. Conferma con una frase.
   - Correzioni: modifica, rigenera, ricontrolla (per il reel rifai `controlla` e `video`, sempre con al massimo 3 giri: se non basta, dillo a Emanuele e lascia la bozza com'è), commit e push, poi `updateScheduledPost` con i nuovi URL (nuovo SHA) e il resto invariato. Rimanda l'anteprima o il video.
   - «no» o «salta»: lascia la bozza così, segna `saltato` e chiedi se cancellarla da Metricool (cancella solo se lo dice lui).
9. **Temi nuovi dei reel.** Quando in `reel/temi.md` restano meno di 3 temi `da fare`, proponi a Emanuele 4 temi nuovi nel messaggio (stesso stile della tabella). Usa solo funzioni dell'elenco «Esistono» e blocchi già nel modello (`kit/reel/blocchi.json`); se un tema ha bisogno di una schermata nuova, scrivilo.

## Regole dei contenuti

- **Per chi:** coach di streetlifting e calisthenics zavorrato in Italia. Italiano, del tu, da coach a coach.
- **Tono:** racconto evocativo ma concreto. Niente gergo da software (SaaS, dashboard, workflow, algoritmo, funzionalità). Sì al lessico di palestra (RPE, RIR, top single, back-off, opener, zavorra, ramping).
- **Filtro:** un coach lo manderebbe a un altro coach o a un suo atleta? Prima il valore pratico, poi il prodotto. Nei temi di programmazione Talyon compare al massimo in 1–2 slide e nella chiusura.
- **Struttura:** slide 1 = promessa chiara del tema in parole semplici; slide 2–7 = un'idea per slide; slide 8 = chiusura con l'invito «Seguici per non perdere l'anteprima gratuita.» (finché Emanuele non dice che l'anteprima è aperta a tutti).
- **Lunghezze:** titolo al massimo 2 righe (circa 8 parole); testo al massimo 3 righe (circa 30 parole), con la frase chiave in `<b>`.
- **Prodotto:** nomina solo le funzioni dell'elenco «Esistono». Mai una funzione «In arrivo» come se ci fosse già.
- **Prezzi e offerte:** non nominarli, salvo che il tema lo richieda e Emanuele l'abbia chiesto. Mai «gratis» se qualcosa si paga, mai urgenza finta («ultimi posti», conti alla rovescia), mai «solo per chi commenta».
- **Dati:** solo dati demo: Luca (−80 kg, massimali muscle-up +20, trazione +65, dip +90, squat 170, totale 345 kg); Marco R, Anna, Teo; palestre inventate «Ferro Street» (nero e giallo) e «Barra Alta» (chiaro e blu). Mai dati veri di atleti o palestre, mai Oplitia.
- **Sempre in positivo:** racconta cosa fa Talyon, mai cosa non fa. Niente frasi che suonano come una giustificazione o un confronto implicito con un concorrente (es. «non pubblichiamo un'app diversa per ogni coach»). Indicazione di Emanuele sul C05.
- **Concorrenti:** mai nominarli né denigrarli. Il confronto con i fogli resta sui fatti («importa il tuo foglio» sì, «i fogli sono un disastro» no).
- **Regole di gara, formule, numeri, date:** solo se verificati su fonte ufficiale (es. regolamento FinalRep, final-rep.com). Se non sei sicuro, scrivi in modo generale o passa al tema dopo e dillo a Emanuele.
- **Immagini:** niente persone, voci o volti generati con l'IA; niente prima e dopo del corpo; niente fisici in primo piano. Si mostrano schede, carichi, schermate stilizzate.
- **Didascalia:** prima riga con il tema e le parole che i coach cercano («App per coach di streetlifting e calisthenics: …»); 2–3 frasi; l'invito; **al massimo 5 hashtag** (di base `#streetlifting #calisthenics #weightedcalisthenics #coach` più uno sul tema).

## Regole grafiche

- Formato 1080×1350 (4:5). La cornice (grana, angolari in rame, logotipo, contatore, piede) la aggiunge `kit/cornice.js`: non va scritta a mano.
- `<carosello sfondo="verde|grafite" serie="Nome della serie">`: la serie è il nome breve che compare nel piede di ogni slide.
- Tipi di slide (`data-tipo`):
  - `copertina`: un `<div>` visual in alto (facoltativo), poi `<p class="etichetta">`, `<h1>`, `<p class="sottotitolo">`.
  - `contenuto`: `<p class="etichetta">`, `<h1>`, `<div class="visual">…</div>`, `<p class="testo">… <b>…</b></p>`.
  - `testo`: `<p class="etichetta">`, `<h1>`, `<div class="linea"></div>`, `<p class="testo">`. Per i passaggi importanti senza immagine.
  - `chiusura`: `<h1>`, `<p class="testo">`, `<p class="invito">`. Simbolo e linea in rame li aggiunge la cornice.
- Componenti pronti in `kit/stile.css`: `.card` (con `.nome` e `.dettaglio`), `.pila`, `.pannello` (con `.intestazione`), `.riga` (con `.sx`, `.piccolo`, `.valore`), `.pill.neutra|.difficile|.facile`, `.chip`/`.chips`, `.nota`, frecce `.su`/`.giu`, `.numero-grande`, `.didascalia`, `.fila`, `.colonna`, e il telefono `.telefono[data-tema="talyon|nero-giallo|chiaro-blu"]` con `.schermo`, `.app-barra`, `.app-logo`, `.app-saluto`, `.app-sotto`, `.app-card`, `.app-riga`, `.app-spunta(.fatta)`, `.app-bottone`, `.app-tab`, `.nome-tema`.
- Stili extra solo per un carosello: in un `<style>` all'inizio del suo `carosello.html`. Annotazioni con filo in rame: elemento con `data-mira="id"` che si allinea all'elemento con quell'id (vedi slide 3 del C05).
- Elementi decorativi che escono apposta dall'area (es. telefoni ruotati): attributo `data-libero` sul contenitore.
- **Rame** (#D98E4A) solo per linee, angolari, punti e dettagli: mai per testi o pulsanti.
- «Più difficile» = rosso tenue con freccia su; «più facile» = verde salvia con freccia giù. Sempre colore **e** icona e parola, mai il solo colore.
- In copertina tieni i testi importanti lontani dai bordi laterali: nella griglia del profilo Instagram la miniatura è 3:4 e taglia i lati.
- Varia i visual tra un carosello e l'altro (schede, grafici SVG semplici, liste, numeri grandi, telefoni): mai lo stesso visual in due slide di fila.

## Regole dei reel

- **Contenuti:** le stesse regole dei caroselli (funzioni che esistono, niente prezzi né urgenza finta, sempre in positivo, nessun confronto con altre app, solo dati demo). In più: niente persone, voci o volti; niente video fatti con l'IA (la chiusura usa sempre il video del simbolo, che c'è già); il reel non ripete un carosello della stessa settimana o di quella prima.
- **Struttura:** 30–36 secondi, la calcola il modello dal copione. Gancio (0–2,8 s, scena e domanda in 2–3 righe), logo e promessa (in 2–3 pezzi), 3 o 4 momenti con un titolo di 2 righe e un blocco, il culmine (il colpo della musica), la chiusura con l'invito e @talyon.app.
- **Copione** (`copione.json`): `n`, `slug`, `titolo`, `funzione`, `palco` (`verde` se N è dispari, `grafite` se è pari), `musica` (variante `(N + 1) % 4`), `gancio` (`scena` tra `fogli`, `notifiche`, `griglia`, `cronometro`, diversa dal reel prima; `righe`), `promessa`, `momenti` (3 o 4, ognuno con `titolo`, `blocco`, `dati` ed eventuale `durata` da 4,5 a 7,5 s), `culmine`, `didascalia`, `alt`. I blocchi e i loro dati sono in `kit/reel/blocchi.json`; gli esempi sono in `kit/reel/prove/`.
- **Testi:** gancio fino a circa 17 caratteri per riga, promessa circa 19, titoli dei momenti circa 21. `reel.py valida` ferma i dati che un blocco non sa disegnare (la forma di ogni dato è in `kit/reel/blocchi.json`); `reel.py controlla` segnala i testi che escono dall'area sicura (14% in alto, 35% in basso, 6% ai lati), dal loro riquadro o dalla schermata del telefono, e quelli che si coprono. I fotogrammi vanno guardati lo stesso.
- **Carichi di Luca** sempre sotto i suoi massimali (trazione +65, dip +90, muscle-up +20, squat 170), salvo un record nuovo proposto nel reel.
- **Didascalia:** come per i caroselli (prima riga «App per coach di streetlifting e calisthenics: …», 2–3 frasi, l'invito, al massimo 5 hashtag: `#streetlifting #calisthenics #weightedcalisthenics #coach #streetworkout`).
- **Musica ed effetti** si creano dal copione (niente file con diritti): non vanno scritti a mano.

## Fatti aggiornati (13 novembre 2026)

**Esistono:**
- Builder dal computer: si scrive la scheda come in palestra (ramping, top single, back-off, RPE, RIR, % 1RM, fermo, TUT, EMOM, AMRAP, superserie, riscaldamento, test); griglia con tastiera, blocchi, duplica settimana, assegna da zero o da un modello.
- Back-off a −X kg dalla top: quando l'atleta trova la top, il carico del back-off si calcola da solo.
- Note del coach sull'esercizio, in evidenza nell'app dell'atleta.
- Tenute in secondi con conto alla rovescia (front lever, planche, back lever…); EMOM con segnale a ogni minuto.
- App dell'atleta da installare sul telefono dal browser: scheda del giorno, serie già compilate, conferma con un tocco, recupero che parte da solo, funziona anche senza rete.
- Vista del coach: ogni serie si colora «più difficile» o «più facile» rispetto alla prescrizione; toccando la cella si rivede il prescritto.
- «Atleti da seguire»: chi non si allena da giorni, chi fatica più del previsto (RPE sopra), chi ha la scheda in scadenza, chi ha un record da confermare, le richieste di iscrizione.
- Record e massimali in zavorra, con «nuovo» e «stima» (la stima è sempre segnata come stima); i record proposti dall'atleta li conferma il coach.
- Logo e colori della palestra personalizzabili al 100% (sfondi, superfici, pulsanti, dettagli; tema scuro o chiaro). È un'unica app chiamata Talyon che si colora con logo e colori della palestra (non un'app separata per ogni coach).
- Inviti: link e QR della palestra; chi lo apre chiede di entrare e il coach accetta. Anche inviti via email.
- Import delle schede da Google Fogli, Excel e Google Drive con l'IA: Talyon trova le schede, il coach controlla, corregge e approva; niente arriva agli atleti prima del suo ok.
- Funziona per palestre e per il coaching online.

**In arrivo (mai presentarle come già pronte):** calendario e prenotazioni (corsi, miniclassi, lezioni 1 to 1), confronta schede, progressione automatica, Talyon coach anche dal telefono, loop band della palestra, check-in settimanale, tentativi di gara, record da condividere nelle storie, guida per chi inizia, Apple Salute e Samsung Health, gestione di più palestre (piano Business).

**Offerta (solo se un tema lo richiede e Emanuele lo chiede):** l'anteprima è gratuita e senza carta; sconto fondatore −40% per i primi 12 mesi a chi crea la palestra durante l'anteprima e si abbona entro 60 giorni dalla fine. Prezzi previsti (indicativi): Base 19 €/mese fino a 15 atleti, Coach 29 €/mese atleti illimitati, Palestra 49 €/mese con un coach in più incluso; tutte le funzioni in tutti i piani, compresi logo e colori. Nei testi pubblici si dice la percentuale dello sconto, mai la cifra scontata.

## Metricool

- Brand `talyon.app`: `blogId` **8059629**, fuso `Europe/Rome`. Pubblica solo su `instagram` (la Pagina Facebook collegata non si usa).
- Piano gratuito: al massimo 20 post programmati al mese.
- Bozza con `createScheduledPost`: `blogId: "8059629"`, `date` con l'ora dello spazio (18:30 il martedì, 09:00 il giovedì), es. `"AAAA-MM-GGT18:30:00+01:00"` (+02:00 con l'ora legale), e `info` come stringa JSON (in `publicationDate` la stessa ora):

```json
{
  "autoPublish": true,
  "draft": true,
  "descendants": [],
  "firstCommentText": "",
  "hasNotReadNotes": false,
  "media": ["https://raw.githubusercontent.com/nardy18/talyon-social/<SHA>/caroselli/CNN-slug/slide-01.jpg", "… fino a slide-08.jpg"],
  "mediaAltText": ["riga 1 di alt.txt", "… una per slide"],
  "providers": [{"network": "instagram"}],
  "publicationDate": {"dateTime": "AAAA-MM-GGT18:30:00", "timezone": "Europe/Rome"},
  "shortener": false,
  "smartLinkData": {"ids": []},
  "text": "testo di didascalia.txt",
  "instagramData": {"type": "POST", "collaborators": [], "carouselTags": {}, "showReelOnFeed": true, "isAiGenerated": false}
}
```

- **Bozza del reel** con `createScheduledPost`: stessi campi, `date` con l'ora dello spazio (`"AAAA-MM-GGT18:30:00+01:00"`) e in `info`:

```json
{
  "autoPublish": true,
  "draft": true,
  "descendants": [],
  "firstCommentText": "",
  "hasNotReadNotes": false,
  "media": ["https://raw.githubusercontent.com/nardy18/talyon-social/<SHA>/reel/RNN-slug/talyon-reelNN.mp4"],
  "mediaAltText": [],
  "providers": [{"network": "instagram"}],
  "publicationDate": {"dateTime": "AAAA-MM-GGT18:30:00", "timezone": "Europe/Rome"},
  "shortener": false,
  "smartLinkData": {"ids": []},
  "text": "testo di didascalia.txt",
  "videoThumbnailUrl": "https://raw.githubusercontent.com/nardy18/talyon-social/<SHA>/reel/RNN-slug/copertina.jpg",
  "instagramData": {"type": "REEL", "collaborators": [], "showReelOnFeed": true, "isAiGenerated": false}
}
```

- `isAiGenerated` resta `false`: sono grafiche, testi e animazioni stilizzate, non foto o video realistici, e ogni post passa dal controllo di Emanuele prima di uscire.
- **Unica eccezione:** il reel fuori serie S01 «Scrivania del coach» (mercoledì 2 dicembre 2026, `reel/S01-scrivania/`) ha riprese generate con l'IA ed è programmato con `isAiGenerated: true`, per scelta di Emanuele del 18 novembre 2026. Non cambiarlo e non prenderlo a modello: per i reel del sabato resta «niente video fatti con l'IA».
- Non toccare mai altri post in Metricool. Non cancellare niente senza che Emanuele lo chieda.

## Messaggio per Emanuele (modello)

> Ciao Emanuele! Sono pronti i post della settimana:
> 1. **«Titolo»** (carosello n. N, sfondo verde/grafite): esce martedì GG mese alle 18:30.
> 2. **«Titolo»** (reel n. N): esce mercoledì GG mese alle 18:30.
> 3. **«Titolo»** (carosello n. N, sfondo verde/grafite): esce giovedì GG mese alle 9:00.
>
> Escono solo dopo il tuo ok.
> - Ti vanno bene? Rispondimi «ok» qui (oppure «ok ai caroselli», «ok al reel», «ok al primo», «ok al secondo»), o apri Metricool: trovi le bozze nel calendario, premi Programma.
> - Vuoi cambiare qualcosa? Scrivimi cosa e lo sistemo.
>
> Didascalie: (carosello del martedì) · (reel) · (carosello del giovedì)

Aggiungi una riga se ci sono bozze vecchie ancora da approvare, se hai cambiato o saltato un tema e perché, se proponi un cambio di giorno o temi nuovi. Prima del 21 novembre il messaggio parla solo dei due caroselli.

## Se qualcosa va storto

- **Push rifiutato** (manca il permesso su GitHub): manda comunque anteprima, slide e didascalia a Emanuele. Spiegagli in parole semplici che su github.com/settings/installations, alla voce Claude, va aggiunto il repository talyon-social. Non creare la bozza.
- **Metricool non risponde o dà errore:** manda slide e didascalia, scrivi che la bozza la crei appena funziona (o che può caricarla lui).
- **Il font non si carica o la generazione fallisce:** non pubblicare immagini sbagliate; scrivi a Emanuele cosa è successo in una frase.
- **Se il reel non viene bene** (copione che non passa i controlli, video che non esce o non passa la verifica finale, errore del browser o di ffmpeg, reel ancora da correggere dopo 3 giri): i caroselli escono lo stesso. Non creare bozze del reel a metà; se una bozza del reel è stata creata e poi qualcosa è andato storto, lasciala e dillo. Nel messaggio scrivi in una frase cosa è successo; il tema resta `da fare`.
- **Dubbi su un fatto:** nel dubbio non scriverlo. Meglio un carosello più semplice che un errore davanti ai coach.
