# TheStack.gg

A mobile-first Magic: The Gathering toolkit with life tracking, rules lookup, and stack visualization.

## Features

### Life Tracker
- **Solo Mode**: Track your own life on your phone
- **Multiplayer Mode**: Track 2-4 players on one device
- **Game Modes**: Standard (20 life), Commander (40 life), Custom
- **Commander Damage**: Track commander damage between players in multiplayer games
- **Poison Counters**: Track poison counters for each player
- **Mana Pool**: Quick mana pool tracking during complex turns
- **Persistence**: Auto-saves game state to resume after refresh
- **Mobile-Optimized**: Large touch targets, readable from across the table

### Card Lookup Toolkit
- **Card Search**: Autocomplete search powered by Scryfall API
- **Advanced Filtering**: Search by format legality, color, type, oracle text, and more
- **Card Display**: High-resolution card images with oracle text and metadata
- **Card Rulings**: View official rulings for any card
- **Format Legality**: See which formats each card is legal in
- **Performance**: Smart caching (24hr) and rate limiting
- **Mobile-Friendly**: Touch-optimized interface with fullscreen image view

### Stack Visualizer
- **Live Stack View**: LIFO ordering with newest effects on top
- **Quick Add**: Common actions like counter, destroy, draw, trigger, activate
- **Resolve Flow**: One-tap resolution with history tracking
- **Priority**: Track and pass priority between players
- **Persistence**: Saves stack state between refreshes
- **Guide**: Dismissible "How to use" panel

### Glossary
- **Keyword Library**: Search and filter MTG keywords
- **Categories**: Abilities, actions, and mechanics
- **Readable Cards**: Compact definitions with reminder text

### Rules Lookup
- **Comprehensive Rules**: Full-text search with section detail
- **Card-Linked**: Jump from card search to rulings
- **Caching**: Cached rules data for faster lookups

### Dark Mode
- **Theme Toggle**: Switch between light and dark themes
- **Persistent**: Your theme preference is saved
- **System-Wide**: Consistent theming across all pages
- **Default Dark**: Dark mode is on by default

### Navigation
- **Hamburger Menu**: Easy navigation between all pages
- **Quick Access**: Access home, life tracker, stack, card lookup, glossary, and rules from anywhere
- **Installable**: Add to home screen with offline support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **State**: React hooks + localStorage

## Operations

- Deployment and security plan: `docs/deployment-scale-security.md`

## Roadmap

### Completed
- [x] Life tracker with solo and multiplayer modes
- [x] Commander damage tracking
- [x] Poison counter tracking
- [x] Mana pool tracking
- [x] Card lookup with official rulings (Scryfall integration)
- [x] Stack visualizer with resolution history
- [x] MTG keyword glossary
- [x] Comprehensive Rules search
- [x] Dark mode
- [x] Global navigation (hamburger menu)
- [x] PWA support (installable app)

### Planned
- [ ] User accounts
- [ ] Deck win/loss tracking
- [ ] Life history timeline view
- [ ] Export game statistics

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

MIT
