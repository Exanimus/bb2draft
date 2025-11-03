import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ALL_RACES, getUserId, raceEmoji, getRaceBlurb } from "../utils/raceData";

type Mode = "menu" | "create" | "join" | "lobby" | "draft" | "results";

export default function MultiplayerApp() {
  const [mode, setMode] = useState<Mode>("menu");
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomId, setRoomId] = useState<Id<"rooms"> | null>(null);
  const [playerCount, setPlayerCount] = useState(4);
  const [excludedRaces, setExcludedRaces] = useState<string[]>([]);
  const [showRaceFilter, setShowRaceFilter] = useState(false);
  const [error, setError] = useState("");
  const [draftOptions, setDraftOptions] = useState<string[]>([]);
  const [lastTurnIndex, setLastTurnIndex] = useState<number>(-1);

  const userId = useMemo(() => getUserId(), []);

  // Mutations
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const startDraft = useMutation(api.rooms.startDraft);
  const makePick = useMutation(api.drafts.makePick);
  const updateLastSeen = useMutation(api.rooms.updateLastSeen);

  // Queries
  const room = useQuery(
    api.rooms.getRoomByCode,
    roomCode ? { code: roomCode } : "skip"
  );
  const currentTurn = useQuery(
    api.drafts.getCurrentTurn,
    roomId ? { roomId } : "skip"
  );
  const options = useQuery(
    api.drafts.getDraftOptions,
    roomId ? { roomId } : "skip"
  );

  // Update options only when turn changes (not on every query update)
  useEffect(() => {
    if (room && room.status === "in_progress") {
      const currentTurnIndex = room.currentTurnIndex;
      // Only update options when turn actually changes
      if (currentTurnIndex !== lastTurnIndex && options && options.length > 0) {
        setDraftOptions(options);
        setLastTurnIndex(currentTurnIndex);
      }
    }
  }, [room, options, lastTurnIndex]);

  // Heartbeat to update last seen
  useEffect(() => {
    if (!roomId) return;
    
    const interval = setInterval(() => {
      updateLastSeen({ roomId, userId });
    }, 10000);

    return () => clearInterval(interval);
  }, [roomId, userId, updateLastSeen]);

  // Check for reconnection
  useEffect(() => {
    const savedRoomCode = localStorage.getItem("bb2_mp_room_code");
    if (savedRoomCode && !roomCode) {
      setRoomCode(savedRoomCode);
      setMode("lobby");
    }
  }, [roomCode]);

  // Update mode based on room status
  useEffect(() => {
    if (!room) return;

    if (room.status === "waiting") {
      setMode("lobby");
    } else if (room.status === "in_progress") {
      setMode("draft");
    } else if (room.status === "completed") {
      setMode("results");
    }
  }, [room]);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setError("");
      const result = await createRoom({
        hostId: userId,
        hostName: userName.trim(),
        excludedRaces,
        playerCount,
      });

      setRoomCode(result.code);
      setRoomId(result.roomId);
      localStorage.setItem("bb2_mp_room_code", result.code);
      setMode("lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    }
  };

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (joinCode.length !== 4) {
      setError("Room code must be 4 digits");
      return;
    }

    try {
      setError("");
      const result = await joinRoom({
        code: joinCode,
        userId,
        userName: userName.trim(),
      });

      setRoomCode(joinCode);
      setRoomId(result.roomId);
      localStorage.setItem("bb2_mp_room_code", joinCode);
      setMode("lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    }
  };

  const handleStartDraft = async () => {
    if (!roomId) return;

    try {
      setError("");
      await startDraft({ roomId, hostId: userId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start draft");
    }
  };

  const handleMakePick = async (race: string) => {
    if (!roomId) return;

    try {
      setError("");
      await makePick({ roomId, userId, race });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make pick");
    }
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem("bb2_mp_room_code");
    setRoomCode("");
    setRoomId(null);
    setMode("menu");
    setError("");
  };

  const isHost = room?.hostId === userId;
  const myParticipant = room?.participants.find((p: any) => p.userId === userId);
  const isMyTurn = currentTurn?.userId === userId;


  const toggleRaceExclusion = (race: string) => {
    setExcludedRaces(prev => 
      prev.includes(race) 
        ? prev.filter(r => r !== race)
        : [...prev, race]
    );
  };

  // Main Menu
  if (mode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Multiplayer Draft</h1>
            <div className="text-sm opacity-80 mt-2">Join with friends via room code</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <label className="block text-sm mb-2 opacity-90">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-md bg-slate-700 px-4 py-3 text-base"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => setMode("create")}
                disabled={!userName.trim()}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-4 text-lg font-bold shadow-lg hover:opacity-95 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Room
              </button>

              <button
                onClick={() => setMode("join")}
                disabled={!userName.trim()}
                className="rounded-xl bg-slate-700 px-6 py-4 text-lg font-semibold hover:bg-slate-600 active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Create Room
  if (mode === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Create Draft Room</h1>
            <div className="text-sm opacity-80 mt-1">Configure your draft settings</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <label className="block text-sm mb-2 opacity-90">Number of Players</label>
              <input
                type="number"
                min={2}
                max={12}
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.max(2, Math.min(12, Number(e.target.value || 2))))}
                className="w-full rounded-md bg-slate-700 px-4 py-3 text-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm opacity-90">Available Races</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {ALL_RACES.length - excludedRaces.length} / {ALL_RACES.length}
                  </div>
                </div>
                <button
                  onClick={() => setShowRaceFilter(!showRaceFilter)}
                  className="rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
                >
                  {showRaceFilter ? "Hide" : "Filter"} {showRaceFilter ? "▲" : "▼"}
                </button>
              </div>

              {showRaceFilter && (
                <div className="bg-slate-700/40 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExcludedRaces([])}
                      className="flex-1 text-xs rounded bg-green-600 px-3 py-2 hover:bg-green-500"
                    >
                      Include All
                    </button>
                    <button
                      onClick={() => setExcludedRaces([...ALL_RACES])}
                      className="flex-1 text-xs rounded bg-red-600 px-3 py-2 hover:bg-red-500"
                    >
                      Exclude All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {ALL_RACES.map((race) => (
                      <label
                        key={race}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${
                          excludedRaces.includes(race)
                            ? "bg-red-900/30 border border-red-700"
                            : "bg-slate-600/30 border border-slate-600 hover:bg-slate-600/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!excludedRaces.includes(race)}
                          onChange={() => toggleRaceExclusion(race)}
                          className="w-4 h-4"
                        />
                        <span className="flex items-center gap-1">
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
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-lg font-semibold hover:bg-slate-600"
              >
                Back
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-3 text-lg font-bold shadow-lg hover:opacity-95"
              >
                Create Room
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Join Room
  if (mode === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Join Draft Room</h1>
            <div className="text-sm opacity-80 mt-1">Enter the 4-digit room code</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <label className="block text-sm mb-2 opacity-90">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="w-full rounded-md bg-slate-700 px-4 py-3 text-2xl text-center font-bold tracking-widest"
                maxLength={4}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-lg font-semibold hover:bg-slate-600"
              >
                Back
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 4}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-3 text-lg font-bold shadow-lg hover:opacity-95 disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Lobby
  if (mode === "lobby" && room) {
    const canStart = isHost && room.participants.length >= 2;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Draft Lobby</h1>
            <div className="text-sm opacity-80 mt-1">Waiting for players to join...</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="bg-gradient-to-r from-rose-900/40 to-amber-900/40 border border-amber-700/50 rounded-xl p-6 text-center">
              <div className="text-sm opacity-80 mb-2">Room Code</div>
              <div className="text-5xl font-bold tracking-widest">{roomCode}</div>
              <div className="text-xs opacity-70 mt-3">Share this code with your friends</div>
            </div>

            <div>
              <div className="text-sm opacity-90 mb-3">
                Players ({room.participants.length} / {room.playerCount})
              </div>
              <div className="space-y-2">
                {room.participants.map((p: any, idx: number) => (
                  <div
                    key={p._id}
                    className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-rose-600 flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        {p.userId === room.hostId && (
                          <div className="text-xs text-amber-400">Host</div>
                        )}
                      </div>
                    </div>
                    {p.userId === userId && (
                      <div className="text-xs bg-green-900/50 border border-green-700 rounded px-2 py-1">
                        You
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-80">Available Races:</span>
                <span className="font-semibold">
                  {ALL_RACES.length - room.excludedRaces.length}
                </span>
              </div>
              {room.excludedRaces.length > 0 && (
                <div className="text-xs opacity-70">
                  ({room.excludedRaces.length} races excluded)
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleLeaveRoom}
                className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-lg font-semibold hover:bg-slate-600"
              >
                Leave Room
              </button>
              {isHost && (
                <button
                  onClick={handleStartDraft}
                  disabled={!canStart}
                  className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-3 text-lg font-bold shadow-lg hover:opacity-95 disabled:opacity-50"
                >
                  Start Draft
                </button>
              )}
            </div>

            {isHost && !canStart && (
              <div className="text-center text-sm opacity-70">
                Need at least 2 players to start
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Draft in Progress
  if (mode === "draft" && room) {
    const hasPicked = !!myParticipant?.pick;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">Draft in Progress</h1>
            <div className="text-sm opacity-80 mt-1">Room: {roomCode}</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="bg-gradient-to-r from-slate-700/60 to-amber-700/20 border border-amber-600/30 rounded-xl p-5">
              <div className="text-sm opacity-80 mb-1">Current Turn</div>
              <div className="text-2xl font-bold">{currentTurn?.playerName}</div>
              {isMyTurn && !hasPicked && (
                <div className="text-sm text-green-400 mt-2">🎯 It's your turn!</div>
              )}
              {!isMyTurn && (
                <div className="text-sm opacity-70 mt-2">Waiting for their pick...</div>
              )}
              {hasPicked && (
                <div className="text-sm text-amber-400 mt-2">✓ You've picked: {myParticipant.pick}</div>
              )}
            </div>

            {isMyTurn && !hasPicked && draftOptions.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {draftOptions.map((race) => (
                    <div
                      key={race}
                      className="p-5 rounded-xl bg-slate-700/50 border border-slate-600 flex flex-col justify-between min-h-[200px]"
                    >
                      <div>
                        <div className="text-5xl">{raceEmoji(race)}</div>
                        <h3 className="mt-2 text-xl font-bold">{race}</h3>
                        <p className="mt-1 text-sm opacity-80">{getRaceBlurb(race)}</p>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => handleMakePick(race)}
                          className="w-full rounded-md bg-amber-500 py-3 text-lg font-semibold hover:bg-amber-400 active:bg-amber-500"
                        >
                          Pick {race}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div>
              <div className="text-sm opacity-90 mb-3">Draft Progress</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.participants.map((p: any) => (
                  <div
                    key={p._id}
                    className={`rounded-lg p-4 ${
                      p.pick
                        ? "bg-green-900/30 border border-green-700"
                        : p.pickOrder === room.currentTurnIndex
                        ? "bg-amber-900/30 border border-amber-600 animate-pulse"
                        : "bg-slate-700/30 border border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs opacity-70">Pick #{p.pickOrder + 1}</div>
                      </div>
                      {p.pick ? (
                        <div className="text-right">
                          <div className="text-2xl">{raceEmoji(p.pick)}</div>
                          <div className="text-xs mt-1">{p.pick}</div>
                        </div>
                      ) : (
                        <div className="text-2xl opacity-30">⏳</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Results
  if (mode === "results" && room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-amber-900 text-slate-100 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Draft Complete! 🎉</h1>
            <div className="text-sm opacity-80 mt-1">Room: {roomCode}</div>
          </header>

          <main className="bg-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.participants.map((p: any) => (
                <div
                  key={p._id}
                  className="rounded-xl p-5 bg-gradient-to-br from-slate-700/60 to-amber-700/10 border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{raceEmoji(p.pick ?? "")}</div>
                    <div>
                      <div className="text-xs opacity-80">{p.name}</div>
                      <div className="text-xl font-bold">{p.pick ?? "—"}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm opacity-80">
                    {p.pick ? getRaceBlurb(p.pick) : "No pick"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleLeaveRoom}
                className="flex-1 rounded-xl bg-slate-700 px-6 py-3 text-lg font-semibold hover:bg-slate-600"
              >
                Leave Room
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(room.participants, null, 2);
                  const blob = new Blob([dataStr], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `bb2_draft_${roomCode}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 rounded-xl bg-amber-500 px-6 py-3 text-lg font-semibold hover:bg-amber-400"
              >
                Export Results
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
