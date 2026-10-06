# TP Visualisation de données — Exploration du jeu *Automobile* en d3.js

**Auteurs :** MAHDIR Hamza · EL AZIZI Amira Mariam

## Ouvrir l'application

1. Ouvrir le fichier `index.html` dans **Google Chrome / Chromium** (double-clic).
2. Aucune installation, aucun serveur, aucune connexion Internet requise : les données (`data.js`) et la librairie (`d3.v7.min.js`) sont incluses dans ce dossier.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'application |
| `data.js` | Données nettoyées (`const data = [...]`) |
| `d3.v7.min.js` | Librairie d3.js v7 (version locale) |

## Jeu de données

**Automobile (1985 Auto Imports Database)** — UCI Machine Learning Repository
https://archive.ics.uci.edu/dataset/10/automobile

- Données d'origine : 205 voitures, 26 attributs.
- Après nettoyage : **201 voitures**, **12 attributs numériques** :
  `symboling`, `wheel-base`, `length`, `width`, `height`, `curb-weight`, `num-of-cylinders`, `engine-size`, `compression-ratio`, `city-mpg`, `highway-mpg`, `price`
- Attributs catégoriels conservés : `fuel-type` (couleur), `make` (infobulle), `body-style`.

### Traitement des valeurs manquantes

- Colonnes supprimées : `normalized-losses` (41 valeurs manquantes), `bore` et `stroke` (absentes pour les moteurs rotatifs Mazda), `horsepower` et `peak-rpm` (pour conserver `price` tout en gardant au moins 200 lignes).
- Lignes supprimées : les 4 voitures sans prix.

## Visualisations et interactions

*(à compléter au fil du projet)*

- **Matrice de scatterplots** : …
- **Coordonnées parallèles** : …
- **Histogramme + densité à noyau gaussien** : …
- **Sélection synchronisée** : …
