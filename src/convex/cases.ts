import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { internal } from "./_generated/api";

// Create case for alert (idempotent)
export const createForAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    // Check if case already exists
    const existing = await ctx.db
      .query("cases")
      .withIndex("by_alert", (q) => q.eq("alertId", args.alertId))
      .first();
    
    if (existing) return existing._id;

    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const priority = alert.severity === "critical" ? "urgent" : 
                    alert.severity === "high" ? "high" : "medium";

    const caseId = await ctx.db.insert("cases", {
      alertId: args.alertId,
      status: "open",
      timeline: [{
        t: Date.now(),
        note: "Case created",
        by: user._id,
      }],
      priority,
    });

    await ctx.runMutation(internal.audit.log, {
      action: "case_created",
      targetType: "case",
      targetId: caseId,
    });

    return caseId;
  },
});

// Update case status
export const updateStatus = mutation({
  args: { 
    caseId: v.id("cases"), 
    status: v.union(v.literal("open"), v.literal("assigned"), v.literal("investigating"), v.literal("resolved"), v.literal("closed"))
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      throw new Error("Unauthorized");
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");

    const timeline = [...case_.timeline, {
      t: Date.now(),
      note: `Status changed to ${args.status}`,
      by: user._id,
    }];

    await ctx.db.patch(args.caseId, { 
      status: args.status,
      timeline,
    });

    await ctx.runMutation(internal.audit.log, {
      action: "case_status_updated",
      targetType: "case",
      targetId: args.caseId,
      details: { newStatus: args.status },
    });

    return { success: true };
  },
});

// Add note to case
export const addNote = mutation({
  args: { caseId: v.id("cases"), note: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const case_ = await ctx.db.get(args.caseId);
    if (!case_) throw new Error("Case not found");

    // Check if user can add notes (creator, assigned, or official)
    if (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin" && 
        case_.assignedUnit !== user._id) {
      throw new Error("Unauthorized");
    }

    const timeline = [...case_.timeline, {
      t: Date.now(),
      note: args.note,
      by: user._id,
    }];

    await ctx.db.patch(args.caseId, { timeline });

    await ctx.runMutation(internal.audit.log, {
      action: "case_note_added",
      targetType: "case",
      targetId: args.caseId,
    });

    return { success: true };
  },
});

// Get cases by status
export const getByStatus = query({
  args: { status: v.union(v.literal("open"), v.literal("assigned"), v.literal("investigating"), v.literal("resolved"), v.literal("closed")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return [];
    }

    return await ctx.db
      .query("cases")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Get case by alert
export const getByAlert = query({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return null;
    }

    return await ctx.db
      .query("cases")
      .withIndex("by_alert", (q) => q.eq("alertId", args.alertId))
      .first();
  },
});

// Get case by ID
export const get = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "police" && user.role !== "tourism_official" && user.role !== "admin")) {
      return null;
    }

    return await ctx.db.get(args.caseId);
  },
});
