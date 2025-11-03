# Multiplayer Setup Guide

This guide will help you set up the multiplayer draft feature using Convex.

## Prerequisites

- Node.js 16+
- npm or yarn

## Setup Steps

### 1. Initialize Convex

Run the following command to set up your Convex backend:

```bash
npx convex dev --once --configure=new
```

This will:
- Create a Convex account (or log in if you have one)
- Set up a new Convex project
- Generate a `.env.local` file with your credentials
- Create the `convex/_generated` folder with type definitions

### 2. Start Development Servers

You need to run **two terminals**:

**Terminal 1 - Convex Backend:**
```bash
npm run dev:convex
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
```

### 3. Update Main Entry Point

Once Convex is initialized, you'll need to wrap your app with `ConvexProvider`. 

Edit `src/main.tsx` to add:

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

// Wrap your <AppRoot /> with:
<ConvexProvider client={convex}>
  <AppRoot />
</ConvexProvider>
```

## Features

### Room Codes
- **4-digit codes** for easy sharing
- Unique per room
- Simple to remember and type

### Anonymous Users
- Auto-generated user IDs
- Stored in localStorage
- No authentication required

### Reconnection
- Room codes saved in localStorage
- Auto-reconnect on page reload
- Heartbeat updates every 10 seconds

### Host Controls
- Host creates room and configures rules
- Host starts the draft
- Draft order randomized on start

### Draft Flow
1. **Lobby**: Players join via room code
2. **Start**: Host initiates draft (locks participant list)
3. **Drafting**: Each player picks in turn
4. **Results**: View final picks

## Troubleshooting

### TypeScript Errors in `convex/` folder
These will resolve once you run `npx convex dev` and it generates the type definitions.

### "Module not found: convex/react"
Make sure you've run `npm install` after adding Convex.

### Room Code Not Working
- Ensure both terminals are running
- Check that `.env.local` exists with `VITE_CONVEX_URL`
- Verify Convex dashboard shows your deployment

## Architecture

```
convex/
├── schema.ts          # Database schema (rooms, participants)
├── rooms.ts           # Room operations (create, join, start)
├── drafts.ts          # Draft operations (pick, options)
└── helpers.ts         # Utilities (code generation, shuffle)

src/
├── AppRoot.tsx        # Mode selector & router
├── ModeSelector.tsx   # Choose local or multiplayer
├── App.tsx            # Local draft (original)
└── MultiplayerApp.tsx # Multiplayer draft (new)
```

## Convex Free Tier

Perfect for this use case:
- 1M function calls/month
- 1 GB storage
- 1 GB bandwidth

Estimated usage: <100K calls/month for casual use.

## Next Steps

Once setup is complete, you can:
- Create a room and share the code
- Join from multiple devices/browsers
- Test reconnection by refreshing the page
- View real-time updates as players join and pick
