import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// Create advisory
export const create = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    audience: v.union(v.literal("all"), v.literal("tourists"), v.literal("officials")),
    area: v.optional(v.object({
      lat: v.number(),
      lon: v.number(),
      radiusKm: v.number(),
    })),
    lang: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    const advisoryId = await ctx.db.insert("advisories", {
      title: args.title,
      message: args.message,
      audience: args.audience,
      area: args.area,
      lang: args.lang,
      createdBy: user._id,
      isActive: true,
    });

    await ctx.runMutation(internal.audit.log, {
      action: "advisory_created",
      targetType: "advisory",
      targetId: advisoryId,
    });

    return advisoryId;
  },
});

// Toggle advisory active status
export const toggleActive = mutation({
  args: { advisoryId: v.id("advisories"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.advisoryId, { isActive: args.isActive });

    await ctx.runMutation(internal.audit.log, {
      action: "advisory_toggled",
      targetType: "advisory",
      targetId: args.advisoryId,
      details: { isActive: args.isActive },
    });

    return { success: true };
  },
});

// List advisories for current user
export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const isOfficial = user.role === "police" || user.role === "tourism_official" || user.role === "admin";
    const audience = isOfficial ? "officials" : "tourists";

    // Get advisories for user's audience or "all"
    const allAdvisories = await ctx.db
      .query("advisories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const relevantAdvisories = allAdvisories.filter(advisory => 
      advisory.audience === "all" || advisory.audience === audience
    );

    // TODO: Filter by area based on user's last known location
    // For now, return all relevant advisories
    return relevantAdvisories;
  },
});
