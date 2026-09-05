# Gotchas — erom-vision

Dernière mise à jour : 2026-09-05.

## La skill reformule son bloc de sortie sur le chemin d'échec

Un gabarit d'affichage posé dans un fence de `SKILL.md` est lu comme une illustration,
pas comme une contrainte. Le chemin nominal (verdict PASS/FAIL) le respecte ; le chemin
d'échec transport, non : la skill écrit son propre message, et peut même proposer une
action absente du fichier (« tu veux que je configure `agy` maintenant ? »). Résultat :
Romain perd le repère visuel qui lui dit d'un coup d'œil qu'un jugement a eu lieu.

Corroboré 2 fois le 05/09/2026, sur `AC-5` (`AGY_BIN=/nonexistent`), aux passages 1 et 2.
Le passage 2 avait pourtant déjà une consigne « affiche VERBATIM » en tête de l'Étape 3 :
insuffisant. Ce qui a marché au passage 3, c'est une section « Règle de sortie
(non négociable) » **en tête de fichier**, qui énumère les trois blocs possibles et
interdit explicitement toute action proposée hors fichier. Même cause pour le `TMP_DIR`
non corbeillé sur ce chemin : la skill sortait avant l'Étape 4.

Re-vérifier en une commande, depuis la racine du dépôt :

```bash
AGY_BIN=/nonexistent claude --plugin-dir plugin --permission-mode bypassPermissions \
  -p "/erom-vision:gate-vision <une-capture.png>"
```

Attendu : la sortie commence par `══════ TASTE GATE ÉCHOUÉ (transport) ══════`, et rien
avant. Toute prose autour = la règle de sortie a re-décroché.

## `erom-gemini` porte le même manifeste cassé que celui décrit à l'invariant 5

L'invariant 5 du `CLAUDE.md` (clé `agents` explicite = `Agents (0)`) s'est confirmé une
seconde fois hors de ce dépôt : `erom-gemini@0.3.0` déclare
`"agents": ["./agents/gemini-run.md"]` et `claude plugin details erom-gemini` affiche
`Agents (0)`. Son agent `gemini-run` est donc probablement invisible à l'inventaire chez
lui aussi. Non corrigé ici, c'est un autre dépôt.

```bash
cd ~/dev/erom-agence-gemini && claude --plugin-dir plugin plugin details erom-gemini
```
