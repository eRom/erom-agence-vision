# Grille taste-gate — 10 critères binaires

Grille assemblée : critères communs (C1-C3, C8-C10) + critères du profil DS actif
(C4-C7 et notes de profil, insérés ci-dessous). Chaque critère est évaluable sur UN
screenshot statique : réponse OUI (respecté) ou NON (échoué), rien entre les deux.
En cas de doute réel sur un critère non observable dans l'image (ex. états hover non
capturés), le critère est réputé respecté et noté dans la remarque libre — le juge ne
pénalise que ce qu'il VOIT.

## C1 — Hiérarchie visuelle immédiate

**Binaire :** en moins d'une seconde, UN élément domine clairement (titre, KPI ou CTA) ; le regard sait où commencer.
**Test image :** plisser les yeux (flou mental) : s'il reste un seul point d'entrée évident, OUI. Si deux zones ou plus se disputent le focus (deux CTA de même poids, titre et bannière en concurrence), NON.

## C2 — Contraste texte suffisant

**Binaire :** tout texte porteur de sens est lisible sans effort sur son fond ; aucun texte gris-sur-gris illisible ni texte posé sur image/dégradé sans protection.
**Test image :** repérer le texte le PLUS faible du screenshot ; s'il reste nettement lisible (ratio apparent ≥ ~4.5:1 pour le corps), OUI. Un seul bloc de texte significatif illisible suffit pour NON (le muted volontaire sur métadonnées reste acceptable).

## C3 — Grille d'espacement cohérente

**Binaire :** les espacements se répètent en rythme régulier (multiples visibles d'une même base) ; alignements verticaux/horizontaux tenus.
**Test image :** comparer les gouttières entre cards, les paddings internes et les marges de section : si des valeurs manifestement orphelines apparaissent (un élément collé, un autre flottant, alignements brisés), NON. Sinon OUI.

<!-- CRITERES-DS -->

## C8 — États interactifs discernables

**Binaire :** les éléments interactifs se distinguent au premier regard des éléments statiques : les boutons ressemblent à des boutons (fond ou bordure + padding cohérent), les liens/nav actifs sont marqués, l'élément actif d'une nav est identifiable.
**Test image :** pouvoir désigner sans hésiter ce qui est cliquable, et repérer l'item actif (fond teinté, couleur d'accent ou indicateur) = OUI. Boutons fantômes indiscernables du texte, nav sans état actif visible = NON. (Hover/focus non capturables sur image : ne pas pénaliser.)

## C9 — Zéro esthétique IA générique

**Binaire :** aucun marqueur de l'esthétique IA par défaut : dégradé violet/rose, glassmorphism gratuit, emojis décoratifs dans l'UI, cards passe-partout centrées avec grosses icônes, hero pompeux sans contenu.
**Test image :** balayer le screenshot à la recherche de CHACUN de ces marqueurs : un seul présent = NON. Aucun = OUI. (Les exceptions explicitement prévues dans les notes du profil DS ci-dessus priment.)

## C10 — Détail-signature soigné

**Binaire :** au moins UN détail de finition visible qui prouve l'intention (les détails-signature typiques du DS actif sont listés dans les notes du profil ci-dessus).
**Test image :** trouver et NOMMER ce détail = OUI. Screenshot fonctionnel mais sans aucune trace de soin particulier = NON.

## Barème

- Score = nombre de critères OUI, sur 10.
- **Verdict PASS** : score ≥ 8 ET aucun échec sur C1, C2 ou C9 (hiérarchie, lisibilité et anti-IA générique sont éliminatoires).
- **Verdict FAIL** : tout le reste.
