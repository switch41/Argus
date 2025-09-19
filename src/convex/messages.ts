import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// List messages by case
export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    const conversationId = `case_${args.caseId}`;
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .order("desc")
      .take(10);
  },
});

// Post message to case
export const postToCase = mutation({
  args: { caseId: v.id("cases"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");

    const conversationId = `case_${args.caseId}`;
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: user._id,
      body: args.body,
      t: Date.now(),
    });

    await ctx.runMutation(internal.audit.log, {
      action: "message_posted",
      targetType: "message",
      targetId: messageId,
      details: { caseId: args.caseId },
    });

    return messageId;
  },
});
