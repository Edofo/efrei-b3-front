# Corrigé du bloc 5

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

Ce qu'on y regarde : `unknown` plutôt que `any` partout où la donnée vient
de l'extérieur, `Readonly<Catalogue>` respecté à la lettre (aucune
fonction ne modifie ce qu'on lui passe), un type guard pour filtrer les
trous d'un `.map(find)`, et le boss qui **importe** `toCard` de la quête 4
au lieu de le recopier.
