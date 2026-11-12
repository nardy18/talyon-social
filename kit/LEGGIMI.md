# Caroselli Talyon: istruzioni per l'attività settimanale

Questo file è per Claude. Ogni settimana un'attività programmata prepara un carosello Instagram per @talyon.app, lo mette in **bozza** su Metricool e chiede l'ok a Emanuele. **Non si pubblica mai niente senza il suo ok.**

Emanuele scrive in italiano e vuole frasi brevi e semplici: capisce poco di codice. Ai messaggi per lui niente gergo tecnico (niente «repo», «commit», «SHA», «API»).

## I passi, in ordine

1. **Ambiente.** Il repository `nardy18/talyon-social` deve essere nella sessione con permesso di scrittura (strumento `add_repo`, access `push`) e clonato. Lavora dentro la sua cartella.
2. **Bozze in sospeso.** Leggi `kit/temi.md`. Se un carosello è ancora `in bozza` e la sua data è passata o manca meno di 2 giorni, ricordalo a Emanuele nel messaggio finale (non ripubblicarlo, non cancellarlo).
3. **Tema.** Prendi il primo tema `da fare` in `kit/temi.md`. Se non ce ne sono più, non creare nulla: scrivi a Emanuele proponendo 6 temi nuovi (stesso stile della tabella) e fermati.
4. **Data.** Il primo martedì alle 18:30 (Europe/Rome) che cade almeno 3 giorni dopo oggi e non ha già un carosello, né in `kit/temi.md` né in Metricool (`getScheduledPosts`, brand `8059629`, fuso `Europe/Rome`, comprese le bozze).
5. **Scrivi il carosello** in `caroselli/CNN-slug/carosello.html` (NN a due cifre, slug corto in minuscolo con trattini, es. `C06-opener`). Parti da una copia di `caroselli/C05-la-tua-palestra/carosello.html` e rispetta le regole qui sotto. 8 slide: copertina, 6 slide di contenuto o di solo testo, chiusura.
6. **Genera:** `python3 kit/genera.py caroselli/CNN-slug/carosello.html`.
   - Se stampa elementi fuori dall'area, correggi e rigenera finché esce pulito.
   - Poi **guarda tutte le slide** (strumento Read sui JPG, una per una): testi tagliati, sovrapposizioni, parole sole a capo, visual troppo vuoti o troppo pieni, contrasto. Correggi e rigenera. Questo controllo è obbligatorio.
7. **Didascalia e alt.** Scrivi `didascalia.txt` (regole sotto) e `alt.txt` (una riga per slide, descrizione semplice per chi non vede l'immagine).
8. **Salva su GitHub.** `git add` della cartella del carosello (non `pagina.html`, è ignorata) e commit su `main`, poi push. Annota lo SHA del commit (`git rev-parse HEAD`).
9. **Bozza in Metricool** con `createScheduledPost` (dettagli sotto). Gli URL delle immagini usano lo SHA del commit, così non cambiano mai:
   `https://raw.githubusercontent.com/nardy18/talyon-social/<SHA>/caroselli/CNN-slug/slide-01.jpg` … `slide-08.jpg`.
10. **Aggiorna `kit/temi.md`:** stato `in bozza`, data. Commit e push.
11. **Se hai lo strumento Projects (progetto Talyon):** aggiungi il carosello in fondo a `claude/caroselli-instagram.md` (titolo, sfondo, una riga per slide), leggendo prima il documento e riscrivendolo intero.
12. **Avvisa Emanuele** (modello sotto): invia `anteprima.jpg` e le 8 slide con `SendUserFile` (status `proactive`), poi il messaggio con `SendUserMessage`.
13. **Se Emanuele risponde in questa chat:**
    - «ok» (o simile): `getScheduledPosts` per trovare `id` e `uuid` della bozza, poi `updateScheduledPost` con lo stesso contenuto e `draft: false`. Stato `programmato` in `kit/temi.md`, commit e push. Conferma con una frase.
    - correzioni: modifica, rigenera, controlla le slide, commit e push, poi `updateScheduledPost` con i nuovi URL (nuovo SHA) e il resto invariato. Rimanda l'anteprima.
    - «no» o «salta»: lascia la bozza così, segna `saltato` in `kit/temi.md` e chiedi se cancellarla da Metricool (cancella solo se lo dice lui).

## Regole dei contenuti

- **Per chi:** coach di streetlifting e calisthenics zavorrato in Italia. Italiano, del tu, da coach a coach.
- **Tono:** racconto evocativo ma concreto. Niente gergo da software (SaaS, dashboard, workflow, algoritmo, funzionalità). Sì al lessico di palestra (RPE, RIR, top single, back-off, opener, zavorra, ramping).
- **Filtro:** un coach lo manderebbe a un altro coach o a un suo atleta? Prima il valore pratico, poi il prodotto. Nei temi di programmazione Talyon compare al massimo in 1–2 slide e nella chiusura.
- **Struttura:** slide 1 = promessa chiara del tema in parole semplici; slide 2–7 = un'idea per slide; slide 8 = chiusura con l'invito «Seguici per non perdere l'anteprima gratuita.» (finché Emanuele non dice che l'anteprima è aperta a tutti).
- **Lunghezze:** titolo al massimo 2 righe (circa 8 parole); testo al massimo 3 righe (circa 30 parole), con la frase chiave in `<b>`.
- **Prodotto:** nomina solo le funzioni dell'elenco «Esistono». Mai una funzione «In arrivo» come se ci fosse già.
- **Prezzi e offerte:** non nominarli, salvo che il tema lo richieda e Emanuele l'abbia chiesto. Mai «gratis» se qualcosa si paga, mai urgenza finta («ultimi posti», conti alla rovescia), mai «solo per chi commenta».
- **Dati:** solo dati demo: Luca (−80 kg, massimali muscle-up +20, trazione +65, dip +90, squat 170, totale 345 kg); Marco R, Anna, Teo; palestre inventate «Ferro Street» (nero e giallo) e «Barra Alta» (chiaro e blu). Mai dati veri di atleti o palestre, mai Oplitia.
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
- Bozza con `createScheduledPost`: `blogId: "8059629"`, `date: "AAAA-MM-GGT18:30:00+01:00"` (+02:00 con l'ora legale), e `info` come stringa JSON:

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

- `isAiGenerated` resta `false`: sono grafiche e testi, non foto o video realistici, e ogni carosello passa dal controllo di Emanuele prima di uscire.
- Non toccare mai altri post in Metricool. Non cancellare niente senza che Emanuele lo chieda.

## Messaggio per Emanuele (modello)

> Ciao Emanuele! È pronto il carosello di questa settimana: **«Titolo»** (n. N, sfondo verde/grafite).
> Esce martedì GG mese alle 18:30, ma solo dopo il tuo ok.
> - Ti va bene? Rispondimi «ok» qui, oppure apri Metricool: trovi la bozza nel calendario, premi Programma.
> - Vuoi cambiare qualcosa? Scrivimi cosa e lo sistemo.
>
> Didascalia: (testo)

Aggiungi una riga se ci sono bozze vecchie ancora da approvare, o se hai cambiato o saltato un tema e perché.

## Se qualcosa va storto

- **Push rifiutato** (manca il permesso su GitHub): manda comunque anteprima, slide e didascalia a Emanuele. Spiegagli in parole semplici che su github.com/settings/installations, alla voce Claude, va aggiunto il repository talyon-social. Non creare la bozza.
- **Metricool non risponde o dà errore:** manda slide e didascalia, scrivi che la bozza la crei appena funziona (o che può caricarla lui).
- **Il font non si carica o la generazione fallisce:** non pubblicare immagini sbagliate; scrivi a Emanuele cosa è successo in una frase.
- **Dubbi su un fatto:** nel dubbio non scriverlo. Meglio un carosello più semplice che un errore davanti ai coach.
