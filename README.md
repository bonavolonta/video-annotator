# video-annotator

**video-annotator** è un'applicazione web per l'annotazione temporale di video e l'analisi filmica, progettata per operare sia con **file video locali** che con **video YouTube**, con supporto a **sottotitoli esterni (.srt e .vtt)**.

* **Versione:** `v1.3` (evoluzione di v1.2 con integrazione hotfix YouTube e sottotitoli esterni)
* **File applicazione principale:** [`index.html`](index.html)
* **Repository GitHub:** [https://github.com/bonavolonta/video-annotator](https://github.com/bonavolonta/video-annotator)
* **Sito Web (GitHub Pages):** [https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)

---

## Novità di video-annotator v1.3 — Sottotitoli Esterni

1. **Supporto formati standard .srt e .vtt:**
   * Caricamento ed elaborazione di file SubRip (`.srt`) e WebVTT (`.vtt`), con supporto a codifiche UTF-8, BOM, interruzioni di riga Windows/Unix (`\r\n` e `\n`), millisecondi con virgola o punto, note di commento e tag cue WebVTT.
2. **Requisito UX fondamentale — Nessun overlay sul quadro video:**
   * I sottotitoli non sono mai sovrapposti all'immagine cinematografica. Vengono visualizzati in una fascia dedicata e stabile (`subtitleRail`) collocata immediatamente **sotto** il quadro video (`mediaViewport`), preservando l'integrità del fotogramma e il rapporto d'aspetto originale.
   * La fascia mantiene stabilità visiva: non salta né si ridimensiona a ogni battuta; quando i sottotitoli sono attivi ma la battuta corrente è vuota, l'area rimane presente e silenziosa.
3. **Sincronizzazione bivalente (Locale & YouTube):**
   * Ricerca efficiente della battuta attiva tramite algoritmo di bisezione binaria `O(log N)`.
   * Piena integrazione con il `MediaAdapter`, garantendo la sincronizzazione istantanea sia durante la normale riproduzione sia in fase di scrub/seek.
4. **Regolazione offset di sincronizzazione (Sync Offset):**
   * Calibrazione temporale fine a passi di `±0,5 s` per compensare eventuali discrepanze di sincronizzazione tra video e traccia sottotitoli, con indicazione numerica chiara (es. `+0,5 s`, `−1,0 s`) e pulsante `Reset sync`.
5. **Pannello di controllo sottotitoli (Popover CC):**
   * Pulsante discreto `CC / Sottotitoli` nella barra degli strumenti (attivabile anche con la scorciatoia da tastiera `C`).
   * Dialog popover con interfaccia per caricare nuovi file, attivare/disattivare la visualizzazione (`ON / OFF`), selezionare la dimensione del carattere (`A−` piccolo, `A` medio, `A+` grande), regolare la sincronizzazione o rimuovere la traccia attiva.
   * Chiusura agevole con clic esterno o tasto `Esc`.
6. **Supporto Schermo Intero (Fullscreen) coerente:**
   * La modalità a schermo intero mostra congiuntamente il quadro video e la fascia sottotitoli sottostante, senza ricorrere a overlay nativi e disabilitando il fullscreen nativo del browser che escluderebbe i sottotitoli.
7. **Privacy e Sicurezza by Design:**
   * Elaborazione 100% lato client tramite l'API `FileReader` del browser: nessun file di sottotitoli viene caricato su server esterni o architetture cloud.
   * Rendering testuale protetto esclusivamente tramite `textContent` (nessun utilizzo di `innerHTML` per i testi dei sottotitoli), prevenendo qualsiasi vettore di vulnerabilità XSS da contenuti non attendibili.
8. **Persistenza di sessione e gestione robusta delle quote di memoria:**
   * Stato dei sottotitoli (nome file, formato, battute, offset, stato abilitato, dimensione font) salvato nella sessione locale e ripristinato automaticamente al ricaricamento della pagina.
   * Gestione protetta dell'errore di quota (`QuotaExceededError`): se il `localStorage` è saturo a causa di file di sottotitoli molto corposi, l'applicazione degrada con grazia mantenendo la traccia in memoria, salvando le annotazioni e notificando l'utente senza interrompere la visione.

---

## Caratteristiche ereditate da video-annotator v1.2

1. **Doppia sorgente video integrata:**
   * **File video locale:** riproduzione tramite HTML5 `<video>` nativo ed elaborazione interamente locale nel browser.
   * **Video YouTube:** riproduzione tramite la **YouTube IFrame Player API ufficiale** (`https://www.youtube.com/iframe_api`), compatibile con tutti i formati di URL e ID.
2. **Architettura unificata (MediaAdapter):**
   * Normalizzazione di tempo corrente, durata, controlli di riproduzione/pausa e seek per entrambe le sorgenti.
3. **Persistenza e isolamento multi-sorgente:**
   * Chiavi separate nel `localStorage` (`video-annotator:v1:local:...` e `video-annotator:v1:youtube:...`), senza collisioni tra video diversi.
4. **Disaccoppiamento polling UI e scritture su storage:**
   * Polling UI fluido (~250 ms) disaccoppiato dal salvataggio su storage (throttled a ~1.5 s e immediato su eventi salienti).
5. **Ripristino intelligente dopo refresh:**
   * YouTube: ripristino automatico istantaneo di video, playhead, annotazioni e sottotitoli.
   * File locale: scheda "Riprendi ultimo film" con ripristino sicuro dopo riselezione del file.
6. **Esportazione CSV conforme a RFC 4180 con schema canonico inglese:**
   * Schema unificato e indipendente dalla lingua dell'interfaccia (`ID,Type,IN,OUT,IN_seconds,OUT_seconds,Comment,Source,Video`), valori canonici (`marker`, `segment`, `local`, `youtube`), filename descrittivo e BOM UTF-8 per compatibilità totale con Excel e LibreOffice.
7. **Gestione pulita della sessione:**
   * Funzione "Dimentica questa sessione" con distruzione rigorosa degli iframe YouTube e prevenzione della riesumazione automatica dei dati.

---

## Scorciatoie da tastiera

| Tasto | Azione |
| :--- | :--- |
| `M` | Inserisce un marker temporale puntuale sul frame corrente |
| `I` | Imposta il punto di inizio (IN) per un segmento |
| `O` | Imposta il punto di fine (OUT) per un segmento e apre l'editor |
| `C` | Apre / chiude il pannello di gestione dei sottotitoli |
| `A` | Apre il cassetto laterale con l'elenco delle annotazioni |
| `F` | Attiva / disattiva la modalità a schermo intero |
| `Esc` | Chiude il cassetto laterale, il popover dei sottotitoli o la modalità fullscreen |

---

## Test automatici

Il progetto include una suite completa di test unitari per Node.js eseguibile con:

```bash
npm test
```

La suite comprende 7 gruppi di test:
1. Validazione ed estrazione degli ID video da tutti i formati URL YouTube.
2. Funzionamento unificato del `MediaAdapter` per file locale e YouTube.
3. Isolamento e persistenza dei dati nel `localStorage` con fallback per dati pregressi.
4. Mappatura esaustiva dei codici di errore YouTube (2, 5, 100, 101, 150, 153).
5. Formattazione dell'esportazione CSV (RFC 4180 con BOM UTF-8).
6. Teardown delle risorse multimediali e semantica "Dimentica questa sessione".
7. **External Subtitle Engine (v1.3):**
   * 7.1 Parser SRT (CRLF/LF, BOM, virgola nei millisecondi, caratteri Unicode);
   * 7.2 Parser WebVTT (header, blocchi NOTE, settings di posizionamento ignorati in sicurezza, punto nei millisecondi);
   * 7.3 Selezione cue tramite binary search (prima, durante, dopo, battute multiriga);
   * 7.4 Offset temporale (passi ±0,5 s e formattazione con segno e virgola decimale);
   * 7.5 Persistenza su storage e gestione controllata dell'errore di quota (`QuotaExceededError`);
   * 7.6 Sicurezza contro vettori XSS (uso rigoroso di `textContent`, nessuna esecuzione script).

---

## Code Review: Alibaba OpenCodeReview in Delegation Mode

Il progetto rispetta lo standard **Alibaba OpenCodeReview** in **Delegation Mode**:

1. **Ispezione dell'anteprima del diff**:
   ```bash
   npx ocr delegate preview --format json
   ```
2. **Ispezione delle regole**:
   ```bash
   npx ocr delegate rule <file>
   ```
3. **Criteri di conformità v1.3**:
   * Assoluta assenza di overlay video: sottotitoli collocati in fascia inferiore non invasiva;
   * Zero regressioni su riproduzione locale, YouTube e MediaAdapter;
   * Parsing client-side sicuro e immunità XSS (`textContent`);
   * Gestione resiliente dello storage e prevenzione di loop/blocchi per file voluminosi.

---

## Note Storiche

* [Report Code Review Baseline v1.1](docs/CODE_REVIEW_BASELINE.md)
* [Note di rilascio v1.1 originarie](docs/BASELINE_v1.1_NOTES.md)
