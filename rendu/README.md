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
git commit -am "README : noms de colonnes en code"

(à compléter)
