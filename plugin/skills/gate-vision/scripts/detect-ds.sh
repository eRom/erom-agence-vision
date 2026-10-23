#!/bin/bash
# Détecte le profil DS du projet courant (cwd), dans l'ordre du routeur erom-design v4 :
# 1 institut, 2 perso déjà adopté, 3 application, 4 perso par défaut.
# Sortie : une ligne « DS=<profil> SIGNAL=<ce qui a tranché> ».

hit() { command grep -rqiE "$1" "${@:2}" 2>/dev/null; }

if hit 'erom-institut' package.json src/ CLAUDE.md _memory_/; then
  echo "DS=institut SIGNAL=erom-institut référencé"; exit 0
fi

if hit 'shadcn' package.json components.json; then
  echo "DS=perso SIGNAL=shadcn (projet déjà sur le DS perso)"; exit 0
fi
if hit '(DS|design system|profil) perso' CLAUDE.md _memory_/; then
  echo "DS=perso SIGNAL=DS perso déclaré dans CLAUDE.md ou _memory_"; exit 0
fi

if hit 'erom-design-system-application|(DS|design system|profil) application' CLAUDE.md _memory_/ package.json; then
  echo "DS=application SIGNAL=DS application déclaré"; exit 0
fi
if [ -f Cargo.toml ] || [ -d src-tauri ]; then
  echo "DS=application SIGNAL=app native (Cargo.toml ou src-tauri)"; exit 0
fi
if hit '"(electron|next|astro|@tauri-apps/api)"[[:space:]]*:' package.json; then
  echo "DS=application SIGNAL=web app ou Electron (dépendance $(command grep -oE '"(electron|next|astro|@tauri-apps/api)"[[:space:]]*:' package.json | head -1 | tr -d '": '))"; exit 0
fi

echo "DS=perso SIGNAL=défaut (aucun signal institut, perso ni application)"
