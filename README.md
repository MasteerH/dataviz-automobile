# TP2 Visualisation exploratoire en d3.js - Dataset Automobile

Auteurs : MAHDIR Hamza, EL AZIZI Amira Mariam

Matrice scatterplot, coordonnées parallèles et histogramme avec courbe de densité. Quand on sélectionne des voitures dans une vue, elles sont mises en évidence dans les autres.


## Dossiers

- rendu : le dossier à déposer pour le prof (ouvrir index.html dans Chrome)
- automobile : les données brutes du UCI
- NOTES_RAPPORT.md : nos justifications pour le rapport


## Données

On garde 201 voitures et 12 attributs numériques (au départ 205 voitures et 26 attributs).
On a supprimé normalized-losses (20% de valeurs manquantes), bore et stroke (n'existent pas pour les moteurs rotatifs), horsepower et peak-rpm (pour garder price et rester au dessus de 200 lignes, engine-size est très corrélé avec horsepower), et les 4 voitures sans prix.
