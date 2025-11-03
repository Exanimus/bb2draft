# Next Steps to Enable Multiplayer

The multiplayer draft infrastructure is now in place! Follow these steps to activate it:

## 1. Initialize Convex Backend

Run this command once to set up your Convex project:

```bash
npx convex dev --once --configure=new
```

This will:
- Prompt you to create/login to a Convex account (free)
- Create a `.env.local` file with your Convex URL
- Generate TypeScript definitions in `convex/_generated/`

## 2. Update Main Entry Point

After Convex initialization, update `src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from "convex/react"
import AppRoot from './AppRoot.tsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <AppRoot />
    </ConvexProvider>
  </React.StrictMode>,
)
```

## 3. Start Both Servers

Open **two terminal windows**:

**Terminal 1 - Convex Backend:**
```bash
npm run dev:convex
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
```

## 4. Test the Feature

1. Open http://localhost:5173
2. You should see two modes: **Local Draft** and **Multiplayer Draft**
3. Click "Multiplayer Draft"
4. Create a room and note the 4-digit code
5. Open a second browser/tab and join with that code
6. Test the real-time sync!

## Current Status

✅ **Completed:**
- Convex schema (rooms, participants)
- Backend mutations (createRoom, joinRoom, startDraft, makePick)
- Backend queries (getRoomByCode, getAvailableRaces, getCurrentTurn)
- Mode selector UI
- Local mode integration
- Room code system (4-digit)
- Anonymous user ID generation

⏳ **Requires Setup:**
- Convex initialization (step 1 above)
- ConvexProvider integration (step 2 above)

🚧 **In Progress:**
- Full multiplayer UI component (will be enabled after Convex setup)

## What's Been Built

### Backend (`convex/` folder)
- **schema.ts**: Database tables for rooms and participants
- **rooms.ts**: Create rooms, join rooms, start drafts
- **drafts.ts**: Make picks, get draft options, track turns
- **helpers.ts**: Utilities for room codes and shuffling

### Frontend (`src/` folder)
- **ModeSelector.tsx**: Choose between local and multiplayer
- **AppRoot.tsx**: Routes to the correct mode
- **App.tsx**: Original local draft (unchanged)
- **utils/raceData.ts**: Shared race data and utilities

### Features Ready to Use
- 4-digit room codes
- Real-time sync via Convex
- Turn-based picking
- Reconnection support
- Host controls
- Session locking (no joins after start)

## Troubleshooting

**"Cannot find module convex/react"**
- Run `npm install` again

**TypeScript errors in convex/ files**
- These will clear after running `npx convex dev`

**Room codes not working**
- Make sure both terminals are running
- Check `.env.local` exists with VITE_CONVEX_URL

For more details, see [MULTIPLAYER_SETUP.md](MULTIPLAYER_SETUP.md)
