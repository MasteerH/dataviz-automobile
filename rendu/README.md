# TP Visualisation de données - Dataset Automobile en d3.js

Auteurs : MAHDIR Hamza, EL AZIZI Amira Mariam


## Lancement

Ouvrir index.html. Pas besoin de serveur ni d'internet.


## Données

Dataset Automobile du UCI Machine Learning Repository :
https://archive.ics.uci.edu/dataset/10/automobile

Au départ on a 205 voitures et 26 attributs. Après nettoyage on garde 201 voitures, 12 attributs numériques et 3 catégoriels (make, fuel-type, body-style).


## Choix de suppression

Le prof nous a demandé de garder entre 10 et 15 attributs numériques et au moins 200 lignes. Les valeurs manquantes sont notées "?" dans le fichier.

- ```normalized-losses``` : 41 valeurs manquantes (20%). Si on supprime les lignes on perd trop de voitures, et si on remplace par la moyenne on fausse la distribution. Donc on supprime la colonne.
- ```bore``` et ```stroke``` : manquants seulement pour 4 Mazda à moteur rotatif. Ces moteurs n'ont pas de piston donc la valeur n'existe pas. On supprime les colonnes.
- ```horsepower``` et ```peak-rpm``` : si on les garde avec price il faut supprimer 6 lignes et on tombe à 199. On a préféré garder price. On ne perd pas beaucoup d'information pour horsepower car engine-size est très corrélé avec (r = 0.81).
- 4 voitures sans prix : ce sont les seules lignes supprimées.
- Les autres attributs catégoriels ne servent pas pour l'analyse.


## Visualisations

La page contient 3 graphiques. Quand on sélectionne des voitures dans un graphique, elles sont mises en évidence dans les deux autres.

Couleurs : bleu pour l'essence, orange pour le diesel, gris pour les voitures non sélectionnées.

### Matrice de scatterplots

- On compare les 12 dimensions deux à deux (matrice 12 x 12).
- On peut tracer un rectangle dans une case pour sélectionner des voitures. La sélection apparaît dans toutes les cases.
- On peut cliquer sur une case de la diagonale pour choisir la dimension de l'histogramme.

### Coordonnées parallèles

- Chaque axe est une dimension et chaque ligne est une voiture.
- On peut sélectionner un intervalle sur un axe. Si on sélectionne sur plusieurs axes, on garde les voitures qui respectent toutes les conditions.
- On peut cliquer sur le titre d'un axe pour choisir la dimension de l'histogramme.

### Histogramme et courbe de gaussiennes

- On peut choisir la dimension avec le menu, ou en cliquant dans les autres graphiques.
- Le slider ```Nombre de colonnes``` va de 2 à 50.
- Le slider ```Largeur des gaussiennes``` va de 1% à 25% de l'étendue de la dimension (max - min).
- Les colonnes sont calculées à la main, sans ```d3.bin()```. Toutes les colonnes sont de la forme [a, b[ sauf la dernière qui est [a, b], pour que la valeur maximale soit comptée.
- La courbe est la somme d'une gaussienne d'amplitude 1 par voiture. Elle est calculée tous les 3 pixels et elle a sa propre échelle (axe de droite), donc son maximum touche le haut du graphique.
- On peut tracer un intervalle sur l'histogramme pour sélectionner des voitures.

### Autres

- Le bouton ```Effacer la sélection``` annule la sélection.
- Un compteur affiche le nombre de voitures sélectionnées.
- Au survol d'un point ou d'une ligne, on voit la marque, le prix et le carburant.

Exemple : avec la dimension ```compression-ratio``` et une petite largeur, la courbe montre deux groupes. Si on sélectionne le groupe de droite (entre 21 et 23), on retrouve les 20 voitures diesel.


## Fichiers

- ```index.html``` et ```style.css``` : la page
- ```data.js``` : les données nettoyées : 201 voitures et 15 colonnes
- ```d3.v7.min.js``` : la librairie d3 en local
- ```main.js``` : la sélection partagée entre les graphiques et le choix de la dimension
- ```splom.js``` : la matrice de scatterplots
- ```parallel.js``` : les coordonnées parallèles
- ```kde.js``` : le calcul de la courbe de gaussiennes
- ```histogram.js``` : l'histogramme et les sliders
- ```pair.js``` : vue agrandie de deux dimensions, liée aux autres sélections


## Exploration détaillée et filtrage

- Le brushing existe dans les trois vues. Cocher « Afficher uniquement la sélection » masque les voitures hors sélection ; décocher restaure le contexte sans perdre la sélection. Le bouton de réinitialisation réaffiche tout et désactive le filtre.
- La courbe est une somme de gaussiennes non normalisée. En mode filtré elle porte sur le groupe sélectionné, sinon sur les 201 voitures. Son échelle verticale est indépendante des effectifs ; une intersection courbe/barre ne signifie pas une égalité.
- La vue agrandie d'une paire est accessible par les menus ou par double-clic sur une cellule. Elle conserve les couleurs et la sélection liée. Les matrices et parallèles tiennent dans la largeur disponible ; utiliser la paire pour les détails sur petit écran.
- Le résumé indique les effectifs par carburant, le prix médian et le rendement médian en ville. Les tooltips des bins affichent bornes et effectifs. L'histogramme conserve la sélection lors du redimensionnement.
- Le script ../scripts/prepare_data.py est conservé pour reproduire le nettoyage. Il nécessite Python et pandas, mais l'application livrée ne nécessite aucune installation.

## Évaluation à réaliser

Faire essayer à quelques personnes : sélectionner les diesels via le taux de compression, activer le filtrage, lire la médiane puis réinitialiser. Noter erreurs et hésitations. Aucun résultat d'essai humain n'est revendiqué.


## Filtrer sans geste à apprendre

Le formulaire « Quelles voitures voulez-vous voir ? » permet de choisir Essence ou Diesel, puis éventuellement une dimension et ses bornes incluses. Les bornes vides ne limitent pas la plage. Un aperçu indique le nombre de correspondances ; cliquer sur « Afficher ces voitures » applique le filtre dans toutes les vues. « Tout afficher » annule les critères. Les brushes restent une autre façon de choisir un groupe et remplacent les critères du formulaire.


## Vérifications techniques du 16 octobre 2026

Chargement dans Chrome avec réseau désactivé, ressources locales présentes et syntaxe JavaScript contrôlée. Données comparées aux lignes brutes nettoyées : 201 voitures, 15 colonnes, aucune valeur manquante. Vérification des 588 combinaisons dimension/nombre de colonnes : effectif total, respect des intervalles et inclusion des maxima. Les arrondis flottants aux bornes intermédiaires sont corrigés manuellement après calcul de l'indice. Les sélections liées, filtres simples et combinés, cas vides, annulation et redimensionnement ont été testés. Aucun appel à fetch, d3.csv ou d3.bin ; aucune ressource réseau chargée.

Les tests humains restent à faire. Sur petit écran, utiliser la paire agrandie pour lire les détails de la matrice. La compilation et la mise en page du PDF du rapport restent à vérifier dans un environnement LaTeX.
