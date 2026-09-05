# Contrat du dépôt

Dépôt de développement du plugin Claude Code `erom-vision` : Juge vision automatique d'un rendu UI contre la grille eRom : verdict PASS/FAIL ancré sur ce qui est vu, avant de montrer le rendu.
Ce fichier dit comment travailler ici. Il décrit un contrat, pas un état atteint :
la section « État actuel » dit ce qui n'y est pas encore conforme.

## Structure

```
plugin/                          seul dossier distribué (source marketplace git-subdir)
  .claude-plugin/plugin.json     manifeste
  skills/<nom>/SKILL.md          une skill par dossier
  skills/<nom>/references/       matière longue, lue seulement quand la skill tourne
  agents/<nom>.md                subagents, découverts automatiquement
docs/                            specs, plans, recherches, revues
_memory_/                        connaissance de session persistée, indexée par le vault RAG
.claude/                         notes et settings locaux, jamais distribués
```

Pas d'étape de build : les skills sont du Markdown pur, écrit à la main
directement dans `plugin/`.

## Invariants

1. **Seul `plugin/` est distribué.** Tout ce qui est hors de ce dossier reste
   local ou sert le développement : notes, matière de travail, mémoire.
2. **Français.** Le plugin sert des projets français. Skills, exemples et
   sorties en français, y compris les descriptions de `SKILL.md`.
3. **Aucune capacité dupliquée.** Avant d'ajouter une skill, vérifier qu'aucun
   autre plugin eRom ne la porte déjà (`~/dev/erom-marketplace/.claude-plugin/marketplace.json`
   liste les plugins publiés et ce qu'ils couvrent). Deux plugins qui font la
   même chose, c'est un plugin de trop.
4. **La règle vient de ce qui a déjà tourné.** Chaque consigne d'une skill doit
   pouvoir se rattacher à un artefact réel : une sortie observée, un test qui
   passe, un incident daté. Le générique ne décrit aucun usage et ne sert de
   source à rien.
5. **Le manifeste ne déclare pas ses agents.** La clé `agents` absente vaut
   découverte automatique de `plugin/agents/`. Une liste explicite fige les
   chemins et fait mentir `claude plugin details`, qui affiche alors « Agents (0) ».

## Vérifier

```bash
claude --plugin-dir plugin plugin details erom-vision
```

Affiche l'inventaire réel des composants chargés et le coût token projeté.
C'est la seule preuve que le manifeste charge ce qu'on croit : un dossier
`skills/` ou `agents/` peuplé mais invisible ici n'est pas chargé.

## Publication

Publié sur `erom-marketplace`, activé en global. La publication ne se fait pas à la
main : la skill `release` du plugin `erom-dev-plugin` la porte de bout en bout, depuis
ce dépôt.

```
/erom-dev-plugin:release
```

Elle lit le nom et la version dans le manifeste, choisit le bump SemVer, commite
et pousse ce dépôt, puis met à jour `~/dev/erom-marketplace` (entrée du plugin,
metadata, README), et vérifie la CI. Toujours dans cet ordre : le plugin d'abord, 
la marketplace ensuite, parce que l'entrée pointe `ref: main` sur ce dépôt.

L'entrée existe désormais, les publications suivantes sont de simples bumps et
la skill ne demande plus rien. Source `git-subdir` sur ce dépôt, `path: "plugin"`,
`ref: "main"`, `strict: true`, comme les neuf autres plugins.

## État actuel - 2026-09-05

v0.1.1 publiée, activée en global, recettée de bout en bout.

| Élément | État |
|---|---|
| `plugin/skills/gate-vision/` | `SKILL.md` + 5 `references/` |
| `plugin/agents/gemini-vision.md` | transport agy |
| Critères d'acceptation AC-1 à AC-7 | tous verts, 05/09/2026 |
| Publication marketplace | v0.1.1, CI verte sur `a7be6bf` |
| Activation | `"erom-vision@erom-marketplace": true` dans `~/.claude/settings.json` |
| `~/.claude/skills/erom-taste-gate/` | corbeillée, le plugin la remplace partout |

Le gate n'a plus de dépendance locale : il tourne depuis n'importe quel répertoire,
y compris ceux qui n'activent pas `erom-devil`. Vérifié par un run réel depuis
`~/dev/macronisme-le-bilan`.

Le seul prérequis restant est Antigravity CLI (`agy`), installé et authentifié. Sans
lui, le gate rend un bloc d'échec explicite, jamais un PASS silencieux.

Les gotchas de ce dépôt sont dans `_memory_/gotchas.md`, chacun avec sa commande de
re-vérification.
