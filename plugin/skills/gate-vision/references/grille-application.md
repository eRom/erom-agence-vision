## Profil DS jugé : eRom application (dark natif macOS, plans quasi noirs, blanc à opacité, accents système à sens fixe, filets inset 1px, pas de cards)

## C4 — Couleur = signal à sens fixe

**Binaire :** seuls les accents système macOS apparaissent, chacun avec son sens fixe : bleu (`#0A84FF`, texte `#409CFF`) pour l'action primaire, le focus, la sélection et les liens ; vert = en cours/ajouté, rouge = erreur/supprimé, orange = modifié, jaune = en attente, violet = agent. Au plus UNE action primaire bleue pleine par panneau, le reste en boutons secondaires discrets. Aucune couleur de marque ni décorative.
**Test image :** chaque teinte saturée visible se rattache à un de ces sens (statut, diff git, action, sélection), et aucun panneau ne porte deux boutons bleus pleins = OUI. Teinte hors palette système (amber de marque, cyan, rose…), couleur décorative sans rôle, ou deux actions bleues pleines dans le même panneau = NON. Une interface sans aucune action bleue est conforme.

## C5 — Plans quasi noirs, plats, tout le reste en blanc à opacité

**Binaire :** dark UNIQUEMENT. Fonds quasi noirs neutres (`#0B0B0C` à `#1C1C1E`, la sidebar à peine plus claire que la zone principale) ; textes, icônes et remplissages sont du blanc à différentes opacités, jamais des gris teintés ; fonds plats : aucun dégradé, aucune image, texture ni illustration, pas de logo dessiné (le nom du produit s'écrit en texte).
**Test image :** surfaces quasi noires neutres et plates, textes en niveaux de blanc atténué = OUI. Fond clair (même un panneau), fond teinté navy/violet/bleuté, dégradé ou image de fond, illustration ou logo graphique dans le chrome = NON.

## C6 — Filets inset 1px, pas de cards, ombres réservées

**Binaire :** le contenu est fait de rangées et de panneaux séparés par des filets de 1px à peine visibles (blanc ~6-7 %), jamais par des cards ; aucune vraie bordure claire ou épaisse ; AUCUNE ombre portée sur une surface dockée (sidebar, panneau, rangée, bouton au repos) : seules la fenêtre et les popovers/menus flottants ont une ombre.
**Test image :** zones séparées par des filets fins et discrets, rangées sans encadré, ombre uniquement sur un menu ou popover flottant = OUI. Cards encadrées ou à coins arrondis posées dans un panneau, bordures nettement visibles autour des blocs, ombre sur un élément non flottant = NON.

## C7 — Densité native et copy d'application

**Binaire :** sans-serif système type SF Pro pour l'UI, corps ~13px, monospace type SF Mono / JetBrains Mono pour les jetons techniques (branche, chemin, port, diff) ; contrôles ~28px et rangées denses (~26-30px), sans padding de page web ; copy UI en ANGLAIS, sentence case, laconique, verbe d'abord (« New session », « Show changes »), sans emoji, sans point d'exclamation, sans ton marketing.
**Test image :** police système homogène, rangées serrées façon app native, libellés anglais en sentence case = OUI. Serif ou police fantaisie, rangées aérées façon landing page, gros boutons, libellés en Title Case ou en français dans le chrome, emoji ou « ! » dans un libellé d'UI = NON. (Les noms propres, noms de projets et le contenu utilisateur rendu ne comptent pas comme copy.)

## Notes du profil (pour C1, C8, C9 et C10)

- Lecture C1 et C8 propre à une application : les actions de sidebar (« New », « Customize ») sont une icône + un libellé SANS fond ni bordure au repos, c'est le composant `SidebarAction` du DS et ses captures de référence : l'icône porte l'affordance, ne pas l'exiger en forme de bouton. Un lanceur vide (aucune session ouverte) n'a pas d'item actif à marquer, et son point d'entrée est l'action en tête de sidebar : ni l'un ni l'autre n'est un échec. Une app sans titre de page ni CTA central reste lisible si la fenêtre a une structure nette (sidebar, zone principale, barre d'outils).
- Spécificités C8 : le focus clavier est un anneau inset 1px bleu `#0A84FF` doublé d'un halo bleu ~3px ; le survol ajoute un fill blanc 5-8 % sans rien déplacer ni rétrécir ; l'onglet ou la rangée active porte un fill blanc ~8-10 % ou une teinte bleue avec anneau inset. Sur une capture focus : anneau absent, d'une autre couleur, ou contour navigateur par défaut = C8 NON.
- Exception C9 : transparence + flou sur un popover ou un menu flottant font partie du DS, ce n'est PAS du glassmorphism gratuit. Un état vide sobre (lanceur sans illustration) n'est pas un « hero pompeux ».
- Détails-signature typiques (C10) : feux tricolores de fenêtre macOS, raccourcis en glyphes (« ⌘N », keycaps), pastilles de statut rondes, jetons techniques en mono (`main · +83 −0`), glyphes Unicode d'UI (⎇ ❯ · →), légendes de section en noms courts (« Projects », « Modified »), icônes fines alignées dans la barre d'outils.
