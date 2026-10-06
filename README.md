# TP2 — Visualisation exploratoire en d3.js (Automobile)

Application web interactive (HTML / SVG / JavaScript + d3.js v7) pour explorer le jeu de données **Automobile** (UCI Machine Learning Repository) à l'aide de trois vues synchronisées :

- une **matrice de scatterplots** ;
- une vue en **coordonnées parallèles** ;
- un **histogramme superposé à une courbe de densité à noyau gaussien** (largeur des colonnes et lissage réglables par sliders).

Une sélection faite dans une vue est mise en évidence simultanément dans les deux autres.

**Auteurs :** MAHDIR Hamza · EL AZIZI Amira Mariam

## Structure du dépôt

```
TP2/
├── README.md            ← ce fichier (dépôt de travail)
├── NOTES_RAPPORT.md     ← justifications des choix, base du compte rendu
├── automobile/          ← données brutes UCI (imports-85.data / .names)
├── scripts/             ← préparation des données (génération de rendu/data.js)
└── rendu/               ← dossier à déposer pour l'enseignant
    ├── README.md
    ├── index.html
    ├── data.js
    └── d3.v7.min.js
```

## Lancer l'application

Aucune installation ni serveur : ouvrir `rendu/index.html` dans **Chrome / Chromium** (double-clic).

## Données

- Source : https://archive.ics.uci.edu/dataset/10/automobile
- Après nettoyage : **201 voitures**, **12 attributs numériques** + 3 catégoriels (`make`, `fuel-type`, `body-style`).
- Détail des choix de nettoyage : voir [NOTES_RAPPORT.md](NOTES_RAPPORT.md).

## Travail à deux

- `git pull` avant de commencer, `git push` dès qu'une partie fonctionne.
- Commits petits et fréquents, messages explicites.
- Un fichier JavaScript par visualisation pour limiter les conflits.
