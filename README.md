# video-annotator

**video-annotator** è un'applicazione web locale per l'annotazione temporale di video e l'analisi filmica.

* **Versione baseline:** `v1.1` (originariamente costituita come FilmAnnotator v1.1 al commit `2e3617c`)
* **File applicazione principale:** [`index.html`](index.html) (strutturato e pronto per la pubblicazione su GitHub Pages)
* **Repository GitHub:** [https://github.com/bonavolonta/video-annotator](https://github.com/bonavolonta/video-annotator)

---

## Caratteristiche principali (v1.1)

* **Trattamento locale del video (Privacy & Sicurezza):** Il video viene elaborato interamente sul dispositivo locale tramite le File API del browser. Nessun file multimediale viene caricato o trasmesso a server esterni.
* **Supporto a marker puntuali:** Inserimento rapido di marcatori temporali su singoli frame significativi (scorciatoia da tastiera `M`).
* **Supporto a segmenti IN–OUT:** Definizione di intervalli temporali continui con punti di inizio (`I`) e fine (`O`).
* **Commenti testuali:** Possibilità di associare descrizioni e note di analisi dettagliate a ogni marker o segmento.
* **Esportazione CSV:** Download immediato di tutte le annotazioni in formato CSV per l'archiviazione, la condivisione e l'elaborazione in fogli di calcolo.
* **Autosalvataggio locale:** Tutte le annotazioni e lo stato della sessione vengono salvati automaticamente nel `localStorage` del browser.
* **Ripristino della posizione di visione:** Ripristino automatico dell'ultimo punto di riproduzione (playhead) e delle annotazioni al ricaricamento della pagina o alla riselezione dello stesso video.
* **Compatibilità video:** La riproduzione dei formati video dipende dai codec supportati dal motore del browser in uso (è consigliato il formato MP4 con codec H.264/AAC o WebM per la massima compatibilità).

---

## Utilizzo

1. Apri il file [`index.html`](index.html) in un browser moderno (Chrome, Edge, Firefox, Safari).
2. Trascina un file video nell'area di rilascio oppure clicca su **"Seleziona film"**.
3. Durante la riproduzione:
   * Premi `M` per inserire un marker sul frame corrente;
   * Premi `I` per impostare l'inizio (IN) di un segmento e `O` per la fine (OUT);
   * Premi `A` per aprire il pannello con la lista delle annotazioni;
   * Premi `F` per attivare o disattivare lo schermo intero.
4. Clicca su **"Esporta CSV"** per salvare una copia del lavoro svolto.

---

## Roadmap

Funzionalità previste per le versioni successive:
* Integrazione sorgenti video esterne (ad es. supporto per video YouTube);
* Esportazione e importazione completa delle annotazioni in formato JSON;
* Modalità di visualizzazione e filtri avanzati per la timeline;
* Suite di test automatici e integrazione CI/CD.

---

## Code Review: Alibaba OpenCodeReview in Delegation Mode

Il progetto integra `@alibaba-group/open-code-review` come dipendenza locale di sviluppo.

Per evitare la necessità di configurare API key esterne dedicate a OCR, il progetto adotta la **Delegation Mode**:
* **OpenCodeReview** determina l'ambito dei file modificati e fornisce le regole di analisi;
* **Antigravity** (l'assistente AI di sviluppo) esegue materialmente la revisione del codice applicando tali regole con il proprio modello;
* Ogni file contrassegnato da OCR come `reviewable` viene esaminato accuratamente prima del commit.

### Procedura di Revisione Pre-Commit

Prima di ogni commit funzionale, il workflow operativo prevede:

1. **Determinazione dello scope**:
   ```bash
   npx ocr delegate preview --format json
   ```
   oppure anteprima testuale:
   ```bash
   npm run review:preview
   ```
2. **Ispezione delle regole di analisi**:
   ```bash
   npx ocr delegate rule <file>
   ```
3. **Analisi del diff e del codice**: lettura attenta delle modifiche introdotte rispetto alle regole fornite (Correttezza, Sicurezza, Performance, Manutenibilità, Testabilità).
4. **Classificazione dei rilievi**:
   * *Errore concreto*
   * *Problema di sicurezza*
   * *Problema di compatibilità*
   * *Miglioramento consigliato*
   * *Falso positivo / non pertinente*
5. **Risoluzione mirata**: correzione esclusiva dei problemi fondati, preservando l'integrità funzionale.
6. **Verifica finale**: ripetizione della preview e test applicativo.

### Script npm disponibili

* `npm run review:preview`: Anteprima sintetica dei file modificati e di quelli esclusi dalle regole OCR.
* `npm run review:delegate`: Output in formato JSON della spec di revisione in modalità delega.
* `npm run review:scan`: Scansione completa dei file della repository.

### Documentazione Baseline e Note Storiche

* [Report Code Review Baseline v1.1](docs/CODE_REVIEW_BASELINE.md)
* [Note di rilascio v1.1 originarie](docs/BASELINE_v1.1_NOTES.md)
