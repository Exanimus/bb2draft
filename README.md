# Blood Bowl 2 - Race Picker

A themed draft tool for selecting Blood Bowl 2 races with automatic persistence and beautiful UI.

![Blood Bowl 2 Race Picker](https://img.shields.io/badge/Blood%20Bowl%202-Race%20Picker-amber)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## Features

- ✨ **Themed Dark Fantasy UI** - Beautiful gradient backgrounds and smooth interactions
- 🎲 **3-Option Draft System** - Pick from 3 random races each turn
- 💾 **Auto-Save Progress** - Uses localStorage to persist draft state
- 👥 **Up to 12 Players** - Support for solo or group drafting
- 📤 **Export Results** - Download picks as JSON
- 🔄 **Reroll Options** - Don't like the choices? Reroll them
- ⏸️ **Pause & Resume** - Continue your draft later
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Setup Players**: Enter the number of players (1-12) and their names
2. **Start Draft**: Click "Start Draft" to begin
3. **Pick Races**: Each player selects from 3 random race options
4. **Reroll** (optional): Don't like the options? Click "Reroll Options"
5. **View Results**: See final picks with race descriptions and emojis
6. **Export**: Download results as JSON for record-keeping

## Available Races

24 Blood Bowl 2 races included:
- Humans, Orcs, Dwarfs, Skaven
- High Elves, Dark Elves, Wood Elves, Elven Union
- Bretonnians, Chaos, Lizardmen, Norse
- Undead, Necromantic, Nurgle, Vampires
- Chaos Dwarfs, Khemri, Halflings, Ogres
- Goblins, Amazon, Underworld Denizens, Kislev Circus

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: React Hooks
- **Storage**: localStorage API

## Project Structure

```
bb2draft/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles & Tailwind imports
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite build configuration
└── README.md           # This file
```

## Key Improvements from Original

- ✅ Fixed TypeScript file extension (.tsx)
- ✅ Resolved React hooks dependency warnings
- ✅ Added `useCallback` for proper memoization
- ✅ Improved skip player boundary checks
- ✅ Added `OPTIONS_PER_TURN` constant
- ✅ Fixed duplicate emoji (Amazon now has 🌺)
- ✅ Moved helper functions outside component
- ✅ Better mobile responsive grid layout
- ✅ Production-ready build configuration

## Development

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## License

MIT

## Acknowledgments

Built for Blood Bowl 2 fans who want a fair and fun race selection process.

---

**Enjoy the draft! 🎲**
