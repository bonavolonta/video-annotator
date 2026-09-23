# FilmAnnotator

**FilmAnnotator** è un'applicazione web locale per l'annotazione temporale di video e l'analisi filmica.

* **Versione baseline:** `v1.1`
* **File applicazione:** [`FilmAnnotator-v1.1/FilmAnnotator.html`](FilmAnnotator-v1.1/FilmAnnotator.html)

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

1. Apri il file [`FilmAnnotator-v1.1/FilmAnnotator.html`](FilmAnnotator-v1.1/FilmAnnotator.html) in un browser moderno (Chrome, Edge, Firefox, Safari).
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

## Strumenti di sviluppo: Alibaba OpenCodeReview (`ocr`)

Il progetto include localmente `@alibaba-group/open-code-review` come dipendenza di sviluppo (`devDependencies`).

### Script npm disponibili

* **Anteprima dei file da revisionare (senza consumo di token):**
  ```bash
  npm run review:preview
  ```
* **Revisione con OpenCodeReview (modalità agente):**
  ```bash
  npm run review
  ```
* **Scansione completa del codice:**
  ```bash
  npm run review:scan
  ```

### 1. Configurazione del Provider LLM

Per abilitare l'analisi con modello linguistico, è possibile impostare un provider e la relativa chiave API:

```bash
npm run ocr:config -- provider
npm run ocr:config -- model
```

Oppure direttamente via CLI:

* **Google Gemini:**
  ```bash
  npx ocr config set provider gemini
  npx ocr config set model gemini-2.5-flash
  npx ocr config set providers.gemini.api_key "LA_TUA_CHIAVE_API"
  ```
* **Anthropic:**
  ```bash
  npx ocr config set provider anthropic
  npx ocr config set model claude-3-7-sonnet-20250219
  npx ocr config set providers.anthropic.api_key "LA_TUA_CHIAVE_API"
  ```
* **OpenAI:**
  ```bash
  npx ocr config set provider openai
  npx ocr config set model gpt-4o
  npx ocr config set providers.openai.api_key "LA_TUA_CHIAVE_API"
  ```

### 2. Verifica della connettività

```bash
npx ocr llm test
```

### 3. Report di Code Review Baseline

Il report diagnostico iniziale condotto con OpenCodeReview sulla v1.1 è consultabile in [`docs/CODE_REVIEW_BASELINE.md`](docs/CODE_REVIEW_BASELINE.md).
