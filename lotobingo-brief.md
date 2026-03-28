# LotoBingo — Project Brief

## Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- localStorage (no database)
- Deployable on Vercel free tier

---

## Design System

| Token | Value |
|-------|-------|
| Font titre | Anton (Google Fonts) |
| Font texte | DM Sans (Google Fonts) |
| Fond | `#FFFFFF` |
| Bleu électrique | `#0066FF` |
| Violet | `#7B2FFF` |
| Rose fluo | `#FF2D78` |
| Gris inactif | `#E5E5E5` |

---

## Data Model

```typescript
type Grid = { id: string; numbers: number[][] }
// 3 lignes × 9 colonnes = 27 numéros, valeurs 0–100

type Player = { name: "Astrid" | "Marie" | "Victoire"; grids: Grid[] }

type DrawResult = {
  gridId: string
  playerName: string
  matches: number
  matchedNumbers: number[]
}

type Draw = { id: number; drawnNumbers: number[]; results: DrawResult[] }

type GameSession = { players: Player[]; draws: Draw[] }
```

---

## Page 1 — `/setup` — Mes Grilles

- 3 sections, une par joueuse (Astrid, Marie, Victoire), titre en Anton couleur accent
- Par grille : 27 champs de saisie numérique organisés en 3 lignes de 9
- Validation : chaque valeur entre 0 et 100, pas de doublons dans une même grille
- Bouton `+ Ajouter une grille` par joueuse
- Bouton `Supprimer` par grille
- Bouton CTA `Commencer à jouer →` qui navigue vers `/game`
- Sauvegarde automatique en localStorage à chaque modification

---

## Page 2 — `/game` — Tirage en cours

### Header
- Titre `Tirage #N` en Anton

### Saisie
- Grand input centré + bouton `Tirer` (validation aussi sur Enter)
- Numéros déjà tirés ignorés (pas de doublons)
- Numéros tirés affichés en badges rose fluo sous l'input

### Filtre joueuse
- 4 boutons pill : `Toutes` `Astrid` `Marie` `Victoire`
- Actif : fond bleu électrique
- Inactif : outline violet

### Affichage des grilles
- Bloc par grille : label `Grille 1 — 6/27` en Anton
- 27 numéros affichés à plat sur 2 lignes de 9 en badges
- Numéro tiré → fond rose fluo, texte blanc, micro-animation 150ms ease
- Numéro non tiré → fond gris clair `#E5E5E5`, texte gris

### BINGO
- Quand une grille atteint 27/27 :
  - Bloc en fond violet
  - Texte `🎉 BINGO !` en Anton 48px
  - Animation CSS pulse
  - Son festif généré via Web Audio API (aucun fichier externe)

### Actions
- Bouton `Terminer ce tirage` : sauvegarde le tirage, réinitialise les numéros tirés, incrémente le numéro de tirage. Les grilles restent identiques.

---

## Page 3 — `/history` — Historique

- Tirages listés du plus récent au plus ancien
- Pour chaque tirage : numéros tirés + tableau résultats par grille et par joueuse (matches/27)
- Bouton `Effacer l'historique` avec modale de confirmation

---

## UX / UI Details

- **Mobile-first**, breakpoints sm / md / lg
- Navigation **bottom bar** sur mobile avec icônes pour les 3 pages
- Transitions douces sur tous les badges (150ms ease)
- Feedback visuel immédiat à chaque numéro tiré
- Pas de fichiers assets externes (sons générés programmatiquement)

---

## Livrable attendu

Générer l'intégralité du projet fichier par fichier, prêt à lancer avec :

```bash
npm install
npm run dev
```
