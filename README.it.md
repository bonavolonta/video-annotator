# video-annotator

[English](README.md)

**video-annotator** è uno strumento open source basato su browser per l'annotazione temporale di video, progettato per la ricerca, la didattica e l'analisi filmica e dei media.

Supporta file video locali compatibili con il browser e video YouTube, consentendo di creare marker puntuali e segmenti temporali IN–OUT, associare commenti testuali a momenti o intervalli specifici, lavorare con sottotitoli esterni, esplorare le annotazioni tramite una timeline interattiva ed esportare dati strutturati in formato CSV canonico.

* **Live Demo:** [https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)
* **Versione:** 1.4.0
* **Licenza:** MIT

---

## Panoramica

video-annotator offre un ambiente dedicato per l'annotazione manuale di materiale audiovisivo direttamente nel browser.

L'applicazione è progettata attorno a un nucleo essenziale di operazioni: individuare un momento rilevante nel video, marcare un singolo punto temporale o un intervallo, aggiungere un commento testuale, ritornare ai momenti annotati ed esportare le annotazioni risultanti in un formato strutturato.

L'obiettivo non è replicare i complessi insiemi di funzionalità delle piattaforme specializzate di annotazione multimodale o di analisi qualitativa dei dati. Al contrario, video-annotator fornisce un ambiente comparativamente semplice per attività di insegnamento, ricerca, osservazione e analisi in cui l'annotazione temporale di video è richiesta senza dover ricorrere a flussi di lavoro software complessi.

---

## Origini del progetto

video-annotator trae origine da un'attività di ricerca presso l'Università degli Studi di Cagliari, nell'ambito dell'insegnamento di Pedagogia Speciale tenuto dal Prof. Antonello Mura e delle più ampie attività del gruppo di ricerca coordinato dal Prof. Mura.

Lo strumento è nato dall'esigenza di offrire agli studenti un ambiente semplice e accessibile per l'annotazione video in contesti didattici e di ricerca. Il suo design si concentra pertanto su un insieme circoscritto di funzioni cardine di annotazione, evitando la complessità degli ambienti audiovisivi più specialistici.

Il progetto si colloca in un più ampio quadro di ricerca collaborativa in cui lo strumento può supportare sperimentazioni, valutazioni, discussioni e riflessioni metodologiche sull'impiego dell'annotazione video nella didattica e nella ricerca.

Sebbene sviluppato inizialmente in un contesto accademico-didattico, video-annotator è concepito come uno strumento di carattere generale in grado di supportare anche la ricerca, l'analisi qualitativa di registrazioni video e l'analisi filmica e mediale.

---

## Ambiti d'uso previsti

### Ricerca

video-annotator può supportare flussi di lavoro di ricerca in cui il materiale audiovisivo necessita di essere ispezionato, segmentato, commentato e rivisitato in punti temporali specifici.

Tra i possibili impieghi rientrano la ricerca osservativa, l'analisi qualitativa del video, l'individuazione di episodi analiticamente rilevanti, le attività preliminari di codifica e la costruzione di dataset strutturati contenenti riferimenti temporali e commenti prodotti dal ricercatore.

video-annotator non intende sostituire ambienti completi per l'analisi qualitativa dei dati o per l'annotazione multimodale, ma può essere utilizzato come componente mirato all'interno di flussi di lavoro di ricerca più ampi.

### Didattica e formazione

Lo strumento può essere impiegato in contesti formativi in cui studenti o docenti debbano collegare osservazioni e commenti a momenti specifici del materiale audiovisivo.

Le potenziali applicazioni comprendono l'apprendimento basato su video, l'osservazione d'aula, le attività riflessive, la formazione degli insegnanti, l'analisi di situazioni educative, la discussione guidata di materiali video e altre attività formative fondate sull'esame ravvicinato di evidenze audiovisive.

### Analisi filmica e dei media

video-annotator può supportare l'individuazione e l'annotazione di scene, sequenze, transizioni, eventi o altri elementi temporalmente definiti in materiali filmici e mediali.

Il modello di annotazione basato su marker e segmenti IN–OUT consente di distinguere agevolmente tra osservazioni riferite a un singolo istante temporale e osservazioni relative a un segmento audiovisivo esteso.

---

## Funzionalità

* Funzionamento interamente basato su browser
* Riproduzione di file video locali
* Riproduzione di video YouTube tramite la YouTube IFrame Player API ufficiale
* Marker temporali puntuali
* Segmenti temporali IN–OUT
* Commenti testuali
* Timeline interattiva delle annotazioni
* Salto diretto (seek) ai momenti e segmenti annotati
* Modifica ed eliminazione delle annotazioni
* Cassetto laterale (drawer) per la gestione delle annotazioni
* Persistenza e ripristino locale della sessione
* Reset della sessione tramite la funzione *Dimentica questa sessione*
* Supporto per sottotitoli esterni SRT
* Supporto per sottotitoli esterni WebVTT
* Fascia sottotitoli dedicata e separata dal quadro video
* Controllo attivazione/disattivazione (ON/OFF) dei sottotitoli
* Dimensione del testo dei sottotitoli regolabile
* Regolazione dell'offset di sincronizzazione dei sottotitoli a passi di ±0,5 secondi
* Esportazione canonica delle annotazioni in CSV
* Interfaccia utente bilingue in italiano e inglese
* Preferenza di lingua persistente
* Scorciatoie da tastiera
* Modalità a schermo intero (fullscreen)
* Supporto all'accessibilità da tastiera e con screen reader

---

## Modello di annotazione

video-annotator adotta due tipologie primarie di annotazione.

### Marker

Un marker rappresenta un'annotazione ancorata a un singolo punto della timeline video.

Associa una posizione temporale a un commento testuale opzionale e può essere successivamente selezionato per riportare la riproduzione al momento corrispondente nel video.

I marker risultano utili quando l'oggetto analitico è un evento o un'osservazione circoscritta a un istante specifico.

### Segmento IN–OUT

Un segmento rappresenta un'annotazione associata a un intervallo temporale.

L'utente definisce dapprima un punto di inizio (IN) e successivamente un punto di fine (OUT). All'intervallo risultante può essere associato un commento testuale.

I segmenti risultano utili quando l'oggetto analitico si protrae nel tempo, come nel caso di un'interazione, una sequenza, una scena, un'azione, un episodio discorsivo o un'altra unità temporalmente delimitata.

Entrambe le tipologie di annotazione sono rappresentate nell'esportazione CSV canonica unitamente alle informazioni che identificano la sorgente video associata.

---

## Sorgenti video

### Video locale

Gli utenti possono selezionare un file video presente sul proprio dispositivo e supportato dal browser.

Il file selezionato viene gestito interamente lato client dal browser e non viene caricato su alcun server di video-annotator.

Poiché video-annotator non dispone di alcun backend applicativo, non conserva alcuna copia remota del materiale audiovisivo locale.

L'effettivo supporto di formati e codec dipende dal browser e dal sistema operativo dell'utente.

### YouTube

Gli utenti possono caricare un video YouTube fornendo un URL YouTube supportato.

La riproduzione viene gestita tramite la YouTube IFrame Player API ufficiale. video-annotator controlla operazioni quali il posizionamento temporale e il seek, mentre il contenuto audiovisivo rimane all'interno del player YouTube.

video-annotator non scarica né ridistribuisce i contenuti video di YouTube.

Il funzionamento con YouTube dipende dalla disponibilità e dal comportamento del servizio esterno di YouTube; per questa funzionalità è raccomandata l'esecuzione tramite HTTP/HTTPS, come nella versione pubblica ospitata su GitHub Pages.

---

## Sottotitoli

video-annotator supporta file di sottotitoli esterni nei formati:
* SRT (`.srt`)
* WebVTT (`.vtt`)

I sottotitoli importati vengono visualizzati in una fascia dedicata, separata dal quadro video.

L'utente può:
* attivare o disattivare la visualizzazione dei sottotitoli;
* ridurre, ripristinare o aumentare la dimensione del testo dei sottotitoli;
* calibrare la sincronizzazione dei sottotitoli a incrementi di ±0,5 secondi;
* rimuovere la traccia dei sottotitoli attualmente caricata.

Lo stato dei sottotitoli e le preferenze correlate possono essere conservati all'interno della sessione locale.

I file SRT e WebVTT costituiscono risorse di input. I dati delle annotazioni vengono esportati separatamente attraverso il formato CSV canonico descritto di seguito.

---

## Esportazione dei dati

Le annotazioni possono essere esportate come file CSV canonico.

Lo schema di esportazione è indipendente dalla lingua dell'interfaccia selezionata, garantendo che i dati generati utilizzando l'interfaccia italiana o quella inglese risultino strutturalmente identici.

### Schema canonico

```csv
ID,Type,IN,OUT,IN_seconds,OUT_seconds,Comment,Source,Video
```

### Campi

| Campo | Descrizione |
| :--- | :--- |
| `ID` | Identificatore univoco dell'annotazione |
| `Type` | Tipologia di annotazione: `marker` o `segment` |
| `IN` | Timestamp IN formattato in modo leggibile |
| `OUT` | Timestamp OUT formattato in modo leggibile; vuoto per i marker |
| `IN_seconds` | Posizione del punto IN espressa in secondi |
| `OUT_seconds` | Posizione del punto OUT espressa in secondi; vuoto per i marker |
| `Comment` | Testo dell'annotazione inserito dall'utente |
| `Source` | Sorgente video: `local` o `youtube` |
| `Video` | Informazioni identificative del video associato all'annotazione |

I file CSV sono generati utilizzando:
* codifica UTF-8 con BOM;
* virgola come separatore di campo;
* delimitazione e struttura delle righe conformi allo standard RFC 4180.

I campi temporali numerici facilitano l'elaborazione successiva in fogli di calcolo, ambienti statistici, linguaggi di programmazione e altri flussi di lavoro di ricerca.

---

## Architettura tecnica

video-annotator è un'applicazione web statica implementata con:
* HTML;
* CSS;
* Vanilla JavaScript.

L'applicazione non dispone di backend, database, sistemi di autenticazione, dipendenze da framework o librerie a runtime.

Un'astrazione comune denominata `MediaAdapter` fornisce un'interfaccia unificata per operazioni quali rilevamento del tempo corrente, durata, riproduzione, pausa e seek tra sorgenti video HTML5 locali e sorgenti YouTube.

Le annotazioni, lo stato della sessione, la preferenza di lingua e i relativi dati applicativi sono conservati localmente nel browser.

Non è richiesto alcun processo di compilazione o build per il normale utilizzo. Il progetto può pertanto essere distribuito direttamente su servizi di hosting statico come GitHub Pages.

---

## Dati e privacy

video-annotator adotta un approccio locale (local-first) per la gestione dei dati applicativi.

L'applicazione non include alcun database remoto di annotazioni, sistema di account utente o memorizzazione delle sessioni lato server.

Nei flussi di lavoro con video locali:
* i file video sono selezionati dal dispositivo dell'utente;
* i file di sottotitoli esterni vengono letti lato client;
* le annotazioni vengono create lato client;
* i dati di sessione sono memorizzati localmente nel browser;
* l'esportazione CSV viene generata lato client.

video-annotator non trasmette queste risorse ad alcun proprio server.

Quando si utilizza YouTube, la riproduzione video poggia necessariamente sull'infrastruttura e sui servizi esterni di YouTube. Gli utenti devono pertanto distinguere tra i dati elaborati localmente da video-annotator e le interazioni che coinvolgono il player YouTube ospitato esternamente.

---

## Diritto d'autore e responsabilità sui contenuti

video-annotator non fornisce, non ospita, non scarica né ridistribuisce contenuti audiovisivi.

I file video locali e i file di sottotitoli sono selezionati dall'utente ed elaborati lato client, mentre i video YouTube vengono riprodotti tramite la YouTube IFrame Player API ufficiale.

Gli utenti sono responsabili di verificare di disporre dei diritti necessari o di altra idonea base giuridica per utilizzare, annotare, riprodurre o condividere i materiali audiovisivi e i sottotitoli selezionati.

L'uso per finalità didattiche o di ricerca non esime di per sé dal rispetto delle limitazioni vigenti in materia di diritto d'autore.

---

## Accessibilità

L'accessibilità è stata considerata un requisito progettuale fondamentale lungo tutto lo sviluppo di video-annotator.

La versione 1.4.0 è stata verificata rispetto alle linee guida WCAG 2.2 Livello A/AA, con ulteriore riferimento agli standard ISO/IEC 40500:2025 ed EN 301 549 V4.1.1, a WAI-ARIA 1.2 e alle pertinenti raccomandazioni delle WAI-ARIA Authoring Practices.

Il lavoro sull'accessibilità ha riguardato, tra gli altri aspetti:
* navigazione da tastiera;
* indicatore visivo del focus da tastiera;
* gestione e ripristino del focus;
* nomi accessibili;
* interazione con finestre di dialogo e pannelli;
* semantica della timeline delle annotazioni;
* denominazione dell'iframe YouTube;
* annunci di stato per i sottotitoli;
* semantica dei tab e pannelli correlati;
* contrasto visivo degli elementi non testuali;
* prevenzione dei conflitti con scorciatoie a singolo carattere.

### Ambito delle verifiche

Le verifiche per la versione 1.4.0 hanno compreso:
* l'esecuzione della suite di regressione automatizzata completa, con il superamento di 9 gruppi di test su 9;
* controlli axe su 10 stati applicativi rappresentativi, con 0 violazioni WCAG A/AA riscontrate;
* test manuali con screen reader mediante VoiceOver e Safari su macOS;
* verifica manuale condotta il 26 settembre 2026.

Questi risultati descrivono la versione, gli stati e l'ambiente effettivamente esaminati. Non devono essere interpretati come una garanzia di accessibilità universale o assoluta rispetto a ogni combinazione di browser, tecnologia assistiva, sorgente multimediale o configurazione utente.

### Limitazione nota sull'accessibilità

Per la sincronizzazione dei sottotitoli su YouTube, l'intervallo di aggiornamento dei sottotitoli è stato ridotto a 50 ms al fine di migliorare la prontezza temporale.

Tuttavia, non è stata completata una misurazione strumentale end-to-end rispetto all'effettivo clock audiovisivo su un campione di almeno 20 cue di sottotitoli. Di conseguenza, non si afferma che il requisito temporale previsto da EN 301 549 §7.1.2 sia stato pienamente verificato per la sincronizzazione dei sottotitoli su YouTube.

---

## Scorciatoie da tastiera

Le scorciatoie applicative basate su caratteri richiedono il tasto modificatore Alt per ridurre il rischio di conflitti con l'inserimento di testo e la navigazione ordinaria del browser.

| Scorciatoia | Azione |
| :--- | :--- |
| <kbd>Alt</kbd>+<kbd>M</kbd> | Aggiunge un marker |
| <kbd>Alt</kbd>+<kbd>I</kbd> | Imposta il punto IN |
| <kbd>Alt</kbd>+<kbd>O</kbd> | Imposta il punto OUT |
| <kbd>Alt</kbd>+<kbd>A</kbd> | Apre l'elenco delle annotazioni |
| <kbd>Alt</kbd>+<kbd>C</kbd> | Apre la gestione dei sottotitoli |
| <kbd>Alt</kbd>+<kbd>F</kbd> | Attiva / disattiva lo schermo intero |

L'interazione standard da tastiera, inclusi Tab, Shift+Tab, Invio, Spazio ed Esc, è supportata ove appropriato per il componente attivo dell'interfaccia.

---

## Lingue dell'interfaccia

L'interfaccia è disponibile in:
* Italiano
* Inglese

Gli utenti possono cambiare lingua in qualsiasi momento senza ricaricare la pagina.

L'applicazione inoltre:
* rileva la lingua del browser al primo utilizzo;
* memorizza la lingua selezionata;
* aggiorna l'attributo di lingua del documento (`<html lang="...">`);
* localizza etichette dell'interfaccia, segnaposto, messaggi, errori, titoli e nomi accessibili.

I commenti e le annotazioni generati dall'utente non vengono mai tradotti automaticamente.

Anche lo schema CSV canonico è completamente indipendente dalla lingua dell'interfaccia.

---

## Esecuzione di video-annotator

### Utilizzo online

L'applicazione pubblica è disponibile su GitHub Pages:  
[https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)

Nessuna installazione è richiesta per il normale utilizzo della versione ospitata online.

### Utilizzo locale

Il repository può essere clonato o scaricato ed eseguito come applicazione web statica.

Non è richiesto alcun passaggio di compilazione o installazione di pacchetti.

Ad esempio, disponendo di Python 3, è possibile avviare un server HTTP locale dalla cartella del repository con:

```bash
python3 -m http.server 8000
```

L'applicazione può quindi essere aperta accedendo al corrispondente indirizzo localhost.

L'esecuzione dell'applicazione tramite HTTP/HTTPS è raccomandata ed è particolarmente importante per l'integrazione con YouTube, poiché il player YouTube richiede il consueto comportamento di origine web e referrer.

---

## Test

Il repository comprende una suite di regressione automatizzata eseguibile con:

```bash
npm test
```

La suite di test verifica nove aree principali:
1. Parsing degli URL YouTube;
2. Funzionamento comune del `MediaAdapter`;
3. Archiviazione multi-sorgente e isolamento delle sessioni;
4. Gestione dei codici di errore YouTube;
5. Formattazione del CSV canonico e generazione del nome file;
6. Teardown delle risorse multimediali e semantica di ripristino/azzeramento sessione;
7. Gestione dei sottotitoli SRT e WebVTT;
8. Internazionalizzazione italiano/inglese;
9. Regressioni legate all'accessibilità.

La suite di test fa uso esclusivo dei moduli standard di Node.js e non richiede dipendenze applicative a runtime.

I test automatizzati integrano, senza sostituirli, i controlli manuali eseguiti tramite browser e tecnologie assistive.

---

## Contesto scientifico

L'annotazione audiovisiva allineata temporalmente riveste un ruolo consolidato nella ricerca multimodale, nell'analisi dell'interazione, nella ricerca qualitativa con video, nella didattica e nell'analisi dei media.

Primi ambienti di annotazione quali ANVIL hanno introdotto modelli flessibili basati su elementi ancorati temporalmente e distribuiti su più tracce, mentre ELAN ha sviluppato un framework con specifica attenzione all'accuratezza dell'allineamento temporale nella ricerca sulla multimodalità [1, 2].

Più in generale, l'analisi sistematica delle interazioni registrate è da lungo tempo impiegata nella ricerca qualitativa e interazionale. Jordan e Henderson hanno descritto l'analisi dell'interazione come un approccio empirico fondato sull'esame ripetuto di registrazioni audiovisive, fornendo un rilevante contesto metodologico per il lavoro analitico su eventi documentati [3].

Nella ricerca educativa e nella formazione degli insegnanti, l'annotazione video è stata studiata come strumento per collegare osservazioni e riflessioni a specifiche evidenze audiovisive. Rich e Hannafin hanno esaminato le tecnologie di video annotazione come dispositivi per strutturare e sostenere i processi riflessivi dei docenti [4]. Una successiva rassegna sistematica della letteratura condotta da von Wachter e Lewalter ha identificato utilizzi ricorrenti della video annotazione nella formazione dei docenti, comprendenti documentazione, comunicazione, feedback e pratica riflessiva [6].

L'annotazione digitale ha trovato applicazione anche negli studi sul cinema e sui media. VIAN, ad esempio, costituisce un ambiente specializzato di annotazione visiva ideato per l'analisi sistematica del film, attestando il rilievo dei sistemi di annotazione digitale per l'analisi sistematica dei materiali audiovisivi [5].

video-annotator non intende riprodurre i modelli di annotazione multistrato, le funzioni analitiche specialistiche o le funzionalità di gestione di corpora tipiche di questi sistemi consolidati. Adotta volutamente un modello più circoscritto basato su marker puntuali e segmenti IN–OUT per offrire un ambiente basato su browser comparativamente semplice per compiti ordinari di annotazione temporale.

### Riferimenti bibliografici selezionati

1. Kipp, M. (2001). ANVIL – A Generic Annotation Tool for Multimodal Dialogue. *Proceedings of the 7th European Conference on Speech Communication and Technology (Eurospeech 2001)*, 1367–1370. doi:10.21437/Eurospeech.2001-354.
2. Wittenburg, P., Brugman, H., Russel, A., Klassmann, A., & Sloetjes, H. (2006). ELAN: a Professional Framework for Multimodality Research. *Proceedings of the Fifth International Conference on Language Resources and Evaluation (LREC 2006)*. European Language Resources Association.
3. Jordan, B., & Henderson, A. (1995). Interaction Analysis: Foundations and Practice. *The Journal of the Learning Sciences*, 4(1), 39–103. doi:10.1207/s15327809jls0401_2.
4. Rich, P. J., & Hannafin, M. (2009). Video Annotation Tools: Technologies to Scaffold, Structure, and Transform Teacher Reflection. *Journal of Teacher Education*, 60(1), 52–67. doi:10.1177/0022487108328486.
5. Halter, G., Ballester-Ripoll, R., Flueckiger, B., & Pajarola, R. (2019). VIAN: A Visual Annotation Tool for Film Analysis. *Computer Graphics Forum*, 38(3), 119–129. doi:10.1111/cgf.13676.
6. von Wachter, J.-K., & Lewalter, D. (2023). Video Annotation as a Supporting Tool for Video-based Learning in Teacher Training – A Systematic Literature Review. *International Journal of Higher Education*, 12(2), 1–19. doi:10.5430/ijhe.v12n2p1.

---

## Limiti e ambito applicativo

video-annotator è focalizzato intenzionalmente su un insieme circoscritto di attività di annotazione temporale.

Attualmente non include:
* interpretazione automatica del video o computer vision;
* generazione automatica delle annotazioni;
* schemi di annotazione gerarchici o multistrato paragonabili a piattaforme specializzate di annotazione multimodale;
* un sistema generale di codifica qualitativa;
* ricerca o analisi a livello di corpus;
* collaborazione multi-utente in tempo reale;
* un database remoto per le annotazioni;
* account utente o sincronizzazione su cloud.

Le annotazioni e i dati di sessione salvati nel browser sono soggetti ai consueti limiti di persistenza e capienza dello storage locale del browser. La cancellazione dei dati del browser o il cambio di browser/dispositivo può pertanto rendere inaccessibili le informazioni di sessione memorizzate localmente qualora i dati di annotazione non siano stati preventivamente esportati.

La riproduzione da YouTube dipende da un servizio esterno e può risentire della disponibilità dei video, di restrizioni sull'incorporamento, delle condizioni di rete, dei criteri del browser o di modifiche alla piattaforma YouTube.

Le verifiche di accessibilità descritte sopra si riferiscono all'ambito di test documentato e non devono essere intese come una garanzia di comportamento identico in qualsiasi contesto possibile.

---

## Citazione

I metadati di citazione per video-annotator 1.4.0 sono forniti nel file [CITATION.cff](CITATION.cff).

In caso di utilizzo di video-annotator in pubblicazioni o lavori accademici, si invita a citare la versione del software utilizzata, in modo che il software associato al flusso di ricerca possa essere identificato con la massima precisione possibile.

Informazioni relative a un DOI persistente saranno aggiunte qualora venga adottata l'archiviazione del software su un repository dedicato al rilascio di DOI.

---

## Licenza

video-annotator è distribuito sotto Licenza MIT.

Si veda il file [LICENSE](LICENSE) per il testo completo della licenza.

Copyright © 2026 Gianmarco Bonavolonta.

---

## Ringraziamenti

video-annotator trae origine nel contesto accademico dell'Università degli Studi di Cagliari, all'interno di un'attività di ricerca collegata all'insegnamento di Pedagogia Speciale tenuto dal Prof. Antonello Mura e al più ampio lavoro del gruppo di ricerca coordinato dal Prof. Mura.

Questo contesto ha costituito l'ambiente didattico e scientifico in cui è emersa l'esigenza dello strumento e nel quale i suoi possibili utilizzi possono essere ulteriormente esplorati e valutati.

---

## Autore

Gianmarco Bonavolonta  
Repository: [https://github.com/bonavolonta/video-annotator](https://github.com/bonavolonta/video-annotator)

---

## Versione

Questa documentazione si riferisce a video-annotator 1.4.0.
