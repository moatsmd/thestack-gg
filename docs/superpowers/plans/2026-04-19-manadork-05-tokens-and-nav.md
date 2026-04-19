# ManaDork Overhaul — Plan 5: Token Reference + Navigation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a token reference page at `/tokens` with ~80 common tokens (creatures, artifacts, emblems), filterable by color and type. Then restructure the bottom nav to: Tracker / Cards / Dice / Glossary / More, with Stack, Rules, Tokens, and New Players in the More drawer.

**Architecture:**
- `types/tokens.ts`: `TokenDefinition` interface
- `lib/tokens-data.ts`: static data (~80 tokens)
- `hooks/useTokens.ts`: search + filter state
- `components/TokenCard.tsx`: renders one token
- `app/tokens/page.tsx`: search input + color/type filters + token grid
- `components/BottomNavBar.tsx`: update navItems + moreItems arrays; add 'dice' SVG icon

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3.

**Prerequisite:** Plan 4 complete — `/dice` route exists before it can be linked in nav.

---

## File Map

| File | Action |
|---|---|
| `types/tokens.ts` | Create: `TokenDefinition` interface |
| `lib/tokens-data.ts` | Create: static array of ~80 token definitions |
| `hooks/useTokens.ts` | Create: search + filter hook |
| `components/TokenCard.tsx` | Create: renders one token card |
| `app/tokens/page.tsx` | Create: token reference page |
| `components/BottomNavBar.tsx` | Modify: new navItems + moreItems + dice SVG |
| `app/__tests__/tokens.test.tsx` | Create: token page tests |
| `app/__tests__/nav.test.tsx` | Create: nav restructure tests |

---

### Task 12: Token data types and static data

**Files:**
- Create: `types/tokens.ts`
- Create: `lib/tokens-data.ts`

- [ ] **Step 1: Write failing test**

Create `app/__tests__/tokens.test.tsx`:

```tsx
describe('token data', () => {
  it('TOKENS array exists and has entries', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    expect(Array.isArray(TOKENS)).toBe(true)
    expect(TOKENS.length).toBeGreaterThan(10)
  })

  it('every token has required fields', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    for (const t of TOKENS) {
      expect(t.name).toBeTruthy()
      expect(Array.isArray(t.colors)).toBe(true)
      expect(['creature', 'artifact', 'enchantment', 'emblem']).toContain(t.type)
      expect(Array.isArray(t.abilities)).toBe(true)
      expect(Array.isArray(t.madeBy)).toBe(true)
    }
  })

  it('Goblin token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const goblin = TOKENS.find((t: any) => t.name === 'Goblin')
    expect(goblin).toBeDefined()
    expect(goblin.colors).toContain('R')
    expect(goblin.type).toBe('creature')
  })

  it('Treasure token exists', () => {
    const { TOKENS } = require('@/lib/tokens-data')
    const treasure = TOKENS.find((t: any) => t.name === 'Treasure')
    expect(treasure).toBeDefined()
    expect(treasure.type).toBe('artifact')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tokens.test.tsx --testNamePattern="TOKENS array" --no-coverage 2>&1 | tail -10
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `types/tokens.ts`**

```ts
export type TokenColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
export type TokenType = 'creature' | 'artifact' | 'enchantment' | 'emblem'

export interface TokenDefinition {
  name: string
  colors: TokenColor[]
  type: TokenType
  power?: string
  toughness?: string
  typeLine: string
  abilities: string[]
  madeBy: string[]
}
```

- [ ] **Step 4: Create `lib/tokens-data.ts`**

```ts
import { TokenDefinition } from '@/types/tokens'

export const TOKENS: TokenDefinition[] = [
  // ── Creature Tokens — White ─────────────────────────────────────────
  {
    name: 'Soldier',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Soldier',
    abilities: [],
    madeBy: ['Raise the Alarm', 'Call the Conclave', 'Captain of the Watch'],
  },
  {
    name: 'Angel',
    colors: ['W'],
    type: 'creature',
    power: '4',
    toughness: '4',
    typeLine: 'Creature — Angel',
    abilities: ['Flying', 'Vigilance'],
    madeBy: ['Entreat the Angels', 'Sigarda\'s Aid', 'Emeria, Shattered Skyclave'],
  },
  {
    name: 'Bird',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Bird',
    abilities: ['Flying'],
    madeBy: ['Migratory Route', 'Aven Wind Guide'],
  },
  {
    name: 'Spirit (White)',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Spirit',
    abilities: ['Flying'],
    madeBy: ['Lingering Souls', 'Spectral Procession', 'Midnight Haunting'],
  },
  {
    name: 'Human (White)',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Human',
    abilities: [],
    madeBy: ['Increasing Devotion', 'Thraben Doomsayer'],
  },
  {
    name: 'Knight (White)',
    colors: ['W'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Knight',
    abilities: ['Vigilance'],
    madeBy: ['History of Benalia', 'Inspiring Commander'],
  },
  {
    name: 'Pegasus',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Pegasus',
    abilities: ['Flying'],
    madeBy: ['Oketra\'s Monument', 'Decree of Justice'],
  },

  // ── Creature Tokens — Blue ──────────────────────────────────────────
  {
    name: 'Drake',
    colors: ['U'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Drake',
    abilities: ['Flying'],
    madeBy: ['Talrand, Sky Summoner', 'Young Pyromancer (blue variant)'],
  },
  {
    name: 'Merfolk (Blue)',
    colors: ['U'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Merfolk',
    abilities: [],
    madeBy: ['Master of the Pearl Trident', 'Merrow Commerce'],
  },
  {
    name: 'Illusion',
    colors: ['U'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Illusion',
    abilities: ['Flying'],
    madeBy: ['Mhault\'s Illusion', 'Kefnet\'s Monument'],
  },
  {
    name: 'Squid',
    colors: ['U'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Squid',
    abilities: ['Islandwalk'],
    madeBy: ['Ior Ruin Expedition'],
  },
  {
    name: 'Thopter (Blue)',
    colors: ['U'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Thopter Artifact',
    abilities: ['Flying'],
    madeBy: ['Thopter Spy Network', 'Whirler Rogue'],
  },

  // ── Creature Tokens — Black ─────────────────────────────────────────
  {
    name: 'Zombie',
    colors: ['B'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Zombie',
    abilities: [],
    madeBy: ['Army of the Damned', 'Endless Ranks of the Dead', 'Josu Vess, Lich Knight'],
  },
  {
    name: 'Vampire (Black)',
    colors: ['B'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Vampire',
    abilities: ['Flying', 'Lifelink'],
    madeBy: ['Legion\'s Landing', 'Call the Bloodline'],
  },
  {
    name: 'Rat',
    colors: ['B'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Rat',
    abilities: [],
    madeBy: ['Rat Colony', 'Pack Rat'],
  },
  {
    name: 'Skeleton',
    colors: ['B'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Skeleton',
    abilities: [],
    madeBy: ['Ayara, Widow of the Realm', 'Skirsdag Flayer'],
  },

  // ── Creature Tokens — Red ───────────────────────────────────────────
  {
    name: 'Goblin',
    colors: ['R'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Goblin',
    abilities: [],
    madeBy: ['Krenko, Mob Boss', 'Dragon Fodder', 'Hordeling Outburst'],
  },
  {
    name: 'Dragon',
    colors: ['R'],
    type: 'creature',
    power: '5',
    toughness: '5',
    typeLine: 'Creature — Dragon',
    abilities: ['Flying'],
    madeBy: ['Dragonmaster Outcast', 'Utvara Hellkite'],
  },
  {
    name: 'Elemental (Red)',
    colors: ['R'],
    type: 'creature',
    power: '3',
    toughness: '1',
    typeLine: 'Creature — Elemental',
    abilities: ['Trample', 'Haste'],
    madeBy: ['Omnath, Locus of Rage', 'Young Pyromancer'],
  },
  {
    name: 'Devil',
    colors: ['R'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Devil',
    abilities: ['When this creature dies, it deals 1 damage to any target.'],
    madeBy: ['Zurzoth, Chaos Rider', 'Tibalt, Rakish Instigator'],
  },

  // ── Creature Tokens — Green ─────────────────────────────────────────
  {
    name: 'Saproling',
    colors: ['G'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Saproling',
    abilities: [],
    madeBy: ['Tendershoot Dryad', 'Sprout Swarm', 'Slimefoot, the Stowaway'],
  },
  {
    name: 'Beast',
    colors: ['G'],
    type: 'creature',
    power: '3',
    toughness: '3',
    typeLine: 'Creature — Beast',
    abilities: [],
    madeBy: ['Garruk Wildspeaker', 'Primordial Sage', 'Call of the Herd'],
  },
  {
    name: 'Insect (Green)',
    colors: ['G'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Insect',
    abilities: ['Flying', 'Deathtouch'],
    madeBy: ['Hornet Queen', 'Ishkanah, Grafwidow'],
  },
  {
    name: 'Plant',
    colors: ['G'],
    type: 'creature',
    power: '0',
    toughness: '1',
    typeLine: 'Creature — Plant',
    abilities: [],
    madeBy: ['Avenger of Zendikar', 'Vigor'],
  },
  {
    name: 'Wolf',
    colors: ['G'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Wolf',
    abilities: [],
    madeBy: ['Garruk, Primal Hunter', 'Arlinn Kord', 'Howlpack Piper'],
  },
  {
    name: 'Wurm (Green)',
    colors: ['G'],
    type: 'creature',
    power: '3',
    toughness: '3',
    typeLine: 'Creature — Wurm',
    abilities: ['Deathtouch'],
    madeBy: ['Garruk, Primal Hunter', 'Snake Umbra'],
  },
  {
    name: 'Spider',
    colors: ['G'],
    type: 'creature',
    power: '1',
    toughness: '2',
    typeLine: 'Creature — Spider',
    abilities: ['Reach'],
    madeBy: ['Ishkanah, Grafwidow', 'Spider Spawning'],
  },
  {
    name: 'Squirrel',
    colors: ['G'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Squirrel',
    abilities: [],
    madeBy: ['Chatterfang, Squirrel General', 'Squirrel Nest'],
  },

  // ── Creature Tokens — Multicolor ────────────────────────────────────
  {
    name: 'Faerie Rogue',
    colors: ['U', 'B'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Faerie Rogue',
    abilities: ['Flying'],
    madeBy: ['Bitterblossom', 'Notorious Throng'],
  },
  {
    name: 'Elf Warrior',
    colors: ['G', 'W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Elf Warrior',
    abilities: [],
    madeBy: ['Voice of Resurgence', 'Rhys the Redeemed'],
  },
  {
    name: 'Knight (White/Black)',
    colors: ['W', 'B'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Knight',
    abilities: ['Vigilance', 'Lifelink'],
    madeBy: ['Sorin, Solemn Visitor', 'Elspeth, Sun\'s Champion'],
  },
  {
    name: 'Human Soldier',
    colors: ['W'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Human Soldier',
    abilities: [],
    madeBy: ['Elspeth, Sun\'s Champion', 'Field Marshal'],
  },
  {
    name: 'Warrior',
    colors: ['W', 'B'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Warrior',
    abilities: [],
    madeBy: ['Mardu Shadowspear', 'Alesha, Who Smiles at Death'],
  },

  // ── Creature Tokens — Colorless ─────────────────────────────────────
  {
    name: 'Construct',
    colors: ['C'],
    type: 'creature',
    power: '*',
    toughness: '*',
    typeLine: 'Creature — Construct Artifact',
    abilities: [],
    madeBy: ['Urza, Lord High Artificer', 'Thopter Foundry'],
  },
  {
    name: 'Golem',
    colors: ['C'],
    type: 'creature',
    power: '3',
    toughness: '3',
    typeLine: 'Creature — Golem Artifact',
    abilities: [],
    madeBy: ['Precursor Golem', 'Spine of Ish Sah'],
  },
  {
    name: 'Eldrazi Scion',
    colors: ['C'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Eldrazi Scion',
    abilities: ['Sacrifice this creature: Add C.'],
    madeBy: ['From Beyond', 'Blight Herder', 'Emrakul, the Promised End'],
  },
  {
    name: 'Eldrazi Spawn',
    colors: ['C'],
    type: 'creature',
    power: '0',
    toughness: '1',
    typeLine: 'Creature — Eldrazi Spawn',
    abilities: ['Sacrifice this creature: Add C.'],
    madeBy: ['Emrakul, the Aeons Torn (trigger)', 'Nest Invader'],
  },
  {
    name: 'Myr',
    colors: ['C'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Myr Artifact',
    abilities: [],
    madeBy: ['Myr Battlesphere', 'Myrsmith'],
  },
  {
    name: 'Servo',
    colors: ['C'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Servo Artifact',
    abilities: [],
    madeBy: ['Servo Exhibition', 'Sram\'s Expertise', 'Toolcraft Exemplar'],
  },
  {
    name: 'Thopter (Colorless)',
    colors: ['C'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Thopter Artifact',
    abilities: ['Flying'],
    madeBy: ['Thopter Foundry', 'Master of Etherium', 'Padeem, Consul of Innovation'],
  },

  // ── Artifact Tokens ──────────────────────────────────────────────────
  {
    name: 'Treasure',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Treasure',
    abilities: ['Tap, Sacrifice this artifact: Add one mana of any color.'],
    madeBy: ['Smothering Tithe', 'Xorn', 'Prosper, Tome-Bound'],
  },
  {
    name: 'Clue',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Clue',
    abilities: ['2, Sacrifice this artifact: Draw a card.'],
    madeBy: ['Thraben Inspector', 'Graf Mole', 'Tamiyo\'s Journal'],
  },
  {
    name: 'Food',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Food',
    abilities: ['2, Tap, Sacrifice this artifact: You gain 3 life.'],
    madeBy: ['Gilded Goose', 'The Cauldron of Eternity', 'Oko, Thief of Crowns'],
  },
  {
    name: 'Blood',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Blood',
    abilities: ['1, Tap, Discard a card, Sacrifice this artifact: Draw a card.'],
    madeBy: ['Bloodtithe Harvester', 'Voldaren Bloodcaster', 'Olivia\'s Attendants'],
  },
  {
    name: 'Map',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Map',
    abilities: ['1, Tap, Sacrifice this artifact: Target creature you control explores.'],
    madeBy: ['Abuelo\'s Awakening', 'Caparocti Sunborn', 'Oltec Cloud Guard'],
  },
  {
    name: 'Gold',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Gold',
    abilities: ['Sacrifice this artifact: Add one mana of any color.'],
    madeBy: ['Revel in Riches', 'Tempt with Immortality'],
  },
  {
    name: 'Powerstone',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Powerstone',
    abilities: ['Tap: Add C. This mana can\'t be spent to cast nonartifact spells.'],
    madeBy: ['Teferi, Temporal Pilgrim', 'Karn, Living Legacy'],
  },
  {
    name: 'Junk',
    colors: ['C'],
    type: 'artifact',
    typeLine: 'Artifact — Junk',
    abilities: ['Sacrifice this artifact: Add one mana of any color. Spend this mana only to cast a spell with Casualty, Blitz, or for an activated ability.'],
    madeBy: ['Ob Nixilis, the Adversary', 'Riveteers Charm'],
  },

  // ── Emblems ──────────────────────────────────────────────────────────
  {
    name: 'Teferi Emblem',
    colors: ['C'],
    type: 'emblem',
    typeLine: 'Emblem — Teferi',
    abilities: ['You may activate loyalty abilities of planeswalkers you control on any player\'s turn any time you could cast an instant.'],
    madeBy: ['Teferi, Hero of Dominaria'],
  },
  {
    name: 'Garruk Emblem',
    colors: ['C'],
    type: 'emblem',
    typeLine: 'Emblem — Garruk',
    abilities: ['Creatures you control get +3/+3 and have trample.'],
    madeBy: ['Garruk, Apex Predator'],
  },
  {
    name: 'Liliana Emblem',
    colors: ['C'],
    type: 'emblem',
    typeLine: 'Emblem — Liliana',
    abilities: ['At the beginning of your end step, each opponent sacrifices a creature.'],
    madeBy: ['Liliana, the Last Hope', 'Liliana Vess'],
  },
  {
    name: 'Elspeth Emblem',
    colors: ['C'],
    type: 'emblem',
    typeLine: 'Emblem — Elspeth',
    abilities: ['Creatures you control get +2/+2 and have flying.'],
    madeBy: ['Elspeth, Knight-Errant'],
  },
  {
    name: 'Chandra Emblem',
    colors: ['C'],
    type: 'emblem',
    typeLine: 'Emblem — Chandra',
    abilities: ['Whenever you cast a red spell, this emblem deals 10 damage to any target.'],
    madeBy: ['Chandra, Torch of Defiance'],
  },

  // ── Special & Commander Staples ──────────────────────────────────────
  {
    name: 'Copy',
    colors: ['C'],
    type: 'creature',
    power: '*',
    toughness: '*',
    typeLine: 'Creature — (copy of target)',
    abilities: ['This token is a copy of the chosen creature (no token type of its own).'],
    madeBy: ['Delina, Wild Mage', 'Mimic Vat', 'Orthion, Hero of Lavabrink'],
  },
  {
    name: 'Zombie Knight',
    colors: ['B'],
    type: 'creature',
    power: '2',
    toughness: '2',
    typeLine: 'Creature — Zombie Knight',
    abilities: ['Menace'],
    madeBy: ['Josu Vess, Lich Knight (kicked)'],
  },
  {
    name: 'Vampire (Red/White)',
    colors: ['W', 'R'],
    type: 'creature',
    power: '1',
    toughness: '1',
    typeLine: 'Creature — Vampire',
    abilities: ['Flying', 'First Strike', 'Haste'],
    madeBy: ['Olivia, Crimson Bride'],
  },
  {
    name: 'Zombie (Embalm)',
    colors: ['W'],
    type: 'creature',
    power: '*',
    toughness: '*',
    typeLine: 'Creature — Zombie (creature type of original card)',
    abilities: ['White Zombie token copy of the original; created via Embalm.'],
    madeBy: ['Vizier of Many Faces', 'Sacred Cat', 'Anointer Priest'],
  },
]

// Quick lookup map
export const TOKENS_MAP = new Map<string, TokenDefinition>(
  TOKENS.map((t) => [t.name.toLowerCase(), t])
)

export function searchTokens(query: string): TokenDefinition[] {
  const q = query.toLowerCase().trim()
  if (!q) return TOKENS
  return TOKENS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.typeLine.toLowerCase().includes(q) ||
      t.madeBy.some((m) => m.toLowerCase().includes(q)) ||
      t.abilities.some((a) => a.toLowerCase().includes(q))
  )
}
```

- [ ] **Step 5: Run tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tokens.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: all pass.

- [ ] **Step 6: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/moats/ManaDork && git add types/tokens.ts lib/tokens-data.ts app/__tests__/tokens.test.tsx && git commit -m "feat(tokens): add TokenDefinition type and ~60 static token definitions"
```

---

### Task 13: Token reference hook, card, and page

**Files:**
- Create: `hooks/useTokens.ts`
- Create: `components/TokenCard.tsx`
- Create: `app/tokens/page.tsx`

- [ ] **Step 1: Write failing tests**

In `app/__tests__/tokens.test.tsx`, add:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TokensPage from '../tokens/page'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderTokens = () => render(<DarkModeProvider><TokensPage /></DarkModeProvider>)

describe('TokensPage', () => {
  it('renders heading', () => {
    renderTokens()
    expect(screen.getByRole('heading', { name: /tokens/i })).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderTokens()
    expect(screen.getByTestId('token-search')).toBeInTheDocument()
  })

  it('renders token cards', () => {
    renderTokens()
    const cards = screen.getAllByTestId('token-card')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('filters by search query', async () => {
    const user = userEvent.setup()
    renderTokens()
    await user.type(screen.getByTestId('token-search'), 'goblin')
    const cards = screen.getAllByTestId('token-card')
    expect(cards.some((c) => c.textContent?.toLowerCase().includes('goblin'))).toBe(true)
  })

  it('color filter buttons exist', () => {
    renderTokens()
    expect(screen.getByTestId('color-filter-R')).toBeInTheDocument()
    expect(screen.getByTestId('color-filter-W')).toBeInTheDocument()
    expect(screen.getByTestId('color-filter-C')).toBeInTheDocument()
  })

  it('type filter buttons exist', () => {
    renderTokens()
    expect(screen.getByTestId('type-filter-creature')).toBeInTheDocument()
    expect(screen.getByTestId('type-filter-artifact')).toBeInTheDocument()
    expect(screen.getByTestId('type-filter-emblem')).toBeInTheDocument()
  })

  it('shows empty state when no match', async () => {
    const user = userEvent.setup()
    renderTokens()
    await user.type(screen.getByTestId('token-search'), 'zzznomatch')
    expect(screen.getByTestId('tokens-empty-state')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tokens.test.tsx --testNamePattern="TokensPage" --no-coverage 2>&1 | tail -15
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `hooks/useTokens.ts`**

```ts
'use client'

import { useState, useMemo } from 'react'
import { TokenDefinition, TokenColor, TokenType } from '@/types/tokens'
import { TOKENS, searchTokens } from '@/lib/tokens-data'

export interface UseTokensResult {
  filteredTokens: TokenDefinition[]
  query: string
  selectedColors: TokenColor[]
  selectedTypes: TokenType[]
  setQuery: (q: string) => void
  toggleColor: (color: TokenColor) => void
  toggleType: (type: TokenType) => void
}

export function useTokens(): UseTokensResult {
  const [query, setQuery] = useState('')
  const [selectedColors, setSelectedColors] = useState<TokenColor[]>([])
  const [selectedTypes, setSelectedTypes] = useState<TokenType[]>([])

  const filteredTokens = useMemo(() => {
    let results = query.trim() ? searchTokens(query) : TOKENS

    if (selectedColors.length > 0) {
      results = results.filter((t) =>
        selectedColors.some((c) => t.colors.includes(c))
      )
    }

    if (selectedTypes.length > 0) {
      results = results.filter((t) => selectedTypes.includes(t.type))
    }

    return results
  }, [query, selectedColors, selectedTypes])

  const toggleColor = (color: TokenColor) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )

  const toggleType = (type: TokenType) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )

  return { filteredTokens, query, selectedColors, selectedTypes, setQuery, toggleColor, toggleType }
}
```

- [ ] **Step 4: Create `components/TokenCard.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { TokenDefinition, TokenColor } from '@/types/tokens'

interface TokenCardProps {
  token: TokenDefinition
}

const colorPip: Record<TokenColor, { bg: string; label: string }> = {
  W: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200', label: 'W' },
  U: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', label: 'U' },
  B: { bg: 'bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-100', label: 'B' },
  R: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', label: 'R' },
  G: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', label: 'G' },
  C: { bg: 'bg-[var(--surface-2)] text-[var(--muted)]', label: 'C' },
}

export function TokenCard({ token }: TokenCardProps) {
  return (
    <div
      className="bg-white dark:bg-[var(--surface-1)] border border-white/10 rounded-lg p-4 shadow-sm hover:shadow-md transition"
      data-testid="token-card"
    >
      {/* Name + color pips */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-lg font-bold text-[var(--ink)]">{token.name}</h3>
        <div className="flex gap-1">
          {token.colors.map((c) => (
            <span
              key={c}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${colorPip[c].bg}`}
            >
              {colorPip[c].label}
            </span>
          ))}
        </div>
      </div>

      {/* Type line and P/T */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[var(--muted)]">{token.typeLine}</p>
        {token.power !== undefined && token.toughness !== undefined && (
          <span className="text-sm font-bold text-[var(--ink)] ml-2">
            {token.power}/{token.toughness}
          </span>
        )}
      </div>

      {/* Abilities */}
      {token.abilities.length > 0 && (
        <div className="mb-3">
          {token.abilities.map((ability, i) => (
            <p key={i} className="text-sm text-[var(--muted)] italic">
              {ability}
            </p>
          ))}
        </div>
      )}

      {/* Made by */}
      <div>
        <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mb-1">
          Made by
        </p>
        <div className="flex flex-wrap gap-1">
          {token.madeBy.slice(0, 3).map((card) => (
            <Link
              key={card}
              href={`/toolkit?q=${encodeURIComponent(card)}`}
              className="text-xs text-[var(--accent-2)] hover:underline"
            >
              {card}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/tokens/page.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { TokenCard } from '@/components/TokenCard'
import { useTokens } from '@/hooks/useTokens'
import type { TokenColor, TokenType } from '@/types/tokens'

const COLORS: { color: TokenColor; label: string; pip: string }[] = [
  { color: 'W', label: 'White', pip: 'bg-yellow-200 text-yellow-900' },
  { color: 'U', label: 'Blue', pip: 'bg-blue-200 text-blue-900' },
  { color: 'B', label: 'Black', pip: 'bg-gray-800 text-gray-100' },
  { color: 'R', label: 'Red', pip: 'bg-red-200 text-red-900' },
  { color: 'G', label: 'Green', pip: 'bg-green-200 text-green-900' },
  { color: 'C', label: 'Colorless', pip: 'bg-[var(--surface-2)] text-[var(--muted)]' },
]

const TYPES: { type: TokenType; label: string }[] = [
  { type: 'creature', label: 'Creature' },
  { type: 'artifact', label: 'Artifact' },
  { type: 'enchantment', label: 'Enchantment' },
  { type: 'emblem', label: 'Emblem' },
]

export default function TokensPage() {
  const { filteredTokens, query, selectedColors, selectedTypes, setQuery, toggleColor, toggleType } = useTokens()
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const t = setTimeout(() => setQuery(debouncedQuery), 300)
    return () => clearTimeout(t)
  }, [debouncedQuery, setQuery])

  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <div className="container mx-auto px-4 py-8">

        <header className="arcane-panel mana-border rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Reference</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">Tokens</h1>
          <p className="mt-1 text-[var(--muted)]">Common token types for Commander and competitive play.</p>
        </header>

        {/* Search + Filters */}
        <div className="mb-6 space-y-4 arcane-panel mana-border rounded-2xl p-6">
          <input
            type="text"
            placeholder="Search tokens, abilities, or cards that make them..."
            value={debouncedQuery}
            onChange={(e) => setDebouncedQuery(e.target.value)}
            className="w-full px-4 py-2 border border-white/10 rounded-lg bg-[var(--surface-1)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-2)] focus:border-transparent"
            data-testid="token-search"
          />

          {/* Color filter */}
          <div className="flex flex-wrap gap-2">
            {COLORS.map(({ color, label, pip }) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  selectedColors.includes(color)
                    ? pip
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={`color-filter-${color}`}
                aria-pressed={selectedColors.includes(color)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  selectedTypes.includes(type)
                    ? 'bg-[var(--accent-1)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={`type-filter-${type}`}
                aria-pressed={selectedTypes.includes(type)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--muted)] mb-4">
          Showing {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''}
        </p>

        {filteredTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map((token) => (
              <TokenCard key={`${token.name}-${token.colors.join('')}`} token={token} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-[var(--muted)]"
            data-testid="tokens-empty-state"
          >
            <p className="text-lg font-semibold mb-2">No tokens found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run all token tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tokens.test.tsx --no-coverage 2>&1 | tail -25
```

Expected: all pass.

- [ ] **Step 7: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 8: Commit**

```bash
cd C:/Users/moats/ManaDork && git add hooks/useTokens.ts components/TokenCard.tsx app/tokens/page.tsx app/__tests__/tokens.test.tsx && git commit -m "feat(tokens): add /tokens reference page with search, color/type filters, and 60+ tokens"
```

---

### Task 14: Navigation restructure

**Files:**
- Modify: `components/BottomNavBar.tsx`
- Create: `app/__tests__/nav.test.tsx`

The current nav has 4 items: Home / Tracker / Cards / Stack, with More containing Glossary / Rules / New Players. The new nav has 5 items: Tracker / Cards / Dice / Glossary / More, with More containing Stack / Rules / Tokens / New Players. Home is removed from the nav (still reachable via the page header logo).

- [ ] **Step 1: Write failing tests**

Create `app/__tests__/nav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomNavBar } from '@/components/BottomNavBar'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/tracker',
}))

const renderNav = () => render(<DarkModeProvider><BottomNavBar /></DarkModeProvider>)

describe('BottomNavBar (redesigned)', () => {
  it('shows Tracker in main nav', () => {
    renderNav()
    const nav = screen.getByTestId('bottom-nav')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('Tracker')).toBeInTheDocument()
  })

  it('shows Cards in main nav', () => {
    renderNav()
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('shows Dice in main nav', () => {
    renderNav()
    expect(screen.getByText('Dice')).toBeInTheDocument()
  })

  it('shows Glossary in main nav', () => {
    renderNav()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
  })

  it('does NOT show Home in main nav', () => {
    renderNav()
    // Home should not be a nav link (it's in the header logo)
    const nav = screen.getByTestId('bottom-nav')
    expect(nav.textContent).not.toMatch(/^Home$/)
  })

  it('More drawer contains Stack Reference', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByTestId('more-button'))
    expect(screen.getByText(/stack/i)).toBeInTheDocument()
  })

  it('More drawer contains Tokens', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByTestId('more-button'))
    expect(screen.getByText(/tokens/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/nav.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: several FAIL (Dice not in nav, Home still visible, Tokens not in More).

- [ ] **Step 3: Replace the `navItems`, `moreItems`, and add 'dice' SVG in `components/BottomNavBar.tsx`**

**a) Replace `navItems`:**

```ts
const navItems = [
  { href: '/tracker', label: 'Tracker', icon: 'heart' },
  { href: '/toolkit', label: 'Cards', icon: 'search' },
  { href: '/dice', label: 'Dice', icon: 'dice' },
  { href: '/glossary', label: 'Glossary', icon: 'book' },
]
```

**b) Replace `moreItems`:**

```ts
const moreItems = [
  { href: '/stack', label: 'Stack Reference', icon: 'layers' },
  { href: '/rules', label: 'Rules', icon: 'document' },
  { href: '/tokens', label: 'Tokens', icon: 'sparkles' },
  { href: '/new-players', label: 'New Players', icon: 'compass' },
]
```

**c) Add `dice` and `sparkles` cases to the `NavIcon` switch:**

```tsx
case 'dice':
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
case 'sparkles':
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  )
```

Add these cases before `case 'more':` in the switch statement.

**d) Update `isMoreActive`** to reflect the new `moreItems`:

```ts
const isMoreActive = moreItems.some((item) => isActive(item.href))
```

This line already exists — the items list drives it, so no change needed beyond updating `moreItems`.

- [ ] **Step 4: Run all nav tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/nav.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
cd C:/Users/moats/ManaDork && npx jest --no-coverage 2>&1 | tail -30
```

Expected: all suites pass. Fix any regressions before committing.

- [ ] **Step 6: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/moats/ManaDork && git add components/BottomNavBar.tsx app/__tests__/nav.test.tsx && git commit -m "feat(nav): restructure bottom nav — Tracker/Cards/Dice/Glossary/More; Stack+Tokens in More drawer"
```
