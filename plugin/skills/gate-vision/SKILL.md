---
name: gate-vision
description: "Juge vision automatique d'un rendu UI contre la grille eRom du profil DS actif (perso dark-first ou institut papier/encre ; détection auto par projet, forçable par ds=institut). 10 critères binaires, verdict PASS/FAIL ancré sur ce qui est vu. Accepte plusieurs captures étiquetées par état — repos, survol, focus, après clic — et le verdict dit quels états il couvre. À invoquer AVANT de montrer tout rendu UI à Romain. Le juge ne modifie rien. Triggers : /erom-vision:gate-vision [ds=perso|institut] <image|url> [<image2> …], 'taste gate', 'juge ce screenshot', 'gate design', 'passe le rendu au juge'."
user-invocable: true
allowed-tools: Read, Bash, Agent, Glob
---

# /erom-vision:gate-vision — juge design avant l'œil de Romain

**Usage (5 lignes) :** avant de montrer toute UI à Romain, capturer le rendu →
`/erom-vision:gate-vision [ds=perso|institut] <image-ou-url> [<image2> …]`. Un juge vision
externe (agy / Gemini, transport `erom-vision:gemini-vision`) évalue les captures contre la
grille eRom du profil DS actif (10 critères binaires, C1/C2/C9 éliminatoires) et rend PASS ou
FAIL avec preuves observées et suggestions courtes. FAIL = corriger puis re-juger ;
PASS = montrer à Romain.

Entrée brute :
$ARGUMENTS

## Règle de sortie (non négociable)

Quel que soit le chemin — verdict rendu, transport en échec, gate indisponible — ta réponse
finale est l'un des trois blocs de ce fichier, recopié caractère pour caractère (les `═`, le
`→`, l'ordre des lignes), les seuls `<…>` substitués :

1. gate indisponible → le message ⚠️ de l'Étape 2 ;
2. `status: "error"` → le bloc `══════ TASTE GATE ÉCHOUÉ (transport) ══════` de l'Étape 3 ;
3. `status: "ok"` → le bloc `══════ TASTE GATE ══════` de l'Étape 3, suivi du tableau des
   échecs si FAIL, de `remarque_libre`, puis du next step.

Rien avant le bloc, aucun préambule. Aucune action proposée qui n'y figure pas : tu n'offres
jamais d'installer, de configurer ni de réparer quoi que ce soit. Un gate qui répond dans ses
propres mots est un gate dont Romain ne peut plus voir d'un coup d'œil s'il a réellement
tourné — c'est exactement comme ça que 24 composants sont passés sans verdict le 07/08/2026.

L'Étape 4 (`trash "$TMP_DIR"`) tourne dans les trois cas, bloc d'échec compris.

> Mesure du 05/09/2026 : sur le chemin d'échec transport, deux runs sur deux ont écrit leur
> propre message d'erreur au lieu du bloc, l'un proposant d'installer `agy` — ce que ce
> fichier ne demande nulle part. Le chemin nominal, lui, rendait le bloc correctement.

## Capture des états d'interaction (avant d'invoquer)

Un rendu ne se juge pas sur son seul état au repos. Ce skill juge ce qu'on lui donne :
il ne pilote aucun navigateur. C'est donc à l'appelant de produire la planche **avant**
de l'invoquer. Sur la page cible, capturer en plus du repos :

1. **hover** sur le premier élément interactif de chaque famille (bouton, lien, point de
   graphe, ligne de tableau cliquable) ;
2. **focus clavier** sur le premier champ ou bouton (`Tab`) ;
3. l'état **après un clic** sur l'élément principal, s'il change quelque chose de visible.

Déclencher les états via `javascript_tool` (`dispatchEvent` de `mouseover`/`focus`) puis
capturer, et passer toutes les captures en arguments dans cet ordre : repos d'abord, puis
les états. Une seule capture reste acceptée — le verdict dira alors explicitement qu'il ne
couvre que le repos.

> Mesure du 01/08/2026 : un PASS 10/10 sur la seule capture au repos, suivi de deux bugs
> trouvés par Romain à la main — une infobulle sigma à fond blanc sur texte clair (illisible
> au survol) et des points d'apparence cliquable qui n'ouvrent rien (`setPointerCapture`
> détournant le `click`).

## Étape 0 — Chemins du skill

`BASE` = le « Base directory for this skill » injecté ci-dessus. Résous en absolu :
- `MISSION_FILE` = `BASE/references/mission.md`
- `SCHEMA_FILE` = `BASE/references/schema.json`
- `GRILLE_COMMUNE` = `BASE/references/grille-commune.md`
- `GRILLE_PERSO` = `BASE/references/grille-perso.md`
- `GRILLE_INSTITUT` = `BASE/references/grille-institut.md`

Vérifie l'existence des cinq (un seul appel Bash `ls`). Manquant → STOP « skill corrompu, references/ incomplet ».

## Étape 0bis — Profil DS jugé

1. Un argument exactement égal à `ds=perso` ou `ds=institut` est le sélecteur de
   profil : le consommer (ce n'est PAS une capture) et retenir ce profil.
2. Sinon, détection projet (même règle que le routeur erom-design) :
   `grep -rl "erom-institut" package.json src/ 2>/dev/null` depuis le cwd → un hit = institut.
3. Sinon : perso (défaut).

`ANNEXE` = `GRILLE_PERSO` ou `GRILLE_INSTITUT` selon le profil retenu. Le profil
s'affiche dans le verdict (Étape 3).

## Étape 1 — Valider et préparer l'entrée (UN appel Bash)

Chaque argument restant (le sélecteur `ds=…` a été consommé à l'Étape 0bis) est un
chemin d'image locale ou une URL, éventuellement préfixé de son état sous la forme
`<label>=<chemin>` (`hover=/tmp/h.png`). Sans argument image → demande une fois et stop.

Attribution des labels : un argument préfixé garde son label ; sinon le premier prend `repos`
et les suivants `etat-2`, `etat-3`… Le nom de fichier retenu est `etat-<n>-<label>.<ext>`, le
label servant tel quel d'étiquette d'INPUT à l'Étape 2.

CONTRAINTE agy : refuse tout chemin contenant un composant caché (`.claude`, `.gemini`, …). Tout ce que le juge doit VOIR passe donc par un dossier de travail non caché :

```bash
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/taste-gate-XXXXXX")
# pour CHAQUE argument, dans l'ordre reçu :
#   cas URL : curl -fsSL "<url>" -o "$TMP_DIR/etat-<n>-<label>.<ext>"
#   cas fichier local : cp "<chemin>" "$TMP_DIR/etat-<n>-<label>.<ext>"
# assemblage de la grille : commune + annexe du profil (C4-C7 + notes insérés au marqueur)
sed -e "/<!-- CRITERES-DS -->/r $ANNEXE" "$GRILLE_COMMUNE" > "$TMP_DIR/grille.md"
file "$TMP_DIR"/etat-*
```

- Extension conservée depuis la source ; formats acceptés : png, jpg/jpeg, webp, gif.
- `file` doit confirmer une image (« PNG image data », « JPEG image data », …) pour **chaque** capture. Une seule en échec → STOP « l'entrée n'est pas une image lisible », `trash "$TMP_DIR"`.
- Fichier local introuvable ou curl en échec → STOP avec le message d'erreur.
- Jamais de secret ni de donnée perso dans l'image envoyée : au moindre doute signalé par le contexte, demander à Romain d'abord.

## Étape 2 — Lancer le juge (transport `erom-vision:gemini-vision`)

**Dépendance déclarée : l'agent de transport du plugin `erom-vision`.** La skill et l'agent
sont livrés ensemble : si le plugin est installé entier, l'agent est sur le disque à côté de
la skill. S'il n'y est pas, le juge ne peut pas tourner.

**Préflight, avant de jeter la moindre capture.** `<BASE>` est le chemin absolu résolu à
l'Étape 0, substitué ici en littéral : ce n'est PAS une variable shell, un `$BASE` vide
testerait `/../../agents/…` et rendrait un faux `GATE_INDISPONIBLE`.


```bash
ls "<BASE>/../../agents/gemini-vision.md" >/dev/null 2>&1 && echo "GATE_OK" || echo "GATE_INDISPONIBLE"
```

Si `GATE_INDISPONIBLE`, **ne jette rien et ne continue pas en silence**. Dis-le à Romain, mot pour mot :

> ⚠️ **Taste gate indisponible.** Le transport `erom-vision:gemini-vision` est introuvable :
> l'installation du plugin `erom-vision` est incomplète, le juge vision ne peut pas tourner.
> Deux options : réinstaller le plugin (`/plugin`), ou je te montre le rendu en te disant
> explicitement qu'aucun jugement automatique ne l'a couvert.

Puis stop. Un rendu montré sans gate se montre en le disant ; il ne se montre jamais comme s'il avait été
jugé. (Mesure du 07/08/2026 : sur le DS Institut, l'agent introuvable a fait abandonner le gate en silence,
24 composants livrés sans un seul verdict, validés par Romain sans qu'il le sache.)

Si `GATE_OK`, spawn `erom-vision:gemini-vision`. Si l'appel échoue quand même sur « Agent type not found »,
c'est le cache de plugins qui n'est pas rechargé : demande à Romain de lancer `/reload-plugins` (mesuré le
07/08 sur macronisme : un simple retry ne suffit pas, le reload manuel oui). Annonce avant le spawn :
« **Jugement en cours…** le juge vision analyse le screenshot (jusqu'à 9 min). »

Une ligne `SCREENSHOT_<LABEL>:` par capture, dans l'ordre des arguments (label en majuscules),
puis `GRILLE:`. Le transport gère nativement N inputs étiquetés.

```
Agent(
  subagent_type: "erom-vision:gemini-vision",
  prompt: "MISSION_FILE=<abs mission.md>\nSCHEMA_FILE=<abs schema.json>\nVALIDATE_JQ=has(\"verdict\") and (.verdict|IN(\"PASS\",\"FAIL\")) and has(\"score\") and (.score|type==\"number\" and .>=0 and .<=10) and has(\"failed\") and (.failed|type==\"array\" and all(has(\"critere\") and has(\"preuve_observee\") and has(\"suggestion_courte\"))) and has(\"etats_couverts\") and (.etats_couverts|type==\"array\" and length>=1) and has(\"remarque_libre\")\nINPUTS:\nSCREENSHOT_REPOS:<abs $TMP_DIR/etat-1-repos.ext>\nSCREENSHOT_HOVER:<abs $TMP_DIR/etat-2-hover.ext>\nGRILLE:<abs $TMP_DIR/grille.md>\n\nExécute la procédure de transport."
)
```

(exemple à 2 captures — mets exactement autant de lignes `SCREENSHOT_*` que d'images préparées
à l'Étape 1, jamais plus : un état déclaré sans image est un état non jugé.)

Le juge ne modifie JAMAIS rien : verdict + critères échoués + suggestions, c'est tout.

## Étape 3 — Parser et afficher

Retour = UNE ligne JSON `{devil, model, status, review|error+detail}`.

**Les deux blocs ci-dessous s'affichent VERBATIM**, caractères `═` compris. Tu substitues
uniquement ce qui est entre `<…>` ; tu ne résumes pas, tu ne reformules pas, tu ne remplaces
pas par ta propre mise en forme, tu n'ajoutes pas de préambule. Le bloc EST la sortie : c'est
à sa forme fixe que Romain reconnaît d'un coup d'œil qu'un jugement a réellement eu lieu.

### `status: "error"`
```
══════ TASTE GATE ÉCHOUÉ (transport) ══════
Erreur : <error> — <detail>
→ Relance (/erom-vision:gate-vision <image>), ou jugement manuel.
```

### `status: "ok"` — échecs en tête

```
══════ TASTE GATE ══════
Verdict : [PASS ✓ | FAIL ✗]  ·  Score : <score>/10
Juge : gemini (<model>)  ·  Image : <nom du fichier source>
Profil DS : <perso | institut>  ·  États jugés : <etats_couverts joints par « · »>
```

Si `etats_couverts` ne correspond pas aux captures envoyées (état manquant, ou déclaré sans avoir
été fourni), affiche « ⚠ le juge n'a pas couvert tous les états envoyés » et traite le verdict
comme ne portant que sur les états réellement listés.

Si FAIL, d'abord le tableau des échecs (ordre de la grille) :

```
| Critère | Preuve observée | Suggestion |
```

Puis `remarque_libre` en citation. Si `score` ≠ 10 − nombre d'échecs, affiche l'avertissement « ⚠ incohérence score/échecs remontée par le juge » sans corriger toi-même.

### Next step selon verdict
- **PASS**, plusieurs états couverts → « Prêt pour l'œil de Romain (états jugés : <liste>). »
- **PASS**, `etats_couverts` réduit au seul repos → « Rendu conforme **au repos**. Les états
  d'interaction (survol, focus, clic) ne sont pas couverts par ce gate : les vérifier à la main
  avant de montrer à Romain. »
- **FAIL** → « Corrige les critères échoués puis re-juge (max 2 cycles avant de montrer l'état à Romain tel quel, échecs assumés). »

## Étape 4 — Nettoyage

`trash "$TMP_DIR"` (succès comme échec). Jamais de `rm`.
