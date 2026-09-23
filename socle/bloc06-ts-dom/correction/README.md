# Corrigé du bloc 6

Les dix fichiers de `src/`, tels qu'on les attendait — avec les défis ⭐.
Ton point de départ reste intact à côté.

Pour le voir jouer contre les mêmes tests que toi, sans écraser ton travail :

```bash
cp -r src src.mine              # garde ta version
cp correction/src/* src/        # joue le corrigé
npm run play                    # puis play.html?solution=1 ou ?all=1
```

Puis remets la tienne (`rm -r src && mv src.mine src`) : la comparaison
fichier par fichier, c'est le vrai exercice.

Ce qu'on y regarde : `textContent` partout où une donnée externe est
affichée (jamais `innerHTML` — la quête 3), un seul `addEventListener`
délégué sur la liste plutôt qu'un par carte (quête 7), et le boss qui
**importe** les quêtes 4, 6, 7 et 9 au lieu de les recopier.
