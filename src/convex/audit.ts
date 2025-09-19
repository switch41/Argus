import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Internal helper to log audit events
export const log = internalMutation({
  args: {
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;

    await ctx.db.insert("auditLogs", {
      actorId: user._id,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      details: args.details,
      t: Date.now(),
    });
  },
});

// List current user's recent audit logs
export const listMyRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("auditLogs")
      .withIndex("by_actor", (q) => q.eq("actorId", user._id))
      .order("desc")
      .take(args.limit || 20);
  },
});
