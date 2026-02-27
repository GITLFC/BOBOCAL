# BOBOCAU — Outil gestion étiquettes (HTML)

Ce projet est une **page HTML autonome** : ouvre `Outil gestion étiquettes Claude.html` dans un navigateur.

## Fonctions ajoutées

- **Historique des plats/étiquettes**: enregistré dans `localStorage` (avec un **brouillon auto**).
- **Dupliquer un plat**: pour créer rapidement des variations.
- **Export PNG (HD)**: via `html2canvas`.
- **Multi-formats**: rond Ø8cm (plat), rond Ø6cm (tapas), rectangulaire 90×55mm.
- **Fond “vraie étiquette”**: switchable selon le format (basé sur des fichiers **PNG/SVG** générés depuis tes EPS).

## Où ajouter les fichiers EPS ?

Le navigateur **ne sait pas afficher un EPS** directement.

- Mets les **originaux EPS** ici:
  - `assets/eps/`
- Mets les **versions exploitables web** ici (PNG ou SVG):
  - `assets/backgrounds/`

Le fichier HTML attend par défaut ces noms:

- `assets/backgrounds/plat-8cm.png`
- `assets/backgrounds/tapas-6cm.png`
- `assets/backgrounds/rect-90x55.png`

Si tu préfères du SVG, tu peux soit:
- exporter en PNG (recommandé pour éviter les surprises), soit
- remplacer les chemins dans le code (`BACKGROUNDS` dans le `<script>` du HTML).

## Conversion EPS → PNG (recommandé)

Objectif: un fond “pro” propre en export PNG.

- **Inkscape**:
  - Ouvrir EPS → Fichier → Exporter
  - Exporter en PNG en gardant une bonne résolution (ex: 1500–3000px de large selon le format)
- **Illustrator**:
  - Ouvrir EPS → Exporter pour écrans / Exporter → PNG
  - Fond transparent si besoin

## Important (export PNG)

Si tu ouvres le fichier en `file://`, certains navigateurs peuvent bloquer le chargement d’images (CORS),
et `html2canvas` peut rater le fond.

Solution simple: lancer un mini serveur local dans le dossier:

```bash
cd "/Users/enkipetrotto/Downloads/BOBOCAU"
python3 -m http.server 8000
```

Puis ouvrir dans le navigateur:
- `http://localhost:8000/Outil%20gestion%20e%CC%81tiquettes%20Claude.html`

