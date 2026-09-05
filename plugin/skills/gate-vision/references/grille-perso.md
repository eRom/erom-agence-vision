## Profil DS jugé : eRom perso (dark-first, OKLCH, brand paramétrique amber, borders > shadows, Inter + JetBrains Mono)

## C4 — Palette brand disciplinée

**Binaire :** UNE couleur d'accent principale (amber par défaut, ou l'accent brand du projet) ; toute autre couleur a un rôle sémantique évident (succès/danger/warning/info) ; pas d'arc-en-ciel décoratif.
**Test image :** compter les teintes saturées présentes : 1 accent + quelques couleurs clairement sémantiques (badges, statuts) = OUI. Trois teintes saturées ou plus sans rôle discernable, ou décoration multicolore = NON.

## C5 — Dark-first propre

**Binaire :** le rendu par défaut est sombre, avec des surfaces en gris neutres à très faible chroma ; pas de blanc criard plein écran, pas de fond saturé/teinté.
**Test image :** fond principal sombre et neutre (ni bleuté marqué, ni violet), texte clair = OUI. Fond blanc pur par défaut, ou surfaces sombres visiblement teintées (navy, violet), ou panneaux blancs criards dans un contexte sombre = NON. (Un light mode explicitement demandé par le contexte s'évalue sur la neutralité calme des surfaces.)

## C6 — Borders > shadows

**Binaire :** la hiérarchie des surfaces (cards, panneaux, inputs) est dessinée par des bordures fines ; les ombres portées ne concernent que les éléments flottants (dialog, popover, dropdown).
**Test image :** les cards posées dans la page ont une bordure visible et pas d'ombre large diffuse = OUI. Ombres portées épaisses/étalées sur des éléments non flottants (cards, boutons au repos, sections) = NON.

## C7 — Typographie conforme et dense

**Binaire :** une sans-serif type Inter pour l'UI ; une monospace type JetBrains Mono pour code/données chiffrées si présentes ; échelle dense et calme (corps ~14px, pas de texte d'apparat surdimensionné hors titre/KPI).
**Test image :** police UI homogène à chasse propre, hiérarchie de tailles resserrée (titre > sous-titre > corps > méta) = OUI. Serif ou fantaisie en UI, code en proportionnelle, ou corps de texte géant façon landing page = NON.

## Notes du profil (pour C9 et C10)

- Exception C9 : le blur `backdrop-blur` sur popover/sticky header fait partie du design system, ce n'est PAS du glassmorphism gratuit.
- Détails-signature typiques (C10) : badge sémantique propre (`bg-{color}-500/10 text-{color}-400`), section header uppercase discret, monospace élégant sur les chiffres, alignement optique parfait d'une rangée d'icônes, vide travaillé (empty state calme).
