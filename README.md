# TheStack.gg

A mobile-first Magic: The Gathering toolkit, starting with a comprehensive life tracker.

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

### Dark Mode
- **Theme Toggle**: Switch between light and dark themes
- **Persistent**: Your theme preference is saved
- **System-Wide**: Consistent theming across all pages

### Navigation
- **Hamburger Menu**: Easy navigation between all pages
- **Quick Access**: Access home, life tracker, card lookup, and rules from anywhere

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

## Roadmap

### Completed
- [x] Life tracker with solo and multiplayer modes
- [x] Commander damage tracking
- [x] Poison counter tracking
- [x] Mana pool tracking
- [x] Card lookup with official rulings (Scryfall integration)
- [x] Dark mode
- [x] Global navigation (hamburger menu)

### Planned
- [ ] PWA support (installable app)
- [ ] Comprehensive Rules search (pending CORS solution)
- [ ] User accounts
- [ ] Deck win/loss tracking
- [ ] Terminology lookup (MTG glossary)
- [ ] Life history timeline view
- [ ] Export game statistics

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

MIT
