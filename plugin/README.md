# erom-vision

Plugin Claude Code. Juge vision automatique d'un rendu UI contre la grille eRom : verdict PASS/FAIL ancré sur ce qui est vu, avant de montrer le rendu.

## Installation

```
/plugin marketplace add eRom/erom-marketplace
/plugin install erom-vision@erom-marketplace
```

## Les skills

| Skill | Invocation | Ce qu'elle fait |
|---|---|---|
| `gate-vision` | `/erom-vision:gate-vision [ds=perso\|institut] <image\|url> [<image2> ...]` | Juge une ou plusieurs captures d'un rendu UI contre la grille eRom du profil DS actif (perso dark-first ou institut papier/encre) et rend un verdict PASS/FAIL sur 10 critères binaires, ancré sur ce qui est vu. Le juge ne modifie rien. |

## Licence

MIT, Romain Ecarnot.
