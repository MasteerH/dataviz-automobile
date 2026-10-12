# Notes pour le rapport — TP2 Visualisation exploratoire (d3.js)

## 1. Choix du jeu de données

**Dataset retenu : Automobile (1985 Auto Imports Database)** — UCI Machine Learning Repository
https://archive.ics.uci.edu/dataset/10/automobile

- 205 voitures, 26 attributs (15 continus, 1 entier, 10 nominaux).
- Données interprétables par tout le monde (prix, dimensions, consommation, moteur), ce qui permet de raconter des observations concrètes pendant la démo.
- Taille adaptée au rendu SVG (quelques centaines de points, interaction fluide).

**Datasets écartés :**
- *Algerian Forest Fires* : seulement ~10 attributs numériques réellement exploitables (`year` constant, `day`/`month` = dates), et les indices FWI (`FFMC`, `DMC`, `DC`, `ISI`, `BUI`, `FWI`) sont calculés les uns à partir des autres → dimensions redondantes. Fichier CSV également mal formé (deux tableaux concaténés).
- *Image Segmentation* : jeu utilisé dans l'exemple du cours.

## 2. Contraintes fixées

- Entre 10 et 15 attributs numériques.
- Au moins 200 lignes conservées (sur 205) → au plus 5 lignes supprimables.

## 3. Valeurs manquantes (notées `?`)

| Colonne | Nb de `?` | Lignes concernées |
|---|---|---|
| `normalized-losses` | 41 | réparties dans tout le fichier |
| `num-of-doors` | 2 | dodge (l.28), mazda (l.64) |
| `bore`, `stroke` | 4 | les 4 mêmes Mazda (l.56–59) |
| `horsepower`, `peak-rpm` | 2 | les 2 mêmes Renault (l.131–132) |
| `price` | 4 | audi, isuzu ×2, porsche |

**Options étudiées :**

| Option | Colonnes supprimées | Lignes supprimées | Lignes finales | Numériques |
|---|---|---|---|---|
| A | toutes les colonnes avec `?` | 0 | 205 | 10 (+1) |
| **B (retenue)** | `normalized-losses`, `bore`, `stroke`, `horsepower`, `peak-rpm` | 4 (prix manquant) | **201** | **12** |
| C | `normalized-losses`, `bore`, `stroke`, `price` | 2 | 203 | 12 (+1) |

Garder à la fois `price` et `horsepower` imposerait de supprimer 6 lignes → 199 < 200 : impossible.
L'imputation (moyenne/médiane) a été rejetée : 41 valeurs identiques dans `normalized-losses` créeraient un pic artificiel dans l'histogramme et la densité.

## 4. Justification de l'option B

- **`normalized-losses`** : 41 valeurs manquantes sur 205 (20 %) — la supprimer ligne par ligne ferait tomber à 164 lignes ; l'imputer fausserait sa distribution.
- **`bore` / `stroke`** (alésage / course) : manquants uniquement pour les 4 Mazda à **moteur rotatif** (Wankel), qui n'ont pas de piston. La valeur n'est pas « perdue », elle **n'existe pas physiquement** → suppression de la colonne plutôt que des lignes.
- **`horsepower` / `peak-rpm`** : supprimées pour pouvoir garder `price` tout en restant ≥ 200 lignes. Perte limitée pour `horsepower` : elle est fortement corrélée à `engine-size` (r = 0.81), qui reste disponible. En revanche `peak-rpm` n'est presque pas corrélée à `engine-size` (r = -0.24) : c'est une vraie perte d'information, assumée pour garder `price`.
- **4 lignes sans `price`** supprimées : `price` est la variable la plus parlante du jeu, on préfère perdre 4 voitures que cette dimension.
- **`num-of-doors`** : supprimée (catégorielle, 2 `?`, peu utile pour l'analyse).

## 5. Attributs conservés

**12 numériques** (axes de la matrice scatterplot et des coordonnées parallèles) :
`symboling`, `wheel-base`, `length`, `width`, `height`, `curb-weight`, `num-of-cylinders`, `engine-size`, `compression-ratio`, `city-mpg`, `highway-mpg`, `price`

- `num-of-cylinders` est stocké en texte (`four`, `six`…) → converti en nombre.
- `symboling` : entier de -3 (sûr) à +3 (risqué), note de risque d'assurance.

**Catégoriels conservés (non dessinés sur les axes) :**
- `fuel-type` → couleur des points/lignes (gas / diesel)
- `make` → tooltip
- `body-style` → couleur alternative (optionnel)

**Supprimés car hors analyse :** `aspiration`, `drive-wheels`, `engine-location`, `engine-type`, `fuel-system`.

## 6. Observation à montrer en démo

`compression-ratio` est **bimodale** : ~185 voitures entre 7 et 11.5 (essence) et ~20 entre 21 et 23 (**diesel**). Le slider de largeur du noyau gaussien montre bien qu'un lissage trop fort efface la seconde bosse ; une sélection de ce groupe surligne exactement les voitures `fuel-type = diesel` dans les autres vues.

## 7. Choix techniques

- Application 100 % hors ligne, sans serveur : ouverture directe de la page HTML dans Chrome (`file://`), conformément aux consignes.
- Les données sont donc chargées via un fichier `data.js` (`const data = [...]`) inclus par une balise `<script>`, comme dans l'exemple du cours (`d3.csv()` est bloqué par Chrome en `file://`).
- Bibliothèque : `d3.v7.min.js` (version locale fournie).
