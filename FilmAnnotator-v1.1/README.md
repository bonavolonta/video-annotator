# FilmAnnotator v1.1

Applicazione web locale per annotazioni temporali su film.

## Novita v1.1

- salvataggio automatico locale delle annotazioni;
- salvataggio del punto di riproduzione;
- salvataggio dell'eventuale punto IN ancora aperto;
- schermata "Riprendi ultimo film" dopo refresh o riapertura;
- riconoscimento dello stesso file tramite nome, dimensione e data di modifica.

## Come riprendere dopo un refresh

1. Riapri FilmAnnotator nello stesso browser.
2. Premi "Riprendi ultimo film".
3. Riseleziona lo stesso file video.
4. Annotazioni e posizione di visione vengono ripristinate automaticamente.

Il browser non consente a una pagina HTML locale di riaprire liberamente un file video senza un nuovo consenso dell'utente. Per questo il film deve essere riselezionato; il video non viene copiato o caricato online.

## Dove sono salvati i dati

Le annotazioni sono memorizzate nel localStorage del browser e restano sul dispositivo. La persistenza dipende dal browser e dalla stessa origine/percorso con cui viene aperta l'applicazione. Cancellare i dati del browser puo eliminare il salvataggio locale. L'esportazione CSV resta quindi consigliata come copia finale del lavoro.
