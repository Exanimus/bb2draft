export default function ModeSelector({ onSelectMode }: { onSelectMode: (mode: 'local' | 'multiplayer') => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Blood Bowl 2 — Race Picker</h1>
          <div className="text-base opacity-80 mt-3">Choose your draft mode</div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Mode */}
          <button
            onClick={() => onSelectMode('local')}
            className="group bg-slate-800/60 rounded-2xl p-8 shadow-2xl hover:bg-slate-800/80 transition-all hover:scale-105 active:scale-100 text-left"
          >
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-3">Local Draft</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Single-player or hot-seat mode. Draft races locally with automatic save to your browser.
            </p>
            <div className="mt-6 text-xs opacity-60">
              • Solo or pass-and-play<br />
              • Persistent localStorage<br />
              • Up to 12 players
            </div>
          </button>

          {/* Multiplayer Mode */}
          <button
            onClick={() => onSelectMode('multiplayer')}
            className="group bg-gradient-to-br from-rose-900/40 to-amber-900/40 border border-amber-700/50 rounded-2xl p-8 shadow-2xl hover:from-rose-900/50 hover:to-amber-900/50 transition-all hover:scale-105 active:scale-100 text-left"
          >
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-2xl font-bold mb-3">Multiplayer Draft</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Create or join a draft room with friends. Real-time sync across devices with room codes.
            </p>
            <div className="mt-6 text-xs opacity-60">
              • Join via 4-digit code<br />
              • Real-time sync<br />
              • Reconnect anytime
            </div>
          </button>
        </main>

        <footer className="mt-8 text-xs sm:text-sm opacity-70 text-center">
          Made for Blood Bowl 2 fans — enjoy the draft 🎲
        </footer>
      </div>
    </div>
  );
}
