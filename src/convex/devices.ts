import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// Ingest IoT device signal
export const ingestSignal = mutation({
  args: {
    touristId: v.id("touristProfiles"),
    type: v.union(v.literal("sos"), v.literal("vitals"), v.literal("location")),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db.get(args.touristId);
    if (!profile || !profile.isActive) {
      throw new Error("Tourist profile not found or inactive");
    }

    const signalId = await ctx.db.insert("deviceSignals", {
      touristId: args.touristId,
      type: args.type,
      payload: args.payload,
      timestamp: Date.now(),
    });

    // Auto-create critical alert for SOS signals
    if (args.type === "sos") {
      const alertId = await ctx.db.insert("alerts", {
        touristId: args.touristId,
        alertType: "panic_button",
        severity: "critical",
        title: "IoT SOS SIGNAL DETECTED",
        description: "Emergency SOS signal received from IoT device",
        location: args.payload.location || undefined,
        isResolved: false,
      });

      await ctx.runMutation(internal.audit.log, {
        action: "iot_sos_alert_created",
        targetType: "alert",
        targetId: alertId,
        details: { signalId, payload: args.payload },
      });
    }

    await ctx.runMutation(internal.audit.log, {
      action: "device_signal_ingested",
      targetType: "deviceSignal",
      targetId: signalId,
      details: { type: args.type },
    });

    return signalId;
  },
});

// List recent signals (officials see all, tourists see own)
export const listRecentSignals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || 10;

    if (user.role === "police" || user.role === "tourism_official" || user.role === "admin") {
      return await ctx.db
        .query("deviceSignals")
        .withIndex("by_timestamp")
        .order("desc")
        .take(limit);
    }

    // Tourist sees only their own
    const profile = await ctx.db
      .query("touristProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!profile) return [];

    return await ctx.db
      .query("deviceSignals")
      .withIndex("by_tourist", (q) => q.eq("touristId", profile._id))
      .order("desc")
      .take(limit);
  },
});
