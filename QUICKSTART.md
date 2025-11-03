# Quick Start Guide

## Current Lint Errors (Expected)

The TypeScript lint errors you're seeing are **expected** and will resolve once dependencies are installed. They occur because React, Vite, and other packages don't exist in `node_modules` yet.

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages and resolve the lint errors.

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

Production build will be in the `dist/` folder.

## File Structure Overview

```
bb2draft/
├── src/
│   ├── App.tsx          # Main app with all fixes applied
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind imports
├── public/
│   └── vite.svg         # Favicon
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
├── vite.config.ts       # Vite config
├── .eslintrc.cjs        # ESLint config
├── .gitignore           # Git ignore rules
└── README.md            # Full documentation
```

## What Was Fixed

### Critical Fixes Applied:
✅ **File extension** - Changed from `.jsx` to `.tsx`
✅ **useCallback** - Fixed React hooks dependency warning
✅ **OPTIONS_PER_TURN** - Added constant instead of magic number
✅ **skipPlayer** - Added boundary check function
✅ **Unique emojis** - Amazon now has 🌺 (was duplicate 🏹)
✅ **Helper functions** - Moved outside component for consistency
✅ **Mobile responsive** - Grid now uses `sm:grid-cols-2` for better mobile layout

## Optional: Clean Up

You can delete the original file:
```bash
rm blood_bowl_2_race_picker_react_app.jsx
```

## Troubleshooting

If you see errors after `npm install`, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Ready to go! Run `npm install` to start.** 🚀
