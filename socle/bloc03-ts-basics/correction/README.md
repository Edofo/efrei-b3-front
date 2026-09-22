# Corrigé du bloc 3

Les dix fichiers de `src/`, tels qu'on les attendait — avec les défis ⭐.
Ton point de départ reste intact à côté.

Pour le voir jouer contre les mêmes tests que toi, sans écraser ton travail :

```bash
cp -r src src.mine            # garde ta version
cp correction/src/* src/      # joue le corrigé
node play.ts --all --no-lesson
```

Puis remets la tienne (`rm -r src && mv src.mine src`) : la comparaison
fichier par fichier, c'est le vrai exercice.

Ce qu'on y regarde : une constante nommée par nombre magique, un type de
retour sur chaque fonction, `?? 0` là où la donnée peut manquer, et le
boss qui **importe** les quêtes 2 et 4 au lieu de les recopier.
