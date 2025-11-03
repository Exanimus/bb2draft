import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(), // 4-digit room code
    hostId: v.string(), // Anonymous user ID of the host
    status: v.union(
      v.literal("waiting"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    excludedRaces: v.array(v.string()),
    playerCount: v.number(),
    currentTurnIndex: v.number(),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_creation", ["createdAt"]),

  participants: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(), // Anonymous user ID
    name: v.string(),
    pickOrder: v.number(), // Position in draft order
    pick: v.optional(v.string()), // Selected race
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"])
    .index("by_user", ["userId"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(), // Anonymous user ID
    userName: v.string(),
    text: v.string(),
    sentAt: v.number(),
  })
    .index("by_room", ["roomId", "sentAt"]),
});
