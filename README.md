# TheStack.gg

A mobile-first Magic: The Gathering toolkit, starting with a comprehensive life tracker.

## Features

### Life Tracker (MVP)
- **Solo Mode**: Track your own life on your phone
- **Multiplayer Mode**: Track 2-4 players on one device
- **Game Modes**: Standard (20 life), Commander (40 life)
- **Persistence**: Auto-saves game state to resume after refresh
- **Mobile-Optimized**: Large touch targets, readable from across the table

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

- [ ] PWA support (installable app)
- [ ] Commander damage tracking
- [ ] Poison counter tracking
- [ ] User accounts
- [ ] Deck win/loss tracking
- [ ] Card lookup (Scryfall integration)
- [ ] Rules reference
- [ ] Terminology lookup

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

MIT
