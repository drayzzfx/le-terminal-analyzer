---
name: le-terminal-design
description: Use this skill to generate well-branded interfaces and assets for Le Terminal, an AI-powered trading tools hub, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping in the "Cinematic Luxury" aesthetic — cold, precise, midnight private trading floor.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Essentials
- **Aesthetic**: "Cinematic Luxury" — midnight private trading floor in a jet hangar. Cold, precise, restrained.
- **Palette**: four dark backgrounds (`#07090C`→`#161B24`); ONE rare glacial-blue accent `#7FB8E8` (CTAs/links/glows only); market semantics `#4ADE9C`/`#F0647A`/`#E8C268`. No purple, no neon, no blue-purple gradients.
- **Type**: Anton (massive uppercase display, brushed-metal `background-clip:text`), Inter (text), JetBrains Mono (all numerals, tabular).
- **Motion**: cinematic ease-out, sequenced hero entrance, scroll reveals (once), animated counters, mouse spotlight, ≤3° card tilt. Always honor `prefers-reduced-motion`.
- **Icons**: thin-stroke SVG (1.5px) only. NO emoji.
- **Copy**: French, soutenu but dry; uppercase display headings; tabular French-formatted numbers.

## Files
- `styles.css` — link this single file to inherit all tokens + fonts.
- `tokens/` — colors, fonts, typography, spacing/radii/shadows/motion.
- `components/` — Button, Badge, Card, Input, Stat (React, consume CSS vars).
- `ui_kits/marketing/` — full cinematic homepage recreation.
- `guidelines/` — foundation specimen cards.
