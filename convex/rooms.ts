import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateRoomCode, isCodeUnique, shuffle } from "./helpers";

/**
 * Create a new draft room
 */
export const createRoom = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),
    excludedRaces: v.array(v.string()),
    playerCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate unique 4-digit code
    let code = generateRoomCode();
    let attempts = 0;
    while (!(await isCodeUnique(ctx, code)) && attempts < 10) {
      code = generateRoomCode();
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error("Failed to generate unique room code");
    }

    const now = Date.now();

    // Create the room
    const roomId = await ctx.db.insert("rooms", {
      code,
      hostId: args.hostId,
      status: "waiting",
      excludedRaces: args.excludedRaces,
      playerCount: args.playerCount,
      currentTurnIndex: 0,
      createdAt: now,
    });

    // Add host as first participant
    await ctx.db.insert("participants", {
      roomId,
      userId: args.hostId,
      name: args.hostName,
      pickOrder: 0,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { roomId, code };
  },
});

/**
 * Get room by code
 */
export const getRoomByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!room) {
      return null;
    }

    // Get all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    // Sort by pick order
    participants.sort((a, b) => a.pickOrder - b.pickOrder);

    return {
      ...room,
      participants,
    };
  },
});

/**
 * Start the draft (host only)
 */
export const startDraft = mutation({
  args: {
    roomId: v.id("rooms"),
    hostId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.hostId !== args.hostId) {
      throw new Error("Only the host can start the draft");
    }

    if (room.status !== "waiting") {
      throw new Error("Draft has already started");
    }

    // Get all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (participants.length < 2) {
      throw new Error("Need at least 2 players to start");
    }

    // Randomize pick order (except host stays first)
    const shuffledParticipants = [participants[0], ...shuffle(participants.slice(1))];
    
    // Update pick orders
    for (let i = 0; i < shuffledParticipants.length; i++) {
      await ctx.db.patch(shuffledParticipants[i]._id, {
        pickOrder: i,
      });
    }

    // Update room status
    await ctx.db.patch(args.roomId, {
      status: "in_progress",
      startedAt: Date.now(),
      currentTurnIndex: 0,
    });

    return { success: true };
  },
});

/**
 * Join an existing room
 */
export const joinRoom = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the room
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "waiting") {
      throw new Error("Draft has already started");
    }

    // Check if user already joined
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", room._id).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      // Update last seen
      await ctx.db.patch(existing._id, {
        lastSeenAt: Date.now(),
      });
      return { roomId: room._id, participantId: existing._id };
    }

    // Get current participant count
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (participants.length >= room.playerCount) {
      throw new Error("Room is full");
    }

    // Add new participant
    const now = Date.now();
    const participantId = await ctx.db.insert("participants", {
      roomId: room._id,
      userId: args.userId,
      name: args.userName,
      pickOrder: participants.length,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { roomId: room._id, participantId };
  },
});

/**
 * Update last seen timestamp for reconnection
 */
export const updateLastSeen = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastSeenAt: Date.now(),
      });
    }
  },
});

/**
 * Get available races for the room
 */
export const getAvailableRaces = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return [];

    // All races
    const ALL_RACES = [
      "Humans", "Orcs", "Dwarfs", "Skaven", "High Elves", "Dark Elves",
      "Bretonnians", "Chaos", "Wood Elves", "Lizardmen", "Norse", "Undead",
      "Necromantic", "Nurgle", "Chaos Dwarfs", "Khemri", "Halflings", "Ogres",
      "Goblins", "Vampires", "Amazon", "Elven Union", "Underworld Denizens", "Kislev Circus"
    ];

    // Get all picked races
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const pickedRaces = participants
      .filter((p) => p.pick)
      .map((p) => p.pick as string);

    // Return available races (not excluded, not picked)
    return ALL_RACES.filter(
      (race) => !room.excludedRaces.includes(race) && !pickedRaces.includes(race)
    );
  },
});
