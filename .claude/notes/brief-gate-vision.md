---
status: implemented
date: 2026-09-05
date_implemented: 2026-09-05
auteur: session claude-flora-s95e (analyse), exécution claude-minerve-4qqd
---

# Brief — erom-vision v0.1.0, le gate design opérationnel partout

## Pourquoi (chantier gate franchi, mots de Romain)

> « DS Institut / macronisme / PWA Caserne, le front que j'attaque lundi, et je veux le
> gate opérationnel partout. »

Lundi = 2026-09-07. Le livrable doit être utilisable ce jour-là.

## Le problème résolu

`erom-taste-gate` vit dans `~/.claude/skills/` (global) mais dépend de l'agent
`erom-devil:gemini`. Or `erom-devil@erom-marketplace` est à `false` dans
`~/.claude/settings.json` et n'est activé en local que dans 6 dossiers
(`bench-studio-public`, `healthkit-discover`, `erom-agence-xray`,
`erom-agence-control-plane`, `macronisme-le-bilan`, `EROM-HQ`).

Résultat mesuré : le gate est **annoncé partout et tombe en `GATE_INDISPONIBLE`
partout ailleurs**. Une promesse globale adossée à une dépendance locale.

## Décision

Nouveau plugin `erom-vision` (dépôt `~/dev/erom-agence-vision`, remote
`git@github.com:eRom/erom-agence-vision.git`), activé en global.
**Exactement 1 agent + 1 skill.**

### Battu

- **Ajouter un `MODE: gate-vision` à `erom-gemini:gemini-run`.** Perdu : erom-gemini
  est un plugin fichier → document (toutes ses sorties vont dans `docs/gemini/`), le
  gate rend un verdict, pas un document. Et l'activer en global pour ça annonce
  `transcribe` / `video` / `doc-to-md` partout : 1968 chars de frontmatter contre
  ~1050 pour un erom-vision maigre.
- **Passer `erom-devil` à `true` en global.** Perdu : 13 composants, 4837 chars de
  frontmatter chargés partout et tout le temps, pour un seul agent réellement utile.
- **Le catalogue à 7 skills** (OCR, Screenshot Understanding, Chart Interpretation,
  Diagram, Interface Capture, Photographic Content). Perdu : 6 des 7 lignes sont déjà
  couvertes. `erom-gemini:skills/media/SKILL.md` ligne 3 dit mot pour mot « Pose une
  question sur un fichier AUDIO, VIDÉO ou **IMAGE** […] que dit cette image » ;
  `erom-gemini:skills/doc-to-md/SKILL.md` ligne 3 dit « Convertit un PDF, docx,
  **image** ou HTML […] OCR ce document ». Ces six lignes sont un prompt différent posé
  au même moteur. Et huit descriptions concurrentes sur le trigger « analyse une image »
  dégradent le routage au lieu de l'améliorer.

Une skill de plus s'ajoutera quand un besoin se sera présenté **deux fois pour de
vrai**. Le transport étant générique, ça coûtera un fichier, pas une refonte.

## Périmètre : deux fichiers de composant, pas un de plus

### 1. `plugin/agents/gemini-vision.md`

Transport générique vers Antigravity CLI (`agy`), modelé sur
`erom-devil:agents/gemini.md` mais durci avec la mécanique de `erom-gemini:gemini-run`.

Contrat d'entrée (repris tel quel de erom-devil, il marche) :

```
MISSION_FILE=<abs>
SCHEMA_FILE=<abs>
VALIDATE_JQ=<expression jq -e sur une ligne>
INPUTS:
SCREENSHOT_REPOS:<abs>
SCREENSHOT_HOVER:<abs>
GRILLE:<abs>
```

Contrat de sortie : UN objet JSON sur une ligne, rien autour.
- succès : `{"devil":"gemini","model":"Gemini 3.8 Flash (High)","status":"ok","review":{…}}`
- échec : `{"devil":"gemini","model":"…","status":"error","error":"CLI_FAILED|PARSE_ERROR|SCHEMA_INVALID|TIMEOUT","detail":"≤500 chars"}`

Garder la clé `devil` malgré le nom : c'est ce que l'Étape 3 de la skill parse déjà.
La renommer oblige à toucher le parseur pour zéro gain.

### 2. `plugin/skills/gate-vision/`

Copie de `~/.claude/skills/erom-taste-gate/` : `SKILL.md` + les 5 fichiers
`references/` (`mission.md`, `schema.json`, `grille-commune.md`, `grille-perso.md`,
`grille-institut.md`). Les references partent **inchangées**, c'est de la doctrine
design déjà éprouvée.

Trois modifications au `SKILL.md`, et rien d'autre :

1. `name: gate-vision`.
2. **Étape 2** : le bloc « Dépendance déclarée : le plugin erom-devil doit être actif »
   et son préflight `grep` sont réécrits pour `erom-vision`. Le spawn devient
   `subagent_type: "erom-vision:gemini-vision"`.
3. `description:` garde impérativement les triggers historiques — `taste gate`,
   `juge ce screenshot`, `gate design`, `passe le rendu au juge` — pour que les
   réflexes existants routent encore.

Ne PAS toucher : la capture des états d'interaction, l'Étape 0bis (profil DS), le
format d'affichage de l'Étape 3, l'Étape 4 (`trash`).

## Sources à lire (ne me crois pas sur parole, ouvre les fichiers)

| Rôle | Chemin absolu |
|---|---|
| Skill à déplacer | `/Users/recarnot/.claude/skills/erom-taste-gate/SKILL.md` + `references/` |
| Transport à copier | `/Users/recarnot/.claude/plugins/cache/erom-marketplace/erom-devil/0.9.2/agents/gemini.md` |
| Mécanique agy durcie | `/Users/recarnot/dev/erom-agence-gemini/plugin/agents/gemini-run.md` |
| Plan B transcript | `/Users/recarnot/dev/erom-agence-gemini/plugin/scripts/agy/recover_transcript.py` |
| Manifeste modèle (clé `agents`) | `/Users/recarnot/dev/erom-agence-gemini/plugin/.claude-plugin/plugin.json` |
| Cible | `/Users/recarnot/dev/erom-agence-vision/plugin/` |

Le résumé ci-dessus est exactement l'endroit où vivent mes angles morts. Lis les
fichiers.

## Pièges déjà payés (ne pas les repayer)

- `--print` est le **dernier** flag avant le prompt : le parseur Go consomme le token
  suivant.
- `< /dev/null` après le prompt est **obligatoire** : stdin hérité ouvert = hang non
  borné par `--print-timeout`.
- La sortie d'agy se lit **dans un fichier écrit par le modèle**, jamais depuis stdout
  (bug amont #76 : stdout vide alors que le modèle a répondu).
- `[ -x agy ]` sur un nom nu teste `./agy` dans le CWD, pas le PATH. Résoudre par
  `command -v` d'abord (les 3 lignes verbatim de `gemini-run.md`).
- Timeout Bash explicite **1200000 ms** sur l'appel agy ; `--print-timeout 8m` en
  dessous. Le défaut de 2 min coupe le run.
- **agy refuse tout chemin contenant un composant caché** (`.claude`, `.gemini`). D'où
  le `mktemp -d` non caché de l'Étape 1. Ne pas « simplifier » ça.
- Garde `trash` : `[ -n "${TMP_DIR:-}" ] && trash "$TMP_DIR"`. Un `TMP_DIR` vide ferait
  `trash ""` et mettrait le dossier courant à la corbeille. Jamais de `rm`.
- `plugin.json` doit déclarer `"agents": ["./agents/gemini-vision.md"]` explicitement,
  comme erom-gemini. Le manifeste actuel n'a que la clé `skills`.

## Incidents que la skill encode déjà (les préserver mot pour mot)

- **07/08/2026, DS Institut** : agent introuvable → gate abandonné en silence, 24
  composants livrés sans un seul verdict, validés par Romain sans qu'il le sache. D'où
  le préflight qui **stoppe et le dit**. Un rendu montré sans gate se montre en le
  disant ; jamais comme s'il avait été jugé.
- **01/08/2026** : PASS 10/10 sur la seule capture au repos, puis deux bugs trouvés à la
  main (infobulle illisible au survol, points faussement cliquables). D'où
  `etats_couverts` et le next-step dégradé quand seul le repos est jugé.
- **07/08/2026, macronisme** : après ajout d'un agent, un retry ne suffit pas, il faut
  `/reload-plugins`. Message conservé.

## Critères d'acceptation

- **AC-1 — Le plugin est découvert.** Quand `erom-vision` est activé, alors il expose
  exactement 1 skill et 1 agent.
  *Vérifié par* : `claude plugin details erom-vision`, sortie montrant `gate-vision` et
  `gemini-vision`, rien d'autre.
- **AC-2 — Verdict PASS.** Quand on passe une capture UI conforme à la grille perso,
  alors le gate affiche `Verdict : PASS`, un score, le profil DS et les états couverts.
  *Vérifié par* : `/erom-vision:gate-vision <capture>` sur une capture de contrôle,
  bloc `══════ TASTE GATE ══════` complet en sortie.
- **AC-3 — Verdict FAIL ancré.** Quand on passe une capture violant un critère
  éliminatoire (C1/C2/C9), alors le verdict est FAIL et le tableau liste le critère,
  la preuve observée et une suggestion.
  *Vérifié par* : même commande sur une capture volontairement cassée ; le tableau
  d'échecs est non vide.
- **AC-4 — Multi-états.** Quand on passe `repos=<a.png> hover=<b.png>`, alors
  `etats_couverts` contient les deux labels.
  *Vérifié par* : ligne « États jugés : repos · hover » dans le verdict.
- **AC-5 — Échec transport visible.** Quand `agy` est introuvable, alors la sortie est
  un message d'erreur explicite, jamais un PASS.
  *Vérifié par* : `AGY_BIN=/nonexistent` puis invocation ; bloc
  `TASTE GATE ÉCHOUÉ (transport)` affiché.
- **AC-6 — Opérationnel hors des 6 dossiers erom-devil.** Quand on lance le gate depuis
  un dossier qui n'active pas erom-devil, alors il tourne.
  *Vérifié par* : invocation depuis `~/dev/erom-agence-vision` (et idéalement depuis le
  repo macronisme), verdict rendu.
- **AC-7 — Pas de fuite ni de destruction.** Quand un run se termine, succès ou échec,
  alors le `TMP_DIR` est à la corbeille et aucun `rm` n'existe dans le code.
  *Vérifié par* : `grep -rn '\brm\b' plugin/` → aucun hit destructif ; `ls` du TMPDIR
  après un run.

## Hors périmètre, explicitement

- Les 6 autres familles de vision (OCR, screenshot, charts, diagrammes, interface,
  photo). Elles n'entrent pas dans ce plugin aujourd'hui.
- Toute modification de `erom-gemini` ou de `erom-devil`.
- La suppression de `~/.claude/skills/erom-taste-gate/`. À faire **après** que
  AC-1 à AC-7 soient tous verts, jamais avant, et avec `trash`.

## Fin de chantier (à faire valider par Romain avant exécution)

1. Push du plugin sur `git@github.com:eRom/erom-agence-vision.git`.
2. Entrée `erom-vision` dans
   `/Users/recarnot/.claude/plugins/marketplaces/erom-marketplace/.claude-plugin/marketplace.json`
   (source `git-subdir`, `path: "plugin"`, `ref: "main"`, `strict: true`) — le plugin
   doit être poussé AVANT, sinon l'entrée pointe dans le vide.
3. `"erom-vision@erom-marketplace": true` dans `~/.claude/settings.json`, bloc
   `enabledPlugins`.
4. `/reload-plugins`, puis rejouer AC-1.

Les étapes 1 à 3 sont visibles hors de la session (dépôt public, config globale) :
demander l'accord de Romain avant de les lancer. La skill `erom-dev-plugin:release`
couvre exactement ce cycle, la préférer à un enchaînement manuel.
