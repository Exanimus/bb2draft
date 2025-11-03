import { useState } from "react";
import App from "./App";
import ModeSelector from "./ModeSelector";
import MultiplayerApp from "./components/MultiplayerApp";

export default function AppRoot() {
  const [mode, setMode] = useState<'selector' | 'local' | 'multiplayer'>('selector');

  if (mode === 'selector') {
    return <ModeSelector onSelectMode={(m) => setMode(m)} />;
  }

  if (mode === 'local') {
    return (
      <div>
        <button
          onClick={() => setMode('selector')}
          className="fixed top-4 left-4 z-50 bg-slate-800/90 hover:bg-slate-700 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
        >
          ← Back to Menu
        </button>
        <App />
      </div>
    );
  }

  // Multiplayer mode
  return (
    <div>
      <button
        onClick={() => setMode('selector')}
        className="fixed top-4 left-4 z-50 bg-slate-800/90 hover:bg-slate-700 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg"
      >
        ← Back to Menu
      </button>
      <MultiplayerApp />
    </div>
  );
}
