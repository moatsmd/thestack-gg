export interface KeywordDefinition {
  keyword: string
  type: 'ability' | 'action' | 'mechanic'
  definition: string
  reminder?: string
  example?: string
  introduced?: string
}

export const KEYWORDS: KeywordDefinition[] = [
  // Evergreen Abilities
  {
    keyword: 'Flying',
    type: 'ability',
    definition: 'This creature can only be blocked by creatures with flying or reach.',
    reminder: 'This creature can\'t be blocked except by creatures with flying and/or reach.',
    example: 'Serra Angel',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'First Strike',
    type: 'ability',
    definition: 'This creature deals combat damage before creatures without first strike.',
    reminder: 'This creature deals combat damage before creatures without first strike.',
    example: 'Benalish Marshal',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Double Strike',
    type: 'ability',
    definition: 'This creature deals both first-strike and regular combat damage.',
    reminder: 'This creature deals both first-strike and regular combat damage.',
    example: 'Mirran Crusader',
    introduced: 'Legions',
  },
  {
    keyword: 'Deathtouch',
    type: 'ability',
    definition: 'Any amount of damage this deals to a creature is enough to destroy it.',
    reminder: 'Any amount of damage this deals to a creature is enough to destroy it.',
    example: 'Vampire Nighthawk',
    introduced: 'Future Sight',
  },
  {
    keyword: 'Defender',
    type: 'ability',
    definition: 'This creature can\'t attack.',
    reminder: 'This creature can\'t attack.',
    example: 'Wall of Omens',
    introduced: 'Future Sight',
  },
  {
    keyword: 'Haste',
    type: 'ability',
    definition: 'This creature can attack and tap the turn it comes under your control.',
    reminder: 'This creature can attack and tap as soon as it comes under your control.',
    example: 'Lightning Bolt',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Hexproof',
    type: 'ability',
    definition: 'This permanent can\'t be the target of spells or abilities your opponents control.',
    reminder: 'This creature can\'t be the target of spells or abilities your opponents control.',
    example: 'Invisible Stalker',
    introduced: 'Portal Three Kingdoms',
  },
  {
    keyword: 'Indestructible',
    type: 'ability',
    definition: 'Effects that say "destroy" don\'t destroy this permanent. A creature with indestructible can\'t be destroyed by damage.',
    reminder: 'Damage and effects that say "destroy" don\'t destroy this permanent.',
    example: 'Darksteel Colossus',
    introduced: 'Darksteel',
  },
  {
    keyword: 'Lifelink',
    type: 'ability',
    definition: 'Damage dealt by this permanent also causes you to gain that much life.',
    reminder: 'Damage dealt by this creature also causes you to gain that much life.',
    example: 'Vampire Nighthawk',
    introduced: 'Future Sight',
  },
  {
    keyword: 'Menace',
    type: 'ability',
    definition: 'This creature can\'t be blocked except by two or more creatures.',
    reminder: 'This creature can\'t be blocked except by two or more creatures.',
    example: 'Goblin Heelcutter',
    introduced: 'Magic Origins',
  },
  {
    keyword: 'Reach',
    type: 'ability',
    definition: 'This creature can block creatures with flying.',
    reminder: 'This creature can block creatures with flying.',
    example: 'Giant Spider',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Trample',
    type: 'ability',
    definition: 'This creature can deal excess combat damage to the player or planeswalker it\'s attacking.',
    reminder: 'This creature can deal excess combat damage to the player or planeswalker it\'s attacking.',
    example: 'Colossal Dreadmaw',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Vigilance',
    type: 'ability',
    definition: 'Attacking doesn\'t cause this creature to tap.',
    reminder: 'Attacking doesn\'t cause this creature to tap.',
    example: 'Serra Angel',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Ward',
    type: 'ability',
    definition: 'Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays the ward cost.',
    reminder: 'Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays [cost].',
    example: 'Lier, Disciple of the Drowned',
    introduced: 'Strixhaven',
  },

  // Keyword Actions
  {
    keyword: 'Activate',
    type: 'action',
    definition: 'To activate an ability is to put it onto the stack and pay its costs.',
    example: 'Prodigal Pyromancer',
  },
  {
    keyword: 'Attach',
    type: 'action',
    definition: 'To move an Equipment or Aura onto a creature or other permanent.',
    example: 'Bonesplitter',
  },
  {
    keyword: 'Cast',
    type: 'action',
    definition: 'To cast a spell is to take it from where it is and put it on the stack.',
    example: 'Lightning Bolt',
  },
  {
    keyword: 'Counter',
    type: 'action',
    definition: 'To cancel a spell or ability so it doesn\'t resolve and none of its effects occur.',
    example: 'Counterspell',
  },
  {
    keyword: 'Destroy',
    type: 'action',
    definition: 'To move a permanent from the battlefield to its owner\'s graveyard.',
    example: 'Murder',
  },
  {
    keyword: 'Discard',
    type: 'action',
    definition: 'To move a card from your hand to your graveyard.',
    example: 'Mind Rot',
  },
  {
    keyword: 'Exile',
    type: 'action',
    definition: 'To put an object into the exile zone from wherever it currently is.',
    example: 'Path to Exile',
  },
  {
    keyword: 'Sacrifice',
    type: 'action',
    definition: 'To move a permanent you control to its owner\'s graveyard.',
    example: 'Diabolic Intent',
  },
  {
    keyword: 'Scry',
    type: 'action',
    definition: 'To look at a number of cards from the top of your library, then put any number on the bottom and the rest on top in any order.',
    reminder: 'Look at the top N cards of your library, then put any number of them on the bottom of your library and the rest on top in any order.',
    example: 'Opt',
  },
  {
    keyword: 'Search',
    type: 'action',
    definition: 'To look at all cards in a stated zone and find cards that match given criteria.',
    example: 'Rampant Growth',
  },
  {
    keyword: 'Shuffle',
    type: 'action',
    definition: 'To randomize your library.',
    example: 'Evolving Wilds',
  },
  {
    keyword: 'Tap',
    type: 'action',
    definition: 'To turn a permanent sideways. Often abbreviated with the tap symbol.',
    example: 'Llanowar Elves',
  },
  {
    keyword: 'Untap',
    type: 'action',
    definition: 'To return a tapped permanent to its upright position.',
    example: 'Seedborn Muse',
  },

  // Common Mechanics
  {
    keyword: 'Flashback',
    type: 'mechanic',
    definition: 'You may cast this card from your graveyard for its flashback cost, then exile it.',
    reminder: 'You may cast this card from your graveyard for its flashback cost. Then exile it.',
    example: 'Think Twice',
    introduced: 'Odyssey',
  },
  {
    keyword: 'Kicker',
    type: 'mechanic',
    definition: 'You may pay an additional cost as you cast this spell. If you do, additional effects occur.',
    reminder: 'You may pay an additional [cost] as you cast this spell.',
    example: 'Wolfir Silverheart',
    introduced: 'Invasion',
  },
  {
    keyword: 'Flash',
    type: 'ability',
    definition: 'You may cast this spell any time you could cast an instant.',
    reminder: 'You may cast this spell any time you could cast an instant.',
    example: 'Snapcaster Mage',
    introduced: 'Mirage',
  },
  {
    keyword: 'Equip',
    type: 'mechanic',
    definition: 'Pay the equip cost and attach this Equipment to target creature you control. Equip only as a sorcery.',
    reminder: '[Cost]: Attach to target creature you control. Equip only as a sorcery.',
    example: 'Sword of Fire and Ice',
    introduced: 'Mirrodin',
  },
  {
    keyword: 'Prowess',
    type: 'ability',
    definition: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
    reminder: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
    example: 'Monastery Swiftspear',
    introduced: 'Khans of Tarkir',
  },
  {
    keyword: 'Convoke',
    type: 'mechanic',
    definition: 'Your creatures can help cast this spell. Each creature you tap while casting this spell pays for 1 or one mana of that creature\'s color.',
    reminder: 'Your creatures can help cast this spell. Each creature you tap while casting this spell pays for 1 or one mana of that creature\'s color.',
    example: 'Chord of Calling',
    introduced: 'Ravnica',
  },
  {
    keyword: 'Cascade',
    type: 'mechanic',
    definition: 'When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost.',
    reminder: 'When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom of your library in a random order.',
    example: 'Bloodbraid Elf',
    introduced: 'Alara Reborn',
  },
  {
    keyword: 'Delve',
    type: 'mechanic',
    definition: 'Each card you exile from your graveyard while casting this spell pays for 1.',
    reminder: 'Each card you exile from your graveyard while casting this spell pays for 1.',
    example: 'Treasure Cruise',
    introduced: 'Future Sight',
  },
  {
    keyword: 'Cycling',
    type: 'mechanic',
    definition: 'Pay the cycling cost and discard this card: Draw a card.',
    reminder: '[Cost], Discard this card: Draw a card.',
    example: 'Decree of Justice',
    introduced: 'Urza\'s Saga',
  },
  {
    keyword: 'Landfall',
    type: 'mechanic',
    definition: 'Whenever a land enters the battlefield under your control, this ability triggers.',
    example: 'Lotus Cobra',
    introduced: 'Zendikar',
  },
  {
    keyword: 'Annihilator',
    type: 'mechanic',
    definition: 'Whenever this creature attacks, defending player sacrifices N permanents.',
    reminder: 'Whenever this creature attacks, defending player sacrifices N permanents.',
    example: 'Ulamog, the Infinite Gyre',
    introduced: 'Rise of the Eldrazi',
  },
  {
    keyword: 'Affinity',
    type: 'mechanic',
    definition: 'This spell costs 1 less to cast for each [object] you control.',
    reminder: 'This spell costs 1 less to cast for each [object] you control.',
    example: 'Thoughtcast',
    introduced: 'Mirrodin',
  },
  {
    keyword: 'Modular',
    type: 'mechanic',
    definition: 'This creature enters the battlefield with N +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.',
    reminder: 'This creature enters the battlefield with N +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.',
    example: 'Arcbound Ravager',
    introduced: 'Darksteel',
  },
  {
    keyword: 'Protection',
    type: 'ability',
    definition: 'This permanent can\'t be blocked, targeted, dealt damage, enchanted, or equipped by anything with the stated quality.',
    reminder: 'This creature can\'t be blocked, targeted, dealt damage, or enchanted by anything [quality].',
    example: 'White Knight',
    introduced: 'Limited Edition Alpha',
  },
  {
    keyword: 'Regenerate',
    type: 'action',
    definition: 'The next time this permanent would be destroyed, instead tap it, remove it from combat, and remove all damage from it.',
    example: 'Troll Ascetic',
  },
  {
    keyword: 'Banding',
    type: 'ability',
    definition: 'Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group.',
    reminder: 'Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature\'s combat damage, not its controller, among any of the creatures it\'s being blocked by or is blocking.',
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
