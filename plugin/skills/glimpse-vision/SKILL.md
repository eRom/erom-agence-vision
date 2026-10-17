---
name: glimpse-vision
description: "Fait regarder une vidéo ou une capture par un modèle vision (elorian/glimpse via OpenRouter) et rend un rapport Markdown horodaté de ce qui est vu : chronologie, texte à l'écran, anomalies visuelles. À utiliser dès qu'il faut comprendre ce qui se passe DANS le temps sur un enregistrement : vidéo d'un test e2e Playwright qui échoue (test-results/**/video.webm), capture vidéo macOS (.mov) d'un bug d'UI, layout shift, clignotement, overlay qui bloque un clic, ou simplement « regarde cette vidéo et dis-moi ce qu'elle montre ». Accepte aussi une image seule pour une question factuelle. Ne juge pas un rendu contre la grille eRom : ça, c'est gate-vision. Triggers : /erom-vision:glimpse-vision <fichier> <question>, 'regarde la vidéo', 'analyse la vidéo du test', 'pourquoi le test e2e plante', 'lis cette capture vidéo'."
user-invocable: true
allowed-tools: Bash, Read, Glob
---

# /erom-vision:glimpse-vision - des yeux sur une vidéo

Claude ne lit pas la vidéo. Le script envoie le fichier à `elorian/glimpse`, qui raisonne
directement sur les images et la vidéo, et rend un rapport Markdown que Claude exploite
ensuite pour diagnostiquer ou corriger.

Entrée brute :
$ARGUMENTS

## Prérequis

- `bun` dans le PATH.
- `OPENROUTER_API_KEY` dans l'environnement. Vérifie sa présence avec
  `test -n "$OPENROUTER_API_KEY" && echo présente`, jamais en l'affichant.
- `ffmpeg` seulement pour une vidéo de plus de 20 Mo : le script la réencode lui-même.

## Lancer

```bash
bun "${CLAUDE_PLUGIN_ROOT}/skills/glimpse-vision/scripts/glimpse.ts" <fichier> "<question>" [--mode e2e|free] [--effort low|medium|high]
```

Donne au Bash un timeout de 400000 ms : une vidéo de 30 s en effort `high` prend environ
une minute.

- **Fichier** : `.mp4`, `.webm`, `.mov`, `.png`, `.jpg`, `.jpeg`, `.webp`. Chemin absolu de
  préférence. Pour un test Playwright, la vidéo est sous `test-results/<test>/video.webm`
  si la config a `video: 'on'` ou `'retain-on-failure'`. Sinon, dis-le plutôt que de chercher
  une vidéo qui n'existe pas.
- **Question** : ce qu'on cherche, avec le comportement attendu. « Le bouton Valider devait
  être cliquable après le chargement du panier » oriente le modèle bien mieux que
  « regarde ce test ».
- **`--mode e2e`** : rapport de QA en trois parties (chronologie, anomalies, diagnostic
  probable). Pour un test qui échoue ou un bug d'UI.
  **`--mode free`** (défaut) : réponse directe à la question. Pour décrire une vidéo,
  relever un texte, répondre à une question factuelle.
- **`--effort`** : `high` par défaut. `low` suffit pour une image et une question
  ponctuelle (mesuré : 5 s et 0,002 $ contre 1 min et 0,06 $ pour 30 s de vidéo en `high`).

Le rapport sort sur stdout. Une ligne de métadonnées sort sur stderr : durée, tokens,
coût, et le transcodage s'il a eu lieu.

## Lire le rapport

Le rapport est la vue d'un autre modèle, pas une vérité. Sur les runs de recette :

- Les valeurs lues à l'écran étaient justes, avec de rares glissements (3,222 lu au lieu
  de 3,202, « CTA » lu « OTA »). Deux runs sur le même extrait ont placé le même
  événement à 00:02,2 puis à 00:03,0. Avant de fonder un correctif sur une valeur ou un
  horodatage précis, extrais l'image et regarde-la toi-même :
  `ffmpeg -loglevel error -ss <secondes> -i <vidéo> -frames:v 1 -vf scale=900:-2 <scratchpad>/frame.jpg`,
  puis Read. Le JPEG réduit passe ; un PNG pleine taille de plus de 1 Mo a été refusé.
- En mode `e2e`, le modèle a classé en anomalies des effets d'animation voulus (texte
  dédoublé, flash plein écran). Il les marque comme hypothèses ; traite-les comme telles
  tant que le code ne confirme pas.
- Sur un extrait de 6 s, il a échantillonné environ une image par seconde et a raté une
  transition rapide. Pour un événement bref, découpe la vidéo autour du moment
  (`ffmpeg -ss <début> -t <durée> -i <vidéo> -an <scratchpad>/clip.mp4`) et relance sur
  l'extrait.

Réponds à la question posée à partir du rapport. Ne recopie pas les 8 Ko de chronologie :
garde les horodatages et les observations qui portent la conclusion.

## Échecs

Le script sort avec un code non nul et un message `glimpse: …` sur stderr (clé absente,
format non supporté, fichier trop lourd même après transcodage, erreur OpenRouter,
réponse vide). Rapporte le message tel quel et l'action qu'il propose. Ne remplace jamais
le rapport manquant par une description inventée de la vidéo.
