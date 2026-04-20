export interface KeywordDefinition {
  keyword: string
  type: 'ability' | 'action' | 'mechanic'
  tier: 'evergreen' | 'returning' | 'retired'
  definition: string
  reminder?: string
  example?: string
  introduced?: string
  scryfallQuery?: string
}

export const KEYWORDS: KeywordDefinition[] = [
  // ── Evergreen Abilities ─────────────────────────────────────────────
  {
    keyword: 'Flying',
    type: 'ability',
    tier: 'evergreen',
    definition: 'This creature can only be blocked by creatures with flying or reach.',
    reminder: "This creature can't be blocked except by creatures with flying and/or reach.",
    example: 'Serra Angel',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:flying',
  },
  {
    keyword: 'First Strike',
    type: 'ability',
    tier: 'evergreen',
    definition: 'This creature deals combat damage before creatures without first strike.',
    reminder: "This creature deals combat damage before creatures without first strike.",
    example: 'Benalish Marshal',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:"first strike"',
  },
  {
    keyword: 'Double Strike',
    type: 'ability',
    tier: 'evergreen',
    definition: 'This creature deals both first-strike and regular combat damage.',
    reminder: 'This creature deals both first-strike and regular combat damage.',
    example: 'Mirran Crusader',
    introduced: 'Legions',
    scryfallQuery: 'o:"double strike"',
  },
  {
    keyword: 'Deathtouch',
    type: 'ability',
    tier: 'evergreen',
    definition: 'Any amount of damage this deals to a creature is enough to destroy it.',
    reminder: 'Any amount of damage this deals to a creature is enough to destroy it.',
    example: 'Vampire Nighthawk',
    introduced: 'Future Sight',
    scryfallQuery: 'o:deathtouch',
  },
  {
    keyword: 'Defender',
    type: 'ability',
    tier: 'evergreen',
    definition: "This creature can't attack.",
    reminder: "This creature can't attack.",
    example: 'Wall of Omens',
    introduced: 'Champions of Kamigawa',
    scryfallQuery: 'o:defender',
  },
  {
    keyword: 'Haste',
    type: 'ability',
    tier: 'evergreen',
    definition: 'This creature can attack and tap the turn it comes under your control.',
    reminder: 'This creature can attack and tap as soon as it comes under your control.',
    example: 'Goblin Guide',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:haste',
  },
  {
    keyword: 'Hexproof',
    type: 'ability',
    tier: 'evergreen',
    definition: "This permanent can't be the target of spells or abilities your opponents control.",
    reminder: "This creature can't be the target of spells or abilities your opponents control.",
    example: 'Invisible Stalker',
    introduced: 'Magic 2012',
    scryfallQuery: 'o:hexproof',
  },
  {
    keyword: 'Indestructible',
    type: 'ability',
    tier: 'evergreen',
    definition: 'Effects that say "destroy" don\'t destroy this permanent. A creature with indestructible can\'t be destroyed by damage.',
    reminder: 'Damage and effects that say "destroy" don\'t destroy this permanent.',
    example: 'Darksteel Colossus',
    introduced: 'Darksteel',
    scryfallQuery: 'o:indestructible',
  },
  {
    keyword: 'Lifelink',
    type: 'ability',
    tier: 'evergreen',
    definition: 'Damage dealt by this permanent also causes you to gain that much life.',
    reminder: 'Damage dealt by this creature also causes you to gain that much life.',
    example: 'Vampire Nighthawk',
    introduced: 'Future Sight',
    scryfallQuery: 'o:lifelink',
  },
  {
    keyword: 'Menace',
    type: 'ability',
    tier: 'evergreen',
    definition: "This creature can't be blocked except by two or more creatures.",
    reminder: "This creature can't be blocked except by two or more creatures.",
    example: 'Goblin Heelcutter',
    introduced: 'Magic Origins',
    scryfallQuery: 'o:menace',
  },
  {
    keyword: 'Reach',
    type: 'ability',
    tier: 'evergreen',
    definition: 'This creature can block creatures with flying.',
    reminder: 'This creature can block creatures with flying.',
    example: 'Giant Spider',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:reach',
  },
  {
    keyword: 'Trample',
    type: 'ability',
    tier: 'evergreen',
    definition: "This creature can deal excess combat damage to the player or planeswalker it's attacking.",
    reminder: "This creature can deal excess combat damage to the player or planeswalker it's attacking.",
    example: 'Colossal Dreadmaw',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:trample',
  },
  {
    keyword: 'Vigilance',
    type: 'ability',
    tier: 'evergreen',
    definition: "Attacking doesn't cause this creature to tap.",
    reminder: "Attacking doesn't cause this creature to tap.",
    example: 'Serra Angel',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:vigilance',
  },
  {
    keyword: 'Ward',
    type: 'ability',
    tier: 'evergreen',
    definition: "Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays the ward cost.",
    reminder: "Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays [cost].",
    example: 'Wandering Emperor',
    introduced: 'Strixhaven',
    scryfallQuery: 'o:ward',
  },
  {
    keyword: 'Flash',
    type: 'ability',
    tier: 'evergreen',
    definition: 'You may cast this spell any time you could cast an instant.',
    reminder: 'You may cast this spell any time you could cast an instant.',
    example: 'Snapcaster Mage',
    introduced: 'Mirage',
    scryfallQuery: 'o:flash',
  },

  // ── Keyword Actions (Returning) ─────────────────────────────────────
  {
    keyword: 'Activate',
    type: 'action',
    tier: 'returning',
    definition: 'To put an activated ability on the stack and pay its costs.',
    example: 'Prodigal Pyromancer',
  },
  {
    keyword: 'Attach',
    type: 'action',
    tier: 'returning',
    definition: 'To move an Equipment or Aura onto a creature or other permanent.',
    example: 'Bonesplitter',
  },
  {
    keyword: 'Cast',
    type: 'action',
    tier: 'returning',
    definition: 'To take a spell from your hand (or another zone) and put it on the stack, paying its costs.',
    example: 'Lightning Bolt',
  },
  {
    keyword: 'Counter',
    type: 'action',
    tier: 'returning',
    definition: "To cancel a spell or ability so it doesn't resolve and none of its effects occur.",
    example: 'Counterspell',
  },
  {
    keyword: 'Destroy',
    type: 'action',
    tier: 'returning',
    definition: "To move a permanent from the battlefield to its owner's graveyard. Indestructible permanents can't be destroyed.",
    example: 'Murder',
  },
  {
    keyword: 'Discard',
    type: 'action',
    tier: 'returning',
    definition: "To move a card from your hand to your graveyard.",
    example: 'Mind Rot',
  },
  {
    keyword: 'Exile',
    type: 'action',
    tier: 'returning',
    definition: 'To put an object into the exile zone. Exiled cards are removed from the game (unless an effect returns them).',
    example: 'Path to Exile',
  },
  {
    keyword: 'Sacrifice',
    type: 'action',
    tier: 'returning',
    definition: "To move a permanent you control to its owner's graveyard. You can't sacrifice permanents you don't control.",
    example: 'Diabolic Intent',
  },
  {
    keyword: 'Scry',
    type: 'action',
    tier: 'returning',
    definition: 'Look at the top N cards of your library, then put any number on the bottom in any order and the rest on top in any order.',
    reminder: 'Look at the top N cards of your library, then put any number of them on the bottom and the rest on top in any order.',
    example: 'Opt',
    scryfallQuery: 'o:scry',
  },
  {
    keyword: 'Search',
    type: 'action',
    tier: 'returning',
    definition: 'To look at all cards in a stated zone and find cards that match the given criteria.',
    example: 'Rampant Growth',
  },
  {
    keyword: 'Shuffle',
    type: 'action',
    tier: 'returning',
    definition: 'To randomize the order of cards in your library.',
    example: 'Evolving Wilds',
  },
  {
    keyword: 'Tap',
    type: 'action',
    tier: 'returning',
    definition: 'To turn a permanent sideways, indicating it has been used. Tapped creatures cannot block.',
    example: 'Llanowar Elves',
  },
  {
    keyword: 'Untap',
    type: 'action',
    tier: 'returning',
    definition: 'To return a tapped permanent to its upright position, readying it for use again.',
    example: 'Seedborn Muse',
  },

  // ── Returning Mechanics ─────────────────────────────────────────────
  {
    keyword: 'Flashback',
    type: 'mechanic',
    tier: 'returning',
    definition: 'You may cast this card from your graveyard for its flashback cost, then exile it.',
    reminder: 'You may cast this card from your graveyard for its flashback cost. Then exile it.',
    example: 'Think Twice',
    introduced: 'Odyssey',
    scryfallQuery: 'o:flashback',
  },
  {
    keyword: 'Kicker',
    type: 'mechanic',
    tier: 'returning',
    definition: 'You may pay an additional cost as you cast this spell. If you do, additional effects occur.',
    reminder: 'You may pay an additional [cost] as you cast this spell.',
    example: 'Hallar, the Firefletcher',
    introduced: 'Invasion',
    scryfallQuery: 'o:kicker',
  },
  {
    keyword: 'Equip',
    type: 'mechanic',
    tier: 'returning',
    definition: 'Pay the equip cost and attach this Equipment to target creature you control. Equip only as a sorcery.',
    reminder: '[Cost]: Attach to target creature you control. Equip only as a sorcery.',
    example: 'Sword of Fire and Ice',
    introduced: 'Mirrodin',
    scryfallQuery: 'o:equip',
  },
  {
    keyword: 'Prowess',
    type: 'ability',
    tier: 'returning',
    definition: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
    reminder: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
    example: 'Monastery Swiftspear',
    introduced: 'Khans of Tarkir',
    scryfallQuery: 'o:prowess',
  },
  {
    keyword: 'Convoke',
    type: 'mechanic',
    tier: 'returning',
    definition: "Your creatures can help cast this spell. Each creature you tap while casting this spell pays for 1 or one mana of that creature's color.",
    reminder: "Your creatures can help cast this spell. Each creature you tap while casting this spell pays for 1 or one mana of that creature's color.",
    example: 'Chord of Calling',
    introduced: 'Ravnica',
    scryfallQuery: 'o:convoke',
  },
  {
    keyword: 'Cascade',
    type: 'mechanic',
    tier: 'returning',
    definition: 'When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.',
    reminder: 'When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom of your library in a random order.',
    example: 'Bloodbraid Elf',
    introduced: 'Alara Reborn',
    scryfallQuery: 'o:cascade',
  },
  {
    keyword: 'Delve',
    type: 'mechanic',
    tier: 'returning',
    definition: 'Each card you exile from your graveyard while casting this spell pays for 1.',
    reminder: 'Each card you exile from your graveyard while casting this spell pays for 1.',
    example: 'Treasure Cruise',
    introduced: 'Future Sight',
    scryfallQuery: 'o:delve',
  },
  {
    keyword: 'Cycling',
    type: 'mechanic',
    tier: 'returning',
    definition: 'Pay the cycling cost and discard this card: Draw a card.',
    reminder: '[Cost], Discard this card: Draw a card.',
    example: 'Decree of Justice',
    introduced: "Urza's Saga",
    scryfallQuery: 'o:cycling',
  },
  {
    keyword: 'Landfall',
    type: 'mechanic',
    tier: 'returning',
    definition: 'Whenever a land enters the battlefield under your control, this ability triggers.',
    example: 'Lotus Cobra',
    introduced: 'Zendikar',
    scryfallQuery: 'o:landfall',
  },
  {
    keyword: 'Annihilator',
    type: 'mechanic',
    tier: 'returning',
    definition: 'Whenever this creature attacks, defending player sacrifices N permanents.',
    reminder: 'Whenever this creature attacks, defending player sacrifices N permanents.',
    example: 'Ulamog, the Infinite Gyre',
    introduced: 'Rise of the Eldrazi',
    scryfallQuery: 'o:annihilator',
  },
  {
    keyword: 'Affinity',
    type: 'mechanic',
    tier: 'returning',
    definition: 'This spell costs 1 less to cast for each [object] you control.',
    reminder: 'This spell costs 1 less to cast for each [object] you control.',
    example: 'Thoughtcast',
    introduced: 'Mirrodin',
    scryfallQuery: 'o:affinity',
  },
  {
    keyword: 'Modular',
    type: 'mechanic',
    tier: 'returning',
    definition: 'This creature enters the battlefield with N +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.',
    reminder: 'This creature enters the battlefield with N +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.',
    example: 'Arcbound Ravager',
    introduced: 'Darksteel',
    scryfallQuery: 'o:modular',
  },
  {
    keyword: 'Protection',
    type: 'ability',
    tier: 'returning',
    definition: "This permanent can't be blocked, targeted, dealt damage, enchanted, or equipped by anything with the stated quality.",
    reminder: "This creature can't be blocked, targeted, dealt damage, or enchanted by anything [quality].",
    example: 'White Knight',
    introduced: 'Limited Edition Alpha',
    scryfallQuery: 'o:protection',
  },

  // ── Retired ─────────────────────────────────────────────────────────
  {
    keyword: 'Regenerate',
    type: 'action',
    tier: 'retired',
    definition: 'The next time this permanent would be destroyed this turn, instead tap it, remove it from combat, and remove all damage from it.',
    example: 'Troll Ascetic',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Banding',
    type: 'ability',
    tier: 'retired',
    definition: 'Any creatures with banding, and up to one without, can attack in a band. The attacking player assigns damage for blocked bands.',
    reminder: "Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.",
    example: 'Benalish Hero',
    introduced: 'Limited Edition Alpha',
  },
]

// Create a map for quick lookups
export const KEYWORDS_MAP = new Map<string, KeywordDefinition>(
  KEYWORDS.map((kw) => [kw.keyword.toLowerCase(), kw])
)

// Get all keywords of a specific type
export function getKeywordsByType(type: KeywordDefinition['type']): KeywordDefinition[] {
  return KEYWORDS.filter((kw) => kw.type === type)
}

// Search keywords by query
export function searchKeywords(query: string): KeywordDefinition[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return KEYWORDS

  return KEYWORDS.filter(
    (kw) =>
      kw.keyword.toLowerCase().includes(lowerQuery) ||
      kw.definition.toLowerCase().includes(lowerQuery) ||
      kw.reminder?.toLowerCase().includes(lowerQuery)
  )
}
