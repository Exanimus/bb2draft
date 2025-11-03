import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { shuffle } from "./helpers";

/**
 * Make a pick for the current turn
 */
export const makePick = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.string(),
    race: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "in_progress") {
      throw new Error("Draft is not in progress");
    }

    // Get the participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_room_and_user", (q) =>
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    // Check if it's their turn
    if (participant.pickOrder !== room.currentTurnIndex) {
      throw new Error("Not your turn");
    }

    // Check if they already picked
    if (participant.pick) {
      throw new Error("You have already picked");
    }

    // Verify race is available
    const allParticipants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const pickedRaces = allParticipants
      .filter((p) => p.pick)
      .map((p) => p.pick as string);

    if (pickedRaces.includes(args.race) || room.excludedRaces.includes(args.race)) {
      throw new Error("Race is not available");
    }

    // Make the pick
    await ctx.db.patch(participant._id, {
      pick: args.race,
    });

    // Advance turn
    const nextTurnIndex = room.currentTurnIndex + 1;
    
    // Check if draft is complete
    if (nextTurnIndex >= allParticipants.length) {
      await ctx.db.patch(args.roomId, {
        status: "completed",
        currentTurnIndex: nextTurnIndex,
      });
    } else {
      await ctx.db.patch(args.roomId, {
        currentTurnIndex: nextTurnIndex,
      });
    }

    return { success: true };
  },
});

/**
 * Get draft options for current player (3 random races)
 */
export const getDraftOptions = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return [];

    if (room.status !== "in_progress") return [];

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

    // Get available races
    const available = ALL_RACES.filter(
      (race) => !room.excludedRaces.includes(race) && !pickedRaces.includes(race)
    );

    // Return 3 random options (or less if not enough available)
    const count = Math.min(3, available.length);
    return shuffle(available).slice(0, count);
  },
});

/**
 * Get current turn info
 */
export const getCurrentTurn = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    if (room.status !== "in_progress") return null;

    // Get current player
    const currentPlayer = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("pickOrder"), room.currentTurnIndex))
      .first();

    if (!currentPlayer) return null;

    return {
      playerName: currentPlayer.name,
      pickOrder: currentPlayer.pickOrder,
      userId: currentPlayer.userId,
    };
  },
});
