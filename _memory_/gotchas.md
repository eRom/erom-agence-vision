# Gotchas — erom-vision

Dernière mise à jour : 2026-09-05.

## Un préflight qui dépend d'une substitution de chemin rate un run sur deux

`SKILL.md` peut poser un chemin en placeholder (`<BASE>/../../agents/x.md`) en comptant sur
le modèle pour le substituer avant d'exécuter le bash. Il le rate régulièrement : mesuré le
05/09/2026, un préflight `ls` sur le chemin de l'agent a rendu un faux `GATE_INDISPONIBLE`
dans 2 runs sur 4, sur une installation parfaitement saine (agent présent, vérifié par `ls`
à la main dans le cache du plugin). Le message affiché envoyait alors réparer une
installation qui n'avait rien.

Corrigé en supprimant le préflight, pas en le durcissant : la skill et l'agent étant livrés
dans le même plugin, le seul juge fiable de l'existence de l'agent est le spawn lui-même. La
règle générale : dans un `SKILL.md`, n'écris du bash qu'avec de vraies variables shell
(`$HOME`, `$PWD`) ou des chemins absolus en dur. Un placeholder que le modèle doit remplir
est un point de panne silencieux.

## La skill reformule son bloc de sortie sur le chemin d'échec

Un gabarit d'affichage posé dans un fence de `SKILL.md` est lu comme une illustration, pas
comme une contrainte. Le chemin nominal (verdict PASS/FAIL) le respecte ; le chemin d'échec
transport, non : la skill écrit son propre message, et peut même proposer une action absente
du fichier (« tu veux que je configure `agy` maintenant ? »). Résultat : Romain perd le
repère visuel qui lui dit d'un coup d'œil qu'un jugement a eu lieu.

Corroboré 2 fois le 05/09/2026 sur `AC-5`. Une consigne « affiche VERBATIM » en tête de
l'Étape 3 n'a pas suffi. Ce qui a marché, c'est une section « Règle de sortie
(non négociable) » **en tête de fichier**, qui énumère les blocs possibles, dit à quelle
condition mécanique chacun se déclenche, et interdit toute action proposée hors fichier.
Même cause pour le `TMP_DIR` non corbeillé sur ce chemin : la skill sortait avant l'Étape 4.

Re-vérifier, depuis la racine du dépôt. Attendu : la sortie commence par
`══════ TASTE GATE ÉCHOUÉ (transport) ══════`, et rien avant.

```bash
AGY_BIN=/nonexistent claude --plugin-dir plugin --permission-mode bypassPermissions \
  -p "/erom-vision:gate-vision <une-capture.png>"
```

Piège du test lui-même : `AGY_BIN` n'atteint pas toujours le sous-processus Bash de l'agent,
et le repli `command -v agy` retrouve alors le vrai binaire. Le run rend un vrai verdict au
lieu du bloc d'échec, ce qui ressemble à un bug et n'en est pas. Trancher sur les logs :
un run daté dans `~/.gemini/antigravity-cli/log/cli-*.log` au moment du test prouve
qu'`agy` a tourné pour de bon.

## `erom-gemini` porte le même manifeste cassé que celui décrit à l'invariant 5

L'invariant 5 du `CLAUDE.md` (clé `agents` explicite = `Agents (0)`) s'est confirmé une
seconde fois hors de ce dépôt : `erom-gemini@0.3.0` déclare
`"agents": ["./agents/gemini-run.md"]` et `claude plugin details erom-gemini` affiche
`Agents (0)`. Son agent `gemini-run` est donc probablement invisible à l'inventaire chez
lui aussi. Non corrigé ici, c'est un autre dépôt.

```bash
cd ~/dev/erom-agence-gemini && claude --plugin-dir plugin plugin details erom-gemini
```
