import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// List current user's notifications (newest first)
export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Mark single notification as read
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const n = await ctx.db.get(args.notificationId);
    if (!n || n.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

// Mark all as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const iter = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id));
    for await (const n of iter) {
      if (!n.isRead) {
        await ctx.db.patch(n._id, { isRead: true });
      }
    }
    return { success: true };
  },
});

// Send a notification to a user (simple helper)
export const send = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("alert"),
      v.literal("safety_update"),
      v.literal("system"),
      v.literal("emergency")
    ),
    actionUrl: v.optional(v.string()),
    relatedAlertId: v.optional(v.id("alerts")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      actionUrl: args.actionUrl,
      relatedAlertId: args.relatedAlertId,
    });
    return { success: true };
  },
});
