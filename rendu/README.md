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
