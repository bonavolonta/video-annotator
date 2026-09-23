# video-annotator

**video-annotator** è un'applicazione web per l'annotazione temporale di video e l'analisi filmica, progettata per operare sia con **file video locali** che con **video YouTube**.

* **Versione:** `v1.2` (evoluzione della baseline v1.1 originariamente costituita al commit `2e3617c`)
* **File applicazione principale:** [`index.html`](index.html)
* **Repository GitHub:** [https://github.com/bonavolonta/video-annotator](https://github.com/bonavolonta/video-annotator)
* **Sito Web (GitHub Pages):** [https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)

---

## Novità di video-annotator v1.2

1. **Doppia sorgente video integrata:**
   * **File video locale:** riproduzione tramite HTML5 `<video>` nativo ed elaborazione interamente locale nel browser (senza upload o trasmissione di dati a server esterni).
   * **Video YouTube:** riproduzione tramite la **YouTube IFrame Player API ufficiale** (`https://www.youtube.com/iframe_api`), compatibile con URL in formato standard (`watch?v=`), abbreviato (`youtu.be/`), incorporato (`embed/`), Shorts (`shorts/`) o ID diretto.
2. **Architettura unificata (MediaAdapter):**
   * Livello di astrazione che normalizza l'accesso al tempo corrente, alla durata, al controllo di riproduzione/pausa e al seek sia per il player HTML5 locale sia per il player YouTube.
3. **Persistenza e isolamento multi-sorgente:**
   * Chiavi di memorizzazione separate nel `localStorage` (`video-annotator:v1:local:...` e `video-annotator:v1:youtube:...`), prevenendo qualsiasi collisione o sovrapposizione di annotazioni tra video diversi.
   * Retrocompatibilità completa con i dati salvati dalle versioni precedenti.
4. **Disaccoppiamento polling UI e scritture su storage:**
   * Aggiornamento fluido dell'interfaccia temporale (~250 ms) separato dalla persistenza su storage locale, ottimizzata con salvataggio throttled (~1.5 s) e scritture immediate su eventi salienti (pausa, seek, aggiunta/modifica/eliminazione annotazioni, impostazione punti IN-OUT, cambio sorgente, passaggio della pagina in background).
5. **Ripristino intelligente dopo refresh:**
   * **YouTube:** al ricaricamento della pagina, il player YouTube viene ricreato automaticamente ricaricando lo stesso videoId, le annotazioni e la posizione di visione (playhead), senza richiedere all'utente di incollare nuovamente l'URL.
   * **File locale:** per ragioni di sicurezza e sandbox del browser, la pagina mostra la scheda "Riprendi ultimo film"; riselezionando lo stesso file (verificato tramite nome, dimensione e timestamp), annotazioni e playhead vengono ripristinati istantaneamente.
6. **Esportazione CSV arricchita (RFC 4180):**
   * Il file CSV include ora le colonne `Sorgente` (`local` o `youtube`) e `Video` (nome del file locale o URL canonico YouTube), mantenendo la formattazione con BOM UTF-8, quoting rigoroso ed escaping delle virgolette per la compatibilità con Excel, LibreOffice e software di analisi.
7. **Suite di test automatici integrata:**
   * Test automatici per il parser degli URL YouTube, MediaAdapter, storage locale multi-sorgente e fallback legacy, codici di errore YouTube e formattazione CSV.

---

## Caratteristiche principali

* **Privacy e Copyright by Design:**
  * Nessun download, caching o ri-streaming di video YouTube.
  * Il video YouTube viene visualizzato esclusivamente tramite l'IFrame Player ufficiale fornito da YouTube nel pieno rispetto delle condizioni di servizio, mantenendo intatti controlli, branding e attribuzioni.
  * Nel `localStorage` vengono salvati esclusivamente metadati applicativi (ID sorgente, timestamp, commenti).
* **Supporto a marker puntuali:** Inserimento rapido di marcatori temporali su singoli frame significativi (scorciatoia da tastiera `M`).
* **Supporto a segmenti IN–OUT:** Definizione di intervalli temporali continui con punti di inizio (`I`) e fine (`O`).
* **Commenti e analisi testuale:** Descrizioni dettagliate associate a ciascun marker o segmento, modificabili ed eliminabili direttamente dal pannello laterale.
* **Timeline interattiva:** Visualizzazione grafica di tutti i marker e segmenti posizionati sulla durata del video con navigazione immediata (seek) al clic.
* **Schermo intero:** Modalità cinema/fullscreen attivabile con scorciatoia `F` o pulsante dedicato.

---

## Limiti e gestione degli errori YouTube

L'integrazione di YouTube si basa sull'incorporamento ufficiale. Di conseguenza:
* **Video non incorporabili (codici 101 e 150):** Se l'autore del video o le impostazioni di copyright/licenza di YouTube disabilitano l'incorporamento su siti esterni, il player YouTube non consentirà la riproduzione. L'applicazione rileva l'evento e notifica chiaramente l'utente a schermo.
* **Video privati o rimossi (codice 100):** Notifica tempestiva all'utente.
* **Restrizioni di origine e referer (codice 153):** Quando il video o YouTube richiedono un'origine HTTP/HTTPS valida o vietano referer specifici, viene mostrato un messaggio esplicativo dedicato.
* In caso di errore del player, l'interfaccia applicativa rimane pienamente utilizzabile consentendo l'apertura di un altro video o l'esportazione delle annotazioni già presenti.

---

## Utilizzo

1. Apri [`index.html`](index.html) in un browser moderno (oppure collegati a [https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)).
2. Scegli la sorgente:
   * **File locale:** Trascina un file video nell'area di rilascio oppure clicca su **"Seleziona film"**.
   * **YouTube:** Clicca sulla scheda **"YouTube"**, incolla l'URL o l'ID del video e clicca su **"Apri video"**.
3. Durante la visione:
   * Premi `M` per inserire un marker sul frame corrente;
   * Premi `I` per impostare l'inizio (IN) di un segmento e `O` per la fine (OUT);
   * Premi `A` per aprire il cassetto con la lista completa delle annotazioni;
   * Premi `F` per attivare o disattivare lo schermo intero;
   * Premi `Esc` per chiudere il cassetto delle annotazioni.
4. Clicca su **"Esporta CSV"** in qualunque momento per scaricare il report completo con tutti i timestamp e le note.

---

## Test automatici

Il progetto include una suite di test statici e unitari per Node.js senza dipendenze esterne pesanti:

```bash
npm test
```

I test verificano:
* Validazione ed estrazione degli ID video da tutti i formati URL YouTube (watch, youtu.be, embed, shorts);
* Funzionamento del `MediaAdapter` sia in modalità file locale sia in modalità YouTube;
* Isolamento e persistenza dei dati nel `localStorage` con retrocompatibilità per dati v1.1;
* Mappatura completa ed esaustiva di tutti i codici di errore YouTube (2, 5, 100, 101, 150, 153);
* Formattazione CSV v1.2 (BOM UTF-8, colonne `Sorgente` e `Video`, quote escaping RFC 4180).

---

## Code Review: Alibaba OpenCodeReview in Delegation Mode

Il progetto include localmente `@alibaba-group/open-code-review` (`devDependencies`) e segue rigorosamente la **Delegation Mode**:

1. **Determinazione dello scope**:
   ```bash
   npx ocr delegate preview --format json
   ```
2. **Ispezione delle regole di analisi**:
   ```bash
   npx ocr delegate rule <file>
   ```
3. **Analisi del diff e rispetto delle linee guida**: Correttezza asincrona API YouTube, race conditions, resilienza del ripristino, sicurezza XSS, disaccoppiamento dello storage e non-regressione della baseline locale.

---

## Note Storiche

* [Report Code Review Baseline v1.1](docs/CODE_REVIEW_BASELINE.md)
* [Note di rilascio v1.1 originarie](docs/BASELINE_v1.1_NOTES.md)
