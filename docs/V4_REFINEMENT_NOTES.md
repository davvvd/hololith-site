# HoloLith v4 — patch incrementale sulla v3

Questa patch sostituisce solo i file indicati nell'archivio. Non eliminare gli altri file del sito e conserva lo sfondo video originale.

1. **Photon Runner**: menu e home ora portano a `/game/play/` (per esempio http://localhost:51420/game/play/ in locale); questa è una pagina HTML autonoma, non un iframe. I tre file del gioco sono copiati in `static/game/play/`. La vecchia `/play/` rimanda alla nuova pagina.
2. **Contact**: eliminato il blocco markdown vuoto finale da `content/contact/index.md` e limitata la larghezza dei form a 640 px, con adattamento mobile. Nota: la configurazione del form `provider: netlify` è preesistente; su GitHub Pages l'invio richiede un provider compatibile, indipendentemente dallo stile.
3. **Hover**: card delle pagine interne allineate all'effetto discreto della home (-2px e bordo blu). Rimossi overlay e grandi trasformazioni al passaggio su intere sezioni.
4. **Hero**: eliminato solo il collegamento "Meet the group" nella prima card della home; la sezione People e la foto del gruppo restano.
5. **Pagine interne**: titoli compatti, contenitori entro 1160 px, paddings ridotti, responsività conservata.

## Verifica locale

- `hugo server -D --port 51420`
- Apri `/`, `/game/play/`, `/play/`, `/contact/`, `/people/`, `/projects/`, `/publication/`, `/post/`, `/event/`, `/gallery/`.
- Verifica responsive (telefono/desktop), hover e temi scuro/chiaro.
- Il gioco non è più incorporato: la nuova URL è una risorsa statica in `static/game/play/`.

Questa patch è stata controllata staticamente ma non con una build Hugo eseguita in questa sessione.
