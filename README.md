# Page de présentation de Kisma

Page statique, sans dépendance ni construction ([ADR 0055](../docs/adr/0055-nom-kisma-logo-pince-et-page-de-presentation.md)).

| Fichier | Rôle |
|---|---|
| `index.html` | Contenu et symboles SVG (logo, ornements, icônes) |
| `styles.css` | Palette de l'app (indigo, safran, chaux, teintes de famille), mises en page, animations |
| `main.js` | Intro, vente automatique, démo jouable, hors ligne, tarifs, défilement |
| `reglages.js` | **Seul fichier à toucher** : numéro WhatsApp, message, liens des stores |
| `favicon.svg`, `kisma-icone.png`, `apple-touch-icon.png` | Icônes ; les PNG sont tirés par `app/tool/icones_test.dart` |

## Voir en local

```bash
python -m http.server 4173 --directory site
```

Puis http://localhost:4173. Ajoutez `?sans-intro` pour sauter l'intro ; elle est aussi sautée sur un lien vers une section (`#tarifs`) et après la première visite de la session.

## Mettre en ligne

Copiez le dossier tel quel sur n'importe quel serveur de fichiers. Seule la police vient de Google Fonts.
