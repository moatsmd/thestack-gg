// Scryfall API type definitions
// Based on https://scryfall.com/docs/api

export type Legality = 'legal' | 'not_legal' | 'restricted' | 'banned'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic'

export interface ScryfallCardFace {
  object: 'card_face'
  name: string
  mana_cost?: string
  type_line?: string
  oracle_text?: string
  colors?: string[]
  power?: string
  toughness?: string
  loyalty?: string
  flavor_text?: string
  artist?: string
  image_uris?: {
    small: string
    normal: string
    large: string
    png: string
    art_crop: string
    border_crop: string
  }
}

export interface ScryfallCard {
  object: 'card'
  id: string
  oracle_id?: string
  multiverse_ids?: number[]
  mtgo_id?: number
  arena_id?: number
  tcgplayer_id?: number
  cardmarket_id?: number
  name: string
  lang: string
  released_at: string
  uri: string
  scryfall_uri: string
  layout: string
  highres_image: boolean
  image_status: string

  // Card faces (for double-faced, split, flip, etc.)
  card_faces?: ScryfallCardFace[]

  // Main card properties
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  colors?: string[]
  color_identity: string[]
  color_indicator?: string[]

  // Stats
  power?: string
  toughness?: string
  loyalty?: string
  life_modifier?: string
  hand_modifier?: string

  // Keywords
  keywords: string[]

  // Legalities
  legalities: Record<string, Legality>

  // Game data
  games: string[]
  reserved: boolean
  foil: boolean
  nonfoil: boolean
  finishes: string[]
  oversized: boolean
  promo: boolean
  reprint: boolean
  variation: boolean

  // Set info
  set_id: string
  set: string
  set_name: string
  set_type: string
  set_uri: string
  set_search_uri: string
  scryfall_set_uri: string
  rulings_uri: string
  prints_search_uri: string

  // Collector info
  collector_number: string
  digital: boolean
  rarity: Rarity
  flavor_text?: string
  card_back_id?: string
  artist?: string
  artist_ids?: string[]
  illustration_id?: string
  border_color: string
  frame: string
  security_stamp?: string
  full_art: boolean
  textless: boolean
  booster: boolean
  story_spotlight: boolean
  promo_types?: string[]

  // Prices
  prices: {
    usd?: string | null
    usd_foil?: string | null
    usd_etched?: string | null
    eur?: string | null
    eur_foil?: string | null
    tix?: string | null
  }

  // Related URIs
  related_uris: {
    gatherer?: string
    tcgplayer_infinite_articles?: string
    tcgplayer_infinite_decks?: string
    edhrec?: string
  }

  // Purchase URIs
  purchase_uris?: {
    tcgplayer?: string
    cardmarket?: string
    cardhoarder?: string
  }

  // Images
  image_uris?: {
    small: string
    normal: string
    large: string
    png: string
    art_crop: string
    border_crop: string
  }
}

export interface ScryfallAutocompleteResponse {
  object: 'catalog'
  total_values: number
  data: string[]
}

export interface ScryfallSearchResponse {
  object: 'list'
  total_cards: number
  has_more: boolean
  next_page?: string
  data: ScryfallCard[]
  warnings?: string[]
}

export interface ScryfallRuling {
  object: 'ruling'
  oracle_id: string
  source: string
  published_at: string
  comment: string
}

export interface ScryfallRulingsResponse {
  object: 'list'
  has_more: boolean
  data: ScryfallRuling[]
}

export interface ScryfallError {
  object: 'error'
  code: string
  status: number
  details: string
  type?: string
  warnings?: string[]
}

// Type guard for error responses
export function isScryfallError(response: unknown): response is ScryfallError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'object' in response &&
    response.object === 'error'
  )
}

// Cache entry structure
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}
