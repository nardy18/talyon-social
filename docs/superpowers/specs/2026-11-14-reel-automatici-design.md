# Reel automatici: un reel a settimana, come i caroselli

Progetto del 13 novembre 2026. Si costruisce solo dopo l'ok di Emanuele.

## Perché

I reel servono a far conoscere Talyon a chi non lo segue ancora: nel report sulla crescita sono il formato che raggiunge di più chi non segue l'account. I caroselli invece vengono salvati e riletti. Emanuele vuole un ritmo fisso: ogni settimana due caroselli e un reel, preparati in automatico e approvati da lui, senza ore di lavoro ogni settimana. I reel restano animati, nello stile dei primi due.

## Cosa cambia per Emanuele

- Ogni sabato alle 9:45 arriva un solo messaggio con i due caroselli **e il reel finito**: video, copertina e didascalia. Tutti e tre sono già in bozza su Metricool.
- Per approvare risponde «ok», che vale per tutti e tre. Può anche scrivere «ok ai caroselli», «ok al reel», «ok al primo» o «ok al secondo», oppure cosa cambiare.
- Al massimo una volta al mese, quando i dati bastano, il messaggio può proporre di spostare un giorno. Il giorno cambia solo se Emanuele dice sì.

## Decisioni di Emanuele (13 novembre)

- **Tre post a settimana**, sempre in quest'ordine: carosello, reel, carosello.
- **Giorni di partenza:**
  - martedì alle 18:30, carosello;
  - mercoledì alle 18:30, reel;
  - giovedì alle 9:00, carosello.

  Sono gli stessi giorni della settimana del 16 novembre. Nei dati generali di Buffer mercoledì e giovedì sono tra i giorni migliori, venerdì e sabato i più deboli. Poi i giorni si spostano in base ai dati di Instagram.
- **Reel animati** come il Reel 1 e il Reel 2: niente persone, voci o volti. Niente video fatti con l'IA, tranne il video del simbolo nella chiusura, che c'è già.
- **Divisione dei temi:**
  - **i caroselli insegnano**: programmazione e gare;
  - **i reel mostrano Talyon al lavoro**: ogni reel racconta un momento della settimana di un coach o di un atleta, con una sola funzione.
- **Primi 8 reel** (lista approvata):

| N | Titolo | Cosa mostra |
|---|---|---|
| R03 | Domenica sera, venti schede | la settimana scritta dal computer, duplicata e assegnata da un modello |
| R04 | Palestra senza campo | l'allenamento sul telefono dell'atleta: serie già compilate, un tocco, recupero che parte da solo, anche senza rete |
| R05 | Lunedì mattina, chi seguire | Atleti da seguire: chi non si allena, chi fatica, la scheda in scadenza |
| R06 | Più difficile, più facile | ogni serie colorata rispetto a quella scritta; tocchi la cella e rivedi il prescritto |
| R07 | Il record lo confermi tu | l'atleta propone, il coach conferma; record e stima restano separati |
| R08 | Dal link alla prima scheda | link e QR della palestra, la richiesta, il sì del coach, la scheda pronta |
| R09 | La nota che si vede | la nota del coach sull'esercizio, in evidenza nell'app dell'atleta |
| R10 | Il minuto che suona | l'EMOM con il segnale a ogni minuto |

- **Tolti dai caroselli:**
  - C09 «Dal foglio a Talyon», perché sullo stesso tema c'è già il Reel 2;
  - C12 «Il coach online», che diventa R05 e R06.
- **Approccio:** un modello di reel, come quello dei caroselli. Il giro del sabato scrive il testo del reel, lo monta, lo controlla e manda il video finito.

## Obiettivi

- Un reel a settimana di 30–36 secondi, con la qualità e lo stile del Reel 1 e del Reel 2.
- Nessun lavoro per Emanuele oltre all'approvazione.
- Un giro del sabato affidabile: se il reel non viene bene, i caroselli escono lo stesso e il messaggio lo dice.
- I dati di ogni post salvati, e i giorni rivisti in base ai dati.

## Non obiettivi

- Reel con Emanuele, voce fuori campo, sottotitoli del parlato.
- Storie, collaborazioni, risposte ai commenti.
- Pubblicazione senza l'ok di Emanuele.
- Piano a pagamento di Metricool: 3 post a settimana sono circa 13 al mese, sotto il limite di 20.

## Da evitare (anche se tutto il resto funziona)

- Reel tutti uguali: stessa apertura, stessa musica, stesse inquadrature ogni settimana.
- Un reel che ripete un carosello della stessa settimana o di quella prima.
- Funzioni «in arrivo» mostrate come già pronte, prezzi, urgenza finta, confronti con altre app.
- Testi nelle zone coperte da Instagram, o troppo piccoli per leggerli sul telefono.
- Un giro del sabato che resta bloccato o lascia bozze a metà in Metricool.

## Vincoli

- **Regole dei reel**, uguali a quelle del Reel 1:
  - solo funzioni che esistono (elenco «Esistono» in `kit/LEGGIMI.md`);
  - niente prezzi e niente urgenza finta;
  - sempre in positivo;
  - solo dati demo: Luca, Marco R, Anna, Teo/Matteo, e le palestre Ferro Street e Barra Alta;
  - niente persone o volti realistici;
  - musica senza diritti, creata in codice.
- **Formato e grafica:**
  - 1080×1920, 30 fps, MP4 H.264 + AAC;
  - volume a −14 LUFS, picco sotto −1 dB;
  - nessun testo importante nel 14% in alto, nel 35% in basso e nel 6% ai lati;
  - palco grafite o verde militare, testi bianchi, font Saira;
  - rame solo per linee e dettagli, mai per testi o pulsanti;
  - «più difficile» in rosso tenue con freccia su, «più facile» in verde salvia con freccia giù;
  - finitura lucida, senza grana.
- **Didascalia:** la prima riga dice il tema con le parole dei coach. Poi 2–3 frasi e l'invito «Seguici per non perdere l'anteprima gratuita.», finché l'anteprima non è aperta a tutti. Al massimo 5 hashtag.
- **Metricool:** brand 8059629, fuso Europe/Rome, solo Instagram, solo bozze. Non si toccano altri post. Il piano gratuito tiene i dati solo per 30 giorni.
- **Repository pubblico** `nardy18/talyon-social`: dentro solo grafica, video e istruzioni, mai dati dell'app.
- **Il giro del sabato** gira nel cloud con gli strumenti del generatore dei caroselli (Playwright e Chrome) più ffmpeg. Deve finire in tempi ragionevoli anche con il reel: il render dura circa 3–5 minuti.

## Approcci considerati

1. **Modello di reel (scelto).** Il modello si prepara una volta sola: stile, apertura con il logo, chiusura e schermate degli 8 temi. Ogni settimana cambia solo il copione.
   - Pro: qualità costante e un giro veloce e sicuro.
   - Contro: la struttura si ripete; per temi fuori dalla lista può servire una schermata nuova.
2. **Reel da zero ogni sabato**, come il Reel 2.
   - Pro: varietà massima.
   - Contro: senza lo storyboard approvato è fragile e lento.
3. **Gli 8 reel fatti subito**, con lo storyboard approvato uno per uno.
   - Pro: la qualità più alta.
   - Contro: non è automatico e richiede molte sessioni adesso.

## Come funziona

### Il modello di reel

La struttura è fissa, il contenuto cambia:

| Parte | Durata | Cosa si vede |
|---|---|---|
| Gancio | 0–2,8 s | la scena d'apertura del tema e una frase in 2–3 righe, già sullo schermo dal primo fotogramma |
| Logo e promessa | 2,8–6,2 s | il telefono con il logo e la promessa del reel in tre pezzi (come «Non riscrivi niente. Talyon le legge, tu approvi.») |
| Momenti | 3 o 4, da 5–6 s | in alto a sinistra un titolo di 2 righe; sotto un blocco: riquadro di vetro, schermata del telefono, elenco o scheda da toccare, con richiami in rame dove servono |
| Culmine | circa 3,5 s | il momento più forte (un tocco che conferma, un numero grande che si accende), con il colpo della musica |
| Chiusura | ultimi 4 s | il video del simbolo, l'invito e @talyon.app, uguale per tutti |

- **Copione.** Per ogni reel il giro del sabato scrive solo il copione: testi, blocchi scelti e dati demo. Tempi, camera, passaggi, musica ed effetti li calcola il modello.
- **Blocchi**, presi dal Reel 1 e dal Reel 2 e resi riutilizzabili:
  - fogli in prospettiva e file che arrivano;
  - telefono con il logo;
  - riquadro di vetro con titolo;
  - elenco con contatore;
  - scheda da confermare con un tocco;
  - numero grande;
  - tre telefoni con i nomi sopra;
  - telefono in primo piano con il passaggio da una schermata all'altra;
  - richiami con il filo di rame.
- **Schermate degli 8 temi:**
  - R03: griglia del builder, con «duplica settimana» e «assegna»;
  - R04: allenamento dell'atleta, con serie compilate, tocco, recupero e allenamento senza rete;
  - R05: Atleti da seguire;
  - R06: celle «più difficile» e «più facile», con il prescritto;
  - R07: record proposto e confermato, con la stima separata;
  - R08: link e QR, richiesta e accettazione;
  - R09: nota del coach in evidenza;
  - R10: EMOM con il minuto.
- **Varietà.** Da un reel all'altro cambiano la scena del gancio, il colore del palco (grafite o verde militare), la musica e l'ordine dei blocchi. La musica ha 4 varianti di tonalità e giro di accordi, con gli stessi strumenti.
- **Musica ed effetti:**
  - si calcolano dal copione;
  - inizio filtrato, poi la musica entra piena sul logo;
  - più bassa sotto i riquadri da leggere;
  - una breve pausa prima del culmine, poi il colpo più forte sul culmine, a tempo con la musica;
  - finale che si chiude sull'accordo principale.
- **File che escono:**
  - MP4 del reel;
  - copertina: il fotogramma del logo con la promessa, come per il Reel 1 e il Reel 2;
  - foglio di controllo con un fotogramma al secondo.

### Il giro del sabato, aggiornato

1. **Ambiente:** come oggi, più un controllo degli strumenti per il video. Se mancano, i caroselli escono lo stesso, il reel no, e il messaggio lo dice.
2. **Bozze in sospeso:** come oggi, anche per i reel.
3. **Dati:** per ogni post uscito da almeno 3 giorni e non ancora registrato, salva in `kit/risultati.md` i dati di Metricool:
   - visualizzazioni (da Instagram hanno preso il posto delle impression);
   - copertura;
   - salvataggi e condivisioni;
   - nuovi follower;
   - per i reel, anche la durata media guardata e la percentuale di chi scorre via nei primi 3 secondi.

   Il registro resta nel repository, perché il piano gratuito di Metricool tiene solo 30 giorni.
4. **Giorni.** Si comincia dopo 4 settimane di dati, cioè 12 post. Il giro confronta i tre spazi e le ore di maggiore attività del pubblico che Metricool calcola. Se un altro giorno o un'altra ora è chiaramente migliore, lo propone nel messaggio, al massimo un cambio al mese, e lo applica solo dopo il sì.
5. **Caroselli:** come oggi.
6. **Reel:**
   - prende il primo tema «da fare» in `reel/temi.md`;
   - la data è il primo mercoledì alle 18:30 libero ad almeno 3 giorni;
   - scrive il copione;
   - genera il foglio di controllo e lo guarda: testi, zone coperte, sovrapposizioni. Corregge finché va bene;
   - crea video e audio, poi controlla durata, volume e alcuni fotogrammi del video finito;
   - salva tutto su GitHub;
   - crea la **bozza** del reel su Metricool, con video, copertina e didascalia;
   - aggiorna `reel/temi.md`.
7. **Un solo messaggio:** caroselli (anteprime, slide e didascalie) e reel (video, copertina e didascalia), ognuno con giorno e ora.
8. **Risposte:**
   - «ok» vale per tutti e tre;
   - si può approvare anche solo una parte: «ok ai caroselli», «ok al reel», «ok al primo», «ok al secondo»;
   - le correzioni si applicano, si rifà il video e si aggiorna la bozza.
9. **Temi nuovi:** quando restano meno di 3 reel da fare, il giro propone 4 temi nuovi. Usa solo funzioni che esistono e schermate già nel modello, oppure segnala che serve una schermata nuova.

### Passaggio

- **Sabato 14 novembre:** il giro parte come oggi e prepara il C06 per giovedì 19 e il C07 per martedì 24.
- **Reel 2:** bozza per mercoledì 25 novembre alle 18:30, se Emanuele è d'accordo.
- **Prova del modello:** si fa sul R03 «Domenica sera, venti schede». Dopo l'ok di Emanuele diventa la bozza di mercoledì 2 dicembre.
- **Dal giro di sabato 21 novembre** il reel entra nel sabato: il primo è il R04, per mercoledì 9 dicembre.
- **`kit/temi.md`:** C09 e C12 vanno tolti prima di sabato 21, perché quel giorno il giro prenderebbe il C09.

### Dove sta tutto

- `kit/reel/`: motore, blocchi, schermate, musica e strumenti per creare il video.
- `kit/reel/risorse/`: font e video del simbolo.
- `reel/temi.md`: elenco dei reel con lo stato.
- `reel/RNN-slug/`: copione, video, copertina, didascalia e foglio di controllo di ogni reel.
- `kit/LEGGIMI.md`: aggiornato con i passi del reel e dei dati.
- `kit/risultati.md`: registro dei dati.
- **Attività programmata:** «Caroselli Talyon della settimana» diventa «Post Talyon della settimana», con le istruzioni nuove.
- **Documenti del progetto:** `claude/caroselli-automatici.md` aggiornato e `claude/reel-automatici.md` nuovo.

## Scelte di Claude (da controllare)

- **Etichetta IA:** nessuna, come per il Reel 1. La chiusura usa lo stesso video del simbolo.
- **Durata:** 30–36 secondi. I primi due reel duravano 40 secondi, ma conviene restare più corti per non perdere chi guarda.
- **Cosa arriva il sabato:** il video finito, non lo storyboard. Le correzioni si fanno sul video.
- **Copertina:** il fotogramma con il logo e la promessa, come per i primi due reel.
- **Se il reel non viene bene:** i caroselli escono lo stesso e il messaggio lo dice.
- **Cambio dei giorni:** al massimo uno al mese e non prima di 4 settimane di dati, sempre con il sì di Emanuele.

## Lasciato a chi costruisce

- Tempi esatti, movimenti della camera, passaggi, suoni degli effetti e formato del copione.
- Come trovare Chrome nel cloud: lo stesso Playwright di `genera.py`. Come dividere il render.
- Le 4 varianti della musica.
- I dettagli grafici delle schermate nuove, dentro le regole grafiche.
- Le parole esatte dei controlli e dei messaggi.
