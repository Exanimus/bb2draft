import { useCallback, useEffect, useMemo, useState } from "react";

type Player = { id: number; name: string; pick?: string };

const ALL_RACES = [
  "Humans",
  "Orcs",
  "Dwarfs",
  "Skaven",
  "High Elves",
  "Dark Elves",
  "Bretonnians",
  "Chaos",
  "Wood Elves",
  "Lizardmen",
  "Norse",
  "Undead",
  "Necromantic",
  "Nurgle",
  "Chaos Dwarfs",
  "Khemri",
  "Halflings",
  "Ogres",
  "Goblins",
  "Vampires",
  "Amazon",
  "Elven Union",
  "Underworld Denizens",
  "Kislev Circus",
];

const STORAGE_KEY = "bb2_picker_state_v1";
const OPTIONS_PER_TURN = 3;

// Helper functions outside component for consistency and reusability
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function raceEmoji(r: string): string {
  const map: Record<string, string> = {
    Humans: "🛡️",
    Orcs: "🪓",
    Dwarfs: "⛏️",
    Skaven: "🐀",
    "High Elves": "🏹",
    "Dark Elves": "🗡️",
    Bretonnians: "🏇",
    Chaos: "🔥",
    "Wood Elves": "🌲",
    Lizardmen: "🦎",
    Norse: "⚔️",
    Undead: "☠️",
    Necromantic: "🪦",
    Nurgle: "🦠",
    "Chaos Dwarfs": "🔩",
    Khemri: "🏺",
    Halflings: "🥧",
    Ogres: "👊",
    Goblins: "👺",
    Vampires: "🦇",
    Amazon: "🌺",
    "Elven Union": "🎯",
    "Underworld Denizens": "🕳️",
    "Kislev Circus": "🎪",
  };
  return map[r] ?? "❓";
}

function getRaceBlurb(r: string): string {
  const map: Record<string, string> = {
    Humans: "Balanced. Reliable linemen and versatile skills.",
    Orcs: "Tough and brutal — good at bashing and crowd control.",
    Dwarfs: "Resilient and slow — strong defense and mighty blocks.",
    Skaven: "Fast and sneaky, but fragile. Lots of scoring plays.",
    "High Elves": "Agile and skilled — excellent passing and movement.",
    "Dark Elves": "Agile with a dark twist — good at fouling and mobility.",
    Bretonnians: "Knightly teams — strong big guys and solid tackles.",
    Chaos: "Mutations and powerful brutes. Unpredictable but strong.",
    "Wood Elves": "Very fast and elusive — hard to pin down.",
    Lizardmen: "Durable and versatile with good big guys.",
    Norse: "Balanced warrior team, good mix of strength and agility.",
    Undead: "Slow but undead resilience, can reanimate players.",
    Necromantic: "Fragile but interesting mix of undead and flesh.",
    Nurgle: "Rotten resilience — nasty and hard to remove.",
    "Chaos Dwarfs": "Stout and brutal with heavy hitters.",
    Khemri: "Ancient mummies and skeletons, slow but tough.",
    Halflings: "Small, tricky and hilarious — high risk, high reward.",
    Ogres: "Huge strength, few players — smash through lines.",
    Goblins: "Chaotic and funny — unpredictable tricks.",
    Vampires: "Strong lone stars with blood-sucking flavour.",
    Amazon: "Athletic and balanced with female roster flavour.",
    "Elven Union": "Classic elven style — teamwork and skill.",
    "Underworld Denizens": "Strange mix of monsters and thieves.",
    "Kislev Circus": "Showy and unique, good at surprises.",
  };
  return map[r] ?? "A mysterious and unique race.";
}

export default function App(): JSX.Element {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [names, setNames] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [available, setAvailable] = useState<string[]>(ALL_RACES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roundOptions, setRoundOptions] = useState<string[]>([]);
  const [started, setStarted] = useState<boolean>(false);
  const [excludedRaces, setExcludedRaces] = useState<string[]>([]);
  const [showRaceFilter, setShowRaceFilter] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Basic validation
        if (parsed && parsed.players) {
          setPlayers(parsed.players);
          setAvailable(parsed.available ?? ALL_RACES);
          setCurrentIndex(parsed.currentIndex ?? 0);
          setStarted(parsed.started ?? false);
          setExcludedRaces(parsed.excludedRaces ?? []);
        }
      }
    } catch (e) {
      console.warn("Failed to load saved state", e);
    }
  }, []);

  // Persist state
  useEffect(() => {
    const payload = { players, available, currentIndex, started, excludedRaces };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save state", e);
    }
  }, [players, available, currentIndex, started, excludedRaces]);

  // Generate options with useCallback to fix dependency warning
  const generateOptions = useCallback(() => {
    const remaining = available;
    if (remaining.length === 0) {
      setRoundOptions([]);
      return;
    }
    const count = Math.min(OPTIONS_PER_TURN, remaining.length);
    const pool = shuffle(remaining).slice(0, count);
    setRoundOptions(pool);
  }, [available]);

  useEffect(() => {
    if (started) generateOptions();
  }, [started, currentIndex, generateOptions]);

  function startGame() {
    const trimmedNames = names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`);
    const initialPlayers: Player[] = trimmedNames.map((n, i) => ({ id: i, name: n }));
    // Filter out excluded races
    const availableRaces = ALL_RACES.filter(race => !excludedRaces.includes(race));
    setPlayers(initialPlayers);
    setAvailable(availableRaces);
    setCurrentIndex(0);
    setStarted(true);
  }

  function toggleRaceExclusion(race: string) {
    setExcludedRaces(prev => 
      prev.includes(race) 
        ? prev.filter(r => r !== race)
        : [...prev, race]
    );
  }

  function clearAllExclusions() {
    setExcludedRaces([]);
  }

  function excludeAllRaces() {
    setExcludedRaces([...ALL_RACES]);
  }

  function pickRace(race: string) {
    // assign to current player
    setPlayers((prev) => prev.map((p, idx) => (idx === currentIndex ? { ...p, pick: race } : p)));
    // remove from available
    setAvailable((prev) => prev.filter((r) => r !== race));
    // advance
    const next = currentIndex + 1;
    // If all players done or no more races, finish
    if (next >= players.length) {
      setCurrentIndex(next);
      setRoundOptions([]);
      setStarted(false);
      return;
    }
    setCurrentIndex(next);
  }

  function skipPlayer() {
    if (!confirm("Skip this player's pick? They will get no race.")) return;
    const next = currentIndex + 1;
    if (next >= players.length) {
      setCurrentIndex(next);
      setRoundOptions([]);
      setStarted(false);
      return;
    }
    setCurrentIndex(next);
  }

  function resetAll() {
    if (!confirm("Reset everything? This will clear saved progress.")) return;
    setPlayerCount(4);
    setNames([]);
    setPlayers([]);
    setAvailable(ALL_RACES);
    setCurrentIndex(0);
    setRoundOptions([]);
    setStarted(false);
    setExcludedRaces([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const isFinished = useMemo(() => players.length > 0 && players.every((p) => p.pick), [players]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Blood Bowl 2 — Race Picker</h1>
          <div className="text-xs sm:text-sm opacity-80 mt-1">Themed · Persistent · Up to 12 players</div>
        </header>

        <main className="bg-slate-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
          {!started && players.length === 0 && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="whitespace-nowrap text-sm sm:text-base">Number of players</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Math.max(1, Math.min(12, Number(e.target.value || 0))))}
                    className="w-16 sm:w-20 rounded-md bg-slate-700 px-2 sm:px-3 py-2 text-center touch-manipulation"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                  <button
                    onClick={() => {
                      const arr = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);
                      setNames(arr);
                    }}
                    className="flex-1 sm:flex-none rounded bg-amber-600 px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold hover:bg-amber-500 active:bg-amber-600 touch-manipulation"
                  >
                    Autofill
                  </button>
                  <button onClick={resetAll} className="flex-1 sm:flex-none rounded bg-slate-700 px-3 sm:px-4 py-2 text-sm sm:text-base hover:bg-slate-600 active:bg-slate-700 touch-manipulation">
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <input
                    key={i}
                    value={names[i] ?? ""}
                    onChange={(e) => {
                      const copy = [...names];
                      copy[i] = e.target.value;
                      setNames(copy);
                    }}
                    placeholder={`Player ${i + 1} name`}
                    className="rounded-md bg-slate-700 px-3 py-2.5 text-base touch-manipulation"
                  />
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={startGame}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-3 text-base sm:text-lg font-bold shadow-lg hover:opacity-95 active:opacity-90 touch-manipulation"
                >
                  Start Draft
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-80">
                    <p>Available races: <strong>{ALL_RACES.length - excludedRaces.length}</strong> / {ALL_RACES.length}</p>
                    {excludedRaces.length > 0 && (
                      <p className="text-amber-400 mt-1">({excludedRaces.length} excluded)</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowRaceFilter(!showRaceFilter)}
                    className="rounded bg-slate-700 px-3 sm:px-4 py-2 text-sm sm:text-base hover:bg-slate-600 active:bg-slate-700 touch-manipulation whitespace-nowrap"
                  >
                    {showRaceFilter ? "Hide" : "Filter Races"} {showRaceFilter ? "▲" : "▼"}
                  </button>
                </div>

                {showRaceFilter && (
                  <div className="bg-slate-700/40 rounded-lg p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">Select races to exclude:</h3>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={clearAllExclusions}
                          className="flex-1 sm:flex-none text-xs sm:text-sm rounded bg-green-600 px-2.5 py-1.5 hover:bg-green-500 active:bg-green-600 touch-manipulation"
                        >
                          Include All
                        </button>
                        <button
                          onClick={excludeAllRaces}
                          className="flex-1 sm:flex-none text-xs sm:text-sm rounded bg-red-600 px-2.5 py-1.5 hover:bg-red-500 active:bg-red-600 touch-manipulation"
                        >
                          Exclude All
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                      {ALL_RACES.map((race) => (
                        <label
                          key={race}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            excludedRaces.includes(race)
                              ? "bg-red-900/30 border border-red-700"
                              : "bg-slate-600/30 border border-slate-600 hover:bg-slate-600/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!excludedRaces.includes(race)}
                            onChange={() => toggleRaceExclusion(race)}
                            className="w-5 h-5 sm:w-4 sm:h-4 touch-manipulation"
                          />
                          <span className="text-sm flex items-center gap-1">
                            <span>{raceEmoji(race)}</span>
                            <span className={excludedRaces.includes(race) ? "line-through opacity-50" : ""}>
                              {race}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs opacity-70 mt-2">Note: progress is saved automatically to localStorage. You can continue later on the same browser.</p>
              </div>
            </section>
          )}

          {/* Active draft view */}
          {started && players.length > 0 && currentIndex < players.length && (
            <section className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm opacity-80">Turn</div>
                  <h2 className="text-xl sm:text-2xl font-bold">{players[currentIndex].name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm opacity-80">Available races</div>
                  <div className="text-lg sm:text-xl font-semibold">{available.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roundOptions.length === 0 && (
                  <div className="col-span-full p-6 bg-slate-700/40 rounded-lg text-center">No options available — draft finished.</div>
                )}
                {roundOptions.map((r) => (
                  <div key={r} className="p-4 sm:p-5 rounded-xl bg-slate-700/50 border border-slate-600 flex flex-col justify-between min-h-[200px]">
                    <div>
                      <div className="text-4xl sm:text-5xl">{raceEmoji(r)}</div>
                      <h3 className="mt-2 text-lg sm:text-xl font-bold">{r}</h3>
                      <p className="mt-1 text-sm sm:text-base opacity-80">{getRaceBlurb(r)}</p>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => pickRace(r)}
                        className="w-full rounded-md bg-amber-500 py-3 text-base sm:text-lg font-semibold hover:bg-amber-400 active:bg-amber-500 touch-manipulation"
                      >
                        Pick {r}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={generateOptions}
                  className="rounded bg-slate-700 px-4 py-2.5 text-sm sm:text-base hover:bg-slate-600 active:bg-slate-700 touch-manipulation"
                >
                  Reroll Options
                </button>

                <button
                  onClick={skipPlayer}
                  className="rounded bg-red-700 px-4 py-2.5 text-sm sm:text-base hover:bg-red-600 active:bg-red-700 touch-manipulation"
                >
                  Skip Player
                </button>

                <div className="sm:ml-auto text-center sm:text-right text-sm opacity-80 py-2 sm:py-0">Player {currentIndex + 1} / {players.length}</div>
              </div>
            </section>
          )}

          {/* Final screen */}
          {!started && players.length > 0 && (isFinished ? (
            <section className="pt-4 sm:pt-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Final Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {players.map((p) => (
                  <div key={p.id} className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-slate-700/60 to-amber-700/10 border border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl sm:text-5xl">{raceEmoji(p.pick ?? "")}</div>
                      <div>
                        <div className="text-xs sm:text-sm opacity-80">{p.name}</div>
                        <div className="text-lg sm:text-xl font-bold">{p.pick ?? "—"}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs sm:text-sm opacity-80">{p.pick ? getRaceBlurb(p.pick) : "No pick"}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={resetAll} className="rounded bg-slate-700 px-4 py-2.5 text-sm sm:text-base hover:bg-slate-600 active:bg-slate-700 touch-manipulation">Start Over</button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(players, null, 2);
                    const blob = new Blob([dataStr], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "bb2_picks.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded bg-amber-500 px-4 py-2.5 text-sm sm:text-base font-semibold hover:bg-amber-400 active:bg-amber-500 touch-manipulation"
                >
                  Export Results
                </button>
              </div>
            </section>
          ) : (
            <section className="pt-4 sm:pt-6">
              <h2 className="text-xl sm:text-2xl font-bold">Draft paused / finished early</h2>
              <div className="mt-4">
                <div className="text-sm opacity-80">Current picks:</div>
                <ul className="mt-2 space-y-2">
                  {players.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <div className="text-2xl sm:text-lg">{raceEmoji(p.pick ?? "")}</div>
                      <div>
                        <div className="text-xs sm:text-sm opacity-80">{p.name}</div>
                        <div className="text-base sm:text-lg font-semibold">{p.pick ?? "—"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={() => setStarted(true)} className="rounded bg-amber-500 px-4 py-2.5 text-sm sm:text-base font-semibold hover:bg-amber-400 active:bg-amber-500 touch-manipulation">Resume Draft</button>
                <button onClick={resetAll} className="rounded bg-slate-700 px-4 py-2.5 text-sm sm:text-base hover:bg-slate-600 active:bg-slate-700 touch-manipulation">Reset</button>
              </div>
            </section>
          ))}
        </main>

        <footer className="mt-4 sm:mt-6 text-xs sm:text-sm opacity-70 text-center pb-4">Made for you — enjoy the draft 🎲</footer>
      </div>
    </div>
  );
}
