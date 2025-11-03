import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.string(),
    userName: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Trim and validate message
    const trimmedText = args.text.trim();
    if (!trimmedText || trimmedText.length === 0) {
      throw new Error("Message cannot be empty");
    }
    if (trimmedText.length > 500) {
      throw new Error("Message too long (max 500 characters)");
    }

    // Check if room exists
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Create message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      userId: args.userId,
      userName: args.userName,
      text: trimmedText,
      sentAt: Date.now(),
    });
  },
});

// Get messages for a room
export const getMessages = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(100); // Last 100 messages

    return messages.reverse(); // Show oldest first
  },
});
